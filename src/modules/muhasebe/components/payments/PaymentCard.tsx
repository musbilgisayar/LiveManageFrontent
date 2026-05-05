"use client";

import React from "react";
import {
  alpha,
  Avatar,
  Badge,
  Box,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  Zoom,
  useTheme,
} from "@mui/material";
import {
  IconArchive,
  IconCoin,
  IconCopy,
  IconCreditCard,
  IconEdit,
  IconEye,
  IconTrash,
} from "@tabler/icons-react";

import type { PaymentItem } from "@/modules/muhasebe/types/payment.types";
import {
  formatPaymentMoney,
  formatPaymentShortDate,
  PAYMENT_STATUS_OPTIONS,
} from "@/modules/muhasebe/utils/muhasebePayment.utils";

interface Props {
  item: PaymentItem;
  selected: boolean;
  onSelect: (id: string) => void;
  onView: (item: PaymentItem) => void;
  onEdit: (item: PaymentItem) => void;
  onDelete: (item: PaymentItem) => void;
  onDuplicate: (item: PaymentItem) => void;
  onArchive: (item: PaymentItem) => void;
}

export default function PaymentCard({
  item,
  selected,
  onSelect,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onArchive,
}: Props) {
  const theme = useTheme();
  const status = PAYMENT_STATUS_OPTIONS.find((s) => s.value === item.status)!;

  return (
    <Zoom in>
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
          transition: "0.2s",
          "&:hover": {
            borderColor: alpha(theme.palette.primary.main, 0.2),
            transform: "translateY(-2px)",
          },
          ...(selected && {
            borderColor: theme.palette.primary.main,
            bgcolor: alpha(theme.palette.primary.main, 0.02),
          }),
        }}
      >
        <CardContent>
          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between">
              <Stack direction="row" spacing={1}>
                <Badge variant="dot">
                  <Avatar sx={{ bgcolor: alpha("#10b981", 0.1), color: "#10b981" }}>
                    <IconCoin size={18} />
                  </Avatar>
                </Badge>

                <Box>
                  <Typography fontWeight={800}>{item.payerName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.unit || "-"}
                  </Typography>
                </Box>
              </Stack>

              <Checkbox
                checked={selected}
                onChange={() => onSelect(item.id)}
                size="small"
              />
            </Stack>

            <Typography variant="body2" color="text.secondary">
              {item.description || "Açıklama yok"}
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                size="small"
                label={status.label}
                sx={{
                  bgcolor: alpha(status.color, 0.1),
                  color: status.color,
                }}
              />

              {item.receiptNo && (
                <Chip size="small" label={item.receiptNo} variant="outlined" />
              )}
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Box>
                <Typography fontWeight={800} color="success.main">
                  {formatPaymentMoney(item.amount, item.currency)}
                </Typography>
                <Typography variant="caption">
                  {formatPaymentShortDate(item.paymentDate)}
                </Typography>
              </Box>

              <Stack direction="row">
                <Tooltip title="Düzenle">
                  <IconButton size="small" onClick={() => onEdit(item)}>
                    <IconEdit size={16} />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Kopyala">
                  <IconButton size="small" onClick={() => onDuplicate(item)}>
                    <IconCopy size={16} />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Arşivle">
                  <IconButton size="small" onClick={() => onArchive(item)}>
                    <IconArchive size={16} />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Detay">
                  <IconButton size="small" onClick={() => onView(item)}>
                    <IconEye size={16} />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Sil">
                  <IconButton size="small" color="error" onClick={() => onDelete(item)}>
                    <IconTrash size={16} />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>

            <Divider />

            <Typography variant="caption">
              {item.cashAccount}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Zoom>
  );
}