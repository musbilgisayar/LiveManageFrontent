import {
  CashBankAccount,
  CashBankTransaction,
  CashBankTransfer,
  CashBankSummary,
} from "../types/CashBank.types";

// ==============================
// SUMMARY
// ==============================
export const CASH_BANK_SUMMARY: CashBankSummary = {
  totalBalance: 248750,
  cashBalance: 42500,
  bankBalance: 206250,
  monthlyTransactionCount: 128,
  currency: "TRY",
};

// ==============================
// ACCOUNTS
// ==============================
export const CASH_BANK_ACCOUNTS: CashBankAccount[] = [
  {
    id: "acc-1",
    name: "Merkez Kasa",
    code: "KASA-001",
    type: "cash",
    currency: "TRY",
    balance: 42500,
    status: "active",
    isDefault: true,
    description: "Ana kasa hesabı",
    lastTransactionAt: "2026-05-05T10:30:00",
  },
  {
    id: "acc-2",
    name: "Ziraat Bankası",
    code: "BANK-001",
    type: "bank",
    bankName: "Ziraat Bankası",
    iban: "TR00 0000 0000 0000 0000 0000 01",
    currency: "TRY",
    balance: 120000,
    status: "active",
    isDefault: false,
    description: "Ana banka hesabı",
    lastTransactionAt: "2026-05-04T15:00:00",
  },
  {
    id: "acc-3",
    name: "İş Bankası",
    code: "BANK-002",
    type: "bank",
    bankName: "İş Bankası",
    iban: "TR00 0000 0000 0000 0000 0000 02",
    currency: "TRY",
    balance: 86250,
    status: "active",
    isDefault: false,
    description: "Yedek banka hesabı",
    lastTransactionAt: "2026-05-03T11:20:00",
  },
];

// ==============================
// TRANSACTIONS
// ==============================
export const CASH_BANK_TRANSACTIONS: CashBankTransaction[] = [
  {
    id: "txn-1",
    transactionNo: "TXN-20260505-001",
    accountId: "acc-1",
    accountName: "Merkez Kasa",
    type: "income",
    status: "completed",
    amount: 5000,
    currency: "TRY",
    description: "Aidat tahsilatı",
    sourceModule: "payment",
    sourceReference: "PAY-001",
    occurredAt: "2026-05-05T10:30:00",
    createdBy: "Admin",
  },
  {
    id: "txn-2",
    transactionNo: "TXN-20260504-002",
    accountId: "acc-2",
    accountName: "Ziraat Bankası",
    type: "expense",
    status: "completed",
    amount: 2500,
    currency: "TRY",
    description: "Elektrik faturası",
    sourceModule: "expense",
    sourceReference: "EXP-001",
    occurredAt: "2026-05-04T15:00:00",
    createdBy: "Admin",
  },
  {
    id: "txn-3",
    transactionNo: "TXN-20260503-003",
    accountId: "acc-2",
    accountName: "Ziraat Bankası",
    type: "transfer-out",
    status: "completed",
    amount: 10000,
    currency: "TRY",
    description: "Kasa transfer",
    sourceModule: "transfer",
    sourceReference: "TRF-001",
    occurredAt: "2026-05-03T11:20:00",
    createdBy: "Admin",
  },
];

// ==============================
// TRANSFERS
// ==============================
export const CASH_BANK_TRANSFERS: CashBankTransfer[] = [
  {
    id: "trf-1",
    transferNo: "TRF-20260503-001",
    fromAccountId: "acc-2",
    fromAccountName: "Ziraat Bankası",
    toAccountId: "acc-1",
    toAccountName: "Merkez Kasa",
    amount: 10000,
    currency: "TRY",
    status: "completed",
    description: "Banka → Kasa transferi",
    transferredAt: "2026-05-03T11:20:00",
    createdBy: "Admin",
  },
];