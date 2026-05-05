//Bu dosya, muhasebe modülündeki gelirlerin listelendiği, yönetildiği ve detaylarının görüntülendiği ana görünümdür. Gelir kartları ve tablo görünümü arasında geçiş yapabilir, gelirleri filtreleyebilir, arayabilir, sıralayabilir ve toplu işlemler gerçekleştirebilirsiniz. Ayrıca yeni gelir kaydı oluşturmak için bir çekmece (drawer) bileşeni içerir. Tüm işlemler geçici olarak yerel durum yönetimi ile simüle edilmiştir.
// src/modules/muhasebe/views/MuhasebeManagementView.tsx
"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  alpha,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from "@mui/material";
import {
  IconArrowsTransferUp,
  IconChartBar,
  IconCoin,
  IconFileInvoice,
  IconReceipt,
  IconReceiptTax,
  IconReportMoney,
  IconSettings,
  IconWallet,
  IconX,
} from "@tabler/icons-react";

import MuhasebePaymentsView from "@/modules/muhasebe/views/MuhasebePaymentsView";
import MuhasebeExpensesView from "@/modules/muhasebe/views/MuhasebeExpensesView";
import MuhasebeIncomesView from "@/modules/muhasebe/views/MuhasebeIncomesView";
import MuhasebeExpenseCategoriesView from "@/modules/muhasebe/views/MuhasebeExpenseCategoriesView";
import IncomeCategoriesView from "@/modules/muhasebe/views/IncomeCategoriesView";
import ExpenseInvoiceCreateDrawer, {
  type ExpenseInvoiceCreatePayload,
} from "@/modules/muhasebe/components/expenses/ExpenseInvoiceCreateDrawer";
import MuhasebeChargesView from "@/modules/muhasebe/views/MuhasebeChargesView";
import KasaBankaView from "@/modules/muhasebe/views/KasaBankaView";

type ManagementTab =
  | "charges"
  | "payments"
  | "expenses"
  | "incomes"
  | "cash"
  | "statements"
  | "reports"
  | "settings";

type SettingsTab = "expenseCategories" | "incomeCategories";

const tabs: Array<{
  value: ManagementTab;
  label: string;
  icon: React.ReactElement;
  color: string;
}> = [
  { value: "charges", label: "Tahakkuklar", icon: <IconReceiptTax size={18} />, color: "#3b82f6" },
  { value: "payments", label: "Tahsilatlar", icon: <IconCoin size={18} />, color: "#10b981" },
  { value: "expenses", label: "Giderler", icon: <IconReceipt size={18} />, color: "#ef4444" },
  { value: "incomes", label: "Gelirler", icon: <IconReportMoney size={18} />, color: "#f59e0b" },
  { value: "cash", label: "Kasa / Banka", icon: <IconWallet size={18} />, color: "#06b6d4" },
  { value: "statements", label: "Ekstreler", icon: <IconFileInvoice size={18} />, color: "#8b5cf6" },
  { value: "reports", label: "Raporlar", icon: <IconChartBar size={18} />, color: "#ec489a" },
  { value: "settings", label: "Ayarlar", icon: <IconSettings size={18} />, color: "#6b7280" },
];

