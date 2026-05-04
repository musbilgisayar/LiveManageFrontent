// src/modules/muhasebe/views/MuhasebeExpensesView.tsx
"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  alpha,
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  Fade,
  IconButton,
  InputAdornment,
  MenuItem,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  IconBuildingBank,
  IconCalendarEvent,
  IconCash,
  IconChecks,
  IconCreditCard,
  IconDownload,
  IconEdit,
  IconEye,
  IconFileInvoice,
  IconPlus,
  IconPrinter,
  IconReceiptTax,
  IconSearch,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useMuhasebeExpenseCategories } from "@/modules/muhasebe/hooks/useMuhasebeExpenseCategories";
type Currency = "CHF" | "EUR" | "TRY";
type ExpenseStatus = "paid" | "pending" | "cancelled";
 
type TabValue = "all" | "paid" | "pending";
type SortValue = "date_desc" | "date_asc" | "amount_desc" | "amount_asc" | "vendor_asc";
type ExpenseCategory = string;
interface Expense {
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
  createdAt: string;
  updatedAt: string;
}

interface ExpenseFormValues {
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

interface ExpenseFormErrors {
  category?: string;
  vendor?: string;
  amount?: string;
  date?: string;
  cashAccount?: string;
}

const INITIAL_FORM: ExpenseFormValues = {
  category: "cleaning",
  vendor: "",
  amount: "",
  currency: "CHF",
  date: "2026-05-03",
  status: "pending",
  cashAccount: "Banka Hesabı",
  invoiceNo: "",
  description: "",
};

 
const STATUS_OPTIONS: Array<{ value: ExpenseStatus; label: string }> = [
  { value: "paid", label: "Ödendi" },
  { value: "pending", label: "Bekliyor" },
  { value: "cancelled", label: "İptal" },
];

const CASH_ACCOUNT_OPTIONS = ["Banka Hesabı", "Nakit Kasa", "TWINT", "PostFinance"];

const mockExpenses: Expense[] = [
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
    createdAt: "2026-05-08T10:30:00Z",
    updatedAt: "2026-05-08T10:30:00Z",
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
    createdAt: "2026-05-06T14:20:00Z",
    updatedAt: "2026-05-06T14:20:00Z",
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
    createdAt: "2026-05-10T09:15:00Z",
    updatedAt: "2026-05-10T09:15:00Z",
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
    createdAt: "2026-05-12T11:00:00Z",
    updatedAt: "2026-05-12T11:00:00Z",
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
    createdAt: "2026-05-05T16:45:00Z",
    updatedAt: "2026-05-05T16:45:00Z",
  },
];

const categoryConfig: Record<
  ExpenseCategory,
  { color: string; icon: React.ReactNode; label: string }
> = {
  cleaning: {
    color: "#10b981",
    icon: <IconReceiptTax size={18} />,
    label: "Temizlik",
  },
  elevator: {
    color: "#3b82f6",
    icon: <IconBuildingBank size={18} />,
    label: "Asansör Bakımı",
  },
  electricity: {
    color: "#f59e0b",
    icon: <IconCreditCard size={18} />,
    label: "Elektrik",
  },
  water: {
    color: "#06b6d4",
    icon: <IconCalendarEvent size={18} />,
    label: "Su",
  },
  garden: {
    color: "#84cc16",
    icon: <IconReceiptTax size={18} />,
    label: "Bahçe Bakımı",
  },
  repair: {
    color: "#ef4444",
    icon: <span style={{ fontSize: 16 }}>🔧</span>,
    label: "Tamirat",
  },
  insurance: {
    color: "#8b5cf6",
    icon: <IconBuildingBank size={18} />,
    label: "Sigorta",
  },
  other: {
    color: "#6b7280",
    icon: <IconReceiptTax size={18} />,
    label: "Diğer",
  },
};

