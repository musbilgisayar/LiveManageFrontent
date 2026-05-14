// src/modules/management-applications/views/ManagementApplicationReviewListView.tsx

"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import {
  IconAlertTriangle,
  IconArrowRight,
  IconBuildingCommunity,
  IconChecklist,
  IconClock,
  IconFileDescription,
  IconSearch,
  IconShieldCheck,
  IconUserShield,
} from "@tabler/icons-react";

type ApplicationStatus =
  | "pending"
  | "in_review"
  | "missing_information"
  | "approved"
  | "rejected"
  | "cancelled";

type ApplicationRisk = "low" | "medium" | "high" | "critical";

type ManagementApplicationListItem = {
  id: string;
  applicationNumber: string;
  applicantName: string;
  applicantEmail: string;
  applicationType: string;
  propertyName: string;
  propertyAddress: string;
  unitSummary: string;
  submittedAt: string;
  status: ApplicationStatus;
  risk: ApplicationRisk;
  missingDocumentCount: number;
  requestedRole: string;
};

const applications: ManagementApplicationListItem[] = [
  {
    id: "1",
    applicationNumber: "LM-MA-2026-000124",
    applicantName: "Ahmet Yılmaz",
    applicantEmail: "ahmet.yilmaz@mail.com",
    applicationType: "Site Yönetimi Başvurusu",
    propertyName: "Green Park Sitesi",
    propertyAddress: "Zürich / Altstetten",
    unitSummary: "3 blok · 48 daire",
    submittedAt: "Bugün 10:42",
    status: "pending",
    risk: "medium",
    missingDocumentCount: 0,
    requestedRole: "Site Yöneticisi",
  },
  {
    id: "2",
    applicationNumber: "LM-MA-2026-000125",
    applicantName: "Mehmet Kaya",
    applicantEmail: "mehmet.kaya@mail.com",
    applicationType: "Apartman Yönetimi Başvurusu",
    propertyName: "Mavi Bahçe Apartmanı",
    propertyAddress: "Bern / Zentrum",
    unitSummary: "1 blok · 24 daire",
    submittedAt: "Dün 16:15",
    status: "missing_information",
    risk: "high",
    missingDocumentCount: 2,
    requestedRole: "Muhasebe Yetkilisi",
  },
  {
    id: "3",
    applicationNumber: "LM-MA-2026-000126",
    applicantName: "Zeynep Demir",
    applicantEmail: "zeynep.demir@mail.com",
    applicationType: "Yönetici Yetkilendirme",
    propertyName: "Koru Evleri 3. Etap",
    propertyAddress: "Basel / Kleinbasel",
    unitSummary: "5 blok · 126 daire",
    submittedAt: "2 gün önce",
    status: "in_review",
    risk: "critical",
    missingDocumentCount: 1,
    requestedRole: "Tam Yetkili Yönetici",
  },
];

