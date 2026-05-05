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
  if (category === "elevator") return <IconBuildingBank size={18} />;
  if (category === "electricity") return <IconCreditCard size={18} />;
  if (category === "water") return <IconCalendarEvent size={18} />;
  if (category === "garden") return <IconTags size={18} />;
  if (category === "repair") return <span style={{ fontSize: 16 }}>🔧</span>;
  if (category === "insurance") return <IconBuildingBank size={18} />;

  return <IconReceiptTax size={18} />;
}

interface Props {
  item: ExpenseItem;
  selected: boolean;
  onSelect: (id: string) => void;
  onView: (item: ExpenseItem) => void;
  onEdit: (item: ExpenseItem) => void;
  onDelete: (item: ExpenseItem) => void;
  onDuplicate: (item: ExpenseItem) => void;
  onArchive: (item: ExpenseItem) => void;
}

export default function ExpenseCard({
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

  const categoryColor =
    EXPENSE_CATEGORY_COLORS[item.category] ?? EXPENSE_CATEGORY_COLORS.other;

  const status =
    EXPENSE_STATUS_OPTIONS.find((option) => option.value === item.status) ??
    EXPENSE_STATUS_OPTIONS[0];

  return (
    <Zoom in style={{ transitionDelay: "50ms" }}>
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
          transition: "all 0.2s ease",
          position: "relative",
          "&:hover": {
            borderColor: alpha(theme.palette.primary.main, 0.22),
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
                    item.status === "paid"
                      ? "success"
                      : item.status === "pending"
                        ? "warning"
                        : "error"
                  }
                  anchorOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  <Avatar
                    sx={{
                      width: 44,
                      height: 44,
                      bgcolor: alpha(categoryColor, 0.12),
                      color: categoryColor,
                    }}
                  >
                    {getExpenseCategoryIcon(item.category)}
                  </Avatar>
                </Badge>

                <Box>
                  <Typography fontWeight={800} fontSize="1rem">
                    {item.categoryLabel}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    noWrap
                    sx={{ maxWidth: 180 }}
                  >
                    {item.vendor}
                  </Typography>
                </Box>
              </Stack>

              <Checkbox
                checked={selected}
                onChange={() => onSelect(item.id)}
                size="small"
              />
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>
              {item.description || "Açıklama girilmemiş."}
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                size="small"
                label={status.label}
                sx={{
                  bgcolor: alpha(status.color, 0.1),
                  color: status.color,
                  fontWeight: 600,
                }}
              />

              {item.invoiceNo && (
                <Chip
                  size="small"
                  label={`Fatura: ${item.invoiceNo}`}
                  variant="outlined"
                />
              )}
            </Stack>

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6" fontWeight={900}>
                  {formatExpenseMoney(item.amount, item.currency)}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  {formatExpenseShortDate(item.date)}
                </Typography>
              </Box>

              <Stack direction="row" spacing={0.5}>
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

                <Tooltip title={item.isArchived ? "Arşivden Çıkar" : "Arşivle"}>
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

            <Divider sx={{ my: 0.5 }} />

            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="caption" color="text.secondary">
                {getExpenseCashAccountPrefix(item.cashAccount)} {item.cashAccount}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                •
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {formatExpenseShortDate(item.createdAt)}
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Zoom>
  );
}