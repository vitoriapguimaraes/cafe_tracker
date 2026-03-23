"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Check,
  Landmark,
  Wallet,
  Ticket,
  Plus,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { useAccounts } from "../../lib/hooks/useAccounts";
import { useCategories } from "../../lib/hooks/useCategories";
import { useTransactions } from "../../lib/hooks/useTransactions";
import { Toast, useToast } from "../../components/Toast";
import type { Account } from "../../lib/database.types";
import { PageContainer, PageHeader, SectionCard } from "../../components/LayoutComponents";

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
  const { accounts } = useAccounts();
  const { categories } = useCategories();
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
      amount: parseFloat(amount.replace(",", ".")),
      description: description || null,
      category_id: transactionType === "income" ? null : selectedCategoryId,
      account_id: selectedAccountId,
      date: new Date(date).toISOString(),
      type: transactionType,
      status: "paid",
    });

    if (error) {
      showToast("Erro ao salvar operação.", "error");
    } else {
      showToast(`${transactionType === 'income' ? 'Entrada' : 'Gasto'} registrado com sucesso!`, "success");
      setAmount("");
      setDescription("");
      setSelectedAccountId("");
      setSelectedGroup("");
      setSelectedCategoryId("");
    }
    setSubmitting(false);
  };

  return (
    <PageContainer>
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />}

      <PageHeader>
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <Link href="/" className="p-2 -ml-2 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-full transition-colors md:hidden">
              <ArrowLeft className="w-5 h-5 text-stone-400" />
            </Link>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 mb-1 leading-none">Fluxo de Caixa</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-foreground leading-none">Novo Lançamento</h1>
        </div>
      </PageHeader>

      <div className="flex flex-col gap-1 w-full pb-12">
        <SectionCard className="p-8 md:p-12">
          <form onSubmit={handleSubmit} className="flex flex-col gap-10">
            {/* Input de Valor Principal */}
            <div className="flex flex-col items-center justify-center gap-4 py-6 border-b border-border/50">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Montante da Operação</span>
                <div className="relative group w-full max-w-sm">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-emerald-500">R$</span>
                    <input
                        type="text"
                        inputMode="decimal"
                        placeholder="0,00"
                        className="w-full bg-stone-50/50 dark:bg-stone-900/30 border-2 border-border rounded-3xl py-6 pl-16 pr-8 font-mono text-4xl font-black outline-none focus:border-stone-400 dark:focus:border-stone-600 transition-all text-center"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        autoFocus
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Tipo de Operação */}
                <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Tipo</label>
                    <div className="bg-stone-50 dark:bg-stone-900/50 p-1.5 rounded-2xl flex gap-1 border border-border h-[56px]">
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

                {/* Histórico/Data */}
                <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Data</label>
                    <input
                        type="date"
                        className="bg-stone-50 dark:bg-stone-900/50 border border-border rounded-2xl py-4 px-6 font-bold text-sm outline-none focus:border-stone-400 transition-all h-[56px] text-foreground"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>

                {/* Responsável */}
                <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Responsável</label>
                    <div className="bg-stone-50 dark:bg-stone-900/50 p-1.5 rounded-2xl flex gap-1 border border-border h-[56px]">
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
                                {p.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Modalidade */}
                <div className={clsx("flex flex-col gap-3 transition-opacity", transactionType === 'income' && "opacity-30 grayscale pointer-events-none")}>
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Modalidade</label>
                    <div className="bg-stone-50 dark:bg-stone-900/50 p-1.5 rounded-2xl flex gap-1 border border-border h-[56px]">
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
                                {m === 'debit' ? 'DÉBITO' : 'CRÉDITO'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Categorização */}
                <div className={clsx("flex flex-col gap-6", transactionType === 'income' && "opacity-30 grayscale pointer-events-none")}>
                    <div className="flex flex-col gap-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Grupo de Categoria</label>
                        <select
                            className="bg-stone-50 dark:bg-stone-900/50 border border-border rounded-2xl py-4 px-6 font-bold text-xs outline-none focus:border-stone-400 transition-all appearance-none h-[56px] text-foreground"
                            value={selectedGroup}
                            onChange={(e) => {
                                setSelectedGroup(e.target.value);
                                setSelectedCategoryId("");
                            }}
                        >
                            <option value="">SELECIONE UM GRUPO...</option>
                            {groups.map((g) => (
                                <option key={g} value={g}>{g.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>

                    <div className={clsx("flex flex-col gap-3 transition-all", !selectedGroup && "opacity-30")}>
                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Específica</label>
                        <select
                            className="bg-stone-50 dark:bg-stone-900/50 border border-border rounded-2xl py-4 px-6 font-bold text-sm outline-none focus:border-stone-400 transition-all appearance-none h-[56px] text-foreground"
                            value={selectedCategoryId}
                            onChange={(e) => setSelectedCategoryId(e.target.value)}
                            disabled={!selectedGroup}
                        >
                            <option value="">QUAL O TIPO DE DESPESA?</option>
                            {filteredCategories.map((c) => (
                                <option key={c.id} value={c.id}>{c.icon} {c.name.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Contexto da Operação */}
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Conta de Origem/Destino</label>
                        <select
                            className="bg-stone-50 dark:bg-stone-900/50 border border-border rounded-2xl py-4 px-6 font-bold text-sm outline-none focus:border-stone-400 transition-all appearance-none h-[56px] text-foreground"
                            value={selectedAccountId}
                            onChange={(e) => setSelectedAccountId(e.target.value)}
                        >
                            <option value="">SELECIONE A INSTITUIÇÃO...</option>
                            {activeAccounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Descrição / Notas Rápidas</label>
                        <input
                            type="text"
                            placeholder="Ex: Almoço, Compra Amazon, PIX Recebido..."
                            className="bg-stone-50 dark:bg-stone-900/50 border border-border rounded-2xl py-4 px-6 font-bold text-sm outline-none focus:border-stone-400 transition-all h-[56px] text-foreground"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={!amount || !selectedAccountId || (transactionType === 'expense' && !selectedCategoryId) || submitting}
                className={clsx(
                    "w-full py-6 rounded-3xl text-sm font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl disabled:opacity-20 mt-6",
                    transactionType === 'income' ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:opacity-90'
                )}
            >
                {submitting ? (
                    <span className="animate-spin border-2 border-current border-t-transparent rounded-full w-5 h-5" />
                ) : (
                    <>{transactionType === 'income' ? <Plus size={20} /> : <Check size={20} />} REGISTRAR {transactionType === 'income' ? 'ENTRADA' : 'Lan\u00e7amento'}</>
                )}
            </button>
          </form>
        </SectionCard>
      </div>
    </PageContainer>
  );
}
