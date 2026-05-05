"use client";

import { useCallback, useMemo, useState } from "react";
import { format } from "date-fns";

import { useMuhasebeExpenseCategories } from "@/modules/muhasebe/hooks/useMuhasebeExpenseCategories";
import type { ExpenseInvoiceCreatePayload } from "@/modules/muhasebe/components/expenses/ExpenseInvoiceCreateDrawer";
import type {
  ExpenseFormErrors,
  ExpenseFormValues,
  ExpenseItem,
  ExpenseSortValue,
  ExpenseStatus,
  ExpenseTabValue,
  ExpenseViewMode,
} from "@/modules/muhasebe/types/expense.types";
import {
  createExpenseId,
  downloadExpensesCsv,
  INITIAL_EXPENSE_FORM,
  mockExpenses,
  toExpenseFormValues,
  validateExpenseForm,
} from "@/modules/muhasebe/utils/muhasebeExpense.utils";

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;

    setStoredValue(valueToStore);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    }
  };

  return [storedValue, setValue] as const;
}

export function useExpenses() {
  const { categories } = useMuhasebeExpenseCategories();

  const [items, setItems] = useState<ExpenseItem[]>(mockExpenses);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [invoiceDrawerOpen, setInvoiceDrawerOpen] = useState(false);

  const [selectedTab, setSelectedTab] = useState<ExpenseTabValue>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [period, setPeriod] = useState(format(new Date(), "yyyy-MM"));
  const [selectedCategory, setSelectedCategory] = useState<"all" | string>("all");
  const [selectedCashAccount, setSelectedCashAccount] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | ExpenseStatus>("all");
  const [sortBy, setSortBy] = useState<ExpenseSortValue>("date_desc");
  const [viewMode, setViewMode] = useLocalStorage<ExpenseViewMode>(
    "expenses-view-mode",
    "grid",
  );

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [formValues, setFormValues] =
    useState<ExpenseFormValues>(INITIAL_EXPENSE_FORM);
  const [formErrors, setFormErrors] = useState<ExpenseFormErrors>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const [viewItem, setViewItem] = useState<ExpenseItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExpenseItem | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const stats = useMemo(
    () => ({
      total: items.length,
      paid: items.filter((item) => item.status === "paid").length,
      pending: items.filter((item) => item.status === "pending").length,
      cancelled: items.filter((item) => item.status === "cancelled").length,
      totalExpense: items
        .filter((item) => item.status === "paid")
        .reduce((sum, item) => sum + item.amount, 0),
      pendingAmount: items
        .filter((item) => item.status === "pending")
        .reduce((sum, item) => sum + item.amount, 0),
      bankCount: items.filter((item) => item.cashAccount.includes("Banka")).length,
      cashCount: items.filter((item) => item.cashAccount.includes("Kasa")).length,
    }),
    [items],
  );

  const showSnackbar = useCallback(
    (message: string, severity: "success" | "error" | "info" = "success") => {
      setSnackbar({ open: true, message, severity });
    },
    [],
  );

  const resetForm = useCallback(() => {
    setFormValues({
      ...INITIAL_EXPENSE_FORM,
      date: format(new Date(), "yyyy-MM-dd"),
    });
    setFormErrors({});
    setEditingId(null);
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

  const filteredItems = useMemo(() => {
    let data = [...items];

    if (selectedTab !== "all") {
      data = data.filter((item) => item.status === selectedTab);
    }

    if (period) {
      data = data.filter((item) => item.date.startsWith(period));
    }

    if (selectedCategory !== "all") {
      data = data.filter((item) => item.category === selectedCategory);
    }

    if (selectedCashAccount !== "all") {
      data = data.filter((item) => item.cashAccount === selectedCashAccount);
    }

    if (selectedStatus !== "all") {
      data = data.filter((item) => item.status === selectedStatus);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();

      data = data.filter((item) =>
        [
          item.vendor,
          item.categoryLabel,
          item.description ?? "",
          item.invoiceNo ?? "",
          item.cashAccount,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query),
      );
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
  }, [
    items,
    selectedTab,
    period,
    selectedCategory,
    selectedCashAccount,
    selectedStatus,
    searchQuery,
    sortBy,
  ]);

  const paginatedItems = useMemo(() => {
    return filteredItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredItems, page, rowsPerPage]);

  const handleSaveExpense = useCallback(async () => {
    const errors = validateExpenseForm(formValues);

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      showSnackbar("Lütfen zorunlu alanları kontrol edin.", "error");
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const nowIso = new Date().toISOString();
    const selectedCategoryItem = categories.find(
      (category) => category.code === formValues.category,
    );

    const normalizedItem: ExpenseItem = {
      id: editingId ?? createExpenseId(),
      category: formValues.category,
      categoryLabel: selectedCategoryItem?.name ?? "Bilinmeyen",
      vendor: formValues.vendor.trim(),
      amount: Number(formValues.amount),
      currency: formValues.currency,
      date: formValues.date,
      status: formValues.status,
      cashAccount: formValues.cashAccount.trim(),
      invoiceNo: formValues.invoiceNo.trim() || undefined,
      description: formValues.description.trim() || undefined,
      attachments: [],
      isArchived: false,
      createdAt:
        editingId != null
          ? items.find((item) => item.id === editingId)?.createdAt ?? nowIso
          : nowIso,
      updatedAt: nowIso,
      createdBy:
        editingId != null
          ? items.find((item) => item.id === editingId)?.createdBy ?? "Current User"
          : "Current User",
    };

    setItems((prev) => {
      if (editingId) {
        return prev.map((item) => (item.id === editingId ? normalizedItem : item));
      }

      return [normalizedItem, ...prev];
    });

    setDrawerOpen(false);
    resetForm();

    showSnackbar(
      editingId ? "Gider başarıyla güncellendi." : "Yeni gider başarıyla eklendi.",
      "success",
    );

    setIsLoading(false);
  }, [categories, editingId, formValues, items, resetForm, showSnackbar]);

  const handleInvoiceCreated = useCallback(
    (payload: ExpenseInvoiceCreatePayload) => {
      const nowIso = new Date().toISOString();

      const expense: ExpenseItem = {
        id: createExpenseId(),
        category: payload.category,
        categoryLabel: payload.categoryLabel,
        vendor: payload.vendor,
        amount: payload.amount,
        currency: payload.currency,
        date: payload.invoiceDate,
        status: "pending",
        cashAccount: "-",
        invoiceNo: payload.invoiceNo,
        description: payload.description,
        attachments: payload.attachments ?? [],
        isArchived: false,
        createdAt: nowIso,
        updatedAt: nowIso,
        createdBy: "Current User",
      };

      setItems((prev) => [expense, ...prev]);
      showSnackbar("Fatura kaydı oluşturuldu.", "success");
    },
    [showSnackbar],
  );

  const handleEdit = useCallback((item: ExpenseItem) => {
    setEditingId(item.id);
    setFormValues(toExpenseFormValues(item));
    setFormErrors({});
    setDrawerOpen(true);
  }, []);

  const handleDuplicate = useCallback(
    async (item: ExpenseItem) => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 250));

      const duplicated: ExpenseItem = {
        ...item,
        id: createExpenseId(),
        invoiceNo: item.invoiceNo ? `${item.invoiceNo}_COPY` : undefined,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setItems((prev) => [duplicated, ...prev]);
      showSnackbar("Gider kaydı kopyalandı.", "success");
      setIsLoading(false);
    },
    [showSnackbar],
  );

  const handleArchive = useCallback(
    async (item: ExpenseItem) => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 250));

      setItems((prev) =>
        prev.map((expense) =>
          expense.id === item.id
            ? {
                ...expense,
                isArchived: !expense.isArchived,
                updatedAt: new Date().toISOString(),
              }
            : expense,
        ),
      );

      showSnackbar(
        item.isArchived ? "Gider arşivden çıkarıldı." : "Gider arşivlendi.",
        "success",
      );

      setIsLoading(false);
    },
    [showSnackbar],
  );

  const handleDelete = useCallback((item: ExpenseItem) => {
    setDeleteTarget(item);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 250));

    setItems((prev) => prev.filter((item) => item.id !== deleteTarget.id));
    setSelectedItems((prev) => prev.filter((id) => id !== deleteTarget.id));
    setDeleteTarget(null);

    showSnackbar("Gider kaydı silindi.", "success");
    setIsLoading(false);
  }, [deleteTarget, showSnackbar]);

  const handleBulkArchive = useCallback(async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 250));

    setItems((prev) =>
      prev.map((item) =>
        selectedItems.includes(item.id)
          ? {
              ...item,
              isArchived: true,
              updatedAt: new Date().toISOString(),
            }
          : item,
      ),
    );

    showSnackbar(`${selectedItems.length} gider arşivlendi.`, "success");
    setSelectedItems([]);
    setIsLoading(false);
  }, [selectedItems, showSnackbar]);

  const handleBulkDelete = useCallback(async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 250));

    setItems((prev) => prev.filter((item) => !selectedItems.includes(item.id)));

    showSnackbar(`${selectedItems.length} gider silindi.`, "success");
    setSelectedItems([]);
    setIsLoading(false);
  }, [selectedItems, showSnackbar]);

  const handleExport = useCallback(() => {
    if (filteredItems.length === 0) {
      showSnackbar("Dışa aktarılacak kayıt bulunamadı.", "error");
      return;
    }

    downloadExpensesCsv(filteredItems);
    showSnackbar("CSV export tamamlandı.", "success");
  }, [filteredItems, showSnackbar]);

  const clearFilters = useCallback(() => {
    setSelectedTab("all");
    setSearchQuery("");
    setPeriod(format(new Date(), "yyyy-MM"));
    setSelectedCategory("all");
    setSelectedCashAccount("all");
    setSelectedStatus("all");
    setSortBy("date_desc");
    setPage(0);
  }, []);

  const closeSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  return {
    categories,

    stats,
    filteredItems,
    paginatedItems,
    selectedItems,
    viewItem,
    deleteTarget,

    selectedTab,
    searchQuery,
    period,
    selectedCategory,
    selectedCashAccount,
    selectedStatus,
    sortBy,
    viewMode,

    page,
    rowsPerPage,

    drawerOpen,
    invoiceDrawerOpen,
    formValues,
    formErrors,
    editingId,
    isLoading,
    snackbar,

    openCreateDrawer,
    setSelectedTab,
    setSearchQuery,
    setPeriod,
    setSelectedCategory,
    setSelectedCashAccount,
    setSelectedStatus,
    setSortBy,
    setViewMode,
    setPage,
    setRowsPerPage,
    setSelectedItems,
    setDrawerOpen,
    setInvoiceDrawerOpen,
    setViewItem,
    setDeleteTarget,

    handleFormChange,
    handleSaveExpense,
    handleInvoiceCreated,
    handleEdit,
    handleDelete,
    confirmDelete,
    handleDuplicate,
    handleArchive,
    handleBulkArchive,
    handleBulkDelete,
    handleExport,
    clearFilters,
    closeSnackbar,
  };
}