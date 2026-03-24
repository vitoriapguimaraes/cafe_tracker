"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Wallet, 
  PlusCircle, 
  TrendingUp, 
  Settings,
  Coffee,
  Building2,
  Ticket,
  Receipt,
} from "lucide-react";
import clsx from "clsx";

import { ThemeToggle } from "./ThemeToggle";
import { supabase } from "../lib/supabase";

const MENU_ITEMS = [
  { icon: PlusCircle, label: "Registrar Gasto", href: "/add", primary: true },
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: Receipt, label: "Extrato", href: "/transactions" },
  { icon: Wallet, label: "Saldos", href: "/balances" },
  { icon: Building2, label: "Bancos & Contas", href: "/accounts" },
  { icon: Ticket, label: "Categorias", href: "/categories" },
  { icon: TrendingUp, label: "Previsões", href: "/forecasts" },
  { icon: Settings, label: "Configurações", href: "/settings" },
];

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col bg-card border-r border-border h-screen sticky top-0 p-6 shadow-sm transition-colors duration-300">
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="w-10 h-10 bg-stone-800 dark:bg-stone-200 rounded-xl flex items-center justify-center text-white dark:text-stone-900 shadow-xl">
          <Coffee size={24} />
        </div>
        <div>
          <h1 className="font-black text-xl text-stone-800 dark:text-stone-100 tracking-tighter uppercase leading-none">Portal</h1>
          <h1 className="font-black text-xl text-stone-300 dark:text-stone-600 tracking-widest uppercase leading-none">Cafe</h1>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          
          if (item.primary) {
            return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-3 px-4 py-4 rounded-2xl font-black transition-all group mb-4",
                    "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-none hover:scale-[1.02] active:scale-[0.98]"
                  )}
                >
                  <item.icon size={22} strokeWidth={3} className="text-white" />
                  <span className="uppercase text-[10px] tracking-[0.2em]">{item.label}</span>
                </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all group",
                isActive 
                  ? "bg-stone-800 dark:bg-stone-100 text-white dark:text-stone-950 shadow-lg shadow-stone-200 dark:shadow-none" 
                  : "text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900 hover:text-stone-800 dark:hover:text-stone-100"
              )}
            >
              <item.icon size={20} className={clsx(isActive ? "text-white dark:text-stone-950" : "text-stone-400 dark:text-stone-500 group-hover:text-stone-800 dark:group-hover:text-stone-100 transition-colors")} />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-border flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 dark:text-stone-400 text-xs font-bold">
            H
            </div>
            <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground leading-none">H & V</span>
            <span className="text-[10px] text-stone-400 uppercase font-medium mt-1">Premium</span>
            </div>
        </div>
        <ThemeToggle />
      </div>
    </aside>
  );
}
