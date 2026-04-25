'use client'
import { Button, Stack } from "@mui/material";
import CustomTextField from "@/app/components/forms/theme-elements/CustomTextField";
import CustomFormLabel from "@/app/components/forms/theme-elements/CustomFormLabel";

// i18n
import { useI18nNs } from "@/app/context/i18nContext";

export default function AuthForgotPassword({
  onChangeView,
}: {
  onChangeView?: (view: "login" | "register" | "forgot" | "twoSteps") => void;
}) {
  const { t } = useI18nNs(["auth"]);

  return (
    <Stack mt={4} spacing={2}>
      <CustomFormLabel htmlFor="reset-email">
        {t("auth:forgot.email")}
      </CustomFormLabel>
      <CustomTextField id="reset-email" variant="outlined" fullWidth />

      <Button color="primary" variant="contained" size="large" fullWidth type="submit">
        {t("auth:forgot.reset")}
      </Button>

      <Button
        color="primary"
        size="large"
        fullWidth
        onClick={() => onChangeView?.("login")}
      >
        {t("auth:forgot.back")}
      </Button>
    </Stack>
  );
}


/*'use client'
import { Button, Stack } from "@mui/material";
import CustomTextField from "@/app/components/forms/theme-elements/CustomTextField";
import CustomFormLabel from "@/app/components/forms/theme-elements/CustomFormLabel";

export default function AuthForgotPassword({
  onChangeView,
}: {
  onChangeView?: (view: "login" | "register" | "forgot" | "twoSteps") => void;
}) {
  return (
    <Stack mt={4} spacing={2}>
      <CustomFormLabel htmlFor="reset-email">Email Address</CustomFormLabel>
      <CustomTextField id="reset-email" variant="outlined" fullWidth />

      <Button color="primary" variant="contained" size="large" fullWidth type="submit">
        Reset Password
      </Button>
      <Button color="primary" size="large" fullWidth onClick={() => onChangeView?.("login")}>
        Back to Login
      </Button>
    </Stack>
  );
}
*/

/*'use client'
import { Button, Stack } from "@mui/material";
import Link from "next/link";

import CustomTextField from "@/app/components/forms/theme-elements/CustomTextField";
import CustomFormLabel from "@/app/components/forms/theme-elements/CustomFormLabel";

export default function AuthForgotPassword(){
 return (
  <>
    <Stack mt={4} spacing={2}>
      <CustomFormLabel htmlFor="reset-email">Email Adddress</CustomFormLabel>
      <CustomTextField id="reset-email" variant="outlined" fullWidth />

      <Button
        color="primary"
        variant="contained"
        size="large"
        fullWidth
        component={Link}
        href="/"
      >
        Forgot Password
      </Button>
      <Button
        color="primary"
        size="large"
        fullWidth
        component={Link}
        href="/auth/login"
      >
        Back to Login
      </Button>
    </Stack>
  </>
)};
*/
