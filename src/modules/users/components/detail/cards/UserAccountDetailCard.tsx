"use client";

import React from "react";
import {
  Box,
  Grid,
  Stack,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Button,
} from "@mui/material";
import BlankCard from "@/app/components/shared/BlankCard";
import { useI18nNs } from "@/app/context/i18nContext";
import { patchWebFetcher } from "@/utils/fetchers.web.client";

export type UserDetailResponseDto = {
  id: string;
  userName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  email?: string | null;
  phoneCountryCode?: string | null;
  phoneNumber?: string | null;
  isEmailConfirmed?: boolean | null;
  isPhoneConfirmed?: boolean | null;
  isVerified?: boolean | null;
  isSuspended?: boolean | null;
  cultureCode?: string | null;
  timeZone?: string | null;
  roles?: string[] | null;
};

type Props = {
  user: UserDetailResponseDto | null;
  isLoading?: boolean;
  error?: string | null;
  onUpdated?: () => void;
};

type UpdateMeRequestDto = {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  timeZone?: string;
  phoneCountryCode?: string;
  phoneNumber?: string;
};

const toText = (v?: string | null) => (v ?? "").trim();

const fmtBool = (v?: boolean | null) => {
  if (v === true) return "Yes";
  if (v === false) return "No";
  return "";
};

function buildPatchPayload(
  original: UserDetailResponseDto,
  current: UpdateMeRequestDto
): UpdateMeRequestDto {
  const out: UpdateMeRequestDto = {};
  const diff = (a?: string | null, b?: string | null) => toText(a) !== toText(b);

  if (diff(original.firstName, current.firstName)) out.firstName = toText(current.firstName);
  if (diff(original.lastName, current.lastName)) out.lastName = toText(current.lastName);
  if (diff(original.displayName, current.displayName)) out.displayName = toText(current.displayName);
  if (diff(original.timeZone, current.timeZone)) out.timeZone = toText(current.timeZone);
  if (diff(original.phoneCountryCode, current.phoneCountryCode)) {
    out.phoneCountryCode = toText(current.phoneCountryCode);
  }
  if (diff(original.phoneNumber, current.phoneNumber)) {
    out.phoneNumber = toText(current.phoneNumber);
  }

  return out;
}

