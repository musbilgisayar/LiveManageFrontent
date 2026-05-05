import { format } from "date-fns";
import type {
  BulkFormErrors,
  BulkFormValues,
  ChargeFormErrors,
  ChargeFormValues,
  ChargeItem,
  ChargeStatus,
  ChargeType,
  ChargeUnitOption,
  Currency,
  PaymentState,
} from "@/modules/muhasebe/types/MuhasebeCharge.types";

/* ============================================================
   CONSTANTS
============================================================ */

export const CHARGE_TYPE_OPTIONS: Array<{
  value: ChargeType;
  label: string;
  helper: string;
  color: string;
}> = [
  {
    value: "dues",
    label: "Aidat",
    helper: "Dönemsel site/apartman aidatı",
    color: "#3b82f6",
  },
  {
    value: "penalty",
    label: "Ceza",
    helper: "Gecikme, kural ihlali veya özel ceza",
    color: "#ef4444",
  },
  {
    value: "shared_expense",
    label: "Ortak Gider Payı",
    helper: "Ortak giderlerin dairelere paylaştırılması",
    color: "#f59e0b",
  },
  {
    value: "special",
    label: "Özel Borç",
    helper: "Tekil ve açıklama gerektiren özel borç",
    color: "#8b5cf6",
  },
];

export const STATUS_OPTIONS: Array<{
  value: ChargeStatus;
  label: string;
  color: string;
}> = [
  { value: "draft", label: "Taslak", color: "#f59e0b" },
  { value: "posted", label: "Kesinleşti", color: "#10b981" },
  { value: "cancelled", label: "İptal", color: "#ef4444" },
];

export const CHARGE_STATUS_OPTIONS = STATUS_OPTIONS;

export const CHARGE_UNIT_OPTIONS: ChargeUnitOption[] = [
  { unit: "A Blok / Daire 1", block: "A Blok", residentName: "Ahmet Yılmaz" },
  { unit: "A Blok / Daire 2", block: "A Blok", residentName: "Elif Kaya" },
  { unit: "A Blok / Daire 3", block: "A Blok", residentName: "Mehmet Demir" },
  { unit: "B Blok / Daire 1", block: "B Blok", residentName: "Fatma Şahin" },
  { unit: "B Blok / Daire 2", block: "B Blok", residentName: "Hasan Çelik" },
  { unit: "C Blok / Daire 1", block: "C Blok", residentName: "Zeynep Arslan" },
];

export const UNITS = CHARGE_UNIT_OPTIONS;

/* ============================================================
   INITIAL STATES
============================================================ */

export const INITIAL_FORM: ChargeFormValues = {
  period: format(new Date(), "yyyy-MM"),
  unit: "",
  block: "",
  residentName: "",
  chargeType: "dues",
  amount: "",
  currency: "CHF",
  dueDate: format(new Date(), "yyyy-MM-dd"),
  description: "",
  status: "draft",
};

export const INITIAL_BULK_FORM: BulkFormValues = {
  period: format(new Date(), "yyyy-MM"),
  scope: "all",
  block: "A Blok",
  chargeType: "dues",
  amount: "",
  currency: "CHF",
  dueDate: format(new Date(), "yyyy-MM-dd"),
  description: "Aylık aidat tahakkuku",
};

/* ============================================================
   MOCK DATA
============================================================ */

export const mockCharges: ChargeItem[] = [
  {
    id: "1",
    period: "2026-05",
    unit: "A Blok / Daire 1",
    block: "A Blok",
    residentName: "Ahmet Yılmaz",
    chargeType: "dues",
    chargeTypeLabel: "Aidat",
    amount: 250,
    paidAmount: 250,
    currency: "CHF",
    dueDate: "2026-05-31",
    status: "posted",
    description: "Mayıs 2026 aidatı",
    referenceNo: "CHG-2026-001",
    createdAt: "2026-05-01T09:00:00Z",
    updatedAt: "2026-05-04T10:00:00Z",
    createdBy: "Admin",
  },
];

/* ============================================================
   HELPERS
============================================================ */

export function createChargeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createReferenceNo() {
  return `CHG-${format(new Date(), "yyyy")}-${Math.floor(Math.random() * 9000 + 1000)}`;
}

export function getChargeTypeConfig(type: ChargeType) {
  return (
    CHARGE_TYPE_OPTIONS.find((item) => item.value === type) ??
    CHARGE_TYPE_OPTIONS[0]
  );
}

export function getPaymentState(item: ChargeItem): PaymentState {
  if (item.paidAmount <= 0) return "unpaid";
  if (item.paidAmount >= item.amount) return "paid";
  return "partial";
}

export function getRemainingAmount(item: ChargeItem) {
  return Math.max(item.amount - item.paidAmount, 0);
}

/* ============================================================
   FORMATTERS
============================================================ */

export function formatChargeMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export function formatChargeShortDate(date: string) {
  try {
    const d = new Date(date);
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(d);
  } catch {
    return date;
  }
}

export function formatChargeLongDate(date: string) {
  try {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return date;
  }
}
/* ============================================================
   STATUS & UI HELPERS
============================================================ */

export function getChargeStatusConfig(status: ChargeStatus) {
  switch (status) {
    case "draft":
      return { label: "Taslak", color: "#64748b" };
    case "posted":
      return { label: "Kesinleşti", color: "#16a34a" };
    case "cancelled":
      return { label: "İptal", color: "#dc2626" };
    default:
      return { label: "Bilinmiyor", color: "#64748b" };
  }
}

export function getPaymentStateLabel(state: PaymentState) {
  switch (state) {
    case "paid":
      return "Ödendi";
    case "partial":
      return "Kısmi Ödendi";
    case "unpaid":
      return "Ödenmedi";
    default:
      return "Bilinmiyor";
  }
}

export function getPaymentStateColor(state: PaymentState) {
  switch (state) {
    case "paid":
      return "#16a34a";
    case "partial":
      return "#f59e0b";
    case "unpaid":
      return "#dc2626";
    default:
      return "#64748b";
  }
}

export function isChargeOverdue(item: ChargeItem) {
  if (item.status !== "posted") return false;
  if (getPaymentState(item) === "paid") return false;

  return (
    new Date(item.dueDate).getTime() <
    new Date().setHours(0, 0, 0, 0)
  );
}

/* ============================================================
   VALIDATION
============================================================ */

export function validateForm(values: ChargeFormValues): ChargeFormErrors {
  const errors: ChargeFormErrors = {};

  if (!values.period) errors.period = "Dönem zorunlu";
  if (!values.unit.trim()) errors.unit = "Daire zorunlu";
  if (!values.residentName.trim()) errors.residentName = "Sakin zorunlu";
  if (!values.dueDate) errors.dueDate = "Vade zorunlu";

  const amount = Number(values.amount);
  if (!values.amount.trim()) errors.amount = "Tutar zorunlu";
  else if (Number.isNaN(amount) || amount <= 0)
    errors.amount = "Geçerli tutar gir";

  return errors;
}

export function validateBulkForm(values: BulkFormValues): BulkFormErrors {
  const errors: BulkFormErrors = {};

  if (!values.period) errors.period = "Dönem zorunlu";
  if (!values.dueDate) errors.dueDate = "Vade zorunlu";

  const amount = Number(values.amount);
  if (!values.amount.trim()) errors.amount = "Tutar zorunlu";
  else if (Number.isNaN(amount) || amount <= 0)
    errors.amount = "Geçerli tutar gir";

  return errors;
}