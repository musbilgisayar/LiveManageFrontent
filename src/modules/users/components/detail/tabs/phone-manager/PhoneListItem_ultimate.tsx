// src/modules/users/components/detail/tabs/phone-manager/PhoneListItem_ultimate.tsx

"use client";

import React from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  IconEdit,
  IconTrash,
  IconStarFilled,
  IconShieldCheck,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { formatPhoneDisplayUltimate } from "./helpers/phoneDisplay_ultimate";
import type { UserPhoneNumberDtoUltimate } from "@/modules/users/types/UserPhone.types_ultimate";

type TFunctionUltimate = (
  key: string,
  vars?: Record<string, string | number>
) => string;

interface PropsUltimate {
  item: UserPhoneNumberDtoUltimate;
  t: TFunctionUltimate;
  isLast?: boolean;
  onEdit?: (item: UserPhoneNumberDtoUltimate) => void;
  onDelete?: (item: UserPhoneNumberDtoUltimate) => void;
  onVerify?: (item: UserPhoneNumberDtoUltimate) => void;
}

function getPhoneTypeKeyUltimate(phoneType: unknown): string {
  if (typeof phoneType === "string") {
    const normalized = phoneType.trim().toLowerCase();

    if (normalized === "mobile") return "mobile";
    if (normalized === "home") return "home";
    if (normalized === "work") return "work";
    if (normalized === "other") return "other";
  }

  if (typeof phoneType === "number") {
    switch (phoneType) {
      case 0:
        return "mobile";
      case 1:
        return "home";
      case 2:
        return "work";
      case 3:
        return "other";
      default:
        return "other";
    }
  }

  return "other";
}

function shouldShowLabelUltimate(label?: string | null): boolean {
  if (!label) return false;
  const trimmed = label.trim();
  if (!trimmed) return false;

  if (trimmed.length < 2) return false;

  return true;
}

export default function PhoneListItem_ultimate({
  item,
  t,
  isLast = false,
  onEdit,
  onDelete,
  onVerify,
}: PropsUltimate) {
  const phoneTypeKey = getPhoneTypeKeyUltimate(item.phoneType);
  const typeLabel = t(`users:detail.phone.types.${phoneTypeKey}`);
  const showLabel = shouldShowLabelUltimate(item.label);

  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        spacing={2}
        sx={{ py: 1.75 }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            useFlexGap
            flexWrap="wrap"
            sx={{ mb: showLabel ? 0.75 : 0.75 }}
          >
            <Typography
              variant="body1"
              fontWeight={600}
              sx={{ letterSpacing: 0.1 }}
            >
              {formatPhoneDisplayUltimate(item.countryCode, item.phoneNumber)}
            </Typography>

            <Chip
              size="small"
              label={typeLabel}
              variant="outlined"
              sx={{ borderRadius: 999 }}
            />

            {item.isPrimary ? (
              <Chip
                size="small"
                color="primary"
                icon={<IconStarFilled size={14} />}
                label={t("users:detail.phone.primaryBadge")}
                sx={{ borderRadius: 999 }}
              />
            ) : null}

            {item.isVerified ? (
              <Chip
                size="small"
                color="success"
                icon={<IconShieldCheck size={14} />}
                label={t("users:detail.phone.verifiedBadge")}
                sx={{ borderRadius: 999 }}
              />
            ) : (
              <Button
                size="small"
                variant="contained"
                color="warning"
                startIcon={<IconAlertTriangle size={16} />}
                onClick={() => onVerify?.(item)}
                sx={{
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 600,
                  px: 1.5,
                  minWidth: 0,
                }}
              >
                {t("users:detail.phone.verifyButton")}
              </Button>
            )}
          </Stack>

          {showLabel ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {item.label}
            </Typography>
          ) : null}
        </Box>

        <Stack direction="row" spacing={0.5} alignItems="center">
          <Tooltip title={t("common:edit")}>
            <span>
              <IconButton
                size="small"
                onClick={() => onEdit?.(item)}
                sx={{ color: "text.secondary" }}
              >
                <IconEdit size={18} />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title={t("common:delete")}>
            <span>
              <IconButton
                size="small"
                onClick={() => onDelete?.(item)}
                sx={{ color: "text.secondary" }}
              >
                <IconTrash size={18} />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>

      {!isLast ? <Divider /> : null}
    </>
  );
}