"use client";

import React, { useMemo } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { IconArrowLeft } from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";

import { useI18nNs } from "@/app/context/i18nContext";

import ApplicantInfoCard from "../components/admin-detail/ApplicantInfoCard";
import AuthorityInfoCard from "../components/admin-detail/AuthorityInfoCard";
import DocumentsCard from "../components/admin-detail/DocumentsCard";
import PropertyInfoCard from "../components/admin-detail/PropertyInfoCard";
import SystemChecksCard from "../components/admin-detail/SystemChecksCard";
import TimelineCard from "../components/admin-detail/TimelineCard";
import MetaChip from "../components/admin-detail/shared/MetaChip";

import useManagementApplicationDetail from "../hooks/useManagementApplicationDetail";

import {
  riskLabelKey,
  statusLabelKey,
} from "../utils/adminManagementApplication.utils";

type ManagementApplicationDetailViewProps = {
  applicationId: string;
};

export default function ManagementApplicationDetailView({
  applicationId,
}: ManagementApplicationDetailViewProps) {
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale ?? "tr";
  const { t } = useI18nNs("management-applications");
  const { data, isLoading, errorMessage } =
    useManagementApplicationDetail(applicationId);

  const documentIssueCount = useMemo(() => {
    if (!data) return 0;

    return data.documents.filter(
      (doc) => doc.status === "missing" || doc.status === "needs_revision",
    ).length;
  }, [data]);

  if (isLoading) {
    return (
      <Box sx={{ py: 10, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return (
      <Stack spacing={2}>
        <Button
          startIcon={<IconArrowLeft size={18} />}
          onClick={() => router.push(`/${locale}/management-applications/my`)}
          sx={{
            alignSelf: "flex-start",
            borderRadius: 999,
            fontWeight: 800,
            textTransform: "none",
          }}
        >
          {t("admin.detail.backToList")}
        </Button>

        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {t(errorMessage || "admin.detail.load.error")}
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={2.4}>
      <Stack spacing={1}>
        <Button
          startIcon={<IconArrowLeft size={18} />}
          onClick={() => router.push(`/${locale}/management-applications/my`)}
          sx={{
            alignSelf: "flex-start",
            borderRadius: 999,
            fontWeight: 800,
            textTransform: "none",
          }}
        >
          {t("admin.detail.backToList")}
        </Button>

        <Box>
          <Typography variant="h4" fontWeight={950}>
            {data.applicationNumber}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.4, maxWidth: 820 }}
          >
            {t("admin.detail.description")}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          <MetaChip label={t(statusLabelKey(data.status))} />
          <MetaChip
            label={`${t("admin.detail.risk.label")}: ${t(
              riskLabelKey(data.riskLevel),
            )}`}
          />
          <MetaChip
            label={`${t("admin.detail.meta.createdAt")}: ${data.createdAt}`}
          />
          <MetaChip
            label={`${t("admin.detail.meta.updatedAt")}: ${data.updatedAt}`}
          />
          <MetaChip
            label={t("admin.detail.meta.documentIssues", {
              count: documentIssueCount,
            })}
          />
        </Stack>
      </Stack>

      {errorMessage && (
        <Alert severity="warning" sx={{ borderRadius: 3 }}>
          {t(errorMessage)}
        </Alert>
      )}

      <Stack spacing={2}>
        <ApplicantInfoCard applicant={data.applicant} />
        <PropertyInfoCard property={data.property} />
        <AuthorityInfoCard authority={data.authority} />
        <DocumentsCard documents={data.documents} />
        <SystemChecksCard checks={data.systemChecks} />
        <TimelineCard timeline={data.timeline} />
      </Stack>
    </Stack>
  );
}
