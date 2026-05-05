import { format } from "date-fns";

/* ================================
   TYPES
================================ */

export type Currency = "CHF" | "EUR" | "TRY";

export type ExpenseStatus = "paid" | "pending" | "cancelled";

export type ExpenseCategory = string;

export interface Expense {
  id: string;
  category: ExpenseCategory;
  categoryLabel: string;
  vendor: string;
  amount: number;
  currency: Currency;
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
  category: ExpenseCategory;
  vendor: string;
  amount: string;
  currency: Currency;
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

/* ================================
   INITIAL FORM
================================ */

export const INITIAL_EXPENSE_FORM: ExpenseFormValues = {
  category: "cleaning",
  vendor: "",
  amount: "",
  currency: "CHF",
  date: format(new Date(), "yyyy-MM-dd"),
  status: "pending",
  cashAccount: "Banka Hesabı",
  invoiceNo: "",
  description: "",
};

/* ================================
   STATUS OPTIONS
================================ */

export const EXPENSE_STATUS_OPTIONS = [
  { value: "paid", label: "Ödendi", color: "#10b981" },
  { value: "pending", label: "Bekliyor", color: "#f59e0b" },
  { value: "cancelled", label: "İptal", color: "#ef4444" },
] as const;

/* ================================
   CASH ACCOUNTS
================================ */

export const EXPENSE_CASH_ACCOUNT_OPTIONS = [
  { value: "Banka Hesabı", icon: "🏦", label: "Banka Hesabı" },
  { value: "Nakit Kasa", icon: "💵", label: "Nakit Kasa" },
  { value: "TWINT", icon: "📱", label: "TWINT" },
  { value: "PostFinance", icon: "📮", label: "PostFinance" },
  { value: "Kredi Kartı", icon: "💳", label: "Kredi Kartı" },
];

/* ================================
   CATEGORY COLORS (UI SAFE)
================================ */

export const EXPENSE_CATEGORY_COLORS: Record<string, string> = {
  cleaning: "#10b981",
  elevator: "#3b82f6",
  electricity: "#f59e0b",
  water: "#06b6d4",
  garden: "#84cc16",
  repair: "#ef4444",
  insurance: "#8b5cf6",
  other: "#6b7280",
};

export const mockExpenses: Expense[] = [
  {
    id: "1",
    category: "elevator",
    categoryLabel: "Asansör Bakımı",
    vendor: "Lift Service GmbH",
    amount: 850,
    currency: "CHF",
    date: "2026-05-08",
    status: "paid",
    cashAccount: "Banka Hesabı",
    invoiceNo: "INV-2026-001",
    description: "Aylık asansör bakım ve periyodik kontrol hizmeti",
    isArchived: false,
    createdAt: "2026-05-08T10:30:00Z",
    updatedAt: "2026-05-08T10:30:00Z",
    createdBy: "Admin",
  },
  {
    id: "2",
    category: "cleaning",
    categoryLabel: "Temizlik",
    vendor: "CleanPro AG",
    amount: 420,
    currency: "CHF",
    date: "2026-05-06",
    status: "paid",
    cashAccount: "Nakit Kasa",
    invoiceNo: "INV-2026-045",
    description: "Ortak alan temizlik hizmeti - Mayıs",
    isArchived: false,
    createdAt: "2026-05-06T14:20:00Z",
    updatedAt: "2026-05-06T14:20:00Z",
    createdBy: "Admin",
  },
  {
    id: "3",
    category: "electricity",
    categoryLabel: "Elektrik",
    vendor: "Elektrik AG",
    amount: 1240,
    currency: "CHF",
    date: "2026-05-10",
    status: "pending",
    cashAccount: "Banka Hesabı",
    invoiceNo: "INV-2026-089",
    description: "Nisan ayı elektrik tüketim faturası",
    isArchived: false,
    createdAt: "2026-05-10T09:15:00Z",
    updatedAt: "2026-05-10T09:15:00Z",
    createdBy: "Admin",
  },
  {
    id: "4",
    category: "water",
    categoryLabel: "Su",
    vendor: "Wasserwerke Zürich",
    amount: 310,
    currency: "CHF",
    date: "2026-05-12",
    status: "pending",
    cashAccount: "Banka Hesabı",
    invoiceNo: "INV-2026-112",
    description: "Su tüketim faturası",
    isArchived: false,
    createdAt: "2026-05-12T11:00:00Z",
    updatedAt: "2026-05-12T11:00:00Z",
    createdBy: "Admin",
  },
  {
    id: "5",
    category: "repair",
    categoryLabel: "Tamirat",
    vendor: "Teknik Servis",
    amount: 280,
    currency: "CHF",
    date: "2026-05-05",
    status: "paid",
    cashAccount: "Nakit Kasa",
    invoiceNo: "INV-2026-034",
    description: "Merdiven aydınlatma arıza tamiri",
    isArchived: false,
    createdAt: "2026-05-05T16:45:00Z",
    updatedAt: "2026-05-05T16:45:00Z",
    createdBy: "Admin",
  },
];
export function getExpenseCashAccountPrefix(account: string) {
  if (account.includes("Kasa")) return "💵";
  if (account.includes("Banka")) return "🏦";
  if (account.includes("TWINT")) return "📱";
  if (account.includes("PostFinance")) return "📮";
  if (account.includes("Kredi")) return "💳";

  return "💰";
}

export function getExpenseStatusLabel(status: ExpenseStatus | string) {
  if (status === "paid") return "Ödendi";
  if (status === "pending") return "Bekliyor";
  if (status === "cancelled") return "İptal";

  return status;
}
/* ================================
   HELPERS
================================ */

export function formatExpenseMoney(amount: number, currency: Currency) {
  const symbol = currency === "CHF" ? "₣" : currency === "EUR" ? "€" : "₺";

  return `${symbol} ${amount.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatExpenseDate(date: string) {
  return new Date(date).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatExpenseShortDate(date: string) {
  return format(new Date(date), "dd.MM.yyyy");
}

export function createExpenseId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function toExpenseFormValues(expense: Expense): ExpenseFormValues {
  return {
    category: expense.category,
    vendor: expense.vendor,
    amount: String(expense.amount),
    currency: expense.currency,
    date: expense.date,
    status: expense.status,
    cashAccount: expense.cashAccount,
    invoiceNo: expense.invoiceNo ?? "",
    description: expense.description ?? "",
  };
}

export function validateExpenseForm(
  values: ExpenseFormValues,
): ExpenseFormErrors {
  const errors: ExpenseFormErrors = {};

  if (!values.category) errors.category = "Kategori zorunlu";
  if (!values.vendor.trim())
    errors.vendor = "Firma / tedarikçi zorunlu";

  const amount = Number(values.amount);

  if (!values.amount.trim()) {
    errors.amount = "Tutar zorunlu";
  } else if (Number.isNaN(amount) || amount <= 0) {
    errors.amount = "Tutar 0'dan büyük olmalı";
  }

  if (!values.date) errors.date = "Tarih zorunlu";
  if (!values.cashAccount.trim())
    errors.cashAccount = "Ödeme hesabı zorunlu";

  return errors;
}

/* ================================
   CSV EXPORT
================================ */

export function downloadExpensesCsv(expenses: Expense[]) {
  const headers = [
    "ID",
    "Kategori",
    "Firma",
    "Tutar",
    "Para Birimi",
    "Tarih",
    "Durum",
    "Ödeme Hesabı",
    "Fatura No",
    "Açıklama",
    "Oluşturma Tarihi",
  ];

  const rows = expenses.map((expense) => [
    expense.id,
    expense.categoryLabel,
    expense.vendor,
    String(expense.amount),
    expense.currency,
    expense.date,
    expense.status === "paid"
      ? "Ödendi"
      : expense.status === "pending"
      ? "Bekliyor"
      : "İptal",
    expense.cashAccount,
    expense.invoiceNo ?? "",
    expense.description ?? "",
    format(new Date(expense.createdAt), "dd.MM.yyyy HH:mm"),
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
  link.download = `giderler-${format(new Date(), "yyyy-MM-dd")}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}