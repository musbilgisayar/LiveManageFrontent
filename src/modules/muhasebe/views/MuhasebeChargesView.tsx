//bileşenler burda kullanıldı.
// src/modules/muhasebe/views/MuhasebeChargesView.tsx
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
  IconCalendarDue,
  IconCoin,
  IconDownload,
  IconPlus,
  IconReceiptTax,
  IconSearch,
  IconUsersGroup,
  IconX,
} from "@tabler/icons-react";

import { useCharges } from "@/modules/muhasebe/hooks/useCharges";
import ChargeCard from "@/modules/muhasebe/components/charges/ChargeCard";
import ChargeRow from "@/modules/muhasebe/components/charges/ChargeRow";
import SingleChargeDrawer from "@/modules/muhasebe/components/charges/SingleChargeDrawer";
import BulkChargeDrawer from "@/modules/muhasebe/components/charges/BulkChargeDrawer";
import ChargeSummaryCard from "@/modules/muhasebe/components/shared/AccountingSummaryCard";
import ChargeDetailDialog from "@/modules/muhasebe/components/charges/ChargeDetailDialog";
import AccountingPageHeader from "@/modules/muhasebe/components/shared/AccountingPageHeader";
import AccountingPanel from "@/modules/muhasebe/components/shared/AccountingPanel";
import AccountingFilterPanel from "@/modules/muhasebe/components/shared/AccountingFilterPanel";
import AccountingViewToggle from "@/modules/muhasebe/components/shared/AccountingViewToggle";
import AccountingSelectField from "@/modules/muhasebe/components/shared/AccountingSelectField";
import AccountingActiveFilters, {
  type AccountingActiveFilterItem,
} from "@/modules/muhasebe/components/shared/AccountingActiveFilters";
import {
  CHARGE_TYPE_OPTIONS,
  formatChargeMoney,
} from "@/modules/muhasebe/utils/muhasebeCharge.utils";

