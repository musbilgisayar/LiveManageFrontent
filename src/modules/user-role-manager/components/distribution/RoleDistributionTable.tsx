"use client";

import {
  Box,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { useI18nNs } from "@/app/context/i18nContext";

import type { RoleDistributionDto } from "../../types/RoleManager.types";

import RoleManagerPanel from "../shared/RoleManagerPanel";

type RoleDistributionTableProps = {
  items: RoleDistributionDto[];
  isLoading?: boolean;
};

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function RoleDistributionTable({
  items,
}: RoleDistributionTableProps) {
  const { t } = useI18nNs("userRoleManager");

  const resolveLabel = (value?: string | null) => {
    if (!value) return "-";

    if (value.includes(":") || value.includes(".")) {
      return t(value);
    }

    return value;
  };

  return (
    <RoleManagerPanel
      title={t("distribution.title")}
      subtitle={t("distribution.subtitle")}
    >
      <Box
        sx={{
          maxHeight: 260,
          overflow: "auto",
        }}
      >
        <Table
          size="small"
          stickyHeader
          sx={{
            "& th": {
              py: 1,
              fontSize: 12,
              fontWeight: 700,
              bgcolor: "background.paper",
            },
            "& td": {
              py: 0.9,
              fontSize: 13,
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>{t("columns.role")}</TableCell>
              <TableCell>{t("columns.category")}</TableCell>
              <TableCell>{t("columns.sensitive")}</TableCell>
              <TableCell align="right">
                {t("columns.activeUsers")}
              </TableCell>
              <TableCell>{t("columns.lastAssigned")}</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {items.map((item) => (
              <TableRow key={item.roleId} hover>
                <TableCell>
                  <Stack spacing={0.15}>
                    <Typography variant="body2" fontWeight={700}>
                      {item.roleName ?? "-"}
                    </Typography>

                    {item.description && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                        sx={{ maxWidth: 220 }}
                      >
                        {resolveLabel(item.description)}
                      </Typography>
                    )}
                  </Stack>
                </TableCell>

                <TableCell>
                  <Typography variant="body2">
                    {resolveLabel(item.category)}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Chip
                    size="small"
                    color={item.isSensitive ? "warning" : "default"}
                    label={
                      item.isSensitive
                        ? t("badges.sensitive")
                        : t("badges.normal")
                    }
                    sx={{
                      height: 22,
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  />
                </TableCell>

                <TableCell align="right">
                  <Typography variant="body2" fontWeight={700}>
                    {item.activeUserCount}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(item.lastAssignedAt)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </RoleManagerPanel>
  );
}