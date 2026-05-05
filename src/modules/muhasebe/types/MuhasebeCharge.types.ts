export type Currency = "CHF" | "EUR" | "TRY";

export type ChargeStatus = "draft" | "posted" | "cancelled";

export type PaymentState = "unpaid" | "partial" | "paid";

export type ChargeType = "dues" | "penalty" | "shared_expense" | "special";

export type ChargeTabValue = "all" | "draft" | "posted" | "overdue" | "partial";

export type ChargeSortValue =
  | "due_desc"
  | "due_asc"
  | "amount_desc"
  | "amount_asc"
  | "unit_asc";

export type ChargeViewMode = "grid" | "list";

export type TabValue = ChargeTabValue;
export type SortValue = ChargeSortValue;
export type ViewMode = ChargeViewMode;

export interface ChargeUnitOption {
  unit: string;
  block: string;
  residentName: string;
}

export interface ChargeItem {
  id: string;
  period: string;
  unit: string;
  block: string;
  residentName: string;
  chargeType: ChargeType;
  chargeTypeLabel: string;
  amount: number;
  paidAmount: number;
  currency: Currency;
  dueDate: string;
  status: ChargeStatus;
  description?: string;
  referenceNo?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ChargeFormValues {
  period: string;
  unit: string;
  block: string;
  residentName: string;
  chargeType: ChargeType;
  amount: string;
  currency: Currency;
  dueDate: string;
  description: string;
  status: ChargeStatus;
}

export interface ChargeFormErrors {
  period?: string;
  unit?: string;
  residentName?: string;
  amount?: string;
  dueDate?: string;
}

export interface BulkFormValues {
  period: string;
  scope: "all" | "block" | "selected";
  block: string;
  chargeType: ChargeType;
  amount: string;
  currency: Currency;
  dueDate: string;
  description: string;
}

export interface BulkFormErrors {
  period?: string;
  amount?: string;
  dueDate?: string;
}

export interface ChargeStats {
  total: number;
  draft: number;
  posted: number;
  overdue: number;
  partial: number;
  totalDebt: number;
  totalPaid: number;
  totalRemaining: number;
}