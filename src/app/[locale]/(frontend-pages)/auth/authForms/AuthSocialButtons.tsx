"use client";
import CustomSocialButton from "@/app/components/forms/theme-elements/CustomSocialButton";
import { Stack } from "@mui/system";
import { Avatar } from "@mui/material";
import { useI18nNs } from "@/app/context/i18nContext";

const AuthSocialButtons = () => {
  const { t } = useI18nNs(["auth"]);

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
};

export default AuthSocialButtons;
