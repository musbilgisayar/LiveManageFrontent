"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { IconArrowLeft } from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";

import AdminDecisionPanel from "../components/admin-detail/AdminDecisionPanel";
import ApplicantInfoCard from "../components/admin-detail/ApplicantInfoCard";
import AuthorityInfoCard from "../components/admin-detail/AuthorityInfoCard";
import DocumentsCard from "../components/admin-detail/DocumentsCard";
import PropertyInfoCard from "../components/admin-detail/PropertyInfoCard";
import SystemChecksCard from "../components/admin-detail/SystemChecksCard";
import TimelineCard from "../components/admin-detail/TimelineCard";
import MetaChip from "../components/admin-detail/shared/MetaChip";

import { getAdminManagementApplicationDetail } from "../services/managementApplication.service";

import {
  riskLabelKey,
  statusLabelKey,
} from "../utils/adminManagementApplication.utils";

import type {
  AdminManagementApplicationDetail,
} from "../types/adminManagementApplication.types";

type AdminManagementApplicationDetailViewProps = {
  applicationId: string;
  onBack?: () => void;
};

export default function AdminManagementApplicationDetailView({
  applicationId,
  onBack,
}: AdminManagementApplicationDetailViewProps) {
  const { t } = useI18nNs("management-applications");

  const [data, setData] =
    useState<AdminManagementApplicationDetail | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const load = useCallback(async () => {
    if (!applicationId) {
      setData(null);
      setErrorMessage("admin.detail.load.missingApplicationId");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response =
        await getAdminManagementApplicationDetail(applicationId);

      if (!response.ok || !response.data) {
        setData(null);

        setErrorMessage(
          response.userMessage ||
            response.message ||
            "admin.detail.load.error",
        );

        return;
      }

      setData(response.data);
    } catch (error) {
      console.error(
        "[AdminManagementApplicationDetailView][load] failed",
        error,
      );

      setData(null);

      setErrorMessage(
        "admin.detail.load.unexpectedError",
      );
    } finally {
      setIsLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    void load();
  }, [load]);

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
            lg: "minmax(0, 1.75fr) minmax(360px, 0.9fr)",
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
            onCompleted={() => {
              void load();
            }}
          />
        </Box>
      </Box>
    </Stack>
  );
}