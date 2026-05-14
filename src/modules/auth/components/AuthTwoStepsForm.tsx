// src/modules/auth/components/AuthTwoStepsForm.tsx

"use client";

import { Box, Button, Typography } from "@mui/material";
import { Stack } from "@mui/system";

import CustomFormLabel from "@/app/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/app/components/forms/theme-elements/CustomTextField";
import { useI18nNs } from "@/app/context/i18nContext";

export type AuthTwoStepsView = "login" | "register" | "forgot" | "twoSteps";

type AuthTwoStepsFormProps = {
  onChangeView?: (view: AuthTwoStepsView) => void;
};

export default function AuthTwoStepsForm({
  onChangeView,
}: AuthTwoStepsFormProps) {
  const { t } = useI18nNs(["auth"]);

  return (
    <Box mt={4}>
      <Stack mb={3}>
        <CustomFormLabel htmlFor="code-0">
          {t("auth:twoSteps.securityCode")}
        </CustomFormLabel>

        <Stack spacing={2} direction="row">
          {Array.from({ length: 6 }).map((_, index) => (
            <CustomTextField
              key={index}
              id={`code-${index}`}
              variant="outlined"
              fullWidth
              inputProps={{
                maxLength: 1,
                inputMode: "numeric",
              }}
            />
          ))}
        </Stack>
      </Stack>

      <Button
        color="primary"
        variant="contained"
        size="large"
        fullWidth
        type="button"
      >
        {t("auth:twoSteps.verify")}
      </Button>

      <Stack direction="row" spacing={1} mt={3} justifyContent="center">
        <Typography color="textSecondary" variant="body2" fontWeight={400}>
          {t("auth:twoSteps.didNotGetCode")}
        </Typography>

        <Typography
          component="button"
          onClick={() => {
            // Sonraki adımda resend service/hook bağlanacak.
          }}
          style={{
            background: "none",
            border: "none",
            color: "blue",
            cursor: "pointer",
          }}
        >
          {t("auth:twoSteps.resend")}
        </Typography>
      </Stack>

      <Stack mt={3} alignItems="center">
        <Typography
          component="button"
          onClick={() => onChangeView?.("login")}
          style={{
            background: "none",
            border: "none",
            color: "blue",
            cursor: "pointer",
          }}
        >
          {t("auth:twoSteps.backToLogin")}
        </Typography>
      </Stack>
    </Box>
  );
}