// src/modules/muhasebe/views/MuhasebeIncomesView.tsx
"use client";

import React from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import {
  IconArchive,
  IconBuildingBank,
  IconCash,
  IconCoin,
  IconDownload,
  IconPlus,
  IconReportMoney,
  IconSearch,
  IconTrash,
  IconX,
} from "@tabler/icons-react";

import { useIncomes } from "@/modules/muhasebe/hooks/useIncomes";
import IncomeCard from "@/modules/muhasebe/components/incomes/IncomeCard";
import IncomeRow from "@/modules/muhasebe/components/incomes/IncomeRow";
import IncomeDetailDialog from "@/modules/muhasebe/components/incomes/IncomeDetailDialog";
import IncomeCreateDrawer from "@/modules/muhasebe/components/incomes/IncomeCreateDrawer";

import AccountingPageHeader from "@/modules/muhasebe/components/shared/AccountingPageHeader";
import AccountingPanel from "@/modules/muhasebe/components/shared/AccountingPanel";
import AccountingFilterPanel from "@/modules/muhasebe/components/shared/AccountingFilterPanel";
import AccountingViewToggle from "@/modules/muhasebe/components/shared/AccountingViewToggle";
import AccountingSelectField from "@/modules/muhasebe/components/shared/AccountingSelectField";
import AccountingSummaryCard from "@/modules/muhasebe/components/shared/AccountingSummaryCard";
import AccountingActiveFilters, {
  type AccountingActiveFilterItem,
} from "@/modules/muhasebe/components/shared/AccountingActiveFilters";

import {
  formatIncomeMoney,
  INCOME_CATEGORY_OPTIONS,
  INCOME_STATUS_OPTIONS,
} from "@/modules/muhasebe/utils/muhasebeIncome.utils";

const INCOME_PAYMENT_METHOD_OPTIONS = [
  "Banka Havalesi",
  "Nakit",
  "TWINT",
  "PostFinance",
  "Kredi Kartı",
];

