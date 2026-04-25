"use client";

import * as React from "react";
import { Chip, Grid } from "@mui/material";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import AlternateEmailOutlinedIcon from "@mui/icons-material/AlternateEmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import WcOutlinedIcon from "@mui/icons-material/WcOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import TranslateOutlinedIcon from "@mui/icons-material/TranslateOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";

import { useI18nNs } from "@/app/context/i18nContext";
import UserInfoCard from "../cards/UserInfoCard";
import type {
  AdminUserDetailDto,
  RoleSummaryDto,
} from "@/modules/users/types/UserDetail.types";

type Props = {
  user: AdminUserDetailDto;
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function boolText(v?: boolean | null) {
  if (v == null) return "—";
  return v ? "Evet" : "Hayır";
}

export default function UserOverviewTab({ user }: Props) {
  const { t } = useI18nNs(["users", "common"]);

  const activeStatus = user.audit?.isDeleted
    ? t("users:detail.status.inactive")
    : t("users:detail.status.active");

  const verifiedStatus = user.verification?.isVerified
    ? t("users:detail.status.verified")
    : t("users:detail.status.notVerified");

  const suspendedStatus = user.security?.isSuspended
    ? t("users:detail.status.suspended")
    : t("users:detail.status.notSuspended");

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <UserInfoCard
          title={t("users:detail.overview.cards.identity")}
          items={[
            {
              label: "ID",
              value: user.identity?.id,
              icon: <BadgeOutlinedIcon fontSize="small" />,
            },
            {
              label: t("users:list.columns.fullName"),
              value: user.identity?.fullName,
              icon: <PersonOutlineOutlinedIcon fontSize="small" />,
            },
            {
              label: t("users:list.columns.userName"),
              value: user.identity?.userName,
              icon: <AlternateEmailOutlinedIcon fontSize="small" />,
            },
            {
              label: "First Name",
              value: user.identity?.firstName,
              icon: <PersonOutlineOutlinedIcon fontSize="small" />,
            },
            {
              label: "Last Name",
              value: user.identity?.lastName,
              icon: <PersonOutlineOutlinedIcon fontSize="small" />,
            },
          ]}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <UserInfoCard
          title={t("users:detail.tabs.contact")}
          items={[
            {
              label: t("users:list.columns.email"),
              value: user.contact?.email,
              icon: <AlternateEmailOutlinedIcon fontSize="small" />,
            },
            {
              label: t("users:list.columns.phoneNumber"),
              value: user.contact?.phoneNumber,
              icon: <PhoneOutlinedIcon fontSize="small" />,
            },
            {
              label: "Country Code",
              value: user.contact?.phoneCountryCode,
              icon: <PublicOutlinedIcon fontSize="small" />,
            },
            {
              label: "Secondary Phone",
              value: user.contact?.secondaryPhoneNumber,
              icon: <PhoneOutlinedIcon fontSize="small" />,
            },
          ]}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <UserInfoCard
          title={t("users:detail.tabs.identity")}
          items={[
            {
              label: "Birth Date",
              value: formatDate(user.profile?.dateOfBirth),
              icon: <EventOutlinedIcon fontSize="small" />,
            },
            {
              label: "Gender",
              value: user.profile?.gender,
              icon: <WcOutlinedIcon fontSize="small" />,
            },
            {
              label: "Job Title",
              value: user.profile?.jobTitle,
              icon: <WorkOutlineOutlinedIcon fontSize="small" />,
            },
            {
              label: "Company",
              value: user.profile?.companyName,
              icon: <ApartmentOutlinedIcon fontSize="small" />,
            },
            {
              label: "Department",
              value: user.profile?.department,
              icon: <ApartmentOutlinedIcon fontSize="small" />,
            },
          ]}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <UserInfoCard
          title={t("users:detail.tabs.security")}
          items={[
            {
              label: "Status",
              icon: <SecurityOutlinedIcon fontSize="small" />,
              value: (
                <Chip
                  label={activeStatus}
                  color={user.audit?.isDeleted ? "default" : "success"}
                  size="small"
                />
              ),
            },
            {
              label: "Verified",
              icon: <VerifiedUserOutlinedIcon fontSize="small" />,
              value: (
                <Chip
                  label={verifiedStatus}
                  color={user.verification?.isVerified ? "info" : "default"}
                  size="small"
                />
              ),
            },
            {
              label: "Suspended",
              icon: <BlockOutlinedIcon fontSize="small" />,
              value: (
                <Chip
                  label={suspendedStatus}
                  color={user.security?.isSuspended ? "warning" : "success"}
                  size="small"
                />
              ),
            },
            {
              label: "Email Confirmed",
              value: boolText(user.verification?.isEmailConfirmed),
              icon: <AlternateEmailOutlinedIcon fontSize="small" />,
            },
            {
              label: "Phone Confirmed",
              value: boolText(user.verification?.isPhoneConfirmed),
              icon: <PhoneOutlinedIcon fontSize="small" />,
            },
            {
              label: "2FA",
              value: boolText(user.security?.twoFactorEnabled),
              icon: <SecurityOutlinedIcon fontSize="small" />,
            },
          ]}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <UserInfoCard
          title="Preferences"
          items={[
            {
              label: "Culture",
              value: user.preferences?.cultureCode,
              icon: <TranslateOutlinedIcon fontSize="small" />,
            },
            {
              label: "Timezone",
              value: user.preferences?.timeZone,
              icon: <ScheduleOutlinedIcon fontSize="small" />,
            },
            {
              label: "Currency",
              value: user.preferences?.preferredCurrency,
              icon: <PaymentsOutlinedIcon fontSize="small" />,
            },
          ]}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <UserInfoCard
          title={t("users:detail.tabs.audit")}
          items={[
            {
              label: "Created",
              value: formatDate(user.audit?.createdAt),
              icon: <EventOutlinedIcon fontSize="small" />,
            },
            {
              label: "Updated",
              value: formatDate(user.audit?.updatedAt),
              icon: <EventOutlinedIcon fontSize="small" />,
            },
            {
              label: "Deleted",
              value: boolText(user.audit?.isDeleted),
              icon: <DeleteOutlineOutlinedIcon fontSize="small" />,
            },
          ]}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <UserInfoCard
          title={t("users:list.columns.roles")}
          items={[
            {
              label: "Roles",
              icon: <AdminPanelSettingsOutlinedIcon fontSize="small" />,
              value:
                user.roles?.length > 0
                  ? user.roles
                      .map((role: RoleSummaryDto) =>
                        `${role.roleName}${role.isActive ? "" : " (Pasif)"}`
                      )
                      .join(", ")
                  : "—",
            },
          ]}
        />
      </Grid>
    </Grid>
  );
}