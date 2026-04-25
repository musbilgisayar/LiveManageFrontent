"use client";

import { AdminUserDetailDto } from "../../../types/UserDetail.types";
import { canSeeLifecycleDetails } from "../../../config/userDetailVisibility.config";
import UserDetailCard from "../cards/UserDetailCard";
import UserDetailField from "../UserDetailField";
import UserDetailSectionGrid from "../UserDetailSectionGrid";
import {
  formatDateTime,
  formatNullable,
} from "../../../utils/userDetail.formatters";
import {
  UserDetailTFunction,
  UserDetailRole,
} from "@/modules/users/types/userDetail.ui.types";

type Props = {
  data: AdminUserDetailDto;
  locale: string;
  t: UserDetailTFunction;
  role: UserDetailRole;
};

export default function LifecycleTab({ data, locale, t, role }: Props) {
  if (!canSeeLifecycleDetails(role)) {
    return null;
  }

  return (
    <UserDetailSectionGrid>
      <UserDetailCard title={t("users:detail.cards.lifecycleInfo")}>
        <UserDetailField
          label={t("users:detail.fields.createdAt")}
          value={formatDateTime(data.audit.createdAt, locale)}
        />
        <UserDetailField
          label={t("users:detail.fields.updatedAt")}
          value={formatDateTime(data.audit.updatedAt, locale)}
        />
        <UserDetailField
          label={t("users:detail.fields.profileLastUpdatedAt")}
          value={formatDateTime(data.audit.lastUpdatedAt, locale)}
        />
      </UserDetailCard>

      <UserDetailCard title={t("users:detail.cards.deletionInfo")}>
        <UserDetailField
          label={t("users:detail.fields.isDeleted")}
          value={data.audit.isDeleted ? t("common:yes") : t("common:no")}
        />
        <UserDetailField
          label={t("users:detail.fields.deletedAt")}
          value={formatDateTime(data.audit.deletedAt, locale)}
        />
        <UserDetailField
          label={t("users:detail.fields.deletedByUserId")}
          value={formatNullable(data.audit.deletedByUserId)}
        />
        <UserDetailField
          label={t("users:detail.fields.deleteReason")}
          value={formatNullable(data.audit.deleteReason)}
        />
        <UserDetailField
          label={t("users:detail.fields.deletedBySource")}
          value={formatNullable(data.audit.deletedBySource)}
        />
      </UserDetailCard>
    </UserDetailSectionGrid>
  );
}