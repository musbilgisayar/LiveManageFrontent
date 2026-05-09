"use client";

import { alpha, Box, Card, Stack, Typography, useTheme } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { IconCheck } from "@tabler/icons-react";
import type {
  WizardStep,
  WizardStepId,
} from "../../types/managementApplication.types";

type WizardStepperProps = {
  steps: WizardStep[];
  activeStepIndex: number;
  stepCompletion: Record<WizardStepId, boolean>;
  onStepClick: (index: number) => void;
};

export default function WizardStepper({
  steps,
  activeStepIndex,
  stepCompletion,
  onStepClick,
}: WizardStepperProps) {
  const theme = useTheme<Theme>();

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 5,
        border: `1px solid ${alpha(theme.palette.divider, 0.72)}`,
        bgcolor: alpha(theme.palette.background.paper, 0.94),
        boxShadow: "0 10px 32px rgba(15, 23, 42, 0.035)",
        p: { xs: 1.35, md: 1.75 },
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: `repeat(${steps.length}, 1fr)`,
          },
          gap: 1.1,
        }}
      >
        {steps.map((step, index) => {
          const active = index === activeStepIndex;
          const done = stepCompletion[step.id];

          return (
            <Box
              key={step.id}
              onClick={() => onStepClick(index)}
              role="button"
              tabIndex={0}
              sx={{
                p: 1.25,
                borderRadius: 4,
                cursor: "pointer",
                border: `1px solid ${
                  active
                    ? alpha(theme.palette.primary.main, 0.3)
                    : alpha(theme.palette.divider, 0.64)
                }`,
                bgcolor: active
                  ? alpha(theme.palette.primary.main, 0.065)
                  : done
                    ? alpha(theme.palette.success.main, 0.045)
                    : alpha(theme.palette.background.default, 0.24),
                transition: "all 160ms ease",
                "&:hover": {
                  borderColor: alpha(theme.palette.primary.main, 0.28),
                  bgcolor: alpha(theme.palette.primary.main, 0.045),
                },
              }}
            >
              <Stack direction="row" spacing={1.1} alignItems="center">
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                    fontWeight: 900,
                    color: done
                      ? "success.main"
                      : active
                        ? "primary.main"
                        : "text.secondary",
                    bgcolor: done
                      ? alpha(theme.palette.success.main, 0.1)
                      : active
                        ? alpha(theme.palette.primary.main, 0.1)
                        : alpha(theme.palette.grey[500], 0.08),
                  }}
                >
                  {done ? <IconCheck size={17} /> : step.index}
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={900} noWrap sx={{ fontSize: 14 }}>
                    {step.title}
                  </Typography>

                  <Typography variant="caption" color="text.secondary" noWrap>
                    {step.description}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          );
        })}
      </Box>
    </Card>
  );
}