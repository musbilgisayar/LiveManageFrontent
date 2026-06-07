// src/modules/management-applications/views/ManagementApplicationDetailView.tsx
"use client";

import React, { useState } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  IconArrowLeft,
  IconDownload,
  IconFileDescription,
} from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";

import { useI18nNs } from "@/app/context/i18nContext";

import useManagementApplicationDetail from "../hooks/useManagementApplicationDetail";

import type {
  ManagementApplicationDetail,
  ManagementApplicationDocument,
} from "../types/managementApplicationDetail.types";

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
        <BackButton
          label={t("detail.actions.backToMyApplications")}
          onClick={() => router.push(`/${locale}/management-applications/my`)}
        />

        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {errorMessage
            ? t(errorMessage)
            : t("detail.load.error")}
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={2.4}>
      <BackButton
        label={t("detail.actions.backToMyApplications")}
        onClick={() => router.push(`/${locale}/management-applications/my`)}
      />

      <HeaderCard data={data} t={t} />

      {errorMessage && (
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          {t(errorMessage)}
        </Alert>
      )}

      <DetailSection
        title={t("detail.applicant.title")}
        description={t("detail.applicant.description")}
      >
        <DetailList
          items={[
            [t("detail.applicant.fullName"), data.applicant.fullName],
            [t("detail.applicant.email"), data.applicant.email],
            [t("detail.applicant.phone"), data.applicant.phone],
            [
              t("detail.applicant.applicantType"),
              t(data.applicant.applicantTypeKey),
            ],
            ...sensitiveRows(data, t),
            [t("detail.applicant.verification"), verificationText(data, t)],
          ]}
        />
      </DetailSection>

      <DetailSection
        title={t("detail.property.title")}
        description={t("detail.property.description")}
      >
        <DetailList
          items={[
            [t("detail.property.propertyName"), data.property.propertyName],
            [t("detail.property.descriptionLabel"), data.property.description],
            [t("detail.property.propertyType"), t(data.property.propertyTypeKey)],
            [t("detail.property.blockCount"), data.property.blockCount],
            [
              t("detail.property.residentialUnitCount"),
              data.property.residentialUnitCount,
            ],
            [
              t("detail.property.commercialUnitCount"),
              data.property.commercialUnitCount,
            ],
            [t("detail.property.totalUnitCount"), data.property.totalUnitCount],
            [t("detail.property.addressSummary"), data.property.addressSummary],
          ]}
        />
      </DetailSection>

      <DetailSection
        title={t("detail.authority.title")}
        description={t("detail.authority.description")}
      >
        <DetailList
          items={[
            [
              t("detail.authority.representationType"),
              t(data.authority.representationTypeKey),
            ],
         
            [
              t("detail.authority.authorityStartDate"),
              data.authority.authorityStartDate,
            ],
            [
              t("detail.authority.authorityEndDate"),
              data.authority.authorityEndDate
                ? translateMaybeKey(data.authority.authorityEndDate, t)
                : null,
            ],
          ]}
        />
      </DetailSection>

      <DocumentsSection documents={data.documents} t={t} />

      <DetailSection
        title={t("detail.timeline.title")}
        description={t("detail.timeline.description")}
      >
        {data.timeline.length === 0 ? (
          <EmptyText text={t("detail.common.notProvided")} />
        ) : (
          <Stack spacing={1.2}>
            {data.timeline.map((item) => (
              <Box key={item.id}>
                <Typography variant="body2" fontWeight={800}>
                  {translateWithFallback(
                    item.actionKey,
                    item.actionFallback,
                    t,
                  )}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  {item.occurredAt}
                </Typography>

                {item.note && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.35 }}
                  >
                    {item.note}
                  </Typography>
                )}

                <Divider sx={{ mt: 1.2 }} />
              </Box>
            ))}
          </Stack>
        )}
      </DetailSection>
    </Stack>
  );
}

function HeaderCard({
  data,
  t,
}: {
  data: ManagementApplicationDetail;
  t: (key: string) => string;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2.5,
        p: { xs: 2, md: 2.6 },
      }}
    >
      <Stack spacing={1.2}>
        <Typography variant="h4" fontWeight={950}>
          {data.applicationNumber}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {t("detail.header.description")}
        </Typography>

        <Divider />

        <DetailList
          items={[
            [t("detail.header.status"), t(`detail.status.${data.status}`)],
            [t("detail.header.createdAt"), data.createdAt],
            [t("detail.header.updatedAt"), data.updatedAt],
            [t("detail.header.documentCount"), data.documents.length],
          ]}
        />
      </Stack>
    </Paper>
  );
}

function DetailSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2.5,
        p: { xs: 2, md: 2.4 },
      }}
    >
      <Stack spacing={1.5}>
        <Box>
          <Typography variant="h6" fontWeight={900}>
            {title}
          </Typography>

          {description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.35 }}
            >
              {description}
            </Typography>
          )}
        </Box>

        <Divider />

        {children}
      </Stack>
    </Paper>
  );
}

