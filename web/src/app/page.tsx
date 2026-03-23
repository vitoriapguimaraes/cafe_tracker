"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Coffee,
} from "lucide-react";
import { useCategories } from "../lib/hooks/useCategories";
import { useTransactions } from "../lib/hooks/useTransactions";
import { useBudgetSummary, BudgetStatus } from "../lib/hooks/useBudgetSummary";
import { SkeletonCard } from "../components/Skeleton";

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
    <main className="min-h-screen bg-background py-10 px-6 font-sans w-full overflow-x-hidden transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto w-full">
        {/* Header */}
        <header className="flex flex-col items-center mb-10 mt-2 text-center group">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 mb-2 leading-none">
            Resumo · Precision Control
          </span>
          <h1 className="font-black text-6xl md:text-7xl text-foreground tracking-tighter uppercase leading-[0.8] flex items-center justify-center gap-3">
            Portal{" "}
            <span className="text-stone-300 dark:text-stone-700">Cafe</span>
            <Coffee className="w-12 h-12 md:w-16 md:h-16 text-stone-900 dark:text-stone-100 transition-transform group-hover:rotate-12" />
          </h1>
        </header>

        <div className="flex flex-col gap-8">
          {/* Top Row: Controls & Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Month Navigator */}
            <div className="flex items-center justify-between bg-card rounded-2xl p-4 shadow-sm border border-border h-full">
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
            </div>

            {/* Income Summary */}
            <div className="bg-card rounded-2xl p-5 shadow-sm border border-border flex flex-col justify-center gap-1">
              <div className="flex items-center gap-2 text-emerald-500 dark:text-emerald-400">
                <TrendingUp size={16} />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Receita
                </span>
              </div>
              <span className="font-mono font-bold text-foreground text-2xl">
                {formatBRL(totalIncome)}
              </span>
            </div>

            {/* Spent Summary */}
            <div className="bg-card rounded-2xl p-5 shadow-sm border border-border flex flex-col justify-center gap-1">
              <div className="flex items-center gap-2 text-rose-400 dark:text-rose-300">
                <TrendingDown size={16} />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Gastos
                </span>
              </div>
              <span className="font-mono font-bold text-foreground text-2xl">
                {formatBRL(totalSpent)}
              </span>
            </div>
          </div>

          {/* Bottom Row: Budget Cards */}
          <div className="w-full">
            {loading ? (
              <SkeletonCard lines={6} />
            ) : budgetSummary.length === 0 ? (
              <div className="bg-card rounded-3xl p-12 shadow-sm border border-border text-center">
                <p className="text-stone-400 text-sm">
                  Nenhum orçamento configurado.
                </p>
                <Link
                  href="/configurar"
                  className="text-foreground font-bold text-sm underline mt-2 block"
                >
                  Configurar categorias →
                </Link>
              </div>
            ) : (
              <section className="bg-card rounded-[2.5rem] p-8 shadow-xl border border-border transition-colors">
                <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
                  <h2 className="text-xl font-bold text-foreground">
                    Orçamento Mensal
                  </h2>
                  <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />{" "}
                      ok
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />{" "}
                      limite
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-400" />{" "}
                      estourou
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
                  {budgetSummary.map((item) => (
                    <div key={item.category.id} className="group">
                      <div className="flex justify-between items-baseline mb-1.5">
                        <p className="font-bold text-sm text-foreground opacity-80">
                          {item.category.icon} {item.category.name}
                        </p>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {formatBRL(item.spent)} / {formatBRL(item.limit)}
                        </span>
                      </div>
                      <ProgressBar
                        percentage={item.percentage}
                        status={item.status}
                      />
                      <p
                        className={`text-[10px] mt-1.5 font-bold uppercase tracking-wider ${item.remaining < 0 ? "text-red-400" : "text-stone-400"}`}
                      >
                        {item.remaining < 0
                          ? `⚠️ -${formatBRL(Math.abs(item.remaining))}`
                          : `${formatBRL(item.remaining)} disponível`}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
