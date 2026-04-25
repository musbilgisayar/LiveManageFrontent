"use client";

import { AdminUserDetailDto } from "@/modules/users/types/UserDetail.types";

import UserDetailCard from "../cards/UserDetailCard";
import UserDetailField from "../UserDetailField";
import UserDetailSectionGrid from "../UserDetailSectionGrid";
import { formatDateTime } from "../../../utils/userDetail.formatters";

type UserDetailTFunction = (key: string) => string;

type Props = {
  data: AdminUserDetailDto;
  locale: string;
  t: UserDetailTFunction;
};

export default function VerificationTab({ data, locale, t }: Props) {
  return (
    <UserDetailSectionGrid>
      <UserDetailCard title={t("users:detail.cards.verificationStatus")}>
        <UserDetailField
          label={t("users:detail.fields.isEmailConfirmed")}
          value={data.verification.isEmailConfirmed ? t("common:yes") : t("common:no")}
        />
        <UserDetailField
          label={t("users:detail.fields.isPhoneConfirmed")}
          value={data.verification.isPhoneConfirmed ? t("common:yes") : t("common:no")}
        />
        <UserDetailField
          label={t("users:detail.fields.isVerified")}
          value={data.verification.isVerified ? t("common:yes") : t("common:no")}
        />
      </UserDetailCard>

      <UserDetailCard title={t("users:detail.cards.verificationTimeline")}>
        <UserDetailField
          label={t("users:detail.fields.emailConfirmedAt")}
          value={formatDateTime(data.verification.emailConfirmedAt, locale)}
        />
        <UserDetailField
          label={t("users:detail.fields.phoneConfirmedAt")}
          value={formatDateTime(data.verification.phoneConfirmedAt, locale)}
        />
      </UserDetailCard>
    </UserDetailSectionGrid>
  );
}