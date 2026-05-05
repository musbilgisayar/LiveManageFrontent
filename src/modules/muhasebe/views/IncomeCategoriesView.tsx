//bu dosya gelir kalemleri yönetimi ekranının ana view componentidir. IncomeCategoriesView, gelir kalemlerini listelemek, yeni gelir kalemi oluşturmak, mevcut gelir kalemini düzenlemek, aktif/pasif durumunu değiştirmek, arşivlemek ve silmek gibi işlemleri yapabileceğiniz bir arayüz sunar. Kullanıcılar ayrıca gelir kalemlerini arayabilir, filtreleyebilir, sıralayabilir ve farklı görünümler arasında geçiş yapabilirler. Şimdilik backend olmadığı için tüm işlemler local state üzerinde gerçekleştirilir ve mock data kullanılır.
//src/modules/muhasebe/views/IncomeCategoriesView.tsx
"use client";

import React, { useMemo, useState, useCallback, useEffect } from "react";
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Drawer,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useTheme,
  Divider,
  Avatar,
  Zoom,
  Fade,
  Skeleton,
  Alert,
  Snackbar,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Badge,
  LinearProgress,
  Paper,
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
   Grid,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  IconBuildingBank,
  IconEdit,
  IconPlus,
  IconSearch,
  IconX,
  IconCoin,
  IconRepeat,
  IconReceiptTax,
  IconTrash,
  IconCopy,
  IconDownload,
  IconUpload,
  IconFilter,
  IconLayoutGrid,
  IconLayoutList,
  IconChartBar,
  IconSettings,
  IconArchive,
  IconArchiveOff,
  IconCheck,
  IconExclamationCircle,
  IconHistory,
  IconTags,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

// ============ TYPES ============
type IncomeCategoryStatus = "active" | "inactive" | "archived";
type ViewMode = "grid" | "list";
type SortField = "name" | "code" | "sortOrder" | "createdAt" | "usageCount";
type SortDirection = "asc" | "desc";

interface IncomeCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
  isTaxable: boolean;
  isRecurring: boolean;
  isActive: boolean;
  isArchived: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  totalAmount?: number;
  tags: string[];
  createdBy: string;
}

interface IncomeCategoryForm {
  name: string;
  code: string;
  description: string;
  isTaxable: boolean;
  isRecurring: boolean;
  isActive: boolean;
  sortOrder: number;
  tags: string[];
}

interface CategoryStats {
  total: number;
  active: number;
  recurring: number;
  taxable: number;
  archived: number;
  totalRevenue: number;
}

// ============ MOCK DATA ============
const initialCategories: IncomeCategory[] = [
  {
    id: "1",
    name: "Ortak Alan Kira Geliri",
    code: "COMMON_AREA_RENTAL",
    description: "Ortak alanların kiraya verilmesinden elde edilen gelir.",
    isTaxable: true,
    isRecurring: true,
    isActive: true,
    isArchived: false,
    sortOrder: 1,
    createdAt: "2026-05-04T10:00:00Z",
    updatedAt: "2026-05-04T10:00:00Z",
    usageCount: 24,
    totalAmount: 125000,
    tags: ["kira", "ortak alan"],
    createdBy: "Admin",
  },
  {
    id: "2",
    name: "Havuz İşletme Geliri",
    code: "POOL_OPERATION_INCOME",
    description: "Havuz işletmesi sonucunda elde edilen gelir.",
    isTaxable: true,
    isRecurring: false,
    isActive: true,
    isArchived: false,
    sortOrder: 2,
    createdAt: "2026-05-04T10:00:00Z",
    updatedAt: "2026-05-04T10:00:00Z",
    usageCount: 12,
    totalAmount: 45000,
    tags: ["havuz", "sezonluk"],
    createdBy: "Admin",
  },
  {
    id: "3",
    name: "Reklam Geliri",
    code: "ADVERTISING_INCOME",
    description: "Site veya apartman ortak alanlarından elde edilen reklam geliri.",
    isTaxable: true,
    isRecurring: false,
    isActive: true,
    isArchived: false,
    sortOrder: 3,
    createdAt: "2026-05-04T10:00:00Z",
    updatedAt: "2026-05-04T10:00:00Z",
    usageCount: 8,
    totalAmount: 28000,
    tags: ["reklam", "dijital"],
    createdBy: "Admin",
  },
];

