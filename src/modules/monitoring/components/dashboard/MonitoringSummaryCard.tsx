// src/modules/monitoring/components/dashboard/MonitoringSummaryCard.tsx

"use client";

import React from "react";
import { Box, Typography, useTheme, alpha } from "@mui/material";
import { useRouter } from "next/navigation";
import BlankCard from "@/app/components/shared/BlankCard";

export type MonitoringSummaryCardTone =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "danger";

type Props = {
  title: string;
  value: number;
  description?: string;
  icon?: React.ReactNode;
  tone?: MonitoringSummaryCardTone;
  href?: string;
};

function resolveToneColor(tone: MonitoringSummaryCardTone) {
  switch (tone) {
    case "success":
      return "success";
    case "warning":
      return "warning";
    case "danger":
      return "error";
    case "info":
      return "info";
    default:
      return "primary";
  }
}

export default function MonitoringSummaryCard({
  title,
  value,
  description,
  icon,
  tone = "default",
  href,
}: Props) {
  const theme = useTheme();
  const router = useRouter();

  const paletteKey = resolveToneColor(tone);
  const mainColor = theme.palette[paletteKey].main;

  const clickable = Boolean(href);

  return (
    <BlankCard>
      <Box
        onClick={() => {
          if (href) router.push(href);
        }}
        sx={{
          p: 2.5,
          height: "100%",
          cursor: clickable ? "pointer" : "default",
          transition: "all 160ms ease",
          borderLeft: `4px solid ${mainColor}`,
          "&:hover": clickable
            ? {
                transform: "translateY(-2px)",
                boxShadow: theme.shadows[4],
              }
            : undefined,
        }}
      >
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={2}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              {title}
            </Typography>

            <Typography variant="h4" fontWeight={700} mt={1}>
              {value}
            </Typography>

            {description && (
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                mt={1}
              >
                {description}
              </Typography>
            )}
          </Box>

          {icon && (
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: mainColor,
                bgcolor: alpha(mainColor, 0.1),
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
      </Box>
    </BlankCard>
  );
}