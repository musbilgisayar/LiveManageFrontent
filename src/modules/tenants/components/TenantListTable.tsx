// src/modules/tenants/components/TenantListTable.tsx

"use client";

import {
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";

import { IconEye, IconRefresh } from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";

import TenantStatusChip from "./TenantStatusChip";

import type { TenantListItemDto } from "../types/Tenant.types";

type TenantListTableProps = {
  tenants: TenantListItemDto[];
  loading?: boolean;
  onView?: (tenant: TenantListItemDto) => void;
  onRefresh?: () => void;
};

export default function TenantListTable({
  tenants,
  loading = false,
  onView,
  onRefresh,
}: TenantListTableProps) {
  const { t } = useI18nNs("tenants");

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        px={3}
        py={2}
      >
        <Typography variant="h6" fontWeight={700}>
          {t("tenants:title")}
        </Typography>

        {onRefresh ? (
          <Tooltip title={t("tenants:actions.refresh")}>
            <IconButton onClick={onRefresh}>
              <IconRefresh size={18} />
            </IconButton>
          </Tooltip>
        ) : null}
      </Stack>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t("tenants:fields.name")}</TableCell>
              <TableCell>{t("tenants:fields.key")}</TableCell>
              <TableCell>{t("tenants:fields.defaultCulture")}</TableCell>
              <TableCell>{t("tenants:fields.timeZone")}</TableCell>
              <TableCell>{t("tenants:fields.status")}</TableCell>
              <TableCell>{t("tenants:fields.createdAt")}</TableCell>
              <TableCell align="right">
                {t("common:actions")}
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Box py={5}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : tenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Box py={5}>
                    <Typography variant="body2" color="text.secondary">
                      {t("tenants:messages.noData")}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              tenants.map((tenant) => (
                <TableRow key={tenant.id} hover>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography fontWeight={600}>
                        {tenant.name}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        {tenant.id}
                      </Typography>
                    </Stack>
                  </TableCell>

                  <TableCell>{tenant.key}</TableCell>

                  <TableCell>{tenant.defaultCulture || "-"}</TableCell>

                  <TableCell>{tenant.timeZone || "-"}</TableCell>

                  <TableCell>
                    <TenantStatusChip isActive={tenant.isActive} />
                  </TableCell>

                  <TableCell>
                    {new Date(tenant.createdAt).toLocaleString()}
                  </TableCell>

                  <TableCell align="right">
                    {onView ? (
                      <Tooltip title={t("tenants:actions.detail")}>
                        <IconButton onClick={() => onView(tenant)}>
                          <IconEye size={18} />
                        </IconButton>
                      </Tooltip>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}