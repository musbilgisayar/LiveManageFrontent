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
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";

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
  const isLastStep = activeStepIndex === totalSteps - 1;
  const canGoBack = activeStepIndex > 0;

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 2.25, md: 3 } }}>
      <Stack spacing={1.5}>
        {submitMessage && (
          <Alert
            severity={existingApplicationId ? "warning" : "info"}
            sx={{ borderRadius: 3 }}
            action={
              existingApplicationId ? (
                <Button
                  color="inherit"
                  size="small"
                  onClick={onExistingApplicationOpen}
                  sx={{ fontWeight: 900, whiteSpace: "nowrap" }}
                >
                  Mevcut başvuruyu görüntüle
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
              fontWeight: 900,
              borderColor: alpha(theme.palette.primary.main, 0.18),
            }}
          >
            Geri
          </Button>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.25}
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: { xs: "center", sm: "left" } }}
            >
              Adım {activeStepIndex + 1}/{totalSteps}
            </Typography>

            <Button
              variant="contained"
              endIcon={!isLastStep ? <IconArrowRight size={18} /> : undefined}
              disabled={(isLastStep && !canSubmit) || isSubmitting}
              onClick={isLastStep ? onSubmit : onNext}
              sx={{
                height: 52,
                minWidth: { xs: "100%", sm: 220 },
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 950,
                fontSize: 15,
                boxShadow: "0 10px 24px rgba(37, 99, 235, 0.22)",
              }}
            >
              {isLastStep
                ? isSubmitting
                  ? "Gönderiliyor..."
                  : "Başvuruyu Gönder"
                : "Devam Et"}
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}