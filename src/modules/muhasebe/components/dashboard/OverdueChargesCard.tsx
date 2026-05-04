"use client";

import React from "react";
import {
  alpha,
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { IconAlertTriangle } from "@tabler/icons-react";

type OverdueCharge = {
  id: string;
  unitLabel: string;
  ownerName?: string;
  amount: number;
 
  dueDate: string;
  daysOverdue: number;
};

type OverdueChargesCardProps = {
  items: OverdueCharge[];
  currency: string;
};

export default function OverdueChargesCard({
  items,
  currency,
}: OverdueChargesCardProps) {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.error.main, 0.22)}`,
        bgcolor: alpha(theme.palette.error.main, 0.04),
      }}
    >
      <CardContent sx={{ p: 2.25 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2.5,
                display: "grid",
                placeItems: "center",
                color: theme.palette.error.main,
                bgcolor: alpha(theme.palette.error.main, 0.12),
              }}
            >
              <IconAlertTriangle size={20} />
            </Box>

            <Box>
              <Typography variant="subtitle2" fontWeight={800}>
                Gecikmiş Borçlar
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Son ödeme tarihi geçmiş borçlar
              </Typography>
            </Box>
          </Stack>

          {items.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Gecikmiş borç bulunmuyor.
            </Typography>
          ) : (
            <Stack spacing={1.25}>
              {items.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    p: 1.25,
                    borderRadius: 2.25,
                    bgcolor: alpha(theme.palette.error.main, 0.06),
                    border: `1px solid ${alpha(theme.palette.error.main, 0.14)}`,
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" spacing={1.5}>
                    <Box minWidth={0}>
                      <Typography variant="body2" fontWeight={800} noWrap>
                        {item.unitLabel}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                        display="block"
                      >
                        {item.ownerName || "Sahip bilinmiyor"}
                      </Typography>
                    </Box>

                    <Stack alignItems="flex-end" spacing={0.4}>
                      <Typography variant="body2" fontWeight={900}>
                      
                        {item.amount} {currency}
                      </Typography>

                      <Chip
                        size="small"
                        color="error"
                        label={`${item.daysOverdue} gün gecikmiş`}
                        sx={{ height: 22 }}
                      />
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}