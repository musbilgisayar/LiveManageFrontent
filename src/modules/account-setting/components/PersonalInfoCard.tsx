"use client";

import React, { useEffect, useState } from "react";
import { Button, CardContent, MenuItem, Typography, Stack } from "@mui/material";
import Grid from "@mui/material/Grid";
import BlankCard from "@/app/components/shared/BlankCard";
import CustomFormLabel from "@/app/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/app/components/forms/theme-elements/CustomTextField";
import CustomSelect from "@/app/components/forms/theme-elements/CustomSelect";
import { SelectChangeEvent } from "@mui/material/Select";
import { useI18nNs } from "@/app/context/i18nContext";

import { patchWebFetcher } from "@/utils/fetchers.web.client";
import { useAccountMe } from "@/modules/profile/hooks/useAccountMe";

const cultures = [
  { value: "tr-TR", label: "Türkçe (TR)" },
  { value: "de-DE", label: "Deutsch (DE)" },
  { value: "en-US", label: "English (US)" },
];

export default function PersonalInfoCard() {
  const { t } = useI18nNs(["account", "common"]);

  const { user, isLoading, error, reload } = useAccountMe();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [cultureCode, setCultureCode] = useState("tr-TR");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName ?? "");
    setEmail(user.email ?? "");
    setCultureCode(user.cultureCode ?? "tr-TR");
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await patchWebFetcher("/api/v1.0/account/users/me", {
        displayName,
        cultureCode,
      });

      await reload();

      alert(t("account:info.success", { defaultValue: "Kaydedildi." }));
    } catch (e: any) {
      alert(
        e?.message ||
          t("account:info.error", { defaultValue: "Kaydetme sırasında hata oluştu." })
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <BlankCard>
      <CardContent>
        <Typography variant="h5" mb={1}>
          {t("account:info.title", { defaultValue: "Kişisel Bilgiler" })}
        </Typography>
        <Typography color="textSecondary" mb={3}>
          {t("account:info.desc", { defaultValue: "Bilgilerinizi güncelleyin." })}
        </Typography>

        {error && (
          <Typography color="error" mb={2}>
            {t("common:alert.error", { defaultValue: "Bir hata oluştu." })}
          </Typography>
        )}

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomFormLabel>
              {t("account:info.displayName", { defaultValue: "Görünen Ad" })}
            </CustomFormLabel>
            <CustomTextField
              value={displayName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDisplayName(e.target.value)}
              fullWidth
              disabled={isLoading || saving}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomFormLabel>
              {t("account:info.email", { defaultValue: "E-posta" })}
            </CustomFormLabel>
            <CustomTextField
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              fullWidth
              disabled
              helperText={t("account:info.emailHint", {
                defaultValue: "E-posta değişimi 'Credentials' sekmesinden yapılır.",
              })}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomFormLabel>
              {t("account:info.culture", { defaultValue: "Dil" })}
            </CustomFormLabel>
            <CustomSelect
              value={cultureCode}
              onChange={(e: SelectChangeEvent) => setCultureCode(e.target.value)}
              fullWidth
              disabled={isLoading || saving}
            >
              {cultures.map((c) => (
                <MenuItem key={c.value} value={c.value}>
                  {c.label}
                </MenuItem>
              ))}
            </CustomSelect>
          </Grid>
        </Grid>

        <Stack direction="row" justifyContent="end" mt={3}>
          <Button variant="contained" onClick={handleSave} disabled={saving || isLoading}>
            {t("common:button.save", { defaultValue: "Kaydet" })}
          </Button>
        </Stack>
      </CardContent>
    </BlankCard>
  );
}