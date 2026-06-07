//src
"use client";

import React, { useState } from "react";

import {
  alpha,
  Box,
  Button,
  Chip,
  Divider,
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

import { downloadAdminApplicationDocument } from "../../services/adminManagementApplication.service";

import type {
  AdminApplicationDocument,
  AdminApplicationDocumentStatus,
} from "../../types/adminManagementApplication.types";

type DocumentsCardProps = {
  documents: AdminApplicationDocument[];
};

export default function DocumentsCard({
  documents,
}: DocumentsCardProps) {
  const { t } = useI18nNs("management-applications");

  return (
    <SectionCard
      title={t("admin.detail.documents.title")}
      description={t("admin.detail.documents.description")}
      icon={<IconFileDescription size={19} />}
    >
      <Stack spacing={0}>
        {documents.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {t("admin.detail.documents.empty")}
          </Typography>
        ) : (
          documents.map((doc, index) => (
            <React.Fragment key={doc.id}>
              <DocumentRow doc={doc} />

              {index !== documents.length - 1 && (
                <Divider />
              )}
            </React.Fragment>
          ))
        )}
      </Stack>
    </SectionCard>
  );
}

function DocumentRow({
  doc,
}: {
  doc: AdminApplicationDocument;
}) {
  const theme = useTheme<Theme>();

  const { t } = useI18nNs(
    "management-applications"
  );

  const [isDownloading, setIsDownloading] =
    useState(false);

  const color = getDocumentColor(
    theme,
    doc.status
  );

  const handleDownload = async () => {
    if (!doc.id || isDownloading) {
      return;
    }

    setIsDownloading(true);

    try {
      await downloadAdminApplicationDocument(
        doc.id
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Box
      sx={{
        py: 1.5,
      }}
    >
      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{
          xs: "flex-start",
          md: "center",
        }}
      >
        <Stack
          direction="row"
          spacing={1.25}
          sx={{
            minWidth: 0,
            flex: 1,
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,

              color: color,

              bgcolor: alpha(color, 0.08),

              border: `1px solid ${alpha(
                color,
                0.14
              )}`,
            }}
          >
            <IconFileDescription size={18} />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: 14.2,
                lineHeight: 1.35,
              }}
            >
              {doc.documentType}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.35,
                overflowWrap: "anywhere",
                lineHeight: 1.55,
              }}
            >
              {doc.fileName}
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              useFlexGap
              sx={{ mt: 0.85 }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
              >
                {doc.fileSize}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                •
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                {doc.uploadedAt}
              </Typography>
            </Stack>

            {doc.adminNote && (
              <Typography
                variant="body2"
                sx={{
                  mt: 0.9,
                  color: "warning.main",
                  lineHeight: 1.55,
                }}
              >
                {doc.adminNote}
              </Typography>
            )}
          </Box>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexShrink={0}
        >
          <Chip
            size="small"
            label={t(
              `admin.detail.documents.status.${doc.status}`
            )}
            sx={{
              fontWeight: 700,
              borderRadius: 999,

              color: color,

              bgcolor: alpha(color, 0.08),

              border: `1px solid ${alpha(
                color,
                0.16
              )}`,
            }}
          />

          <Button
            size="small"
            variant="outlined"
            startIcon={
              <IconDownload size={16} />
            }
            disabled={isDownloading}
            onClick={handleDownload}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              minWidth: 112,
            }}
          >
            {isDownloading
              ? t(
                  "admin.detail.documents.download.loading"
                )
              : t(
                  "admin.detail.documents.download.button"
                )}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

function getDocumentColor(
  theme: Theme,
  status: AdminApplicationDocumentStatus
) {
  if (status === "valid") {
    return theme.palette.success.main;
  }

  if (status === "needs_revision") {
    return theme.palette.warning.main;
  }

  return theme.palette.error.main;
}
