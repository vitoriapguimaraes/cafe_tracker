"use client";

import { useMemo } from "react";
import type { Category, Transaction } from "../database.types";

export type BudgetStatus = "ok" | "warning" | "danger";

export interface BudgetSummaryItem {
  category: Category;
  spent: number;
  limit: number;
  remaining: number;
  percentage: number;
  status: BudgetStatus;
}

export function useBudgetSummary(
  categories: Category[],
  transactions: Transaction[],
): BudgetSummaryItem[] {
  return useMemo(() => {
    // Only categories that have a budget limit > 0
    const budgeted = categories.filter((c) => c.budget_limit > 0);

    return budgeted.map((cat) => {
      const spent = transactions
        .filter(
          (t) =>
            t.category_id === cat.id &&
            t.type === "expense" &&
            t.status === "paid",
        )
        .reduce((sum, t) => sum + t.amount, 0);

      const limit = cat.budget_limit;
      const remaining = limit - spent;
      const percentage = limit > 0 ? (spent / limit) * 100 : 0;

      let status: BudgetStatus = "ok";
      if (percentage >= 100) status = "danger";
      else if (percentage >= 80) status = "warning";

      return { category: cat, spent, limit, remaining, percentage, status };
    });
  }, [categories, transactions]);
}