export default function UserAccountDetailCard({
  user,
  isLoading = false,
  error = null,
  onUpdated,
}: Props) {
  const { t } = useI18nNs(["account", "common"]);

  const [isEdit, setIsEdit] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [saveOk, setSaveOk] = React.useState<string | null>(null);

  const [form, setForm] = React.useState<UpdateMeRequestDto>({
    firstName: "",
    lastName: "",
    displayName: "",
    timeZone: "",
    phoneCountryCode: "",
    phoneNumber: "",
  });

  React.useEffect(() => {
    if (!user) return;

    setForm({
      firstName: toText(user.firstName),
      lastName: toText(user.lastName),
      displayName: toText(user.displayName),
      timeZone: toText(user.timeZone),
      phoneCountryCode: toText(user.phoneCountryCode),
      phoneNumber: toText(user.phoneNumber),
    });

    setIsEdit(false);
    setSaveError(null);
    setSaveOk(null);
  }, [user?.id]);

  const fullName = user
    ? `${toText(user.firstName)} ${toText(user.lastName)}`.trim()
    : "";

  const phoneDisplay = user
    ? `${toText(user.phoneCountryCode)} ${toText(user.phoneNumber)}`.trim()
    : "";

  const onChange =
    (key: keyof UpdateMeRequestDto) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((p) => ({ ...p, [key]: e.target.value }));
    };

  const onCancel = () => {
    if (!user) return;

    setForm({
      firstName: toText(user.firstName),
      lastName: toText(user.lastName),
      displayName: toText(user.displayName),
      timeZone: toText(user.timeZone),
      phoneCountryCode: toText(user.phoneCountryCode),
      phoneNumber: toText(user.phoneNumber),
    });

    setIsEdit(false);
    setSaveError(null);
    setSaveOk(null);
  };

  const onSave = async () => {
    if (!user) return;

    setIsSaving(true);
    setSaveError(null);
    setSaveOk(null);

    try {
      const patch = buildPatchPayload(user, form);

      if (Object.keys(patch).length === 0) {
        setSaveOk(t("common:updated") || "Değişiklik yok.");
        setIsEdit(false);
        return;
      }

      const json: any = await patchWebFetcher("/api/v1.0/account/me", patch);

      const msg =
        json?.userMessage ||
        json?.message ||
        (json?.ok === true ? (t("common:updated") || "Güncellendi") : null);

      if (json?.ok === false) {
        throw new Error(msg || json?.error || "Update failed");
      }

      setSaveOk(msg || t("common:updated") || "Güncellendi");
      setIsEdit(false);
      onUpdated?.();
    } catch (e: any) {
      const msg =
        e?.message ||
        e?.payload?.userMessage ||
        e?.payload?.message ||
        e?.payload?.error ||
        "Update failed";

      setSaveError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BlankCard>
      <Box sx={{ pl: 3, pr: 3, pt: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
          <Box>
            <Typography variant="h5" mb={1}>
              {t("account:user.title")}
            </Typography>

            <Typography color="text.secondary" mb={2}>
              {t("account:user.description")}
            </Typography>
          </Box>

          <Stack direction="row" gap={1} sx={{ pb: 1 }}>
            {!isEdit ? (
              <Button
                variant="outlined"
                onClick={() => {
                  setIsEdit(true);
                  setSaveError(null);
                  setSaveOk(null);
                }}
                disabled={!user || isLoading}
              >
                {t("common:edit") || "Düzenle"}
              </Button>
            ) : (
              <>
                <Button variant="outlined" onClick={onCancel} disabled={isSaving}>
                  {t("common:cancel") || "İptal"}
                </Button>

                <Button
                  variant="contained"
                  onClick={onSave}
                  disabled={isSaving}
                  startIcon={isSaving ? <CircularProgress size={16} /> : undefined}
                >
                  {t("common:save") || "Kaydet"}
                </Button>
              </>
            )}
          </Stack>
        </Stack>

        {isLoading && (
          <Stack direction="row" alignItems="center" gap={1} mb={2}>
            <CircularProgress size={16} />
            <Typography variant="body2" color="text.secondary">
              {t("common:loading")}
            </Typography>
          </Stack>
        )}

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}
        {saveOk && <Alert severity="success" sx={{ mb: 2 }}>{saveOk}</Alert>}
      </Box>

      <Grid container spacing={3} sx={{ pl: 3, pr: 3, pb: 2 }}>
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" color="text.secondary" mb={1}>
            {t("account:user.section.identity")}
          </Typography>
          <Divider />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label={t("account:user.fields.displayName")}
            value={isEdit ? (form.displayName ?? "") : (toText(user?.displayName) || fullName)}
            onChange={onChange("displayName")}
            fullWidth
            slotProps={{ input: { readOnly: !isEdit } }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label={t("account:user.fields.userName")}
            value={toText(user?.userName)}
            fullWidth
            slotProps={{ input: { readOnly: true } }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label={t("account:user.fields.firstName")}
            value={isEdit ? (form.firstName ?? "") : toText(user?.firstName)}
            onChange={onChange("firstName")}
            fullWidth
            slotProps={{ input: { readOnly: !isEdit } }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label={t("account:user.fields.lastName")}
            value={isEdit ? (form.lastName ?? "") : toText(user?.lastName)}
            onChange={onChange("lastName")}
            fullWidth
            slotProps={{ input: { readOnly: !isEdit } }}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" color="text.secondary" mb={1} mt={1}>
            {t("account:user.section.contact")}
          </Typography>
          <Divider />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label={t("account:user.fields.email")}
            value={toText(user?.email)}
            fullWidth
            slotProps={{ input: { readOnly: true } }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          {!isEdit ? (
            <TextField
              label={t("account:user.fields.phone")}
              value={phoneDisplay}
              fullWidth
              slotProps={{ input: { readOnly: true } }}
            />
          ) : (
            <Stack direction="row" gap={1}>
              <TextField
                label={t("account:user.fields.phoneCountryCode") || "Country"}
                value={form.phoneCountryCode ?? ""}
                onChange={onChange("phoneCountryCode")}
                sx={{ maxWidth: 140 }}
              />
              <TextField
                label={t("account:user.fields.phoneNumber") || "Phone"}
                value={form.phoneNumber ?? ""}
                onChange={onChange("phoneNumber")}
                fullWidth
                helperText={
                  t("account:user.hints.phone") ||
                  "Boşluk/parantez yazabilirsin; backend E.164’e çevirir."
                }
              />
            </Stack>
          )}
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" color="text.secondary" mb={1} mt={1}>
            {t("account:user.section.system")}
          </Typography>
          <Divider />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label={t("account:user.fields.timeZone")}
            value={isEdit ? (form.timeZone ?? "") : toText(user?.timeZone)}
            onChange={onChange("timeZone")}
            fullWidth
            slotProps={{ input: { readOnly: !isEdit } }}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Stack direction="row" gap={1} flexWrap="wrap">
            <Chip
              size="small"
              label={`${t("account:user.badges.emailConfirmed")}: ${fmtBool(user?.isEmailConfirmed)}`}
            />
            <Chip
              size="small"
              label={`${t("account:user.badges.phoneConfirmed")}: ${fmtBool(user?.isPhoneConfirmed)}`}
            />
            <Chip
              size="small"
              label={`${t("account:user.badges.verified")}: ${fmtBool(user?.isVerified)}`}
            />
            <Chip
              size="small"
              label={`${t("account:user.badges.suspended")}: ${fmtBool(user?.isSuspended)}`}
            />
          </Stack>
        </Grid>
      </Grid>
    </BlankCard>
  );
}