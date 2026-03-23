"use client";

import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import type { Category } from "../database.types";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("group_name")
        .order("name");

      if (error) {
        setError(error.message);
      } else {
        setCategories(data ?? []);
      }
      setLoading(false);
    }

    fetchCategories();
  }, []);

  async function updateCategory(id: string, updates: Partial<Category>) {
    const { error } = await (supabase.from("categories") as any)
      .update(updates)
      .eq("id", id);

    if (!error) {
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      );
    }
    return { error };
  }

  async function updateBudgetLimit(id: string, newLimit: number) {
    return updateCategory(id, { budget_limit: newLimit });
  }

  async function addCategory(category: Omit<Category, "id" | "created_at">) {
    const { data, error } = await (supabase.from("categories") as any)
      .insert(category as any)
      .select()
      .single();

    if (!error && data) {
      setCategories((prev) =>
        [...prev, data].sort((a, b) => {
          const g = (a.group_name || "").localeCompare(b.group_name || "");
          return g !== 0 ? g : a.name.localeCompare(b.name);
        }),
      );
    }
    return { error };
  }

  async function deleteCategory(id: string) {
    const { error } = await (supabase.from("categories") as any)
      .delete()
      .eq("id", id);

    if (!error) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
    return { error };
  }

  return {
    categories,
    loading,
    error,
    updateCategory,
    updateBudgetLimit,
    addCategory,
    deleteCategory,
  };
}
