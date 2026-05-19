"use client";

import { useEffect } from "react";

import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconDeviceFloppy, IconX } from "@tabler/icons-react";
import { useParams } from "next/navigation";
import { useSnackbar } from "notistack";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useI18nNs } from "@/app/context/i18nContext";

import { roleService } from "../services";
import type { RoleDto, RoleUpsertDto } from "../types";

const schema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "roles:validation.nameRequired"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onClose: () => void;
  role?: RoleDto | null;
  onSaved?: () => void;
};

export function RoleFormDialog({
  open,
  onClose,
  role,
  onSaved,
}: Props) {
  const theme = useTheme();
  const { locale } = useParams() as { locale?: string };
  const lang = locale ?? "tr";

  const { enqueueSnackbar } = useSnackbar();
  const { t } = useI18nNs(["roles"]);

  const tr = (key: string, fallback: string) => {
    const value = t(key);

    return !value || value === key || value === `[${key}]`
      ? fallback
      : value;
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: undefined,
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (!open) return;

    if (role) {
      reset({
        id: role.id,
        name: role.name,
        description: role.description ?? "",
      });

      return;
    }

    reset({
      id: undefined,
      name: "",
      description: "",
    });
  }, [open, role, reset]);

  const resolveErrorText = (value?: string) => {
    if (!value) return undefined;

    return value.startsWith("roles:")
      ? tr(value, "Rol adı zorunludur.")
      : value;
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const dto: RoleUpsertDto = {
        id: role?.id,
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
      };

      const saved = await roleService.upsert(dto, { lang });

      if (!saved) {
        enqueueSnackbar(
          tr("roles:save.error", "Rol kaydedilemedi."),
          { variant: "error" },
        );

        return;
      }

      enqueueSnackbar(
        role
          ? tr("roles:update.success", "Rol güncellendi.")
          : tr("roles:create.success", "Rol oluşturuldu."),
        { variant: "success" },
      );

      onSaved?.();
    } catch (error) {
      console.error("ROLE_FORM_DIALOG_SAVE_FAILED", error);

      enqueueSnackbar(
        tr(
          "roles:save.unexpectedError",
          "Rol kaydedilirken beklenmeyen bir hata oluştu.",
        ),
        { variant: "error" },
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: "hidden",
          border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
        },
      }}
    >
      <DialogTitle
        sx={{
          px: 3,
          py: 2.5,
          background: alpha(theme.palette.primary.main, 0.06),
        }}
      >
        <Stack spacing={0.5}>
          <Typography variant="h6" fontWeight={900}>
            {role
              ? tr("roles:dialog.editTitle", "Rolü düzenle")
              : tr("roles:dialog.createTitle", "Yeni rol oluştur")}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {role
              ? tr(
                  "roles:dialog.editDescription",
                  "Rol adını ve açıklamasını güncelleyin.",
                )
              : tr(
                  "roles:dialog.createDescription",
                  "Yeni bir sistem rolü tanımlayın.",
                )}
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Alert severity="info">
            {tr(
              "roles:dialog.info",
              "Rol oluşturduktan sonra yetkileri Role Permission Matrix ekranından atayın.",
            )}
          </Alert>

          <TextField
            {...register("name")}
            label={tr("roles:field.name", "Rol adı")}
            error={Boolean(errors.name)}
            helperText={resolveErrorText(errors.name?.message)}
            fullWidth
            disabled={isSubmitting}
          />

          <TextField
            {...register("description")}
            label={tr("roles:field.description", "Açıklama")}
            fullWidth
            multiline
            rows={4}
            disabled={isSubmitting}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          color="inherit"
          startIcon={<IconX size={18} />}
          onClick={onClose}
          disabled={isSubmitting}
          sx={{
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          {tr("roles:action.cancel", "İptal")}
        </Button>

        <Button
          variant="contained"
          color="primary"
          startIcon={
            isSubmitting ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <IconDeviceFloppy size={18} />
            )
          }
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          sx={{
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 800,
          }}
        >
          {role
            ? tr("roles:action.update", "Güncelle")
            : tr("roles:action.create", "Oluştur")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}