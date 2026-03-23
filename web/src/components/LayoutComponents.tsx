"use client";

import { ReactNode } from "react";
import clsx from "clsx";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <main 
      className={clsx(
        "min-h-screen-dvh bg-background text-foreground font-sans p-6 md:p-12 w-full max-w-[1400px] mx-auto flex flex-col mb-20 md:mb-0 transition-colors duration-300",
        className
      )}
    >
      {children}
    </main>
  );
}

interface SectionCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "dark" | "flat";
}

export function SectionCard({ children, className, variant = "default" }: SectionCardProps) {
  const variants = {
    default: "bg-card border border-border shadow-xl",
    dark: "bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-2xl",
    flat: "bg-card border border-border shadow-sm",
  };

  return (
    <div className={clsx(
      "rounded-3xl transition-all overflow-hidden",
      variants[variant],
      className
    )}>
      {children}
    </div>
  );
}

export function PageHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <header className={clsx("flex items-center justify-between mb-10 mt-2", className)}>
      {children}
    </header>
  );
}
