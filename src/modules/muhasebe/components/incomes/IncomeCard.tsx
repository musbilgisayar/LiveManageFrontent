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
  IconCoin,
  IconCopy,
  IconCreditCard,
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
  if (category === "Kira Geliri") return <IconBuildingBank size={18} />;
  if (category === "Ortak Alan Geliri") return <IconReportMoney size={18} />;
  if (category === "Ceza / Gecikme Geliri") return <IconReceipt size={18} />;

  return <IconCoin size={18} />;
}

interface IncomeCardProps {
  item: IncomeItem;
  selected: boolean;
  onSelect: (id: string) => void;
  onView: (item: IncomeItem) => void;
  onDelete: (item: IncomeItem) => void;
  onDuplicate: (item: IncomeItem) => void;
  onArchive: (item: IncomeItem) => void;
}

export default function IncomeCard({
  item,
  selected,
  onSelect,
  onView,
  onDelete,
  onDuplicate,
  onArchive,
}: IncomeCardProps) {
  const theme = useTheme();

  const categoryColor = getIncomeCategoryColor(item.category);

  const status =
    INCOME_STATUS_OPTIONS.find((option) => option.value === item.status) ??
    INCOME_STATUS_OPTIONS[0];

  return (
    <Zoom in style={{ transitionDelay: "50ms" }}>
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
          transition: "all 0.2s ease",
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
                    item.status === "posted"
                      ? "success"
                      : item.status === "draft"
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
                    {getIncomeCategoryIcon(item.category)}
                  </Avatar>
                </Badge>

                <Box>
                  <Typography fontWeight={800} fontSize="1rem">
                    {item.category}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    noWrap
                    sx={{ maxWidth: 180 }}
                  >
                    {item.customerName}
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
                <Chip size="small" label={`Belge: ${item.invoiceNo}`} variant="outlined" />
              )}

              <Chip
                size="small"
                label={item.paymentMethod}
                variant="outlined"
                icon={<IconCreditCard size={12} />}
              />
            </Stack>

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6" fontWeight={900} color="success.main">
                  {formatIncomeMoney(item.amount, item.currency)}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  {formatIncomeShortDate(item.incomeDate)}
                </Typography>
              </Box>

              <Stack direction="row" spacing={0.5}>
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

            <Typography variant="caption" color="text.secondary">
              Oluşturulma: {formatIncomeShortDate(item.createdAt)}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Zoom>
  );
}