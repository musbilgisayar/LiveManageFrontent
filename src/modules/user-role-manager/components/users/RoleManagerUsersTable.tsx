"use client";

import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";

import {
  IconChevronLeft,
  IconChevronRight,
  IconHistory,
  IconShield,
} from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";

import type {
  PagedResult,
  RoleManagerUserListItemDto,
} from "../../types/RoleManager.types";

import RoleManagerPanel from "../shared/RoleManagerPanel";

type RoleManagerUsersTableProps = {
  users: RoleManagerUserListItemDto[];
  pagination?: PagedResult<RoleManagerUserListItemDto> | null;
  pageNumber?: number;
  pageSize?: number;
  isLoading?: boolean;
  onPageChange?: (pageNumber: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onHistoryClick?: (user: RoleManagerUserListItemDto) => void;
  onRolesClick?: (user: RoleManagerUserListItemDto) => void;
};

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getInitials(value?: string | null) {
  if (!value) return "?";

  return value
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default function RoleManagerUsersTable({
  users,
  pagination,
  pageNumber = 1,
  pageSize = 10,
  isLoading = false,
  onPageChange,
  onPageSizeChange,
  onHistoryClick,
  onRolesClick,
}: RoleManagerUsersTableProps) {
  const { t } = useI18nNs("userRoleManager");

  const totalCount = pagination?.totalCount ?? users.length;
  const totalPages = pagination?.totalPages ?? pageNumber;

  const canGoPrevious = pagination?.hasPreviousPage ?? pageNumber > 1;
  const canGoNext = pagination?.hasNextPage ?? users.length === pageSize;

  return (
    <RoleManagerPanel
      title={t("users.title")}
      subtitle={t("users.subtitle")}
    >
      <Box
        sx={{
          overflowX: "auto",
        }}
      >
        <Table
          size="small"
          sx={{
            minWidth: 980,

            "& th": {
              py: 1.35,
              fontSize: 12,
              fontWeight: 800,
              color: "text.secondary",
              bgcolor: "background.paper",
              borderBottom: "1px solid",
              borderColor: "divider",
              whiteSpace: "nowrap",
            },

            "& td": {
              py: 1.45,
              borderBottom: "1px solid",
              borderColor: "divider",
              verticalAlign: "middle",
            },

            "& tbody tr": {
              transition: "all .18s ease",
            },

            "& tbody tr:hover": {
              bgcolor: (theme) =>
                alpha(theme.palette.primary.main, 0.035),
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>{t("columns.user")}</TableCell>
              <TableCell>{t("columns.status")}</TableCell>
              <TableCell>{t("columns.activeRole")}</TableCell>
              <TableCell>{t("columns.lastRoleChange")}</TableCell>
              <TableCell align="right">{t("columns.actions")}</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Box
                    sx={{
                      py: 6,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={800}>
                      {isLoading ? t("users.loading") : t("users.empty")}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {isLoading ? "..." : "-"}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.userId} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1.6} alignItems="center">
                      <Avatar
                        sx={{
                          width: 44,
                          height: 44,
                          fontSize: 15,
                          fontWeight: 900,
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                          boxShadow: (theme) =>
                            `0 10px 26px ${alpha(
                              theme.palette.primary.main,
                              0.28,
                            )}`,
                        }}
                      >
                        {getInitials(user.fullName)}
                      </Avatar>

                      <Stack spacing={0.25} minWidth={0}>
                        <Typography
                          variant="subtitle2"
                          fontWeight={900}
                          noWrap
                        >
                          {user.fullName || "-"}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                        >
                          {user.emailMasked || "-"}
                        </Typography>

                        {user.userName && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                          >
                            @{user.userName}
                          </Typography>
                        )}
                      </Stack>
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Stack direction="row" spacing={0.8} flexWrap="wrap">
                      <Chip
                        size="small"
                        color={user.isVerified ? "success" : "warning"}
                        variant={user.isVerified ? "filled" : "outlined"}
                        label={
                          user.isVerified
                            ? t("badges.verified")
                            : t("badges.unverified")
                        }
                        sx={{
                          height: 24,
                          fontSize: 11,
                          fontWeight: 800,
                        }}
                      />

                      {user.isSuspended && (
                        <Chip
                          size="small"
                          color="error"
                          label={t("badges.suspended")}
                          sx={{
                            height: 24,
                            fontSize: 11,
                            fontWeight: 800,
                          }}
                        />
                      )}
                    </Stack>
                  </TableCell>

                  <TableCell>
                    {user.activeRoleName ? (
                      <Stack spacing={0.55} alignItems="flex-start">
                        <Chip
                          size="small"
                          color="primary"
                          label={user.activeRoleName}
                          sx={{
                            height: 25,
                            fontSize: 11.5,
                            fontWeight: 900,
                            maxWidth: 220,
                          }}
                        />

                        <Typography variant="caption" color="text.secondary">
                          {formatDate(user.activeRoleAssignedAt)}
                        </Typography>
                      </Stack>
                    ) : (
                      <Chip
                        size="small"
                        variant="outlined"
                        label={t("badges.noActiveRole")}
                        sx={{
                          height: 25,
                          fontSize: 11.5,
                          fontWeight: 800,
                        }}
                      />
                    )}
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(user.lastRoleChangedAt)}
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title={t("tooltips.roleHistory")}>
                        <span>
                          <IconButton
                            size="small"
                            disabled={isLoading}
                            onClick={() => onHistoryClick?.(user)}
                            sx={{
                              border: "1px solid",
                              borderColor: "divider",
                              bgcolor: "background.paper",
                              transition: "all .18s ease",

                              "&:hover": {
                                bgcolor: "action.hover",
                                transform: "translateY(-1px)",
                              },
                            }}
                          >
                            <IconHistory size={18} />
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip title={t("tooltips.manageRoles")}>
                        <span>
                          <IconButton
                            size="small"
                            disabled={isLoading}
                            onClick={() => onRolesClick?.(user)}
                            sx={{
                              border: "1px solid",
                              borderColor: "divider",
                              bgcolor: "background.paper",
                              color: "primary.main",
                              transition: "all .18s ease",

                              "&:hover": {
                                bgcolor: (theme) =>
                                  alpha(theme.palette.primary.main, 0.08),
                                transform: "translateY(-1px)",
                              },
                            }}
                          >
                            <IconShield size={18} />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>

      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={1.5}
        alignItems={{
          xs: "stretch",
          sm: "center",
        }}
        justifyContent="space-between"
        sx={{
          pt: 2,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {totalCount} kayıt · Sayfa {pageNumber} / {totalPages || 1}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <Select
            size="small"
            value={pageSize}
            disabled={isLoading}
            onChange={(event) => {
              onPageSizeChange?.(Number(event.target.value));
              onPageChange?.(1);
            }}
            sx={{
              minWidth: 92,
              height: 34,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {[10, 20, 50].map((size) => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </Select>

          <Button
            size="small"
            variant="outlined"
            disabled={!canGoPrevious || isLoading}
            startIcon={<IconChevronLeft size={17} />}
            onClick={() => onPageChange?.(Math.max(1, pageNumber - 1))}
            sx={{
              fontWeight: 800,
            }}
          >
            Önceki
          </Button>

          <Button
            size="small"
            variant="contained"
            disabled={!canGoNext || isLoading}
            endIcon={<IconChevronRight size={17} />}
            onClick={() => onPageChange?.(pageNumber + 1)}
            sx={{
              fontWeight: 800,
              boxShadow: "none",
            }}
          >
            Sonraki
          </Button>
        </Stack>
      </Stack>
    </RoleManagerPanel>
  );
}