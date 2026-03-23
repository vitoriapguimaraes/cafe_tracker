import os
import logging
from datetime import datetime, timezone
from telegram import Update
from telegram.ext import ApplicationBuilder, ContextTypes, CommandHandler
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    logging.error(f"Supabase init error: {e}")
    supabase = None


def get_month_range():
    now = datetime.now(timezone.utc)
    start = datetime(now.year, now.month, 1, tzinfo=timezone.utc).isoformat()
    # last day of month
    if now.month == 12:
        end = datetime(now.year + 1, 1, 1, tzinfo=timezone.utc).isoformat()
    else:
        end = datetime(now.year, now.month + 1, 1, tzinfo=timezone.utc).isoformat()
    return start, end


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "☕ *Portal Cafe — Bot*\n\nComandos disponíveis:\n"
        "/gasto [valor] [descrição] — registrar gasto\n"
        "/status — resumo do mês atual\n"
        "/faturas — faturas de cartão abertas",
        parse_mode="Markdown"
    )


async def gasto(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not supabase:
        await update.message.reply_text("❌ Erro de conexão.")
        return

    args = context.args
    if len(args) < 2:
        await update.message.reply_text("Uso: /gasto [valor] [descrição]\nEx: /gasto 45.90 Mercado")
        return

    try:
        amount = float(args[0].replace(',', '.'))
        description = " ".join(args[1:])

        telegram_id = update.effective_user.id
        user_res = supabase.table("profiles").select("id").eq("telegram_id", telegram_id).execute()
        if not user_res.data:
            await update.message.reply_text(
                "⚠️ Perfil não encontrado. Registre-se pelo web app primeiro."
            )
            return

        user_id = user_res.data[0]['id']

        supabase.table("transactions").insert({
            "user_id": user_id,
            "amount": amount,
            "description": description,
            "type": "expense",
            "status": "paid",
            "date": datetime.now(timezone.utc).isoformat()
        }).execute()

        await update.message.reply_text(
            f"✅ Gasto registrado!\n💸 *R$ {amount:.2f}* — {description}",
            parse_mode="Markdown"
        )

    except ValueError:
        await update.message.reply_text("❌ Valor inválido. Ex: /gasto 50.00 Almoço")
    except Exception as e:
        await update.message.reply_text(f"❌ Erro ao salvar: {e}")


async def status(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not supabase:
        await update.message.reply_text("❌ Erro de conexão.")
        return

    try:
        start, end = get_month_range()
        now = datetime.now(timezone.utc)
        month_name = now.strftime("%B/%Y")

        # Fetch transactions this month
        tx_res = supabase.table("transactions") \
            .select("amount, type, category_id") \
            .gte("date", start).lt("date", end) \
            .eq("status", "paid").execute()

        transactions = tx_res.data or []
        total_income = sum(t['amount'] for t in transactions if t['type'] == 'income')
        total_expense = sum(t['amount'] for t in transactions if t['type'] == 'expense')
        balance = total_income - total_expense

        # Fetch categories for budget limits
        cats_res = supabase.table("categories") \
            .select("id, name, budget_limit, icon") \
            .gt("budget_limit", 0).execute()

        categories = {c['id']: c for c in (cats_res.data or [])}

        # Aggregate spend by category
        spend_by_cat: dict[str, float] = {}
        for t in transactions:
            if t['type'] == 'expense' and t['category_id']:
                cid = t['category_id']
                spend_by_cat[cid] = spend_by_cat.get(cid, 0) + t['amount']

        # Build status lines for categories over 80%
        alerts = []
        for cid, cat in categories.items():
            spent = spend_by_cat.get(cid, 0)
            limit = cat['budget_limit']
            if limit <= 0:
                continue
            pct = (spent / limit) * 100
            if pct >= 80:
                icon = "🔴" if pct >= 100 else "🟡"
                alerts.append(f"{icon} {cat['icon']} {cat['name']}: R${spent:.0f}/{limit:.0f} ({pct:.0f}%)")

        msg = (
            f"☕ *Status {month_name}*\n\n"
            f"💰 Receitas: R$ {total_income:.2f}\n"
            f"💸 Gastos: R$ {total_expense:.2f}\n"
            f"📊 Saldo: R$ {balance:.2f}\n"
        )

        if alerts:
            msg += "\n*⚠️ Categorias no limite:*\n" + "\n".join(alerts)
        else:
            msg += "\n✅ Tudo dentro do orçamento!"

        await update.message.reply_text(msg, parse_mode="Markdown")

    except Exception as e:
        await update.message.reply_text(f"❌ Erro ao gerar status: {e}")


async def faturas(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not supabase:
        await update.message.reply_text("❌ Erro de conexão.")
        return

    try:
        start, end = get_month_range()

        # Fetch credit card accounts
        cards_res = supabase.table("accounts").select("id, name, invoice_due_day").eq("type", "credit_card").execute()
        cards = {c['id']: c for c in (cards_res.data or [])}

        if not cards:
            await update.message.reply_text("Nenhum cartão de crédito cadastrado.")
            return

        # Sum expenses per credit card this month
        tx_res = supabase.table("transactions") \
            .select("amount, account_id, type") \
            .gte("date", start).lt("date", end) \
            .eq("type", "expense").execute()

        invoice_totals: dict[str, float] = {}
        for t in (tx_res.data or []):
            aid = t['account_id']
            if aid in cards:
                invoice_totals[aid] = invoice_totals.get(aid, 0) + t['amount']

        lines = []
        total = 0.0
        for cid, card in cards.items():
            amt = invoice_totals.get(cid, 0)
            total += amt
            if amt > 0:
                name = card['name'].replace(" - Cartão", "").strip()
                lines.append(f"💳 *{name}*: R$ {amt:.2f} (vence dia {card['invoice_due_day']})")

        if not lines:
            msg = "Nenhuma fatura acumulada este mês. 🎉"
        else:
            msg = "💳 *Faturas do Mês*\n\n" + "\n".join(lines) + f"\n\n*Total: R$ {total:.2f}*"

        await update.message.reply_text(msg, parse_mode="Markdown")

    except Exception as e:
        await update.message.reply_text(f"❌ Erro ao gerar faturas: {e}")


if __name__ == '__main__':
    if not TELEGRAM_TOKEN:
        print("Error: TELEGRAM_TOKEN not found.")
        exit(1)

    application = ApplicationBuilder().token(TELEGRAM_TOKEN).build()
    application.add_handler(CommandHandler('start', start))
    application.add_handler(CommandHandler('gasto', gasto))
    application.add_handler(CommandHandler('status', status))
    application.add_handler(CommandHandler('faturas', faturas))

    print("☕ Cafe Bot is running...")
    application.run_polling()
