//bu sayfa, muhasebe modülü için ana dashboard görünümünü sağlar. Kullanıcı, seçilen site/apartmana ait muhasebe özetini görebilir, tanımlamalara erişebilir ve önemli finansal göstergeleri inceleyebilir. Dashboard, toplam tahakkuk, tahsilat, bekleyen borç, gecikmiş borç, giderler ve kasa/banka bakiyesi gibi bilgileri özet kartlar halinde sunar. Ayrıca, tahsilat oranı grafiği, kasa/banka hesap özeti, son işlemler ve gecikmiş borçlar gibi detaylı bileşenler içerir. Veriler mock olarak sağlanır ve gerçek backend bağlantısı tamamlandığında canlı verilerle güncellenecektir.
// src/modules/muhasebe/views/MuhasebeDashboardView.tsx
"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import {
  IconBuildingBank,
  IconCash,
  IconChartBar,
  IconCoin,
  IconFileInvoice,
  IconReceipt,
  IconSettings,
} from "@tabler/icons-react";

import { useMuhasebeDashboard } from "../hooks/useMuhasebeDashboard";
import { useMuhasebeSetupStatus } from "../hooks/useMuhasebeSetupStatus";

import MuhasebeKurulumDurumuCard from "../components/dashboard/MuhasebeKurulumDurumuCard";
import CollectionRateCard from "../components/dashboard/CollectionRateCard";
import CashAccountSummaryCard from "../components/dashboard/CashAccountSummaryCard";
import RecentTransactionsCard from "../components/dashboard/RecentTransactionsCard";
import OverdueChargesCard from "../components/dashboard/OverdueChargesCard";

const mockProperties = [
  {
    id: "demo-property-a",
    name: "A Blok Site Yönetimi",
  },
  {
    id: "demo-property-b",
    name: "B Apartmanı",
  },
  {
    id: "demo-property-c",
    name: "C Residence",
  },
];

const mockData = {
  propertyId: "demo-property-a",
  propertyName: "A Blok Site Yönetimi",
  currency: "CHF",
  totals: {
    totalCharged: 12500,
    totalCollected: 9800,
    outstandingAmount: 2700,
    overdueAmount: 1200,
    totalExpense: 4300,
    cashBalance: 5500,
    collectionRate: 78,
  },
};

function SummaryCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        height: "fit-content",
        border: `1px solid ${alpha(color, 0.22)}`,
        bgcolor: alpha(color, 0.055),
      }}
    >
      <CardContent sx={{ p: 2.25, "&:last-child": { pb: 2.25 } }}>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <Box minWidth={0}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {title}
            </Typography>

            <Typography variant="h6" fontWeight={800} lineHeight={1.25} mt={0.4}>
              {value}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 42,
              height: 42,
              flexShrink: 0,
              borderRadius: 2.5,
              display: "grid",
              placeItems: "center",
              color,
              bgcolor: alpha(color, 0.14),
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function MuhasebeDashboardView() {
  const theme = useTheme();
  const router = useRouter();

  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(
    mockProperties[0]?.id ?? ""
  );

  const selectedProperty = useMemo(() => {
    return (
      mockProperties.find((item) => item.id === selectedPropertyId) ??
      mockProperties[0]
    );
  }, [selectedPropertyId]);

  const { data, loading, error } = useMuhasebeDashboard(selectedPropertyId);

  const { data: setupStatus, loading: setupLoading } =
    useMuhasebeSetupStatus(selectedPropertyId);

  const isSetupComplete =
    Boolean(setupStatus?.hasCashAccount) &&
    Boolean(setupStatus?.hasActivePeriod) &&
    Boolean(setupStatus?.hasCharges);

  const viewData = data ?? {
    propertyId: selectedProperty?.id ?? mockData.propertyId,
    propertyName: selectedProperty?.name ?? mockData.propertyName,
    totals: {
      totalCharged: mockData.totals.totalCharged,
      totalCollected: mockData.totals.totalCollected,
      outstandingAmount: mockData.totals.outstandingAmount,
      overdueAmount: mockData.totals.overdueAmount,
      totalExpense: mockData.totals.totalExpense,
      cashBalance: mockData.totals.cashBalance,
      collectionRate: mockData.totals.collectionRate,
      currency: mockData.currency,
    },
    cashAccounts: [
      {
        id: "1",
        name: "Nakit Kasa",
        type: "cash",
        balance: 1200,
        currency: mockData.currency,
      },
      {
        id: "2",
        name: "Banka Hesabı",
        type: "bank",
        balance: 4300,
        currency: mockData.currency,
      },
    ],
    recentPayments: [
      {
        id: "p1",
        unitLabel: "A Blok Daire 12",
        payerName: "Mehmet Kaya",
        amount: 250,
        currency: mockData.currency,
        paymentDate: "2026-05-10",
        method: "Banka Havalesi",
        status: "completed",
      },
      {
        id: "p2",
        unitLabel: "A Blok Daire 8",
        payerName: "Ayşe Demir",
        amount: 250,
        currency: mockData.currency,
        paymentDate: "2026-05-09",
        method: "Nakit",
        status: "completed",
      },
    ],
    recentExpenses: [
      {
        id: "e1",
        category: "Asansör Bakımı",
        vendorName: "Lift Service GmbH",
        amount: 850,
        currency: mockData.currency,
        expenseDate: "2026-05-08",
        status: "paid",
      },
      {
        id: "e2",
        category: "Temizlik",
        vendorName: "CleanPro",
        amount: 420,
        currency: mockData.currency,
        expenseDate: "2026-05-06",
        status: "paid",
      },
    ],
    overdueCharges: [
      {
        id: "o1",
        unitLabel: "A Blok Daire 5",
        ownerName: "Ali Yılmaz",
        amount: 250,
        paidAmount: 0,
        remainingAmount: 250,
        dueDate: "2026-05-01",
        daysOverdue: 12,
      },
      {
        id: "o2",
        unitLabel: "A Blok Daire 9",
        ownerName: "Fatma Kaya",
        amount: 250,
        paidAmount: 0,
        remainingAmount: 250,
        dueDate: "2026-05-01",
        daysOverdue: 9,
      },
    ],
  };

  return (
   <Box sx={{ p: 0 }}>
      <Card
        elevation={0}
        sx={{
          mb: 2,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
          bgcolor: alpha(theme.palette.background.paper, 0.9),
        }}
      >
        <CardContent sx={{ p: 2.25, "&:last-child": { pb: 2.25 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h5" fontWeight={800}>
                Muhasebe
              </Typography>

              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Önce işlem yapılacak site/apartmanı seçin. Tüm muhasebe kayıtları
                seçilen yapıya göre gösterilir.
              </Typography>
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
              <TextField
                select
                size="small"
                label="Site / Apartman"
                value={selectedPropertyId}
                onChange={(event) => setSelectedPropertyId(event.target.value)}
                sx={{
                  minWidth: { xs: "100%", md: 280 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
                  },
                }}
              >
                {mockProperties.map((property) => (
                  <MenuItem key={property.id} value={property.id}>
                    {property.name}
                  </MenuItem>
                ))}
              </TextField>

              <Button
                variant="outlined"
                startIcon={<IconSettings size={18} />}
                onClick={() => router.push("/muhasebe/setup")}
                sx={{
                  borderRadius: 2.5,
                  whiteSpace: "nowrap",
                }}
              >
                Tanımlamalar
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {!setupLoading && !isSetupComplete && (
        <Card
          elevation={0}
          sx={{
            mb: 2,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.warning.main, 0.25)}`,
            bgcolor: alpha(theme.palette.warning.main, 0.06),
          }}
        >
          <CardContent sx={{ p: 2.25, "&:last-child": { pb: 2.25 } }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.5}
              alignItems={{ xs: "stretch", md: "center" }}
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="subtitle2" fontWeight={800}>
                  Bu site için muhasebe tanımlamaları eksik
                </Typography>

                <Typography variant="body2" color="text.secondary" mt={0.3}>
                  Dashboard görüntülenebilir; ancak işlem yapmadan önce kasa/banka,
                  dönem ve aidat tanımlamalarını tamamlamanız gerekir.
                </Typography>
              </Box>

              <Button
                variant="contained"
                color="warning"
                onClick={() => router.push("/muhasebe/setup")}
                sx={{ borderRadius: 2.5, whiteSpace: "nowrap" }}
              >
                Tanımlamalara Git
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      <Box sx={{ mb: 2 }}>
        <MuhasebeKurulumDurumuCard propertyName={viewData.propertyName} />
      </Box>

      <Stack spacing={0.5} mb={2.5}>
        <Typography variant="body2" color="text.secondary">
          {viewData.propertyName} için tahakkuk, tahsilat, gider ve kasa/banka özeti.
        </Typography>

        {loading && (
          <Typography variant="body2" color="text.secondary">
            Muhasebe verileri yükleniyor...
          </Typography>
        )}

        {error && (
          <Typography variant="body2" color="warning.main">
            Demo veriler gösteriliyor. Canlı muhasebe verisi backend bağlantısı
            tamamlanınca yüklenecek.
          </Typography>
        )}
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            lg: "1fr 1fr 1fr",
            xl: "1fr 1fr 1fr 1fr",
          },
          gap: 2,
          alignItems: "start",
        }}
      >
        <SummaryCard
          title="Toplam Tahakkuk"
          value={`${viewData.totals.totalCharged} ${viewData.totals.currency}`}
          icon={<IconFileInvoice size={21} />}
          color={theme.palette.primary.main}
        />

        <SummaryCard
          title="Toplam Tahsilat"
          value={`${viewData.totals.totalCollected} ${viewData.totals.currency}`}
          icon={<IconCash size={21} />}
          color={theme.palette.success.main}
        />

        <SummaryCard
          title="Bekleyen Borç"
          value={`${viewData.totals.outstandingAmount} ${viewData.totals.currency}`}
          icon={<IconCoin size={21} />}
          color={theme.palette.warning.main}
        />

        <SummaryCard
          title="Gecikmiş Borç"
          value={`${viewData.totals.overdueAmount} ${viewData.totals.currency}`}
          icon={<IconReceipt size={21} />}
          color={theme.palette.error.main}
        />

        <SummaryCard
          title="Bu Ayki Gider"
          value={`${viewData.totals.totalExpense} ${viewData.totals.currency}`}
          icon={<IconChartBar size={21} />}
          color={theme.palette.info.main}
        />

        <SummaryCard
          title="Kasa / Banka"
          value={`${viewData.totals.cashBalance} ${viewData.totals.currency}`}
          icon={<IconBuildingBank size={21} />}
          color={theme.palette.secondary.main}
        />
      </Box>

      <Box
        sx={{
          mt: 2,
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "1fr 1fr",
          },
          gap: 2,
          alignItems: "start",
        }}
      >
        <CollectionRateCard
          totalCharged={viewData.totals.totalCharged}
          totalCollected={viewData.totals.totalCollected}
          collectionRate={viewData.totals.collectionRate}
          currency={viewData.totals.currency}
        />

        <CashAccountSummaryCard accounts={viewData.cashAccounts} />
      </Box>

      <Box sx={{ mt: 2 }}>
        <RecentTransactionsCard
          payments={viewData.recentPayments}
          expenses={viewData.recentExpenses}
        />
      </Box>

      <Box sx={{ mt: 2 }}>
        <OverdueChargesCard
          items={viewData.overdueCharges}
          currency={viewData.totals.currency}
        />
      </Box>

      <Card
        elevation={0}
        sx={{
          mt: 2,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
        }}
      >
        <CardContent sx={{ p: 2.25, "&:last-child": { pb: 2.25 } }}>
          <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
            <Button variant="contained" onClick={() => router.push("/muhasebe/setup")}>
              Yeni Dönem
            </Button>
            <Button variant="outlined">Aidat Oluştur</Button>
            <Button variant="outlined">Ödeme Kaydet</Button>
            <Button variant="outlined">Gider Ekle</Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}