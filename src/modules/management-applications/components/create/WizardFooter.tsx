"use client";

import {
  Alert,
  alpha,
  Box,
  Button,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { IconArrowLeft, IconArrowRight, IconSend } from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";

type WizardFooterProps = {
  activeStepIndex: number;
  totalSteps: number;
  canSubmit: boolean;
  isSubmitting: boolean;
  submitMessage?: string | null;
  existingApplicationId?: string | null;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void | Promise<void>;
  onExistingApplicationOpen?: () => void;
};

const NS = "property:managementApplication.create.footer";

export default function WizardFooter({
  activeStepIndex,
  totalSteps,
  canSubmit,
  isSubmitting,
  submitMessage,
  existingApplicationId,
  onBack,
  onNext,
  onSubmit,
  onExistingApplicationOpen,
}: WizardFooterProps) {
  const theme = useTheme<Theme>();
  const { t } = useI18nNs(["property"]);

  const isLastStep = activeStepIndex === totalSteps - 1;
  const canGoBack = activeStepIndex > 0;

  const tr = (key: string, fallback: string) => {
    const fullKey = `${NS}.${key}`;
    const value = t(fullKey);
    return value && value !== fullKey ? value : fallback;
  };

  const stepCounterText = tr(
    "stepCounter",
    "Adım {current}/{total}",
  )
    .replace("{current}", String(activeStepIndex + 1))
    .replace("{total}", String(totalSteps));

  return (
    <Box
      sx={{
        px: { xs: 2, md: 4 },
        py: { xs: 2.25, md: 3 },
        bgcolor: alpha(theme.palette.background.default, 0.24),
      }}
    >
      <Stack spacing={1.5}>
        {submitMessage && (
          <Alert
            severity={existingApplicationId ? "warning" : "info"}
            sx={{
              borderRadius: 3.5,
              border: `1px solid ${alpha(
                existingApplicationId
                  ? theme.palette.warning.main
                  : theme.palette.info.main,
                0.18,
              )}`,
              boxShadow: `0 10px 28px ${alpha(
                theme.palette.common.black,
                0.04,
              )}`,
            }}
            action={
              existingApplicationId ? (
                <Button
                  color="inherit"
                  size="small"
                  onClick={onExistingApplicationOpen}
                  sx={{
                    fontWeight: 950,
                    whiteSpace: "nowrap",
                    borderRadius: 999,
                    textTransform: "none",
                  }}
                >
                  {tr(
                    "viewExistingApplication",
                    "Mevcut başvuruyu görüntüle",
                  )}
                </Button>
              ) : undefined
            }
          >
            {submitMessage}
          </Alert>
        )}

        <Stack
          direction={{ xs: "column-reverse", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={2}
        >
          <Button
            variant="outlined"
            startIcon={<IconArrowLeft size={18} />}
            onClick={onBack}
            disabled={!canGoBack || isSubmitting}
            sx={{
              height: 50,
              minWidth: 140,
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 950,
              borderColor: alpha(theme.palette.primary.main, 0.2),
              bgcolor: alpha(theme.palette.background.paper, 0.72),
              "&:hover": {
                borderColor: alpha(theme.palette.primary.main, 0.38),
                bgcolor: alpha(theme.palette.primary.main, 0.04),
              },
            }}
          >
            {tr("back", "Geri")}
          </Button>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.25}
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                textAlign: { xs: "center", sm: "left" },
                fontWeight: 800,
              }}
            >
              {stepCounterText}
            </Typography>

            <Button
              variant="contained"
              endIcon={
                isLastStep ? (
                  <IconSend size={18} />
                ) : (
                  <IconArrowRight size={18} />
                )
              }
              disabled={(isLastStep && !canSubmit) || isSubmitting}
              onClick={isLastStep ? onSubmit : onNext}
              sx={{
                height: 52,
                minWidth: { xs: "100%", sm: 230 },
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 950,
                fontSize: 15,
                boxShadow: `0 14px 30px ${alpha(
                  theme.palette.primary.main,
                  0.24,
                )}`,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                "&:hover": {
                  boxShadow: `0 18px 38px ${alpha(
                    theme.palette.primary.main,
                    0.3,
                  )}`,
                },
              }}
            >
              {isLastStep
                ? isSubmitting
                  ? tr("submitting", "Gönderiliyor...")
                  : tr("submit", "Başvuruyu Gönder")
                : tr("next", "Devam Et")}
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}