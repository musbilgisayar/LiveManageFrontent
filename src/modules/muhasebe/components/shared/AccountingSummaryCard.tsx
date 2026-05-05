//src/modules/muhasebe/components/shared/AccountingSummaryCard.tsx
"use client";

import React from "react";
import {
  alpha,
  Avatar,
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

interface AccountingSummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
}

export default function AccountingSummaryCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: AccountingSummaryCardProps) {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        width: "100%",
        borderRadius: 4,
        border: `1px solid ${alpha(theme.palette.divider, 0.85)}`,
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.background.paper,
          0.98,
        )} 0%, ${alpha(color, 0.045)} 100%)`,
        display: "flex",
      }}
    >
      <CardContent
        sx={{
          p: 2.5,
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "stretch",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ width: "100%" }}
        >
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={800}
              textTransform="uppercase"
            >
              {title}
            </Typography>

            <Typography variant="h5" fontWeight={900} sx={{ mt: 0.5 }}>
              {value}
            </Typography>

            {subtitle && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: "block" }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          <Avatar
            sx={{
              bgcolor: alpha(color, 0.12),
              color,
              width: 44,
              height: 44,
            }}
          >
            {icon}
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}