export default function MuhasebeIncomesView() {
  const {
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
  } = useIncomes();

  const toggleSelect = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === paginatedItems.length) {
      setSelectedItems([]);
      return;
    }

    setSelectedItems(paginatedItems.map((item) => item.id));
  };

  const activeFilters: AccountingActiveFilterItem[] = [];

  if (period) {
    activeFilters.push({
      key: "period",
      label: "Dönem",
      value: period,
      onDelete: () => {
        setPeriod("");
        setPage(0);
      },
    });
  }

  if (selectedCategory !== "all") {
    activeFilters.push({
      key: "category",
      label: "Gelir Türü",
      value:
        INCOME_CATEGORY_OPTIONS.find((option) => option.value === selectedCategory)
          ?.label ?? selectedCategory,
      onDelete: () => {
        setSelectedCategory("all");
        setPage(0);
      },
    });
  }

  if (selectedPaymentMethod !== "all") {
    activeFilters.push({
      key: "paymentMethod",
      label: "Ödeme Yöntemi",
      value: selectedPaymentMethod,
      onDelete: () => {
        setSelectedPaymentMethod("all");
        setPage(0);
      },
    });
  }

  if (selectedStatus !== "all") {
    activeFilters.push({
      key: "status",
      label: "Durum",
      value:
        INCOME_STATUS_OPTIONS.find((option) => option.value === selectedStatus)
          ?.label ?? selectedStatus,
      onDelete: () => {
        setSelectedStatus("all");
        setPage(0);
      },
    });
  }

  if (searchQuery.trim()) {
    activeFilters.push({
      key: "search",
      label: "Arama",
      value: searchQuery.trim(),
      onDelete: () => {
        setSearchQuery("");
        setPage(0);
      },
    });
  }

  return (
    <Box sx={{ p: 0 }}>
      <Stack spacing={3}>
        <AccountingPageHeader
          title="Gelirler"
          description="Gelir takibi, tahsilat kaynakları ve finansal gelir yönetimi."
          actions={
            <>
              <Button
                variant="outlined"
                startIcon={<IconDownload size={18} />}
                onClick={handleExport}
              >
                Dışa Aktar
              </Button>

              <Button
                variant="contained"
                startIcon={<IconPlus size={18} />}
                onClick={() => setDrawerOpen(true)}
              >
                Yeni Gelir
              </Button>
            </>
          }
        />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} sx={{ display: "flex" }}>
            <AccountingSummaryCard
              title="Toplam Gelir"
              value={formatIncomeMoney(stats.totalIncome, "CHF")}
              subtitle={`${stats.posted} kesinleşmiş kayıt`}
              icon={<IconReportMoney size={20} />}
              color="#10b981"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }} sx={{ display: "flex" }}>
            <AccountingSummaryCard
              title="Taslak Tutar"
              value={formatIncomeMoney(stats.draftAmount, "CHF")}
              subtitle={`${stats.draft} taslak kayıt`}
              icon={<IconCoin size={20} />}
              color="#f59e0b"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }} sx={{ display: "flex" }}>
            <AccountingSummaryCard
              title="Banka Gelirleri"
              value={stats.bankCount}
              subtitle="Banka ile alınan gelirler"
              icon={<IconBuildingBank size={20} />}
              color="#3b82f6"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }} sx={{ display: "flex" }}>
            <AccountingSummaryCard
              title="Nakit Gelirler"
              value={stats.cashCount}
              subtitle={`${stats.cancelled} iptal kayıt`}
              icon={<IconCash size={20} />}
              color="#8b5cf6"
            />
          </Grid>
        </Grid>

        <AccountingPanel>
          <Tabs
            value={selectedTab}
            onChange={(_, value) => {
              setSelectedTab(value);
              setPage(0);
            }}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 2 }}
          >
            <Tab label={`Tümü (${stats.total})`} value="all" />
            <Tab label={`Kesinleşen (${stats.posted})`} value="posted" />
            <Tab label={`Taslak (${stats.draft})`} value="draft" />
          </Tabs>

          <Divider sx={{ mb: 2.5 }} />

          <AccountingFilterPanel
            actions={
              <Button size="small" variant="outlined" onClick={clearFilters}>
                Filtreleri Temizle
              </Button>
            }
            search={
              <TextField
                size="small"
                fullWidth
                placeholder="Ara (ödeyen, kategori, belge no, ödeme yöntemi)..."
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setPage(0);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconSearch size={18} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchQuery("")}>
                        <IconX size={14} />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
              />
            }
            viewToggle={
              <AccountingViewToggle value={viewMode} onChange={setViewMode} />
            }
          >
            <TextField
              size="small"
              type="month"
              label="Dönem"
              value={period}
              onChange={(event) => {
                setPeriod(event.target.value);
                setPage(0);
              }}
              InputLabelProps={{ shrink: true }}
            />

            <AccountingSelectField
              label="Gelir Türü"
              value={selectedCategory}
              onChange={(event) => {
                setSelectedCategory(event.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="all">Tüm Gelir Türleri</MenuItem>
              {INCOME_CATEGORY_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </AccountingSelectField>

            <AccountingSelectField
              label="Ödeme Yöntemi"
              value={selectedPaymentMethod}
              onChange={(event) => {
                setSelectedPaymentMethod(event.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="all">Tüm Yöntemler</MenuItem>
              {INCOME_PAYMENT_METHOD_OPTIONS.map((method) => (
                <MenuItem key={method} value={method}>
                  {method}
                </MenuItem>
              ))}
            </AccountingSelectField>

            <AccountingSelectField
              label="Durum"
              value={selectedStatus}
              onChange={(event) => {
                setSelectedStatus(event.target.value as typeof selectedStatus);
                setPage(0);
              }}
            >
              <MenuItem value="all">Tüm Durumlar</MenuItem>
              {INCOME_STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </AccountingSelectField>

            <AccountingSelectField
              label="Sırala"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
            >
              <MenuItem value="date_desc">Tarih (Yeni → Eski)</MenuItem>
              <MenuItem value="date_asc">Tarih (Eski → Yeni)</MenuItem>
              <MenuItem value="amount_desc">Tutar (Yüksek → Düşük)</MenuItem>
              <MenuItem value="amount_asc">Tutar (Düşük → Yüksek)</MenuItem>
              <MenuItem value="customer_asc">Ödeyen (A → Z)</MenuItem>
            </AccountingSelectField>
          </AccountingFilterPanel>

          <AccountingActiveFilters items={activeFilters} />

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {filteredItems.length} gelir listeleniyor
          </Typography>

          {selectedItems.length > 0 && (
            <Alert
              severity="info"
              sx={{ mt: 2 }}
              action={
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    startIcon={<IconArchive size={14} />}
                    onClick={handleBulkArchive}
                  >
                    Arşivle
                  </Button>

                  <Button
                    size="small"
                    color="error"
                    startIcon={<IconTrash size={14} />}
                    onClick={handleBulkDelete}
                  >
                    Sil
                  </Button>

                  <Button size="small" onClick={() => setSelectedItems([])}>
                    Temizle
                  </Button>
                </Stack>
              }
            >
              {selectedItems.length} kayıt seçildi.
            </Alert>
          )}

          <Divider sx={{ my: 2.5 }} />

          {filteredItems.length === 0 ? (
            <Box sx={{ p: 8, textAlign: "center" }}>
              <IconReportMoney size={48} style={{ opacity: 0.3 }} />

              <Typography fontWeight={800} mt={2}>
                Gelir kaydı bulunamadı
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Filtreleri değiştirin veya yeni bir gelir kaydı oluşturun.
              </Typography>

              <Button
                variant="contained"
                startIcon={<IconPlus size={18} />}
                onClick={() => setDrawerOpen(true)}
                sx={{ mt: 2 }}
              >
                Yeni Gelir Ekle
              </Button>
            </Box>
          ) : viewMode === "grid" ? (
            <>
              <Grid container spacing={2}>
                {paginatedItems.map((item) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
                    <IncomeCard
                      item={item}
                      selected={selectedItems.includes(item.id)}
                      onSelect={toggleSelect}
                      onView={setViewItem}
                      onDelete={handleDelete}
                      onDuplicate={handleDuplicate}
                      onArchive={handleArchive}
                    />
                  </Grid>
                ))}
              </Grid>

              <TablePagination
                rowsPerPageOptions={[6, 12, 24, 48]}
                component="div"
                count={filteredItems.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(parseInt(event.target.value, 10));
                  setPage(0);
                }}
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} / ${count}`
                }
                sx={{ mt: 2 }}
              />
            </>
          ) : (
            <>
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  overflowX: "auto",
                }}
              >
                <Table size="small" sx={{ minWidth: 1040 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={
                            selectedItems.length === paginatedItems.length &&
                            paginatedItems.length > 0
                          }
                          indeterminate={
                            selectedItems.length > 0 &&
                            selectedItems.length < paginatedItems.length
                          }
                          onChange={handleSelectAll}
                        />
                      </TableCell>

                      <TableCell>Gelir / Ödeyen</TableCell>
                      <TableCell align="right">Tutar</TableCell>
                      <TableCell>Tarih</TableCell>
                      <TableCell>Durum</TableCell>
                      <TableCell>Ödeme Yöntemi</TableCell>
                      <TableCell>Belge No</TableCell>
                      <TableCell align="center">İşlemler</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {paginatedItems.map((item) => (
                      <IncomeRow
                        key={item.id}
                        item={item}
                        selected={selectedItems.includes(item.id)}
                        onSelect={toggleSelect}
                        onView={setViewItem}
                        onDelete={handleDelete}
                        onDuplicate={handleDuplicate}
                      />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[6, 12, 24, 48]}
                component="div"
                count={filteredItems.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(parseInt(event.target.value, 10));
                  setPage(0);
                }}
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} / ${count}`
                }
                sx={{ mt: 2 }}
              />
            </>
          )}
        </AccountingPanel>
      </Stack>

      <IncomeCreateDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreated={handleCreated}
      />

      <IncomeDetailDialog item={viewItem} onClose={() => setViewItem(null)} />

      {deleteTarget && (
        <Alert
          severity="warning"
          sx={{
            position: "fixed",
            right: 24,
            bottom: 88,
            zIndex: 1600,
            maxWidth: 420,
            boxShadow: 6,
          }}
          action={
            <Stack direction="row" spacing={1}>
              <Button size="small" onClick={() => setDeleteTarget(null)}>
                Vazgeç
              </Button>

              <Button
                size="small"
                color="error"
                variant="contained"
                onClick={confirmDelete}
                disabled={isLoading}
              >
                Sil
              </Button>
            </Stack>
          }
        >
          <strong>{deleteTarget.category}</strong> gelir kaydı silinsin mi?
        </Alert>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}