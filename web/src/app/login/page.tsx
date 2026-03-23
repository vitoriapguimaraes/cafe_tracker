"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useToast, Toast } from "../../components/Toast";
import { Coffee, LogIn } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast, showToast, dismissToast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      showToast(error.message === "Invalid login credentials" ? "E-mail ou senha incorretos" : error.message, "error");
    } else {
      window.location.href = "/";
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center p-6 transition-colors duration-500">
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />}
      
      <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-[2.5rem] p-10 shadow-2xl border border-stone-100 dark:border-stone-800 flex flex-col items-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-stone-900 dark:bg-stone-100 rounded-3xl flex items-center justify-center text-white dark:text-stone-900 shadow-2xl mb-8 rotate-3 transform transition-transform hover:rotate-0">
          <Coffee size={40} />
        </div>
        
        <div className="text-center mb-10">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 mb-1 leading-none">Security Access</span>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-foreground leading-[0.9]">Portal Cafe</h1>
        </div>

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">E-mail</label>
            <input
              type="email"
              placeholder="Digite seu e-mail"
              className="bg-stone-50 dark:bg-stone-950 border border-border rounded-2xl px-5 py-4 font-bold text-foreground outline-none focus:border-stone-500 transition-all placeholder:text-stone-300 dark:placeholder:text-stone-700"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              className="bg-stone-50 dark:bg-stone-950 border border-border rounded-2xl px-5 py-4 font-bold text-foreground outline-none focus:border-stone-500 transition-all placeholder:text-stone-300 dark:placeholder:text-stone-700"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-black py-5 rounded-3xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
               <div className="w-5 h-5 border-2 border-white dark:border-stone-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={20} />
                <span className="uppercase tracking-widest text-sm">Acessar Sistema</span>
              </>
            )}
          </button>
        </form>

        <p className="mt-10 text-[10px] font-bold text-stone-300 dark:text-stone-700 uppercase tracking-widest">
          © 2025 Cafe · Família H&V
        </p>
      </div>
    </main>
  );
}
