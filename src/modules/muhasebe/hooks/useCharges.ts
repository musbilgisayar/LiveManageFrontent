"use client";

import { useCallback, useMemo, useState } from "react";
import { format } from "date-fns";

import type {
  BulkFormErrors,
  BulkFormValues,
  ChargeFormErrors,
  ChargeFormValues,
  ChargeItem,
  ChargeStatus,
  ChargeType,
  PaymentState,
  SortValue,
  TabValue,
  ViewMode,
} from "@/modules/muhasebe/types/MuhasebeCharge.types";

import {
  INITIAL_BULK_FORM,
  INITIAL_FORM,
  mockCharges,
  UNITS,
  createChargeId,
  createReferenceNo,
  getChargeTypeConfig,
  getPaymentState,
  getRemainingAmount,
  isChargeOverdue,
  validateBulkForm,
  validateForm,
} from "@/modules/muhasebe/utils/muhasebeCharge.utils";

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

export function useCharges() {
  const [items, setItems] = useState<ChargeItem[]>(mockCharges);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bulkDrawerOpen, setBulkDrawerOpen] = useState(false);
  const [bulkStep, setBulkStep] = useState(0);

  const [selectedTab, setSelectedTab] = useState<TabValue>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | ChargeStatus>("all");
  const [selectedPaymentState, setSelectedPaymentState] =
    useState<"all" | PaymentState>("all");
  const [selectedType, setSelectedType] = useState<"all" | ChargeType>("all");
  const [period, setPeriod] = useState(format(new Date(), "yyyy-MM"));
  const [sortBy, setSortBy] = useState<SortValue>("due_desc");
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>(
    "charges-view-mode",
    "grid",
  );

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [formValues, setFormValues] = useState<ChargeFormValues>(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<ChargeFormErrors>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const [bulkForm, setBulkForm] = useState<BulkFormValues>(INITIAL_BULK_FORM);
  const [bulkErrors, setBulkErrors] = useState<BulkFormErrors>({});

  const [viewItem, setViewItem] = useState<ChargeItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ChargeItem | null>(null);
  const [cancelTarget, setCancelTarget] = useState<ChargeItem | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const stats = useMemo(() => {
    const posted = items.filter((item) => item.status === "posted");

    return {
      total: items.length,
      draft: items.filter((item) => item.status === "draft").length,
      posted: posted.length,
      overdue: items.filter(isChargeOverdue).length,
      partial: items.filter((item) => getPaymentState(item) === "partial").length,
      totalDebt: posted.reduce((sum, item) => sum + item.amount, 0),
      totalPaid: posted.reduce((sum, item) => sum + item.paidAmount, 0),
      totalRemaining: posted.reduce(
        (sum, item) => sum + getRemainingAmount(item),
        0,
      ),
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    let data = [...items];

    if (selectedTab === "draft") {
      data = data.filter((item) => item.status === "draft");
    }

    if (selectedTab === "posted") {
      data = data.filter((item) => item.status === "posted");
    }

    if (selectedTab === "overdue") {
      data = data.filter(isChargeOverdue);
    }

    if (selectedTab === "partial") {
      data = data.filter((item) => getPaymentState(item) === "partial");
    }

    if (selectedStatus !== "all") {
      data = data.filter((item) => item.status === selectedStatus);
    }

    if (selectedPaymentState !== "all") {
      data = data.filter(
        (item) => getPaymentState(item) === selectedPaymentState,
      );
    }

    if (selectedType !== "all") {
      data = data.filter((item) => item.chargeType === selectedType);
    }

    if (period) {
      data = data.filter((item) => item.period === period);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();

      data = data.filter((item) =>
        [
          item.unit,
          item.block,
          item.residentName,
          item.chargeTypeLabel,
          item.referenceNo ?? "",
          item.description ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(query),
      );
    }

    data.sort((a, b) => {
      switch (sortBy) {
        case "due_asc":
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();

        case "due_desc":
          return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();

        case "amount_asc":
          return a.amount - b.amount;

        case "amount_desc":
          return b.amount - a.amount;

        case "unit_asc":
          return a.unit.localeCompare(b.unit, "tr");

        default:
          return 0;
      }
    });

    return data;
  }, [
    items,
    selectedTab,
    selectedStatus,
    selectedPaymentState,
    selectedType,
    period,
    searchQuery,
    sortBy,
  ]);

  const paginatedItems = useMemo(() => {
    return filteredItems.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage,
    );
  }, [filteredItems, page, rowsPerPage]);

  const bulkTargetUnits = useMemo(() => {
    if (bulkForm.scope === "all") return UNITS;
    if (bulkForm.scope === "block") {
      return UNITS.filter((unit) => unit.block === bulkForm.block);
    }

    return UNITS.slice(0, 3);
  }, [bulkForm.block, bulkForm.scope]);

  const duplicateBulkItems = useMemo(() => {
    return bulkTargetUnits.filter((unit) =>
      items.some(
        (item) =>
          item.period === bulkForm.period &&
          item.unit === unit.unit &&
          item.chargeType === bulkForm.chargeType &&
          item.status !== "cancelled",
      ),
    );
  }, [bulkForm.chargeType, bulkForm.period, bulkTargetUnits, items]);

  const creatableBulkUnits = useMemo(() => {
    return bulkTargetUnits.filter(
      (unit) =>
        !duplicateBulkItems.some((duplicate) => duplicate.unit === unit.unit),
    );
  }, [bulkTargetUnits, duplicateBulkItems]);

  const resetForm = useCallback(() => {
    setFormValues({
      ...INITIAL_FORM,
      period: format(new Date(), "yyyy-MM"),
      dueDate: format(new Date(), "yyyy-MM-dd"),
    });
    setFormErrors({});
    setEditingId(null);
  }, []);

  const resetBulkForm = useCallback(() => {
    setBulkForm({
      ...INITIAL_BULK_FORM,
      period: format(new Date(), "yyyy-MM"),
      dueDate: format(new Date(), "yyyy-MM-dd"),
    });
    setBulkErrors({});
    setBulkStep(0);
  }, []);

  const openCreateDrawer = useCallback(() => {
    resetForm();
    setDrawerOpen(true);
  }, [resetForm]);

  const openBulkDrawer = useCallback(() => {
    resetBulkForm();
    setBulkDrawerOpen(true);
  }, [resetBulkForm]);

  const handleFormChange = useCallback(
    (field: keyof ChargeFormValues, value: string) => {
      setFormValues((prev) => ({ ...prev, [field]: value }));
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    [],
  );

  const handleBulkChange = useCallback(
    (field: keyof BulkFormValues, value: string) => {
      setBulkForm((prev) => ({ ...prev, [field]: value }));
      setBulkErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    [],
  );

  const handleUnitSelect = useCallback((unitValue: string) => {
    const selectedUnit = UNITS.find((item) => item.unit === unitValue);

    setFormValues((prev) => ({
      ...prev,
      unit: unitValue,
      block: selectedUnit?.block ?? "",
      residentName: selectedUnit?.residentName ?? "",
    }));

    setFormErrors((prev) => ({
      ...prev,
      unit: undefined,
      residentName: undefined,
    }));
  }, []);

  const handleSaveCharge = useCallback(() => {
    const errors = validateForm(formValues);

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsLoading(true);

    const existingItem = editingId
      ? items.find((item) => item.id === editingId)
      : undefined;

    const typeConfig = getChargeTypeConfig(formValues.chargeType);
    const now = new Date().toISOString();

    const nextItem: ChargeItem = {
      id: editingId ?? createChargeId(),
      period: formValues.period,
      unit: formValues.unit,
      block: formValues.block,
      residentName: formValues.residentName,
      chargeType: formValues.chargeType,
      chargeTypeLabel: typeConfig.label,
      amount: Number(formValues.amount),
      paidAmount: existingItem?.paidAmount ?? 0,
      currency: formValues.currency,
      dueDate: formValues.dueDate,
      status: formValues.status,
      description: formValues.description,
      referenceNo: existingItem?.referenceNo ?? createReferenceNo(),
      createdAt: existingItem?.createdAt ?? now,
      updatedAt: now,
      createdBy: existingItem?.createdBy ?? "Admin",
    };

    setItems((prev) =>
      editingId
        ? prev.map((item) => (item.id === editingId ? nextItem : item))
        : [nextItem, ...prev],
    );

    setIsLoading(false);
    setDrawerOpen(false);
    resetForm();
  }, [editingId, formValues, items, resetForm]);

  const handleBulkCreate = useCallback(() => {
    const errors = validateBulkForm(bulkForm);

    if (Object.keys(errors).length > 0) {
      setBulkErrors(errors);
      return;
    }

    setIsLoading(true);

    const typeConfig = getChargeTypeConfig(bulkForm.chargeType);
    const now = new Date().toISOString();

    const newItems: ChargeItem[] = creatableBulkUnits.map((unit) => ({
      id: createChargeId(),
      period: bulkForm.period,
      unit: unit.unit,
      block: unit.block,
      residentName: unit.residentName,
      chargeType: bulkForm.chargeType,
      chargeTypeLabel: typeConfig.label,
      amount: Number(bulkForm.amount),
      paidAmount: 0,
      currency: bulkForm.currency,
      dueDate: bulkForm.dueDate,
      status: "draft",
      description: bulkForm.description,
      referenceNo: createReferenceNo(),
      createdAt: now,
      updatedAt: now,
      createdBy: "Admin",
    }));

    setItems((prev) => [...newItems, ...prev]);

    setIsLoading(false);
    setBulkDrawerOpen(false);
    resetBulkForm();
  }, [bulkForm, creatableBulkUnits, resetBulkForm]);

  const handleEdit = useCallback((item: ChargeItem) => {
    setEditingId(item.id);

    setFormValues({
      period: item.period,
      unit: item.unit,
      block: item.block,
      residentName: item.residentName,
      chargeType: item.chargeType,
      amount: String(item.amount),
      currency: item.currency,
      dueDate: item.dueDate,
      description: item.description ?? "",
      status: item.status,
    });

    setFormErrors({});
    setDrawerOpen(true);
  }, []);

  const handleDelete = useCallback((item: ChargeItem) => {
    setItems((prev) => prev.filter((x) => x.id !== item.id));
    setSelectedItems((prev) => prev.filter((id) => id !== item.id));
  }, []);

  const handlePost = useCallback((item: ChargeItem) => {
    setItems((prev) =>
      prev.map((x) =>
        x.id === item.id
          ? { ...x, status: "posted", updatedAt: new Date().toISOString() }
          : x,
      ),
    );
  }, []);

  const handleCancel = useCallback((item: ChargeItem) => {
    setItems((prev) =>
      prev.map((x) =>
        x.id === item.id
          ? { ...x, status: "cancelled", updatedAt: new Date().toISOString() }
          : x,
      ),
    );
  }, []);

  const handleDuplicate = useCallback((item: ChargeItem) => {
    const now = new Date().toISOString();

    const duplicateItem: ChargeItem = {
      ...item,
      id: createChargeId(),
      referenceNo: createReferenceNo(),
      status: "draft",
      paidAmount: 0,
      createdAt: now,
      updatedAt: now,
    };

    setItems((prev) => [duplicateItem, ...prev]);
  }, []);

const handleExport = useCallback(() => {
  console.log("[MuhasebeCharges] Export requested", {
    total: filteredItems.length,
  });
}, [filteredItems.length]);

const clearFilters = useCallback(() => {
  setSelectedTab("all");
  setSearchQuery("");
  setSelectedStatus("all");
  setSelectedPaymentState("all");
  setSelectedType("all");
  setPeriod(format(new Date(), "yyyy-MM"));
  setSortBy("due_desc");
  setPage(0);
}, []);
  
  return {
    items,
    stats,
    filteredItems,
    paginatedItems,
    bulkTargetUnits,
    duplicateBulkItems,
    creatableBulkUnits,

    drawerOpen,
    bulkDrawerOpen,
    bulkStep,
    selectedTab,
    searchQuery,
    selectedStatus,
    selectedPaymentState,
    selectedType,
    period,
    sortBy,
    viewMode,
    selectedItems,
    page,
    rowsPerPage,
    formValues,
    formErrors,
    editingId,
    bulkForm,
    bulkErrors,
    viewItem,
    deleteTarget,
    cancelTarget,
    isLoading,

    setDrawerOpen,
    setBulkDrawerOpen,
    setBulkStep,
    setSelectedTab,
    setSearchQuery,
    setSelectedStatus,
    setSelectedPaymentState,
    setSelectedType,
    setPeriod,
    setSortBy,
    setViewMode,
    setSelectedItems,
    setPage,
    setRowsPerPage,
    setViewItem,
    setDeleteTarget,
    setCancelTarget,

    resetForm,
    resetBulkForm,
    openCreateDrawer,
    openBulkDrawer,
    handleFormChange,
    handleBulkChange,
    handleUnitSelect,
    handleSaveCharge,
    handleBulkCreate,
    handleEdit,
    handleDelete,
    handlePost,
    handleCancel,
    handleDuplicate,
    handleExport,
    clearFilters,
  };
}