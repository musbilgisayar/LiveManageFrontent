"use client";

import React from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Collapse,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import {
  IconEye,
  IconCircleCheck,
  IconAlertTriangle,
  IconInfoCircle,
} from "@tabler/icons-react";

import BlankCard from "@/app/components/shared/BlankCard";
import { useI18nNs } from "@/app/context/i18nContext";
import { useSWRConfig } from "swr";
import { patchWebFetcher } from "@/utils/fetchers.web.client";

type Props = {
  currentIsPublic?: boolean | null;
  currentVisibilityLevel?: string | null;
  isLoading?: boolean;
  error?: string | null;
  onUpdated?: () => void;
};

type VisibilityItem = {
  value: string;
  label: string;
  description: string;
};

const VISIBILITY_OPTIONS: VisibilityItem[] = [
  {
    value: "Private",
    label: "Özel",
    description: "Profil sadece size görünür.",
  },
  {
    value: "ContactsOnly",
    label: "Kişiler / Organizasyon",
    description: "Sadece ilişkili veya yetkili kullanıcılar görebilir.",
  },
  {
    value: "Public",
    label: "Herkese Açık",
    description: "Profil herkese görünür.",
  },
];

function normalizeVisibility(value?: string | null) {
  if (!value || !value.trim()) return "Private";
  return value.trim();
}

