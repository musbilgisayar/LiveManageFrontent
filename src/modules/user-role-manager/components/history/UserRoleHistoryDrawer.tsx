"use client";

import {
  Chip,
  Drawer,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import type {
  AppUserRoleHistoryDto,
} from "../../types/UserRoleAssignment.types";

type UserRoleHistoryDrawerProps = {
  open: boolean;

  items: AppUserRoleHistoryDto[];

  onClose: () => void;
};

export default function UserRoleHistoryDrawer({
  open,
  items,
  onClose,
}: UserRoleHistoryDrawerProps) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: {
            xs: "100%",
            md: 720,
          },
        },
      }}
    >
      <Stack
        spacing={3}
        sx={{
          p: 3,
        }}
      >
        <Stack spacing={0.5}>
          <Typography
            variant="h5"
            fontWeight={800}
          >
            Role History
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Historical role assignment and revoke timeline
          </Typography>
        </Stack>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                Role
              </TableCell>

              <TableCell>
                Assigned At
              </TableCell>

              <TableCell>
                Status
              </TableCell>

              <TableCell>
                Revoked At
              </TableCell>

              <TableCell>
                Revoke Reason
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {items.map((item) => (
              <TableRow
                key={`${item.roleId}-${item.assignedAt}`}
                hover
              >
                <TableCell>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                  >
                    {item.roleName}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {item.assignedAt}
                  </Typography>
                </TableCell>

                <TableCell>
                  {item.isRevoked ? (
                    <Chip
                      size="small"
                      color="error"
                      label="Revoked"
                    />
                  ) : (
                    <Chip
                      size="small"
                      color="success"
                      label="Active"
                    />
                  )}
                </TableCell>

                <TableCell>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {item.revokedAt ?? "-"}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {item.revokeReason ??
                      "-"}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Stack>
    </Drawer>
  );
}