function DetailList({
  items,
}: {
  items: Array<[React.ReactNode, React.ReactNode]>;
}) {
  return (
    <Stack spacing={0.95}>
      {items.map(([label, value], index) => (
        <Box
          key={index}
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "140px minmax(0, 1fr)",
              sm: "210px minmax(0, 1fr)",
            },
            columnGap: 2,
            alignItems: "start",
          }}
        >
          <Typography variant="body2" color="text.secondary" fontWeight={800}>
            {label}
          </Typography>

          <Typography
            variant="body2"
            color="text.primary"
            sx={{
              fontWeight: 650,
              overflowWrap: "anywhere",
            }}
          >
            {empty(value) ? "-" : value}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}

function DocumentsSection({
  documents,
  t,
}: {
  documents: ManagementApplicationDocument[];
  t: (key: string) => string;
}) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (documentId: string) => {
    setDownloadingId(documentId);

    try {
      await downloadUserDocument(documentId);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <DetailSection
      title={t("detail.documents.title")}
      description={t("detail.documents.description")}
    >
      {documents.length === 0 ? (
        <EmptyText text={t("detail.common.notProvided")} />
      ) : (
        <Stack spacing={1.2}>
          {documents.map((document) => (
            <Paper
              key={document.id}
              variant="outlined"
              sx={{
                borderRadius: 2,
                p: 1.4,
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.2}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
              >
                <Stack direction="row" spacing={1.1} alignItems="flex-start">
                  <IconFileDescription size={20} />

                  <Box>
                    <Typography variant="body2" fontWeight={850}>
                      {document.fileName}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      {t(document.documentTypeKey)} · {document.fileSize} ·{" "}
                      {t(document.statusKey)}
                    </Typography>
                  </Box>
                </Stack>

                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<IconDownload size={16} />}
                  disabled={downloadingId === document.id}
                  onClick={() => handleDownload(document.id)}
                  sx={{
                    borderRadius: 999,
                    fontWeight: 800,
                    textTransform: "none",
                  }}
                >
                  {t("detail.documents.download")}
                </Button>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </DetailSection>
  );
}

function BackButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      startIcon={<IconArrowLeft size={18} />}
      onClick={onClick}
      sx={{
        alignSelf: "flex-start",
        borderRadius: 999,
        fontWeight: 850,
        textTransform: "none",
      }}
    >
      {label}
    </Button>
  );
}

function EmptyText({ text }: { text: string }) {
  return (
    <Typography variant="body2" color="text.secondary">
      {text}
    </Typography>
  );
}

async function downloadUserDocument(documentId: string) {
  const res = await fetch(
    `/api/v1.0/property-management/applications/documents/${documentId}/download`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: {
        Accept: "*/*",
      },
    },
  );

  if (!res.ok) return;

  const blob = await res.blob();
  const fileName = resolveDownloadFileName(res);

  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  anchor.style.display = "none";

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.URL.revokeObjectURL(url);
}

function resolveDownloadFileName(res: Response): string {
  const disposition = res.headers.get("content-disposition");

  if (!disposition) return "application-document";

  const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(disposition);

  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      return utf8Match[1];
    }
  }

  const normalMatch = /filename="?([^"]+)"?/i.exec(disposition);

  return normalMatch?.[1] ?? "application-document";
}

function sensitiveRows(
  data: ManagementApplicationDetail,
  t: (key: string) => string,
): Array<[React.ReactNode, React.ReactNode]> {
  if (data.applicant.applicantTypeKey.endsWith(".company")) {
    return [
      [t("detail.applicant.taxNumber"), data.applicant.taxNumberMasked],
      [t("detail.applicant.mersisNumber"), data.applicant.mersisNumberMasked],
    ];
  }

  return [
    [
      t("detail.applicant.identityNumber"),
      data.applicant.identityNumberMasked,
    ],
  ];
}

function verificationText(
  data: ManagementApplicationDetail,
  t: (key: string) => string,
) {
  const parts: string[] = [];

  if (data.applicant.isEmailVerified) {
    parts.push(t("detail.applicant.emailVerified"));
  }

  if (data.applicant.isPhoneVerified) {
    parts.push(t("detail.applicant.phoneVerified"));
  }

  return parts.length > 0
    ? parts.join(", ")
    : t("detail.common.notProvided");
}

function translateMaybeKey(value: string, t: (key: string) => string) {
  if (value.startsWith("management-applications:")) {
    return t(value);
  }

  return value;
}

function translateWithFallback(
  key: string,
  fallback: string | null | undefined,
  t: (key: string) => string,
) {
  const translated = t(key);

  return translated === key ? fallback || "-" : translated;
}

function empty(value: React.ReactNode) {
  return value === null || value === undefined || value === "";
}