export default function UserVisibilityCard({
  currentIsPublic,
  currentVisibilityLevel,
  isLoading = false,
  error = null,
  onUpdated,
}: Props) {
  const { t } = useI18nNs(["account", "common"]);
  const { mutate } = useSWRConfig();

  const [isPublic, setIsPublic] = React.useState(!!currentIsPublic);
  const [visibility, setVisibility] = React.useState(
    normalizeVisibility(currentVisibilityLevel)
  );

  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [saveOk, setSaveOk] = React.useState<string | null>(null);

  React.useEffect(() => {
    setIsPublic(!!currentIsPublic);
  }, [currentIsPublic]);

  React.useEffect(() => {
    setVisibility(normalizeVisibility(currentVisibilityLevel));
  }, [currentVisibilityLevel]);

  const selected =
    VISIBILITY_OPTIONS.find((x) => x.value === visibility) ??
    VISIBILITY_OPTIONS[0];

  const handleSave = async (nextIsPublic: boolean, nextVisibility: string) => {
    setSaving(true);
    setSaveError(null);
    setSaveOk(null);

    try {
      const json: any = await patchWebFetcher("/api/v1.0/account/me", {
        isPublic: nextIsPublic,
        visibilityLevel: nextVisibility,
      });

      if (json?.ok === false) {
        throw new Error(
          json?.userMessage ||
            json?.message ||
            json?.error ||
            "Visibility update failed"
        );
      }

      await mutate("/api/v1.0/account/me");
      await mutate("/api/v1.0/userprofile/me");
      onUpdated?.();

      setSaveOk(
        json?.userMessage ||
          json?.message ||
          t("account:visibility.updated") ||
          "Görünürlük ayarları güncellendi."
      );
    } catch (e: any) {
      setSaveError(
        e?.message ||
          e?.payload?.userMessage ||
          e?.payload?.message ||
          e?.payload?.error ||
          t("account:visibility.updateError") ||
          "Görünürlük güncellenemedi."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublic = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const next = e.target.checked;
    setIsPublic(next);
    await handleSave(next, visibility);
  };

  const handleVisibilityChange = async (e: SelectChangeEvent<string>) => {
    const next = e.target.value;
    setVisibility(next);
    await handleSave(isPublic, next);
  };

  return (
    <BlankCard
      sx={{
        borderRadius: 5,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: { xs: 2.5, md: 3 } }}>
        <Box
          sx={{
            mb: 2.5,
            p: 2.25,
            borderRadius: 3,
            background: "linear-gradient(135deg, #5d86f3 0%, #4b6fe8 100%)",
            color: "common.white",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                bgcolor: "rgba(255,255,255,0.16)",
                flexShrink: 0,
              }}
            >
              <IconEye size={22} />
            </Box>

            <Box>
              <Typography variant="h5" fontWeight={700}>
                {t("account:visibility.title") || "Görünürlük"}
              </Typography>

              <Typography variant="body2" sx={{ opacity: 0.92, mt: 0.5 }}>
                {t("account:visibility.description") ||
                  "Profilinizin kimler tarafından görülebileceğini belirleyin."}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {isLoading && (
          <Stack direction="row" alignItems="center" gap={1} mb={2}>
            <CircularProgress size={16} />
            <Typography variant="body2" color="text.secondary">
              {t("common:loading") || "Yükleniyor..."}
            </Typography>
          </Stack>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2.5 }}>
            {error}
          </Alert>
        )}

        {saveError && (
          <Alert
            severity="error"
            icon={<IconAlertTriangle size={18} />}
            sx={{ mb: 2, borderRadius: 2.5 }}
          >
            {saveError}
          </Alert>
        )}

        {saveOk && (
          <Alert
            severity="success"
            icon={<IconCircleCheck size={18} />}
            sx={{ mb: 2, borderRadius: 2.5 }}
          >
            {saveOk}
          </Alert>
        )}

        <Box
          sx={{
            p: { xs: 2, md: 2.25 },
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 4,
            bgcolor: "background.paper",
          }}
        >
          <Stack spacing={2.25}>
            <Box
              sx={{
                px: 1.5,
                py: 1.5,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "#fafbff",
              }}
            >
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Switch
                  checked={isPublic}
                  onChange={handleTogglePublic}
                  disabled={saving || isLoading}
                  sx={{ mt: -0.5, ml: -0.5 }}
                />

                <Box>
                  <Typography variant="subtitle1" fontWeight={700} mb={0.5}>
                    {t("account:visibility.isPublic") || "Herkese Açık"}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {t("account:visibility.isPublicHelper") ||
                      "Açık olduğunda profiliniz daha geniş kitleye görünür."}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Collapse in={isPublic} unmountOnExit>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} mb={0.5}>
                    {t("account:visibility.level") || "Görünürlük Seviyesi"}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {t("account:visibility.levelHelper") ||
                      "Kimlerin profilinizi görebileceğini seçin."}
                  </Typography>
                </Box>

                <FormControl fullWidth disabled={saving || isLoading}>
                  <InputLabel id="visibility-level-label">
                    {t("account:visibility.level") || "Görünürlük Seviyesi"}
                  </InputLabel>

                  <Select
                    labelId="visibility-level-label"
                    value={visibility}
                    label={
                      t("account:visibility.level") || "Görünürlük Seviyesi"
                    }
                    onChange={handleVisibilityChange}
                    sx={{
                      borderRadius: 3,
                      "& .MuiSelect-select": {
                        py: 1.6,
                      },
                    }}
                  >
                    {VISIBILITY_OPTIONS.map((item) => (
                      <MenuItem key={item.value} value={item.value}>
                        <Stack width="100%" spacing={0.25}>
                          <Typography fontSize={14} fontWeight={600}>
                            {item.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.description}
                          </Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Collapse>

            {!isPublic && (
              <Typography variant="body2" color="text.secondary">
                {t("account:visibility.hiddenHint") ||
                  "Profil kapalıyken görünürlük seviyesi uygulanmaz."}
              </Typography>
            )}

            <Box
              sx={{
                px: 1.25,
                py: 1,
                borderRadius: 2.5,
                bgcolor: "rgba(93, 134, 243, 0.06)",
                border: "1px solid rgba(93, 134, 243, 0.14)",
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <IconInfoCircle size={16} />

                <Typography variant="body2" color="text.secondary">
                  {isPublic
                    ? selected.description
                    : t("account:visibility.note") ||
                      "Bu ayarlar profil bilgilerinizin erişimini kontrol eder."}
                </Typography>
              </Stack>
            </Box>

            {saving && (
              <Stack direction="row" alignItems="center" gap={1}>
                <CircularProgress size={14} />
                <Typography variant="caption" color="text.secondary">
                  {t("common:saving") || "Kaydediliyor..."}
                </Typography>
              </Stack>
            )}
          </Stack>
        </Box>
      </Box>
    </BlankCard>
  );
}