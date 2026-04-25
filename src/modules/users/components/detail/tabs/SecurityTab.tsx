// src/modules/users/components/detail/tabs/SecurityTab.tsx
"use client";

import * as React from "react";
import { Chip, Grid, Stack } from "@mui/material";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import WifiOutlinedIcon from "@mui/icons-material/WifiOutlined";
import PasswordOutlinedIcon from "@mui/icons-material/PasswordOutlined";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import type { AdminUserDetailDto } from "../../../types/UserDetail.types";
import { canSeeSensitiveState } from "../../../config/userDetailVisibility.config";
import UserInfoCard from "../cards/UserInfoCard";
import {
  formatDateTime,
  formatNullable,
} from "../../../utils/userDetail.formatters";

type UserDetailTFunction = (key: string) => string;

type Props = {
  data: AdminUserDetailDto;
  locale: string;
  t: UserDetailTFunction;
  role: Parameters<typeof canSeeSensitiveState>[0];
};

function boolText(value: boolean | null | undefined, t: UserDetailTFunction) {
  if (value == null) return "—";
  return value ? t("common:yes") : t("common:no");
}

export default function SecurityTab({ data, locale, t, role }: Props) {
  const canSeeSensitive = canSeeSensitiveState(role);

  const loginSecurityItems = [
    {
      label: t("users:detail.fields.twoFactorEnabled"),
      value: boolText(data.security?.twoFactorEnabled, t),
      icon: <SecurityOutlinedIcon fontSize="small" />,
    },
    {
      label: t("users:detail.fields.lockoutEnabled"),
      value: boolText(data.security?.lockoutEnabled, t),
      icon: <LockOutlinedIcon fontSize="small" />,
    },
    {
      label: t("users:detail.fields.lockoutEnd"),
      value: formatDateTime(data.security?.lockoutEnd, locale),
      icon: <EventOutlinedIcon fontSize="small" />,
    },
    {
      label: t("users:detail.fields.accessFailedCount"),
      value: String(data.security?.accessFailedCount ?? 0),
      icon: <InfoOutlinedIcon fontSize="small" />,
    },
    {
      label: t("users:detail.fields.lastLoginDate"),
      value: formatDateTime(data.security?.lastLoginDate, locale),
      icon: <EventOutlinedIcon fontSize="small" />,
    },
    {
      label: t("users:detail.fields.lastKnownIp"),
      value: formatNullable(data.security?.lastKnownIp),
      icon: <WifiOutlinedIcon fontSize="small" />,
    },
  ];

  const securityMetaItems = [
    {
      label: t("users:detail.fields.passwordAlgorithm"),
      value: formatNullable(data.security?.passwordAlgorithm),
      icon: <PasswordOutlinedIcon fontSize="small" />,
    },
    {
      label: t("users:detail.fields.hasPasswordHash"),
      value: boolText(data.security?.hasPassword, t),
      icon: <PasswordOutlinedIcon fontSize="small" />,
    },
    {
      label: t("users:detail.fields.hasPasswordSalt"),
      value: boolText(data.security?.hasSalt, t),
      icon: <KeyOutlinedIcon fontSize="small" />,
    },
    {
      label: t("users:detail.fields.hasAuthenticatorKey"),
      value: boolText(data.security?.isAuthenticatorConfigured, t),
      icon: <KeyOutlinedIcon fontSize="small" />,
    },
    {
      label: t("users:detail.fields.securityVisibility"),
      value: (
        <Chip
          label={
            canSeeSensitive
              ? t("users:detail.values.superadminRestricted")
              : t("users:detail.values.limited")
          }
          color={canSeeSensitive ? "info" : "default"}
          size="small"
        />
      ),
      icon: <VisibilityOutlinedIcon fontSize="small" />,
    },
  ];

  const riskStatusItems = [
    {
      label: t("users:detail.fields.isSuspended"),
      value: (
        <Chip
          label={
            data.security?.isSuspended
              ? t("users:detail.status.suspended")
              : t("users:detail.status.notSuspended")
          }
          color={data.security?.isSuspended ? "warning" : "success"}
          size="small"
        />
      ),
      icon: <BlockOutlinedIcon fontSize="small" />,
    },
    {
      label: t("users:detail.fields.suspensionReason"),
      value: formatNullable(data.security?.suspensionReason),
      icon: <ReportProblemOutlinedIcon fontSize="small" />,
    },
  ];

  return (
    <Stack spacing={3}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <UserInfoCard
            title={t("users:detail.cards.loginSecurity")}
            icon={<SecurityOutlinedIcon fontSize="small" />}
            items={loginSecurityItems}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <UserInfoCard
            title={t("users:detail.cards.securityMeta")}
            icon={<KeyOutlinedIcon fontSize="small" />}
            items={securityMetaItems}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <UserInfoCard
            title={t("users:detail.cards.riskStatus")}
            icon={<ReportProblemOutlinedIcon fontSize="small" />}
            items={riskStatusItems}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}