"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Toast, useToast } from "../../../components/Toast";
import { PageContainer, PageHeader, SectionCard } from "../../../components/LayoutComponents";
import { 
  ArrowLeft, 
  Moon as MoonIcon, 
  Sun as SunIcon, 
  Monitor as MonitorIcon, 
  User as UserIcon, 
  Info as InfoIcon, 
  Save as SaveIcon 
} from "lucide-react";

export default function Preferencias() {
  const { toast, showToast, dismissToast } = useToast();
  const [theme, setTheme] = useState("system");
  const [defaultProfile, setDefaultProfile] = useState("hector");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") || "system";
    const savedProfile = localStorage.getItem("defaultProfile") || "hector";
    setTheme(savedTheme);
    setDefaultProfile(savedProfile);
  }, []);

  const handleSave = () => {
    localStorage.setItem("theme", theme);
    localStorage.setItem("defaultProfile", defaultProfile);
    
    // Apply theme immediately
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (theme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }

    showToast("Preferências salvas com sucesso! ✨", "success");
  };

  if (!mounted) return null;

  return (
    <PageContainer>
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />}

      <PageHeader>
        <div className="flex items-center gap-4">
          <Link
            href="/settings"
            className="p-2 -ml-2 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-stone-600 dark:text-stone-400" />
          </Link>
          <div className="flex flex-col">
            <span className="text-[10px] font-black tracking-[0.4em] text-stone-400 dark:text-stone-500 uppercase leading-none">
              Gerenciamento
            </span>
            <h1 className="text-4xl font-black tracking-tighter uppercase text-foreground leading-none">
              Preferências
            </h1>
          </div>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12">
        <div className="md:col-span-8 flex flex-col gap-10">
          {/* Theme selection */}
          <section className="flex flex-col gap-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 mb-2 pl-4">Experiência Visual</h3>
            <SectionCard className="p-8">
              <div className="grid grid-cols-3 gap-6">
                {[
                  { id: "light", label: "CLARO", icon: SunIcon },
                  { id: "dark", label: "ESCURO", icon: MoonIcon },
                  { id: "system", label: "SISTEMA", icon: MonitorIcon },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`flex flex-col items-center gap-4 p-8 rounded-3xl border-2 transition-all ${
                      theme === t.id
                        ? "border-stone-800 dark:border-stone-100 bg-stone-50 dark:bg-stone-900"
                        : "border-transparent bg-background/50 hover:bg-background"
                    }`}
                  >
                    <t.icon size={28} className={theme === t.id ? "text-foreground" : "text-stone-400"} />
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${theme === t.id ? "text-foreground" : "text-stone-500"}`}>
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>
            </SectionCard>
          </section>

          {/* Default profile selection */}
          <section className="flex flex-col gap-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 mb-2 pl-4">Fluxo de Cadastro</h3>
            <SectionCard className="p-8">
              <div className="flex flex-col items-start gap-1 mb-8">
                  <span className="text-xs font-bold text-foreground/70 uppercase">Perfil Operacional Padrão</span>
                  <span className="text-[10px] text-stone-400 uppercase tracking-widest leading-relaxed">Define qual conta será selecionada automaticamente ao cadastrar novos lançamentos.</span>
              </div>
              <div className="flex gap-4">
                {[
                  { id: "hector", label: "HECTOR" },
                  { id: "vitoria", label: "VITÓRIA" },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setDefaultProfile(p.id)}
                    className={`flex-1 flex items-center justify-center gap-4 py-5 rounded-2xl border-2 transition-all ${
                      defaultProfile === p.id
                        ? "border-emerald-500 bg-emerald-500/5 text-emerald-500"
                        : "border-transparent bg-background text-stone-400 hover:bg-stone-50"
                    }`}
                  >
                    <UserIcon size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{p.label}</span>
                  </button>
                ))}
              </div>
            </SectionCard>
          </section>
        </div>

        <div className="md:col-span-4 flex flex-col gap-8">
          {/* System info */}
          <SectionCard variant="dark" className="p-10 relative overflow-hidden h-fit">
            <InfoIcon size={120} className="absolute -right-8 -top-8 opacity-5 rotate-12" />
            
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-10">Meta-Informações</h4>
            
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Build</span>
                <span className="text-xs font-black font-mono">2.1.2-STABLE</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Ambiente</span>
                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em] bg-emerald-400/10 px-2 py-1 rounded-md">Produção</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Conexão</span>
                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest opacity-80 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ONLINE
                </span>
              </div>
            </div>
          </SectionCard>

          <button 
            onClick={handleSave}
            className="group w-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-4 transition-all hover:scale-105 active:scale-95 border-b-4 border-emerald-500"
          >
            <SaveIcon size={32} className="group-hover:rotate-12 transition-transform" />
            <span className="text-xs font-black uppercase tracking-[0.3em]">Salvar Alterações</span>
          </button>
        </div>
      </div>
    </PageContainer>
  );
}
