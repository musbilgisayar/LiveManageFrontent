"use client";

import {
  Alert,
  alpha,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconSend,
} from "@tabler/icons-react";

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

const I18N_PREFIX = "management-applications";

const KEYS = {
  stepCounter: "management-applications:create.footer.stepCounter",
  viewExistingApplication:
    "management-applications:create.footer.viewExistingApplication",
  back: "management-applications:create.footer.back",
  next: "management-applications:create.footer.next",
  submit: "management-applications:create.footer.submit",
  submitting: "management-applications:create.footer.submitting",
} as const;

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
  const { t } = useI18nNs(I18N_PREFIX);

  const isLastStep = activeStepIndex === totalSteps - 1;
  const canGoBack = activeStepIndex > 0;

  const tr = (fullKey: string, fallback: string) => {
    const value = t(fullKey);
    return value && value !== fullKey ? value : fallback;
  };

  const stepCounterText = tr(KEYS.stepCounter, "Adım {current}/{total}")
    .replace("{current}", String(activeStepIndex + 1))
    .replace("{total}", String(totalSteps));

  const stepProgress = ((activeStepIndex + 1) / totalSteps) * 100;

  return (
    <Box
      sx={{
        position: "relative",
        px: { xs: 2, md: 4 },
        py: { xs: 2.5, md: 3.5 },
        bgcolor: alpha(theme.palette.background.default, 0.5),
        backdropFilter: "blur(8px)",
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          bgcolor: alpha(theme.palette.primary.main, 0.12),
        }}
      >
        <Box
          sx={{
            width: `${stepProgress}%`,
            height: "100%",
            bgcolor: theme.palette.primary.main,
            transition: "width 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1)",
            borderRadius: "0 3px 3px 0",
            boxShadow: `0 0 12px ${alpha(theme.palette.primary.main, 0.5)}`,
          }}
        />
      </Box>

      <Stack spacing={2}>
        {submitMessage && (
          <Alert
            severity={existingApplicationId ? "warning" : "info"}
            icon={
              existingApplicationId ? (
                <IconSend size={18} />
              ) : (
                <IconCheck size={18} />
              )
            }
            sx={{
              borderRadius: 2.5,
              border: `1px solid ${alpha(
                existingApplicationId
                  ? theme.palette.warning.main
                  : theme.palette.info.main,
                0.15
              )}`,
              bgcolor: alpha(
                existingApplicationId
                  ? theme.palette.warning.main
                  : theme.palette.info.main,
                0.04
              ),
              boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
              "& .MuiAlert-message": {
                flex: 1,
              },
            }}
            action={
              existingApplicationId && onExistingApplicationOpen ? (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={onExistingApplicationOpen}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    borderColor: alpha(theme.palette.warning.main, 0.3),
                    "&:hover": {
                      borderColor: theme.palette.warning.main,
                      bgcolor: alpha(theme.palette.warning.main, 0.04),
                    },
                  }}
                >
                  {tr(KEYS.viewExistingApplication, "Mevcut başvuruyu görüntüle")}
                </Button>
              ) : undefined
            }
          >
            <Typography variant="body2" fontWeight={500}>
              {submitMessage}
            </Typography>
          </Alert>
        )}

        <Stack
          direction={{ xs: "column-reverse", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={2.5}
        >
          <Button
            variant="outlined"
            startIcon={<IconArrowLeft size={18} strokeWidth={1.8} />}
            onClick={onBack}
            disabled={!canGoBack || isSubmitting}
            sx={{
              height: 48,
              minWidth: 130,
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.875rem",
              letterSpacing: "0.3px",
              borderColor: alpha(theme.palette.primary.main, 0.25),
              bgcolor: alpha(theme.palette.background.paper, 0.6),
              backdropFilter: "blur(4px)",
              transition: "all 0.2s cubic-bezier(0.2, 0.9, 0.4, 1.1)",
              "&:hover:not(:disabled)": {
                borderColor: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                transform: "translateX(-2px)",
              },
              "&:disabled": {
                opacity: 0.5,
              },
            }}
          >
            {tr(KEYS.back, "Geri")}
          </Button>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                px: { xs: 1, sm: 0 },
              }}
            >
              <Box
                sx={{
                  display: { xs: "none", sm: "flex" },
                  alignItems: "center",
                  gap: 0.75,
                }}
              >
                {Array.from({ length: totalSteps }).map((_, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      width: idx === activeStepIndex ? 20 : 6,
                      height: 6,
                      borderRadius: 3,
                      bgcolor:
                        idx === activeStepIndex
                          ? theme.palette.primary.main
                          : idx < activeStepIndex
                            ? theme.palette.primary.light
                            : alpha(theme.palette.text.disabled, 0.3),
                      transition: "all 0.3s ease",
                    }}
                  />
                ))}
              </Box>

              <Typography
                variant="body2"
                sx={{
                  color: alpha(theme.palette.text.primary, 0.65),
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  fontFamily: "monospace",
                  letterSpacing: "0.5px",
                }}
              >
                {stepCounterText}
              </Typography>
            </Box>

            <Button
              variant="contained"
              disableRipple={isSubmitting}
              endIcon={
                isSubmitting ? (
                  <CircularProgress size={16} color="inherit" />
                ) : isLastStep ? (
                  <IconSend size={18} strokeWidth={1.8} />
                ) : (
                  <IconArrowRight size={18} strokeWidth={1.8} />
                )
              }
              disabled={isSubmitting || (isLastStep && !canSubmit)}
              onClick={isLastStep ? onSubmit : onNext}
              sx={{
                height: 52,
                minWidth: { xs: "100%", sm: 240 },
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.9rem",
                letterSpacing: "0.3px",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.25s cubic-bezier(0.2, 0.9, 0.4, 1.1)",
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`,
                "&:hover:not(:disabled)": {
                  transform: "translateY(-2px)",
                  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.45)}`,
                },
                "&:active:not(:disabled)": {
                  transform: "translateY(0)",
                },
                "&:disabled": {
                  opacity: 0.6,
                  background: `linear-gradient(135deg, ${alpha(
                    theme.palette.primary.main,
                    0.6
                  )}, ${alpha(theme.palette.primary.dark, 0.6)})`,
                },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: "-100%",
                  width: "100%",
                  height: "100%",
                  background: `linear-gradient(90deg, transparent, ${alpha(
                    theme.palette.common.white,
                    0.2
                  )}, transparent)`,
                  transition: "left 0.5s ease",
                },
                "&:hover:not(:disabled)::before": {
                  left: "100%",
                },
              }}
            >
              {isLastStep
                ? isSubmitting
                  ? tr(KEYS.submitting, "Gönderiliyor")
                  : tr(KEYS.submit, "Başvuruyu Gönder")
                : tr(KEYS.next, "Devam Et")}
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}