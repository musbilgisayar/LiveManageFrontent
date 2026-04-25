'use client'
import CustomSocialButton from "@/app/components/forms/theme-elements/CustomSocialButton";
import { Stack } from "@mui/system";
import { Avatar, Box } from "@mui/material";
import { useI18nNs } from "@/app/context/i18nContext";

const AuthSocialButtons = () => {
  const { t } = useI18nNs(["auth"]);

  return (
    <Stack direction="row" justifyContent="center" spacing={2} mt={3}>
      <CustomSocialButton>
        <Avatar src="/images/svgs/google-icon.svg" alt="Google" sx={{ width: 16, height: 16, mr: 1 }} />
        <Box>{t("auth:social.register", { provider: "Google" })}</Box>
      </CustomSocialButton>

      <CustomSocialButton>
        <Avatar src="/images/svgs/facebook-icon.svg" alt="Facebook" sx={{ width: 25, height: 25, mr: 1 }} />
        <Box>{t("auth:social.register", { provider: "Facebook" })}</Box>
      </CustomSocialButton>
    </Stack>
  );
};

export default AuthSocialButtons;


/*'use client'
import CustomSocialButton from "@/app/components/forms/theme-elements/CustomSocialButton";
import { Stack } from "@mui/system";
import { Avatar, Box } from "@mui/material";
import { useTranslation } from "react-i18next";

// önceki `signInType` props'unu kaldırıyoruz çünkü title artık i18n'den gelecek
const AuthSocialButtons = () => {
  const { t } = useTranslation();

  return (
    <>
      <Stack direction="row" justifyContent="center" spacing={2} mt={3}>
        <CustomSocialButton>
          <Avatar
            src={"/images/svgs/google-icon.svg"}
            alt={"Google"}
            sx={{
              width: 16,
              height: 16,
              borderRadius: 0,
              mr: 1,
            }}
          />
          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              whiteSpace: "nowrap",
              mr: { sm: "3px" },
            }}
          >
            {t("auth:social.signup", { provider: "Google" })}
          </Box>
        </CustomSocialButton>

        <CustomSocialButton>
          <Avatar
            src={"/images/svgs/facebook-icon.svg"}
            alt={"Facebook"}
            sx={{
              width: 25,
              height: 25,
              borderRadius: 0,
              mr: 1,
            }}
          />
          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              whiteSpace: "nowrap",
              mr: { sm: "3px" },
            }}
          >
            {t("auth:social.signup", { provider: "FB" })}
          </Box>
        </CustomSocialButton>
      </Stack>
    </>
  );
};

export default AuthSocialButtons;
*/

/*'use client'
import CustomSocialButton from "@/app/components/forms/theme-elements/CustomSocialButton";
import { Stack } from "@mui/system";
import { Avatar, Box } from "@mui/material";
import { signInType } from "@/app/[locale]/(DashboardLayout)/types/auth/auth";

const AuthSocialButtons = ({ title }: signInType) => (
  <>
    <Stack direction="row" justifyContent="center" spacing={2} mt={3}>
      <CustomSocialButton>
        <Avatar
          src={"/images/svgs/google-icon.svg"}
          alt={"icon1"}
          sx={{
            width: 16,
            height: 16,
            borderRadius: 0,
            mr: 1,
          }}
        />
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            whiteSpace: "nowrap",
            mr: { sm: "3px" },
          }}
        >
          {title}{" "}
        </Box>{" "}
        Google
      </CustomSocialButton>
      <CustomSocialButton>
        <Avatar
          src={"/images/svgs/facebook-icon.svg"}
          alt={"icon2"}
          sx={{
            width: 25,
            height: 25,
            borderRadius: 0,
            mr: 1,
          }}
        />
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            whiteSpace: "nowrap",
            mr: { sm: "3px" },
          }}
        >
          {title}{" "}
        </Box>{" "}
        FB
      </CustomSocialButton>
    </Stack>
  </>
);

export default AuthSocialButtons;
*/
