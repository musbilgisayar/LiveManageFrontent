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
  IconCalendarEvent,
  IconCopy,
  IconCreditCard,
  IconEdit,
  IconEye,
  IconReceiptTax,
  IconTags,
  IconTrash,
} from "@tabler/icons-react";

import type { ExpenseItem } from "@/modules/muhasebe/types/expense.types";
import {
  EXPENSE_CATEGORY_COLORS,
  EXPENSE_STATUS_OPTIONS,
  formatExpenseMoney,
  formatExpenseShortDate,
  getExpenseCashAccountPrefix,
} from "@/modules/muhasebe/utils/muhasebeExpense.utils";

function getExpenseCategoryIcon(category: string) {
  if (category === "elevator") return <IconBuildingBank size={16} />;
  if (category === "electricity") return <IconCreditCard size={16} />;
  if (category === "water") return <IconCalendarEvent size={16} />;
  if (category === "garden") return <IconTags size={16} />;
  if (category === "repair") return <span style={{ fontSize: 14 }}>🔧</span>;
  if (category === "insurance") return <IconBuildingBank size={16} />;

  return <IconReceiptTax size={16} />;
}

interface Props {
  item: ExpenseItem;
  selected: boolean;
  onSelect: (id: string) => void;
  onView: (item: ExpenseItem) => void;
  onEdit: (item: ExpenseItem) => void;
  onDelete: (item: ExpenseItem) => void;
  onDuplicate: (item: ExpenseItem) => void;
}

export default function ExpenseRow({
  item,
  selected,
  onSelect,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
}: Props) {
  const categoryColor =
    EXPENSE_CATEGORY_COLORS[item.category] ?? EXPENSE_CATEGORY_COLORS.other;

  const status =
    EXPENSE_STATUS_OPTIONS.find((option) => option.value === item.status) ??
    EXPENSE_STATUS_OPTIONS[0];

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
            {getExpenseCategoryIcon(item.category)}
          </Avatar>

          <Box>
            <Typography fontWeight={600}>{item.categoryLabel}</Typography>

            <Typography variant="caption" color="text.secondary">
              {item.vendor}
            </Typography>
          </Box>
        </Stack>
      </TableCell>

      <TableCell align="right">
        <Typography variant="body2" fontFamily="monospace" fontWeight={700}>
          {formatExpenseMoney(item.amount, item.currency)}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2">{formatExpenseShortDate(item.date)}</Typography>
      </TableCell>

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

      <TableCell>
        <Typography variant="body2">
          {getExpenseCashAccountPrefix(item.cashAccount)} {item.cashAccount}
        </Typography>
      </TableCell>

      <TableCell>
        {item.invoiceNo ? (
          <Chip size="small" label={item.invoiceNo} variant="outlined" />
        ) : (
          "-"
        )}
      </TableCell>

      <TableCell align="center">
        <Stack direction="row" spacing={0.5} justifyContent="center">
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