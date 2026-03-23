"use client";

import { X, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: "danger" | "warning" | "info";
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  type = "danger",
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onCancel}
      />
      
      {/* Modal Content */}
      <div className="relative bg-card border border-border w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 fade-in duration-300">
        <button 
          onClick={onCancel}
          className="absolute top-6 right-6 p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${
            type === "danger" ? "bg-rose-100 dark:bg-rose-900/30 text-rose-500" :
            type === "warning" ? "bg-amber-100 dark:bg-amber-900/30 text-amber-500" :
            "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500"
          }`}>
            <AlertTriangle size={32} />
          </div>

          <h2 className="text-xl font-black uppercase tracking-tighter text-foreground mb-2">
            {title}
          </h2>
          <p className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-8 leading-relaxed">
            {message}
          </p>

          <div className="flex flex-col w-full gap-3">
            <button
              onClick={onConfirm}
              className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-95 shadow-lg ${
                type === "danger" ? "bg-rose-500 hover:bg-rose-600 text-white" :
                type === "warning" ? "bg-amber-500 hover:bg-amber-600 text-white" :
                "bg-emerald-500 hover:bg-emerald-600 text-white"
              }`}
            >
              {confirmLabel}
            </button>
            <button
              onClick={onCancel}
              className="w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-all"
            >
              {cancelLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
