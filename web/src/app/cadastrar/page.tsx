"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Check,
  Landmark,
  Wallet,
  Ticket,
  TrendingUp,
  TrendingDown,
  Plus,
  Calendar,
  Layers,
  Tag,
  User,
  CreditCard as CreditCardIcon
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { useAccounts } from "../../lib/hooks/useAccounts";
import { useCategories } from "../../lib/hooks/useCategories";
import { useTransactions } from "../../lib/hooks/useTransactions";
import { Toast, useToast } from "../../components/Toast";
import type { Account } from "../../lib/database.types";

const BankIcon = ({ name, size = 24 }: { name: string; size?: number }) => {
  const n = name.toLowerCase();
  const imgClass = "w-full h-full object-cover";
  
  if (n.includes("nubank"))
    return <Image src="/bank_icons/nubank.png" alt="Nubank" width={size} height={size} className={imgClass} style={{ objectFit: 'cover' }} />;
  if (n.includes("santander"))
    return <Image src="/bank_icons/santander.png" alt="Santander" width={size} height={size} className={imgClass} style={{ objectFit: 'cover' }} />;
  if (n.includes("itaú") || n.includes("itau"))
    return <Image src="/bank_icons/itau.png" alt="Itaú" width={size} height={size} className={imgClass} style={{ objectFit: 'cover' }} />;
  if (n.includes("bb ") || n.includes("brasil") || n.startsWith("bb"))
    return <Image src="/bank_icons/bb.png" alt="BB" width={size} height={size} className={imgClass} style={{ objectFit: 'cover' }} />;
  if (n.includes("mercado"))
    return <Image src="/bank_icons/mercado_pago.webp" alt="Mercado Pago" width={size} height={size} className={imgClass} style={{ objectFit: 'cover' }} />;
  if (n.includes("carteira") || n.includes("dinheiro"))
    return <Wallet size={size * 0.7} className="text-emerald-600" />;
  if (n.includes("vr") || n.includes("ticket"))
    return <Ticket size={size * 0.7} className="text-pink-600" />;
  return <Landmark size={size * 0.7} className="text-stone-400" />;
};

function cleanAccountName(name: string) {
  return name.replace(/\s*\[.\]\s*-\s*(Banco|Cartão)/, "").replace(/\s*\[.\]/, "").trim();
}

