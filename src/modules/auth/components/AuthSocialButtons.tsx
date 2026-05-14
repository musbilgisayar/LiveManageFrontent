// src/modules/auth/components/AuthSocialButtons.tsx

"use client";

import { Avatar } from "@mui/material";
import { Stack } from "@mui/system";

import CustomSocialButton from "@/app/components/forms/theme-elements/CustomSocialButton";

export default function AuthSocialButtons() {
  return (
    <Stack direction="row" justifyContent="center" spacing={2} mt={3}>
      <CustomSocialButton>
        <Avatar
          src="/images/svgs/google-icon.svg"
          alt="Google"
          sx={{ width: 20, height: 20, mr: 1 }}
        />
        Google
      </CustomSocialButton>

      <CustomSocialButton>
        <Avatar
          src="/images/svgs/facebook-icon.svg"
          alt="Facebook"
          sx={{ width: 20, height: 20, mr: 1 }}
        />
        Facebook
      </CustomSocialButton>
    </Stack>
  );
}