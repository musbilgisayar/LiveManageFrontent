import { format } from "date-fns";

import type {
  IncomeCategoryOption,
  IncomeCurrency,
  IncomeItem,
  IncomeStatus,
  IncomeStatusOption,
} from "@/modules/muhasebe/types/income.types";

export const INCOME_STATUS_OPTIONS: IncomeStatusOption[] = [
  { value: "posted", label: "Kesinleşti", color: "#10b981" },
  { value: "draft", label: "Taslak", color: "#f59e0b" },
  { value: "cancelled", label: "İptal", color: "#ef4444" },
];

export const INCOME_CATEGORY_OPTIONS: IncomeCategoryOption[] = [
  { value: "Kira Geliri", label: "Kira Geliri", color: "#10b981" },
  { value: "Ortak Alan Geliri", label: "Ortak Alan Geliri", color: "#3b82f6" },
  { value: "Ceza / Gecikme Geliri", label: "Ceza / Gecikme Geliri", color: "#f59e0b" },
  { value: "Diğer Gelir", label: "Diğer Gelir", color: "#8b5cf6" },
];

export const mockIncomes: IncomeItem[] = [
  {
    id: "1",
    category: "Kira Geliri",
    customerName: "Migros",
    incomeDate: "2026-05-02",
    amount: 1200,
    currency: "CHF",
    paymentMethod: "Banka Havalesi",
    invoiceNo: "INC-2026-001",
    description: "Ortak alan kira geliri",
    status: "posted",
    isArchived: false,
    createdAt: "2026-05-02T11:00:00Z",
    updatedAt: "2026-05-02T11:00:00Z",
    createdBy: "Admin",
  },
  {
    id: "2",
    category: "Ortak Alan Geliri",
    customerName: "Kiosk AG",
    incomeDate: "2026-05-05",
    amount: 450,
    currency: "CHF",
    paymentMethod: "TWINT",
    invoiceNo: "INC-2026-002",
    description: "Ortak alan kullanım bedeli",
    status: "posted",
    isArchived: false,
    createdAt: "2026-05-05T09:20:00Z",
    updatedAt: "2026-05-05T09:20:00Z",
    createdBy: "Admin",
  },
  {
    id: "3",
    category: "Diğer Gelir",
    customerName: "Ahmet Yılmaz",
    incomeDate: "2026-05-08",
    amount: 180,
    currency: "CHF",
    paymentMethod: "Nakit",
    invoiceNo: "INC-2026-003",
    description: "Geçici kullanım bedeli",
    status: "draft",
    isArchived: false,
    createdAt: "2026-05-08T15:10:00Z",
    updatedAt: "2026-05-08T15:10:00Z",
    createdBy: "Admin",
  },
];

export function formatIncomeMoney(amount: number, currency: IncomeCurrency) {
  const symbol = currency === "CHF" ? "₣" : currency === "EUR" ? "€" : "₺";

  return `${symbol} ${amount.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatIncomeDate(date: string) {
  return new Date(date).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatIncomeShortDate(date: string) {
  return format(new Date(date), "dd.MM.yyyy");
}

export function createIncomeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getIncomeStatusLabel(status: IncomeStatus | string) {
  if (status === "posted") return "Kesinleşti";
  if (status === "draft") return "Taslak";
  if (status === "cancelled") return "İptal";

  return status;
}

export function getIncomeCategoryColor(category: string) {
  return (
    INCOME_CATEGORY_OPTIONS.find((option) => option.value === category)?.color ??
    "#10b981"
  );
}

export function downloadIncomesCsv(items: IncomeItem[]) {
  const headers = [
    "ID",
    "Kategori",
    "Ödeyen",
    "Tutar",
    "Para Birimi",
    "Tarih",
    "Durum",
    "Ödeme Yöntemi",
    "Belge No",
    "Açıklama",
    "Oluşturma Tarihi",
  ];

  const rows = items.map((item) => [
    item.id,
    item.category,
    item.customerName,
    String(item.amount),
    item.currency,
    item.incomeDate,
    getIncomeStatusLabel(item.status),
    item.paymentMethod,
    item.invoiceNo ?? "",
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
  link.download = `gelirler-${format(new Date(), "yyyy-MM-dd")}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}