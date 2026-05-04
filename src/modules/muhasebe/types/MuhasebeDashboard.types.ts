export type MuhasebePeriodStatus = "draft" | "published" | "closed" | "cancelled";

export type MuhasebeCashAccountType =
  | "cash"
  | "bank"
  | "postfinance"
  | "twint"
  | "other";

export type MuhasebePaymentStatus = "completed" | "cancelled" | "reversed";

export type MuhasebeExpenseStatus = "draft" | "approved" | "paid" | "cancelled";

export type MuhasebeDashboardSummaryDto = {
  propertyId: string;
  propertyName: string;

  activePeriod?: {
    id: string;
    name: string;
    status: MuhasebePeriodStatus;
    startDate: string;
    endDate: string;
    dueDate?: string;
  };

  totals: {
    totalCharged: number;
    totalCollected: number;
    outstandingAmount: number;
    overdueAmount: number;
    totalExpense: number;
    cashBalance: number;
    collectionRate: number;
    currency: string;
  };

  cashAccounts: {
    id: string;
    name: string;
    type: MuhasebeCashAccountType;
    balance: number;
    currency: string;
  }[];

  recentPayments: {
    id: string;
    unitLabel: string;
    payerName?: string;
    amount: number;
    currency: string;
    paymentDate: string;
    method: string;
    status: MuhasebePaymentStatus;
  }[];

  recentExpenses: {
    id: string;
    category: string;
    vendorName?: string;
    amount: number;
    currency: string;
    expenseDate: string;
    status: MuhasebeExpenseStatus;
  }[];

  overdueCharges: {
    id: string;
    unitLabel: string;
    ownerName?: string;
    amount: number;
    paidAmount: number;
    remainingAmount: number;
    dueDate: string;
    daysOverdue: number;
  }[];
};