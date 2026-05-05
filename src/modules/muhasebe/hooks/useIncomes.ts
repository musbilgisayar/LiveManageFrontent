"use client";

import { useCallback, useMemo, useState } from "react";
import { format } from "date-fns";

import type { IncomeCreatePayload } from "@/modules/muhasebe/components/incomes/IncomeCreateDrawer";
import type {
  IncomeItem,
  IncomeSortValue,
  IncomeStatus,
  IncomeTabValue,
  IncomeViewMode,
} from "@/modules/muhasebe/types/income.types";
import {
  createIncomeId,
  downloadIncomesCsv,
  mockIncomes,
} from "@/modules/muhasebe/utils/muhasebeIncome.utils";

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

export function useIncomes() {
  const [items, setItems] = useState<IncomeItem[]>(mockIncomes);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [selectedTab, setSelectedTab] = useState<IncomeTabValue>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [period, setPeriod] = useState(format(new Date(), "yyyy-MM"));
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | IncomeStatus>("all");
  const [sortBy, setSortBy] = useState<IncomeSortValue>("date_desc");
  const [viewMode, setViewMode] = useLocalStorage<IncomeViewMode>(
    "incomes-view-mode",
    "grid",
  );

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [viewItem, setViewItem] = useState<IncomeItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IncomeItem | null>(null);
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
      posted: items.filter((item) => item.status === "posted").length,
      draft: items.filter((item) => item.status === "draft").length,
      cancelled: items.filter((item) => item.status === "cancelled").length,
      totalIncome: items
        .filter((item) => item.status === "posted")
        .reduce((sum, item) => sum + item.amount, 0),
      draftAmount: items
        .filter((item) => item.status === "draft")
        .reduce((sum, item) => sum + item.amount, 0),
      bankCount: items.filter((item) => item.paymentMethod.includes("Banka"))
        .length,
      cashCount: items.filter((item) => item.paymentMethod.includes("Nakit"))
        .length,
    }),
    [items],
  );

  const showSnackbar = useCallback(
    (message: string, severity: "success" | "error" | "info" = "success") => {
      setSnackbar({ open: true, message, severity });
    },
    [],
  );

  const filteredItems = useMemo(() => {
    let data = [...items];

    if (selectedTab !== "all") {
      data = data.filter((item) => item.status === selectedTab);
    }

    if (period) {
      data = data.filter((item) => item.incomeDate.startsWith(period));
    }

    if (selectedCategory !== "all") {
      data = data.filter((item) => item.category === selectedCategory);
    }

    if (selectedPaymentMethod !== "all") {
      data = data.filter((item) => item.paymentMethod === selectedPaymentMethod);
    }

    if (selectedStatus !== "all") {
      data = data.filter((item) => item.status === selectedStatus);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();

      data = data.filter((item) =>
        [
          item.category,
          item.customerName,
          item.paymentMethod,
          item.invoiceNo ?? "",
          item.description ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(query),
      );
    }

    data.sort((a, b) => {
      switch (sortBy) {
        case "date_asc":
          return (
            new Date(a.incomeDate).getTime() -
            new Date(b.incomeDate).getTime()
          );

        case "date_desc":
          return (
            new Date(b.incomeDate).getTime() -
            new Date(a.incomeDate).getTime()
          );

        case "amount_asc":
          return a.amount - b.amount;

        case "amount_desc":
          return b.amount - a.amount;

        case "customer_asc":
          return a.customerName.localeCompare(b.customerName, "tr");

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
    selectedPaymentMethod,
    selectedStatus,
    searchQuery,
    sortBy,
  ]);

  const paginatedItems = useMemo(() => {
    return filteredItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredItems, page, rowsPerPage]);

  const handleCreated = useCallback(
    (payload: IncomeCreatePayload) => {
      const nowIso = new Date().toISOString();

      const newItem: IncomeItem = {
        id: createIncomeId(),
        category: payload.category,
        customerName: payload.customerName,
        incomeDate: payload.incomeDate,
        amount: payload.amount,
        currency: payload.currency,
        paymentMethod: payload.paymentMethod,
        invoiceNo: payload.invoiceNo,
        description: payload.description,
        status: "posted",
        isArchived: false,
        createdAt: nowIso,
        updatedAt: nowIso,
        createdBy: "Admin",
      };

      setItems((prev) => [newItem, ...prev]);
      showSnackbar("Gelir kaydı oluşturuldu.", "success");
    },
    [showSnackbar],
  );

  const handleDuplicate = useCallback(
    async (item: IncomeItem) => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 250));

      const duplicated: IncomeItem = {
        ...item,
        id: createIncomeId(),
        invoiceNo: item.invoiceNo ? `${item.invoiceNo}_COPY` : undefined,
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setItems((prev) => [duplicated, ...prev]);
      showSnackbar("Gelir kaydı kopyalandı.", "success");
      setIsLoading(false);
    },
    [showSnackbar],
  );

  const handleArchive = useCallback(
    async (item: IncomeItem) => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 250));

      setItems((prev) =>
        prev.map((income) =>
          income.id === item.id
            ? {
                ...income,
                isArchived: !income.isArchived,
                updatedAt: new Date().toISOString(),
              }
            : income,
        ),
      );

      showSnackbar(
        item.isArchived ? "Gelir arşivden çıkarıldı." : "Gelir arşivlendi.",
        "success",
      );

      setIsLoading(false);
    },
    [showSnackbar],
  );

  const handleDelete = useCallback((item: IncomeItem) => {
    setDeleteTarget(item);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 250));

    setItems((prev) => prev.filter((item) => item.id !== deleteTarget.id));
    setSelectedItems((prev) => prev.filter((id) => id !== deleteTarget.id));
    setDeleteTarget(null);

    showSnackbar("Gelir kaydı silindi.", "success");
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

    showSnackbar(`${selectedItems.length} gelir arşivlendi.`, "success");
    setSelectedItems([]);
    setIsLoading(false);
  }, [selectedItems, showSnackbar]);

  const handleBulkDelete = useCallback(async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 250));

    setItems((prev) => prev.filter((item) => !selectedItems.includes(item.id)));

    showSnackbar(`${selectedItems.length} gelir silindi.`, "success");
    setSelectedItems([]);
    setIsLoading(false);
  }, [selectedItems, showSnackbar]);

  const handleExport = useCallback(() => {
    if (filteredItems.length === 0) {
      showSnackbar("Dışa aktarılacak kayıt bulunamadı.", "error");
      return;
    }

    downloadIncomesCsv(filteredItems);
    showSnackbar("CSV export tamamlandı.", "success");
  }, [filteredItems, showSnackbar]);

  const clearFilters = useCallback(() => {
    setSelectedTab("all");
    setSearchQuery("");
    setPeriod(format(new Date(), "yyyy-MM"));
    setSelectedCategory("all");
    setSelectedPaymentMethod("all");
    setSelectedStatus("all");
    setSortBy("date_desc");
    setPage(0);
  }, []);

  const closeSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  return {
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
    selectedPaymentMethod,
    selectedStatus,
    sortBy,
    viewMode,

    page,
    rowsPerPage,

    drawerOpen,
    isLoading,
    snackbar,

    setSelectedTab,
    setSearchQuery,
    setPeriod,
    setSelectedCategory,
    setSelectedPaymentMethod,
    setSelectedStatus,
    setSortBy,
    setViewMode,
    setPage,
    setRowsPerPage,
    setSelectedItems,
    setDrawerOpen,
    setViewItem,
    setDeleteTarget,

    handleCreated,
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