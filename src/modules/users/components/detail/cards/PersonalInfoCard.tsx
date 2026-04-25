// src/modules/profile/components/PersonalInfoCard.tsx
"use client";

import {
  Box,
  TextField,
  MenuItem,
  Grid,
  Stack,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import BlankCard from "@/app/components/shared/BlankCard";
import { useI18nNs } from "@/app/context/i18nContext";
import TiptapEditor from "@/app/components/forms/form-tiptap/TiptapEditor";
import ProfilePhotoUploader from "./ProfilePhotoUploader";
import CoverPhotoUploader from "./CoverPhotoUploader";
//import {EmailChangeCard } from "@/modules/users/components/detail/cards/EmailChangeCard"
import type { UserProfilePatchDto, UserProfileResponseDto } from "../../../../profile/hooks/useProfile";

// --------------------
// helpers (tek yerde)
// --------------------
const toUndef = (v?: string | null) => {
  const s = (v ?? "").trim();
  return s.length ? s : undefined;
};

const isEmptyHtml = (html?: string | null) => {
  const s = (html ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
  return s.length === 0;
};

type PersonalInfoForm = {
  firstName: string;
  lastName: string;
  middleName: string;
  displayName: string;
  birthDate: string; // yyyy-mm-dd
  gender: string;
  jobTitle: string;
  companyName: string;
  department: string;
  emailForNotifications: string;
  profilePhotoUrl: string;
  coverPhotoUrl: string;
  profession: string;
  bio: string;
};

const emptyForm: PersonalInfoForm = {
  firstName: "",
  lastName: "",
  middleName: "",
  displayName: "",
  birthDate: "",
  gender: "",
  jobTitle: "",
  companyName: "",
  department: "",
  emailForNotifications: "",
  profilePhotoUrl: "",
  coverPhotoUrl: "",
  profession: "",
  bio: "",
};

type Props = {
  profile: UserProfileResponseDto | null;
  isLoading?: boolean;
  onSave: (patch: UserProfilePatchDto) => Promise<UserProfileResponseDto | null>;
  onReload?: () => void;
};

export default function PersonalInfoCard({
  profile,
  isLoading = false,
  onSave,
  onReload,
}: Props) {
  const { t } = useI18nNs(["account", "common"]);

  const [form, setForm] = useState<PersonalInfoForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const genders = useMemo(
    () => [
      { value: "male", label: t("account:about.gender.male") },
      { value: "female", label: t("account:about.gender.female") },
      { value: "other", label: t("account:about.gender.other") },
    ],
    [t]
  );

  // ✅ Profile değişince form doldur
  useEffect(() => {
    setSaved(false);
    setError(null);

    if (!profile) {
      setForm(emptyForm);
      return;
    }

    setForm({
      ...emptyForm,

      firstName: profile.firstName ?? "",
      lastName: profile.lastName ?? "",
      middleName: profile.middleName ?? "",
      displayName: profile.displayName ?? "",

      emailForNotifications: profile.emailForNotifications ?? "",
      profilePhotoUrl: profile.profilePhotoUrl ?? "",
      coverPhotoUrl: profile.coverPhotoUrl ?? "",

      // Bu alanlar backend DTO'nda varsa (yoksa zaten undefined gelir, "" yaparız)
      jobTitle: (profile as any).jobTitle ?? "",
      companyName: (profile as any).companyName ?? "",
      department: (profile as any).department ?? "",
      bio: (profile as any).bio ?? "",

      // Şimdilik backend'e yollamıyoruz
      birthDate: "",
      gender: "",
      profession: "",
    });
  }, [profile]);

  const handleChange = (key: keyof PersonalInfoForm, value: string) => {
    setSaved(false);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const patch: UserProfilePatchDto = {
        firstName: toUndef(form.firstName),
        lastName: toUndef(form.lastName),
        middleName: toUndef(form.middleName),
        displayName: toUndef(form.displayName),

        emailForNotifications: toUndef(form.emailForNotifications),

        profilePhotoUrl: toUndef(form.profilePhotoUrl),
        coverPhotoUrl: toUndef(form.coverPhotoUrl),

        jobTitle: toUndef(form.jobTitle),
        companyName: toUndef(form.companyName),
        department: toUndef(form.department),

        bio: isEmptyHtml(form.bio) ? undefined : form.bio,
      };

      await onSave(patch);
      setSaved(true);
      onReload?.();
    } catch {
      setError(t("common:alert.error", { defaultValue: "Bir hata oluştu." }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <BlankCard>
      <Box sx={{ pl: 3, pr: 3, pt: 1 }}>
        <Typography variant="h5" mb={1}>
          {t("account:info.title")}
        </Typography>
        <Typography color="text.secondary" mb={2}>
          {t("account:info.desc")}
        </Typography>

        {isLoading && (
          <Stack direction="row" alignItems="center" gap={1} mb={2}>
            <CircularProgress size={16} />
            <Typography variant="body2" color="text.secondary">
              {t("common:loading", { defaultValue: "Yükleniyor..." })}
            </Typography>
          </Stack>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {saved && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {t("common:alert.saved")}
          </Alert>
        )}
      </Box>

      <Grid
        container
        spacing={3}
        sx={{
          pl: 3,
          pr: 3,
          "& .MuiOutlinedInput-root": { borderRadius: 2 },
          "& input::placeholder": {
            fontSize: "0.72rem",
            color: "rgba(0,0,0,0.45)",
            opacity: 1,
            fontWeight: 300,
          },
          "& .MuiInputLabel-root": { fontSize: "0.85rem" },
        }}
      >
        <Grid size={{ xs: 12 }}>
          <Stack spacing={2}>
            <CoverPhotoUploader
              value={form.coverPhotoUrl}
              onChange={(dataUrl) => handleChange("coverPhotoUrl", dataUrl)}
            />

            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <ProfilePhotoUploader
                value={form.profilePhotoUrl}
                onChange={(dataUrl) => handleChange("profilePhotoUrl", dataUrl)}
                size={110}
              />
            </Box>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label={t("account:info.firstName.label")}
            placeholder={t("account:info.firstName.placeholder")}
            value={form.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            fullWidth
            disabled={isLoading}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label={t("account:info.lastName.label")}
            placeholder={t("account:info.lastName.placeholder")}
            value={form.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            fullWidth
            disabled={isLoading}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label={t("account:info.middleName.label")}
            placeholder={t("account:info.middleName.placeholder")}
            value={form.middleName}
            onChange={(e) => handleChange("middleName", e.target.value)}
            fullWidth
            disabled={isLoading}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label={t("account:info.displayName.label")}
            placeholder={t("account:info.displayName.placeholder")}
            value={form.displayName}
            onChange={(e) => handleChange("displayName", e.target.value)}
            fullWidth
            disabled={isLoading}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label={t("account:about.birthDate.label")}
            type="date"
            value={form.birthDate}
            onChange={(e) => handleChange("birthDate", e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            disabled={isLoading}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            label={t("account:about.gender.label")}
            value={form.gender}
            onChange={(e) => handleChange("gender", e.target.value)}
            fullWidth
            disabled={isLoading}
          >
            {genders.map((g) => (
              <MenuItem key={g.value} value={g.value}>
                {g.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label={t("account:info.role.label")}
            placeholder={t("account:info.role.placeholder")}
            value={form.jobTitle}
            onChange={(e) => handleChange("jobTitle", e.target.value)}
            fullWidth
            disabled={isLoading}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label={t("account:info.companyName.label")}
            placeholder={t("account:info.companyName.placeholder")}
            value={form.companyName}
            onChange={(e) => handleChange("companyName", e.target.value)}
            fullWidth
            disabled={isLoading}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label={t("account:info.department.label")}
            placeholder={t("account:info.department.placeholder")}
            value={form.department}
            onChange={(e) => handleChange("department", e.target.value)}
            fullWidth
            disabled={isLoading}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label={t("account:info.emailForNotifications.label")}
            placeholder={t("account:info.emailForNotifications.placeholder")}
            value={form.emailForNotifications}
            onChange={(e) => handleChange("emailForNotifications", e.target.value)}
            fullWidth
            disabled={isLoading}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" mb={1}>
            {t("account:about.bio.label")}
          </Typography>
          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              p: 1.5,
              bgcolor: "background.paper",
              opacity: isLoading ? 0.7 : 1,
              pointerEvents: isLoading ? "none" : "auto",
            }}
          >
            <TiptapEditor
              placeholder={t("account:about.bio.placeholder")}
              value={form.bio}
              onChange={(val) => handleChange("bio", val)}
            />
          </Box>
        </Grid>
      </Grid>

      <Stack direction="row" justifyContent="end" mt={3} sx={{ pr: 3, pb: 2 }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || isLoading}
          startIcon={saving ? <CircularProgress size={16} /> : undefined}
        >
          {t("common:button.save")}
        </Button>
      </Stack>
    </BlankCard>
  );
}
