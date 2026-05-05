"use client";

import React from "react";
import {
  alpha,
  Avatar,
  Badge,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
  Zoom,
} from "@mui/material";
import {
  IconArchive,
  IconCheck,
  IconCopy,
  IconEdit,
  IconEye,
  IconReceiptTax,
  IconTrash,
} from "@tabler/icons-react";

import type { ChargeItem } from "@/modules/muhasebe/types/MuhasebeCharge.types";
import {
  formatChargeMoney,
  formatChargeShortDate,
  getChargeStatusConfig,
  getChargeTypeConfig,
  getPaymentState,
  getPaymentStateColor,
  getPaymentStateLabel,
  getRemainingAmount,
  isChargeOverdue,
} from "@/modules/muhasebe/utils/muhasebeCharge.utils";

interface ChargeCardProps {
  item: ChargeItem;
  selected: boolean;
  onSelect: (id: string) => void;
  onView: (item: ChargeItem) => void;
  onEdit: (item: ChargeItem) => void;
  onDelete: (item: ChargeItem) => void;
  onDuplicate: (item: ChargeItem) => void;
  onPost: (item: ChargeItem) => void;
  onCancel: (item: ChargeItem) => void;
}

export default function ChargeCard({
  item,
  selected,
  onSelect,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onPost,
  onCancel,
}: ChargeCardProps) {
  const theme = useTheme();
  const typeConfig = getChargeTypeConfig(item.chargeType);
  const paymentState = getPaymentState(item);
  const paymentColor = getPaymentStateColor(paymentState);
  const statusConfig = getChargeStatusConfig(item.status);
  const remaining = getRemainingAmount(item);

  return (
    <Zoom in style={{ transitionDelay: "50ms" }}>
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: alpha(typeConfig.color, 0.25),
            boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.06)}`,
            transform: "translateY(-2px)",
          },
          ...(selected && {
            borderColor: theme.palette.primary.main,
            bgcolor: alpha(theme.palette.primary.main, 0.02),
          }),
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Badge
                  variant="dot"
                  color={
                    paymentState === "paid"
                      ? "success"
                      : paymentState === "partial"
                        ? "warning"
                        : "error"
                  }
                  anchorOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  <Avatar
                    sx={{
                      width: 44,
                      height: 44,
                      bgcolor: alpha(typeConfig.color, 0.12),
                      color: typeConfig.color,
                    }}
                  >
                    <IconReceiptTax size={18} />
                  </Avatar>
                </Badge>

                <Stack spacing={0.25}>
                  <Typography fontWeight={800}>{item.unit}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.residentName}
                  </Typography>
                </Stack>
              </Stack>

              <Checkbox checked={selected} onChange={() => onSelect(item.id)} size="small" />
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>
              {item.description ||
                `${item.period} dönemi ${item.chargeTypeLabel.toLowerCase()} tahakkuku`}
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                size="small"
                label={item.chargeTypeLabel}
                sx={{
                  bgcolor: alpha(typeConfig.color, 0.1),
                  color: typeConfig.color,
                  fontWeight: 700,
                }}
              />
              <Chip
                size="small"
                label={statusConfig.label}
                sx={{
                  bgcolor: alpha(statusConfig.color, 0.1),
                  color: statusConfig.color,
                  fontWeight: 700,
                }}
              />
              <Chip
                size="small"
                label={getPaymentStateLabel(paymentState)}
                sx={{
                  bgcolor: alpha(paymentColor, 0.1),
                  color: paymentColor,
                  fontWeight: 700,
                }}
              />
              {isChargeOverdue(item) && (
                <Chip size="small" label="Vadesi Geçti" color="error" variant="filled" />
              )}
            </Stack>

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  Borç
                </Typography>
                <Typography fontWeight={900}>
                  {formatChargeMoney(item.amount, item.currency)}
                </Typography>
              </Grid>

              <Grid size={{ xs: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  Tahsil
                </Typography>
                <Typography fontWeight={900} color="success.main">
                  {formatChargeMoney(item.paidAmount, item.currency)}
                </Typography>
              </Grid>

              <Grid size={{ xs: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  Kalan
                </Typography>
                <Typography fontWeight={900} color={remaining > 0 ? "error.main" : "success.main"}>
                  {formatChargeMoney(remaining, item.currency)}
                </Typography>
              </Grid>
            </Grid>

            <Divider />

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack spacing={0.25}>
                <Typography variant="caption" color="text.secondary">
                  Vade
                </Typography>
                <Typography fontWeight={800}>{formatChargeShortDate(item.dueDate)}</Typography>
              </Stack>

              <Stack direction="row" spacing={0.5}>
                {item.status === "draft" && (
                  <Tooltip title="Kesinleştir">
                    <IconButton size="small" color="success" onClick={() => onPost(item)}>
                      <IconCheck size={16} />
                    </IconButton>
                  </Tooltip>
                )}

                <Tooltip title="Düzenle">
                  <IconButton size="small" onClick={() => onEdit(item)} disabled={item.status !== "draft"}>
                    <IconEdit size={16} />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Kopyala">
                  <IconButton size="small" onClick={() => onDuplicate(item)}>
                    <IconCopy size={16} />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Detay">
                  <IconButton size="small" onClick={() => onView(item)}>
                    <IconEye size={16} />
                  </IconButton>
                </Tooltip>

                {item.status === "draft" ? (
                  <Tooltip title="Sil">
                    <IconButton size="small" color="error" onClick={() => onDelete(item)}>
                      <IconTrash size={16} />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Tooltip title="İptal Et">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onCancel(item)}
                      disabled={item.status === "cancelled"}
                    >
                      <IconArchive size={16} />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            </Stack>

            <Typography variant="caption" color="text.secondary">
              {item.referenceNo} • {formatChargeShortDate(item.createdAt)}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Zoom>
  );
}