export default function ManagementApplicationReviewListView() {
  const theme = useTheme<Theme>();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ApplicationStatus | "all">("all");
  const [risk, setRisk] = useState<ApplicationRisk | "all">("all");

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();

    return applications.filter((item) => {
      const matchesSearch =
        !q ||
        item.applicationNumber.toLowerCase().includes(q) ||
        item.applicantName.toLowerCase().includes(q) ||
        item.propertyName.toLowerCase().includes(q);

      const matchesStatus = status === "all" || item.status === status;
      const matchesRisk = risk === "all" || item.risk === risk;

      return matchesSearch && matchesStatus && matchesRisk;
    });
  }, [search, status, risk]);

  const pendingCount = applications.filter((x) => x.status === "pending").length;
  const reviewCount = applications.filter((x) => x.status === "in_review").length;
  const missingCount = applications.filter((x) => x.status === "missing_information").length;
  const criticalCount = applications.filter((x) => x.risk === "critical").length;

  return (
    <Box>
      <Box
        sx={{
          mb: 3,
          p: { xs: 2, md: 2.5 },
          borderRadius: 5,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.07,
          )} 0%, ${alpha(theme.palette.warning.main, 0.045)} 100%)`,
        }}
      >
        <Stack spacing={1.15}>
          <Chip
            label="Admin İnceleme Merkezi"
            size="small"
            sx={{
              width: "fit-content",
              fontWeight: 850,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              color: "primary.main",
            }}
          />

          <Typography variant="h4" fontWeight={950} lineHeight={1.08}>
            Yönetim Başvuruları
          </Typography>

          <Typography color="text.secondary" sx={{ maxWidth: 820 }}>
            Gelen site, apartman ve yönetici yetkilendirme başvurularını inceleyin;
            eksik bilgi isteyin, onaylayın, reddedin veya rol/yetki sürecini başlatın.
          </Typography>
        </Stack>
      </Box>

      <Box
        sx={{
          mb: 2,
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr",
            xl: "repeat(4, minmax(0, 1fr))",
          },
          gap: 2,
        }}
      >
        <SummaryCard
          icon={<IconClock size={21} />}
          label="Bekleyen"
          value={pendingCount}
          tone="warning"
        />
        <SummaryCard
          icon={<IconChecklist size={21} />}
          label="İncelemede"
          value={reviewCount}
        />
        <SummaryCard
          icon={<IconFileDescription size={21} />}
          label="Eksik Bilgi"
          value={missingCount}
          tone="error"
        />
        <SummaryCard
          icon={<IconAlertTriangle size={21} />}
          label="Kritik Risk"
          value={criticalCount}
          tone="error"
        />
      </Box>

      <Card
        variant="outlined"
        sx={{
          mb: 2,
          borderRadius: 4.5,
          borderColor: alpha(theme.palette.text.primary, 0.08),
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.4fr 0.8fr 0.8fr" },
              gap: 1.5,
            }}
          >
            <TextField
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Başvuru no, kişi veya site ara..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={18} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              select
              size="small"
              label="Durum"
              value={status}
              onChange={(e) => setStatus(e.target.value as ApplicationStatus | "all")}
            >
              <MenuItem value="all">Tüm durumlar</MenuItem>
              <MenuItem value="pending">Bekliyor</MenuItem>
              <MenuItem value="in_review">İncelemede</MenuItem>
              <MenuItem value="missing_information">Eksik bilgi</MenuItem>
              <MenuItem value="approved">Onaylandı</MenuItem>
              <MenuItem value="rejected">Reddedildi</MenuItem>
              <MenuItem value="cancelled">İptal</MenuItem>
            </TextField>

            <TextField
              select
              size="small"
              label="Risk"
              value={risk}
              onChange={(e) => setRisk(e.target.value as ApplicationRisk | "all")}
            >
              <MenuItem value="all">Tüm riskler</MenuItem>
              <MenuItem value="low">Düşük</MenuItem>
              <MenuItem value="medium">Orta</MenuItem>
              <MenuItem value="high">Yüksek</MenuItem>
              <MenuItem value="critical">Kritik</MenuItem>
            </TextField>
          </Box>
        </CardContent>
      </Card>

      <Stack spacing={1.5}>
        {filteredItems.map((item) => (
          <ApplicationRow
            key={item.id}
            item={item}
            onOpen={() => router.push(`/management-applications/review/${item.id}`)}
          />
        ))}
      </Stack>
    </Box>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone?: "default" | "success" | "warning" | "error";
}) {
  const theme = useTheme<Theme>();
  const color = getToneColor(theme, tone);

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4,
        borderColor: alpha(color, 0.18),
        bgcolor: alpha(color, 0.035),
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2.5,
              display: "grid",
              placeItems: "center",
              bgcolor: alpha(color, 0.11),
              color,
            }}
          >
            {icon}
          </Box>

          <Box>
            <Typography variant="h5" fontWeight={950} lineHeight={1}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
              {label}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function ApplicationRow({
  item,
  onOpen,
}: {
  item: ManagementApplicationListItem;
  onOpen: () => void;
}) {
  const theme = useTheme<Theme>();
  const statusColor = getStatusColor(theme, item.status);
  const riskColor = getRiskColor(theme, item.risk);

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4.5,
        borderColor: alpha(theme.palette.text.primary, 0.08),
        transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: theme.shadows[6],
          borderColor: alpha(theme.palette.primary.main, 0.22),
        },
      }}
    >
      <CardContent sx={{ p: 2.2 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1.1fr 1.25fr 0.85fr auto" },
            gap: 1.6,
            alignItems: "center",
          }}
        >
          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.75,
                display: "grid",
                placeItems: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.09),
                color: "primary.main",
                flexShrink: 0,
              }}
            >
              <IconUserShield size={22} />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography fontWeight={950}>{item.applicationNumber}</Typography>
              <Typography variant="body2" color="text.secondary">
                {item.applicationType}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.submittedAt}
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ minWidth: 0 }}>
            <Typography fontWeight={900}>{item.applicantName}</Typography>
            <Typography variant="body2" color="text.secondary">
              {item.applicantEmail}
            </Typography>

            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 0.8 }}>
              <Chip
                label={item.requestedRole}
                size="small"
                sx={{
                  fontWeight: 800,
                  bgcolor: alpha(theme.palette.text.primary, 0.045),
                  color: "text.secondary",
                }}
              />

              {item.missingDocumentCount > 0 && (
                <Chip
                  label={`${item.missingDocumentCount} eksik belge`}
                  size="small"
                  sx={{
                    fontWeight: 850,
                    bgcolor: alpha(theme.palette.error.main, 0.08),
                    color: "error.main",
                    border: `1px solid ${alpha(theme.palette.error.main, 0.18)}`,
                  }}
                />
              )}
            </Stack>
          </Box>

          <Stack spacing={0.55}>
            <Stack direction="row" spacing={0.8} alignItems="center">
              <IconBuildingCommunity size={17} />
              <Typography fontWeight={850}>{item.propertyName}</Typography>
            </Stack>

            <Typography variant="body2" color="text.secondary">
              {item.propertyAddress}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {item.unitSummary}
            </Typography>
          </Stack>

          <Stack
            direction={{ xs: "row", lg: "column" }}
            spacing={0.9}
            alignItems={{ xs: "center", lg: "flex-end" }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={0.75} flexWrap="wrap" justifyContent="flex-end">
              <Chip
                label={statusLabel(item.status)}
                size="small"
                sx={{
                  fontWeight: 850,
                  bgcolor: alpha(statusColor, 0.1),
                  color: statusColor,
                  border: `1px solid ${alpha(statusColor, 0.18)}`,
                }}
              />

              <Chip
                label={riskLabel(item.risk)}
                size="small"
                sx={{
                  fontWeight: 850,
                  bgcolor: alpha(riskColor, 0.1),
                  color: riskColor,
                  border: `1px solid ${alpha(riskColor, 0.18)}`,
                }}
              />
            </Stack>

            <Button
              variant="contained"
              endIcon={<IconArrowRight size={17} />}
              onClick={onOpen}
              sx={{
                borderRadius: 3,
                fontWeight: 850,
                textTransform: "none",
                whiteSpace: "nowrap",
              }}
            >
              İncele
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}

function getToneColor(theme: Theme, tone: "default" | "success" | "warning" | "error") {
  if (tone === "success") return theme.palette.success.main;
  if (tone === "warning") return theme.palette.warning.main;
  if (tone === "error") return theme.palette.error.main;
  return theme.palette.primary.main;
}

function getStatusColor(theme: Theme, status: ApplicationStatus) {
  if (status === "approved") return theme.palette.success.main;
  if (status === "rejected" || status === "cancelled") return theme.palette.error.main;
  if (status === "missing_information") return theme.palette.warning.main;
  if (status === "in_review") return theme.palette.info.main;
  return theme.palette.primary.main;
}

function getRiskColor(theme: Theme, risk: ApplicationRisk) {
  if (risk === "critical") return theme.palette.error.dark;
  if (risk === "high") return theme.palette.error.main;
  if (risk === "medium") return theme.palette.warning.main;
  return theme.palette.success.main;
}

function statusLabel(status: ApplicationStatus) {
  if (status === "pending") return "Bekliyor";
  if (status === "in_review") return "İncelemede";
  if (status === "missing_information") return "Eksik Bilgi";
  if (status === "approved") return "Onaylandı";
  if (status === "rejected") return "Reddedildi";
  return "İptal";
}

function riskLabel(risk: ApplicationRisk) {
  if (risk === "critical") return "Kritik";
  if (risk === "high") return "Yüksek Risk";
  if (risk === "medium") return "Orta Risk";
  return "Düşük Risk";
}
