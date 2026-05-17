//src/modules/users/components/detail/UserDetailHeader.tsx
"use client";

import { Avatar, Chip, Paper, Stack, Typography } from "@mui/material";
import { AdminUserDetailDto } from "../../types/UserDetail.types";
import type { UserDetailMode } from "../../config/userDetailTabs.config";

type Props = {
  user: AdminUserDetailDto;
  locale: string;
  t: (key: string, vars?: Record<string, string | number>) => string;
  mode: UserDetailMode;
};

export default function UserDetailHeader({ user, locale, t, mode }: Props) {
  const tr = (key: string, fallback: string) => {
    const value = t(key);
    return value === `[${key}]` ? fallback : value;
  };

  const identity = user.identity ?? ({} as AdminUserDetailDto["identity"]);
  const contact = user.contact ?? ({} as AdminUserDetailDto["contact"]);
  const verification = user.verification ?? ({} as AdminUserDetailDto["verification"]);
  const security = user.security ?? ({} as AdminUserDetailDto["security"]);
  const audit = user.audit ?? ({} as AdminUserDetailDto["audit"]);

  const displayName =
    identity.fullName ||
    [identity.firstName, identity.lastName].filter(Boolean).join(" ").trim() ||
    identity.userName ||
    "—";

  const userName = identity.userName || "—";
  const email = contact.email || "—";

  const isActive = !identity.isSuspended && !audit.isDeleted;
  const isVerified = !!verification.isEmailConfirmed;
  const isSuspended = !!identity.isSuspended || !!security.isSuspended;

  const formatDateTime = (value?: string | null) => {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat(locale || "tr-TR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar alt={displayName} sx={{ width: 64, height: 64 }}>
            {displayName?.charAt(0)?.toUpperCase() || "U"}
          </Avatar>

          <Stack spacing={0.5}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {displayName}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {userName}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {email}
            </Typography>
          </Stack>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Chip
            label={
              isActive
                ? tr("users:detail.status.active", "Aktif")
                : tr("users:detail.status.inactive", "Pasif")
            }
            color={isActive ? "success" : "default"}
            variant="outlined"
          />

          <Chip
            label={
              isVerified
                ? tr("users:detail.status.verified", "Doğrulandı")
                : tr("users:detail.status.notVerified", "Doğrulanmadı")
            }
            color={isVerified ? "success" : "warning"}
            variant="outlined"
          />

          <Chip
            label={
              isSuspended
                ? tr("users:detail.status.suspended", "Askıda")
                : tr("users:detail.status.notSuspended", "Askıda Değil")
            }
            color={isSuspended ? "error" : "success"}
            variant="outlined"
          />
        </Stack>
      </Stack>

      {mode === "admin" && (
      <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ mt: 3 }}>
        <Stack spacing={0.5}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
            {tr("users:detail.header.emailConfirmedAt", "E-posta Doğrulama")}
          </Typography>
          <Typography variant="body2">
              {formatDateTime(verification.emailConfirmedAt)}
          </Typography>
        </Stack>

        <Stack spacing={0.5}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
            {tr("users:detail.header.createdAt", "Oluşturulma")}
          </Typography>
          <Typography variant="body2">
              {formatDateTime(audit.createdAt)}
          </Typography>
        </Stack>

        <Stack spacing={0.5}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
            {tr("users:detail.header.updatedAt", "Güncellenme")}
          </Typography>
          <Typography variant="body2">
              {formatDateTime(audit.updatedAt)}
          </Typography>
        </Stack>
      </Stack>
      )}
    </Paper>
  );
}
