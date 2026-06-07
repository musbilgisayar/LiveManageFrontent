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
      title={resolveNamespacedTranslation(
        t,
        "management-applications:admin.detail.timeline.title",
        "İşlem Geçmişi",
      )}
      icon={<IconClock size={19} />}
    >
      <Stack spacing={1.2}>
        {timeline.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {resolveNamespacedTranslation(
              t,
              "management-applications:admin.detail.timeline.empty",
              "Henüz işlem geçmişi yok.",
            )}
          </Typography>
        ) : (
          timeline.map((item) => (
            <TimelineRow key={item.id} item={item} />
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

  const actionLabel = resolveTimelineActionLabel(t, item.action);
  const actorLabel = resolveTimelineActorLabel(t, item.actorName);

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
        <Typography fontWeight={900} sx={{ overflowWrap: "anywhere" }}>
          {actionLabel}
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ overflowWrap: "anywhere" }}
        >
          {actorLabel} · {item.occurredAt}
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
  action?: string | null,
): string {
  const raw = String(action || "").trim();

  if (!raw) {
    return resolveNamespacedTranslation(
      t,
      "management-applications:admin.detail.timeline.action.unknown",
      "Bilinmeyen işlem",
    );
  }

  return resolveNamespacedTranslation(t, raw, raw);
}

function resolveTimelineActorLabel(
  t: (key: string) => string,
  actorName?: string | null,
): string {
  const raw = String(actorName || "").trim();

  if (!raw || isGuidLike(raw)) {
    return resolveNamespacedTranslation(
      t,
      "management-applications:admin.detail.timeline.actor.system",
      "Sistem",
    );
  }

  return raw;
}

function resolveNamespacedTranslation(
  t: (key: string) => string,
  keyOrText?: string | null,
  fallback = "-",
): string {
  const raw = String(keyOrText || "").trim();

  if (!raw) return fallback;

  const normalizedKey = raw.startsWith("management-applications:")
    ? raw.replace("management-applications:", "")
    : raw;

  const value = t(normalizedKey);

  if (!value) return fallback;
  if (value === raw) return fallback;
  if (value === normalizedKey) return fallback;
  if (value === `[${raw}]`) return fallback;
  if (value === `[${normalizedKey}]`) return fallback;
  if (value === `[management-applications:${normalizedKey}]`) {
    return fallback;
  }

  return value;
}

function isGuidLike(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}