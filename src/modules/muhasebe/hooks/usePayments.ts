"use client";

import { useCallback, useMemo, useState } from "react";
import { format } from "date-fns";

import type {
    PaymentFormErrors,
    PaymentFormValues,
    PaymentItem,
    PaymentSortValue,
    PaymentStatus,
    PaymentTabValue,
    PaymentViewMode,
} from "@/modules/muhasebe/types/payment.types";
import {
    createPaymentId,
    downloadPaymentsCsv,
    INITIAL_PAYMENT_FORM,
    mockPayments,
    toPaymentFormValues,
    validatePaymentForm,
} from "@/modules/muhasebe/utils/muhasebePayment.utils";

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

export function usePayments() {
    const [items, setItems] = useState<PaymentItem[]>(mockPayments);

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedTab, setSelectedTab] = useState<PaymentTabValue>("all");


    const [searchQuery, setSearchQuery] = useState("");
    const [period, setPeriod] = useState(format(new Date(), "yyyy-MM"));
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all");
    const [selectedCashAccount, setSelectedCashAccount] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState<"all" | PaymentStatus>("all");
    const [sortBy, setSortBy] = useState<PaymentSortValue>("date_desc");

    const [viewMode, setViewMode] = useLocalStorage<PaymentViewMode>("payments-view-mode", "grid",);


    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [formValues, setFormValues] = useState<PaymentFormValues>(
        INITIAL_PAYMENT_FORM,
    );
    const [formErrors, setFormErrors] = useState<PaymentFormErrors>({});
    const [editingId, setEditingId] = useState<string | null>(null);

    const [viewItem, setViewItem] = useState<PaymentItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<PaymentItem | null>(null);
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
            ...INITIAL_PAYMENT_FORM,
            paymentDate: format(new Date(), "yyyy-MM-dd"),
        });
        setFormErrors({});
        setEditingId(null);
    }, []);

    const openCreateDrawer = useCallback(() => {
        resetForm();
        setDrawerOpen(true);
    }, [resetForm]);

    const handleFormChange = useCallback(
        (field: keyof PaymentFormValues, value: string) => {
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
            data = data.filter((item) => item.paymentDate.startsWith(period));
        }

        if (selectedPaymentMethod !== "all") {
            data = data.filter((item) => item.paymentMethod === selectedPaymentMethod);
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
                    item.payerName,
                    item.unit ?? "",
                    item.paymentMethod,
                    item.cashAccount,
                    item.receiptNo ?? "",
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
                    return new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime();

                case "date_desc":
                    return new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime();

                case "amount_asc":
                    return a.amount - b.amount;

                case "amount_desc":
                    return b.amount - a.amount;

                case "payer_asc":
                    return a.payerName.localeCompare(b.payerName, "tr");

                default:
                    return 0;
            }
        });

        return data;

    }, [
        items,
        selectedTab,
        period,
        selectedPaymentMethod,
        selectedCashAccount,
        selectedStatus,
        searchQuery,
        sortBy,
    ]);

    const paginatedItems = useMemo(() => {
        return filteredItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [filteredItems, page, rowsPerPage]);

    const handleSavePayment = useCallback(async () => {
        const errors = validatePaymentForm(formValues);

        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            showSnackbar("Lütfen zorunlu alanları kontrol edin.", "error");
            return;
        }

        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 300));

        const nowIso = new Date().toISOString();

        const normalizedItem: PaymentItem = {
            id: editingId ?? createPaymentId(),
            payerName: formValues.payerName.trim(),
            unit: formValues.unit.trim() || undefined,
            amount: Number(formValues.amount),
            currency: formValues.currency,
            paymentDate: formValues.paymentDate,
            paymentMethod: formValues.paymentMethod,
            cashAccount: formValues.cashAccount,
            receiptNo: formValues.receiptNo.trim() || undefined,
            description: formValues.description.trim() || undefined,
            status: formValues.status,
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
            editingId ? "Tahsilat başarıyla güncellendi." : "Yeni tahsilat başarıyla eklendi.",
            "success",
        );

        setIsLoading(false);
    }, [editingId, formValues, items, resetForm, showSnackbar]);

    const handleEdit = useCallback((item: PaymentItem) => {
        setEditingId(item.id);
        setFormValues(toPaymentFormValues(item));
        setFormErrors({});
        setDrawerOpen(true);
    }, []);

    const handleDuplicate = useCallback(
        async (item: PaymentItem) => {
            setIsLoading(true);
            await new Promise((resolve) => setTimeout(resolve, 250));

            const duplicated: PaymentItem = {
                ...item,
                id: createPaymentId(),
                receiptNo: item.receiptNo ? `${item.receiptNo}_COPY` : undefined,
                status: "draft",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            setItems((prev) => [duplicated, ...prev]);
            showSnackbar("Tahsilat kaydı kopyalandı.", "success");
            setIsLoading(false);
        },
        [showSnackbar],
    );

    const handleArchive = useCallback(
        async (item: PaymentItem) => {
            setIsLoading(true);
            await new Promise((resolve) => setTimeout(resolve, 250));

            setItems((prev) =>
                prev.map((payment) =>
                    payment.id === item.id
                        ? {
                            ...payment,
                            isArchived: !payment.isArchived,
                            updatedAt: new Date().toISOString(),
                        }
                        : payment,
                ),
            );

            showSnackbar(
                item.isArchived ? "Tahsilat arşivden çıkarıldı." : "Tahsilat arşivlendi.",
                "success",
            );

            setIsLoading(false);
        },
        [showSnackbar],
    );

    const handleDelete = useCallback((item: PaymentItem) => {
        setDeleteTarget(item);
    }, []);

    const confirmDelete = useCallback(async () => {
        if (!deleteTarget) return;

        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 250));

        setItems((prev) => prev.filter((item) => item.id !== deleteTarget.id));
        setSelectedItems((prev) => prev.filter((id) => id !== deleteTarget.id));
        setDeleteTarget(null);

        showSnackbar("Tahsilat kaydı silindi.", "success");
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

        showSnackbar(`${selectedItems.length} tahsilat arşivlendi.`, "success");
        setSelectedItems([]);
        setIsLoading(false);
    }, [selectedItems, showSnackbar]);

    const handleBulkDelete = useCallback(async () => {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 250));

        setItems((prev) => prev.filter((item) => !selectedItems.includes(item.id)));

        showSnackbar(`${selectedItems.length} tahsilat silindi.`, "success");
        setSelectedItems([]);
        setIsLoading(false);
    }, [selectedItems, showSnackbar]);

    const handleExport = useCallback(() => {
        if (filteredItems.length === 0) {
            showSnackbar("Dışa aktarılacak kayıt bulunamadı.", "error");
            return;
        }

        downloadPaymentsCsv(filteredItems);
        showSnackbar("CSV export tamamlandı.", "success");
    }, [filteredItems, showSnackbar]);

    const clearFilters = useCallback(() => {
        setSelectedTab("all");
        setSearchQuery("");
        setPeriod(format(new Date(), "yyyy-MM"));
        setSelectedPaymentMethod("all");
        setSelectedCashAccount("all");
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
        selectedPaymentMethod,
        selectedCashAccount,
        selectedStatus,
        sortBy,
        viewMode,

        page,
        rowsPerPage,

        drawerOpen,
        formValues,
        formErrors,
        editingId,
        isLoading,
        snackbar,
        setSelectedTab,
        setSearchQuery,
        setPeriod,
        setSelectedPaymentMethod,
        setSelectedCashAccount,
        setSelectedStatus,
        setSortBy,
        setViewMode,
        openCreateDrawer,





        setPage,
        setRowsPerPage,
        setSelectedItems,
        setDrawerOpen,
        setViewItem,
        setDeleteTarget,

        handleFormChange,
        handleSavePayment,
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