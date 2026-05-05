//bu sayfa, muhasebe modülü için gider kategorileri yönetim görünümünü sağlar. Kullanıcı, gider kategorilerini listeleyebilir, arayabilir, filtreleyebilir, sıralayabilir ve farklı görünümler arasında geçiş yapabilir. Ayrıca, yeni kategori oluşturabilir, mevcut kategorileri düzenleyebilir, kopyalayabilir, aktif/pasif yapabilir ve silebilir. Kategoriler hakkında istatistikler sunar ve CSV formatında dışa aktarım imkanı verir. Veriler mock olarak sağlanır ve gerçek backend bağlantısı tamamlandığında canlı verilerle güncellenecektir.
// src/modules/muhasebe/views/MuhasebeExpenseCategoriesView.tsx
"use client";

import React, { useMemo, useState, useCallback } from "react";
import {
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Drawer,
  Fade,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useTheme,
  Snackbar,
  Alert,
  LinearProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Checkbox,
  FormControlLabel,
  Badge,
  Paper,
  Zoom,
} from "@mui/material";
import {
  IconEdit,
  IconPlus,
  IconSearch,
  IconTrash,
  IconX,
  IconSettings,
  IconCategory,
  IconBuildingBank,
  IconRepeat,
  IconReceiptTax,
  IconArchive,
  IconCopy,
  IconCheck,
  IconExclamationCircle,
  IconLayoutGrid,
  IconLayoutList,
  IconDownload,
  IconUpload,
  IconFilter,
  IconTags,
  IconEye,
} from "@tabler/icons-react";
import { useMuhasebeExpenseCategories } from "@/modules/muhasebe/hooks/useMuhasebeExpenseCategories";
import type { ExpenseCategory } from "@/modules/muhasebe/types/MuhasebeExpenseCategory.types";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

type CategoryStatus = "active" | "inactive" | "archived";
type ViewMode = "grid" | "list";

type SortField = "name" | "code" | "sortOrder" | "createdAt" | "usageCount" | "isActive";
type SortDirection = "asc" | "desc";

interface CategoryForm {
  name: string;
  code: string;
  description: string;
  isActive: boolean;
  tags: string[];
}

interface CategoryStats {
  total: number;
  active: number;
  inactive: number;
  system: number;
}

const INITIAL_FORM: CategoryForm = {
  name: "",
  code: "",
  description: "",
  isActive: true,
  tags: [],
};

const popularTags = ["temizlik", "bakım", "elektrik", "su", "doğalgaz", "idari", "hukuk", "danışmanlık"];

// Custom hook for local storage
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}

function normalizeCode(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replaceAll(" ", "_")
    .replaceAll("İ", "I")
    .replaceAll("Ş", "S")
    .replaceAll("Ğ", "G")
    .replaceAll("Ü", "U")
    .replaceAll("Ö", "O")
    .replaceAll("Ç", "C")
    .replace(/[^A-Z0-9_]/g, "");
}

