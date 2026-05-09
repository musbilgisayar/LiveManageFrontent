"use client";

import React from "react";

import {
  alpha,
  Box,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { IconClock } from "@tabler/icons-react";

import SectionCard from "./shared/SectionCard";

import type {
  AdminApplicationTimelineItem,
} from "../../types/adminManagementApplication.types";

type TimelineCardProps = {
  timeline: AdminApplicationTimelineItem[];
};

export default function TimelineCard({ timeline }: TimelineCardProps) {
  return (
    <SectionCard title="İşlem Geçmişi" icon={<IconClock size={19} />}>
      <Stack spacing={1.2}>
        {timeline.map((item) => (
          <TimelineRow key={item.id} item={item} />
        ))}
      </Stack>
    </SectionCard>
  );
}

function TimelineRow({ item }: { item: AdminApplicationTimelineItem }) {
  const theme = useTheme<Theme>();

  return (
    <Stack direction="row" spacing={1.1}>
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          bgcolor: "primary.main",
          mt: 0.8,
          flexShrink: 0,
        }}
      />

      <Box
        sx={{
          pb: 1,
          borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.06)}`,
          flex: 1,
        }}
      >
        <Typography fontWeight={900}>{item.action}</Typography>

        <Typography variant="caption" color="text.secondary">
          {item.actorName} · {item.occurredAt}
        </Typography>

        {item.note && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
            {item.note}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}