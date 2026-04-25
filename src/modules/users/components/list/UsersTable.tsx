//src/modules/users/components/list/UsersTable.tsx
"use client";

import Link from "next/link";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useI18nNs } from "@/app/context/i18nContext";
import { useSuperAdminUsers } from "../../hooks/useSuperAdminUsers";

type Props = {
  locale: string;
};

export default function UsersTable({ locale }: Props) {
  const { t } = useI18nNs(["users", "common"]);

  const tr = (key: string, fallback: string) => {
    const value = t(key);
    return value === `[${key}]` ? fallback : value;
  };

  const { users, isLoading, error } = useSuperAdminUsers({
    pageNumber: 1,
    pageSize: 20,
    search: "",
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error.message || tr("common:error", "Bir hata oluştu.")}
      </Alert>
    );
  }

  if (!Array.isArray(users) || users.length === 0) {
    return (
      <Alert severity="info">
        {tr("users:list.empty", "Gösterilecek kullanıcı bulunamadı.")}
      </Alert>
    );
  }

  return (
    <Paper elevation={0}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{tr("users:list.columns.fullName", "Ad Soyad")}</TableCell>
            <TableCell>{tr("users:list.columns.userName", "Kullanıcı Adı")}</TableCell>
            <TableCell>{tr("users:list.columns.email", "E-posta")}</TableCell>
            <TableCell>{tr("users:list.columns.phoneNumber", "Telefon")}</TableCell>
            <TableCell>{tr("users:list.columns.status", "Durum")}</TableCell>
            <TableCell>{tr("users:list.columns.roles", "Roller")}</TableCell>
            <TableCell align="right">{tr("common:actions", "İşlemler")}</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {users.map((user) => {
            const fullName =
              user.fullName?.trim() ||
              `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
              "-";

            return (
              <TableRow key={user.id} hover>
                <TableCell>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle2">{fullName}</Typography>
                  </Stack>
                </TableCell>

                <TableCell>{user.userName || "-"}</TableCell>
                <TableCell>{user.email || "-"}</TableCell>
                <TableCell>{user.phoneNumber || "-"}</TableCell>

                <TableCell>
                  <Chip
                    size="small"
                    label={
                      user.isActive
                        ? tr("users:status.active", "Aktif")
                        : tr("users:status.passive", "Pasif")
                    }
                    color={user.isActive ? "success" : "default"}
                  />
                </TableCell>

                <TableCell>{user.roles?.join(", ") || "-"}</TableCell>

                <TableCell align="right">
                  <Link href={`/${locale}/superadmin/users/${user.id}`}>
                    {tr("common:detail", "Detay")}
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  );
}