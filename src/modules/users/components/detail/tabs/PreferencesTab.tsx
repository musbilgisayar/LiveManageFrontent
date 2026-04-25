"use client";

import { AdminUserDetailDto } from "../../../types/UserDetail.types";
import UserDetailCard from "../cards/UserDetailCard";
import UserDetailField from "../UserDetailField";
import UserDetailSectionGrid from "../UserDetailSectionGrid";
import { formatNullable } from "../../../utils/userDetail.formatters";

import UserLanguageCard from "../cards/UserLanguageCard";
import UserTimeZoneCard from "../cards/UserTimeZoneCard";
import UserVisibilityCard from "../cards/UserVisibilityCard";
import UserCurrencyCard from "../cards/UserCurrencyCard";

type UserDetailTFunction = (key: string) => string;

type Props = {
  data: AdminUserDetailDto;
  t: UserDetailTFunction;
};

export default function PreferencesTab({ data, t }: Props) {
  return (
    <UserDetailSectionGrid>

      {/* 🧠 Yönetim kartları */}
      <UserLanguageCard
        currentCultureCode={data.preferences.cultureCode}
      />

      <UserTimeZoneCard
        currentTimeZone={data.preferences.timeZone}
      />

      <UserCurrencyCard
        currentCurrency={data.preferences.preferredCurrency}
      />

      <UserVisibilityCard
        currentIsPublic={data.preferences.isPublic}
        currentVisibilityLevel={data.preferences.visibilityLevel}
      />

 
    </UserDetailSectionGrid>
  );
}