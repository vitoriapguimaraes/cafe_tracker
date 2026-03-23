"use client";

import { ArrowLeft, Wallet } from "lucide-react";
import Link from "next/link";
import { useAccounts } from "../../lib/hooks/useAccounts";
import { useTransactions, getMonthRange } from "../../lib/hooks/useTransactions";
import { SkeletonRow } from "../../components/Skeleton";
import type { Account } from "../../lib/database.types";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function AccountRow({ account, invoiceTotal }: { account: Account; invoiceTotal?: number }) {
  const isCard = account.type === "credit_card";
  const displayValue = isCard ? -(invoiceTotal ?? 0) : account.balance;

  return (
    <div className="flex justify-between items-center py-4 border-b border-border last:border-0 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`w-2.5 h-2.5 rounded-full ${isCard ? "bg-rose-400" : "bg-emerald-400 dark:bg-emerald-500"}`} />
        <div>
          <span className="text-foreground font-bold block text-sm">
            {account.name.replace(/\s*\[.\]\s*-\s*(Banco|Cartão)/, "").replace(/\s*\[.\]/, "").trim()}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 dark:text-stone-500">{isCard ? "Crédito" : account.type === "cash" ? "Especie" : "Corrente"}</span>
        </div>
      </div>
      <span className={`font-mono font-bold text-sm ${displayValue < 0 ? "text-rose-400" : "text-foreground opacity-90"}`}>
        {formatBRL(displayValue)}
      </span>
    </div>
  );
}

export default function VerSaldos() {
  const today = new Date();
  const { accounts, loading: loadingAccounts } = useAccounts();
  const { transactions, loading: loadingTx } = useTransactions(today.getFullYear(), today.getMonth() + 1);

  // Calculate credit card invoice totals from current month credit transactions
  const { start: cycleStart, end: cycleEnd } = getMonthRange(today.getFullYear(), today.getMonth() + 1);
  void cycleStart; void cycleEnd; // used implicitly by useTransactions

  const invoiceByAccount: Record<string, number> = {};
  transactions.forEach((t) => {
    const acc = accounts.find((a) => a.id === t.account_id);
    if (acc?.type === "credit_card" && t.type === "expense") {
      invoiceByAccount[acc.id] = (invoiceByAccount[acc.id] ?? 0) + t.amount;
    }
  });

  const loading = loadingAccounts || loadingTx;

  const hectorAccounts = accounts.filter((a) => a.owner === "hector");
  const vitoriaAccounts = accounts.filter((a) => a.owner === "vitoria");
  const sharedAccounts = accounts.filter((a) => a.owner === "shared");

  function netWorth(accs: Account[]) {
    return accs.reduce((sum, a) => {
      if (a.type === "credit_card") return sum - (invoiceByAccount[a.id] ?? 0);
      return sum + a.balance;
    }, 0);
  }

  const totalHector = netWorth(hectorAccounts);
  const totalVitoria = netWorth(vitoriaAccounts);
  const totalFamily = totalHector + totalVitoria + netWorth(sharedAccounts);

  function Section({ title, accs }: { title: string; accs: Account[] }) {
    if (accs.length === 0) return null;
    return (
      <section className="mb-0">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 mb-4 pl-3">{title}</h3>
        <div className="bg-card rounded-[2rem] px-8 py-2 shadow-sm border border-border transition-colors">
          {loading
            ? Array.from({ length: 2 }).map((_, i) => <SkeletonRow key={i} />)
            : accs.map((acc) => (
                <AccountRow key={acc.id} account={acc} invoiceTotal={invoiceByAccount[acc.id]} />
              ))}
        </div>
      </section>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground font-sans p-6 md:p-12 w-full max-w-[1400px] mx-auto flex flex-col transition-colors duration-300">
      <header className="flex items-center gap-4 mb-10 mt-2">
        <Link href="/" className="p-2 -ml-2 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-full transition-colors md:hidden">
          <ArrowLeft className="w-6 h-6 text-stone-400" />
        </Link>
        <div className="flex flex-col">
            <span className="text-[10px] font-black tracking-[0.4em] text-stone-400 uppercase mb-1 leading-none">Patrimônio</span>
            <h1 className="text-4xl font-black tracking-tighter uppercase text-foreground leading-[0.9]">Saldos & Contas</h1>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Net Worth Hero */}
        <section className="md:col-span-5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden transition-colors">
            <div className="absolute top-0 right-0 p-6 opacity-5">
                <Wallet className="w-32 h-32" />
            </div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500 dark:text-stone-400 mb-10">Consolidado Técnico</h2>
            
            <div className="flex flex-col gap-2 mb-12">
                <span className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">Patrimônio Líquido</span>
                <span className="text-5xl font-black tracking-tighter">
                    {loading ? "..." : formatBRL(totalFamily)}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-8 border-t border-stone-800 dark:border-stone-200 pt-8">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Hector</span>
                    <span className={`font-mono font-bold text-lg ${totalHector < 0 ? "text-rose-400" : "text-stone-200 dark:text-stone-700"}`}>
                        {loading ? "..." : formatBRL(totalHector)}
                    </span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Vitória</span>
                    <span className={`font-mono font-bold text-lg ${totalVitoria < 0 ? "text-rose-400" : "text-stone-200 dark:text-stone-700"}`}>
                        {loading ? "..." : formatBRL(totalVitoria)}
                    </span>
                </div>
            </div>
        </section>

        {/* Account Lists */}
        <div className="md:col-span-7 flex flex-col gap-8">
            <Section title="Contas Hector" accs={hectorAccounts} />
            <Section title="Contas Vitória" accs={vitoriaAccounts} />
            {sharedAccounts.length > 0 && <Section title="Compartilhadas" accs={sharedAccounts} />}
        </div>
      </div>
    </main>
  );
}
