"use client";

import { useState, useEffect } from "react";
import { Settings, Shield, LogOut, ChevronRight, Edit3, TrendingUp, DollarSign } from "lucide-react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

const ConfigMenuItem = ({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: any;
  label: string;
  value?: string;
  href: string;
}) => (
  <Link
    href={href}
    className="w-full flex justify-between items-center py-5 border-b border-border last:border-0 group hover:bg-stone-50 dark:hover:bg-stone-900 transition-all px-4 -mx-4 rounded-2xl"
  >
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 dark:text-stone-400 group-hover:bg-stone-200 dark:group-hover:bg-stone-700 transition-colors">
        <Icon size={20} />
      </div>
      <span className="text-foreground font-bold text-sm tracking-tight">
        {label}
      </span>
    </div>
    <div className="flex items-center gap-3">
      {value && (
        <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-500 bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-full">
          {value}
        </span>
      )}
      <ChevronRight
        size={18}
        className="text-stone-300 dark:text-stone-600 transition-transform group-hover:translate-x-1"
      />
    </div>
  </Link>
);

export default function Configurar() {
  const [baseIncome, setBaseIncome] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("base_income");
    if (saved) setBaseIncome(saved);
  }, []);

  const handleUpdateIncome = (val: string) => {
    // Permitir vírgula mas converter para ponto para o storage
    const normalized = val.replace(",", ".");
    setBaseIncome(val);
    if (!isNaN(parseFloat(normalized))) {
      localStorage.setItem("base_income", normalized);
    }
  };
  return (
    <main className="min-h-screen bg-background text-foreground font-sans p-6 md:p-12 w-full max-w-[1400px] mx-auto flex flex-col mb-20 md:mb-0 transition-colors duration-300">
      <header className="flex flex-col mb-10 mt-2">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 mb-1 leading-none">
          Sistema
        </span>
        <h1 className="text-4xl font-black tracking-tighter uppercase text-foreground leading-[0.9]">
          Configurações
        </h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* User Info & Quick Actions */}
        <section className="md:col-span-5 flex flex-col gap-6">
          <div className="bg-card rounded-[2.5rem] p-8 shadow-xl border border-border flex flex-col items-center text-center transition-all hover:shadow-2xl">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-3xl bg-stone-900 dark:bg-stone-100 flex items-center justify-center text-white dark:text-stone-900 font-black text-3xl shadow-2xl rotate-3 transition-transform hover:rotate-0">
                C
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-400 border-4 border-card" />
            </div>
            <h2 className="font-black text-xl text-foreground tracking-tighter uppercase mb-1">
              Familia Cafe ☕
            </h2>
            <p className="text-[9px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-[0.2em] mb-6">
              Sincronização Ativa
            </p>

            <div className="w-full bg-stone-50 dark:bg-stone-900/50 rounded-2xl p-5 border border-border flex flex-col items-start gap-2 focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                <span className="text-[8px] font-black text-stone-400 uppercase tracking-[0.2em] flex items-center gap-1.5"><TrendingUp size={10} /> Salário Mensal Base</span>
                <div className="flex items-center gap-2 w-full">
                    <span className="text-xl font-black text-emerald-500">R$</span>
                    <input 
                        type="text"
                        inputMode="decimal"
                        value={baseIncome}
                        onChange={(e) => handleUpdateIncome(e.target.value)}
                        placeholder="0,00"
                        className="bg-transparent text-2xl font-mono font-black text-foreground outline-none w-full"
                    />
                </div>
                <p className="text-[8px] font-bold text-stone-400 dark:text-stone-500 text-left leading-relaxed">
                    ESTE VALOR SERÁ USADO COMO BASE PARA O CÁLCULO DA MARGEM LIVRE EM TODOS OS MESES.
                </p>
            </div>

            <div className="mt-8 pt-6 border-t border-border w-full grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-stone-400 uppercase">
                  Status
                </span>
                <span className="text-xs font-bold text-emerald-500">
                  PREMIUM
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-stone-400 uppercase">
                  Versão
                </span>
                <span className="text-xs font-bold text-foreground opacity-60">
                  2.1.0
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Settings Menu */}
        <div className="md:col-span-7 flex flex-col gap-10">
          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 dark:text-stone-500 mb-4 pl-4">
              Gerenciamento Administrativo
            </h3>
            <div className="bg-card rounded-[2.5rem] px-8 py-3 shadow-xl border border-border">
              <ConfigMenuItem
                icon={Settings}
                label="Preferências do Sistema"
                href="/configurar/preferencias"
              />
              <button 
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/login";
                }}
                className="w-full flex justify-between items-center py-5 group hover:bg-red-50 dark:hover:bg-red-950/20 transition-all px-4 -mx-4 rounded-2xl text-red-500"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-500 transition-colors group-hover:bg-red-200">
                    <LogOut size={20} />
                  </div>
                  <span className="font-bold text-sm tracking-tight">
                    Logout de Sessão
                  </span>
                </div>
                <ChevronRight
                  size={18}
                  className="text-red-300 dark:text-red-800 transition-transform group-hover:translate-x-1"
                />
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
