"use client";

import React from "react";

import {
  alpha,
  Box,
  Chip,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { IconFileDescription } from "@tabler/icons-react";

import SectionCard from "./shared/SectionCard";
import { documentStatusLabel } from "../../utils/adminManagementApplication.utils";

import type {
  AdminApplicationDocument,
  AdminApplicationDocumentStatus,
} from "../../types/adminManagementApplication.types";

type DocumentsCardProps = {
  documents: AdminApplicationDocument[];
};

export default function DocumentsCard({ documents }: DocumentsCardProps) {
  return (
    <SectionCard
      title="Yüklenen Belgeler"
      icon={<IconFileDescription size={19} />}
    >
      <Stack spacing={1.1}>
        {documents.map((doc) => (
          <DocumentRow key={doc.id} doc={doc} />
        ))}
      </Stack>
    </SectionCard>
  );
}

function DocumentRow({ doc }: { doc: AdminApplicationDocument }) {
  const theme = useTheme<Theme>();
  const color = getDocumentColor(theme, doc.status);

  return (
    <Box
      sx={{
        p: 1.35,
        borderRadius: 3.3,
        border: `1px solid ${alpha(color, 0.16)}`,
        bgcolor: alpha(color, 0.035),
      }}
    >
      <Stack direction="row" justifyContent="space-between" spacing={1}>
        <Box>
          <Typography fontWeight={900}>{doc.documentType}</Typography>

          <Typography variant="body2" color="text.secondary">
            {doc.fileName} · {doc.fileSize} · {doc.uploadedAt}
          </Typography>

          {doc.adminNote && (
            <Typography variant="body2" color="warning.main" sx={{ mt: 0.6 }}>
              {doc.adminNote}
            </Typography>
          )}
        </Box>

        <Chip
          label={documentStatusLabel(doc.status)}
          size="small"
          sx={{
            fontWeight: 850,
            bgcolor: alpha(color, 0.1),
            color,
            border: `1px solid ${alpha(color, 0.18)}`,
          }}
        />
      </Stack>
    </Box>
  );
}

function getDocumentColor(theme: Theme, status: AdminApplicationDocumentStatus) {
  if (status === "valid") return theme.palette.success.main;
  if (status === "needs_revision") return theme.palette.warning.main;
  return theme.palette.error.main;
}