function formatMoney(amount: number, currency: Currency) {
  return `${amount.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function createExpenseId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toFormValues(expense: Expense): ExpenseFormValues {
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

function validateForm(values: ExpenseFormValues): ExpenseFormErrors {
  const errors: ExpenseFormErrors = {};

  if (!values.category) errors.category = "Kategori zorunlu";
  if (!values.vendor.trim()) errors.vendor = "Firma / tedarikçi zorunlu";

  const amount = Number(values.amount);
  if (!values.amount.trim()) {
    errors.amount = "Tutar zorunlu";
  } else if (Number.isNaN(amount) || amount <= 0) {
    errors.amount = "Tutar 0'dan büyük olmalı";
  }

  if (!values.date) errors.date = "Tarih zorunlu";
  if (!values.cashAccount.trim()) errors.cashAccount = "Ödeme hesabı zorunlu";

  return errors;
}

function downloadCsv(expenses: Expense[]) {
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
  ];

  const rows = expenses.map((expense) => [
    expense.id,
    expense.categoryLabel,
    expense.vendor,
    String(expense.amount),
    expense.currency,
    expense.date,
    expense.status,
    expense.cashAccount,
    expense.invoiceNo ?? "",
    expense.description ?? "",
  ]);

  const csvContent = [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
        .join(","),
    )
    .join("\n");

  const blob = new Blob([`\uFEFF${csvContent}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `giderler-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function PremiumSummaryCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}) {
  const theme = useTheme();

  return (
    <Fade in timeout={300}>
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: `1px solid ${alpha(theme.palette.divider, 0.85)}`,
          background: `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${alpha(theme.palette.grey[50], 0.7)} 100%)`,
          transition: "all 0.2s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            borderColor: alpha(theme.palette.primary.main, 0.25),
            boxShadow: `0 16px 40px ${alpha(theme.palette.common.black, 0.07)}`,
          },
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                {title}
              </Typography>
              <Typography variant="h5" fontWeight={900} sx={{ mt: 0.5 }}>
                {value}
              </Typography>
              {subtitle ? (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.5, display: "block" }}
                >
                  {subtitle}
                </Typography>
              ) : null}
              {trend && trendValue ? (
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1 }}>
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    sx={{
                      color:
                        trend === "up"
                          ? "#ef4444"
                          : trend === "down"
                            ? "#10b981"
                            : "text.secondary",
                    }}
                  >
                    {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    geçen aya göre
                  </Typography>
                </Stack>
              ) : null}
            </Box>

            {icon ? (
              <Avatar
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  width: 44,
                  height: 44,
                }}
              >
                {icon}
              </Avatar>
            ) : null}
          </Stack>
        </CardContent>
      </Card>
    </Fade>
  );
}

function ExpenseCard({
  expense,
  onEdit,
  onDelete,
  onView,
}: {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  onView: (expense: Expense) => void;
}) {
  const theme = useTheme();
 const config =
  Object.values(categoryConfig).find((item) => item.label === expense.categoryLabel) ??
  categoryConfig.other;

  return (
    <Fade in timeout={250}>
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: alpha(theme.palette.primary.main, 0.22),
            boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.06)}`,
          },
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            spacing={2}
          >
            <Stack spacing={1.2} minWidth={0}>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Badge
                  variant="dot"
                  color={expense.status === "paid" ? "success" : expense.status === "pending" ? "warning" : "error"}
                  anchorOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: alpha(config.color, 0.12),
                      color: config.color,
                    }}
                  >
                    {config.icon}
                  </Avatar>
                </Badge>

                <Box minWidth={0}>
                  <Typography fontWeight={800} noWrap>
                    {expense.categoryLabel}
                  </Typography>

                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {expense.vendor}
                    </Typography>
                    {expense.invoiceNo ? (
                      <>
                        <Typography variant="caption" color="text.secondary">
                          •
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          Fatura: {expense.invoiceNo}
                        </Typography>
                      </>
                    ) : null}
                  </Stack>
                </Box>
              </Stack>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 0.5, sm: 2 }}
                sx={{ ml: { xs: 0, sm: 6.5 } }}
              >
                <Typography variant="caption" color="text.secondary">
                  📅 {formatDate(expense.date)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  💳 {expense.cashAccount}
                </Typography>
              </Stack>

              {expense.description ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: { xs: 0, sm: 6.5 } }}
                >
                  📝 {expense.description}
                </Typography>
              ) : null}
            </Stack>

            <Stack
              alignItems={{ xs: "flex-start", md: "flex-end" }}
              spacing={1}
              minWidth={{ md: 220 }}
            >
              <Typography variant="h6" fontWeight={900}>
                {formatMoney(expense.amount, expense.currency)}
              </Typography>

              <Chip
                label={
                  expense.status === "paid"
                    ? "✅ Ödendi"
                    : expense.status === "pending"
                      ? "⏳ Bekliyor"
                      : "❌ İptal"
                }
                color={
                  expense.status === "paid"
                    ? "success"
                    : expense.status === "pending"
                      ? "warning"
                      : "error"
                }
                size="small"
              />

              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Düzenle">
                  <IconButton size="small" onClick={() => onEdit(expense)}>
                    <IconEdit size={18} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Sil">
                  <IconButton size="small" onClick={() => onDelete(expense)}>
                    <IconTrash size={18} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Detay">
                  <IconButton size="small" onClick={() => onView(expense)}>
                    <IconEye size={18} />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Fade>
  );
}

