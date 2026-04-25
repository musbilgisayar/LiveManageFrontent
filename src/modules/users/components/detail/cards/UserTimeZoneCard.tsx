"use client";

import React from "react";
import {
  Alert,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from "@mui/material";
import {
  IconClockHour4,
  IconCircleCheck,
  IconAlertTriangle,
  IconInfoCircle,
} from "@tabler/icons-react";

import BlankCard from "@/app/components/shared/BlankCard";
import { useI18nNs } from "@/app/context/i18nContext";
import { useSWRConfig } from "swr";
import { patchWebFetcher } from "@/utils/fetchers.web.client";

type Props = {
  currentTimeZone?: string | null;
  isLoading?: boolean;
  error?: string | null;
  onUpdated?: () => void;
};

type TimeZoneItem = {
  value: string;
  label: string;
  region?: string;
};

const TIME_ZONE_OPTIONS: TimeZoneItem[] = [
  { value: "UTC", label: "UTC", region: "Universal Time" },
  { value: "Europe/Zurich", label: "Europe/Zurich", region: "Switzerland" },
  { value: "Europe/Berlin", label: "Europe/Berlin", region: "Germany" },
  { value: "Europe/Paris", label: "Europe/Paris", region: "France" },
  { value: "Europe/Rome", label: "Europe/Rome", region: "Italy" },
  { value: "Europe/Istanbul", label: "Europe/Istanbul", region: "Türkiye" },
  { value: "Europe/London", label: "Europe/London", region: "United Kingdom" },
  { value: "America/New_York", label: "America/New_York", region: "United States" },
  { value: "America/Chicago", label: "America/Chicago", region: "United States" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles", region: "United States" },
  { value: "Asia/Dubai", label: "Asia/Dubai", region: "United Arab Emirates" },
  { value: "Asia/Riyadh", label: "Asia/Riyadh", region: "Saudi Arabia" },
];

function normalizeTimeZone(value?: string | null) {
  if (!value || !value.trim()) return "UTC";
  return value.trim();
}

function formatExampleNow(timeZone: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
  } catch {
    return "—";
  }
}

export default function UserTimeZoneCard({
  currentTimeZone,
  isLoading = false,
  error = null,
  onUpdated,
}: Props) {
  const { t } = useI18nNs(["account", "common"]);
  const { mutate } = useSWRConfig();

  const [selectedTimeZone, setSelectedTimeZone] = React.useState(
    normalizeTimeZone(currentTimeZone)
  );
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [saveOk, setSaveOk] = React.useState<string | null>(null);

  React.useEffect(() => {
    setSelectedTimeZone(normalizeTimeZone(currentTimeZone));
  }, [currentTimeZone]);

  const effectiveLoading = isLoading;
  const selectedItem =
    TIME_ZONE_OPTIONS.find((x) => x.value === selectedTimeZone) ?? null;

  const handleTimeZoneChange = async (e: SelectChangeEvent<string>) => {
    const nextTimeZone = normalizeTimeZone(e.target.value);

    if (!nextTimeZone || saving) return;
    if (nextTimeZone === selectedTimeZone) return;

    const prevTimeZone = selectedTimeZone;

    setSelectedTimeZone(nextTimeZone);
    setSaving(true);
    setSaveError(null);
    setSaveOk(null);

    try {
      const json: any = await patchWebFetcher("/api/v1.0/account/me", {
        timeZone: nextTimeZone,
      });

      if (json?.ok === false) {
        throw new Error(
          json?.userMessage ||
            json?.message ||
            json?.error ||
            "Time zone update failed"
        );
      }

      await mutate("/api/v1.0/account/me");
      await mutate("/api/v1.0/userprofile/me");
      onUpdated?.();

      setSaveOk(
        json?.userMessage ||
          json?.message ||
          t("account:timezone.updated", {
            defaultValue: "Saat dilimi güncellendi.",
          })
      );
    } catch (e: any) {
      setSelectedTimeZone(prevTimeZone);
      setSaveError(
        e?.message ||
          e?.payload?.userMessage ||
          e?.payload?.message ||
          e?.payload?.error ||
          t("account:timezone.updateError", {
            defaultValue: "Saat dilimi güncellenemedi.",
          })
      );
    } finally {
      setSaving(false);
    }
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
              <IconClockHour4 size={22} />
            </Box>

            <Box>
              <Typography variant="h5" fontWeight={700}>
                {t("account:timezone.title", {
                  defaultValue: "Saat Dilimi",
                })}
              </Typography>

              <Typography variant="body2" sx={{ opacity: 0.92, mt: 0.5 }}>
                {t("account:timezone.description", {
                  defaultValue:
                    "Tarih ve saatler bu tercihe göre gösterilir.",
                })}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {effectiveLoading && (
          <Stack direction="row" alignItems="center" gap={1} mb={2}>
            <CircularProgress size={16} />
            <Typography variant="body2" color="text.secondary">
              {t("common:loading", { defaultValue: "Yükleniyor..." })}
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
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} mb={0.5}>
                {t("account:user.fields.timeZone", {
                  defaultValue: "Saat Dilimi",
                })}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {t("account:timezone.helper", {
                  defaultValue:
                    "Seçtiğiniz saat dilimi tarih ve saat gösterimlerinde kullanılır.",
                })}
              </Typography>
            </Box>

            <FormControl fullWidth disabled={saving || effectiveLoading}>
              <InputLabel id="user-timezone-select-label">
                {t("account:user.fields.timeZone", {
                  defaultValue: "Saat Dilimi",
                })}
              </InputLabel>

              <Select
                labelId="user-timezone-select-label"
                value={selectedTimeZone}
                label={t("account:user.fields.timeZone", {
                  defaultValue: "Saat Dilimi",
                })}
                onChange={handleTimeZoneChange}
                sx={{
                  borderRadius: 3,
                  "& .MuiSelect-select": {
                    py: 1.6,
                  },
                }}
                renderValue={(value) => {
                  const selected =
                    TIME_ZONE_OPTIONS.find((x) => x.value === value) ?? null;

                  return (
                    <Stack spacing={0.25}>
                      <Typography fontSize={14} fontWeight={600}>
                        {selected?.label || value}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selected?.region || "—"}
                      </Typography>
                    </Stack>
                  );
                }}
              >
                {TIME_ZONE_OPTIONS.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    <Stack width="100%" spacing={0.25}>
                      <Typography fontSize={14} fontWeight={600}>
                        {item.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.region || "—"}
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box
              sx={{
                px: 1.5,
                py: 1.25,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "#fafbff",
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
              >
                <Box>
                  <Typography variant="body2" fontWeight={700}>
                    {selectedItem?.label || selectedTimeZone}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedItem?.region || "—"}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t("account:timezone.currentExampleLabel", {
                      defaultValue: "Örnek yerel saat",
                    })}
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {formatExampleNow(selectedTimeZone)}
                  </Typography>
                </Box>
              </Stack>
            </Box>

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
                  {t("account:timezone.note", {
                    defaultValue:
                      "Kayıtlar sistemde UTC tutulur, gösterim seçtiğiniz saat dilimine göre yapılır.",
                  })}
                </Typography>
              </Stack>
            </Box>

            {saving && (
              <Stack direction="row" alignItems="center" gap={1}>
                <CircularProgress size={14} />
                <Typography variant="caption" color="text.secondary">
                  {t("common:saving", { defaultValue: "Kaydediliyor..." })}
                </Typography>
              </Stack>
            )}
          </Stack>
        </Box>
      </Box>
    </BlankCard>
  );
}