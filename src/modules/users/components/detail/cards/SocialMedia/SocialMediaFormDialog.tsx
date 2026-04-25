//src/modules/users/components/detail/cards/SocialMedia/SocialMediaFormDialog.tsx
"use client";

import React, { useMemo } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import { useI18nNs } from "@/app/context/i18nContext";
import type {
  SocialMediaFormValues,
  SocialMediaPlatform,
} from "@/modules/users/types/UserSocialMedia.types";

type Props = {
  open: boolean;
  isEditMode: boolean;
  form: SocialMediaFormValues;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: () => void;
  onChange: (field: keyof SocialMediaFormValues, value: any) => void;
};

const PLATFORM_OPTIONS: Array<{ value: SocialMediaPlatform; label: string }> = [
  { value: "LinkedIn", label: "LinkedIn" },
  { value: "Instagram", label: "Instagram" },
  { value: "Facebook", label: "Facebook" },
  { value: "X", label: "X" },
  { value: "YouTube", label: "YouTube" },
  { value: "TikTok", label: "TikTok" },
  { value: "Website", label: "Website" },
  { value: "Other", label: "Other" },
];

function normalizeHandle(value?: string | null) {
  if (!value) return "";
  return value.trim().replace(/^@+/, "").replace(/\s+/g, "");
}

function buildUrl(platform?: string, rawHandle?: string | null) {
  const handle = normalizeHandle(rawHandle);
  if (!platform || !handle) return "";

  switch (platform) {
    case "LinkedIn":
      return `https://www.linkedin.com/in/${handle}`;
    case "Instagram":
      return `https://www.instagram.com/${handle}`;
    case "Facebook":
      return `https://www.facebook.com/${handle}`;
    case "X":
      return `https://x.com/${handle}`;
    case "YouTube":
      return `https://www.youtube.com/@${handle}`;
    case "TikTok":
      return `https://www.tiktok.com/@${handle}`;
    case "Website":
      return `https://${handle}`;
    case "Other":
      return handle.startsWith("http://") || handle.startsWith("https://")
        ? handle
        : `https://${handle}`;
    default:
      return "";
  }
}

function getHandlePlaceholder(platform?: string) {
  switch (platform) {
    case "LinkedIn":
      return "musa-dev";
    case "Instagram":
      return "musabingol";
    case "Facebook":
      return "livemanage";
    case "X":
      return "livemanage";
    case "YouTube":
      return "livemanage";
    case "TikTok":
      return "livemanage";
    case "Website":
      return "livemanage.com";
    case "Other":
      return "example.com/profil";
    default:
      return "livemanage";
  }
}

function getPrefixHint(platform?: string) {
  switch (platform) {
    case "LinkedIn":
      return "linkedin.com/in/";
    case "Instagram":
      return "instagram.com/";
    case "Facebook":
      return "facebook.com/";
    case "X":
      return "x.com/";
    case "YouTube":
      return "youtube.com/@";
    case "TikTok":
      return "tiktok.com/@";
    case "Website":
      return "https://";
    case "Other":
      return "https://";
    default:
      return "";
  }
}

export default function SocialMediaFormDialog({
  open,
  isEditMode,
  form,
  loading,
  error,
  onClose,
  onSubmit,
  onChange,
}: Props) {
  const { t } = useI18nNs?.("users") ?? {
    t: (key: string, fallback?: any) => fallback?.defaultValue ?? key,
  };

  const normalizedHandle = useMemo(
    () => normalizeHandle(form.userNameOrHandle),
    [form.userNameOrHandle]
  );

  const generatedUrl = useMemo(
    () => buildUrl(form.platform, normalizedHandle),
    [form.platform, normalizedHandle]
  );

  return (
    <Dialog
      open={open}
      onClose={() => !loading && onClose()}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {isEditMode
          ? t("users:socialMedia.editDialogTitle", {
              defaultValue: "Sosyal medya hesabını düzenle",
            })
          : t("users:socialMedia.createDialogTitle", {
              defaultValue: "Sosyal medya hesabı ekle",
            })}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5}>
          {error && <Alert severity="error">{error}</Alert>}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                fullWidth
                label={t("users:socialMedia.fields.platform", {
                  defaultValue: "Platform",
                })}
                value={form.platform}
                onChange={(e) => onChange("platform", e.target.value)}
              >
                {PLATFORM_OPTIONS.map((p) => (
                  <MenuItem key={p.value} value={p.value}>
                    {p.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                type="number"
                fullWidth
                label={t("users:socialMedia.fields.sortOrder", {
                  defaultValue: "Sıra",
                })}
                value={form.sortOrder}
                onChange={(e) => onChange("sortOrder", Number(e.target.value || 0))}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label={t("users:socialMedia.fields.userNameOrHandle", {
                  defaultValue: "Kullanıcı adı / handle",
                })}
                value={form.userNameOrHandle}
                onChange={(e) =>
                  onChange("userNameOrHandle", normalizeHandle(e.target.value))
                }
                placeholder={getHandlePlaceholder(form.platform)}
                helperText={getPrefixHint(form.platform)}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label={t("users:socialMedia.fields.displayName", {
                  defaultValue: "Görünen ad",
                })}
                value={form.displayName}
                onChange={(e) => onChange("displayName", e.target.value)}
              />
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                disabled
                label={t("users:socialMedia.fields.urlPreview", {
                  defaultValue: "Oluşacak bağlantı",
                })}
                value={generatedUrl}
                placeholder={t("users:socialMedia.fields.urlPreviewPlaceholder", {
                  defaultValue: "Platform ve kullanıcı adı seçildiğinde bağlantı burada oluşur",
                })}
              />
            </Grid>
          </Grid>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.isPrimary}
                  onChange={(_, v) => onChange("isPrimary", v)}
                />
              }
              label={t("users:socialMedia.fields.isPrimary", {
                defaultValue: "Birincil",
              })}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={(_, v) => onChange("isActive", v)}
                />
              }
              label={t("users:socialMedia.fields.isActive", {
                defaultValue: "Aktif",
              })}
            />
          </Stack>

          <Alert severity="info">
            {t("users:socialMedia.primaryInfo", {
              defaultValue: "Bir owner için sadece 1 tane birincil hesap olabilir.",
            })}
          </Alert>

          <Typography variant="caption" color="text.secondary">
            {t("users:socialMedia.handleInfo", {
              defaultValue:
                "Platform seçildikten sonra sadece kullanıcı adı veya handle girmeniz yeterlidir. Bağlantı otomatik oluşturulur.",
            })}
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {t("common:cancel", { defaultValue: "Vazgeç" })}
        </Button>

        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={loading || !form.platform || !normalizedHandle}
        >
          {loading ? (
            <CircularProgress size={18} />
          ) : isEditMode ? (
            t("common:save", { defaultValue: "Kaydet" })
          ) : (
            t("common:add", { defaultValue: "Ekle" })
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}