export default function MuhasebeExpensesView() {

  const theme = useTheme();
const { categories } = useMuhasebeExpenseCategories();
 

  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TabValue>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | ExpenseCategory>("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | ExpenseStatus>("all");
  const [sortBy, setSortBy] = useState<SortValue>("date_desc");

  const [formValues, setFormValues] = useState<ExpenseFormValues>(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<ExpenseFormErrors>({});
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  const [viewExpense, setViewExpense] = useState<Expense | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = useCallback(
    (message: string, severity: "success" | "error" = "success") => {
      setSnackbar({ open: true, message, severity });
    },
    [],
  );

  const resetForm = useCallback(() => {
    setFormValues(INITIAL_FORM);
    setFormErrors({});
    setEditingExpenseId(null);
  }, []);

  const openCreateDrawer = useCallback(() => {
    resetForm();
    setDrawerOpen(true);
  }, [resetForm]);

  const handleFormChange = useCallback(
    (field: keyof ExpenseFormValues, value: string) => {
      setFormValues((prev) => ({ ...prev, [field]: value }));
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    [],
  );

  const filteredExpenses = useMemo(() => {
    let data = [...expenses];

    if (selectedTab !== "all") {
      data = data.filter((expense) => expense.status === selectedTab);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      data = data.filter((expense) => {
        const haystack = [
          expense.vendor,
          expense.categoryLabel,
          expense.description ?? "",
          expense.invoiceNo ?? "",
          expense.cashAccount,
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(query);
      });
    }

    if (selectedCategory !== "all") {
      data = data.filter((expense) => expense.category === selectedCategory);
    }

    if (selectedStatus !== "all") {
      data = data.filter((expense) => expense.status === selectedStatus);
    }

    data.sort((a, b) => {
      switch (sortBy) {
        case "date_asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "date_desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "amount_asc":
          return a.amount - b.amount;
        case "amount_desc":
          return b.amount - a.amount;
        case "vendor_asc":
          return a.vendor.localeCompare(b.vendor, "tr");
        default:
          return 0;
      }
    });

    return data;
  }, [expenses, searchQuery, selectedCategory, selectedStatus, selectedTab, sortBy]);

  const stats = useMemo(() => {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const paid = expenses
      .filter((expense) => expense.status === "paid")
      .reduce((sum, expense) => sum + expense.amount, 0);
    const pending = expenses
      .filter((expense) => expense.status === "pending")
      .reduce((sum, expense) => sum + expense.amount, 0);

    const now = new Date();
    const thisMonth = expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date);
        return (
          expenseDate.getMonth() === now.getMonth() &&
          expenseDate.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, expense) => sum + expense.amount, 0);

    return {
      total,
      paid,
      pending,
      thisMonth,
      count: expenses.length,
      paidCount: expenses.filter((expense) => expense.status === "paid").length,
      pendingCount: expenses.filter((expense) => expense.status === "pending").length,
    };
  }, [expenses]);

  const handleSaveExpense = useCallback(() => {
    const errors = validateForm(formValues);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      showSnackbar("Lütfen zorunlu alanları kontrol edin.", "error");
      return;
    }

    const nowIso = new Date().toISOString();
   const selectedCategory = categories.find(
  (category) => category.code === formValues.category,
);

const categoryLabel = selectedCategory?.name ?? "Bilinmeyen";


    const normalizedExpense: Expense = {
      id: editingExpenseId ?? createExpenseId(),
      category: formValues.category,
      categoryLabel,
      vendor: formValues.vendor.trim(),
      amount: Number(formValues.amount),
      currency: formValues.currency,
      date: formValues.date,
      status: formValues.status,
      cashAccount: formValues.cashAccount.trim(),
      invoiceNo: formValues.invoiceNo.trim() || undefined,
      description: formValues.description.trim() || undefined,
      attachments: [],
      createdAt:
        editingExpenseId != null
          ? expenses.find((expense) => expense.id === editingExpenseId)?.createdAt ?? nowIso
          : nowIso,
      updatedAt: nowIso,
    };

    setExpenses((prev) => {
      if (editingExpenseId) {
        return prev.map((expense) =>
          expense.id === editingExpenseId ? normalizedExpense : expense,
        );
      }

      return [normalizedExpense, ...prev];
    });

    setDrawerOpen(false);
    resetForm();
    showSnackbar(
      editingExpenseId ? "Gider başarıyla güncellendi." : "Yeni gider başarıyla eklendi.",
      "success",
    );
  }, [editingExpenseId, expenses, formValues, resetForm, showSnackbar]);

  const handleEdit = useCallback((expense: Expense) => {
    setEditingExpenseId(expense.id);
    setFormValues(toFormValues(expense));
    setFormErrors({});
    setDrawerOpen(true);
  }, []);

  const handleDeleteClick = useCallback((expense: Expense) => {
    setDeleteTarget(expense);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;

    setExpenses((prev) => prev.filter((expense) => expense.id !== deleteTarget.id));
    setDeleteTarget(null);
    showSnackbar("Gider kaydı silindi.", "success");
  }, [deleteTarget, showSnackbar]);

  const handleView = useCallback((expense: Expense) => {
    setViewExpense(expense);
  }, []);

  const handleExport = useCallback(() => {
    if (filteredExpenses.length === 0) {
      showSnackbar("Dışa aktarılacak kayıt bulunamadı.", "error");
      return;
    }

    downloadCsv(filteredExpenses);
    showSnackbar("CSV export tamamlandı.", "success");
  }, [filteredExpenses, showSnackbar]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedTab("all");
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setSortBy("date_desc");
  }, []);

  return (
    <Box sx={{ p: { xs: 2, md: 3, lg: 4 } }}>
      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", lg: "center" }}
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={900}>
            Giderler
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Gider takibi, ödeme yönetimi ve finansal raporlama
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Tooltip title="CSV dışa aktar">
            <Button
              variant="outlined"
              startIcon={<IconDownload size={18} />}
              onClick={handleExport}
            >
              Dışa Aktar
            </Button>
          </Tooltip>

          <Tooltip title="Yazdır">
            <Button
              variant="outlined"
              startIcon={<IconPrinter size={18} />}
              onClick={handlePrint}
            >
              Yazdır
            </Button>
          </Tooltip>

          <Button
            variant="contained"
            startIcon={<IconPlus size={18} />}
            onClick={openCreateDrawer}
            sx={{ borderRadius: 2.5, px: 2 }}
          >
            Yeni Gider
          </Button>
        </Stack>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" },
          gap: 2.5,
          mb: 3,
        }}
      >
        <PremiumSummaryCard
          title="Toplam Gider"
          value={formatMoney(stats.total, "CHF")}
          subtitle={`${stats.count} kayıt`}
          icon={<IconReceiptTax size={20} />}
        />
        <PremiumSummaryCard
          title="Ödenen"
          value={formatMoney(stats.paid, "CHF")}
          subtitle={`${stats.total ? ((stats.paid / stats.total) * 100).toFixed(1) : "0.0"}%`}
          icon={<IconChecks size={20} />}
        />
        <PremiumSummaryCard
          title="Bekleyen"
          value={formatMoney(stats.pending, "CHF")}
          subtitle={`${stats.pendingCount} kayıt`}
          icon={<IconCalendarEvent size={20} />}
        />
        <PremiumSummaryCard
          title="Bu Ay"
          value={formatMoney(stats.thisMonth, "CHF")}
          trend={stats.thisMonth > 1000 ? "up" : "down"}
          trendValue="%8.2"
          icon={<IconCreditCard size={20} />}
        />
      </Box>

      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
          bgcolor: alpha(theme.palette.background.paper, 0.72),
          backdropFilter: "blur(8px)",
        }}
      >
        <CardContent>
          <Tabs value={selectedTab} onChange={(_, value: TabValue) => setSelectedTab(value)} sx={{ mb: 2 }}>
            <Tab label={`Tümü (${expenses.length})`} value="all" />
            <Tab label={`Ödenen (${stats.paidCount})`} value="paid" />
            <Tab label={`Bekleyen (${stats.pendingCount})`} value="pending" />
          </Tabs>

          <Divider sx={{ mb: 2 }} />

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              size="small"
              placeholder="Ara (firma, kategori, fatura no, hesap)..."
              fullWidth
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={18} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              select
              size="small"
              label="Kategori"
              value={selectedCategory}
              onChange={(event) =>
                setSelectedCategory(event.target.value as "all" | ExpenseCategory)
              }
              sx={{ minWidth: { md: 180 } }}
            >
              <MenuItem value="all">Tümü</MenuItem>
             {categories
  .filter((category) => category.isActive)
  .map((category) => (
    <MenuItem key={category.id} value={category.code}>
      {category.name}
    </MenuItem>
  ))}
            </TextField>

            <TextField
              select
              size="small"
              label="Durum"
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(event.target.value as "all" | ExpenseStatus)
              }
              sx={{ minWidth: { md: 150 } }}
            >
              <MenuItem value="all">Tümü</MenuItem>
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              label="Sırala"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortValue)}
              sx={{ minWidth: { md: 180 } }}
            >
              <MenuItem value="date_desc">Tarih (Yeni → Eski)</MenuItem>
              <MenuItem value="date_asc">Tarih (Eski → Yeni)</MenuItem>
              <MenuItem value="amount_desc">Tutar (Yüksek → Düşük)</MenuItem>
              <MenuItem value="amount_asc">Tutar (Düşük → Yüksek)</MenuItem>
              <MenuItem value="vendor_asc">Firma (A → Z)</MenuItem>
            </TextField>
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
            sx={{ mt: 2 }}
          >
            <Typography variant="body2" color="text.secondary">
              {filteredExpenses.length} kayıt listeleniyor
            </Typography>

            <Button size="small" variant="text" onClick={clearFilters}>
              Filtreleri Temizle
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {filteredExpenses.length === 0 ? (
        <Card
          sx={{
            borderRadius: 3,
            p: 4,
            textAlign: "center",
            border: `1px dashed ${alpha(theme.palette.divider, 0.8)}`,
          }}
        >
          <Typography variant="body1" color="text.secondary">
            🧾 Filtrelere uygun gider kaydı bulunamadı.
          </Typography>
          <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={clearFilters}>
              Filtreleri Temizle
            </Button>
            <Button
              variant="contained"
              startIcon={<IconPlus size={18} />}
              onClick={openCreateDrawer}
            >
              Yeni Gider Ekle
            </Button>
          </Stack>
        </Card>
      ) : (
        <Stack spacing={2}>
          {filteredExpenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onView={handleView}
            />
          ))}
        </Stack>
      )}

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          resetForm();
        }}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 560, md: 620 },
            p: 0,
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h5" fontWeight={900}>
                {editingExpenseId ? "Gider Düzenle" : "Yeni Gider Ekle"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Zorunlu alanları doldurarak kayıt oluşturun
              </Typography>
            </Box>

            <IconButton
              onClick={() => {
                setDrawerOpen(false);
                resetForm();
              }}
            >
              <IconX size={20} />
            </IconButton>
          </Stack>

          <Stack spacing={2.5}>
            <TextField
              select
              label="Gider Kategorisi"
              fullWidth
              value={formValues.category}
              onChange={(event) =>
                handleFormChange("category", event.target.value as ExpenseCategory)
              }
              error={Boolean(formErrors.category)}
              helperText={formErrors.category}
            >
             {categories
  .filter((category) => category.isActive)
  .map((category) => (
    <MenuItem key={category.id} value={category.code}>
      {category.name}
    </MenuItem>
  ))}
            </TextField>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 120px" },
                gap: 2,
              }}
            >
              <TextField
                label="Tutar"
                type="number"
                placeholder="0.00"
                fullWidth
                value={formValues.amount}
                onChange={(event) => handleFormChange("amount", event.target.value)}
                error={Boolean(formErrors.amount)}
                helperText={formErrors.amount}
              />
              <TextField
                select
                label="Para Birimi"
                value={formValues.currency}
                onChange={(event) =>
                  handleFormChange("currency", event.target.value as Currency)
                }
              >
                <MenuItem value="CHF">🇨🇭 CHF</MenuItem>
                <MenuItem value="EUR">🇪🇺 EUR</MenuItem>
                <MenuItem value="TRY">🇹🇷 TRY</MenuItem>
              </TextField>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
              }}
            >
              <TextField
                label="Gider Tarihi"
                type="date"
                value={formValues.date}
                onChange={(event) => handleFormChange("date", event.target.value)}
                InputLabelProps={{ shrink: true }}
                error={Boolean(formErrors.date)}
                helperText={formErrors.date}
              />
              <TextField
                select
                label="Ödeme Hesabı"
                value={formValues.cashAccount}
                onChange={(event) => handleFormChange("cashAccount", event.target.value)}
                error={Boolean(formErrors.cashAccount)}
                helperText={formErrors.cashAccount}
              >
                {CASH_ACCOUNT_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option === "Nakit Kasa" ? "💵" : option === "Banka Hesabı" ? "🏦" : option === "TWINT" ? "📱" : "📮"} {option}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <TextField
              label="Firma / Tedarikçi"
              placeholder="Örn: Lift Service GmbH"
              fullWidth
              value={formValues.vendor}
              onChange={(event) => handleFormChange("vendor", event.target.value)}
              error={Boolean(formErrors.vendor)}
              helperText={formErrors.vendor}
            />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
              }}
            >
              <TextField
                label="Fatura No"
                placeholder="Opsiyonel"
                fullWidth
                value={formValues.invoiceNo}
                onChange={(event) => handleFormChange("invoiceNo", event.target.value)}
              />

              <TextField
                select
                label="Durum"
                fullWidth
                value={formValues.status}
                onChange={(event) =>
                  handleFormChange("status", event.target.value as ExpenseStatus)
                }
              >
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <TextField
              label="Açıklama"
              multiline
              minRows={3}
              placeholder="Gider hakkında kısa açıklama..."
              fullWidth
              value={formValues.description}
              onChange={(event) => handleFormChange("description", event.target.value)}
            />

            <Alert severity="info" icon={<IconFileInvoice size={18} />}>
              <Typography variant="body2" fontWeight={700}>
                Belge Yükleme
              </Typography>
              <Typography variant="caption">
                Şimdilik pasif. Sonraki adımda drag & drop dosya yükleme eklenebilir.
              </Typography>
            </Alert>

            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ pt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setDrawerOpen(false);
                  resetForm();
                }}
              >
                İptal
              </Button>
              <Button variant="contained" onClick={handleSaveExpense}>
                {editingExpenseId ? "Güncelle" : "Gideri Kaydet"}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Drawer>

      <Dialog open={Boolean(viewExpense)} onClose={() => setViewExpense(null)} fullWidth maxWidth="sm">
        <DialogTitle>Gider Detayı</DialogTitle>
        <DialogContent dividers>
          {viewExpense ? (
            <Stack spacing={2}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar
                  sx={{
                    bgcolor: alpha(categoryConfig[viewExpense.category].color, 0.12),
                    color: categoryConfig[viewExpense.category].color,
                  }}
                >
                  {categoryConfig[viewExpense.category].icon}
                </Avatar>
                <Box>
                  <Typography fontWeight={800}>{viewExpense.categoryLabel}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {viewExpense.vendor}
                  </Typography>
                </Box>
              </Stack>

              <Divider />

              <DetailRow label="Tutar" value={formatMoney(viewExpense.amount, viewExpense.currency)} />
              <DetailRow label="Tarih" value={formatDate(viewExpense.date)} />
              <DetailRow label="Durum" value={viewExpense.status} />
              <DetailRow label="Ödeme Hesabı" value={viewExpense.cashAccount} />
              <DetailRow label="Fatura No" value={viewExpense.invoiceNo || "-"} />
              <DetailRow label="Açıklama" value={viewExpense.description || "-"} />
              <DetailRow label="Oluşturulma" value={new Date(viewExpense.createdAt).toLocaleString("tr-TR")} />
              <DetailRow label="Güncellenme" value={new Date(viewExpense.updatedAt).toLocaleString("tr-TR")} />
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewExpense(null)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Gider Kaydını Sil</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary">
            <strong>{deleteTarget?.vendor}</strong> kaydını silmek istediğine emin misin?
            Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Vazgeç</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={700} textAlign="right">
        {value}
      </Typography>
    </Stack>
  );
}