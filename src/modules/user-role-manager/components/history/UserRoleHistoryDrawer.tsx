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

import { useI18nNs }
  from "@/app/context/i18nContext";

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
  const { t } = useI18nNs("userRoleManager");

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
            {t("history.title")}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            {t("history.subtitle")}
          </Typography>
        </Stack>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                {t("columns.role")}
              </TableCell>

              <TableCell>
                {t("columns.assignedAt")}
              </TableCell>

              <TableCell>
                {t("columns.status")}
              </TableCell>

              <TableCell>
                {t("columns.revokedAt")}
              </TableCell>

              <TableCell>
                {t("columns.revokeReason")}
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
                      label={t("badges.revoked")}
                    />
                  ) : (
                    <Chip
                      size="small"
                      color="success"
                      label={t("badges.active")}
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
