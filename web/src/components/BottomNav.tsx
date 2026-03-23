"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutGrid, Wallet, Plus, Settings, Receipt } from "lucide-react";
import clsx from "clsx";

const NavItem = ({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: any;
  label: string;
  active: boolean;
}) => (
  <Link
    href={href}
    className={clsx(
      "flex flex-col items-center justify-center gap-1 min-w-[60px] transition-all",
      active ? "text-foreground" : "text-stone-400 dark:text-stone-600 hover:text-stone-600 dark:hover:text-stone-400",
    )}
  >
    <Icon size={20} strokeWidth={active ? 3 : 2} className={clsx("transition-transform", active && "scale-110")} />
    <span className={clsx("text-[8px] font-black uppercase tracking-widest transition-all", active ? "opacity-100" : "opacity-40")}>
      {label}
    </span>
  </Link>
);

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav 
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.5rem)' }}
      className="fixed bottom-0 left-0 right-0 bg-card/80 dark:bg-stone-900/80 backdrop-blur-2xl border-t border-border py-4 px-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] z-[100] md:hidden transition-colors duration-300"
    >
      <div className="flex justify-between items-center max-w-md mx-auto relative">
        <NavItem
          href="/"
          icon={LayoutGrid}
          label="Home"
          active={pathname === "/"}
        />

        <NavItem
          href="/extrato"
          icon={Receipt}
          label="Extrato"
          active={pathname === "/extrato"}
        />

        {/* Floating Add Button */}
        <div className="relative">
          <Link
            href="/cadastrar"
            className="bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all border-4 border-background"
          >
            <Plus size={28} strokeWidth={3} />
          </Link>
        </div>

        <NavItem
          href="/contas"
          icon={Wallet}
          label="Contas"
          active={pathname === "/contas"}
        />

        <NavItem
          href="/configurar"
          icon={Settings}
          label="Painel"
          active={pathname === "/configurar"}
        />
      </div>
    </nav>
  );
}
