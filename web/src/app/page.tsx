"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Coffee,
  Wallet,
  ArrowRight
} from "lucide-react";
import { useCategories } from "../lib/hooks/useCategories";
import { useTransactions } from "../lib/hooks/useTransactions";
import { useBudgetSummary, BudgetStatus } from "../lib/hooks/useBudgetSummary";
import { SkeletonCard } from "../components/Skeleton";
import { PageContainer, PageHeader, SectionCard } from "../components/LayoutComponents";
import { ThemeToggle } from "../components/ThemeToggle";

const MONTH_NAMES = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

function ProgressBar({
  percentage,
  status,
}: {
  percentage: number;
  status: BudgetStatus;
}) {
  const colorMap: Record<BudgetStatus, string> = {
    ok: "bg-emerald-400",
    warning: "bg-amber-400",
    danger: "bg-red-400",
  };
  const capped = Math.min(percentage, 100);
  return (
    <div className="h-3 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden border border-border relative transition-colors">
      <div
        className={`h-full absolute left-0 top-0 rounded-full transition-all duration-500 ${colorMap[status]}`}
        style={{ width: `${capped}%` }}
      />
    </div>
  );
}

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Home() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);

  const { categories, loading: loadingCats } = useCategories();
  const { transactions, loading: loadingTx } = useTransactions(
    viewYear,
    viewMonth,
  );
  const budgetSummary = useBudgetSummary(categories, transactions);

  const loading = loadingCats || loadingTx;

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const totalSpent = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  function prevMonth() {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  }

  return (
    <PageContainer>
      <PageHeader>
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 mb-1 leading-none">
            Resumo · Precision Control
          </span>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-foreground leading-[0.9] flex items-center gap-3">
            Dashboard
            <Coffee className="w-8 h-8 md:w-10 md:h-10 text-stone-900 dark:text-stone-100" />
          </h1>
        </div>
        <ThemeToggle />
      </PageHeader>

      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SectionCard variant="flat" className="p-4 flex items-center justify-between h-full hover:bg-stone-50/50 transition-colors">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-background rounded-full transition-colors text-stone-400 hover:text-foreground"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="font-bold text-foreground tracking-wider text-sm uppercase">
              {MONTH_NAMES[viewMonth - 1]}/{viewYear}
            </span>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-background rounded-full transition-colors text-stone-400 hover:text-foreground"
            >
              <ChevronRight size={20} />
            </button>
          </SectionCard>

          <SectionCard variant="flat" className="p-5 flex flex-col justify-center gap-1">
            <div className="flex items-center gap-2 text-emerald-500 dark:text-emerald-400">
              <TrendingUp size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Receita
              </span>
            </div>
            <span className="font-mono font-bold text-foreground text-2xl">
              {formatBRL(totalIncome)}
            </span>
          </SectionCard>

          <SectionCard variant="flat" className="p-5 flex flex-col justify-center gap-1 text-rose-500 dark:text-rose-400">
            <div className="flex items-center gap-2">
              <TrendingDown size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Gastos
              </span>
            </div>
            <span className="font-mono font-bold text-2xl">
              {formatBRL(totalSpent)}
            </span>
          </SectionCard>
        </div>

        <div className="w-full">
          {loading ? (
            <SkeletonCard lines={6} />
          ) : budgetSummary.length === 0 ? (
            <SectionCard className="p-12 text-center">
              <p className="text-stone-400 text-sm italic">
                Nenhum orçamento configurado para este período.
              </p>
              <Link
                href="/settings"
                className="text-foreground font-bold text-sm underline mt-2 block hover:text-emerald-500 transition-colors"
              >
                Configurar categorias →
              </Link>
            </SectionCard>
          ) : (
            <SectionCard className="p-8">
              <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
                <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">
                  Orçamento Mensal
                </h2>
                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> ok</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> limite</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400" /> estourou</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
                {budgetSummary.map((item) => (
                  <div key={item.category.id} className="group">
                    <div className="flex justify-between items-baseline mb-2">
                      <p className="font-bold text-sm text-foreground opacity-80 flex items-center gap-2">
                        <span className="text-lg">{item.category.icon}</span>
                        {item.category.name}
                      </p>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {Math.round(item.percentage)}%
                      </span>
                    </div>
                    <ProgressBar
                      percentage={item.percentage}
                      status={item.status}
                    />
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-[9px] font-mono text-stone-400">
                            {formatBRL(item.spent)} / {formatBRL(item.limit)}
                        </span>
                        <p className={`text-[9px] font-black uppercase tracking-wider ${item.remaining < 0 ? "text-red-400" : "text-emerald-500"}`}>
                        {item.remaining < 0
                            ? `⚠️ -${formatBRL(Math.abs(item.remaining))}`
                            : `${formatBRL(item.remaining)} disponível`}
                        </p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>
        
        {/* Quick Links */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
           <SectionCard variant="flat" className="p-6 group hover:border-emerald-500/30 transition-all cursor-pointer">
              <Link href="/accounts" className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500">
                        <Wallet size={24} />
                    </div>
                    <div>
                        <h4 className="font-black text-sm uppercase tracking-tight">Bancos e Contas</h4>
                        <p className="text-[10px] text-stone-400 uppercase tracking-tighter">Gerencie seus saldos e faturas</p>
                    </div>
                </div>
                <ArrowRight size={20} className="text-stone-300 group-hover:translate-x-1 transition-transform" />
              </Link>
           </SectionCard>
           
           <SectionCard variant="flat" className="p-6 group hover:border-amber-500/30 transition-all cursor-pointer">
              <Link href="/transactions" className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500">
                        <TrendingDown size={24} />
                    </div>
                    <div>
                        <h4 className="font-black text-sm uppercase tracking-tight">Extrato Detalhado</h4>
                        <p className="text-[10px] text-stone-400 uppercase tracking-tighter">Histórico completo de lançamentos</p>
                    </div>
                </div>
                <ArrowRight size={20} className="text-stone-300 group-hover:translate-x-1 transition-transform" />
              </Link>
           </SectionCard>
        </section>
      </div>
    </PageContainer>
  );
}
