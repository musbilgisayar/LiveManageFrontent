export type Currency = "CHF" | "EUR" | "TRY";

export type PaymentStatus = "posted" | "draft" | "cancelled";

export type PaymentTabValue = "all" | "posted" | "draft";

export type PaymentSortValue =
  | "date_desc"
  | "date_asc"
  | "amount_desc"
  | "amount_asc"
  | "payer_asc";

export type PaymentViewMode = "grid" | "list";

export interface PaymentItem {
  id: string;
  payerName: string;
  unit?: string;
  amount: number;
  currency: Currency;
  paymentDate: string;
  paymentMethod: string;
  cashAccount: string;
  receiptNo?: string;
  description?: string;
  status: PaymentStatus;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface PaymentFormValues {
  payerName: string;
  unit: string;
  amount: string;
  currency: Currency;
  paymentDate: string;
  paymentMethod: string;
  cashAccount: string;
  receiptNo: string;
  description: string;
  status: PaymentStatus;
}

export interface PaymentFormErrors {
  payerName?: string;
  amount?: string;
  paymentDate?: string;
  paymentMethod?: string;
  cashAccount?: string;
}

export interface PaymentStatusOption {
  value: PaymentStatus;
  label: string;
  color: string;
}

export interface PaymentMethodOption {
  value: string;
  icon: string;
  label: string;
}

export interface CashAccountOption {
  value: string;
  icon: string;
  label: string;
}