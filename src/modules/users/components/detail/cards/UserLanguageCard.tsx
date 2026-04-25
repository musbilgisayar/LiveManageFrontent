"use client";

import React from "react";
import Image from "next/image";
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
  IconLanguage,
  IconCircleCheck,
  IconAlertTriangle,
  IconInfoCircle,
} from "@tabler/icons-react";

import BlankCard from "@/app/components/shared/BlankCard";
import { useI18nNs } from "@/app/context/i18nContext";
import { useCustomizer } from "@/app/context/customizerContext";
import { usePathname, useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import { patchWebFetcher } from "@/utils/fetchers.web.client";
import { API_BASE as CONFIG_API_BASE } from "@/lib/config";
import { normalizeCultures } from "@/lib/i18n/normalizeCultures";

type Props = {
  currentCultureCode?: string | null;
  isLoading?: boolean;
  error?: string | null;
  onUpdated?: () => void;
};

type LanguageItem = {
  cultureCode: string;
  name: string;
  isDefault: boolean;
};

const API_VERSION = "1.0";
const API_BASE = CONFIG_API_BASE || "";

const LOCALE_PREFIX_RE = /^\/[a-z]{2}(?:-[A-Za-z]{2})?(?=\/|$)/i;

const toPrefix = (c: string) => (c || "tr").split("-")[0].toLowerCase();

const getFlagUrl = (cultureCode: string) => `/images/flag/${cultureCode}.svg`;

function setLocaleCookie(prefixOrCulture: string) {
  const secure =
    typeof window !== "undefined" && window.location?.protocol === "https:"
      ? "; Secure"
      : "";

  const prefix = toPrefix(prefixOrCulture);
  document.cookie = `lm.lang=${prefix}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
}

function getUrlPrefix(pathname: string): string {
  const firstSeg = (pathname.split("/")[1] || "").toLowerCase();
  return /^[a-z]{2}$/.test(firstSeg) ? firstSeg : "tr";
}

function buildNextLocalizedPath(pathname: string, cultureCode: string) {
  const newPrefix = toPrefix(cultureCode);
  const stripped = pathname.replace(LOCALE_PREFIX_RE, "") || "/";
  return `/${newPrefix}${stripped}`.replace(/\/{2,}/g, "/");
}

export default function UserLanguageCard({
  currentCultureCode,
  isLoading = false,
  error = null,
  onUpdated,
}: Props) {
  const { t } = useI18nNs(["account", "common"]);
  const { mutate } = useSWRConfig();
  const { setIsLanguage } = useCustomizer();
  const router = useRouter();
  const pathname = usePathname();

  const [languages, setLanguages] = React.useState<LanguageItem[]>([]);
  const [selectedCulture, setSelectedCulture] = React.useState(
    currentCultureCode || "tr-TR"
  );
  const [listLoading, setListLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [saveOk, setSaveOk] = React.useState<string | null>(null);

  const urlPrefix = React.useMemo(() => getUrlPrefix(pathname), [pathname]);

  React.useEffect(() => {
    setSelectedCulture(currentCultureCode || "tr-TR");
  }, [currentCultureCode]);

  React.useEffect(() => {
    const ac = new AbortController();

    (async () => {
      setListLoading(true);
      setSaveError(null);

      try {
        const url = `${API_BASE}/api/v${API_VERSION}/culture/list`;

        const res = await fetch(url, {
          method: "GET",
          headers: {
            accept: "application/json",
            "accept-language": urlPrefix,
          },
          cache: "no-store",
          signal: ac.signal,
        });

        if (!res.ok) {
          throw new Error(`culture/list failed: ${res.status}`);
        }

        const json = await res.json().catch(() => null);

        const source = Array.isArray(json)
          ? json
          : Array.isArray(json?.data)
            ? json.data
            : Array.isArray(json?.items)
              ? json.items
              : Array.isArray(json?.payload)
                ? json.payload
                : json?.data ?? json;

        const normalized = normalizeCultures(source);

        if (!normalized.length) {
          const fallbackLanguages: LanguageItem[] = [
            { cultureCode: "tr-TR", name: "Türkçe", isDefault: true },
            { cultureCode: "en-US", name: "English", isDefault: false },
            { cultureCode: "de-DE", name: "Deutsch", isDefault: false },
            { cultureCode: "fr-FR", name: "Français", isDefault: false },
            { cultureCode: "it-IT", name: "Italiano", isDefault: false },
            { cultureCode: "ar-SA", name: "العربية", isDefault: false },
          ];

          setLanguages(fallbackLanguages);

          const fallbackSelected =
            fallbackLanguages.find(
              (x) =>
                x.cultureCode.toLowerCase() ===
                (currentCultureCode || "").toLowerCase()
            )?.cultureCode ||
            fallbackLanguages.find((x) => x.isDefault)?.cultureCode ||
            "tr-TR";

          setSelectedCulture(fallbackSelected);
          return;
        }

        const mapped: LanguageItem[] = normalized.map((x) => ({
          cultureCode: x.cultureCode,
          name: x.name,
          isDefault: x.isDefault,
        }));

        setLanguages(mapped);

        const exists = mapped.some(
          (x) =>
            x.cultureCode.toLowerCase() ===
            (currentCultureCode || "").toLowerCase()
        );

        if (!exists) {
          const fallback =
            mapped.find((x) => x.isDefault)?.cultureCode ||
            mapped[0]?.cultureCode ||
            "tr-TR";
          setSelectedCulture(fallback);
        }
      } catch (e: any) {
        if (e?.name === "AbortError") return;

        setSaveError(
          e?.message ||
            t("account:language.loadError") ||
            "Dil listesi yüklenemedi."
        );
      } finally {
        setListLoading(false);
      }
    })();

    return () => ac.abort();
  }, [currentCultureCode, t, urlPrefix]);

  const handleCultureChange = async (e: SelectChangeEvent<string>) => {
    const nextCulture = e.target.value;

    if (!nextCulture || saving) return;
    if (
      (nextCulture || "").toLowerCase() ===
      (selectedCulture || "").toLowerCase()
    ) {
      return;
    }

    const prevCulture = selectedCulture;

    setSelectedCulture(nextCulture);
    setSaving(true);
    setSaveError(null);
    setSaveOk(null);

    try {
      const json: any = await patchWebFetcher("/api/v1.0/account/me", {
        cultureCode: nextCulture,
      });

      if (json?.ok === false) {
        throw new Error(
          json?.userMessage ||
            json?.message ||
            json?.error ||
            "Language update failed"
        );
      }

      setLocaleCookie(nextCulture);
      setIsLanguage(nextCulture);

      await mutate("/api/v1.0/account/me");
      await mutate("/api/v1.0/userprofile/me");
      onUpdated?.();

      const nextPath = buildNextLocalizedPath(pathname, nextCulture);
      router.push(nextPath);

      setSaveOk(
        json?.userMessage ||
          json?.message ||
          t("account:language.updated") ||
          "Dil tercihi güncellendi."
      );
    } catch (e: any) {
      setSelectedCulture(prevCulture);

      setSaveError(
        e?.message ||
          e?.payload?.userMessage ||
          e?.payload?.message ||
          e?.payload?.error ||
          t("account:language.updateError") ||
          "Dil tercihi güncellenemedi."
      );
    } finally {
      setSaving(false);
    }
  };

  const effectiveLoading = isLoading || listLoading;

  const selectedLanguage =
    languages.find((x) => x.cultureCode === selectedCulture) || null;

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
              <IconLanguage size={22} />
            </Box>

            <Box>
              <Typography variant="h5" fontWeight={700}>
                {t("account:language.title") || "Dil Tercihi"}
              </Typography>

              <Typography variant="body2" sx={{ opacity: 0.92, mt: 0.5 }}>
                {t("account:language.description") ||
                  "Uygulama dilinizi seçin. Seçim değiştirildiğinde tercih otomatik olarak kaydedilir."}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {effectiveLoading && (
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
                {t("account:user.fields.culture") || "Dil"}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {t("account:language.helper") ||
                  "Seçtiğiniz dil uygulama genelinde kullanılacaktır."}
              </Typography>
            </Box>

            <FormControl fullWidth disabled={saving || effectiveLoading}>
              <InputLabel id="user-language-select-label">
                {t("account:user.fields.culture") || "Dil"}
              </InputLabel>

              <Select
                labelId="user-language-select-label"
                value={selectedCulture}
                label={t("account:user.fields.culture") || "Dil"}
                onChange={handleCultureChange}
                sx={{
                  borderRadius: 3,
                  "& .MuiSelect-select": {
                    py: 1.6,
                  },
                }}
                renderValue={(value) => {
                  const selected =
                    languages.find((lang) => lang.cultureCode === value) ||
                    selectedLanguage;

                  return (
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Image
                        src={getFlagUrl(selected?.cultureCode || "en-US")}
                        alt={
                          selected?.name ||
                          selected?.cultureCode ||
                          "language"
                        }
                        width={22}
                        height={22}
                        style={{ borderRadius: "50%" }}
                      />
                      <Typography fontSize={14} fontWeight={600}>
                        {selected?.name || value}
                      </Typography>
                    </Stack>
                  );
                }}
              >
                {languages.map((lang) => (
                  <MenuItem key={lang.cultureCode} value={lang.cultureCode}>
                    <Stack
                      direction="row"
                      spacing={1.25}
                      alignItems="center"
                      width="100%"
                    >
                      <Image
                        src={getFlagUrl(lang.cultureCode)}
                        alt={lang.name || lang.cultureCode || "language"}
                        width={22}
                        height={22}
                        style={{ borderRadius: "50%" }}
                      />

                      <Box>
                        <Typography fontSize={14} fontWeight={600}>
                          {lang.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {lang.cultureCode}
                        </Typography>
                      </Box>

                      {lang.cultureCode === selectedCulture && (
                        <Typography sx={{ marginLeft: "auto" }}>✅</Typography>
                      )}
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

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
                  {t("account:language.note1") ||
                    "Dil değişikliği sonrası sayfa yeni locale ile yeniden yüklenir."}{" "}
                  {t("account:language.note2") ||
                    "Tercihiniz otomatik kaydedilir ve sonraki girişlerde korunur."}
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Box>
    </BlankCard>
  );
}