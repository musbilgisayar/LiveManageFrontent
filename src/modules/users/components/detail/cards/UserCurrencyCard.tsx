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
  IconCurrencyDollar,
  IconCircleCheck,
  IconAlertTriangle,
  IconInfoCircle,
} from "@tabler/icons-react";

import BlankCard from "@/app/components/shared/BlankCard";
import { useI18nNs } from "@/app/context/i18nContext";
import { useSWRConfig } from "swr";
import { patchWebFetcher } from "@/utils/fetchers.web.client";

type Props = {
  currentCurrency?: string | null;
  isLoading?: boolean;
  error?: string | null;
  onUpdated?: () => void;
};

type CurrencyItem = {
  value: string;
  label: string;
  symbol: string;
};

const CURRENCY_OPTIONS: CurrencyItem[] = [
  { value: "TRY", label: "Türk Lirası", symbol: "₺" },
  { value: "CHF", label: "İsviçre Frangı", symbol: "CHF" },
  { value: "EUR", label: "Euro", symbol: "€" },
  { value: "USD", label: "US Dollar", symbol: "$" },
  { value: "GBP", label: "Pound Sterling", symbol: "£" },
  { value: "SAR", label: "Saudi Riyal", symbol: "SAR" },
];

function normalizeCurrency(value?: string | null) {
  if (!value || !value.trim()) return "TRY";
  return value.trim().toUpperCase();
}

export default function UserCurrencyCard({
  currentCurrency,
  isLoading = false,
  error = null,
  onUpdated,
}: Props) {
  const { t } = useI18nNs(["account", "common"]);
  const { mutate } = useSWRConfig();

  const [currency, setCurrency] = React.useState(
    normalizeCurrency(currentCurrency)
  );
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [saveOk, setSaveOk] = React.useState<string | null>(null);

  React.useEffect(() => {
    setCurrency(normalizeCurrency(currentCurrency));
  }, [currentCurrency]);

  const selected =
    CURRENCY_OPTIONS.find((x) => x.value === currency) ?? CURRENCY_OPTIONS[0];

  const handleCurrencyChange = async (e: SelectChangeEvent<string>) => {
    const next = normalizeCurrency(e.target.value);

    if (!next || saving) return;
    if (next === currency) return;

    const prev = currency;
    setCurrency(next);
    setSaving(true);
    setSaveError(null);
    setSaveOk(null);

    try {
      const json: any = await patchWebFetcher("/api/v1.0/account/me", {
        preferredCurrency: next,
      });

      if (json?.ok === false) {
        throw new Error(
          json?.userMessage ||
            json?.message ||
            json?.error ||
            "Currency update failed"
        );
      }

      await mutate("/api/v1.0/account/me");
      await mutate("/api/v1.0/userprofile/me");
      onUpdated?.();

      setSaveOk(
        json?.userMessage ||
          json?.message ||
          t("account:currency.updated") ||
          "Para birimi güncellendi."
      );
    } catch (e: any) {
      setCurrency(prev);
      setSaveError(
        e?.message ||
          e?.payload?.userMessage ||
          e?.payload?.message ||
          e?.payload?.error ||
          t("account:currency.updateError") ||
          "Para birimi güncellenemedi."
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
              <IconCurrencyDollar size={22} />
            </Box>

            <Box>
              <Typography variant="h5" fontWeight={700}>
                {t("account:currency.title") || "Para Birimi"}
              </Typography>

              <Typography variant="body2" sx={{ opacity: 0.92, mt: 0.5 }}>
                {t("account:currency.description") ||
                  "Parasal alanlar bu tercihe göre gösterilir."}
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
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} mb={0.5}>
                {t("account:currency.label") || "Para Birimi"}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {t("account:currency.helper") ||
                  "Parasal gösterimlerde kullanılacak varsayılan para birimini seçin."}
              </Typography>
            </Box>

            <FormControl fullWidth disabled={saving || isLoading}>
              <InputLabel id="currency-select-label">
                {t("account:currency.label") || "Para Birimi"}
              </InputLabel>

              <Select
                labelId="currency-select-label"
                value={currency}
                label={t("account:currency.label") || "Para Birimi"}
                onChange={handleCurrencyChange}
                sx={{
                  borderRadius: 3,
                  "& .MuiSelect-select": {
                    py: 1.6,
                  },
                }}
                renderValue={(value) => {
                  const selectedItem =
                    CURRENCY_OPTIONS.find((x) => x.value === value) ??
                    CURRENCY_OPTIONS[0];

                  return (
                    <Stack spacing={0.25}>
                      <Typography fontSize={14} fontWeight={600}>
                        {selectedItem.label} ({selectedItem.symbol})
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedItem.value}
                      </Typography>
                    </Stack>
                  );
                }}
              >
                {CURRENCY_OPTIONS.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    <Stack width="100%" spacing={0.25}>
                      <Typography fontSize={14} fontWeight={600}>
                        {item.label} ({item.symbol})
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.value}
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
                    {selected.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selected.value}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t("account:currency.symbolLabel") || "Sembol"}
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {selected.symbol}
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
                  {t("account:currency.note") ||
                    "Bu seçim gelecekteki finansal gösterimleri etkiler."}
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