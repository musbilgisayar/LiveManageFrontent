"use client";

import { Grid, Stack } from "@mui/material";

import { useI18nNs } from "@/app/context/i18nContext";
import type { AdminUserDetailDto } from "../../../types/UserDetail.types";
import AddressManagerCard from "../cards/AddressManagerCard";
import EmailManagerCard from "../cards/EmailManagerCard";
import SocialMediaManagerCard from "../cards/SocialMedia/SocialMediaManagerCard";
import PhoneManagerCard_ultimate from "@/modules/users/components/detail/tabs/phone-manager/PhoneManagerCard_ultimate";

type Props = {
  user: AdminUserDetailDto;
};

export default function ContactTab({ user }: Props) {
  const { t } = useI18nNs(["users", "common"]);

  const tr = (key: string, fallback: string) => {
    const value = t(key);
    return value === `[${key}]` ? fallback : value;
  };

  return (
    <Stack spacing={3}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <PhoneManagerCard_ultimate userId={user.identity.id} />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <EmailManagerCard user={user} />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <AddressManagerCard userId={user.identity.id} />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <SocialMediaManagerCard
            ownerType="User"
            ownerId={user.identity.id}
            title={tr(
              "users:detail.cards.socialMediaAccounts",
              "Sosyal medya hesapları"
            )}
            canEdit
          />
        </Grid>
      </Grid>
    </Stack>
  );
}