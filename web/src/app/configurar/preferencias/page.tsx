"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Moon, Sun, Monitor, User, Info, Save } from "lucide-react";
import Link from "next/link";
import { Toast, useToast } from "../../../components/Toast";

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

    showToast("Preferências salvas! ✨", "success");
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-background text-foreground font-sans p-6 md:p-12 w-full max-w-[1400px] mx-auto flex flex-col transition-colors duration-300">
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />}

      <header className="flex flex-col mb-12 mt-2">
        <div className="flex items-center gap-2 mb-1">
          <Link
            href="/configurar"
            className="p-2 -ml-2 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-stone-600 dark:text-stone-400" />
          </Link>
          <span className="text-[10px] font-black tracking-[0.4em] text-stone-400 dark:text-stone-500 uppercase">
            Gerenciamento
          </span>
        </div>
        <h1 className="text-3xl font-black tracking-tighter uppercase text-foreground">
          Preferências do Sistema
        </h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-8 flex flex-col gap-10">
          {/* Theme selection */}
          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 dark:text-stone-500 mb-4 pl-4">Aparência Visual</h3>
            <div className="bg-card rounded-[2.5rem] p-8 shadow-xl border border-border">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: "light", label: "Claro", icon: Sun },
                  { id: "dark", label: "Escuro", icon: Moon },
                  { id: "system", label: "Sistema", icon: Monitor },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                      theme === t.id
                        ? "border-stone-800 dark:border-stone-100 bg-stone-50 dark:bg-stone-900"
                        : "border-transparent bg-background/50 hover:bg-background"
                    }`}
                  >
                    <t.icon size={24} className={theme === t.id ? "text-foreground" : "text-stone-400"} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${theme === t.id ? "text-foreground" : "text-stone-500"}`}>
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Default profile selection */}
          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 dark:text-stone-500 mb-4 pl-4">Perfil Operacional Padrão</h3>
            <div className="bg-card rounded-[2.5rem] p-8 shadow-xl border border-border">
              <p className="text-xs text-stone-400 mb-6 px-1">Define qual conta será selecionada automaticamente ao cadastrar novos lançamentos.</p>
              <div className="flex gap-4">
                {[
                  { id: "hector", label: "Hector" },
                  { id: "vitoria", label: "Vitória" },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setDefaultProfile(p.id)}
                    className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                      defaultProfile === p.id
                        ? "border-emerald-500 bg-emerald-50/10 text-emerald-500"
                        : "border-transparent bg-background/50 text-stone-500 hover:bg-background"
                    }`}
                  >
                    <User size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="md:col-span-4 flex flex-col gap-6">
          {/* System info */}
          <section className="bg-stone-900 dark:bg-stone-100 rounded-[2.5rem] p-8 text-white dark:text-stone-900 shadow-2xl relative overflow-hidden h-fit transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Info size={120} />
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500 dark:text-stone-400 mb-8">Informações de Build</h4>
            
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-stone-800 dark:border-stone-200 pb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Versão</span>
                <span className="text-xs font-black font-mono">2.1.0-STABLE</span>
              </div>
              <div className="flex justify-between items-center border-b border-stone-800 dark:border-stone-200 pb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Ambiente</span>
                <span className="text-xs font-black text-emerald-400 uppercase">Produção</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Sincronização</span>
                <span className="text-[10px] font-black text-emerald-400 px-2 py-1 bg-emerald-400/10 rounded-full uppercase tracking-tighter">ONLINE</span>
              </div>
            </div>
          </section>

          <button 
            onClick={handleSave}
            className="group w-full bg-emerald-500 hover:bg-emerald-400 text-white p-8 rounded-[2.5rem] shadow-xl flex flex-col items-center gap-3 transition-all hover:scale-105 active:scale-95"
          >
            <Save size={32} className="group-hover:rotate-12 transition-transform" />
            <span className="text-xs font-black uppercase tracking-[0.3em]">Salvar Alterações</span>
          </button>
        </div>
      </div>
    </main>
  );
}
