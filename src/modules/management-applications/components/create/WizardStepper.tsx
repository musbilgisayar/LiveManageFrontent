// src/modules/management-applications/components/create/WizardStepper.tsx
"use client";

import {
  alpha,
  Box,
  Card,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";

import {
  IconCheck,
  IconChevronRight,
  IconCircleDot,
} from "@tabler/icons-react";

import { useI18n } from "@/app/context/i18nContext";

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
  const { t } = useI18n();

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
        bgcolor: alpha(theme.palette.background.paper, 0.98),
        boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.04)}`,
        overflow: "hidden",
        transition: "box-shadow 0.3s ease",
        "&:hover": {
          boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.08)}`,
        },
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: `repeat(${Math.min(steps.length, 2)}, 1fr)`,
            md: `repeat(${steps.length}, 1fr)`,
          },
          gap: 1.5,
          p: { xs: 1.5, md: 2 },
        }}
      >
        {steps.map((step, index) => {
          const active = index === activeStepIndex;
          const done = stepCompletion[step.id];
          const isClickable = done || active || index === activeStepIndex + 1;

          const title =
            t(`management-applications:create.steps.${step.id}.title`) ||
            step.title;

          const description =
            t(`management-applications:create.steps.${step.id}.description`) ||
            step.description;

          return (
            <Box
              key={step.id}
              onClick={() => isClickable && onStepClick(index)}
              role="button"
              tabIndex={isClickable ? 0 : -1}
              sx={{
                position: "relative",
                p: 1.75,
                borderRadius: 2.5,
                cursor: isClickable ? "pointer" : "default",
                opacity: isClickable ? 1 : 0.6,
                border: `1.5px solid ${
                  active
                    ? theme.palette.primary.main
                    : done
                    ? alpha(theme.palette.success.main, 0.3)
                    : alpha(theme.palette.divider, 0.5)
                }`,
                bgcolor: active
                  ? alpha(theme.palette.primary.main, 0.04)
                  : done
                  ? alpha(theme.palette.success.main, 0.03)
                  : alpha(theme.palette.background.default, 0.5),
                transition: "all 0.25s cubic-bezier(0.2, 0.9, 0.4, 1.1)",

                ...(active && {
                  boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`,
                }),

                "&:hover": isClickable
                  ? {
                      transform: "translateY(-2px)",
                      borderColor: active
                        ? theme.palette.primary.main
                        : alpha(theme.palette.primary.main, 0.4),
                      bgcolor: alpha(theme.palette.primary.main, 0.06),
                      boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.12)}`,
                    }
                  : {},

                "&::after": {
                  content: '""',
                  position: "absolute",
                  right: { xs: "auto", md: -12 },
                  top: "50%",
                  transform: "translateY(-50%)",
                  display: {
                    xs: "none",
                    md: index === steps.length - 1 ? "none" : "block",
                  },
                  width: 24,
                  height: 1.5,
                  bgcolor: alpha(
                    done || active
                      ? theme.palette.primary.main
                      : theme.palette.divider,
                    0.3
                  ),
                  borderRadius: 1,
                },
              }}
            >
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      position: "relative",
                      overflow: "hidden",

                      color: done
                        ? theme.palette.success.main
                        : active
                        ? theme.palette.primary.main
                        : alpha(theme.palette.text.primary, 0.5),

                      bgcolor: done
                        ? alpha(theme.palette.success.main, 0.1)
                        : active
                        ? alpha(theme.palette.primary.main, 0.1)
                        : alpha(theme.palette.action.hover, 0.5),

                      border: `1px solid ${
                        done
                          ? alpha(theme.palette.success.main, 0.2)
                          : active
                          ? alpha(theme.palette.primary.main, 0.3)
                          : alpha(theme.palette.divider, 0.5)
                      }`,

                      ...(active && {
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          inset: 0,
                          borderRadius: 2,
                          border: `2px solid ${theme.palette.primary.main}`,
                          animation: "pulse-border 2s ease-out infinite",
                        },
                      }),
                    }}
                  >
                    {done ? (
                      <IconCheck size={22} strokeWidth={2} />
                    ) : active ? (
                      <IconCircleDot size={22} strokeWidth={1.8} />
                    ) : (
                      <Typography variant="h6" fontWeight={700}>
                        {step.index}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      fontWeight={700}
                      sx={{
                        fontSize: "0.95rem",
                        lineHeight: 1.3,
                        color: active
                          ? theme.palette.primary.main
                          : done
                          ? theme.palette.text.primary
                          : alpha(theme.palette.text.primary, 0.7),
                      }}
                    >
                      {title}
                    </Typography>
                  </Box>

                  {active && (
                    <Box
                      sx={{
                        display: { xs: "none", md: "flex" },
                        color: theme.palette.primary.main,
                      }}
                    >
                      <IconChevronRight size={20} />
                    </Box>
                  )}
                </Stack>

                <Typography
                  variant="body2"
                  sx={{
                    color: alpha(theme.palette.text.primary, 0.65),
                    fontSize: "0.75rem",
                    lineHeight: 1.5,
                    pl: { xs: 0, sm: 7.5 },
                    whiteSpace: "normal",
                  }}
                >
                  {description}
                </Typography>
              </Stack>
            </Box>
          );
        })}
      </Box>
    </Card>
  );
}