export default function MuhasebeChargesView() {
  const {
    stats,
    filteredItems,
    paginatedItems,
    selectedItems,
    viewItem,

    bulkStep,
    bulkTargetUnits,
    duplicateBulkItems,
    creatableBulkUnits,

    selectedTab,
    searchQuery,
    selectedStatus,
    selectedPaymentState,
    selectedType,
    period,
    sortBy,
    viewMode,

    page,
    rowsPerPage,

    drawerOpen,
    bulkDrawerOpen,
    formValues,
    formErrors,
    bulkForm,
    bulkErrors,
    editingId,
    isLoading,

    openCreateDrawer,
    openBulkDrawer,

    setSelectedTab,
    setSearchQuery,
    setSelectedStatus,
    setSelectedPaymentState,
    setSelectedType,
    setPeriod,
    setSortBy,
    setViewMode,
    setPage,
    setRowsPerPage,
    setSelectedItems,
    setDrawerOpen,
    setBulkDrawerOpen,
    setBulkStep,
    setViewItem,

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
  } = useCharges();

  const toggleSelect = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const activeFilters: AccountingActiveFilterItem[] = [];

  if (selectedType !== "all") {
    activeFilters.push({
      key: "type",
      label: "Borç Türü",
      value:
        CHARGE_TYPE_OPTIONS.find((option) => option.value === selectedType)?.label ??
        selectedType,
      onDelete: () => {
        setSelectedType("all");
        setPage(0);
      },
    });
  }

  if (selectedStatus !== "all") {
    activeFilters.push({
      key: "status",
      label: "Durum",
      value:
        selectedStatus === "draft"
          ? "Taslak"
          : selectedStatus === "posted"
            ? "Kesinleşti"
            : "İptal",
      onDelete: () => {
        setSelectedStatus("all");
        setPage(0);
      },
    });
  }

  if (selectedPaymentState !== "all") {
    activeFilters.push({
      key: "payment",
      label: "Ödeme",
      value:
        selectedPaymentState === "unpaid"
          ? "Ödenmedi"
          : selectedPaymentState === "partial"
            ? "Kısmi Ödendi"
            : "Ödendi",
      onDelete: () => {
        setSelectedPaymentState("all");
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
          title="Tahakkuklar"
          description="Aidat, ceza, ortak gider payı ve özel borç tahakkuklarını yönetin."
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
                variant="outlined"
                startIcon={<IconUsersGroup size={18} />}
                onClick={openBulkDrawer}
              >
                Toplu Aidat
              </Button>

              <Button
                variant="contained"
                startIcon={<IconPlus size={18} />}
                onClick={openCreateDrawer}
              >
                Tekil Borç
              </Button>
            </>
          }
        />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <ChargeSummaryCard
              title="Toplam Borç"
              value={formatChargeMoney(stats.totalDebt, "CHF")}
              subtitle={`${stats.posted} kesinleşmiş kayıt`}
              icon={<IconReceiptTax size={20} />}
              color="#3b82f6"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <ChargeSummaryCard
              title="Tahsil Edilen"
              value={formatChargeMoney(stats.totalPaid, "CHF")}
              subtitle="Tahsilatlardan hesaplanır"
              icon={<IconCoin size={20} />}
              color="#10b981"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <ChargeSummaryCard
              title="Kalan Borç"
              value={formatChargeMoney(stats.totalRemaining, "CHF")}
              subtitle={`${stats.partial} kısmi ödeme`}
              icon={<IconReceiptTax size={20} />}
              color="#ef4444"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <ChargeSummaryCard
              title="Vadesi Geçen"
              value={stats.overdue}
              subtitle={`${stats.draft} taslak kayıt`}
              icon={<IconCalendarDue size={20} />}
              color="#f59e0b"
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
            <Tab label={`Taslak (${stats.draft})`} value="draft" />
            <Tab label={`Kesinleşmiş (${stats.posted})`} value="posted" />
            <Tab label={`Vadesi Geçen (${stats.overdue})`} value="overdue" />
            <Tab label={`Kısmi Ödenen (${stats.partial})`} value="partial" />
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
                placeholder="Ara (daire, sakin, referans no, açıklama)..."
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
            viewToggle={<AccountingViewToggle value={viewMode} onChange={setViewMode} />}
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
              label="Borç Türü"
              value={selectedType}
              onChange={(event) => {
                setSelectedType(event.target.value as typeof selectedType);
                setPage(0);
              }}
            >
              <MenuItem value="all">Tüm Türler</MenuItem>
              {CHARGE_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
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
              <MenuItem value="draft">Taslak</MenuItem>
              <MenuItem value="posted">Kesinleşti</MenuItem>
              <MenuItem value="cancelled">İptal</MenuItem>
            </AccountingSelectField>

            <AccountingSelectField
              label="Ödeme"
              value={selectedPaymentState}
              onChange={(event) => {
                setSelectedPaymentState(event.target.value as typeof selectedPaymentState);
                setPage(0);
              }}
            >
              <MenuItem value="all">Tümü</MenuItem>
              <MenuItem value="unpaid">Ödenmedi</MenuItem>
              <MenuItem value="partial">Kısmi Ödendi</MenuItem>
              <MenuItem value="paid">Ödendi</MenuItem>
            </AccountingSelectField>

            <AccountingSelectField
              label="Sırala"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
            >
              <MenuItem value="due_desc">Vade (Yeni → Eski)</MenuItem>
              <MenuItem value="due_asc">Vade (Eski → Yeni)</MenuItem>
              <MenuItem value="amount_desc">Tutar (Yüksek → Düşük)</MenuItem>
              <MenuItem value="amount_asc">Tutar (Düşük → Yüksek)</MenuItem>
              <MenuItem value="unit_asc">Daire (A → Z)</MenuItem>
            </AccountingSelectField>
          </AccountingFilterPanel>
          <AccountingActiveFilters items={activeFilters} />
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
            sx={{ mt: 2 }}
          >
            <Typography variant="body2" color="text.secondary">
              {filteredItems.length} tahakkuk listeleniyor
            </Typography>
          </Stack>

          {selectedItems.length > 0 && (
            <Alert
              severity="info"
              sx={{ mt: 2 }}
              action={
                <Stack direction="row" spacing={1}>
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
              <IconReceiptTax size={48} style={{ opacity: 0.3 }} />

              <Typography fontWeight={800} mt={2}>
                Tahakkuk bulunamadı
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Filtreleri değiştirin veya yeni bir tahakkuk oluşturun.
              </Typography>

              <Button
                variant="contained"
                startIcon={<IconPlus size={18} />}
                onClick={openCreateDrawer}
                sx={{ mt: 2 }}
              >
                Tekil Borç Oluştur
              </Button>
            </Box>
          ) : viewMode === "grid" ? (
            <>
              <Grid container spacing={2}>
                {paginatedItems.map((item) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
                    <ChargeCard
                      item={item}
                      selected={selectedItems.includes(item.id)}
                      onSelect={toggleSelect}
                      onView={setViewItem}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onPost={handlePost}
                      onCancel={handleCancel}
                      onDuplicate={handleDuplicate}
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
                <Table size="small" sx={{ minWidth: 1180 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox" />
                      <TableCell>Daire / Sakin</TableCell>
                      <TableCell>Borç Türü</TableCell>
                      <TableCell>Dönem</TableCell>
                      <TableCell align="right">Borç</TableCell>
                      <TableCell align="right">Tahsil</TableCell>
                      <TableCell align="right">Kalan</TableCell>
                      <TableCell>Vade</TableCell>
                      <TableCell>Durum</TableCell>
                      <TableCell align="center">İşlemler</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {paginatedItems.map((item) => (
                      <ChargeRow
                        key={item.id}
                        item={item}
                        selected={selectedItems.includes(item.id)}
                        onSelect={toggleSelect}
                        onView={setViewItem}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onPost={handlePost}
                        onCancel={handleCancel}
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

      <SingleChargeDrawer
        open={drawerOpen}
        editingId={editingId}
        values={formValues}
        errors={formErrors}
        loading={isLoading}
        onClose={() => setDrawerOpen(false)}
        onChange={handleFormChange}
        onUnitSelect={handleUnitSelect}
        onSubmit={handleSaveCharge}
      />

      <BulkChargeDrawer
        open={bulkDrawerOpen}
        step={bulkStep}
        values={bulkForm}
        errors={bulkErrors}
        loading={isLoading}
        targetUnits={bulkTargetUnits}
        duplicateUnits={duplicateBulkItems}
        creatableUnits={creatableBulkUnits}
        onClose={() => setBulkDrawerOpen(false)}
        onChange={handleBulkChange}
        onBack={() => setBulkStep((prev) => Math.max(prev - 1, 0))}
        onNext={() => setBulkStep((prev) => Math.min(prev + 1, 2))}
        onCreate={handleBulkCreate}
      />

      <ChargeDetailDialog
        item={viewItem}
        onClose={() => setViewItem(null)}
        onEdit={handleEdit}
      />
    </Box>
  );
}