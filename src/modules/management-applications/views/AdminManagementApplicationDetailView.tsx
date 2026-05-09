// src/modules/management-applications/views/AdminManagementApplicationDetailView.tsx

"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { IconArrowLeft } from "@tabler/icons-react";

import AdminDecisionPanel from "../components/admin-detail/AdminDecisionPanel";
import ApplicantInfoCard from "../components/admin-detail/ApplicantInfoCard";
import AuthorityInfoCard from "../components/admin-detail/AuthorityInfoCard";
import DocumentsCard from "../components/admin-detail/DocumentsCard";
import PropertyInfoCard from "../components/admin-detail/PropertyInfoCard";
import SystemChecksCard from "../components/admin-detail/SystemChecksCard";
import TimelineCard from "../components/admin-detail/TimelineCard";
import MetaChip from "../components/admin-detail/shared/MetaChip";

import type {
  AdminApplicationRiskLevel,
  AdminApplicationStatus,
  AdminManagementApplicationDetail,
} from "../types/adminManagementApplication.types";

import {
  riskLabel,
  statusLabel,
} from "../utils/adminManagementApplication.utils";

const mockDetail: AdminManagementApplicationDetail = {
  applicationId: "1",
  applicationNumber: "APP-2026-000123",
  status: "pending",
  riskLevel: "medium",
  createdAt: "02 Mayıs 2026 10:42",
  updatedAt: "02 Mayıs 2026 11:05",

  applicant: {
    userId: "user-1",
    fullName: "Ahmet Yılmaz",
    email: "ahmet@test.com",
    phone: "+41 79 123 45 67",
    emailVerified: true,
    phoneVerified: true,
    identityNumberMasked: "756.***.***.12",
  },

  property: {
    propertyName: "Green Park Sitesi",
    structureType: "Site Yönetimi",
    blockCount: 3,
    totalApartmentCount: 48,
    addressSummary: "Zürich / Altstetten, Bahnhofstrasse 12, 8048",
  },

  authority: {
    representationType: "Profesyonel Yönetici",
    requestedRole: "Admin tarafından atanacak",
    authorityStartDate: "02 Mayıs 2026",
    authorityEndDate: "Süresiz / belirtilmedi",
    authorityScope:
      "Yönetim işlemleri, muhasebe takibi, duyuru yayınlama ve bakım taleplerini yönetme.",
  },

  documents: [
    {
      id: "1",
      documentType: "Kimlik Belgesi",
      fileName: "kimlik.pdf",
      fileSize: "1.4 MB",
      uploadedAt: "02 Mayıs 2026",
      status: "valid",
    },
    {
      id: "2",
      documentType: "Yetki Belgesi",
      fileName: "yetki.pdf",
      fileSize: "820 KB",
      uploadedAt: "02 Mayıs 2026",
      status: "needs_revision",
      adminNote: "Belgede imza alanı eksik görünüyor.",
    },
  ],

  systemChecks: [
    {
      id: "1",
      label: "E-posta doğrulaması",
      description: "Başvuru sahibinin e-posta adresi doğrulanmış.",
      status: "passed",
    },
    {
      id: "2",
      label: "Telefon doğrulaması",
      description: "Başvuru sahibinin telefon numarası doğrulanmış.",
      status: "passed",
    },
    {
      id: "3",
      label: "Yetki belgesi kontrolü",
      description: "Yetki belgesinde revizyon gerekebilir.",
      status: "warning",
    },
  ],

  timeline: [
    {
      id: "1",
      action: "Başvuru oluşturuldu",
      actorName: "Ahmet Yılmaz",
      occurredAt: "02 Mayıs 2026 10:42",
    },
    {
      id: "2",
      action: "Belgeler yüklendi",
      actorName: "Ahmet Yılmaz",
      occurredAt: "02 Mayıs 2026 10:48",
      note: "2 belge eklendi.",
    },
    {
      id: "3",
      action: "Admin incelemesine alındı",
      actorName: "Sistem",
      occurredAt: "02 Mayıs 2026 11:05",
    },
  ],
};

