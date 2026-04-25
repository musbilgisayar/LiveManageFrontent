// src/modules/users/components/detail/tabs/UserIdentityTab.tsx
"use client";

import * as React from "react";
import { Alert, Button, Chip, Collapse, Grid, Stack } from "@mui/material";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import AlternateEmailOutlinedIcon from "@mui/icons-material/AlternateEmailOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";

import { useI18nNs } from "@/app/context/i18nContext";
import type { AdminUserDetailDto } from "../../../types/UserDetail.types";
import {
  setAdminUsername,
  updateSuperAdminUser,
} from "../../../services/superAdminUsers.service";
import UserInfoCard from "../cards/UserInfoCard";
import EditableUserInfoCard, {
  EditableUserInfoField,
} from "../cards/EditableUserInfoCard";
import UsernameChangeCard from "../cards/UsernameChangeCard";

type Props = {
  user: AdminUserDetailDto;
  onUpdated?: () => Promise<void> | void;
};

function fallbackText(value?: string | null) {
  return value?.trim() ? value : "—";
}

export default function UserIdentityTab({ user, onUpdated }: Props) {
  const { t } = useI18nNs(["users", "common"]);

  const tr = React.useCallback(
    (key: string, fallback: string) => {
      const value = t(key);
      return value === `[${key}]` ? fallback : value;
    },
    [t]
  );

  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [isUserNameSaving, setIsUserNameSaving] = React.useState(false);
  const [userNameError, setUserNameError] = React.useState<string | null>(null);
  const [isUserNameOpen, setIsUserNameOpen] = React.useState(false);

  const handleUserNameToggle = () => {
    setUserNameError(null);
    setIsUserNameOpen((prev) => !prev);
  };

  const handleUserNameSubmit = async (nextUserName: string) => {
    try {
      setIsUserNameSaving(true);
      setUserNameError(null);

      const trimmedCurrent = (user.identity.userName ?? "").trim();
      const trimmedNext = (nextUserName ?? "").trim();

      if (!trimmedNext) {
        throw new Error(
          tr(
            "users:detail.usernameChange.validation.required",
            "Yeni kullanıcı adı zorunludur."
          )
        );
      }

      if (trimmedCurrent.toLowerCase() === trimmedNext.toLowerCase()) {
        throw new Error(
          tr(
            "users:detail.usernameChange.validation.sameValue",
            "Yeni kullanıcı adı mevcut değerle aynı olamaz."
          )
        );
      }

      const response = await setAdminUsername(user.identity.id, {
        userName: trimmedNext,
        reason: tr(
          "users:detail.usernameChange.adminReason",
          "Admin username güncellemesi"
        ),
        overrideCooldown: true,
      });

      if (response?.ok === false) {
        throw new Error(
          response.userMessage ||
            response.message ||
            tr(
              "users:detail.usernameChange.error",
              "Kullanıcı adı güncellenirken bir hata oluştu."
            )
        );
      }

      setIsUserNameOpen(false);
      await onUpdated?.();
      return response;
    } catch (err: any) {
      const message =
        err?.message ??
        tr(
          "users:detail.usernameChange.error",
          "Kullanıcı adı güncellenirken bir hata oluştu."
        );

      setUserNameError(message);
      throw new Error(message);
    } finally {
      setIsUserNameSaving(false);
    }
  };

  const identityFields: EditableUserInfoField[] = [
    {
      key: "firstName",
      label: t("users:detail.overview.fields.firstName"),
      value: fallbackText(user.identity.firstName),
      editable: true,
      icon: <PersonOutlineOutlinedIcon fontSize="small" />,
    },
    {
      key: "lastName",
      label: t("users:detail.overview.fields.lastName"),
      value: fallbackText(user.identity.lastName),
      editable: true,
      icon: <PersonOutlineOutlinedIcon fontSize="small" />,
    },
    {
      key: "middleName",
      label: t("users:detail.overview.fields.middleName"),
      value: fallbackText(user.identity.middleName),
      editable: true,
      icon: <PersonOutlineOutlinedIcon fontSize="small" />,
    },
    {
      key: "userName",
      label: t("users:detail.overview.fields.userName"),
      value: fallbackText(user.identity.userName),
      editable: false,
      icon: <AlternateEmailOutlinedIcon fontSize="small" />,
      action: !isEditing ? (
        <Button
          variant="outlined"
          size="small"
          startIcon={<ManageAccountsOutlinedIcon fontSize="small" />}
          onClick={handleUserNameToggle}
          sx={{
            borderRadius: 999,
            textTransform: "none",
            fontWeight: 700,
            minWidth: 0,
            px: 1.5,
            whiteSpace: "nowrap",
          }}
        >
          {isUserNameOpen
            ? tr("common:close", "Kapat")
            : tr("users:detail.usernameChange.shortAction", "Güncelle")}
        </Button>
      ) : null,
    },
  ];

  const verifiedLabel = user.identity.isVerified
    ? t("users:detail.status.verified")
    : t("users:detail.status.notVerified");

  const suspendedLabel = user.identity.isSuspended
    ? t("users:detail.status.suspended")
    : t("users:detail.status.notSuspended");

  const verificationSecurityItems = [
    {
      label: t("users:detail.overview.fields.verificationStatus"),
      icon: <VerifiedUserOutlinedIcon fontSize="small" />,
      value: (
        <Chip
          label={verifiedLabel}
          color={user.identity.isVerified ? "info" : "default"}
          size="small"
        />
      ),
    },
    {
      label: t("users:detail.overview.fields.suspensionStatus"),
      icon: <BlockOutlinedIcon fontSize="small" />,
      value: (
        <Chip
          label={suspendedLabel}
          color={user.identity.isSuspended ? "warning" : "success"}
          size="small"
        />
      ),
    },
    {
      label: t("users:detail.overview.fields.suspensionReason"),
      icon: <InfoOutlinedIcon fontSize="small" />,
      value: fallbackText(user.identity.suspensionReason),
    },
  ];

  const handleSave = async (form: Record<string, string>) => {
    try {
      setIsSaving(true);
      setError(null);

      const payload: Record<string, string> = {};

      if ((user.identity.firstName ?? "") !== (form.firstName ?? "")) {
        payload.firstName = form.firstName ?? "";
      }

      if ((user.identity.lastName ?? "") !== (form.lastName ?? "")) {
        payload.lastName = form.lastName ?? "";
      }

      if ((user.identity.middleName ?? "") !== (form.middleName ?? "")) {
        payload.middleName = form.middleName ?? "";
      }

      if (Object.keys(payload).length === 0) {
        setIsEditing(false);
        return;
      }

      await updateSuperAdminUser(user.identity.id, payload);

      setIsEditing(false);
      await onUpdated?.();
    } catch (err: any) {
      setError(err?.message ?? tr("common:error", "Bir hata oluştu."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Stack spacing={3}>
      {userNameError && <Alert severity="error">{userNameError}</Alert>}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Stack spacing={2}>
            <EditableUserInfoCard
              title={t("users:detail.tabs.identity")}
              icon={<PersonOutlineOutlinedIcon fontSize="small" />}
              fields={identityFields}
              isEditing={isEditing}
              isSaving={isSaving}
              error={error}
              editLabel={t("common:edit")}
              cancelLabel={t("common:cancel")}
              saveLabel={t("common:save")}
              onEdit={() => setIsEditing(true)}
              onCancel={() => {
                setIsEditing(false);
                setError(null);
              }}
              onSave={handleSave}
            />

            <Collapse in={isUserNameOpen} timeout="auto" unmountOnExit>
              <UsernameChangeCard
                userId={user.identity.id}
                currentUserName={user.identity.userName ?? ""}
                normalizedUserName={user.identity.normalizedUserName ?? ""}
                isLoading={isUserNameSaving}
                onSubmit={handleUserNameSubmit}
                onReload={() => {
                  void onUpdated?.();
                }}
              />
            </Collapse>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <UserInfoCard
            title={t("users:detail.overview.cards.verificationSecurity")}
            icon={<VerifiedUserOutlinedIcon fontSize="small" />}
            items={verificationSecurityItems}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}