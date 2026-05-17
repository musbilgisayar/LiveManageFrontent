"use client";

import { Alert, Grid, Stack } from "@mui/material";

import { useI18nNs } from "@/app/context/i18nContext";
import type { AdminUserDetailDto } from "../../../types/UserDetail.types";
import AddressManagerCard from "../cards/AddressManagerCard";
import EmailManagerCard from "../cards/EmailManagerCard";
import SocialMediaManagerCard from "../cards/SocialMedia/SocialMediaManagerCard";
import PhoneManagerCard_ultimate from "@/modules/users/components/detail/tabs/phone-manager/PhoneManagerCard_ultimate";

type Props = {
  user: AdminUserDetailDto;
  userId?: string;
};

export default function ContactTab({ user, userId }: Props) {
  const { t } = useI18nNs(["users", "common"]);
  const effectiveUserId = userId?.trim() || user.identity?.id?.trim() || "";

  const tr = (key: string, fallback: string) => {
    const value = t(key);
    return value === `[${key}]` ? fallback : value;
  };

  return (
    <Stack spacing={3}>
      {!effectiveUserId ? (
        <Alert severity="warning">
          {tr(
            "users:detail.errors.userIdRequired",
            "Kullanici bilgileri yuklenemedigi icin iletisim yoneticileri acilamiyor."
          )}
        </Alert>
      ) : null}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          {effectiveUserId ? (
            <PhoneManagerCard_ultimate userId={effectiveUserId} />
          ) : null}
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <EmailManagerCard user={user} />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          {effectiveUserId ? (
            <AddressManagerCard userId={effectiveUserId} />
          ) : null}
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          {effectiveUserId ? (
            <SocialMediaManagerCard
              ownerType="User"
              ownerId={effectiveUserId}
              title={tr(
                "users:detail.cards.socialMediaAccounts",
                "Sosyal medya hesaplari"
              )}
              canEdit
            />
          ) : null}
        </Grid>
      </Grid>
    </Stack>
  );
}
