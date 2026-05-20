"use client";

import {
  Avatar,
  Chip,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  IconHistory,
  IconShield,
} from "@tabler/icons-react";

import type {
  RoleManagerUserListItemDto,
} from "../../types/RoleManager.types";

import RoleManagerPanel
  from "../shared/RoleManagerPanel";

type RoleManagerUsersTableProps = {
  users: RoleManagerUserListItemDto[];

  isLoading?: boolean;

  onHistoryClick?: (
    user: RoleManagerUserListItemDto,
  ) => void;

  onRolesClick?: (
    user: RoleManagerUserListItemDto,
  ) => void;
};

export default function RoleManagerUsersTable({
  users,
  onHistoryClick,
  onRolesClick,
}: RoleManagerUsersTableProps) {
  return (
    <RoleManagerPanel
      title="Users"
      subtitle="User role assignments and role visibility"
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>
              User
            </TableCell>

            <TableCell>
              Status
            </TableCell>

            <TableCell>
              Active Role
            </TableCell>

            <TableCell>
              Last Role Change
            </TableCell>

            <TableCell align="right">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user.userId}
              hover
            >
              <TableCell>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                >
                  <Avatar>
                    {user.fullName
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </Avatar>

                  <Stack spacing={0.5}>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                    >
                      {user.fullName}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {user.emailMasked}
                    </Typography>

                    {user.userName && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        @{user.userName}
                      </Typography>
                    )}
                  </Stack>
                </Stack>
              </TableCell>

              <TableCell>
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                >
                  {user.isVerified ? (
                    <Chip
                      size="small"
                      color="success"
                      label="Verified"
                    />
                  ) : (
                    <Chip
                      size="small"
                      color="warning"
                      label="Unverified"
                    />
                  )}

                  {user.isSuspended && (
                    <Chip
                      size="small"
                      color="error"
                      label="Suspended"
                    />
                  )}
                </Stack>
              </TableCell>

              <TableCell>
                {user.activeRoleName ? (
                  <Stack spacing={0.5}>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                    >
                      {user.activeRoleName}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {user.activeRoleAssignedAt}
                    </Typography>
                  </Stack>
                ) : (
                  <Chip
                    size="small"
                    label="No Active Role"
                  />
                )}
              </TableCell>

              <TableCell>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {user.lastRoleChangedAt ??
                    "-"}
                </Typography>
              </TableCell>

              <TableCell align="right">
                <Stack
                  direction="row"
                  spacing={1}
                  justifyContent="flex-end"
                >
                  <Tooltip title="Role History">
                    <IconButton
                      size="small"
                      onClick={() =>
                        onHistoryClick?.(user)
                      }
                    >
                      <IconHistory
                        size={18}
                      />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Manage Roles">
                    <IconButton
                      size="small"
                      onClick={() =>
                        onRolesClick?.(user)
                      }
                    >
                      <IconShield
                        size={18}
                      />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </RoleManagerPanel>
  );
}