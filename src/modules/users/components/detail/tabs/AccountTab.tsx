"use client";

import { AdminUserDetailDto } from "@/modules/users/types/UserDetail.types";
import UserDetailCard from "../cards/UserDetailCard";
import UserDetailField from "../UserDetailField";
import UserDetailSectionGrid from "../UserDetailSectionGrid";
import {
  formatDateTime,
  formatNullable,
} from "../../../utils/userDetail.formatters";
import { UserDetailTFunction } from "@/modules/users/types/userDetail.ui.types";

type Props = {
  data: AdminUserDetailDto;
  locale: string;
  t: UserDetailTFunction;
};

export default function AccountTab({ data, locale, t }: Props) {
  const basicFields = [
    { label: t("users:detail.fields.id"), value: formatNullable(data.identity.id) },
    {
      label: t("users:detail.fields.userName"),
      value: formatNullable(data.identity.userName),
    },
    {
      label: t("users:detail.fields.normalizedUserName"),
      value: formatNullable(data.identity.normalizedUserName),
    },
    {
      label: t("users:detail.fields.firstName"),
      value: formatNullable(data.identity.firstName),
    },
    {
      label: t("users:detail.fields.lastName"),
      value: formatNullable(data.identity.lastName),
    },
    {
      label: t("users:detail.fields.middleName"),
      value: formatNullable(data.identity.middleName),
    },
    {
      label: t("users:detail.fields.fullName"),
      value: formatNullable(data.identity.fullName),
    },
  ];

  const changeFields = [
    {
      label: t("users:detail.fields.isVerified"),
      value: data.identity.isVerified ? t("common:yes") : t("common:no"),
    },
    {
      label: t("users:detail.fields.isSuspended"),
      value: data.identity.isSuspended ? t("common:yes") : t("common:no"),
    },
    {
      label: t("users:detail.fields.suspensionReason"),
      value: formatNullable(data.identity.suspensionReason),
    },
    {
      label: t("users:detail.fields.createdAt"),
      value: formatDateTime(data.audit.createdAt, locale),
    },
    {
      label: t("users:detail.fields.updatedAt"),
      value: formatDateTime(data.audit.updatedAt, locale),
    },
  ];

  return (
    <UserDetailSectionGrid>
      <UserDetailCard title={t("users:detail.cards.basicAccountInfo")}>
        {basicFields.map((field) => (
          <UserDetailField
            key={field.label}
            label={field.label}
            value={field.value}
          />
        ))}
      </UserDetailCard>

      <UserDetailCard title={t("users:detail.cards.accountChangeInfo")}>
        {changeFields.map((field) => (
          <UserDetailField
            key={field.label}
            label={field.label}
            value={field.value}
          />
        ))}
      </UserDetailCard>
    </UserDetailSectionGrid>
  );
}