// Premium Summary Card Component
function PremiumSummaryCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
}) {
  const theme = useTheme();

  return (
    <Fade in timeout={300}>
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: `1px solid ${alpha(theme.palette.divider, 0.85)}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${alpha(theme.palette.grey[50], 0.7)} 100%)`,
          transition: "all 0.2s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            borderColor: alpha(color || theme.palette.primary.main, 0.25),
            boxShadow: `0 16px 40px ${alpha(theme.palette.common.black, 0.07)}`,
          },
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
                {title}
              </Typography>
              <Typography variant="h4" fontWeight={900} sx={{ mt: 0.5 }}>
                {value}
              </Typography>
              {subtitle && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
            {icon && (
              <Avatar
                sx={{
                  bgcolor: alpha(color || theme.palette.primary.main, 0.1),
                  color: color || theme.palette.primary.main,
                  width: 44,
                  height: 44,
                }}
              >
                {icon}
              </Avatar>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Fade>
  );
}

// Category Card Component for Grid View
function CategoryCard({
  category,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleActive,
  selected,
  onSelect,
}: {
  category: ExpenseCategory;
  onEdit: (category: ExpenseCategory) => void;
  onDelete: (category: ExpenseCategory) => void;
  onDuplicate: (category: ExpenseCategory) => void;
  onToggleActive: (category: ExpenseCategory) => void;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const theme = useTheme();

  return (
    <Zoom in style={{ transitionDelay: "50ms" }}>
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
          transition: "all 0.2s ease",
          position: "relative",
          "&:hover": {
            borderColor: alpha(theme.palette.primary.main, 0.22),
            boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.06)}`,
            transform: "translateY(-2px)",
          },
          ...(selected && {
            borderColor: theme.palette.primary.main,
            bgcolor: alpha(theme.palette.primary.main, 0.02),
          }),
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar
                  sx={{
                    width: 44,
                    height: 44,
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                    color: theme.palette.primary.main,
                  }}
                >
                  <IconCategory size={22} />
                </Avatar>
                <Box>
                  <Typography fontWeight={800} fontSize="1rem">
                    {category.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                    {category.code}
                  </Typography>
                </Box>
              </Stack>
              <Checkbox
                checked={selected}
                onChange={() => onSelect(category.id)}
                size="small"
              />
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>
              {category.description || "Açıklama girilmemiş."}
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {category.isSystem && (
                <Chip size="small" label="Sistem" color="info" variant="filled" />
              )}
              <Chip
                size="small"
                label={category.isActive ? "Aktif" : "Pasif"}
                color={category.isActive ? "success" : "default"}
                variant={category.isActive ? "filled" : "outlined"}
                icon={category.isActive ? <IconCheck size={14} /> : undefined}
              />
              <Chip size="small" label={`Sıra: ${category.sortOrder}`} variant="outlined" />
            </Stack>

            {category.tags && category.tags.length > 0 && (
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {category.tags.slice(0, 3).map(tag => (
                  <Chip key={tag} size="small" label={tag} variant="outlined" sx={{ fontSize: "0.7rem" }} />
                ))}
                {category.tags.length > 3 && (
                  <Chip size="small" label={`+${category.tags.length - 3}`} variant="outlined" />
                )}
              </Stack>
            )}

            <Divider sx={{ my: 0.5 }} />

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  Oluşturulma: {format(new Date(category.createdAt), "dd.MM.yyyy")}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Düzenle">
                  <IconButton size="small" onClick={() => onEdit(category)}>
                    <IconEdit size={16} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Kopyala">
                  <IconButton size="small" onClick={() => onDuplicate(category)}>
                    <IconCopy size={16} />
                  </IconButton>
                </Tooltip>
                <Tooltip title={category.isActive ? "Pasif Yap" : "Aktif Yap"}>
                  <IconButton size="small" onClick={() => onToggleActive(category)}>
                    <IconArchive size={16} />
                  </IconButton>
                </Tooltip>
                {!category.isSystem && (
                  <Tooltip title="Sil">
                    <IconButton size="small" color="error" onClick={() => onDelete(category)}>
                      <IconTrash size={16} />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Zoom>
  );
}

// Category Row Component for List View
function CategoryRow({
  category,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleActive,
  selected,
  onSelect,
}: {
  category: ExpenseCategory;
  onEdit: (category: ExpenseCategory) => void;
  onDelete: (category: ExpenseCategory) => void;
  onDuplicate: (category: ExpenseCategory) => void;
  onToggleActive: (category: ExpenseCategory) => void;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const theme = useTheme();

  return (
    <TableRow hover selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox checked={selected} onChange={() => onSelect(category.id)} />
      </TableCell>
      <TableCell>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: theme.palette.primary.main,
            }}
          >
            <IconCategory size={16} />
          </Avatar>
          <Box>
            <Typography fontWeight={600}>{category.name}</Typography>
            <Typography variant="caption" color="text.secondary" fontFamily="monospace">
              {category.code}
            </Typography>
          </Box>
        </Stack>
      </TableCell>
      <TableCell>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
          {category.description || "-"}
        </Typography>
      </TableCell>
      <TableCell>
        <Chip
          size="small"
          label={category.isActive ? "Aktif" : "Pasif"}
          color={category.isActive ? "success" : "default"}
          variant={category.isActive ? "filled" : "outlined"}
        />
      </TableCell>
      <TableCell>{category.sortOrder}</TableCell>
      <TableCell>
        {category.isSystem && <Chip size="small" label="Sistem" color="info" />}
      </TableCell>
      <TableCell align="center">
        <Stack direction="row" spacing={0.5} justifyContent="center">
          <Tooltip title="Düzenle">
            <IconButton size="small" onClick={() => onEdit(category)}>
              <IconEdit size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Kopyala">
            <IconButton size="small" onClick={() => onDuplicate(category)}>
              <IconCopy size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title={category.isActive ? "Pasif Yap" : "Aktif Yap"}>
            <IconButton size="small" onClick={() => onToggleActive(category)}>
              <IconArchive size={16} />
            </IconButton>
          </Tooltip>
          {!category.isSystem && (
            <Tooltip title="Sil">
              <IconButton size="small" color="error" onClick={() => onDelete(category)}>
                <IconTrash size={16} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </TableCell>
    </TableRow>
  );
}

export default function MuhasebeExpenseCategoriesView() {
  const theme = useTheme();


  const {
    categories,
    create,
    update,
    toggleActive,
    remove,
  } = useMuhasebeExpenseCategories();
  // UI State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | CategoryStatus>("all");
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>("expense-categories-view", "grid");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField>("sortOrder");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Form State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>(INITIAL_FORM);
  const [deleteTarget, setDeleteTarget] = useState<ExpenseCategory | null>(null);

  // Loading & Feedback
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

  const showSnackbar = useCallback(
    (message: string, severity: "success" | "error" | "info" = "success") => {
      setSnackbar({ open: true, message, severity });
    },
    [],
  );

  // Stats
  const stats = useMemo<CategoryStats>(() => {
    return {
      total: categories.length,
      active: categories.filter((x) => x.isActive).length,
      inactive: categories.filter((x) => !x.isActive).length,
      system: categories.filter((x) => x.isSystem).length,
    };
  }, [categories]);

  // Filtered and Sorted Categories
  const filteredCategories = useMemo(() => {
    let list = [...categories];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (x) =>
          x.name.toLowerCase().includes(q) ||
          x.code.toLowerCase().includes(q) ||
          (x.description && x.description.toLowerCase().includes(q)),
      );
    }

    if (statusFilter !== "all") {
      list = list.filter((x) =>
        statusFilter === "active" ? x.isActive : !x.isActive,
      );
    }

    // Sorting
    list.sort((a, b) => {

      let aValue: string | number | boolean | undefined = a[sortField];
      let bValue: string | number | boolean | undefined = b[sortField];

      if (sortField === "usageCount") {
        aValue = a.usageCount ?? 0;
        bValue = b.usageCount ?? 0;
      }


      if (sortField === "createdAt") {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
      }

      const safeA = aValue ?? "";
      const safeB = bValue ?? "";

      if (safeA < safeB) return sortDirection === "asc" ? -1 : 1;
      if (safeA > safeB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [categories, search, statusFilter, sortField, sortDirection]);

  // Pagination
  const paginatedCategories = useMemo(() => {
    return filteredCategories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredCategories, page, rowsPerPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setPage(0);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setDrawerOpen(true);
  };

  const openEdit = (item: ExpenseCategory) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      code: item.code,
      description: item.description || "",
      isActive: item.isActive,
      tags: item.tags || [],
    });
    setDrawerOpen(true);
  };

  const handleDuplicate = useCallback(async (category: ExpenseCategory) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    create({
      name: `${category.name} (Kopya)`,
      code: `${category.code}_COPY`,
      description: category.description,
      isActive: false,
      isSystem: false,
      sortOrder: categories.length + 1,
      tags: category.tags,
    });

    showSnackbar("Kategori kopyalandı", "success");
    setIsLoading(false);
  }, [categories.length, create, showSnackbar]);

  const handleSave = useCallback(async () => {
    if (!form.name.trim()) {
      showSnackbar("Kategori adı zorunludur", "error");
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const normalizedCode =
      form.code.trim() ||
      normalizeCode(form.name);

    if (editingId) {
      update(editingId, {
        name: form.name.trim(),
        code: normalizedCode,
        description: form.description.trim() || undefined,
        isActive: form.isActive,
        tags: form.tags,
      });
      showSnackbar("Kategori başarıyla güncellendi", "success");
    } else {
      create({
        name: form.name.trim(),
        code: normalizedCode,
        description: form.description.trim() || undefined,
        isActive: form.isActive,
        isSystem: false,
        sortOrder: categories.length + 1,
        tags: form.tags,
      });
      showSnackbar("Yeni kategori oluşturuldu", "success");
    }

    setDrawerOpen(false);
    setEditingId(null);
    setForm(INITIAL_FORM);
    setIsLoading(false);
  }, [form, editingId, create, update, categories.length, showSnackbar]);

  const handleToggleActive = useCallback(async (item: ExpenseCategory) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    toggleActive(item.id);
    showSnackbar(item.isActive ? "Kategori pasif yapıldı" : "Kategori aktif yapıldı", "success");
    setIsLoading(false);
  }, [toggleActive, showSnackbar]);

  const handleDeleteClick = useCallback((category: ExpenseCategory) => {
    if (category.isSystem) {
      showSnackbar("Sistem kategorileri silinemez", "error");
      return;
    }
    setDeleteTarget(category);
  }, [showSnackbar]);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    remove(deleteTarget.id);
    setSelectedItems(prev => prev.filter(id => id !== deleteTarget.id));
    setDeleteTarget(null);
    showSnackbar("Kategori silindi", "success");
    setIsLoading(false);
  }, [deleteTarget, remove, showSnackbar]);

  const handleBulkToggle = useCallback(async (active: boolean) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    selectedItems.forEach(id => {
      const category = categories.find(c => c.id === id);
      if (category && !category.isSystem) {
        toggleActive(id);
      }
    });

    showSnackbar(`${selectedItems.length} kategori ${active ? "aktif" : "pasif"} yapıldı`, "success");
    setSelectedItems([]);
    setIsLoading(false);
  }, [selectedItems, categories, toggleActive, showSnackbar]);

  const handleBulkDelete = useCallback(async () => {
    const nonSystemItems = selectedItems.filter(id => {
      const category = categories.find(c => c.id === id);
      return category && !category.isSystem;
    });

    if (nonSystemItems.length === 0) {
      showSnackbar("Sistem kategorileri silinemez", "error");
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    nonSystemItems.forEach(id => remove(id));
    showSnackbar(`${nonSystemItems.length} kategori silindi`, "success");
    setSelectedItems([]);
    setIsLoading(false);
  }, [selectedItems, categories, remove, showSnackbar]);

  const handleExport = useCallback(() => {
    const data = filteredCategories.map(cat => ({
      ID: cat.id,
      Ad: cat.name,
      Kod: cat.code,
      Açıklama: cat.description,
      "Aktif": cat.isActive ? "Evet" : "Hayır",
      "Sistem": cat.isSystem ? "Evet" : "Hayır",
      "Sıra": cat.sortOrder,
      Etiketler: cat.tags?.join(", ") || "",
      "Oluşturma Tarihi": format(new Date(cat.createdAt), "dd.MM.yyyy"),
    }));

    const csv = [
      Object.keys(data[0] || {}).join(","),
      ...data.map(row => Object.values(row).map(v => `"${v}"`).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `gider_kategorileri_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);

    showSnackbar("Veriler CSV olarak dışa aktarıldı", "success");
  }, [filteredCategories, showSnackbar]);

  const clearFilters = useCallback(() => {
    setSearch("");
    setStatusFilter("all");
    setSortField("sortOrder");
    setSortDirection("asc");
    setPage(0);
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedItems.length === paginatedCategories.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedCategories.map(c => c.id));
    }
  }, [selectedItems.length, paginatedCategories]);

  return (
   <Box sx={{ p: 0 }}>
      {isLoading && <LinearProgress sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999 }} />}

      <Stack spacing={3}>
        {/* Header */}
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={2}>
          <Box>
            <Typography variant="h4" fontWeight={900}>
              Gider Kalemleri
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              Gider kategorilerini yönetin, etiketleyin ve raporlayın.
            </Typography>
          </Box>

          <Button variant="contained" startIcon={<IconPlus size={18} />} onClick={openCreate}>
            Yeni Kategori
          </Button>
        </Stack>

        {/* Stats Cards */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <PremiumSummaryCard
              title="Toplam Kategori"
              value={stats.total}
              icon={<IconCategory size={20} />}
              color={theme.palette.primary.main}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <PremiumSummaryCard
              title="Aktif"
              value={stats.active}
              subtitle={`${stats.total ? ((stats.active / stats.total) * 100).toFixed(0) : 0}%`}
              icon={<IconCheck size={20} />}
              color="#10b981"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <PremiumSummaryCard
              title="Pasif"
              value={stats.inactive}
              icon={<IconArchive size={20} />}
              color="#f59e0b"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <PremiumSummaryCard
              title="Sistem"
              value={stats.system}
              subtitle="Ön tanımlı kategoriler"
              icon={<IconSettings size={20} />}
              color="#8b5cf6"
            />
          </Grid>
        </Grid>

        {/* Main Content Card */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
            boxShadow: "none",
          }}
        >
          <CardContent>
            {/* Filters */}
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                fullWidth
                size="small"
                placeholder="Ad, kod veya açıklamaya göre ara..."
                value={search}
                onChange={(event) => { setSearch(event.target.value); setPage(0); }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconSearch size={18} />
                    </InputAdornment>
                  ),
                  endAdornment: search && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearch("")}>
                        <IconX size={14} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                select
                size="small"
                label="Durum"
                value={statusFilter}
                onChange={(event) => { setStatusFilter(event.target.value as any); setPage(0); }}
                sx={{ minWidth: 160 }}
              >
                <MenuItem value="all">Tümü</MenuItem>
                <MenuItem value="active">Aktif</MenuItem>
                <MenuItem value="inactive">Pasif</MenuItem>
              </TextField>

              <ToggleButtonGroup value={viewMode} exclusive onChange={(_, value) => value && setViewMode(value)} size="small">
                <ToggleButton value="grid">
                  <IconLayoutGrid size={18} />
                </ToggleButton>
                <ToggleButton value="list">
                  <IconLayoutList size={18} />
                </ToggleButton>
              </ToggleButtonGroup>

              <Tooltip title="Dışa Aktar (CSV)">
                <IconButton onClick={handleExport}>
                  <IconDownload size={18} />
                </IconButton>
              </Tooltip>
            </Stack>

            {/* Filter Info and Bulk Actions */}
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1} sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {filteredCategories.length} kategori listeleniyor
              </Typography>
              <Button size="small" variant="text" onClick={clearFilters}>
                Filtreleri Temizle
              </Button>
            </Stack>

            {selectedItems.length > 0 && (
              <Alert
                severity="info"
                sx={{ mt: 2 }}
                action={
                  <Stack direction="row" spacing={1}>
                    <Button size="small" onClick={() => handleBulkToggle(true)} startIcon={<IconCheck size={14} />}>
                      Aktif Yap
                    </Button>
                    <Button size="small" onClick={() => handleBulkToggle(false)} startIcon={<IconArchive size={14} />}>
                      Pasif Yap
                    </Button>
                    <Button size="small" color="error" onClick={handleBulkDelete} startIcon={<IconTrash size={14} />}>
                      Sil
                    </Button>
                    <Button size="small" onClick={() => setSelectedItems([])}>Temizle</Button>
                  </Stack>
                }
              >
                {selectedItems.length} kategori seçildi.
              </Alert>
            )}

            <Divider sx={{ my: 2.5 }} />

            {/* Content */}
            {filteredCategories.length === 0 ? (
              <Box sx={{ p: 8, textAlign: "center" }}>
                <IconTags size={48} style={{ opacity: 0.3 }} />
                <Typography fontWeight={700} mt={2}>Gider kategorisi bulunamadı</Typography>
                <Typography variant="body2" color="text.secondary">
                  Filtreleri değiştirin veya yeni bir kategori oluşturun.
                </Typography>
                <Button variant="outlined" startIcon={<IconPlus size={16} />} onClick={openCreate} sx={{ mt: 2 }}>
                  İlk Kategoriyi Oluştur
                </Button>
              </Box>
            ) : viewMode === "grid" ? (
              <>
                <Grid container spacing={2}>
                  {paginatedCategories.map((category) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={category.id}>
                      <CategoryCard
                        category={category}
                        onEdit={openEdit}
                        onDelete={handleDeleteClick}
                        onDuplicate={handleDuplicate}
                        onToggleActive={handleToggleActive}
                        selected={selectedItems.includes(category.id)}
                        onSelect={(id) => {
                          if (selectedItems.includes(id)) {
                            setSelectedItems(prev => prev.filter(i => i !== id));
                          } else {
                            setSelectedItems(prev => [...prev, id]);
                          }
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
                <TablePagination
                  rowsPerPageOptions={[6, 12, 24, 48]}
                  component="div"
                  count={filteredCategories.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(_, newPage) => setPage(newPage)}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
                  sx={{ mt: 2 }}
                />
              </>
            ) : (
              <>
                <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "none", border: `1px solid ${alpha(theme.palette.divider, 0.7)}` }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedItems.length === paginatedCategories.length && paginatedCategories.length > 0}
                            indeterminate={selectedItems.length > 0 && selectedItems.length < paginatedCategories.length}
                            onChange={handleSelectAll}
                          />
                        </TableCell>
                        <TableCell>
                          <TableSortLabel active={sortField === "name"} direction={sortField === "name" ? sortDirection : "asc"} onClick={() => handleSort("name")}>
                            Kategori
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>Açıklama</TableCell>
                        <TableCell>
                          <TableSortLabel active={sortField === "isActive"} direction={sortField === "isActive" ? sortDirection : "asc"} onClick={() => handleSort("isActive")}>
                            Durum
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          <TableSortLabel active={sortField === "sortOrder"} direction={sortField === "sortOrder" ? sortDirection : "asc"} onClick={() => handleSort("sortOrder")}>
                            Sıra
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>Tür</TableCell>
                        <TableCell align="center">İşlemler</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedCategories.map((category) => (
                        <CategoryRow
                          key={category.id}
                          category={category}
                          onEdit={openEdit}
                          onDelete={handleDeleteClick}
                          onDuplicate={handleDuplicate}
                          onToggleActive={handleToggleActive}
                          selected={selectedItems.includes(category.id)}
                          onSelect={(id) => {
                            if (selectedItems.includes(id)) {
                              setSelectedItems(prev => prev.filter(i => i !== id));
                            } else {
                              setSelectedItems(prev => [...prev, id]);
                            }
                          }}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={filteredCategories.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(_, newPage) => setPage(newPage)}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
                  sx={{ mt: 2 }}
                />
              </>
            )}
          </CardContent>
        </Card>
      </Stack>

      {/* Form Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditingId(null); setForm(INITIAL_FORM); }}
        PaperProps={{ sx: { width: { xs: "100%", sm: 520 }, p: 3 } }}
      >
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" fontWeight={800}>
                {editingId ? "Kategori Düzenle" : "Yeni Kategori"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gider kategorisi tanımı ve özellikleri.
              </Typography>
            </Box>
            <IconButton onClick={() => { setDrawerOpen(false); setEditingId(null); setForm(INITIAL_FORM); }}>
              <IconX size={20} />
            </IconButton>
          </Stack>

          <TextField
            label="Ad *"
            value={form.name}
            onChange={(event) => {
              const name = event.target.value;
              setForm((prev) => ({
                ...prev,
                name,
                code: prev.code ? prev.code : normalizeCode(name),
              }));
            }}
            fullWidth
            required
          />

          <TextField
            label="Kod"
            value={form.code}
            onChange={(event) => setForm((prev) => ({ ...prev, code: normalizeCode(event.target.value) }))}
            fullWidth
            helperText="Boş bırakılırsa addan otomatik üretilir."
          />

          <TextField
            label="Açıklama"
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            fullWidth
            multiline
            minRows={3}
          />

          <TextField
            select
            label="Etiketler"
            value={form.tags}
            onChange={(event) => setForm((prev) => ({ ...prev, tags: typeof event.target.value === 'string' ? [event.target.value] : event.target.value }))}
            fullWidth
            SelectProps={{ multiple: true }}
            helperText="Kategorilendirme için etiket ekleyin"
          >
            {popularTags.map(tag => (
              <MenuItem key={tag} value={tag}>
                <Checkbox checked={form.tags.includes(tag)} />
                {tag}
              </MenuItem>
            ))}
          </TextField>

          <Divider />

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography fontWeight={700}>Aktif</Typography>
              <Typography variant="body2" color="text.secondary">
                Pasif kategoriler gider kayıtlarında seçilemez.
              </Typography>
            </Box>
            <Switch
              checked={form.isActive}
              onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
            />
          </Stack>

          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button onClick={() => { setDrawerOpen(false); setEditingId(null); setForm(INITIAL_FORM); }}>
              Vazgeç
            </Button>
            <Button variant="contained" onClick={handleSave} disabled={isLoading || !form.name.trim()}>
              {isLoading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </Stack>
        </Stack>
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} fullWidth maxWidth="xs">
        <DialogTitle>Kategoriyi Sil</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary">
            <strong>{deleteTarget?.name}</strong> kategorisini silmek istediğinize emin misiniz?
            Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Vazgeç</Button>
          <Button color="error" variant="contained" onClick={confirmDelete} disabled={isLoading}>
            {isLoading ? "Siliniyor..." : "Sil"}
          </Button>
        </DialogActions>
      </Dialog>


 
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}