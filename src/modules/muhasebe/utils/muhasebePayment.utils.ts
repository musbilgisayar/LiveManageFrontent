import { format } from "date-fns";

import type {
  CashAccountOption,
  Currency,
  PaymentFormErrors,
  PaymentFormValues,
  PaymentItem,
  PaymentMethodOption,
  PaymentStatusOption,
} from "@/modules/muhasebe/types/payment.types";

export const PAYMENT_STATUS_OPTIONS: PaymentStatusOption[] = [
  { value: "posted", label: "Kesinleşti", color: "#10b981" },
  { value: "draft", label: "Taslak", color: "#f59e0b" },
  { value: "cancelled", label: "İptal", color: "#ef4444" },
];

export const PAYMENT_METHOD_OPTIONS: PaymentMethodOption[] = [
  { value: "Banka Havalesi", icon: "🏦", label: "Banka Havalesi" },
  { value: "Nakit", icon: "💵", label: "Nakit" },
  { value: "TWINT", icon: "📱", label: "TWINT" },
  { value: "PostFinance", icon: "📮", label: "PostFinance" },
  { value: "Kredi Kartı", icon: "💳", label: "Kredi Kartı" },
];

export const CASH_ACCOUNT_OPTIONS: CashAccountOption[] = [
  { value: "Banka Hesabı", icon: "🏦", label: "Banka Hesabı" },
  { value: "Nakit Kasa", icon: "💵", label: "Nakit Kasa" },
  { value: "TWINT", icon: "📱", label: "TWINT" },
  { value: "PostFinance", icon: "📮", label: "PostFinance" },
];

export const INITIAL_PAYMENT_FORM: PaymentFormValues = {
  payerName: "",
  unit: "",
  amount: "",
  currency: "CHF",
  paymentDate: format(new Date(), "yyyy-MM-dd"),
  paymentMethod: "Banka Havalesi",
  cashAccount: "Banka Hesabı",
  receiptNo: "",
  description: "",
  status: "posted",
};

export const mockPayments: PaymentItem[] = [
  {
    id: "1",
    payerName: "Ahmet Yılmaz",
    unit: "A Blok / Daire 5",
    amount: 250,
    currency: "CHF",
    paymentDate: "2026-05-04",
    paymentMethod: "Banka Havalesi",
    cashAccount: "Banka Hesabı",
    receiptNo: "PAY-2026-001",
    description: "Mayıs aidat ödemesi",
    status: "posted",
    isArchived: false,
    createdAt: "2026-05-04T10:00:00Z",
    updatedAt: "2026-05-04T10:00:00Z",
    createdBy: "Admin",
  },
  {
    id: "2",
    payerName: "Mehmet Demir",
    unit: "B Blok / Daire 3",
    amount: 250,
    currency: "CHF",
    paymentDate: "2026-05-04",
    paymentMethod: "Kredi Kartı",
    cashAccount: "Banka Hesabı",
    receiptNo: "PAY-2026-002",
    description: "Aidat tahsilatı",
    status: "posted",
    isArchived: false,
    createdAt: "2026-05-04T14:30:00Z",
    updatedAt: "2026-05-04T14:30:00Z",
    createdBy: "Admin",
  },
  {
    id: "3",
    payerName: "Fatma Kaya",
    unit: "C Blok / Daire 8",
    amount: 180,
    currency: "CHF",
    paymentDate: "2026-05-06",
    paymentMethod: "TWINT",
    cashAccount: "TWINT",
    receiptNo: "PAY-2026-003",
    description: "Kısmi ödeme",
    status: "draft",
    isArchived: false,
    createdAt: "2026-05-06T09:15:00Z",
    updatedAt: "2026-05-06T09:15:00Z",
    createdBy: "Admin",
  },
];

export function formatPaymentMoney(amount: number, currency: Currency) {
  const symbol = currency === "CHF" ? "₣" : currency === "EUR" ? "€" : "₺";

  return `${symbol} ${amount.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatPaymentDate(date: string) {
  return new Date(date).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatPaymentShortDate(date: string) {
  return format(new Date(date), "dd.MM.yyyy");
}

export function createPaymentId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getPaymentStatusLabel(status: string) {
  if (status === "posted") return "Kesinleşti";
  if (status === "draft") return "Taslak";
  if (status === "cancelled") return "İptal";

  return status;
}

export function validatePaymentForm(values: PaymentFormValues): PaymentFormErrors {
  const errors: PaymentFormErrors = {};

  if (!values.payerName.trim()) errors.payerName = "Ödeyen kişi zorunlu";
  if (!values.paymentDate) errors.paymentDate = "Tahsilat tarihi zorunlu";
  if (!values.paymentMethod.trim()) errors.paymentMethod = "Ödeme yöntemi zorunlu";
  if (!values.cashAccount.trim()) errors.cashAccount = "Kasa / banka hesabı zorunlu";

  const amount = Number(values.amount);

  if (!values.amount.trim()) {
    errors.amount = "Tutar zorunlu";
  } else if (Number.isNaN(amount) || amount <= 0) {
    errors.amount = "Tutar 0'dan büyük olmalı";
  }

  return errors;
}

export function toPaymentFormValues(item: PaymentItem): PaymentFormValues {
  return {
    payerName: item.payerName,
    unit: item.unit ?? "",
    amount: String(item.amount),
    currency: item.currency,
    paymentDate: item.paymentDate,
    paymentMethod: item.paymentMethod,
    cashAccount: item.cashAccount,
    receiptNo: item.receiptNo ?? "",
    description: item.description ?? "",
    status: item.status,
  };
}

export function downloadPaymentsCsv(items: PaymentItem[]) {
  const headers = [
    "ID",
    "Ödeyen",
    "Birim",
    "Tutar",
    "Para Birimi",
    "Tarih",
    "Durum",
    "Ödeme Yöntemi",
    "Kasa/Banka",
    "Makbuz No",
    "Açıklama",
    "Oluşturma Tarihi",
  ];

  const rows = items.map((item) => [
    item.id,
    item.payerName,
    item.unit ?? "",
    String(item.amount),
    item.currency,
    item.paymentDate,
    getPaymentStatusLabel(item.status),
    item.paymentMethod,
    item.cashAccount,
    item.receiptNo ?? "",
    item.description ?? "",
    format(new Date(item.createdAt), "dd.MM.yyyy HH:mm"),
  ]);

  const csvContent = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
    )
    .join("\n");

  const blob = new Blob([`\uFEFF${csvContent}`], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `tahsilatlar-${format(new Date(), "yyyy-MM-dd")}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}