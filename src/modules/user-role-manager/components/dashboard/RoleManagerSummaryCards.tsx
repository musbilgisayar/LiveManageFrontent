"use client";

import type { ReactNode } from "react";

import {
  Box,
  Grid,
  Stack,
  Typography,
  alpha,
} from "@mui/material";

import {
  IconShield,
  IconShieldCheck,
  IconUsers,
  IconUserX,
} from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";

import type { RoleManagerSummaryDto } from "../../types/RoleManager.types";

type RoleManagerSummaryCardsProps = {
  summary: RoleManagerSummaryDto | null;
};

type SummaryCardItem = {
  title: string;
  value: number;
  icon: ReactNode;
  tone: "primary" | "success" | "warning" | "info";
};

export default function RoleManagerSummaryCards({
  summary,
}: RoleManagerSummaryCardsProps) {
  const { t } = useI18nNs("userRoleManager");

  const items: SummaryCardItem[] = [
    {
      title: t("summary.totalUsers"),
      value: summary?.totalUsers ?? 0,
      icon: <IconUsers size={22} />,
      tone: "primary",
    },
    {
      title: t("summary.usersWithActiveRole"),
      value: summary?.usersWithActiveRole ?? 0,
      icon: <IconShieldCheck size={22} />,
      tone: "success",
    },
    {
      title: t("summary.usersWithoutActiveRole"),
      value: summary?.usersWithoutActiveRole ?? 0,
      icon: <IconUserX size={22} />,
      tone: "warning",
    },
    {
      title: t("summary.sensitiveRoles"),
      value: summary?.sensitiveRoles ?? 0,
      icon: <IconShield size={22} />,
      tone: "info",
    },
  ];

  return (
    <Grid container spacing={2.5} alignItems="stretch">
      {items.map((item, index) => (
        <Grid
          key={item.title}
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
          sx={{
            display: "flex",
          }}
        >
          <Box
            sx={(theme) => {
              const color = theme.palette[item.tone].main;

              return {
                position: "relative",
                width: "100%",
                minHeight: 132,
                display: "flex",
                overflow: "hidden",
                borderRadius: 4,
                border: "1px solid",
                borderColor: alpha(color, 0.18),
                bgcolor: "background.paper",
                boxShadow: `0 18px 48px ${alpha(
                  theme.palette.common.black,
                  theme.palette.mode === "dark" ? 0.28 : 0.06,
                )}`,
                transform: "translateY(0)",
                animation: `roleSummaryFadeIn .45s ease ${
                  index * 80
                }ms both`,
                transition:
                  "transform .2s ease, box-shadow .2s ease, border-color .2s ease",

                "@keyframes roleSummaryFadeIn": {
                  from: {
                    opacity: 0,
                    transform: "translateY(10px)",
                  },
                  to: {
                    opacity: 1,
                    transform: "translateY(0)",
                  },
                },

                "&:hover": {
                  transform: "translateY(-4px)",
                  borderColor: alpha(color, 0.35),
                  boxShadow: `0 22px 60px ${alpha(
                    color,
                    theme.palette.mode === "dark" ? 0.22 : 0.16,
                  )}`,
                },

                "&::before": {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  background: `linear-gradient(135deg, ${alpha(
                    color,
                    0.11,
                  )} 0%, ${alpha(color, 0.025)} 44%, transparent 100%)`,
                  pointerEvents: "none",
                },

                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: -52,
                  right: -48,
                  width: 132,
                  height: 132,
                  borderRadius: "50%",
                  background: alpha(color, 0.1),
                  pointerEvents: "none",
                },
              };
            }}
          >
            <Stack
              spacing={2}
              justifyContent="space-between"
              sx={{
                position: "relative",
                zIndex: 1,
                width: "100%",
                p: 2.4,
              }}
            >
              <Stack
                direction="row"
                alignItems="flex-start"
                justifyContent="space-between"
                spacing={2}
              >
                <Box
                  sx={(theme) => {
                    const color = theme.palette[item.tone].main;

                    return {
                      width: 44,
                      height: 44,
                      borderRadius: 3,
                      display: "grid",
                      placeItems: "center",
                      color,
                      bgcolor: alpha(color, 0.1),
                      border: "1px solid",
                      borderColor: alpha(color, 0.18),
                      boxShadow: `0 10px 26px ${alpha(color, 0.14)}`,
                    };
                  }}
                >
                  {item.icon}
                </Box>

                <Typography
                  variant="h3"
                  fontWeight={950}
                  sx={{
                    lineHeight: 1,
                    letterSpacing: "-0.05em",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {item.value.toLocaleString("tr-TR")}
                </Typography>
              </Stack>

              <Stack spacing={0.5}>
                <Typography
                  variant="subtitle2"
                  fontWeight={900}
                  sx={{
                    lineHeight: 1.25,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {item.title}
                </Typography>

                <Box
                  sx={(theme) => {
                    const color = theme.palette[item.tone].main;

                    return {
                      width: 42,
                      height: 4,
                      borderRadius: 999,
                      bgcolor: alpha(color, 0.45),
                    };
                  }}
                />
              </Stack>
            </Stack>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}