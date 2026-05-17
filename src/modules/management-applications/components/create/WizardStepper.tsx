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
} from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";

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

const NS = "property:managementApplication.create.steps";

export default function WizardStepper({
  steps,
  activeStepIndex,
  stepCompletion,
  onStepClick,
}: WizardStepperProps) {
  const theme = useTheme<Theme>();
  const { t } = useI18nNs(["property"]);

  const tr = (key: string, fallback: string) => {
    const value = t(key);
    return value && value !== key ? value : fallback;
  };

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 5,
        border: `1px solid ${alpha(theme.palette.divider, 0.72)}`,
        bgcolor: alpha(theme.palette.background.paper, 0.96),
        boxShadow: `0 16px 42px ${alpha(
          theme.palette.common.black,
          0.045,
        )}`,
        p: { xs: 1.35, md: 1.75 },
        overflow: "hidden",
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

          const title = tr(
            `${NS}.${step.id}.title`,
            step.title,
          );

          const description = tr(
            `${NS}.${step.id}.description`,
            step.description,
          );

          return (
            <Box
              key={step.id}
              onClick={() => onStepClick(index)}
              role="button"
              tabIndex={0}
              sx={{
                position: "relative",
                p: 1.35,
                borderRadius: 4,
                cursor: "pointer",
                border: `1px solid ${
                  active
                    ? alpha(theme.palette.primary.main, 0.32)
                    : alpha(theme.palette.divider, 0.64)
                }`,
                bgcolor: active
                  ? alpha(theme.palette.primary.main, 0.075)
                  : done
                    ? alpha(theme.palette.success.main, 0.05)
                    : alpha(theme.palette.background.default, 0.28),
                transition: "all 180ms ease",
                overflow: "hidden",

                "&::before": active
                  ? {
                      content: '""',
                      position: "absolute",
                      inset: 0,
                      background: `linear-gradient(135deg,
                        ${alpha(theme.palette.primary.main, 0.08)},
                        transparent
                      )`,
                      pointerEvents: "none",
                    }
                  : undefined,

                "&:hover": {
                  transform: "translateY(-1px)",
                  borderColor: alpha(
                    theme.palette.primary.main,
                    0.28,
                  ),
                  bgcolor: alpha(
                    theme.palette.primary.main,
                    0.05,
                  ),
                  boxShadow: `0 10px 26px ${alpha(
                    theme.palette.primary.main,
                    0.08,
                  )}`,
                },
              }}
            >
              <Stack
                direction="row"
                spacing={1.1}
                alignItems="center"
              >
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                    fontWeight: 950,

                    color: done
                      ? "success.main"
                      : active
                        ? "primary.main"
                        : "text.secondary",

                    bgcolor: done
                      ? alpha(theme.palette.success.main, 0.12)
                      : active
                        ? alpha(theme.palette.primary.main, 0.12)
                        : alpha(theme.palette.grey[500], 0.08),

                    border: `1px solid ${
                      done
                        ? alpha(theme.palette.success.main, 0.18)
                        : active
                          ? alpha(theme.palette.primary.main, 0.18)
                          : "transparent"
                    }`,
                  }}
                >
                  {done ? (
                    <IconCheck size={17} />
                  ) : (
                    step.index
                  )}
                </Box>

                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    fontWeight={950}
                    noWrap
                    sx={{
                      fontSize: 14,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {title}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    noWrap
                    sx={{
                      lineHeight: 1.5,
                    }}
                  >
                    {description}
                  </Typography>
                </Box>

                {active && (
                  <Box
                    sx={{
                      color: "primary.main",
                      display: {
                        xs: "none",
                        md: "flex",
                      },
                    }}
                  >
                    <IconChevronRight size={18} />
                  </Box>
                )}
              </Stack>
            </Box>
          );
        })}
      </Box>
    </Card>
  );
}