"use client";

import React, { useState } from "react";

import {
  alpha,
  Box,
  Button,
  Chip,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import {
  IconDownload,
  IconFileDescription,
} from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";

import SectionCard from "./shared/SectionCard";

import { downloadAdminApplicationDocument } from "../../services/managementApplication.service";
import { documentStatusLabel } from "../../utils/adminManagementApplication.utils";

import type {
  AdminApplicationDocument,
  AdminApplicationDocumentStatus,
} from "../../types/adminManagementApplication.types";

type DocumentsCardProps = {
  documents: AdminApplicationDocument[];
};

export default function DocumentsCard({ documents }: DocumentsCardProps) {
  const { t } = useI18nNs("management-applications");

  return (
    <SectionCard
      title={t("admin.detail.documents.title")}
      icon={<IconFileDescription size={19} />}
    >
      <Stack spacing={1.1}>
        {documents.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t("admin.detail.documents.empty")}
          </Typography>
        ) : (
          documents.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} />
          ))
        )}
      </Stack>
    </SectionCard>
  );
}

function DocumentRow({ doc }: { doc: AdminApplicationDocument }) {
  const theme = useTheme<Theme>();
  const { t } = useI18nNs("management-applications");

  const [isDownloading, setIsDownloading] = useState(false);

  const color = getDocumentColor(theme, doc.status);

  const handleDownload = async () => {
    if (!doc.id || isDownloading) return;

    setIsDownloading(true);

    try {
      await downloadAdminApplicationDocument(doc.id);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Box
      sx={{
        p: 1.35,
        borderRadius: 3.3,
        border: `1px solid ${alpha(color, 0.16)}`,
        bgcolor: alpha(color, 0.035),
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={1.4}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography fontWeight={900}>
            {doc.documentType}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ overflowWrap: "anywhere" }}
          >
            {doc.fileName} · {doc.fileSize} · {doc.uploadedAt}
          </Typography>

          {doc.adminNote && (
            <Typography
              variant="body2"
              color="warning.main"
              sx={{ mt: 0.6 }}
            >
              {doc.adminNote}
            </Typography>
          )}
        </Box>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent={{ xs: "space-between", sm: "flex-end" }}
          flexShrink={0}
        >
          <Chip
            label={
              t(`admin.detail.documents.status.${doc.status}`) ||
              documentStatusLabel(doc.status)
            }
            size="small"
            sx={{
              fontWeight: 850,
              bgcolor: alpha(color, 0.1),
              color,
              border: `1px solid ${alpha(color, 0.18)}`,
            }}
          />

          <Button
            size="small"
            variant="outlined"
            startIcon={<IconDownload size={16} />}
            disabled={isDownloading}
            onClick={handleDownload}
            sx={{
              borderRadius: 999,
              fontWeight: 850,
              textTransform: "none",
            }}
          >
            {isDownloading
              ? t("admin.detail.documents.download.loading")
              : t("admin.detail.documents.download.button")}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

function getDocumentColor(
  theme: Theme,
  status: AdminApplicationDocumentStatus,
) {
  if (status === "valid") return theme.palette.success.main;
  if (status === "needs_revision") return theme.palette.warning.main;
  return theme.palette.error.main;
}