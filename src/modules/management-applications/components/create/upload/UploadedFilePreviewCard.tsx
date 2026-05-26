// src/modules/management-applications/components/create/upload/UploadedFilePreviewCard.tsx

"use client";

import {
  alpha,
  Box,
  Chip,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

import type { Theme } from "@mui/material/styles";

import {
  IconCircleCheckFilled,
  IconFileText,
  IconTrash,
} from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";

import { formatFileSize } from "../constants";

import {
  premiumUploadHoverShadow,
  premiumUploadShadow,
  premiumUploadTransition,
} from "./upload.styles";

const I18N_PREFIX = "management-applications";

const KEYS = {
  ready:
    "management-applications:create.documentUploader.filePreview.ready",

  unknownType:
    "management-applications:create.documentUploader.filePreview.unknownType",
} as const;

type UploadedFilePreviewCardProps = {
  file: File;
  onRemove: () => void;
};

export default function UploadedFilePreviewCard({
  file,
  onRemove,
}: UploadedFilePreviewCardProps) {
  const theme = useTheme<Theme>();

  const { t } = useI18nNs(I18N_PREFIX);

  const tr = (fullKey: string, fallback: string) => {
    const value = t(fullKey);

    if (!value) return fallback;
    if (value === fullKey) return fallback;
    if (value === `[${fullKey}]`) return fallback;

    return value;
  };

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",

        p: {
          xs: 1.6,
          md: 1.9,
        },

        borderRadius: 5,

        border: "1px solid",

        borderColor: alpha(
          theme.palette.success.main,
          0.22,
        ),

        bgcolor: alpha(
          theme.palette.success.main,
          0.05,
        ),

        boxShadow:
          premiumUploadShadow(theme),

        transition:
          premiumUploadTransition,

        animation:
          "uploadedFileCardIn 240ms ease both",

        "@keyframes uploadedFileCardIn": {
          from: {
            opacity: 0,
            transform:
              "translateY(10px) scale(.985)",
          },

          to: {
            opacity: 1,
            transform:
              "translateY(0) scale(1)",
          },
        },

        "&:hover": {
          transform: "translateY(-2px)",

          boxShadow:
            premiumUploadHoverShadow(
              theme,
              theme.palette.success.main,
            ),
        },

        "&::after": {
          content: '""',
          position: "absolute",
          top: -90,
          right: -90,
          width: 180,
          height: 180,
          borderRadius: "50%",
          bgcolor: alpha(
            theme.palette.success.main,
            0.07,
          ),
          pointerEvents: "none",
        },
      }}
    >
      <Stack
        direction="row"
        spacing={1.6}
        alignItems="center"
        sx={{
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: 4,

            display: "grid",
            placeItems: "center",

            flexShrink: 0,

            color: "success.main",

            bgcolor: alpha(
              theme.palette.success.main,
              0.12,
            ),

            boxShadow: `0 14px 34px ${alpha(
              theme.palette.success.main,
              0.18,
            )}`,
          }}
        >
          <IconFileText size={30} />
        </Box>

        <Box
          sx={{
            minWidth: 0,
            flex: 1,
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
          >
            <Typography
              noWrap
              sx={{
                fontSize: 16,
                fontWeight: 950,
                letterSpacing: "-0.02em",
                maxWidth: "100%",
              }}
            >
              {file.name}
            </Typography>

            <Chip
              icon={
                <IconCircleCheckFilled
                  size={14}
                />
              }
              label={tr(
                KEYS.ready,
                "Yüklemeye hazır",
              )}
              size="small"
              sx={{
                height: 25,
                borderRadius: 999,
                fontWeight: 950,

                color: "success.main",

                bgcolor: alpha(
                  theme.palette.success.main,
                  0.1,
                ),

                border: `1px solid ${alpha(
                  theme.palette.success.main,
                  0.18,
                )}`,

                "& .MuiChip-icon": {
                  color: "success.main",
                },
              }}
            />
          </Stack>

          <Stack
            direction="row"
            spacing={0.9}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
            sx={{ mt: 0.8 }}
          >
            <Typography
              variant="caption"
              sx={{
                px: 1,
                py: 0.45,
                borderRadius: 999,

                bgcolor: alpha(
                  theme.palette.background.paper,
                  0.78,
                ),

                border: "1px solid",

                borderColor: alpha(
                  theme.palette.divider,
                  0.72,
                ),

                fontWeight: 800,
              }}
            >
              {formatFileSize(file.size)}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                px: 1,
                py: 0.45,
                borderRadius: 999,

                bgcolor: alpha(
                  theme.palette.background.paper,
                  0.78,
                ),

                border: "1px solid",

                borderColor: alpha(
                  theme.palette.divider,
                  0.72,
                ),

                fontWeight: 800,
              }}
            >
              {file.type ||
                tr(
                  KEYS.unknownType,
                  "Dosya",
                )}
            </Typography>
          </Stack>
        </Box>

        <IconButton
          size="small"
          onClick={onRemove}
          sx={{
            width: 40,
            height: 40,

            border: "1px solid",

            borderColor: alpha(
              theme.palette.error.main,
              0.18,
            ),

            color: "error.main",

            bgcolor: alpha(
              theme.palette.error.main,
              0.05,
            ),

            transition:
              premiumUploadTransition,

            "&:hover": {
              transform: "scale(1.04)",

              bgcolor: alpha(
                theme.palette.error.main,
                0.1,
              ),

              borderColor: alpha(
                theme.palette.error.main,
                0.3,
              ),
            },
          }}
        >
          <IconTrash size={18} />
        </IconButton>
      </Stack>
    </Box>
  );
}