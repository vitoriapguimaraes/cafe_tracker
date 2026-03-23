"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Check, X, Edit3, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useCategories } from "../../lib/hooks/useCategories";
import { useTransactions } from "../../lib/hooks/useTransactions";
import { useToast, Toast } from "../../components/Toast";
import { SkeletonRow } from "../../components/Skeleton";
import { ConfirmModal } from "../../components/ConfirmModal";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const DEFAULT_GROUPS = [
  "Habitação",
  "Saúde",
  "Pets",
  "Streamings",
  "Lazer",
  "Compras",
  "Metas",
  "Educação",
  "Viagem",
  "Outros",
];

const GROUP_ICONS: Record<string, string> = {
  Habitação: "🏠",
  Saúde: "🩺",
  Pets: "🐾",
  Streamings: "📺",
  Lazer: "🏖️",
  Compras: "🛍️",
  Metas: "🚀",
  Investimentos: "📈",
  Educação: "📚",
  Viagem: "✈️",
  Outros: "💰",
};

export default function ConfigurarCategorias() {
  const { categories, loading, updateCategory, addCategory, deleteCategory } =
    useCategories();
  const { toast, showToast, dismissToast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{
    name: string;
    icon: string;
    group_name: string;
    budget_limit: string;
  } | null>(null);

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newGroup, setNewGroup] = useState("Outros");
  const [newLimit, setNewLimit] = useState("0");
  const [customGroup, setCustomGroup] = useState("");

  const activeGroups = Array.from(
    new Set(categories.map((c) => c.group_name || "Outros")),
  );
  const displayGroups = Array.from(
    new Set([...activeGroups, ...DEFAULT_GROUPS]),
  ).sort((a, b) => {
    if (a === "Outros") return 1;
    if (b === "Outros") return -1;
    return a.localeCompare(b);
  });

  const [idToDelete, setIdToDelete] = useState<string | null>(null);

  const [baseIncome, setBaseIncome] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("base_income");
    if (saved) setBaseIncome(parseFloat(saved));
  }, []);

  const handleBaseIncomeChange = (val: string) => {
    const num = parseFloat(val) || 0;
    setBaseIncome(num);
    localStorage.setItem("base_income", num.toString());
  };

  const today = new Date();
  const { transactions, loading: loadingTx } = useTransactions(
    today.getFullYear(),
    today.getMonth() + 1,
  );
  const registeredIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);

  const totalIncome = baseIncome > 0 ? baseIncome : registeredIncome;
  const totalBudget = categories.reduce(
    (sum, cat) => sum + cat.budget_limit,
    0,
  );

  // Group categories
  const grouped: Record<string, typeof categories> = {};
  categories.forEach((cat) => {
    const g = cat.group_name ?? "Outros";
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push(cat);
  });

  const sortedGroups = Object.keys(grouped).sort(
    (a, b) => displayGroups.indexOf(a) - displayGroups.indexOf(b),
  );

  async function handleSaveExtended(id: string) {
    if (!editData) return;
    const num = parseFloat(editData.budget_limit.replace(",", "."));
    if (isNaN(num) || num < 0) {
      showToast("Valor inválido", "error");
      return;
    }
    const { error } = await updateCategory(id, {
      name: editData.name,
      icon: editData.icon,
      group_name: editData.group_name,
      budget_limit: num,
    });
    if (error) showToast("Erro ao salvar", "error");
    else showToast("Categoria atualizada!", "success");
    setEditingId(null);
    setEditData(null);
  }

  async function handleAdd() {
    if (!newName.trim()) {
      showToast("Nome é obrigatório", "error");
      return;
    }
    const finalGroup = newGroup === "NEW" ? customGroup.trim() : newGroup;
    if (!finalGroup) {
      showToast("Selecione ou crie um grupo", "error");
      return;
    }

    const { error } = await addCategory({
      name: newName,
      group_name: finalGroup,
      icon: GROUP_ICONS[finalGroup] || "💰",
      budget_limit: parseFloat(newLimit) || 0,
      type: "essential",
    });
    if (error) showToast("Erro ao adicionar", "error");
    else {
      showToast("Categoria criada!", "success");
      setIsAdding(false);
      setNewName("");
      setNewGroup("Outros");
      setCustomGroup("");
    }
    setNewLimit("0");
  }

  return (
    <main className="min-h-screen bg-background text-foreground font-sans p-4 md:p-8 w-full max-w-[1000px] mx-auto flex flex-col mb-20 md:mb-0 transition-colors duration-300">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={dismissToast}
        />
      )}

      <header className="flex items-center justify-between mb-10 mt-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/"
              className="p-1 -ml-1 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-full transition-colors md:hidden"
            >
              <ArrowLeft className="w-5 h-5 text-stone-400" />
            </Link>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 mb-1">
              Parametrização
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase leading-[0.9]">
            Categorias & Metas
          </h1>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black transition-all ${isAdding ? "bg-rose-100 dark:bg-rose-900/30 text-rose-500" : "bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-md hover:scale-105 active:scale-95"}`}
        >
          {isAdding ? <X size={16} /> : <PlusCircle size={16} />}
          <span className="text-[9px] uppercase tracking-[0.2em]">
            {isAdding ? "Cancelar" : "Novo Tipo"}
          </span>
        </button>
      </header>

      {/* Summary Section - More Compact */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="bg-card rounded-2xl p-5 border border-border shadow-sm flex flex-col gap-1 justify-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">
            Receita Total (Prevista)
          </span>
          <span className="text-xl font-mono font-black text-emerald-500">
            {formatBRL(baseIncome + registeredIncome)}
          </span>
          {registeredIncome > 0 && baseIncome > 0 && (
            <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-tighter">
              ({formatBRL(baseIncome)} base + {formatBRL(registeredIncome)}{" "}
              extras)
            </span>
          )}
        </div>
        <div className="bg-card rounded-2xl p-5 border border-border shadow-sm flex flex-col gap-1 justify-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">
            Total do Orçamento
          </span>
          <span className="text-xl font-mono font-black text-foreground">
            {formatBRL(totalBudget)}
          </span>
        </div>
        <div
          className={`bg-card rounded-2xl p-5 border border-border shadow-sm flex flex-col gap-1 justify-center ${totalBudget > baseIncome + registeredIncome ? "border-rose-200 dark:border-rose-900/40" : "border-emerald-200 dark:border-emerald-900/40"}`}
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">
            Margem Livre
          </span>
          <span
            className={`text-xl font-mono font-black ${totalBudget > baseIncome + registeredIncome ? "text-rose-500" : "text-emerald-500"}`}
          >
            {formatBRL(baseIncome + registeredIncome - totalBudget)}
          </span>
        </div>
      </section>

      {isAdding && (
        <section className="mb-8 bg-card rounded-2xl p-6 shadow-xl border border-border animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-400 dark:text-stone-500 mb-6 font-mono px-1">
            Novo Tipo de Gasto
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[8px] font-black uppercase tracking-wider text-stone-400 ml-1">
                Nome (Tipo)
              </label>
              <input
                className="bg-background border border-border rounded-lg px-3 py-2 font-bold text-xs text-foreground outline-none focus:border-stone-500"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Aluguel..."
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[8px] font-black uppercase tracking-wider text-stone-400 ml-1">
                Categoria Pai
              </label>
              <select
                className="bg-background border border-border rounded-lg px-3 py-2 font-bold text-xs text-foreground outline-none focus:border-stone-500 appearance-none"
                value={newGroup}
                onChange={(e) => setNewGroup(e.target.value)}
              >
                {displayGroups.map((g) => (
                  <option key={g} value={g}>
                    {GROUP_ICONS[g] || "💰"} {g}
                  </option>
                ))}
                <option value="NEW">+ Criar Novo Grupo...</option>
              </select>
              {newGroup === "NEW" && (
                <input
                  className="mt-1 bg-background border-b border-border px-3 py-1 font-bold text-[10px] text-foreground outline-none focus:border-emerald-500 animate-in fade-in slide-in-from-left-2"
                  placeholder="Nome do novo grupo..."
                  value={customGroup}
                  onChange={(e) => setCustomGroup(e.target.value)}
                  autoFocus
                />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[8px] font-black uppercase tracking-wider text-stone-400 ml-1">
                Meta de Gasto (Teto)
              </label>
              <input
                type="number"
                className="bg-background border border-border rounded-lg px-3 py-2 font-bold text-xs text-foreground outline-none focus:border-stone-500"
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
              />
            </div>
            <button
              onClick={handleAdd}
              className="md:col-span-3 bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900 py-3 rounded-lg font-black uppercase tracking-[0.2em] text-[10px] hover:opacity-90 transition-all active:scale-[0.98]"
            >
              REGISTRAR NOVO TIPO
            </button>
          </div>
        </section>
      )}

      {/* Table Header - Unified grid */}
      <div className="hidden md:grid grid-cols-[1fr_120px_100px] gap-4 px-8 py-3 border-b border-stone-100 dark:border-stone-900 mb-1 opacity-50">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">
          Tipo de Gasto
        </span>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 text-right">
          Meta (Teto)
        </span>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 text-right">
          Ações
        </span>
      </div>

      <section className="flex flex-col gap-3">
        {loading
          ? Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)
          : sortedGroups.map((groupName) => {
              const groupSum = grouped[groupName].reduce(
                (s, c) => s + c.budget_limit,
                0,
              );
              return (
                <div key={groupName} className="flex flex-col gap-0.5">
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_120px_100px] gap-4 px-8 py-3.5 bg-stone-50 dark:bg-stone-900/40 rounded-t-xl border-x border-t border-border">
                    <div className="flex items-center gap-3">
                      <span className="text-xl shrink-0">
                        {GROUP_ICONS[groupName] || "💰"}
                      </span>
                      <div className="flex flex-col">
                        <h2 className="text-[11px] font-black uppercase tracking-widest text-foreground leading-none">
                          {groupName}
                        </h2>
                        <span className="text-[9px] font-bold text-stone-400 mt-1 uppercase tracking-tighter">
                          {grouped[groupName].length} itens
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-center">
                      <span className="text-[8px] font-black uppercase text-stone-400 tracking-widest mb-0.5">
                        Total
                      </span>
                      <span className="text-sm font-mono font-black text-foreground leading-none">
                        {formatBRL(groupSum)}
                      </span>
                    </div>

                    <div className="flex items-center justify-end">
                      {totalIncome > 0 && (
                        <div className="bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-1.5 rounded-lg border border-emerald-500/20">
                          <span className="text-[11px] font-black text-emerald-500">
                            {((groupSum / totalIncome) * 100).toFixed(0)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items in the Table - Thinner rows */}
                  <div className="bg-card border border-border rounded-b-xl overflow-hidden shadow-sm flex flex-col">
                    {grouped[groupName].map((cat) => {
                      const isEditing = editingId === cat.id && editData;
                      return (
                        <div
                          key={cat.id}
                          className="grid grid-cols-1 md:grid-cols-[1fr_120px_100px] gap-4 px-8 py-3.5 border-t border-stone-50 dark:border-stone-900/30 first:border-0 hover:bg-stone-50/50 dark:hover:bg-stone-900/20 transition-colors group/row"
                        >
                          {/* Col 1: Tipo */}
                          <div className="flex items-center">
                            {isEditing ? (
                              <div className="flex flex-col gap-1.5 w-full">
                                <input
                                  className="bg-background border border-border rounded-md px-2 py-1.5 font-bold text-xs outline-none focus:border-stone-500 w-full"
                                  value={editData.name}
                                  onChange={(e) =>
                                    setEditData({
                                      ...editData,
                                      name: e.target.value,
                                    })
                                  }
                                />
                                <div className="flex flex-col gap-0.5 mt-1">
                                  <span className="text-[8px] font-black uppercase text-stone-400 ml-1">
                                    Mover para Categoria
                                  </span>
                                  <select
                                    className="bg-stone-50 dark:bg-stone-900 border border-border rounded px-2 py-1 text-[10px] font-bold text-foreground outline-none focus:border-stone-500"
                                    value={editData.group_name}
                                    onChange={(e) =>
                                      setEditData({
                                        ...editData,
                                        group_name: e.target.value,
                                      })
                                    }
                                  >
                                    {displayGroups.map((g) => (
                                      <option key={g} value={g}>
                                        {g}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            ) : (
                              <span className="font-bold text-sm tracking-tight text-stone-700 dark:text-stone-300 uppercase">
                                {cat.name}
                              </span>
                            )}
                          </div>

                          {/* Col 2: Valor */}
                          <div className="flex items-center md:justify-end">
                            {isEditing ? (
                              <div className="relative w-full">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-stone-400">
                                  R$
                                </span>
                                <input
                                  type="number"
                                  className="bg-background border border-stone-800 dark:border-stone-100 rounded-md py-1.5 pl-6 pr-2 font-black text-sm outline-none w-full md:text-right"
                                  value={editData.budget_limit}
                                  onChange={(e) =>
                                    setEditData({
                                      ...editData,
                                      budget_limit: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            ) : (
                              <div className="flex flex-col items-end">
                                <span className="font-mono text-sm font-black tracking-tighter text-foreground">
                                  {formatBRL(cat.budget_limit)}
                                </span>
                                {groupName === "Metas" && totalIncome > 0 && (
                                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter mt-0.5">
                                    {Math.round(
                                      (cat.budget_limit / totalIncome) * 100,
                                    )}
                                    %
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Col 3: Ações */}
                          <div className="flex items-center justify-end gap-1.5">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleSaveExtended(cat.id)}
                                  className="bg-emerald-500 text-white p-1.5 rounded-lg shadow-md hover:bg-emerald-600 transition-all"
                                >
                                  <Check size={16} strokeWidth={3} />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingId(null);
                                    setEditData(null);
                                  }}
                                  className="bg-stone-200 dark:bg-stone-800 text-stone-500 p-1.5 rounded-lg hover:bg-stone-300 transition-all"
                                >
                                  <X size={16} strokeWidth={3} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingId(cat.id);
                                    setEditData({
                                      name: cat.name,
                                      icon: cat.icon,
                                      group_name: cat.group_name || "Outros",
                                      budget_limit: cat.budget_limit.toString(),
                                    });
                                  }}
                                  className="md:opacity-0 md:group-hover/row:opacity-100 opacity-100 bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 p-2 rounded-lg transition-all"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  onClick={() => setIdToDelete(cat.id)}
                                  className="md:opacity-0 md:group-hover/row:opacity-100 opacity-100 bg-stone-100 dark:bg-stone-800 text-stone-300 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-all"
                                >
                                  <X size={14} strokeWidth={3} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
      </section>

      <ConfirmModal
        isOpen={!!idToDelete}
        title="Excluir Categoria"
        message="Confirma a exclusão?"
        onConfirm={async () => {
          const { error } = await deleteCategory(idToDelete!);
          if (error) showToast("Erro ao excluir", "error");
          else showToast("Removido", "success");
          setIdToDelete(null);
        }}
        onCancel={() => setIdToDelete(null)}
        confirmLabel="EXCLUIR"
        cancelLabel="VOLTAR"
      />
    </main>
  );
}
