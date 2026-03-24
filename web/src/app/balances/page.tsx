"use client";

import { ArrowLeft, Wallet } from "lucide-react";
import Link from "next/link";
import { useAccounts } from "../../lib/hooks/useAccounts";
import { useTransactions, getMonthRange } from "../../lib/hooks/useTransactions";
import { SkeletonRow } from "../../components/Skeleton";
import type { Account } from "../../lib/database.types";
import { PageContainer, PageHeader, SectionCard } from "../../components/LayoutComponents";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function AccountRow({ account, invoiceTotal }: { account: Account; invoiceTotal?: number }) {
  const isCard = account.type === "credit_card";
  const displayValue = isCard ? -(invoiceTotal ?? 0) : account.balance;

  return (
    <div className="flex justify-between items-center py-4 border-b border-border last:border-0 transition-colors w-full">
      <div className="flex items-center gap-4">
        <div className={`w-2 h-2 rounded-full ${isCard ? "bg-rose-400" : "bg-emerald-400 dark:bg-emerald-500"}`} />
        <div className="flex flex-col">
          <span className="text-foreground font-black block text-xs uppercase tracking-tight">
            {account.name.replace(/\s*\[.\]\s*-\s*(Banco|Cartão)/, "").replace(/\s*\[.\]/, "").trim()}
          </span>
          <span className="text-[9px] uppercase font-bold tracking-widest text-stone-400 dark:text-stone-500">
            {isCard ? "Crédito" : account.type === "cash" ? "Espécie" : "Corrente"}
          </span>
        </div>
      </div>
      <span className={`font-mono font-black text-sm tracking-tighter ${displayValue < 0 ? "text-rose-400" : "text-foreground opacity-90"}`}>
        {formatBRL(displayValue)}
      </span>
    </div>
  );
}

export default function VerSaldos() {
  const today = new Date();
  const { accounts, loading: loadingAccounts } = useAccounts();
  const { transactions, loading: loadingTx } = useTransactions(today.getFullYear(), today.getMonth() + 1);

  const { start: cycleStart, end: cycleEnd } = getMonthRange(today.getFullYear(), today.getMonth() + 1);
  void cycleStart; void cycleEnd;

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
      <div className="flex flex-col gap-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 pl-4">{title}</h3>
        <SectionCard className="p-6 flex flex-col items-center justify-center group">
          {loading
            ? Array.from({ length: 2 }).map((_, i) => <SkeletonRow key={i} />)
            : accs.map((acc) => (
                <AccountRow key={acc.id} account={acc} invoiceTotal={invoiceByAccount[acc.id]} />
              ))}
        </SectionCard>
      </div>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 -ml-2 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-full transition-colors md:hidden">
            <ArrowLeft className="w-6 h-6 text-stone-400" />
          </Link>
          <div className="flex flex-col">
              <span className="text-[10px] font-black tracking-[0.4em] text-stone-400 uppercase mb-1 leading-none">Patrimônio</span>
              <h1 className="text-4xl font-black tracking-tighter uppercase text-foreground leading-none">Saldos & Contas</h1>
          </div>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12">
        <SectionCard variant="dark" className="md:col-span-5 p-10 relative overflow-hidden flex flex-col justify-between min-h-[300px]">
            <Wallet className="absolute -right-4 -top-4 w-40 h-40 opacity-5 rotate-12" />
            
            <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Consolidado Técnico</span>
                <span className="text-xs font-bold opacity-60 uppercase tracking-widest mt-8">Patrimônio Líquido Familiar</span>
                <span className="text-5xl font-black tracking-tighter leading-none mt-2">
                    {loading ? "..." : formatBRL(totalFamily)}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8 mt-12">
                <div className="flex flex-col gap-1 border-r border-white/5 pr-4">
                    <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Hector</span>
                    <span className={`font-mono font-black text-xl tracking-tighter ${totalHector < 0 ? "text-rose-400" : "text-white"}`}>
                        {loading ? "..." : formatBRL(totalHector)}
                    </span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Vitória</span>
                    <span className={`font-mono font-black text-xl tracking-tighter ${totalVitoria < 0 ? "text-rose-400" : "text-white"}`}>
                        {loading ? "..." : formatBRL(totalVitoria)}
                    </span>
                </div>
            </div>
        </SectionCard>

        <div className="md:col-span-7 flex flex-col gap-8">
            <Section title="Ativos Hector" accs={hectorAccounts} />
            <Section title="Ativos Vitória" accs={vitoriaAccounts} />
            {sharedAccounts.length > 0 && <Section title="Compartilhadas" accs={sharedAccounts} />}
        </div>
      </div>
    </PageContainer>
  );
}
