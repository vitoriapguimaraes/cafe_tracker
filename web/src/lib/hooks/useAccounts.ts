"use client";

import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import type { Account } from "../database.types";

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAccounts() {
      setLoading(true);
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .order("owner")
        .order("type");

      if (error) {
        setError(error.message);
      } else {
        setAccounts(data ?? []);
      }
      setLoading(false);
    }

    fetchAccounts();
  }, []);

  async function updateAccount(id: string, updates: Partial<Account>) {
    const { error } = await (supabase.from("accounts") as any)
      .update(updates)
      .eq("id", id);

    if (!error) {
      setAccounts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updates } : a)),
      );
    }
    return { error };
  }

  async function addAccount(account: Omit<Account, "id" | "created_at">) {
    const { data, error } = await (supabase.from("accounts") as any)
      .insert(account as any)
      .select()
      .single();

    if (!error && data) {
      setAccounts((prev) => [...prev, data].sort((a, b) => a.owner.localeCompare(b.owner)));
    }
    return { error };
  }

  async function deleteAccount(id: string) {
    const { error } = await (supabase.from("accounts") as any)
      .delete()
      .eq("id", id);

    if (!error) {
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    }
    return { error };
  }

  return { 
    accounts, 
    loading, 
    error,
    updateAccount,
    addAccount,
    deleteAccount
  };
}
