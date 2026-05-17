// src/modules/tenants/components/TenantFormDialog.tsx

"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
} from "@mui/material";

import { useI18nNs } from "@/app/context/i18nContext";

import type {
  TenantCreateRequestDto,
  TenantDetailDto,
  TenantUpdateRequestDto,
} from "../types/Tenant.types";

type TenantFormDialogMode = "create" | "edit";

type TenantFormState = {
  key: string;
  name: string;
  defaultCulture: string;
  timeZone: string;
  isActive: boolean;
};

type TenantFormDialogProps = {
  open: boolean;
  mode: TenantFormDialogMode;
  tenant?: TenantDetailDto | null;
  saving?: boolean;
  error?: string | null;

  onClose: () => void;
  onCreate: (input: TenantCreateRequestDto) => Promise<unknown>;
  onUpdate: (id: string, input: TenantUpdateRequestDto) => Promise<unknown>;
  onStatusChange: (id: string, isActive: boolean) => Promise<unknown>;
};

const DEFAULT_FORM: TenantFormState = {
  key: "",
  name: "",
  defaultCulture: "tr-TR",
  timeZone: "Europe/Zurich",
  isActive: true,
};

export default function TenantFormDialog({
  open,
  mode,
  tenant,
  saving = false,
  error = null,
  onClose,
  onCreate,
  onUpdate,
  onStatusChange,
}: TenantFormDialogProps) {
  const { t } = useI18nNs("tenants");

  const [form, setForm] = useState<TenantFormState>(DEFAULT_FORM);

  const isEdit = mode === "edit";

  const title = useMemo(() => {
    return isEdit
      ? t("tenants:dialog.editTitle")
      : t("tenants:dialog.createTitle");
  }, [isEdit, t]);

  useEffect(() => {
    if (!open) return;

    if (isEdit && tenant) {
      setForm({
        key: tenant.key,
        name: tenant.name,
        defaultCulture: tenant.defaultCulture ?? "tr-TR",
        timeZone: tenant.timeZone ?? "Europe/Zurich",
        isActive: tenant.isActive,
      });

      return;
    }

    setForm(DEFAULT_FORM);
  }, [open, isEdit, tenant]);

  const updateField = <K extends keyof TenantFormState>(
    key: K,
    value: TenantFormState[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

const handleSubmit = async () => {
  if (isEdit && tenant) {
    const updated = await onUpdate(tenant.id, {
      name: form.name.trim(),
      defaultCulture: form.defaultCulture.trim() || null,
      timeZone: form.timeZone.trim() || null,
    });

    if (!updated) {
      return;
    }

    if (tenant.isActive !== form.isActive) {
      const statusUpdated = await onStatusChange(tenant.id, form.isActive);

      if (!statusUpdated) {
        return;
      }
    }

    onClose();
    return;
  }

  const created = await onCreate({
    key: form.key.trim(),
    name: form.name.trim(),
    defaultCulture: form.defaultCulture.trim() || "tr-TR",
    timeZone: form.timeZone.trim() || "Europe/Zurich",
  });

  if (!created) {
    return;
  }

  onClose();
};

  const canSubmit = isEdit
    ? Boolean(tenant?.id && form.name.trim())
    : Boolean(form.key.trim() && form.name.trim());

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          {error ? <Alert severity="error">{error}</Alert> : null}

          <TextField
            label={t("tenants:fields.key")}
            value={form.key}
            onChange={(event) => updateField("key", event.target.value)}
            disabled={saving || isEdit}
            fullWidth
            required={!isEdit}
            helperText={
              isEdit
                ? t("tenants:helper.keyReadonly")
                : t("tenants:helper.keyExample")
            }
          />

          <TextField
            label={t("tenants:fields.name")}
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            disabled={saving}
            fullWidth
            required
          />

          <TextField
            label={t("tenants:fields.defaultCulture")}
            value={form.defaultCulture}
            onChange={(event) =>
              updateField("defaultCulture", event.target.value)
            }
            disabled={saving}
            fullWidth
            helperText={t("tenants:helper.defaultCultureExample")}
          />

          <TextField
            label={t("tenants:fields.timeZone")}
            value={form.timeZone}
            onChange={(event) => updateField("timeZone", event.target.value)}
            disabled={saving}
            fullWidth
            helperText={t("tenants:helper.timeZoneExample")}
          />

          {isEdit ? (
            <>
              <Divider />

              <FormControlLabel
                control={
                  <Switch
                    checked={form.isActive}
                    onChange={(event) =>
                      updateField("isActive", event.target.checked)
                    }
                    disabled={saving}
                  />
                }
                label={
                  form.isActive
                    ? t("tenants:status.active")
                    : t("tenants:status.passive")
                }
              />
            </>
          ) : null}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          {t("common:button.cancel")}
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!canSubmit || saving}
        >
          {saving
            ? t("common:saving")
            : isEdit
              ? t("tenants:actions.update")
              : t("tenants:actions.create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}