export default function CadastrarGasto() {
  const today = new Date();
  const [transactionType, setTransactionType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(today.toISOString().split("T")[0]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"debit" | "credit">("debit");
  const [payer, setPayer] = useState<"hector" | "vitoria">("hector");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { toast, showToast, dismissToast } = useToast();
  const { accounts, loading: loadingAccounts } = useAccounts();
  const { categories, loading: loadingCats } = useCategories();
  const { addTransaction } = useTransactions(today.getFullYear(), today.getMonth() + 1);

  useEffect(() => {
    const saved = localStorage.getItem("defaultProfile");
    if (saved === "hector" || saved === "vitoria") {
      setPayer(saved);
    }
  }, []);

  const groups = Array.from(new Set(categories.map(c => c.group_name || "Outros"))).sort();
  
  const filteredCategories = selectedGroup 
    ? categories.filter(c => (c.group_name || "Outros") === selectedGroup)
    : [];

  const activeAccounts: Account[] = accounts.filter((acc) => {
    if (acc.owner !== payer && acc.owner !== "shared") return false;
    if (transactionType === "income") return acc.type === "bank" || acc.type === "cash";
    if (paymentMethod === "debit") return acc.type === "bank" || acc.type === "cash";
    return acc.type === "credit_card";
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !selectedAccountId || (transactionType === "expense" && !selectedCategoryId)) return;
    setSubmitting(true);

    const { error } = await addTransaction({
      amount: parseFloat(amount),
      description: description || null,
      category_id: transactionType === "income" ? null : selectedCategoryId,
      account_id: selectedAccountId,
      date: new Date(date).toISOString(),
      type: transactionType,
      status: "paid",
    });

    if (error) {
      showToast("Erro ao salvar.", "error");
    } else {
      showToast(`${transactionType === 'income' ? 'Receita' : 'Gasto'} salvo! ✨`, "success");
      setAmount("");
      setDescription("");
      setSelectedAccountId("");
      setSelectedGroup("");
      setSelectedCategoryId("");
    }
    setSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-background text-foreground font-sans p-4 md:p-8 w-full max-w-[1100px] mx-auto flex flex-col transition-colors duration-300">
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />}

      <header className="flex items-center justify-between mb-10 mt-2">
        <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
                <Link href="/" className="p-2 -ml-2 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-full transition-colors md:hidden">
                    <ArrowLeft className="w-5 h-5 text-stone-400" />
                </Link>
                <span className="text-[10px] font-black tracking-[0.4em] text-stone-400 dark:text-stone-500 uppercase">Registro</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase text-foreground leading-[0.9]">Novo Lançamento</h1>
        </div>
      </header>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6">
            {/* Row 1: Valor, Data, Categoria, Tipo */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Valor</label>
                    <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-lg group-focus-within:scale-110 transition-transform">R$</span>
                        <input
                            type="text"
                            inputMode="decimal"
                            placeholder="0,00"
                            className="w-full bg-stone-50 dark:bg-stone-900/50 border border-border rounded-2xl py-4 pl-12 pr-4 font-mono text-xl font-black outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Data</label>
                    <input
                        type="date"
                        className="bg-stone-50 dark:bg-stone-900/50 border border-border rounded-2xl py-4 px-6 font-bold text-sm outline-none focus:ring-2 focus:ring-stone-500 transition-all h-[66px]"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>

                <div className={clsx("flex flex-col gap-2 transition-all duration-300", transactionType === 'income' ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100')}>
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Categoria</label>
                    <select
                        className="bg-stone-50 dark:bg-stone-900/50 border border-border rounded-2xl py-4 px-6 font-bold text-sm outline-none focus:ring-2 focus:ring-stone-500 transition-all appearance-none h-[66px]"
                        value={selectedGroup}
                        onChange={(e) => {
                            setSelectedGroup(e.target.value);
                            setSelectedCategoryId("");
                        }}
                    >
                        <option value="">SELECIONE...</option>
                        {groups.map((g) => (
                            <option key={g} value={g}>{g.toUpperCase()}</option>
                        ))}
                    </select>
                </div>

                <div className={clsx("flex flex-col gap-2 transition-all duration-300", (transactionType === 'income' || !selectedGroup) ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100')}>
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Tipo</label>
                    <select
                        className="bg-stone-50 dark:bg-stone-900/50 border border-border rounded-2xl py-4 px-6 font-bold text-sm outline-none focus:ring-2 focus:ring-stone-500 transition-all appearance-none h-[66px]"
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                        disabled={!selectedGroup}
                    >
                        <option value="">SELECIONE...</option>
                        {filteredCategories.map((c) => (
                            <option key={c.id} value={c.id}>{c.icon} {c.name.toUpperCase()}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Row 2: Destino/Origem, Fluxo, Responsável, Modalidade */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">
                        {transactionType === 'income' ? 'Conta de Entrada' : 'Conta de Saída'}
                    </label>
                    <select
                        className="bg-stone-50 dark:bg-stone-900/50 border border-border rounded-2xl py-4 px-6 font-bold text-sm outline-none focus:ring-2 focus:ring-stone-500 transition-all appearance-none h-[66px]"
                        value={selectedAccountId}
                        onChange={(e) => setSelectedAccountId(e.target.value)}
                    >
                        <option value="">SELECIONE...</option>
                        {activeAccounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.name.toUpperCase()}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Fluxo</label>
                    <div className="bg-stone-50 dark:bg-stone-900/50 p-1 rounded-2xl flex gap-1 border border-border h-[66px]">
                        <button
                            type="button"
                            onClick={() => { setTransactionType("expense"); setSelectedAccountId(""); }}
                            className={clsx(
                                "flex-1 rounded-xl text-[10px] font-black tracking-widest transition-all",
                                transactionType === "expense" ? "bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-md" : "text-stone-400"
                            )}
                        >
                            GASTO
                        </button>
                        <button
                            type="button"
                            onClick={() => { setTransactionType("income"); setSelectedAccountId(""); }}
                            className={clsx(
                                "flex-1 rounded-xl text-[10px] font-black tracking-widest transition-all",
                                transactionType === "income" ? "bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-md" : "text-stone-400"
                            )}
                        >
                            ENTRADA
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Responsável</label>
                    <div className="bg-stone-50 dark:bg-stone-900/50 p-1 rounded-2xl flex gap-1 border border-border h-[66px]">
                        {(["hector", "vitoria"] as const).map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => { setPayer(p); setSelectedAccountId(""); }}
                                className={clsx(
                                    "flex-1 rounded-xl text-[10px] font-black tracking-widest transition-all",
                                    payer === p ? "bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-md" : "text-stone-400"
                                )}
                            >
                                {p === 'hector' ? 'H' : 'V'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={clsx("flex flex-col gap-2 transition-all duration-300", transactionType === 'income' ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100')}>
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Modalidade</label>
                    <div className="bg-stone-50 dark:bg-stone-900/50 p-1 rounded-2xl flex gap-1 border border-border h-[66px]">
                        {(["debit", "credit"] as const).map((m) => (
                            <button
                                key={m}
                                type="button"
                                onClick={() => { setPaymentMethod(m); setSelectedAccountId(""); }}
                                className={clsx(
                                    "flex-1 rounded-xl text-[10px] font-black tracking-widest transition-all",
                                    paymentMethod === m ? "bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-md" : "text-stone-400"
                                )}
                            >
                                {m === 'debit' ? 'DÉB' : 'CRÉD'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Row 3: Descrição */}
            <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Descrição / Notas</label>
                <input
                    type="text"
                    placeholder="Ex: Compra do mês, PIX de fulano..."
                    className="bg-stone-50 dark:bg-stone-900/50 border border-border rounded-2xl py-5 px-8 font-bold text-sm outline-none focus:ring-2 focus:ring-stone-500 transition-all"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>

            {/* ATIVAÇÃO */}
            <button
                type="submit"
                disabled={!amount || !selectedAccountId || (transactionType === 'expense' && !selectedCategoryId) || submitting}
                className={clsx(
                    "w-full py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-2xl disabled:opacity-30 mt-4",
                    transactionType === 'income' ? 'bg-emerald-500 text-white shadow-emerald-500/40 hover:bg-emerald-600' : 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-stone-900/40 hover:opacity-90'
                )}
            >
                {submitting ? (
                    <span className="animate-spin border-2 border-current border-t-transparent rounded-full w-5 h-5" />
                ) : (
                    <>{transactionType === 'income' ? <Plus size={20} /> : <Check size={20} />} REGISTRAR {transactionType === 'income' ? 'ENTRADA' : 'GIZMO?'}</>
                )}
            </button>
        </form>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; }
      `}</style>
    </main>
  );
}
