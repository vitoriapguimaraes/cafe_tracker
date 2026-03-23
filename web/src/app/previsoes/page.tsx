"use client";

import { Calendar, CreditCard, TrendingUp } from "lucide-react";
import { useAccounts } from "../../lib/hooks/useAccounts";
import { useCategories } from "../../lib/hooks/useCategories";
import { useTransactions } from "../../lib/hooks/useTransactions";
import { SkeletonRow } from "../../components/Skeleton";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function VerPrevisoes() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const { transactions, loading } = useTransactions(year, month);

  // Credit card invoices: sum expenses per credit card this month
  const creditCards = accounts.filter((a) => a.type === "credit_card");
  const invoices = creditCards
    .map((card) => {
      const total = transactions
        .filter((t) => t.account_id === card.id && t.type === "expense")
        .reduce((s, t) => s + t.amount, 0);
      return { name: card.name.replace(/\s*\[.\]\s*-\s*(Cartão)/, "").replace(/\s*\[.\]/, "").trim(), due: `Dia ${card.invoice_due_day}`, value: total };
    })
    .filter((inv) => inv.value > 0);

  // Fixed expenses: essential categories with budget_limit > 0
  const fixedExpenses = categories
    .filter((c) => (c.type === "essential" || c.group_name === "Habitação" || c.group_name === "Filhos") && c.budget_limit > 0)
    .map((c) => ({ name: `${c.icon} ${c.name}`, limit: c.budget_limit }));

  const totalInvoice = invoices.reduce((s, i) => s + i.value, 0);
  const totalFixed = fixedExpenses.reduce((s, f) => s + f.limit, 0);

  return (
    <main className="min-h-screen bg-background text-foreground font-sans p-6 md:p-12 w-full max-w-[1400px] mx-auto flex flex-col transition-colors duration-300">
      <header className="flex flex-col mb-10 mt-2">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 mb-1 leading-none">Planejamento</span>
        <h1 className="text-4xl font-black tracking-tighter uppercase text-foreground leading-[0.9]">Futuro & Previsões</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Summary Hero */}
        <section className="md:col-span-5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden transition-colors">
            <div className="absolute top-0 right-0 p-6 opacity-5">
                <Calendar className="w-32 h-32" />
            </div>
            
            <div className="flex items-center gap-2 mb-10 text-stone-400 dark:text-stone-500">
                <TrendingUp size={16} />
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em]">
                    Projeção Técnica · {MONTH_NAMES[month - 1].toUpperCase()}
                </h2>
            </div>
            
            <div className="flex flex-col gap-2 mb-12">
                <span className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">Comprometimento Total</span>
                <span className="text-5xl font-black tracking-tighter">
                    {formatBRL(totalInvoice + totalFixed)}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-8 border-t border-stone-800 dark:border-stone-200 pt-8">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Faturas Acum.</span>
                    <span className="font-mono font-bold text-lg text-stone-200 dark:text-stone-700">{formatBRL(totalInvoice)}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Custos Fixos</span>
                    <span className="font-mono font-bold text-lg text-stone-200 dark:text-stone-700">{formatBRL(totalFixed)}</span>
                </div>
            </div>
        </section>

        {/* Details Lists */}
        <div className="md:col-span-7 flex flex-col gap-10">
            {/* Credit Card Invoices */}
            <section>
                <div className="flex items-center gap-3 mb-4 pl-4 text-stone-400 dark:text-stone-500">
                    <CreditCard size={14} />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Faturas do Período</h3>
                </div>
                <div className="bg-card rounded-[2rem] px-8 py-3 shadow-xl border border-border">
                {loading ? (
                    <><SkeletonRow /><SkeletonRow /></>
                ) : invoices.length === 0 ? (
                    <p className="text-[10px] font-bold text-stone-400 dark:text-stone-600 uppercase tracking-widest py-8 text-center italic opacity-50">Fluxo Nominal Estável</p>
                ) : (
                    invoices.map((inv, i) => (
                    <div key={i} className="flex justify-between items-center py-5 border-b border-border last:border-0">
                        <div>
                        <span className="text-foreground font-bold block text-sm">{inv.name}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mt-1">Vence {inv.due}</span>
                        </div>
                        <span className="font-mono font-bold text-foreground opacity-90 text-sm">{formatBRL(inv.value)}</span>
                    </div>
                    ))
                )}
                </div>
            </section>

            {/* Fixed Expenses */}
            <section>
                <div className="flex items-center gap-3 mb-4 pl-4 text-stone-400 dark:text-stone-500">
                    <Calendar size={14} />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Engajamento Fixo (Teto)</h3>
                </div>
                <div className="bg-card rounded-[2rem] px-8 py-3 shadow-xl border border-border">
                {fixedExpenses.length === 0 ? (
                    <p className="text-[10px] font-bold text-stone-400 dark:text-stone-600 uppercase tracking-widest py-8 text-center italic opacity-50">Sem Alocações Fixas</p>
                ) : (
                    fixedExpenses.map((fix, i) => (
                    <div key={i} className="flex justify-between items-center py-5 border-b border-border last:border-0">
                        <span className="text-foreground font-bold text-sm">{fix.name}</span>
                        <span className="font-mono font-bold text-foreground opacity-90 text-sm">{formatBRL(fix.limit)}</span>
                    </div>
                    ))
                )}
                </div>
            </section>
        </div>
      </div>
    </main>
  );
}
