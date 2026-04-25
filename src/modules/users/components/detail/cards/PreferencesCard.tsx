"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  CardContent,
  Grid,
  MenuItem,
  Stack,
  Switch,
  Typography,
  CircularProgress,
} from "@mui/material";
import BlankCard from "@/app/components/shared/BlankCard";
import CustomFormLabel from "@/app/components/forms/theme-elements/CustomFormLabel";
import CustomSelect from "@/app/components/forms/theme-elements/CustomSelect";
import { SelectChangeEvent } from "@mui/material/Select";
import { useI18nNs } from "@/app/context/i18nContext";

export default function PreferencesCard() {
  const { t } = useI18nNs(["account", "common"]);

  const [language, setLanguage] = useState("tr");
  const [theme, setTheme] = useState("light");
  const [timezone, setTimezone] = useState("Europe/Zurich");
  const [notifications, setNotifications] = useState(true);
  const [loading, setLoading] = useState(false);

  const languages = [
    { value: "tr", label: "Türkçe" },
    { value: "en", label: "English" },
    { value: "de", label: "Deutsch" },
    { value: "fr", label: "Français" },
    { value: "it", label: "Italiano" },
  ];

  const themes = [
    { value: "light", label: t("account:preferences.theme.light", { defaultValue: "Açık Tema" }) },
    { value: "dark", label: t("account:preferences.theme.dark", { defaultValue: "Koyu Tema" }) },
    { value: "system", label: t("account:preferences.theme.system", { defaultValue: "Sistem Varsayılanı" }) },
  ];

  const timezones = [
    { value: "Europe/Istanbul", label: "Europe/Istanbul (GMT+3)" },
    { value: "Europe/Zurich", label: "Europe/Zurich (GMT+1)" },
    { value: "Europe/Berlin", label: "Europe/Berlin (GMT+1)" },
    { value: "UTC", label: "UTC (Evrensel)" },
  ];

const handleSave = async () => {
  setLoading(true);
  try {
    await fetch("/api/v1.0/profile/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language, theme, timezone, notifications }),
    });
    alert(t("common:alert.saved", { defaultValue: "Tercihler kaydedildi." }));
  } catch {
    alert(t("common:alert.error", { defaultValue: "Bir hata oluştu." }));
  } finally {
    setLoading(false);
  }
};


  return (
    <BlankCard>
      <CardContent>
        <Typography variant="h5" mb={1}>
          {t("account:preferences.title", { defaultValue: "Kullanıcı Tercihleri" })}
        </Typography>
        <Typography color="textSecondary" mb={3}>
          {t("account:preferences.desc", {
            defaultValue: "Dil, tema, zaman dilimi ve bildirim tercihlerinizi yönetin.",
          })}
        </Typography>

        <Grid container spacing={3}>
          {/* Dil */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomFormLabel>{t("account:preferences.language", { defaultValue: "Dil" })}</CustomFormLabel>
            <CustomSelect
              value={language}
              onChange={(e: SelectChangeEvent) => setLanguage(e.target.value)}
              fullWidth
            >
              {languages.map((lang) => (
                <MenuItem key={lang.value} value={lang.value}>
                  {lang.label}
                </MenuItem>
              ))}
            </CustomSelect>
          </Grid>

          {/* Tema */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomFormLabel>{t("account:preferences.theme.label", { defaultValue: "Tema" })}</CustomFormLabel>
            <CustomSelect
              value={theme}
              onChange={(e: SelectChangeEvent) => setTheme(e.target.value)}
              fullWidth
            >
              {themes.map((th) => (
                <MenuItem key={th.value} value={th.value}>
                  {th.label}
                </MenuItem>
              ))}
            </CustomSelect>
          </Grid>

          {/* Saat Dilimi */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomFormLabel>{t("account:preferences.timezone", { defaultValue: "Saat Dilimi" })}</CustomFormLabel>
            <CustomSelect
              value={timezone}
              onChange={(e: SelectChangeEvent) => setTimezone(e.target.value)}
              fullWidth
            >
              {timezones.map((tz) => (
                <MenuItem key={tz.value} value={tz.value}>
                  {tz.label}
                </MenuItem>
              ))}
            </CustomSelect>
          </Grid>

          {/* Bildirimler */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomFormLabel>{t("account:preferences.notifications", { defaultValue: "Bildirimler" })}</CustomFormLabel>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography>
                {notifications
                  ? t("account:preferences.notifications.on", { defaultValue: "Açık" })
                  : t("account:preferences.notifications.off", { defaultValue: "Kapalı" })}
              </Typography>
              <Switch
                checked={notifications}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotifications(e.target.checked)}
              />
            </Stack>
          </Grid>
        </Grid>

        <Stack direction="row" justifyContent="end" mt={3}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading}
            startIcon={loading && <CircularProgress size={16} />}
          >
            {t("common:button.save", { defaultValue: "Kaydet" })}
          </Button>
        </Stack>
      </CardContent>
    </BlankCard>
  );
}
