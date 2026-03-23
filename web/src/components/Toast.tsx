"use client";

import { useEffect, useState } from "react";

export type ToastType = "success" | "error";

interface ToastProps {
  message: string;
  type: ToastType;
  onDismiss: () => void;
}

export function Toast({ message, type, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={`fixed bottom-28 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-2xl shadow-xl text-sm font-bold flex items-center gap-2 animate-fade-in-up transition-all
        ${type === "success" ? "bg-emerald-600 text-white" : "bg-red-500 text-white"}`}
    >
      <span>{type === "success" ? "✅" : "❌"}</span>
      <span>{message}</span>
    </div>
  );
}

// Hook to manage toast state easily
export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  function showToast(message: string, type: ToastType = "success") {
    setToast({ message, type });
  }

  function dismissToast() {
    setToast(null);
  }

  return { toast, showToast, dismissToast };
}