export default function MuhasebeManagementView() {
  const theme = useTheme();

  const [activeTab, setActiveTab] = useState<ManagementTab>("charges");
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("expenseCategories");
  const [invoiceDrawerOpen, setInvoiceDrawerOpen] = useState(false);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const activeTabConfig = useMemo(
    () => tabs.find((tab) => tab.value === activeTab) ?? tabs[0],
    [activeTab],
  );

  const showSnackbar = useCallback(
    (message: string, severity: "success" | "error" | "info" = "success") => {
      setSnackbar({ open: true, message, severity });
    },
    [],
  );

  const switchTab = useCallback((tab: ManagementTab) => {
    setActiveTab(tab);
  }, []);

  const handleInvoiceCreated = useCallback(
    (_payload: ExpenseInvoiceCreatePayload) => {
      setActiveTab("expenses");
      showSnackbar("Fatura kaydı oluşturuldu. Giderler sekmesine yönlendirildi.", "success");
    },
    [showSnackbar],
  );

  const renderContent = () => {
    if (activeTab === "payments") {
      return <MuhasebePaymentsView />;
    }
    

    if (activeTab === "expenses") {
      return <MuhasebeExpensesView />;
    }

    if (activeTab === "incomes") {
      return <MuhasebeIncomesView />;
    }

    if (activeTab === "settings") {
      return (
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="h6" fontWeight={900}>
              Muhasebe Ayarları
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gelir ve gider kalemleri gibi muhasebe tanımlarını buradan yönetin.
            </Typography>
          </Box>

          <Tabs
            value={settingsTab}
            onChange={(_, value: SettingsTab) => setSettingsTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.75)}`,
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 700,
              },
            }}
          >
            <Tab value="expenseCategories" label="Gider Kalemleri" />
            <Tab value="incomeCategories" label="Gelir Kalemleri" />
          </Tabs>

          {settingsTab === "expenseCategories" && <MuhasebeExpenseCategoriesView />}
          {settingsTab === "incomeCategories" && <IncomeCategoriesView />}
        </Stack>
      );
    }

  if (activeTab === "charges") {
  return <MuhasebeChargesView />;
}

if (activeTab === "cash") {
  return <KasaBankaView />;
}

    if (activeTab === "statements") {
      return (
        <EmptyModuleCard
          icon={<IconFileInvoice size={64} />}
          title="Ekstreler"
          description="Daire, kişi veya bağımsız bölüm bazlı cari hareketler burada görüntülenecek."
        />
      );
    }

    if (activeTab === "reports") {
      return (
        <EmptyModuleCard
          icon={<IconChartBar size={64} />}
          title="Raporlar"
          description="Gelir, gider, tahsilat, borç ve dönem raporları burada hazırlanacak."
        />
      );
    }

    return null;
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, lg: 4 } }}>
      <Stack spacing={3}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.divider, 0.75)}`,
            background: `linear-gradient(135deg, ${alpha(
              theme.palette.background.paper,
              0.98,
            )} 0%, ${alpha(activeTabConfig.color, 0.035)} 100%)`,
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
              spacing={2}
            >
              <Box>
                <Typography variant="h4" fontWeight={900}>
                  Muhasebe Yönetimi
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<IconReceiptTax size={16} />}
                  onClick={() => switchTab("charges")}
                  sx={{ borderRadius: 2, textTransform: "none" }}
                >
                  Tahakkuk
                </Button>

                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<IconCoin size={16} />}
                  onClick={() => switchTab("payments")}
                  sx={{ borderRadius: 2, textTransform: "none" }}
                >
                  Tahsilat
                </Button>

                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<IconReceipt size={16} />}
                  onClick={() => switchTab("expenses")}
                  sx={{ borderRadius: 2, textTransform: "none" }}
                >
                  Gider
                </Button>

                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<IconReportMoney size={16} />}
                  onClick={() => switchTab("incomes")}
                  sx={{ borderRadius: 2, textTransform: "none" }}
                >
                  Gelir
                </Button>

                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<IconArrowsTransferUp size={16} />}
                  onClick={() => switchTab("cash")}
                  sx={{ borderRadius: 2, textTransform: "none" }}
                >
                  Transfer
                </Button>

                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<IconFileInvoice size={16} />}
                  onClick={() => setInvoiceDrawerOpen(true)}
                  sx={{ borderRadius: 2, textTransform: "none" }}
                >
                  Yeni Fatura
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.divider, 0.75)}`,
            overflow: "hidden",
            boxShadow: "none",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, value: ManagementTab) => switchTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              px: 1,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.75)}`,
              "& .MuiTab-root": {
                minHeight: 56,
                textTransform: "none",
                fontWeight: 700,
                gap: 0.8,
              },
            }}
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                icon={tab.icon}
                iconPosition="start"
                label={tab.label}
              />
            ))}
          </Tabs>

          <Box sx={{ p: { xs: 0, md: 0 } }}>{renderContent()}</Box>
        </Card>
      </Stack>

      <ExpenseInvoiceCreateDrawer
        open={invoiceDrawerOpen}
        onClose={() => setInvoiceDrawerOpen(false)}
        onCreated={handleInvoiceCreated}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: 2 }}
          action={
            <IconButton
              size="small"
              color="inherit"
              onClick={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            >
              <IconX size={16} />
            </IconButton>
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function EmptyModuleCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Box sx={{ p: { xs: 3, md: 6 }, textAlign: "center" }}>
      <Box sx={{ opacity: 0.28 }}>{icon}</Box>
      <Typography variant="h6" fontWeight={900} sx={{ mt: 2 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        {description}
      </Typography>
    </Box>
  );
}