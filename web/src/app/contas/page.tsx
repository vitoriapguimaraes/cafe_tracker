"use client";

import { useState } from "react";
import {
    ArrowLeft,
    Check,
    X,
    Edit3,
    Landmark,
    CreditCard,
    Wallet,
    PlusCircle,
    Calendar,
    Ticket
  } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAccounts } from "../../lib/hooks/useAccounts";
import { useToast, Toast } from "../../components/Toast";
import { SkeletonRow } from "../../components/Skeleton";
import { ConfirmModal } from "../../components/ConfirmModal";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const BankIcon = ({ name, size = 32 }: { name: string; size?: number }) => {
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

export default function ConfigurarContas() {
  const { accounts, loading, updateAccount, addAccount, deleteAccount } = useAccounts();
  const { toast, showToast, dismissToast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ name: string; type: string; balance: string; owner: string; invoice_due_day: number | null } | null>(null);

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("bank");
  const [newBalance, setNewBalance] = useState("0");
  const [newOwner, setNewOwner] = useState("hector");
  const [newDueDay, setNewDueDay] = useState("");

  const [idToDelete, setIdToDelete] = useState<string | null>(null);

  async function handleSaveExtended(id: string) {
    if (!editData) return;
    const num = parseFloat(editData.balance.replace(",", "."));
    if (isNaN(num)) {
      showToast("Valor inválido", "error");
      return;
    }
    const { error } = await updateAccount(id, {
      name: editData.name,
      type: editData.type as any,
      balance: num,
      owner: editData.owner as any,
      invoice_due_day: editData.invoice_due_day || 0
    });

    if (error) showToast("Erro ao salvar", "error");
    else showToast("Conta atualizada!", "success");
    setEditingId(null);
    setEditData(null);
  }

  async function handleAdd() {
    if (!newName.trim()) {
      showToast("Nome é obrigatório", "error");
      return;
    }
    const { error } = await addAccount({
      name: newName,
      type: newType as any,
      balance: parseFloat(newBalance) || 0,
      owner: newOwner as any,
      invoice_due_day: newType === 'credit_card' ? (parseInt(newDueDay) || 0) : 0,
      credit_limit: 0
    });

    if (error) showToast("Erro ao adicionar", "error");
    else {
      showToast("Conta criada!", "success");
      setIsAdding(false);
      setNewName("");
      setNewBalance("0");
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground font-sans p-4 md:p-8 w-full max-w-[1000px] mx-auto flex flex-col mb-20 md:mb-0 transition-colors duration-300">
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />}

      <header className="flex items-center justify-between mb-10 mt-2">
        <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
                <Link href="/" className="p-1 -ml-1 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-full transition-colors md:hidden">
                    <ArrowLeft className="w-5 h-5 text-stone-400 font-bold" />
                </Link>
                <span className="text-[10px] font-black tracking-[0.4em] text-stone-400 dark:text-stone-500 uppercase">Parametrização</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase text-foreground leading-[0.9]">Bancos & Contas</h1>
        </div>
        <button 
            onClick={() => setIsAdding(!isAdding)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black transition-all ${isAdding ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-500' : 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-md hover:scale-105 active:scale-95'}`}
        >
            {isAdding ? <X size={16} /> : <PlusCircle size={16} />}
            <span className="text-[9px] uppercase tracking-[0.2em]">{isAdding ? 'Cancelar' : 'Nova Conta'}</span>
        </button>
      </header>

      {isAdding && (
        <section className="mb-8 bg-card rounded-2xl p-6 shadow-xl border border-border animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-400 dark:text-stone-500 mb-6 font-mono px-1">Novo Ativo Financeiro</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-[8px] font-black uppercase tracking-wider text-stone-400 ml-1">Instituição</label>
                    <input 
                        className="bg-background border border-border rounded-lg px-3 py-2 font-bold text-xs text-foreground outline-none focus:border-stone-500 transition-all"
                        placeholder="Ex: Santander, Nubank..."
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-[8px] font-black uppercase tracking-wider text-stone-400 ml-1">Tipo & Responsável</label>
                    <div className="grid grid-cols-2 gap-2">
                        <select 
                            className="bg-background border border-border rounded-lg px-3 py-2 font-bold text-xs text-foreground outline-none focus:border-stone-500 appearance-none"
                            value={newType}
                            onChange={e => setNewType(e.target.value)}
                        >
                            <option value="bank">Banco/Débito</option>
                            <option value="credit_card">Cartão de Crédito</option>
                            <option value="cash">Dinheiro/Carteira</option>
                        </select>
                        <select 
                            className="bg-background border border-border rounded-lg px-3 py-2 font-bold text-xs text-foreground outline-none focus:border-stone-500 appearance-none"
                            value={newOwner}
                            onChange={e => setNewOwner(e.target.value)}
                        >
                            <option value="hector">Hector</option>
                            <option value="vitoria">Vitoria</option>
                            <option value="shared">Compartilhada</option>
                        </select>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-black uppercase tracking-wider text-stone-400 ml-1">
                        {newType === 'credit_card' ? 'Saldo Ativo' : 'Saldo Inicial'}
                    </label>
                    <input 
                        type="number"
                        className="bg-background border border-border rounded-lg px-3 py-2.5 font-bold text-sm text-foreground outline-none focus:border-stone-500 transition-all"
                        value={newBalance}
                        onChange={e => setNewBalance(e.target.value)}
                    />
                </div>
                {newType === 'credit_card' && (
                    <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                        <label className="text-[9px] font-black uppercase tracking-wider text-stone-400 ml-1">Dia de Vencimento</label>
                        <input 
                            type="number"
                            placeholder="Dia (1-31)"
                            className="bg-background border border-border rounded-lg px-3 py-2.5 font-bold text-sm text-foreground outline-none focus:border-stone-500 transition-all"
                            value={newDueDay}
                            onChange={e => setNewDueDay(e.target.value)}
                        />
                    </div>
                )}
                <button 
                    onClick={handleAdd}
                    className="md:col-span-2 bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900 py-3 rounded-lg font-black uppercase tracking-[0.2em] text-[10px] hover:opacity-90 transition-all active:scale-[0.98] mt-2"
                >
                    REGISTRAR NO SISTEMA
                </button>
            </div>
        </section>
      )}

      <section className="flex flex-col gap-6">
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : (
          <>
            {/* Debit Section */}
            {accounts.some(a => a.type === 'bank' || a.type === 'cash') && (
                <div className="flex flex-col gap-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400 dark:text-stone-500 pl-4 py-1.5">Débito & Saldo</p>
                    <div className="bg-card rounded-xl px-4 py-1 shadow-sm border border-border flex flex-col">
                        {accounts.filter(a => a.type === 'bank' || a.type === 'cash').map((acc) => (
                            <AccountRow 
                                key={acc.id} 
                                acc={acc} 
                                editingId={editingId} 
                                editData={editData} 
                                setEditData={setEditData} 
                                setEditingId={setEditingId}
                                handleSaveExtended={() => handleSaveExtended(acc.id)}
                                setIdToDelete={setIdToDelete}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Credit Section */}
            {accounts.some(a => a.type === 'credit_card') && (
                <div className="flex flex-col gap-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400 dark:text-stone-500 pl-4 py-1.5">Crédito & Faturas</p>
                    <div className="bg-card rounded-xl px-4 py-1 shadow-sm border border-border flex flex-col">
                        {accounts.filter(a => a.type === 'credit_card').map((acc) => (
                            <AccountRow 
                                key={acc.id} 
                                acc={acc} 
                                editingId={editingId} 
                                editData={editData} 
                                setEditData={setEditData} 
                                setEditingId={setEditingId}
                                handleSaveExtended={() => handleSaveExtended(acc.id)}
                                setIdToDelete={setIdToDelete}
                            />
                        ))}
                    </div>
                </div>
            )}
          </>
        )}
      </section>

      <ConfirmModal 
        isOpen={!!idToDelete}
        title="Remover Conta"
        message="Confirma a exclusão (Sim/Não)?"
        onConfirm={async () => {
          if (!idToDelete) return;
          const { error } = await deleteAccount(idToDelete);
          if (error) showToast("Erro ao excluir", "error");
          else showToast("Removido", "success");
          setIdToDelete(null);
        }}
        onCancel={() => setIdToDelete(null)}
        confirmLabel="REMOVER"
        cancelLabel="VOLTAR"
      />
    </main>
  );
}

function AccountRow({ acc, editingId, editData, setEditData, setEditingId, handleSaveExtended, setIdToDelete }: any) {
    const isEditing = editingId === acc.id && editData;

    return (
        <div className="flex justify-between items-center py-1.5 border-b border-stone-50 dark:border-stone-900/40 last:border-0 gap-3 group/row">
            <div className="flex items-center gap-2 flex-1 min-w-0">
                {!editingId && (
                    <button 
                        onClick={() => setIdToDelete(acc.id)}
                        className="md:opacity-0 md:group-hover/row:opacity-100 opacity-100 text-stone-300 hover:text-rose-500 transition-all p-1 -ml-1 h-7 w-7 flex items-center justify-center shrink-0 bg-stone-50 dark:bg-stone-900/50 rounded-md"
                    >
                        <X size={14} strokeWidth={3} />
                    </button>
                )}
                
                <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-stone-800 flex items-center justify-center shadow-sm border border-border overflow-hidden shrink-0 relative">
                        <BankIcon name={acc.name} size={32} />
                        {acc.type === 'credit_card' && (
                            <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-rose-500 rounded-bl-sm border-l border-b border-white/20" />
                        )}
                    </div>
                    
                    {isEditing ? (
                        <div className="flex-1 flex flex-col gap-1.5 py-1">
                            <input
                                className="w-full bg-background border border-border rounded-md px-2 py-1 font-bold text-[10px] outline-none focus:border-stone-500"
                                value={editData.name}
                                onChange={e => setEditData({...editData, name: e.target.value})}
                                placeholder="Nome"
                            />
                            <div className="flex gap-1.5">
                                <select 
                                    className="flex-1 border border-border rounded-md px-1.5 py-1 text-[8px] font-bold bg-background outline-none appearance-none"
                                    value={editData.type}
                                    onChange={e => setEditData({...editData, type: e.target.value})}
                                >
                                    <option value="bank">Banco</option>
                                    <option value="credit_card">Cartão</option>
                                </select>
                                <select 
                                    className="flex-1 border border-border rounded-md px-1.5 py-1 text-[8px] font-bold bg-background outline-none appearance-none"
                                    value={editData.owner}
                                    onChange={e => setEditData({...editData, owner: e.target.value})}
                                >
                                    <option value="hector">Hector</option>
                                    <option value="vitoria">Vitoria</option>
                                    <option value="shared">Compartilhada</option>
                                </select>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col min-w-0">
                            <h4 className="font-black text-xs md:text-sm tracking-tight text-foreground truncate uppercase">{acc.name}</h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm ${acc.owner === 'hector' ? 'bg-blue-50 text-blue-500' : acc.owner === 'vitoria' ? 'bg-rose-50 text-rose-500' : 'bg-stone-100 text-stone-500'}`}>{acc.owner === 'shared' ? '🤝 COMPARTILHADO' : acc.owner}</span>
                                {acc.type === 'credit_card' && acc.invoice_due_day > 0 && (
                                    <span className="text-[8px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-1">
                                        • Vence dia {acc.invoice_due_day}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3">
                {isEditing ? (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                        <div className="flex gap-2 min-w-[180px]">
                            <div className="flex flex-col gap-1 flex-1">
                                <label className="text-[9px] font-black uppercase tracking-wider text-stone-400">{editData.type === 'credit_card' ? 'Saldo Ativo' : 'Saldo'}</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full bg-background border border-border rounded-md px-2 py-1.5 text-xs font-black outline-none"
                                    value={editData.balance}
                                    onChange={e => setEditData({...editData, balance: e.target.value})}
                                />
                            </div>
                            {editData.type === 'credit_card' && (
                                <div className="flex flex-col gap-1 w-12">
                                    <label className="text-[9px] font-black uppercase tracking-wider text-stone-400 text-center">Venc.</label>
                                    <input
                                        type="number"
                                        className="w-full bg-background border border-border rounded-md px-1 py-1.5 text-xs font-black text-center outline-none"
                                        value={editData.invoice_due_day || ""}
                                        onChange={e => setEditData({...editData, invoice_due_day: parseInt(e.target.value) || null})}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex gap-1 pl-1">
                            <button onClick={handleSaveExtended} className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-md transition-colors"><Check size={20} strokeWidth={3} /></button>
                            <button onClick={() => { setEditingId(null); setEditData(null); }} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition-colors"><X size={20} strokeWidth={3} /></button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => {
                            setEditingId(acc.id);
                            setEditData({
                                name: acc.name,
                                type: acc.type,
                                balance: acc.balance.toString(),
                                owner: acc.owner,
                                invoice_due_day: acc.invoice_due_day
                            });
                        }}
                        className="flex items-center gap-4 text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-all group/btn"
                    >
                        <div className="flex flex-col items-end">
                            <span className="font-mono text-base font-black tracking-tighter text-foreground">{formatBRL(acc.balance)}</span>
                            {acc.type === 'credit_card' && (
                                <span className="text-[9px] font-black text-rose-500/80 uppercase tracking-widest leading-none">Aberto</span>
                            )}
                        </div>
                        <Edit3 size={16} className="md:opacity-0 md:group-hover/btn:opacity-60 opacity-60 transition-opacity" />
                    </button>
                )}
            </div>
        </div>
    );
}
