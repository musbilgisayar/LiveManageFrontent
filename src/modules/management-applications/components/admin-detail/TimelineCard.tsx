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

import { useI18nNs } from "@/app/context/i18nContext";

import SectionCard from "./shared/SectionCard";

import type {
  AdminApplicationTimelineItem,
} from "../../types/adminManagementApplication.types";

type TimelineCardProps = {
  timeline: AdminApplicationTimelineItem[];
};

export default function TimelineCard({
  timeline,
}: TimelineCardProps) {
  const { t } = useI18nNs("management-applications");

  return (
    <SectionCard
      title={t("admin.detail.timeline.title")}
      icon={<IconClock size={19} />}
    >
      <Stack spacing={1.2}>
        {timeline.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {t("admin.detail.timeline.empty")}
          </Typography>
        ) : (
          timeline.map((item) => (
            <TimelineRow
              key={item.id}
              item={item}
            />
          ))
        )}
      </Stack>
    </SectionCard>
  );
}

function TimelineRow({
  item,
}: {
  item: AdminApplicationTimelineItem;
}) {
  const theme = useTheme<Theme>();
  const { t } = useI18nNs("management-applications");

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
          borderBottom: `1px solid ${alpha(
            theme.palette.text.primary,
            0.06,
          )}`,
          flex: 1,
          minWidth: 0,
        }}
      >
        <Typography
          fontWeight={900}
          sx={{ overflowWrap: "anywhere" }}
        >
          {resolveTimelineActionLabel(t, item.action)}
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ overflowWrap: "anywhere" }}
        >
          {item.actorName} · {item.occurredAt}
        </Typography>

        {item.note && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.35,
              overflowWrap: "anywhere",
            }}
          >
            {item.note}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

function resolveTimelineActionLabel(
  t: (key: string) => string,
  action: string,
) {
  const normalized = String(action || "")
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toLowerCase();

  if (!normalized) {
    return t("admin.detail.timeline.action.unknown");
  }

  const key = `admin.detail.timeline.action.${normalized}`;
  const value = t(key);

  return value === key ? action : value;
}