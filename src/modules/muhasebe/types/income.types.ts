export type IncomeCurrency = "CHF" | "EUR" | "TRY";

export type IncomeStatus = "posted" | "draft" | "cancelled";

export type IncomeTabValue = "all" | "posted" | "draft";

export type IncomeSortValue =
  | "date_desc"
  | "date_asc"
  | "amount_desc"
  | "amount_asc"
  | "customer_asc";

export type IncomeViewMode = "grid" | "list";

export interface IncomeItem {
  id: string;
  category: string;
  customerName: string;
  incomeDate: string;
  amount: number;
  currency: IncomeCurrency;
  paymentMethod: string;
  invoiceNo?: string;
  description?: string;
  status: IncomeStatus;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface IncomeStatusOption {
  value: IncomeStatus;
  label: string;
  color: string;
}

export interface IncomeCategoryOption {
  value: string;
  label: string;
  color: string;
}