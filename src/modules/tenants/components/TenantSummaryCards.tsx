// src/modules/tenants/components/TenantSummaryCards.tsx

"use client";

import {
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import { useI18nNs } from "@/app/context/i18nContext";

type TenantSummaryCardsProps = {
  totalCount: number;
  activeCount: number;
  passiveCount: number;
};

export default function TenantSummaryCards({
  totalCount,
  activeCount,
  passiveCount,
}: TenantSummaryCardsProps) {
  const { t } = useI18nNs("tenants");

  const items = [
    {
      label: t("tenants:summary.total"),
      value: totalCount,
    },
    {
      label: t("tenants:summary.active"),
      value: activeCount,
    },
    {
      label: t("tenants:summary.passive"),
      value: passiveCount,
    },
  ];

  return (
    <Grid container spacing={3}>
      {items.map((item) => (
        <Grid
          key={item.label}
          size={{
            xs: 12,
            md: 4,
          }}
          sx={{ display: "flex" }}
        >
          <Card
            sx={{
              width: "100%",
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Stack spacing={1}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {item.label}
                </Typography>

                <Typography
                  variant="h4"
                  fontWeight={700}
                >
                  {item.value}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}