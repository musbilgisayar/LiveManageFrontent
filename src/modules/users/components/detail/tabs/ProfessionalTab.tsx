"use client";

import { AdminUserDetailDto } from "../../../types/UserDetail.types";
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

export default function ProfessionalTab({ data, locale, t }: Props) {
  return (
    <UserDetailSectionGrid>
      <UserDetailCard title={t("users:detail.cards.professionalInfo")}>
        <UserDetailField
          label={t("users:detail.fields.jobTitle")}
          value={formatNullable(data.profile.jobTitle)}
        />
        <UserDetailField
          label={t("users:detail.fields.companyName")}
          value={formatNullable(data.profile.companyName)}
        />
        <UserDetailField
          label={t("users:detail.fields.department")}
          value={formatNullable(data.profile.department)}
        />
      </UserDetailCard>

      <UserDetailCard title={t("users:detail.cards.profileSummary")}>
        <UserDetailField
          label={t("users:detail.fields.dateOfBirth")}
          value={formatDateTime(data.profile.dateOfBirth, locale)}
        />
        <UserDetailField
          label={t("users:detail.fields.gender")}
          value={formatNullable(data.profile.gender)}
        />
        <UserDetailField
          label={t("users:detail.fields.professionalSummary")}
          value={formatNullable(data.profile.professionalSummary)}
        />
      </UserDetailCard>

      <UserDetailCard title={t("users:detail.cards.systemContext")}>
        <UserDetailField
          label={t("users:detail.fields.tenantId")}
          value={formatNullable(data.profile.tenantId)}
        />
      </UserDetailCard>
    </UserDetailSectionGrid>
  );
}