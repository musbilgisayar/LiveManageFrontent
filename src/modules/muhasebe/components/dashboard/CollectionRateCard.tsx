//src/modules/muhasebe/components/dashboard/CollectionRateCard.tsx
"use client";

import React from "react";
import {
  alpha,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { IconPercentage, IconTrendingUp } from "@tabler/icons-react";

type CollectionRateCardProps = {
  totalCharged: number;
  totalCollected: number;
  collectionRate: number;
  currency: string;
};

export default function CollectionRateCard({
  totalCharged,
  totalCollected,
  collectionRate,
  currency,
}: CollectionRateCardProps) {
  const theme = useTheme();

  const safeRate = Math.max(0, Math.min(collectionRate, 100));
  const remainingAmount = Math.max(totalCharged - totalCollected, 0);

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        height: "fit-content",
        border: `1px solid ${alpha(theme.palette.success.main, 0.22)}`,
        bgcolor: alpha(theme.palette.success.main, 0.045),
      }}
    >
      <CardContent sx={{ p: 2.25, "&:last-child": { pb: 2.25 } }}>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 2.5,
                  display: "grid",
                  placeItems: "center",
                  color: theme.palette.success.main,
                  bgcolor: alpha(theme.palette.success.main, 0.12),
                }}
              >
                <IconPercentage size={20} />
              </Box>

              <Box>
                <Typography variant="subtitle2" fontWeight={800}>
                  Tahsilat Oranı
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Tahakkuk edilen borçlara göre tahsilat durumu
                </Typography>
              </Box>
            </Stack>

            <Typography variant="h5" fontWeight={900} color="success.main">
              %{safeRate}
            </Typography>
          </Stack>

          <Box>
            <LinearProgress
              variant="determinate"
              value={safeRate}
              sx={{
                height: 10,
                borderRadius: 999,
                bgcolor: alpha(theme.palette.success.main, 0.12),
                "& .MuiLinearProgress-bar": {
                  borderRadius: 999,
                },
              }}
            />

            <Stack direction="row" justifyContent="space-between" mt={1}>
              <Typography variant="caption" color="text.secondary">
                Tahsil edilen: {totalCollected} {currency}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Kalan: {remainingAmount} {currency}
              </Typography>
            </Stack>
          </Box>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              p: 1.25,
              borderRadius: 2,
              color: theme.palette.success.main,
              bgcolor: alpha(theme.palette.success.main, 0.08),
            }}
          >
            <IconTrendingUp size={17} />

            <Typography variant="caption" fontWeight={700}>
              {totalCharged} {currency} tahakkuktan {totalCollected} {currency} tahsil edildi.
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}