const emptyForm: IncomeCategoryForm = {
  name: "",
  code: "",
  description: "",
  isTaxable: false,
  isRecurring: false,
  isActive: true,
  sortOrder: 1,
  tags: [],
};

const popularTags = ["kira", "reklam", "havuz", "otopark", "abonelik", "sponsorluk", "etkinlik", "dijital"];

// ============ UTILITIES ============
function normalizeCode(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replaceAll(" ", "_")
    .replace(/[^A-Z0-9_]/g, "");
}

// ============ CUSTOM HOOKS ============
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

// ============ MAIN COMPONENT ============
export default function IncomeCategoriesView() {
  const theme = useTheme();
  
  // State
  const [categories, setCategories] = useState<IncomeCategory[]>(initialCategories);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<IncomeCategoryStatus | "all">("all");
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>("income-categories-view", "grid");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<IncomeCategory | null>(null);
  const [form, setForm] = useState<IncomeCategoryForm>(emptyForm);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" | "info" }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [isLoading, setIsLoading] = useState(false);
  
  // Sorting & Pagination
  const [sortField, setSortField] = useState<SortField>("sortOrder");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Multi-select
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Stats
  const stats = useMemo<CategoryStats>(() => {
    return {
      total: categories.length,
      active: categories.filter((x) => x.isActive && !x.isArchived).length,
      recurring: categories.filter((x) => x.isRecurring && !x.isArchived).length,
      taxable: categories.filter((x) => x.isTaxable && !x.isArchived).length,
      archived: categories.filter((x) => x.isArchived).length,
      totalRevenue: categories.reduce((sum, x) => sum + (x.totalAmount || 0), 0),
    };
  }, [categories]);

  // Filtered and Sorted Categories
  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase();

    let filtered = categories.filter((item) => {
      if (item.isArchived && status !== "archived") return false;
      
      const matchesSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.code.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        item.tags.some(tag => tag.toLowerCase().includes(term));

      const matchesStatus =
        status === "all" ||
        (status === "active" && item.isActive && !item.isArchived) ||
        (status === "inactive" && !item.isActive && !item.isArchived) ||
        (status === "archived" && item.isArchived);

      return matchesSearch && matchesStatus;
    });

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      
      if (sortField === "createdAt") {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
      }
      
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [categories, search, status, sortField, sortDirection]);

  // Pagination
  const paginatedCategories = useMemo(() => {
    return filteredCategories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredCategories, page, rowsPerPage]);

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const openCreateDrawer = () => {
    setEditingItem(null);
    setForm({
      ...emptyForm,
      sortOrder: categories.filter(c => !c.isArchived).length + 1,
    });
    setDrawerOpen(true);
  };

  const openEditDrawer = (item: IncomeCategory) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      code: item.code,
      description: item.description ?? "",
      isTaxable: item.isTaxable,
      isRecurring: item.isRecurring,
      isActive: item.isActive,
      sortOrder: item.sortOrder,
      tags: item.tags,
    });
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingItem(null);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.code.trim()) {
      setSnackbar({ open: true, message: "Ad ve kod alanları zorunludur", severity: "error" });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const payload: IncomeCategory = {
      id: editingItem?.id ?? crypto.randomUUID(),
      name: form.name.trim(),
      code: normalizeCode(form.code || form.name),
      description: form.description.trim(),
      isTaxable: form.isTaxable,
      isRecurring: form.isRecurring,
      isActive: form.isActive,
      isArchived: false,
      sortOrder: Number(form.sortOrder) || 1,
      createdAt: editingItem?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: editingItem?.usageCount ?? 0,
      tags: form.tags,
      createdBy: editingItem?.createdBy ?? "Current User",
    };

    setCategories((prev) =>
      editingItem
        ? prev.map((item) => (item.id === editingItem.id ? payload : item))
        : [...prev, payload]
    );

    setSnackbar({ 
      open: true, 
      message: editingItem ? "Gelir kalemi başarıyla güncellendi" : "Yeni gelir kalemi oluşturuldu",
      severity: "success" 
    });
    
    setIsLoading(false);
    closeDrawer();
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setCategories((prev) => prev.filter((item) => item.id !== id));
    setSelectedItems(prev => prev.filter(itemId => itemId !== id));
    setSnackbar({ open: true, message: "Gelir kalemi silindi", severity: "success" });
    setDeleteDialogOpen(null);
    setIsLoading(false);
  };

  const handleArchive = async (id: string, archive: boolean) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setCategories((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isArchived: archive, isActive: archive ? false : item.isActive, updatedAt: new Date().toISOString() } : item
      )
    );
    
    setSnackbar({ 
      open: true, 
      message: archive ? "Gelir kalemi arşivlendi" : "Gelir kalemi arşivden çıkarıldı",
      severity: "success" 
    });
    setIsLoading(false);
  };

  const handleDuplicate = async (item: IncomeCategory) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const duplicated: IncomeCategory = {
      ...item,
      id: crypto.randomUUID(),
      name: `${item.name} (Kopya)`,
      code: `${item.code}_COPY`,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sortOrder: categories.filter(c => !c.isArchived).length + 1,
    };
    
    setCategories(prev => [...prev, duplicated]);
    setSnackbar({ open: true, message: "Gelir kalemi kopyalandı", severity: "success" });
    setIsLoading(false);
  };

  const handleBulkArchive = () => {
    setCategories(prev =>
      prev.map(item =>
        selectedItems.includes(item.id) ? { ...item, isArchived: true, isActive: false } : item
      )
    );
    setSnackbar({ open: true, message: `${selectedItems.length} kalem arşivlendi`, severity: "success" });
    setSelectedItems([]);
  };

  const handleExport = () => {
    const data = filteredCategories.map(cat => ({
      ID: cat.id,
      Ad: cat.name,
      Kod: cat.code,
      Açıklama: cat.description,
      "Vergiye Tabi": cat.isTaxable ? "Evet" : "Hayır",
      Tekrarlı: cat.isRecurring ? "Evet" : "Hayır",
      Aktif: cat.isActive ? "Evet" : "Hayır",
      "Kullanım Sayısı": cat.usageCount,
      Etiketler: cat.tags.join(", "),
      "Oluşturma Tarihi": format(new Date(cat.createdAt), "dd.MM.yyyy", { locale: tr }),
    }));
    
    const csv = [
      Object.keys(data[0] || {}).join(","),
      ...data.map(row => Object.values(row).map(v => `"${v}"`).join(",")),
    ].join("\n");
    
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `gelir_kalemleri_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    
    setSnackbar({ open: true, message: "Veriler CSV olarak dışa aktarıldı", severity: "success" });
  };

  // Render Helpers
  const renderGridView = () => (
    <Grid container spacing={2}>
      {paginatedCategories.map((item) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
          <Zoom in style={{ transitionDelay: "50ms" }}>
            <Card
              sx={{
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: theme.shadows[4],
                  borderColor: theme.palette.primary.main,
                },
                position: "relative",
              }}
            >
              <CardContent>
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Stack spacing={0.5}>
                      <Typography fontWeight={800} fontSize="1rem">
                        {item.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                        {item.code}
                      </Typography>
                    </Stack>
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(prev => [...prev, item.id]);
                        } else {
                          setSelectedItems(prev => prev.filter(id => id !== item.id));
                        }
                      }}
                    />
                  </Stack>

                  <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>
                    {item.description || "Açıklama girilmemiş."}
                  </Typography>

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip
                      size="small"
                      label={item.isActive ? "Aktif" : "Pasif"}
                      color={item.isActive ? "success" : "default"}
                      icon={item.isActive ? <IconCheck size={14} /> : undefined}
                    />
                    {item.isRecurring && (
                      <Chip size="small" label="Tekrarlı" color="primary" variant="outlined" icon={<IconRepeat size={14} />} />
                    )}
                    {item.isTaxable && (
                      <Chip size="small" label="Vergiye Tabi" color="warning" variant="outlined" icon={<IconReceiptTax size={14} />} />
                    )}
                  </Stack>

                  {item.tags.length > 0 && (
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                      {item.tags.slice(0, 3).map(tag => (
                        <Chip key={tag} size="small" label={tag} variant="outlined" sx={{ fontSize: "0.7rem" }} />
                      ))}
                      {item.tags.length > 3 && (
                        <Chip size="small" label={`+${item.tags.length - 3}`} variant="outlined" />
                      )}
                    </Stack>
                  )}

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Badge
                      badgeContent={item.usageCount}
                      color="primary"
                      showZero
                      sx={{ "& .MuiBadge-badge": { fontSize: "0.7rem" } }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Kullanım
                      </Typography>
                    </Badge>
                    
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Düzenle">
                        <IconButton size="small" onClick={() => openEditDrawer(item)}>
                          <IconEdit size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Kopyala">
                        <IconButton size="small" onClick={() => handleDuplicate(item)}>
                          <IconCopy size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={item.isArchived ? "Arşivden Çıkar" : "Arşivle"}>
                        <IconButton size="small" onClick={() => handleArchive(item.id, !item.isArchived)}>
                          {item.isArchived ? <IconArchiveOff  size={16} /> : <IconArchive size={16} />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sil">
                        <IconButton size="small" color="error" onClick={() => setDeleteDialogOpen(item.id)}>
                          <IconTrash size={16} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
      ))}
    </Grid>
  );

  const renderListView = () => (
    <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "none", border: `1px solid ${alpha(theme.palette.divider, 0.7)}` }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                checked={selectedItems.length === paginatedCategories.length && paginatedCategories.length > 0}
                indeterminate={selectedItems.length > 0 && selectedItems.length < paginatedCategories.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedItems(paginatedCategories.map(c => c.id));
                  } else {
                    setSelectedItems([]);
                  }
                }}
              />
            </TableCell>
            <TableCell>
              <TableSortLabel active={sortField === "name"} direction={sortField === "name" ? sortDirection : "asc"} onClick={() => handleSort("name")}>
                Ad
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel active={sortField === "code"} direction={sortField === "code" ? sortDirection : "asc"} onClick={() => handleSort("code")}>
                Kod
              </TableSortLabel>
            </TableCell>
            <TableCell>Durum</TableCell>
            <TableCell>Özellikler</TableCell>
            <TableCell align="right">
              <TableSortLabel active={sortField === "usageCount"} direction={sortField === "usageCount" ? sortDirection : "asc"} onClick={() => handleSort("usageCount")}>
                Kullanım
              </TableSortLabel>
            </TableCell>
            <TableCell align="center">İşlemler</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedCategories.map((item) => (
            <Fade in key={item.id}>
              <TableRow hover>
                <TableCell padding="checkbox">
                  <Checkbox checked={selectedItems.includes(item.id)} onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems(prev => [...prev, item.id]);
                    } else {
                      setSelectedItems(prev => prev.filter(id => id !== item.id));
                    }
                  }} />
                </TableCell>
                <TableCell>
                  <Typography fontWeight={600}>{item.name}</Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Sıra: {item.sortOrder}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">{item.code}</Typography>
                </TableCell>
                <TableCell>
                  <Chip size="small" label={item.isActive ? "Aktif" : "Pasif"} color={item.isActive ? "success" : "default"} />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5}>
                    {item.isRecurring && <Chip size="small" label="Tekrarlı" variant="outlined" />}
                    {item.isTaxable && <Chip size="small" label="Vergi" variant="outlined" />}
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">{item.usageCount}</Typography>
                  {item.totalAmount && (
                    <Typography variant="caption" color="success.main">
                      ₺{item.totalAmount.toLocaleString()}
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={0.5} justifyContent="center">
                    <Tooltip title="Düzenle">
                      <IconButton size="small" onClick={() => openEditDrawer(item)}>
                        <IconEdit size={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Kopyala">
                      <IconButton size="small" onClick={() => handleDuplicate(item)}>
                        <IconCopy size={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                      <IconButton size="small" color="error" onClick={() => setDeleteDialogOpen(item.id)}>
                        <IconTrash size={16} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            </Fade>
          ))}
        </TableBody>
      </Table>
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
      />
    </TableContainer>
  );

  return (
<Box sx={{ p: 0 }}>
      {isLoading && <LinearProgress sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999 }} />}
      
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={2}>
          <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Gelir Kalemleri
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Kasaya giren aidat dışı gelir kalemlerini yönetin, etiketleyin ve raporlayın.
            </Typography>
          </Box>

          <Button variant="contained" startIcon={<IconPlus size={18} />} onClick={openCreateDrawer}>
            Yeni Gelir Kalemi
          </Button>
        </Stack>

        {/* Stats Cards */}
        <Grid container spacing={2}>
          {[
            { label: "Toplam Kalem", value: stats.total, icon: <IconCoin size={22} />, color: theme.palette.primary.main },
            { label: "Aktif", value: stats.active, icon: <IconBuildingBank size={22} />, color: theme.palette.success.main },
            { label: "Tekrarlı", value: stats.recurring, icon: <IconRepeat size={22} />, color: theme.palette.info.main },
            { label: "Vergiye Tabi", value: stats.taxable, icon: <IconReceiptTax size={22} />, color: theme.palette.warning.main },
            { label: "Arşivlenen", value: stats.archived, icon: <IconArchive size={22} />, color: theme.palette.grey[500] },
            { label: "Toplam Gelir", value: `₺${stats.totalRevenue.toLocaleString()}`, icon: <IconChartBar size={22} />, color: theme.palette.secondary.main },
          ].map((metric) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={metric.label}>
              <Card sx={{ borderRadius: 4, boxShadow: "none", border: `1px solid ${alpha(theme.palette.divider, 0.7)}` }}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: alpha(metric.color, 0.1), color: metric.color }}>
                      {metric.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight={800}>
                        {metric.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {metric.label}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Filters & Actions */}
        <Card sx={{ borderRadius: 4, boxShadow: "none", border: `1px solid ${alpha(theme.palette.divider, 0.7)}` }}>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Ad, kod, etiket veya açıklamaya göre ara..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
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
                  value={status}
                  onChange={(event) => setStatus(event.target.value as any)}
                  sx={{ minWidth: 180 }}
                >
                  <MenuItem value="all">Tümü</MenuItem>
                  <MenuItem value="active">Aktif</MenuItem>
                  <MenuItem value="inactive">Pasif</MenuItem>
                  <MenuItem value="archived">Arşivlenen</MenuItem>
                </TextField>

                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(_, value) => value && setViewMode(value)}
                  size="small"
                >
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

              {selectedItems.length > 0 && (
                <Alert
                  severity="info"
                  action={
                    <Stack direction="row" spacing={1}>
                      <Button size="small" onClick={handleBulkArchive} startIcon={<IconArchive size={14} />}>
                        Arşivle
                      </Button>
                      <Button size="small" onClick={() => setSelectedItems([])}>Temizle</Button>
                    </Stack>
                  }
                >
                  {selectedItems.length} kalem seçildi.
                </Alert>
              )}

              <Divider />

              {/* Content */}
              {filteredCategories.length === 0 ? (
                <Box sx={{ p: 8, textAlign: "center" }}>
                  <IconTags size={48} style={{ opacity: 0.3 }} />
                  <Typography fontWeight={700} mt={2}>Gelir kalemi bulunamadı</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Filtreleri değiştirin veya yeni bir gelir kalemi oluşturun.
                  </Typography>
                  <Button variant="outlined" startIcon={<IconPlus size={16} />} onClick={openCreateDrawer} sx={{ mt: 2 }}>
                    İlk Kalemi Oluştur
                  </Button>
                </Box>
              ) : (
                <>
                  {viewMode === "grid" ? renderGridView() : renderListView()}
                  <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2} mt={2}>
                    <Typography variant="body2" color="text.secondary">
                      Toplam {filteredCategories.length} kalem gösteriliyor
                    </Typography>
                  </Stack>
                </>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Form Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={closeDrawer}
        PaperProps={{ sx: { width: { xs: "100%", sm: 520 }, p: 3 } }}
      >
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" fontWeight={800}>
                {editingItem ? "Gelir Kalemini Düzenle" : "Yeni Gelir Kalemi"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Aidat dışı gelir kalemi tanımı ve özellikleri.
              </Typography>
            </Box>
            <IconButton onClick={closeDrawer}>
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
            label="Kod *"
            value={form.code}
            onChange={(event) => setForm((prev) => ({ ...prev, code: normalizeCode(event.target.value) }))}
            fullWidth
            required
            helperText="Benzersiz tanımlayıcı kod. Örnek: COMMON_AREA_RENTAL"
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
            label="Sıra"
            type="number"
            value={form.sortOrder}
            onChange={(event) => setForm((prev) => ({ ...prev, sortOrder: Number(event.target.value) }))}
            fullWidth
            helperText="Listeleme sırasını belirler"
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

          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography fontWeight={700}>Vergiye Tabi</Typography>
                <Typography variant="body2" color="text.secondary">Bu gelir vergi ve raporlama takibine dahil edilir.</Typography>
              </Box>
              <Switch checked={form.isTaxable} onChange={(e) => setForm(prev => ({ ...prev, isTaxable: e.target.checked }))} />
            </Stack>

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography fontWeight={700}>Tekrarlı</Typography>
                <Typography variant="body2" color="text.secondary">Bu gelir düzenli tekrar eden bir gelir türüdür.</Typography>
              </Box>
              <Switch checked={form.isRecurring} onChange={(e) => setForm(prev => ({ ...prev, isRecurring: e.target.checked }))} />
            </Stack>

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography fontWeight={700}>Aktif</Typography>
                <Typography variant="body2" color="text.secondary">Pasif kalemler yeni gelir kayıtlarında seçilemez.</Typography>
              </Box>
              <Switch checked={form.isActive} onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))} />
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button onClick={closeDrawer}>Vazgeç</Button>
            <Button variant="contained" onClick={handleSave} disabled={isLoading || !form.name.trim() || !form.code.trim()}>
              {isLoading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </Stack>
        </Stack>
      </Drawer>

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, bgcolor: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Card sx={{ maxWidth: 400, p: 3, m: 2 }}>
            <Stack spacing={2} alignItems="center" textAlign="center">
              <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main, width: 56, height: 56 }}>
                <IconExclamationCircle size={28} />
              </Avatar>
              <Typography variant="h6" fontWeight={800}>Kalemi Sil</Typography>
              <Typography variant="body2" color="text.secondary">
                Bu gelir kalemini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
              </Typography>
              <Stack direction="row" spacing={1.5}>
                <Button variant="outlined" onClick={() => setDeleteDialogOpen(null)}>Vazgeç</Button>
                <Button variant="contained" color="error" onClick={() => handleDelete(deleteDialogOpen)}>
                  {isLoading ? "Siliniyor..." : "Evet, Sil"}
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Box>
      )}

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}