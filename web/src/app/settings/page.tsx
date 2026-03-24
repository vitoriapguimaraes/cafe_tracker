"use client";

import { useState, useEffect } from "react";
import { Settings, LogOut, ChevronRight, TrendingUp, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { PageContainer, PageHeader, SectionCard } from "../../components/LayoutComponents";

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
      <span className="text-foreground font-bold text-sm tracking-tight text-foreground/80 group-hover:text-foreground">
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
    const normalized = val.replace(",", ".");
    setBaseIncome(val);
    if (!isNaN(parseFloat(normalized))) {
      localStorage.setItem("base_income", normalized);
    }
  };

  return (
    <PageContainer>
      <PageHeader>
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 -ml-2 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-full transition-colors md:hidden">
            <ArrowLeft className="w-6 h-6 text-stone-400" />
          </Link>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 mb-1 leading-none">
              Sistema de Controle
            </span>
            <h1 className="text-4xl font-black tracking-tighter uppercase text-foreground leading-none">
              Configurações
            </h1>
          </div>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12">
        <section className="md:col-span-5 flex flex-col gap-6">
          <SectionCard className="p-10 flex flex-col items-center text-center">
            <div className="relative mb-8">
              <div className="w-24 h-24 rounded-[2rem] bg-stone-900 dark:bg-stone-100 flex items-center justify-center text-white dark:text-stone-900 font-black text-4xl shadow-2xl rotate-3 transition-transform hover:rotate-0">
                C
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-400 border-4 border-card" />
            </div>
            
            <h2 className="font-black text-2xl text-foreground tracking-tighter uppercase mb-1">
              Família Café ☕
            </h2>
            <p className="text-[9px] font-bold text-stone-400 uppercase tracking-[0.3em] mb-8">
              Sincronização em Nuvem
            </p>

            <div className="w-full bg-stone-50 dark:bg-stone-900/50 rounded-3xl p-6 border border-border flex flex-col items-start gap-3 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                <span className="text-[8px] font-black text-stone-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <TrendingUp size={10} className="text-emerald-500" /> Salário Mensal Base
                </span>
                <div className="flex items-center gap-2 w-full pt-1">
                    <span className="text-2xl font-black text-emerald-500">R$</span>
                    <input 
                        type="text"
                        inputMode="decimal"
                        value={baseIncome}
                        onChange={(e) => handleUpdateIncome(e.target.value)}
                        placeholder="0,00"
                        className="bg-transparent text-3xl font-mono font-black text-foreground outline-none w-full tracking-tighter"
                    />
                </div>
                <p className="text-[8px] font-bold text-stone-400 dark:text-stone-500 text-left leading-relaxed mt-2 uppercase">
                    Utilizado para calcular a margem livre global nos dashboards.
                </p>
            </div>

            <div className="mt-10 pt-8 border-t border-border/50 w-full grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest leading-none mb-1">Status</span>
                <span className="text-xs font-black text-emerald-500 uppercase">Premium</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest leading-none mb-1">Versão</span>
                <span className="text-xs font-black text-foreground/40 uppercase">2.1.2</span>
              </div>
            </div>
          </SectionCard>
        </section>

        <div className="md:col-span-7 flex flex-col gap-10">
          <div className="flex flex-col gap-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 mb-2 pl-4">Administração</h3>
            <SectionCard className="px-8 py-3">
              <ConfigMenuItem
                icon={Settings}
                label="Preferências do Usuário"
                href="/settings/preferences"
              />
              <button 
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/login";
                }}
                className="w-full flex justify-between items-center py-6 group hover:bg-red-50 dark:hover:bg-red-950/20 transition-all px-4 -mx-4 rounded-2xl text-red-500"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-500 transition-colors group-hover:bg-red-200">
                    <LogOut size={20} />
                  </div>
                  <span className="font-black text-sm uppercase tracking-tight">Logout de Sessão</span>
                </div>
                <ChevronRight
                  size={18}
                  className="text-red-300 dark:text-red-800 transition-transform group-hover:translate-x-1"
                />
              </button>
            </SectionCard>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
