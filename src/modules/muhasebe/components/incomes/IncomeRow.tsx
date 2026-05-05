"use client";

import React from "react";
import {
  alpha,
  Avatar,
  Box,
  Checkbox,
  Chip,
  IconButton,
  Stack,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  IconBuildingBank,
  IconCoin,
  IconCopy,
  IconEye,
  IconReceipt,
  IconReportMoney,
  IconTrash,
} from "@tabler/icons-react";

import type { IncomeItem } from "@/modules/muhasebe/types/income.types";
import {
  formatIncomeMoney,
  formatIncomeShortDate,
  getIncomeCategoryColor,
  INCOME_STATUS_OPTIONS,
} from "@/modules/muhasebe/utils/muhasebeIncome.utils";

function getIncomeCategoryIcon(category: string) {
  if (category === "Kira Geliri") return <IconBuildingBank size={16} />;
  if (category === "Ortak Alan Geliri") return <IconReportMoney size={16} />;
  if (category === "Ceza / Gecikme Geliri") return <IconReceipt size={16} />;

  return <IconCoin size={16} />;
}

interface IncomeRowProps {
  item: IncomeItem;
  selected: boolean;
  onSelect: (id: string) => void;
  onView: (item: IncomeItem) => void;
  onDelete: (item: IncomeItem) => void;
  onDuplicate: (item: IncomeItem) => void;
}

export default function IncomeRow({
  item,
  selected,
  onSelect,
  onView,
  onDelete,
  onDuplicate,
}: IncomeRowProps) {
  const categoryColor = getIncomeCategoryColor(item.category);

  const status =
    INCOME_STATUS_OPTIONS.find((option) => option.value === item.status) ??
    INCOME_STATUS_OPTIONS[0];

  return (
    <TableRow hover selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox checked={selected} onChange={() => onSelect(item.id)} />
      </TableCell>

      <TableCell>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: alpha(categoryColor, 0.12),
              color: categoryColor,
            }}
          >
            {getIncomeCategoryIcon(item.category)}
          </Avatar>

          <Box>
            <Typography fontWeight={600}>{item.category}</Typography>

            <Typography variant="caption" color="text.secondary">
              {item.customerName}
            </Typography>
          </Box>
        </Stack>
      </TableCell>

      <TableCell align="right">
        <Typography
          variant="body2"
          fontFamily="monospace"
          fontWeight={700}
          color="success.main"
        >
          {formatIncomeMoney(item.amount, item.currency)}
        </Typography>
      </TableCell>

      <TableCell>{formatIncomeShortDate(item.incomeDate)}</TableCell>

      <TableCell>
        <Chip
          size="small"
          label={status.label}
          sx={{
            bgcolor: alpha(status.color, 0.1),
            color: status.color,
            fontWeight: 600,
          }}
        />
      </TableCell>

      <TableCell>{item.paymentMethod}</TableCell>

      <TableCell>
        {item.invoiceNo ? (
          <Chip size="small" label={item.invoiceNo} variant="outlined" />
        ) : (
          "-"
        )}
      </TableCell>

      <TableCell align="center">
        <Stack direction="row" spacing={0.5} justifyContent="center">
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

          <Tooltip title="Sil">
            <IconButton size="small" color="error" onClick={() => onDelete(item)}>
              <IconTrash size={16} />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  );
}