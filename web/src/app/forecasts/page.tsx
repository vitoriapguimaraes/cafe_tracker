"use client";

import { Calendar, CreditCard, TrendingUp, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAccounts } from "../../lib/hooks/useAccounts";
import { useCategories } from "../../lib/hooks/useCategories";
import { useTransactions } from "../../lib/hooks/useTransactions";
import { SkeletonRow } from "../../components/Skeleton";
import { PageContainer, PageHeader, SectionCard } from "../../components/LayoutComponents";

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
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

  const creditCards = accounts.filter((a) => a.type === "credit_card");
  const invoices = creditCards
    .map((card) => {
      const total = transactions
        .filter((t) => t.account_id === card.id && t.type === "expense")
        .reduce((s, t) => s + t.amount, 0);
      return {
        name: card.name
          .replace(/\s*\[.\]\s*-\s*(Cartão)/, "")
          .replace(/\s*\[.\]/, "")
          .trim(),
        due: `Dia ${card.invoice_due_day}`,
        value: total,
      };
    })
    .filter((inv) => inv.value > 0);

  const fixedExpenses = categories
    .filter(
      (c) =>
        (c.type === "essential" ||
          c.group_name === "Habitação" ||
          c.group_name === "Filhos") &&
        c.budget_limit > 0,
    )
    .map((c) => ({ name: `${c.icon} ${c.name}`, limit: c.budget_limit }));

  const totalInvoice = invoices.reduce((s, i) => s + i.value, 0);
  const totalFixed = fixedExpenses.reduce((s, f) => s + f.limit, 0);

  return (
    <PageContainer>
      <PageHeader>
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 -ml-2 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-full transition-colors md:hidden">
            <ArrowLeft className="w-6 h-6 text-stone-400" />
          </Link>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 mb-1 leading-none">
              Planejamento Técnico
            </span>
            <h1 className="text-4xl font-black tracking-tighter uppercase text-foreground leading-none">
              Futuro & Previsões
            </h1>
          </div>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12">
        <SectionCard variant="dark" className="md:col-span-5 p-10 relative overflow-hidden flex flex-col justify-between min-h-[300px]">
          <Calendar className="absolute -right-4 -top-4 w-40 h-40 opacity-5 rotate-12" />

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-8 opacity-60">
                <TrendingUp size={14} />
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em]">
                Projeção · {MONTH_NAMES[month - 1].toUpperCase()}
                </h2>
            </div>

            <div className="flex flex-col gap-2 mt-4">
                <span className="text-xs font-bold opacity-40 uppercase tracking-widest">
                  Comprometimento Estimado
                </span>
                <span className="text-5xl font-black tracking-tighter leading-none mt-2">
                {formatBRL(totalInvoice + totalFixed)}
                </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8 mt-12">
            <div className="flex flex-col gap-1 border-r border-white/5 pr-4">
              <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                Faturas Cartão
              </span>
              <span className="font-mono font-black text-xl tracking-tighter text-white">
                {formatBRL(totalInvoice)}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                Custos Fixos
              </span>
              <span className="font-mono font-black text-xl tracking-tighter text-white">
                {formatBRL(totalFixed)}
              </span>
            </div>
          </div>
        </SectionCard>

        <div className="md:col-span-7 flex flex-col gap-8">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 mb-2 pl-4 text-stone-400">
                    <CreditCard size={14} />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">
                        Comportamento das Faturas
                    </h3>
                </div>
                <SectionCard className="px-8 py-2">
                    {loading ? (
                        Array.from({ length: 2 }).map((_, i) => <SkeletonRow key={i} />)
                    ) : invoices.length === 0 ? (
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest py-12 text-center italic opacity-50">
                        Fluxo de Cartões Estabilizado
                        </p>
                    ) : (
                        invoices.map((inv, i) => (
                        <div
                            key={i}
                            className="flex justify-between items-center py-5 border-b border-stone-50 dark:border-stone-900/40 last:border-0"
                        >
                            <div>
                            <span className="text-foreground font-black block text-xs uppercase tracking-tight">
                                {inv.name}
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mt-1">
                                Vence {inv.due}
                            </span>
                            </div>
                            <span className="font-mono font-black text-sm tracking-tighter text-foreground opacity-90">
                            {formatBRL(inv.value)}
                            </span>
                        </div>
                        ))
                    )}
                </SectionCard>
            </div>
        </div>
      </div>
    </PageContainer>
  );
}
