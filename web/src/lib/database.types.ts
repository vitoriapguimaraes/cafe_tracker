export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          telegram_id: number | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          telegram_id?: number | null;
          avatar_url?: string | null;
        };
        Update: {
          full_name?: string | null;
          telegram_id?: number | null;
          avatar_url?: string | null;
        };
      };
      accounts: {
        Row: {
          id: string;
          name: string;
          type: "bank" | "credit_card" | "cash";
          balance: number;
          credit_limit: number;
          invoice_due_day: number;
          owner: "hector" | "vitoria" | "shared";
          created_at: string;
        };
        Insert: {
          name: string;
          type: "bank" | "credit_card" | "cash";
          balance?: number;
          credit_limit?: number;
          invoice_due_day?: number;
          owner?: "hector" | "vitoria" | "shared";
        };
        Update: {
          balance?: number;
          credit_limit?: number;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          type: "essential" | "leisure" | "financial_goals";
          budget_limit: number;
          group_name: string;
          icon: string;
          created_at: string;
        };
        Insert: {
          name: string;
          type: "essential" | "leisure" | "financial_goals";
          budget_limit?: number;
          group_name?: string;
          icon?: string;
        };
        Update: {
          budget_limit?: number;
          group_name?: string;
          icon?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string | null;
          amount: number;
          description: string | null;
          category_id: string | null;
          account_id: string | null;
          date: string;
          type: "income" | "expense";
          status: "paid" | "pending";
          split_ratio: Json | null;
          created_at: string;
        };
        Insert: {
          user_id?: string | null;
          amount: number;
          description?: string | null;
          category_id?: string | null;
          account_id?: string | null;
          date?: string;
          type?: "income" | "expense";
          status?: "paid" | "pending";
        };
        Update: {
          amount?: number;
          description?: string | null;
          category_id?: string | null;
          status?: "paid" | "pending";
        };
      };
      goals: {
        Row: {
          id: string;
          name: string;
          target_amount: number;
          current_amount: number;
          deadline: string | null;
          created_at: string;
        };
        Insert: {
          name: string;
          target_amount: number;
          current_amount?: number;
          deadline?: string | null;
        };
        Update: {
          current_amount?: number;
          deadline?: string | null;
        };
      };
    };
  };
}

// Convenience aliases
export type Account = Database["public"]["Tables"]["accounts"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
export type Goal = Database["public"]["Tables"]["goals"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export type TransactionInsert =
  Database["public"]["Tables"]["transactions"]["Insert"];
