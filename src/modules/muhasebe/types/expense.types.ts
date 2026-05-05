//src/modules/muhasebe/types/expense.types.ts
export type ExpenseCurrency = "CHF" | "EUR" | "TRY";

export type ExpenseStatus = "paid" | "pending" | "cancelled";

export type ExpenseTabValue = "all" | "paid" | "pending";

export type ExpenseSortValue =
  | "date_desc"
  | "date_asc"
  | "amount_desc"
  | "amount_asc"
  | "vendor_asc";

export type ExpenseViewMode = "grid" | "list";

export type ExpenseCategoryCode = string;

export interface ExpenseItem {
  id: string;
  category: ExpenseCategoryCode;
  categoryLabel: string;
  vendor: string;
  amount: number;
  currency: ExpenseCurrency;
  date: string;
  status: ExpenseStatus;
  cashAccount: string;
  invoiceNo?: string;
  description?: string;
  attachments?: string[];
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ExpenseFormValues {
  category: ExpenseCategoryCode;
  vendor: string;
  amount: string;
  currency: ExpenseCurrency;
  date: string;
  status: ExpenseStatus;
  cashAccount: string;
  invoiceNo: string;
  description: string;
}

export interface ExpenseFormErrors {
  category?: string;
  vendor?: string;
  amount?: string;
  date?: string;
  cashAccount?: string;
}

export interface ExpenseStatusOption {
  value: ExpenseStatus;
  label: string;
  color: string;
}

export interface ExpenseCashAccountOption {
  value: string;
  icon: string;
  label: string;
}