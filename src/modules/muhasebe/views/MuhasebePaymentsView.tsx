// src/modules/muhasebe/views/MuhasebePaymentsView.tsx
"use client";

import React from "react";
import {
  Alert,
  Box,
  Button,
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
  IconReceipt,
  IconSearch,
  IconTrash,
  IconX,
} from "@tabler/icons-react";

import { usePayments } from "@/modules/muhasebe/hooks/usePayments";
import PaymentCard from "@/modules/muhasebe/components/payments/PaymentCard";
import PaymentRow from "@/modules/muhasebe/components/payments/PaymentRow";
import PaymentDrawer from "@/modules/muhasebe/components/payments/PaymentDrawer";
import PaymentDetailDialog from "@/modules/muhasebe/components/payments/PaymentDetailDialog";
import ChargeSummaryCard from "@/modules/muhasebe/components/shared/AccountingSummaryCard";
import AccountingPageHeader from "@/modules/muhasebe/components/shared/AccountingPageHeader";
import AccountingPanel from "@/modules/muhasebe/components/shared/AccountingPanel";
import AccountingFilterPanel from "@/modules/muhasebe/components/shared/AccountingFilterPanel";
import AccountingViewToggle from "@/modules/muhasebe/components/shared/AccountingViewToggle";
import AccountingSelectField from "@/modules/muhasebe/components/shared/AccountingSelectField";
import AccountingActiveFilters, {
  type AccountingActiveFilterItem,
} from "@/modules/muhasebe/components/shared/AccountingActiveFilters";
import {
  PAYMENT_STATUS_OPTIONS,
  formatPaymentMoney,
} from "@/modules/muhasebe/utils/muhasebePayment.utils";

export default function MuhasebePaymentsView() {
  const {
    stats,
    filteredItems,
    paginatedItems,
    selectedItems,
    viewItem,
    deleteTarget,

    selectedTab,
    searchQuery,
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

    openCreateDrawer,
    setSelectedTab,
    setSearchQuery,
    setSelectedStatus,
    setSortBy,
    setViewMode,
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
  } = usePayments();

  const toggleSelect = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const activeFilters: AccountingActiveFilterItem[] = [];

  if (selectedStatus !== "all") {
    activeFilters.push({
      key: "status",
      label: "Durum",
      value:
        PAYMENT_STATUS_OPTIONS.find((option) => option.value === selectedStatus)
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
          title="Tahsilatlar"
          description="Ödeme alma, kasa/banka girişi ve tahsilat kayıtlarını yönetin."
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
                onClick={openCreateDrawer}
              >
                Yeni Tahsilat
              </Button>
            </>
          }
        />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <ChargeSummaryCard
              title="Toplam Tahsilat"
              value={formatPaymentMoney(stats.totalIncome, "CHF")}
              subtitle={`${stats.posted} kesinleşmiş kayıt`}
              icon={<IconCoin size={20} />}
              color="#10b981"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <ChargeSummaryCard
              title="Taslak Tutar"
              value={formatPaymentMoney(stats.draftAmount, "CHF")}
              subtitle={`${stats.draft} taslak kayıt`}
              icon={<IconReceipt size={20} />}
              color="#f59e0b"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <ChargeSummaryCard
              title="Banka İşlemleri"
              value={stats.bankCount}
              subtitle="Banka hesabına işlenen kayıt"
              icon={<IconBuildingBank size={20} />}
              color="#3b82f6"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <ChargeSummaryCard
              title="Nakit İşlemleri"
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
                placeholder="Ara (ödeyen, daire, makbuz no, ödeme yöntemi)..."
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
            <AccountingSelectField
              label="Durum"
              value={selectedStatus}
              onChange={(event) => {
                setSelectedStatus(event.target.value as typeof selectedStatus);
                setPage(0);
              }}
            >
              <MenuItem value="all">Tüm Durumlar</MenuItem>
              {PAYMENT_STATUS_OPTIONS.map((option) => (
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
              <MenuItem value="payer_asc">Ödeyen (A → Z)</MenuItem>
            </AccountingSelectField>
          </AccountingFilterPanel>

          <AccountingActiveFilters items={activeFilters} />

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {filteredItems.length} tahsilat listeleniyor
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
              <IconCoin size={48} style={{ opacity: 0.3 }} />

              <Typography fontWeight={800} mt={2}>
                Tahsilat bulunamadı
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Filtreleri değiştirin veya yeni bir tahsilat kaydı oluşturun.
              </Typography>

              <Button
                variant="contained"
                startIcon={<IconPlus size={18} />}
                onClick={openCreateDrawer}
                sx={{ mt: 2 }}
              >
                Yeni Tahsilat Ekle
              </Button>
            </Box>
          ) : viewMode === "grid" ? (
            <>
              <Grid container spacing={2}>
                {paginatedItems.map((item) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
                    <PaymentCard
                      item={item}
                      selected={selectedItems.includes(item.id)}
                      onSelect={toggleSelect}
                      onView={setViewItem}
                      onEdit={handleEdit}
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
                <Table size="small" sx={{ minWidth: 1120 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox" />
                      <TableCell>Ödeyen / Birim</TableCell>
                      <TableCell align="right">Tutar</TableCell>
                      <TableCell>Tarih</TableCell>
                      <TableCell>Durum</TableCell>
                      <TableCell>Ödeme Yöntemi</TableCell>
                      <TableCell>Kasa / Banka</TableCell>
                      <TableCell>Makbuz No</TableCell>
                      <TableCell align="center">İşlemler</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {paginatedItems.map((item) => (
                      <PaymentRow
                        key={item.id}
                        item={item}
                        selected={selectedItems.includes(item.id)}
                        onSelect={toggleSelect}
                        onView={setViewItem}
                        onEdit={handleEdit}
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

      <PaymentDrawer
        open={drawerOpen}
        editingId={editingId}
        values={formValues}
        errors={formErrors}
        loading={isLoading}
        onClose={() => setDrawerOpen(false)}
        onChange={handleFormChange}
        onSubmit={handleSavePayment}
      />

      <PaymentDetailDialog
        item={viewItem}
        onClose={() => setViewItem(null)}
        onEdit={handleEdit}
      />

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
          <strong>{deleteTarget.payerName}</strong> tahsilat kaydı silinsin mi?
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