"use client";

import { useState, useMemo } from "react";
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight,
  Receipt, 
  Calendar,
  CreditCard,
  Banknote,
  LayoutGrid
} from "lucide-react";
import Link from "next/link";
import { useTransactions } from "../../lib/hooks/useTransactions";
import { useCategories } from "../../lib/hooks/useCategories";
import { useAccounts } from "../../lib/hooks/useAccounts";
import { SkeletonRow } from "../../components/Skeleton";
import { PageContainer, PageHeader, SectionCard } from "../../components/LayoutComponents";

const MONTH_NAMES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

export default function ExtratoMensal() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);

  const { transactions, loading } = useTransactions(viewYear, viewMonth);
  const { categories } = useCategories();
  const { accounts } = useAccounts();

  const stats = useMemo(() => {
    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);
    const incomes = transactions
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
    return { expenses, incomes, count: transactions.length };
  }, [transactions]);

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [transactions]);

  const formatBRL = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const prevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  return (
    <PageContainer>
      <PageHeader>
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/"
              className="p-1 -ml-1 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-full transition-colors md:hidden"
            >
              <ArrowLeft className="w-5 h-5 text-stone-400" />
            </Link>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">
              Histórico Detalhado
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-foreground leading-none">
            Extrato Mensal
          </h1>
        </div>

        <div className="flex items-center gap-4 bg-stone-50 dark:bg-stone-900 px-4 py-2 rounded-2xl border border-border">
          <button
            onClick={prevMonth}
            className="p-1 hover:text-foreground text-stone-400 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest min-w-[100px] justify-center text-foreground">
            <Calendar size={14} className="text-emerald-500" />
            <span>
              {MONTH_NAMES[viewMonth - 1]} {viewYear}
            </span>
          </div>
          <button
            onClick={nextMonth}
            className="p-1 hover:text-foreground text-stone-400 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </PageHeader>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <SectionCard
          variant="dark"
          className="p-8 flex flex-col justify-between relative group"
        >
          <Receipt className="absolute -right-4 -top-4 w-24 h-24 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
          <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-8">
            Saídas Totais
          </span>
          <div className="flex flex-col">
            <span className="text-3xl font-mono font-black tracking-tighter">
              {formatBRL(stats.expenses)}
            </span>
            <span className="text-[9px] font-bold opacity-40 uppercase mt-2">
              {transactions.filter(t => t.type === 'expense').length} pagamentos realizados
            </span>
          </div>
        </SectionCard>

        <SectionCard className="p-8 flex flex-col justify-between group">
          <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-8">
            Entradas / Ganhos
          </span>
          <div className="flex flex-col">
            <span className="text-3xl font-mono font-black text-emerald-500 tracking-tighter">
              {formatBRL(stats.incomes)}
            </span>
            <span className="text-[9px] font-bold text-stone-400 uppercase mt-2">
              Receitas identificadas
            </span>
          </div>
        </SectionCard>

        <SectionCard className="p-8 flex flex-col justify-between group">
          <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-8">
            Resultado Líquido
          </span>
          <div className="flex flex-col">
            <span
              className={`text-3xl font-mono font-black tracking-tighter ${stats.incomes - stats.expenses >= 0 ? "text-foreground" : "text-rose-500"}`}
            >
              {formatBRL(stats.incomes - stats.expenses)}
            </span>
            <span className="text-[9px] font-bold text-stone-400 uppercase mt-2">
              Balanço mensal
            </span>
          </div>
        </SectionCard>
      </section>

      <section className="flex-1 pb-12">
        <SectionCard>
          <div className="grid grid-cols-[80px_1fr_120px_120px] gap-4 px-8 py-5 bg-stone-50/50 dark:bg-stone-900/30 border-b border-border">
            <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">
              Data
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">
              Descrição / Categoria
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest text-stone-400 text-right">
              Conta
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest text-stone-400 text-right">
              Valor
            </span>
          </div>

          <div className="flex flex-col divide-y divide-border/50 min-h-[400px]">
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="px-8 py-6">
                  <SkeletonRow />
                </div>
              ))
            ) : sortedTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 py-20 opacity-20">
                <Receipt size={64} strokeWidth={1} />
                <p className="font-black uppercase tracking-[0.2em] text-[10px] mt-4">
                  Nenhum lançamento este mês
                </p>
              </div>
            ) : (
              sortedTransactions.map((t) => {
                const category = categories.find(c => c.id === t.category_id);
                const account = accounts.find(a => a.id === t.account_id);
                const day = new Date(t.date).getDate().toString().padStart(2, '0');
                
                return (
                  <div
                    key={t.id}
                    className="grid grid-cols-[80px_1fr_120px_120px] gap-4 px-8 py-6 hover:bg-stone-50/50 dark:hover:bg-stone-900/10 transition-colors items-center group/row"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-foreground">{day}</span>
                      <span className="text-[9px] font-bold text-stone-400 uppercase">
                        {MONTH_NAMES[viewMonth - 1]}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-xl shadow-sm">
                        {category?.icon || "💰"}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-foreground leading-tight tracking-tight">
                          {t.description}
                        </span>
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mt-1">
                          {category?.name || "Sem Categoria"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-[11px] font-black text-foreground uppercase tracking-tight">
                        {account?.name || "???"}
                      </span>
                      <span className="text-[8px] font-bold text-stone-400 uppercase tracking-tighter mt-0.5">
                        {account?.type === 'credit_card' ? 'Cartão de Crédito' : 'Saldo em Conta'}
                      </span>
                    </div>

                    <div className="flex flex-col items-end">
                      <span
                        className={`text-sm font-mono font-black ${t.type === 'expense' ? 'text-foreground' : 'text-emerald-500'}`}
                      >
                        {t.type === 'expense' ? '-' : '+'} {formatBRL(t.amount)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </SectionCard>
      </section>
    </PageContainer>
  );
}
