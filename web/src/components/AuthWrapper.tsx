"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { usePathname, useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

export default function AuthWrapper({ 
  children, 
  sidebar, 
  bottomNav 
}: { 
  children: React.ReactNode;
  sidebar: React.ReactNode;
  bottomNav: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (!session && pathname !== "/login") {
        router.push("/login");
      }
      setLoading(false);
    }

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session && pathname !== "/login") {
        router.push("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-800"></div>
      </div>
    );
  }

  // Se estiver na tela de login, renderiza apenas o conteúdo (sem sidebar/nav)
  if (pathname === "/login") {
    return (
      <main className="w-full min-h-screen">
        {children}
      </main>
    );
  }

  // Se não tiver usuário, não renderiza nada (o useEffect redirecionará)
  if (!user) return null;

  return (
    <>
      {sidebar}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
        {children}
      </main>
      {bottomNav}
    </>
  );
}
