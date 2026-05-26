// src/modules/management-applications/components/create/upload/UploadDropzoneCard.tsx
"use client";

import {
  alpha,
  Box,
  Button,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

import type { Theme } from "@mui/material/styles";

import {
  IconCloudUpload,
  IconFileUpload,
} from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";

import UploadedFilePreviewCard from "./UploadedFilePreviewCard";

import {
  premiumUploadHoverShadow,
  premiumUploadShadow,
  premiumUploadTransition,
} from "./upload.styles";

type UploadDropzoneCardProps = {
  file: File | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (file: File | null) => void;
};

const NS =
  "management-applications:create.documentUploader.dropzone";

export default function UploadDropzoneCard({
  file,
  inputRef,
  onFileChange,
}: UploadDropzoneCardProps) {
  const theme = useTheme<Theme>();

  const { t } = useI18nNs("management-applications");

  const tr = (key: string, fallback: string) => {
    const fullKey = `${NS}.${key}`;

    const value = t(fullKey);

    if (!value) return fallback;
    if (value === fullKey) return fallback;
    if (value === `[${fullKey}]`) return fallback;

    return value;
  };

  const pickFile = (nextFile: File | null) => {
    onFileChange(nextFile);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <Box>
      <input
        ref={inputRef}
        type="file"
        hidden
        accept=".pdf,.jpg,.jpeg,.png,.tif,.tiff"
        onChange={(event) =>
          pickFile(event.target.files?.[0] ?? null)
        }
      />

      {file ? (
        <UploadedFilePreviewCard
          file={file}
          onRemove={() => pickFile(null)}
        />
      ) : (
        <Box
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();

            pickFile(
              event.dataTransfer.files?.[0] ?? null,
            );
          }}
          role="button"
          tabIndex={0}
          sx={{
            position: "relative",
            overflow: "hidden",

            minHeight: 270,

            p: {
              xs: 2.5,
              md: 3.5,
            },

            borderRadius: 5,

            border: "2px dashed",

            borderColor: alpha(
              theme.palette.primary.main,
              0.28,
            ),

            bgcolor: alpha(
              theme.palette.primary.main,
              0.03,
            ),

            cursor: "pointer",

            transition:
              premiumUploadTransition,

            boxShadow:
              premiumUploadShadow(theme),

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            "&:hover": {
              transform:
                "translateY(-2px)",

              borderColor: alpha(
                theme.palette.primary.main,
                0.55,
              ),

              bgcolor: alpha(
                theme.palette.primary.main,
                0.05,
              ),

              boxShadow:
                premiumUploadHoverShadow(
                  theme,
                  theme.palette.primary.main,
                ),
            },

            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              background: `radial-gradient(circle at top right, ${alpha(
                theme.palette.primary.main,
                0.09,
              )} 0%, transparent 34%)`,
              pointerEvents: "none",
            },

            "&::after": {
              content: '""',
              position: "absolute",
              top: -80,
              right: -80,
              width: 180,
              height: 180,
              borderRadius: "50%",
              bgcolor: alpha(
                theme.palette.primary.main,
                0.06,
              ),
              pointerEvents: "none",
            },
          }}
        >
          <Stack
            spacing={2.1}
            alignItems="center"
            textAlign="center"
            sx={{
              position: "relative",
              zIndex: 1,
              maxWidth: 480,
            }}
          >
            <Box
              sx={{
                width: 86,
                height: 86,
                borderRadius: "50%",

                display: "grid",
                placeItems: "center",

                color: "primary.main",

                bgcolor: alpha(
                  theme.palette.primary.main,
                  0.1,
                ),

                boxShadow: `0 18px 44px ${alpha(
                  theme.palette.primary.main,
                  0.18,
                )}`,

                animation:
                  "uploadPulse 2.6s ease-in-out infinite",

                "@keyframes uploadPulse": {
                  "0%": {
                    transform: "scale(1)",
                  },

                  "50%": {
                    transform:
                      "scale(1.04)",
                  },

                  "100%": {
                    transform: "scale(1)",
                  },
                },
              }}
            >
              <IconCloudUpload size={42} />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: {
                    xs: 20,
                    md: 24,
                  },

                  fontWeight: 950,

                  letterSpacing: "-0.04em",

                  lineHeight: 1.1,
                }}
              >
                {tr(
                  "title",
                  "Dosyanızı yükleyin",
                )}
              </Typography>

              <Typography
                sx={{
                  mt: 1,

                  color: alpha(
                    theme.palette.text.secondary,
                    0.82,
                  ),

                  fontSize: 14.5,

                  lineHeight: 1.75,

                  fontWeight: 500,
                }}
              >
                {tr(
                  "description",
                  "Dosyanızı sürükleyip bırakın veya cihazınızdan seçin.",
                )}
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={
                <IconFileUpload size={18} />
              }
              sx={{
                height: 48,

                px: 3,

                borderRadius: 999,

                textTransform: "none",

                fontWeight: 950,

                boxShadow: `0 18px 40px ${alpha(
                  theme.palette.primary.main,
                  0.24,
                )}`,

                "&:hover": {
                  transform:
                    "translateY(-1px)",

                  boxShadow: `0 22px 48px ${alpha(
                    theme.palette.primary.main,
                    0.32,
                  )}`,
                },
              }}
            >
              {tr(
                "select",
                "Dosya seç",
              )}
            </Button>

            <Typography
              variant="caption"
              sx={{
                color: alpha(
                  theme.palette.text.secondary,
                  0.68,
                ),

                lineHeight: 1.6,
              }}
            >
              {tr(
                "formats",
                "PDF, JPG, PNG veya TIFF formatlarını destekler.",
              )}
            </Typography>
          </Stack>
        </Box>
      )}
    </Box>
  );
}