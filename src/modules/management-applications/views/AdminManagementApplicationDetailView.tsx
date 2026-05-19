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

import { useAuth } from "@/app/context/AuthContext";
import { useI18nNs } from "@/app/context/i18nContext";

import AdminDecisionPanel from "../components/admin-detail/AdminDecisionPanel";
import ApplicantInfoCard from "../components/admin-detail/ApplicantInfoCard";
import AuthorityInfoCard from "../components/admin-detail/AuthorityInfoCard";
import DocumentsCard from "../components/admin-detail/DocumentsCard";
import PropertyInfoCard from "../components/admin-detail/PropertyInfoCard";
import SystemChecksCard from "../components/admin-detail/SystemChecksCard";
import TimelineCard from "../components/admin-detail/TimelineCard";
import MetaChip from "../components/admin-detail/shared/MetaChip";

import useManagementApplicationReviewDetail from "../hooks/useManagementApplicationReviewDetail";

import {
  riskLabelKey,
  statusLabelKey,
} from "../utils/adminManagementApplication.utils";

type AdminManagementApplicationDetailViewProps = {
  applicationId: string;
  onBack?: () => void;
};

const ADMIN_DECISION_PERMISSIONS = [
  "admin.property.applications.view_pending.tenant",
  "admin.property.applications.manage.tenant",
  "admin.property.applications.approve.tenant",
  "admin.property.applications.reject.tenant",
  "admin.property.applications.manage.global",
  "management.application.review",
  "management.application.approve",
  "management.application.reject",
];

export default function AdminManagementApplicationDetailView({
  applicationId,
  onBack,
}: AdminManagementApplicationDetailViewProps) {
  const { t } = useI18nNs("management-applications");
  const { hasAnyPermission } = useAuth();
  const canManageDecision = hasAnyPermission(ADMIN_DECISION_PERMISSIONS);
  const { data, isLoading, errorMessage, reload } =
    useManagementApplicationReviewDetail(applicationId);

  const documentIssueCount = useMemo(() => {
    if (!data) return 0;

    return data.documents.filter(
      (doc) =>
        doc.status === "missing" ||
        doc.status === "needs_revision",
    ).length;
  }, [data]);

  if (isLoading) {
    return (
      <Box
        sx={{
          py: 10,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return (
      <Stack spacing={2}>
        {onBack && (
          <Button
            startIcon={<IconArrowLeft size={18} />}
            onClick={onBack}
            sx={{
              alignSelf: "flex-start",
              borderRadius: 999,
              fontWeight: 800,
              textTransform: "none",
            }}
          >
            {t("admin.detail.backToList")}
          </Button>
        )}

        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {t(errorMessage || "admin.detail.load.error")}
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={2.4}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
      >
        <Stack spacing={1}>
          {onBack && (
            <Button
              startIcon={<IconArrowLeft size={18} />}
              onClick={onBack}
              sx={{
                alignSelf: "flex-start",
                borderRadius: 999,
                fontWeight: 800,
                textTransform: "none",
              }}
            >
              {t("admin.detail.backToList")}
            </Button>
          )}

          <Box>
            <Typography variant="h4" fontWeight={950}>
              {data.applicationNumber}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.4,
                maxWidth: 820,
              }}
            >
              {t("admin.detail.description")}
            </Typography>
          </Box>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          justifyContent={{
            xs: "flex-start",
            md: "flex-end",
          }}
        >
          <MetaChip
            label={t(statusLabelKey(data.status))}
          />

          <MetaChip
            label={`${t("admin.detail.risk.label")}: ${t(
              riskLabelKey(data.riskLevel),
            )}`}
          />

          <MetaChip
            label={`${t("admin.detail.meta.createdAt")}: ${
              data.createdAt
            }`}
          />

          <MetaChip
            label={`${t("admin.detail.meta.updatedAt")}: ${
              data.updatedAt
            }`}
          />

          <MetaChip
            label={t(
              "admin.detail.meta.documentIssues",
              {
                count: documentIssueCount,
              },
            )}
          />
        </Stack>
      </Stack>

      {errorMessage && (
        <Alert
          severity="warning"
          sx={{ borderRadius: 3 }}
        >
          {t(errorMessage)}
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: canManageDecision
              ? "minmax(0, 1.75fr) minmax(360px, 0.9fr)"
              : "minmax(0, 1fr)",
          },
          gap: 2,
          alignItems: "flex-start",
        }}
      >
        <Stack
          spacing={2}
          sx={{ minWidth: 0 }}
        >
          <ApplicantInfoCard
            applicant={data.applicant}
          />

          <PropertyInfoCard
            property={data.property}
          />

          <AuthorityInfoCard
            authority={data.authority}
          />

          <DocumentsCard
            documents={data.documents}
          />

          <SystemChecksCard
            checks={data.systemChecks}
          />

          <TimelineCard
            timeline={data.timeline}
          />
        </Stack>

        {canManageDecision && (
          <Box
            sx={{
              minWidth: 0,
              position: {
                lg: "sticky",
              },
              top: {
                lg: 88,
              },
            }}
          >
            <AdminDecisionPanel
              applicationId={data.applicationId}
              status={data.status}
              onCompleted={() => {
                void reload();
              }}
            />
          </Box>
        )}
      </Box>
    </Stack>
  );
}
