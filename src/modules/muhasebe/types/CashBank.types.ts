export type CashBankTab = "summary" | "accounts" | "transactions" | "transfers";

export type CashBankAccountType = "cash" | "bank";

export type CashBankAccountStatus = "active" | "inactive";

export type CashBankTransactionType =
  | "income"
  | "expense"
  | "transfer-in"
  | "transfer-out"
  | "correction";

export type CashBankTransactionStatus =
  | "completed"
  | "pending"
  | "cancelled"
  | "reversed";

export type CashBankTransferStatus =
  | "completed"
  | "pending"
  | "cancelled";

export interface CashBankAccount {
  id: string;
  name: string;
  code: string;
  type: CashBankAccountType;
  bankName?: string;
  iban?: string;
  currency: string;
  balance: number;
  status: CashBankAccountStatus;
  isDefault: boolean;
  description?: string;
  lastTransactionAt?: string;
}

export interface CashBankTransaction {
  id: string;
  transactionNo: string;
  accountId: string;
  accountName: string;
  type: CashBankTransactionType;
  status: CashBankTransactionStatus;
  amount: number;
  currency: string;
  description: string;
  sourceModule:
    | "payment"
    | "expense"
    | "income"
    | "transfer"
    | "manual"
    | "correction";
  sourceReference?: string;
  occurredAt: string;
  createdBy: string;
}

export interface CashBankTransfer {
  id: string;
  transferNo: string;
  fromAccountId: string;
  fromAccountName: string;
  toAccountId: string;
  toAccountName: string;
  amount: number;
  currency: string;
  status: CashBankTransferStatus;
  description?: string;
  transferredAt: string;
  createdBy: string;
}

export interface CashBankSummary {
  totalBalance: number;
  cashBalance: number;
  bankBalance: number;
  monthlyTransactionCount: number;
  currency: string;
}