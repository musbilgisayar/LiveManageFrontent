"use client";

import {
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import {
  IconShield,
  IconShieldCheck,
  IconUsers,
  IconUserX,
} from "@tabler/icons-react";

import RoleManagerPanel
  from "../shared/RoleManagerPanel";

import type {
  RoleManagerSummaryDto,
} from "../../types/RoleManager.types";

type RoleManagerSummaryCardsProps = {
  summary: RoleManagerSummaryDto | null;
};

type SummaryCardItem = {
  title: string;

  value: number;

  icon: React.ReactNode;
};

export default function RoleManagerSummaryCards({
  summary,
}: RoleManagerSummaryCardsProps) {
  const items: SummaryCardItem[] = [
    {
      title: "Total Users",
      value: summary?.totalUsers ?? 0,
      icon: <IconUsers size={22} />,
    },
    {
      title: "Users With Active Role",
      value:
        summary?.usersWithActiveRole ?? 0,
      icon: (
        <IconShieldCheck size={22} />
      ),
    },
    {
      title: "Users Without Active Role",
      value:
        summary?.usersWithoutActiveRole ??
        0,
      icon: <IconUserX size={22} />,
    },
    {
      title: "Sensitive Roles",
      value:
        summary?.sensitiveRoles ?? 0,
      icon: <IconShield size={22} />,
    },
  ];

  return (
    <Grid
      container
      spacing={3}
    >
      {items.map((item) => (
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
          <RoleManagerPanel
            contentPadding={3}
          >
            <Stack spacing={2}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                {item.icon}

                <Typography
                  variant="h4"
                  fontWeight={800}
                >
                  {item.value}
                </Typography>
              </Stack>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                {item.title}
              </Typography>
            </Stack>
          </RoleManagerPanel>
        </Grid>
      ))}
    </Grid>
  );
}