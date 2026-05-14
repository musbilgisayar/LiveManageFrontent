"use client";

import {
  Card,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";

import { useI18nNs } from "@/app/context/i18nContext";

interface Props {
  summary: {
    total: number;
    direct: number;
    role: number;
    effective: number;
    missing: number;
  };
}

const cards = [
  ["total", "permission:userOverrides.summary.total"],
  ["direct", "permission:userOverrides.summary.direct"],
  ["role", "permission:userOverrides.summary.role"],
  ["effective", "permission:userOverrides.summary.effective"],
  ["missing", "permission:userOverrides.summary.missing"],
] as const;

export default function UserPermissionSummaryCards({
  summary,
}: Props) {
  const { t } = useI18nNs(["permission"]);

  return (
    <Grid container spacing={2}>
      {cards.map(([key, label]) => (
        <Grid
          key={key}
          size={{
            xs: 12,
            sm: 6,
            md: 2.4,
          }}
          sx={{ display: "flex" }}
        >
          <Card sx={{ borderRadius: 3, width: "100%" }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                {t(label)}
              </Typography>

              <Typography variant="h5" fontWeight={900}>
                {summary[key]}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}