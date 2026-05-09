"use client";

import Link from "next/link";
import { alpha, Box, Button, Stack, Typography, useTheme } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { IconCheck, IconCircleCheck, IconDownload, IconFileText } from "@tabler/icons-react";

import SectionCard from "./shared/SectionCard";
import type {
  DocumentRequirement,
  RequiredDocumentKind,
} from "../../types/managementApplication.types";

type DocumentRequirementSummaryProps = {
  requirements: DocumentRequirement[];
  uploadedKindCounts: Record<RequiredDocumentKind, number>;
};

export default function DocumentRequirementSummary({
  requirements,
  uploadedKindCounts,
}: DocumentRequirementSummaryProps) {
  const theme = useTheme<Theme>();

  return (
    <SectionCard
      icon={<IconCircleCheck size={19} />}
      title="Gerekli belge özeti"
      description="Temsil şeklinize göre tamamlanması gereken belgeler aşağıda gösterilir."
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 1.25,
        }}
      >
        {requirements.map((item) => {
          const uploadedCount = uploadedKindCounts[item.kind];
          const completed = uploadedCount > 0;

          return (
            <Box
              key={item.kind}
              sx={{
                p: 1.3,
                borderRadius: 3.25,
                border: `1px solid ${alpha(
                  completed ? theme.palette.success.main : theme.palette.divider,
                  completed ? 0.24 : 0.74,
                )}`,
                bgcolor: alpha(
                  completed
                    ? theme.palette.success.main
                    : theme.palette.background.default,
                  completed ? 0.06 : 0.3,
                ),
              }}
            >
              <Stack direction="row" spacing={1.1} alignItems="center">
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    color: completed ? "success.main" : "text.disabled",
                    bgcolor: completed
                      ? alpha(theme.palette.success.main, 0.09)
                      : alpha(theme.palette.grey[500], 0.08),
                    flexShrink: 0,
                  }}
                >
                  {completed ? <IconCheck size={17} /> : <IconFileText size={17} />}
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={900} noWrap sx={{ fontSize: 14 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {completed
                      ? `${uploadedCount} dosya eklendi`
                      : item.required
                        ? "Zorunlu belge bekleniyor"
                        : "İsteğe bağlı"}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          );
        })}
      </Box>

      <Button
        component={Link}
        href="/documents/live-manage-management-agreement.pdf"
        target="_blank"
        rel="noreferrer"
        variant="outlined"
        startIcon={<IconDownload size={17} />}
        sx={{
          mt: 2,
          borderRadius: 999,
          fontWeight: 900,
          textTransform: "none",
          width: "fit-content",
        }}
      >
        Hizmet sözleşmesini indir
      </Button>
    </SectionCard>
  );
}