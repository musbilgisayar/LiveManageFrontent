"use client";

import React from "react";
import {
  alpha,
  Avatar,
  Checkbox,
  Chip,
  IconButton,
  Stack,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  IconArchive,
  IconCheck,
  IconCopy,
  IconEdit,
  IconEye,
  IconHome,
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
} from "@/modules/muhasebe/utils/muhasebeCharge.utils";

interface ChargeRowProps {
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

export default function ChargeRow({
  item,
  selected,
  onSelect,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onPost,
  onCancel,
}: ChargeRowProps) {
  const theme = useTheme();
  const typeConfig = getChargeTypeConfig(item.chargeType);
  const paymentState = getPaymentState(item);
  const paymentColor = getPaymentStateColor(paymentState);
  const statusConfig = getChargeStatusConfig(item.status);

  return (
    <TableRow hover selected={selected}>
      <TableCell padding="checkbox" sx={{ width: 56 }}>
        <Checkbox checked={selected} onChange={() => onSelect(item.id)} />
      </TableCell>

      <TableCell sx={{ width: 230 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: alpha(typeConfig.color, 0.12),
              color: typeConfig.color,
              flexShrink: 0,
            }}
          >
            <IconHome size={16} />
          </Avatar>

          <Stack sx={{ minWidth: 0 }}>
            <Typography fontWeight={700} noWrap>
              {item.unit}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {item.residentName}
            </Typography>
          </Stack>
        </Stack>
      </TableCell>

      <TableCell sx={{ width: 150 }}>
        <Chip
          size="small"
          label={item.chargeTypeLabel}
          sx={{
            bgcolor: alpha(typeConfig.color, 0.1),
            color: typeConfig.color,
            fontWeight: 700,
          }}
        />
      </TableCell>

      <TableCell sx={{ width: 110 }}>{item.period}</TableCell>

      <TableCell align="right" sx={{ width: 120 }}>
        <Typography fontWeight={900}>
          {formatChargeMoney(item.amount, item.currency)}
        </Typography>
      </TableCell>

      <TableCell align="right" sx={{ width: 120 }}>
        <Typography fontWeight={800} color="success.main">
          {formatChargeMoney(item.paidAmount, item.currency)}
        </Typography>
      </TableCell>

      <TableCell align="right" sx={{ width: 120 }}>
        <Typography
          fontWeight={800}
          color={getRemainingAmount(item) > 0 ? "error.main" : "success.main"}
        >
          {formatChargeMoney(getRemainingAmount(item), item.currency)}
        </Typography>
      </TableCell>

      <TableCell sx={{ width: 120 }}>{formatChargeShortDate(item.dueDate)}</TableCell>

      <TableCell sx={{ width: 210 }}>
        <Stack direction="row" spacing={0.75}>
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
        </Stack>
      </TableCell>

      <TableCell align="center" sx={{ width: 150 }}>
        <Stack direction="row" spacing={0.5} justifyContent="center">
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
      </TableCell>
    </TableRow>
  );
}