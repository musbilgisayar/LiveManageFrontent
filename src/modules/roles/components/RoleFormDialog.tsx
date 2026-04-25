"use client";

import React, { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  CircularProgress,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RoleUpsertDto, RoleDto } from "../types";
import { roleService } from "../services";
import { useParams } from "next/navigation";
import { useSnackbar } from "notistack";

const schema = z.object({
  id: z.string().uuid().optional(), // 🆕 id eklendi
  name: z.string().min(2, "Role name is required"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onClose: () => void;
  role?: RoleDto | null;
  onSaved?: () => void;
};

/**
 * 🧾 RoleFormDialog
 * Kurumsal MUI + RHF + Zod ile rol ekleme / düzenleme formu
 */
export function RoleFormDialog({ open, onClose, role, onSaved }: Props) {
  const { locale } = useParams() as { locale?: string };
  const lang = locale ?? "tr";
  const { enqueueSnackbar } = useSnackbar();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "" },
  });

useEffect(() => {
  if (role)
    reset({
      id: role.id, // 🩵 ekle
      name: role.name,
      description: role.description ?? "",
    });
  else
    reset({
      id: undefined,
      name: "",
      description: "",
    });
}, [role, reset]);


  const onSubmit = async (values: FormValues) => {
    try {
 await roleService.upsert(
  {
    id: role?.id,
    name: values.name,
    description: values.description,
  } as RoleUpsertDto,
  { lang }
);
      enqueueSnackbar("✅ Role saved successfully", { variant: "success" });
      onSaved?.();
    } catch (err) {
      enqueueSnackbar("❌ Failed to save role", { variant: "error" });
      console.error("RoleFormDialog error:", err);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, boxShadow: "var(--shadow-md)" },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
        {role ? "Edit Role" : "Add New Role"}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            {...register("name")}
            label="Role Name"
            error={!!errors.name}
            helperText={errors.name?.message}
            fullWidth
          />
          <TextField
            {...register("description")}
            label="Description"
            fullWidth
            multiline
            rows={3}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={16} /> : undefined}
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          {role ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
