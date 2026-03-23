"use client";

import { useState, useMemo } from "react";
import { 
  ArrowLeft, 
  ArrowRight, 
  ChevronLeft, 
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

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export default function ExtratoMensal() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const { transactions, loading } = useTransactions(year, month);
  const { categories } = useCategories();
  const { accounts } = useAccounts();

  const monthName = currentDate.toLocaleDateString("pt-BR", { month: "long" });

  const stats = useMemo(() => {
    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);
    const incomes = transactions
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
    return { expenses, incomes };
  }, [transactions]);

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  return (
    <main className="min-h-screen bg-background text-foreground font-sans p-6 md:p-12 w-full max-w-[1400px] mx-auto flex flex-col mb-20 md:mb-0 transition-colors duration-300">
      <header className="flex items-center justify-between mb-10 mt-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/"
              className="p-1 -ml-1 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-full transition-colors md:hidden"
            >
              <ChevronLeft className="w-5 h-5 text-stone-400" />
            </Link>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 mb-1">
              Lançamentos
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase leading-[0.9]">
            Extrato do Mês
          </h1>
        </div>

        <div className="flex items-center bg-card border border-border rounded-2xl p-1 gap-1 shadow-sm">
          <button 
            onClick={() => changeMonth(-1)}
            className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors text-stone-400 hover:text-foreground"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="px-4 flex flex-col items-center min-w-[120px]">
            <span className="text-[9px] font-black uppercase tracking-widest text-stone-400 leading-none mb-1">
              {year}
            </span>
            <span className="text-sm font-black uppercase tracking-tight text-foreground leading-none">
              {monthName}
            </span>
          </div>
          <button 
            onClick={() => changeMonth(1)}
            className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors text-stone-400 hover:text-foreground"
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 rounded-[2.5rem] p-8 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
          <Receipt className="absolute -right-4 -top-4 w-24 h-24 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
          <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-8">Saídas Totais</span>
          <div className="flex flex-col">
            <span className="text-3xl font-mono font-black tracking-tighter">{formatBRL(stats.expenses)}</span>
            <span className="text-[9px] font-bold opacity-60 uppercase mt-2">{transactions.filter(t => t.type === 'expense').length} pagamentos realizados</span>
          </div>
        </div>

        <div className="bg-card rounded-[2.5rem] p-8 shadow-xl border border-border flex flex-col justify-between group">
           <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-8">Entradas / Ganhos</span>
           <div className="flex flex-col">
             <span className="text-3xl font-mono font-black text-emerald-500 tracking-tighter">{formatBRL(stats.incomes)}</span>
             <span className="text-[9px] font-bold text-stone-400 uppercase mt-2">Receitas identificadas</span>
           </div>
        </div>

        <div className="bg-card rounded-[2.5rem] p-8 shadow-xl border border-border flex flex-col justify-between group">
           <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-8">Saldo do Período</span>
           <div className="flex flex-col">
             <span className={`text-3xl font-mono font-black tracking-tighter ${stats.incomes - stats.expenses >= 0 ? 'text-foreground' : 'text-rose-500'}`}>
                {formatBRL(stats.incomes - stats.expenses)}
             </span>
             <span className="text-[9px] font-bold text-stone-400 uppercase mt-2">Resultado líquido do mês</span>
           </div>
        </div>
      </section>

      <section className="flex-1">
        <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-xl mb-12">
           <div className="grid grid-cols-[80px_1fr_120px_120px] gap-4 px-8 py-5 bg-stone-50/50 dark:bg-stone-900/30 border-b border-border">
              <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">Data</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">Descrição / Categoria</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-stone-400 text-right">Conta</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-stone-400 text-right">Valor</span>
           </div>

           <div className="flex flex-col min-h-[400px]">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              ) : transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 py-20 opacity-20">
                   <Receipt size={64} strokeWidth={1} />
                   <p className="font-black uppercase tracking-[0.2em] text-[10px] mt-4">Nenhum lançamento este mês</p>
                </div>
              ) : (
                transactions.map((t) => {
                  const category = categories.find(c => c.id === t.category_id);
                  const account = accounts.find(a => a.id === t.account_id);
                  return (
                    <div 
                      key={t.id}
                      className="grid grid-cols-[80px_1fr_120px_120px] gap-4 px-8 py-6 border-b border-stone-50 dark:border-stone-900/40 last:border-0 hover:bg-stone-50/50 dark:hover:bg-stone-900/20 transition-colors items-center group/row"
                    >
                       <div className="flex flex-col">
                          <span className="text-xs font-black text-foreground">{formatDate(t.date).split('/')[0]}</span>
                          <span className="text-[9px] font-bold text-stone-400 uppercase">{monthName.slice(0, 3)}</span>
                       </div>

                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-xl shadow-sm">
                             {category?.icon || "💰"}
                          </div>
                          <div className="flex flex-col">
                             <span className="text-sm font-black text-foreground leading-tight tracking-tight">{t.description}</span>
                             <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mt-1">{category?.name || "Sem Categoria"}</span>
                          </div>
                       </div>

                       <div className="flex flex-col items-end">
                          <span className="text-[10px] font-black text-foreground uppercase tracking-tight">{account?.name || "???"}</span>
                          <span className="text-[8px] font-bold text-stone-400 uppercase tracking-tighter mt-1">{account?.type === 'credit_card' ? 'Cartão de Crédito' : 'Saldo em Conta'}</span>
                       </div>

                       <div className="flex flex-col items-end">
                          <span className={`text-sm font-mono font-black ${t.type === 'expense' ? 'text-foreground' : 'text-emerald-500'}`}>
                             {t.type === 'expense' ? '-' : '+'} {formatBRL(t.amount)}
                          </span>
                       </div>
                    </div>
                  );
                })
              )}
           </div>
        </div>
      </section>
    </main>
  );
}
