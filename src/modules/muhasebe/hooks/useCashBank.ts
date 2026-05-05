//src/modules/muhasebe/hooks/useCashBank.ts
"use client";

import { useMemo, useState } from "react";

import {
  CASH_BANK_ACCOUNTS,
  CASH_BANK_TRANSACTIONS,
  CASH_BANK_TRANSFERS,
} from "@/modules/muhasebe/utils/cashBankMockData";

import type {
  CashBankAccount,
  CashBankAccountType,
  CashBankTab,
  CashBankTransaction,
  CashBankTransfer,
} from "@/modules/muhasebe/types/CashBank.types";

import type { AccountingViewMode } from "@/modules/muhasebe/components/shared/AccountingViewToggle";
import type { CashAccountCreatePayload } from "@/modules/muhasebe/components/cash-bank/CashAccountCreateDrawer";
import type { CashTransactionCreatePayload } from "@/modules/muhasebe/components/cash-bank/CashTransactionCreateDrawer";
import type { CashTransferCreatePayload } from "@/modules/muhasebe/components/cash-bank/CashTransferCreateDrawer";

type AccountTypeFilter = "all" | CashBankAccountType;
type TransactionTypeFilter = "all" | "income" | "expense" | "transfer";

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function useCashBank() {
  const [activeTab, setActiveTab] = useState<CashBankTab>("summary");
  const [viewMode, setViewMode] = useState<AccountingViewMode>("grid");

  const [rawAccounts, setRawAccounts] =
    useState<CashBankAccount[]>(CASH_BANK_ACCOUNTS);

  const [rawTransactions, setRawTransactions] =
    useState<CashBankTransaction[]>(CASH_BANK_TRANSACTIONS);

  const [rawTransfers, setRawTransfers] =
    useState<CashBankTransfer[]>(CASH_BANK_TRANSFERS);

  const [searchText, setSearchText] = useState("");
  const [selectedAccountType, setSelectedAccountType] =
    useState<AccountTypeFilter>("all");
  const [selectedTransactionType, setSelectedTransactionType] =
    useState<TransactionTypeFilter>("all");

  const normalizedSearch = searchText.trim().toLowerCase();

  const summary = useMemo(() => {
    const cashBalance = rawAccounts
      .filter((account) => account.type === "cash")
      .reduce((total, account) => total + account.balance, 0);

    const bankBalance = rawAccounts
      .filter((account) => account.type === "bank")
      .reduce((total, account) => total + account.balance, 0);

    return {
      totalBalance: cashBalance + bankBalance,
      cashBalance,
      bankBalance,
      monthlyTransactionCount: rawTransactions.length,
      currency: rawAccounts[0]?.currency ?? "TRY",
    };
  }, [rawAccounts, rawTransactions.length]);

  const accounts = useMemo<CashBankAccount[]>(() => {
    return rawAccounts.filter((account) => {
      const matchesSearch =
        !normalizedSearch ||
        account.name.toLowerCase().includes(normalizedSearch) ||
        account.code.toLowerCase().includes(normalizedSearch) ||
        account.bankName?.toLowerCase().includes(normalizedSearch) ||
        account.iban?.toLowerCase().includes(normalizedSearch);

      const matchesType =
        selectedAccountType === "all" || account.type === selectedAccountType;

      return matchesSearch && matchesType;
    });
  }, [rawAccounts, normalizedSearch, selectedAccountType]);

  const transactions = useMemo<CashBankTransaction[]>(() => {
    return rawTransactions.filter((transaction) => {
      const matchesSearch =
        !normalizedSearch ||
        transaction.transactionNo.toLowerCase().includes(normalizedSearch) ||
        transaction.accountName.toLowerCase().includes(normalizedSearch) ||
        transaction.description.toLowerCase().includes(normalizedSearch) ||
        transaction.sourceReference?.toLowerCase().includes(normalizedSearch);

      const matchesType =
        selectedTransactionType === "all" ||
        (selectedTransactionType === "transfer"
          ? transaction.type === "transfer-in" ||
            transaction.type === "transfer-out"
          : transaction.type === selectedTransactionType);

      return matchesSearch && matchesType;
    });
  }, [rawTransactions, normalizedSearch, selectedTransactionType]);

  const transfers = useMemo<CashBankTransfer[]>(() => {
    return rawTransfers.filter((transfer) => {
      return (
        !normalizedSearch ||
        transfer.transferNo.toLowerCase().includes(normalizedSearch) ||
        transfer.fromAccountName.toLowerCase().includes(normalizedSearch) ||
        transfer.toAccountName.toLowerCase().includes(normalizedSearch) ||
        transfer.description?.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [rawTransfers, normalizedSearch]);

  const addAccount = (payload: CashAccountCreatePayload) => {
    const newAccount: CashBankAccount = {
      id: createId("acc"),
      name: payload.name,
      code: payload.code,
      type: payload.type,
      bankName: payload.bankName,
      iban: payload.iban,
      currency: payload.currency,
      balance: payload.openingBalance,
      status: "active",
      isDefault: false,
      description: payload.description,
      lastTransactionAt: undefined,
    };

    setRawAccounts((prev) => [newAccount, ...prev]);
  };

  const addTransaction = (payload: CashTransactionCreatePayload) => {
    const account = rawAccounts.find((item) => item.id === payload.accountId);
    if (!account) return;

    const signedAmount =
      payload.type === "income" ? payload.amount : -payload.amount;

    setRawAccounts((prev) =>
      prev.map((item) =>
        item.id === payload.accountId
          ? {
              ...item,
              balance: item.balance + signedAmount,
              lastTransactionAt: payload.occurredAt,
            }
          : item,
      ),
    );

    const newTransaction: CashBankTransaction = {
      id: createId("txn"),
      transactionNo: `TXN-${Date.now()}`,
      accountId: payload.accountId,
      accountName: account.name,
      type: payload.type,
      status: "completed",
      amount: payload.amount,
      currency: payload.currency,
      description: payload.description,
      sourceModule: payload.sourceModule,
      sourceReference: payload.sourceReference,
      occurredAt: payload.occurredAt,
      createdBy: "Admin",
    };

    setRawTransactions((prev) => [newTransaction, ...prev]);
  };

  const addTransfer = (payload: CashTransferCreatePayload) => {
    const fromAccount = rawAccounts.find(
      (item) => item.id === payload.fromAccountId,
    );
    const toAccount = rawAccounts.find(
      (item) => item.id === payload.toAccountId,
    );

    if (!fromAccount || !toAccount) return;

    setRawAccounts((prev) =>
      prev.map((item) => {
        if (item.id === fromAccount.id) {
          return {
            ...item,
            balance: item.balance - payload.amount,
            lastTransactionAt: payload.transferredAt,
          };
        }

        if (item.id === toAccount.id) {
          return {
            ...item,
            balance: item.balance + payload.amount,
            lastTransactionAt: payload.transferredAt,
          };
        }

        return item;
      }),
    );

    const newTransfer: CashBankTransfer = {
      id: createId("trf"),
      transferNo: `TRF-${Date.now()}`,
      fromAccountId: fromAccount.id,
      fromAccountName: fromAccount.name,
      toAccountId: toAccount.id,
      toAccountName: toAccount.name,
      amount: payload.amount,
      currency: payload.currency,
      status: "completed",
      description: payload.description,
      transferredAt: payload.transferredAt,
      createdBy: "Admin",
    };

    setRawTransfers((prev) => [newTransfer, ...prev]);

    setRawTransactions((prev) => [
      {
        id: createId("txn"),
        transactionNo: `TXN-${Date.now()}-OUT`,
        accountId: fromAccount.id,
        accountName: fromAccount.name,
        type: "transfer-out",
        status: "completed",
        amount: payload.amount,
        currency: payload.currency,
        description: payload.description ?? "Hesaplar arası transfer çıkışı",
        sourceModule: "transfer",
        sourceReference: newTransfer.transferNo,
        occurredAt: payload.transferredAt,
        createdBy: "Admin",
      },
      {
        id: createId("txn"),
        transactionNo: `TXN-${Date.now()}-IN`,
        accountId: toAccount.id,
        accountName: toAccount.name,
        type: "transfer-in",
        status: "completed",
        amount: payload.amount,
        currency: payload.currency,
        description: payload.description ?? "Hesaplar arası transfer girişi",
        sourceModule: "transfer",
        sourceReference: newTransfer.transferNo,
        occurredAt: payload.transferredAt,
        createdBy: "Admin",
      },
      ...prev,
    ]);
  };

  const resetFilters = () => {
    setSearchText("");
    setSelectedAccountType("all");
    setSelectedTransactionType("all");
  };

  return {
    summary,

    accounts,
    transactions,
    transfers,

    activeTab,
    setActiveTab,

    viewMode,
    setViewMode,

    searchText,
    setSearchText,

    selectedAccountType,
    setSelectedAccountType,

    selectedTransactionType,
    setSelectedTransactionType,

    addAccount,
    addTransaction,
    addTransfer,

    resetFilters,
  };
}