"use client";

import { useMemo, useState } from "react";

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
        Manage User Roles
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Select the roles that should remain active for this user.
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
                        label="Current"
                      />
                    )}

                    {role.isSensitive && (
                      <Chip
                        size="small"
                        color="warning"
                        label="Sensitive"
                      />
                    )}

                    {role.isSystem && (
                      <Chip
                        size="small"
                        color="error"
                        label="System"
                      />
                    )}
                  </Stack>
                </Stack>
              );
            })}
          </Stack>

          <TextField
            label="Reason"
            multiline
            minRows={3}
            value={reason}
            onChange={(event) =>
              setReason(event.target.value)
            }
            placeholder="Optional operation reason"
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          Save Roles
        </Button>
      </DialogActions>
    </Dialog>
  );
}