export default function AdminManagementApplicationDetailView({
  applicationId,
}: {
  applicationId: string;
}) {
  const theme = useTheme<Theme>();
  const router = useRouter();

  const data = mockDetail;

  const statusColor = getStatusColor(theme, data.status);
  const riskColor = getRiskColor(theme, data.riskLevel);

  const documentIssueCount = useMemo(
    () => data.documents.filter((x) => x.status !== "valid").length,
    [data.documents],
  );

  return (
    <Box>
      <Card
        variant="outlined"
        sx={{
          mb: 3,
          borderRadius: 5,
          borderColor: alpha(statusColor, 0.2),
          background: `linear-gradient(135deg, ${alpha(
            statusColor,
            0.06,
          )} 0%, ${alpha(theme.palette.background.paper, 0.96)} 100%)`,
        }}
      >
        <CardContent sx={{ p: { xs: 2.25, md: 3 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            spacing={2}
          >
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip
                  label={data.applicationNumber}
                  size="small"
                  sx={{
                    fontWeight: 900,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: "primary.main",
                  }}
                />

                <Chip
                  label={statusLabel(data.status)}
                  size="small"
                  sx={{
                    fontWeight: 900,
                    bgcolor: alpha(statusColor, 0.1),
                    color: statusColor,
                    border: `1px solid ${alpha(statusColor, 0.2)}`,
                  }}
                />

                <Chip
                  label={`Risk: ${riskLabel(data.riskLevel)}`}
                  size="small"
                  sx={{
                    fontWeight: 900,
                    bgcolor: alpha(riskColor, 0.1),
                    color: riskColor,
                    border: `1px solid ${alpha(riskColor, 0.2)}`,
                  }}
                />
              </Stack>

              <Typography variant="h4" fontWeight={950} lineHeight={1.1}>
                {data.property.propertyName}
              </Typography>

              <Typography color="text.secondary" sx={{ maxWidth: 820 }}>
                Başvuru sahibi, yetki bilgileri, belgeler ve sistem kontrolleri
                üzerinden başvuruyu inceleyip karar verin.
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <MetaChip label={`Oluşturma: ${data.createdAt}`} />
                <MetaChip label={`Güncelleme: ${data.updatedAt}`} />
                <MetaChip label={`${documentIssueCount} belge uyarısı`} />
              </Stack>
            </Stack>

            <Button
              startIcon={<IconArrowLeft size={18} />}
              onClick={() => router.push("/management-applications/review")}
              sx={{
                height: 44,
                borderRadius: 999,
                fontWeight: 850,
                textTransform: "none",
                alignSelf: { xs: "flex-start", md: "flex-start" },
              }}
            >
              Listeye Dön
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", xl: "1.45fr 0.9fr" },
          gap: 2,
          alignItems: "start",
        }}
      >
        <Stack spacing={2}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
              gap: 2,
            }}
          >
            <ApplicantInfoCard applicant={data.applicant} />
            <PropertyInfoCard property={data.property} />
          </Box>

          <AuthorityInfoCard authority={data.authority} />

          <DocumentsCard documents={data.documents} />
        </Stack>

        <Stack spacing={2}>
          <SystemChecksCard checks={data.systemChecks} />

          <TimelineCard timeline={data.timeline} />

          <AdminDecisionPanel applicationId={applicationId} />
        </Stack>
      </Box>
    </Box>
  );
}

function getStatusColor(theme: Theme, status: AdminApplicationStatus) {
  if (status === "approved") return theme.palette.success.main;
  if (status === "rejected") return theme.palette.error.main;
  if (status === "missing_information") return theme.palette.warning.main;
  if (status === "in_review") return theme.palette.info.main;

  return theme.palette.primary.main;
}

function getRiskColor(theme: Theme, risk: AdminApplicationRiskLevel) {
  if (risk === "critical") return theme.palette.error.dark;
  if (risk === "high") return theme.palette.error.main;
  if (risk === "medium") return theme.palette.warning.main;

  return theme.palette.success.main;
}