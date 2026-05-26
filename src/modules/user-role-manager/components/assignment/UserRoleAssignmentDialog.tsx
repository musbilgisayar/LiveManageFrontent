"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { useI18nNs }
  from "@/app/context/i18nContext";

import type {
  AppRoleListItemDto,
} from "../../types/AppRole.types";

import type {
  AppUserRoleDto,
} from "../../types/UserRoleAssignment.types";

type UserRoleAssignmentDialogProps = {
  open: boolean;

  roles: AppRoleListItemDto[];

  activeRoles: AppUserRoleDto[];

  isSubmitting?: boolean;

  onClose: () => void;

  onSync: (
    roleIds: string[],
    reason?: string | null,
  ) => Promise<void>;
};

export default function UserRoleAssignmentDialog({
  open,
  roles,
  activeRoles,
  isSubmitting = false,
  onClose,
  onSync,
}: UserRoleAssignmentDialogProps) {
  const { t } = useI18nNs("userRoleManager");

  const activeRoleIds = useMemo(
    () =>
      new Set(
        activeRoles.map((role) => role.roleId),
      ),
    [activeRoles],
  );

  const [selectedRoleIds, setSelectedRoleIds] =
    useState<string[]>(
      activeRoles.map((role) => role.roleId),
    );

  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setSelectedRoleIds(
      activeRoles.map((role) => role.roleId),
    );
    setReason("");
  }, [activeRoles, open]);

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds((current) =>
      current.includes(roleId)
        ? current.filter((id) => id !== roleId)
        : [...current, roleId],
    );
  };

  const handleSubmit = async () => {
    await onSync(
      selectedRoleIds,
      reason.trim() || null,
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {t("assignmentDialog.title")}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {t("assignmentDialog.description")}
          </Typography>

          <Stack spacing={1}>
            {roles.map((role) => {
              const wasActive =
                activeRoleIds.has(role.id);

              return (
                <Stack
                  key={role.id}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={2}
                  sx={{
                    border: (theme) =>
                      `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedRoleIds.includes(
                          role.id,
                        )}
                        disabled={isSubmitting}
                        onChange={() =>
                          toggleRole(role.id)
                        }
                      />
                    }
                    label={
                      <Stack spacing={0.25}>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                        >
                          {role.name}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {role.description ?? "-"}
                        </Typography>
                      </Stack>
                    }
                  />

                  <Stack
                    direction="row"
                    spacing={1}
                  >
                    {wasActive && (
                      <Chip
                        size="small"
                        color="success"
                        label={t("badges.current")}
                      />
                    )}

                    {role.isSensitive && (
                      <Chip
                        size="small"
                        color="warning"
                        label={t("badges.sensitive")}
                      />
                    )}

                    {role.isSystem && (
                      <Chip
                        size="small"
                        color="error"
                        label={t("badges.system")}
                      />
                    )}
                  </Stack>
                </Stack>
              );
            })}
          </Stack>

          <TextField
            label={t("assignmentDialog.reasonLabel")}
            multiline
            minRows={3}
            value={reason}
            disabled={isSubmitting}
            onChange={(event) =>
              setReason(event.target.value)
            }
            placeholder={t("assignmentDialog.reasonPlaceholder")}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          disabled={isSubmitting}
        >
          {t("actions.cancel")}
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {t("actions.saveRoles")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
