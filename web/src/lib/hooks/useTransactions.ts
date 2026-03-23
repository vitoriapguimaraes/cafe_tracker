"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabase";
import type { Transaction, TransactionInsert } from "../database.types";

// Returns start/end ISO strings for a given year+month (1-indexed)
export function getMonthRange(year: number, month: number) {
  const start = new Date(year, month - 1, 1).toISOString();
  const end = new Date(year, month, 0, 23, 59, 59).toISOString();
  return { start, end };
}

export function useTransactions(year: number, month: number) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    const { start, end } = getMonthRange(year, month);

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .gte("date", start)
      .lte("date", end)
      .order("date", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setTransactions(data ?? []);
    }
    setLoading(false);
  }, [year, month]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  async function addTransaction(data: TransactionInsert) {
    const { error } = await (supabase.from("transactions") as any).insert(data);
    if (!error) {
      await fetchTransactions(); // Refresh list
    }
    return { error };
  }

  return {
    transactions,
    loading,
    error,
    addTransaction,
    refresh: fetchTransactions,
  };
}
