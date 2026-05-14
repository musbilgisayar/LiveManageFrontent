// components/manager/StatsCards.tsx
"use client";

import {
  Box,
  Card,
  CardContent,
  LinearProgress,
  Typography,
  alpha,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { motion } from "framer-motion";
import {
  Translate as TranslateIcon,
  Language as LanguageIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";

type StatsCardsProps = {
  stats: {
    totalKeys: number;
    totalLanguages: number;
    missingTranslations: number;
    completionRate: number;
  };
  tr: (key: string, fallback: string) => string;
};

const MotionBox = motion(Box);

export default function StatsCards({ stats, tr }: StatsCardsProps) {
  const cards = [
    {
      title: tr("localization:stats.totalKeys", "Toplam Anahtar"),
      value: stats.totalKeys,
      icon: TranslateIcon,
      color: "primary" as const,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      title: tr("localization:stats.activeLanguages", "Aktif Dil"),
      value: stats.totalLanguages,
      icon: LanguageIcon,
      color: "secondary" as const,
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      title: tr("localization:stats.missingTranslations", "Eksik Çeviri"),
      value: stats.missingTranslations,
      icon: WarningIcon,
      color: "warning" as const,
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    },
    {
      title: tr("localization:stats.completionRate", "Tamamlanma Oranı"),
      value: `${stats.completionRate}%`,
      icon: CheckCircleIcon,
      color: "success" as const,
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      progress: stats.completionRate,
    },
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <Grid key={card.title} size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex" }}>
            <MotionBox
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.35 }}
              sx={{ width: "100%" }}
            >
              <Card
                sx={(theme) => ({
                  position: "relative",
                  height: "100%",
                  overflow: "hidden",
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  boxShadow: `0 14px 34px ${alpha(theme.palette.common.black, 0.06)}`,
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: `0 18px 42px ${alpha(theme.palette.common.black, 0.1)}`,
                  },
                })}
              >
                <CardContent sx={{ position: "relative", zIndex: 1, p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: 0.4,
                      }}
                    >
                      {card.title}
                    </Typography>

                    <Box
                      sx={(theme) => ({
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: alpha(theme.palette[card.color].main, 0.1),
                        color: `${card.color}.main`,
                        flexShrink: 0,
                      })}
                    >
                      <Icon fontSize="medium" />
                    </Box>
                  </Box>

                  <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1 }}>
                    {card.value}
                  </Typography>

                  {card.progress !== undefined && (
                    <Box sx={{ mt: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(Math.max(card.progress, 0), 100)}
                        sx={{
                          height: 7,
                          borderRadius: 999,
                          bgcolor: "action.hover",
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 999,
                            background: card.gradient,
                          },
                        }}
                      />
                    </Box>
                  )}
                </CardContent>

                <Box
                  sx={{
                    position: "absolute",
                    top: -32,
                    right: -32,
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    background: card.gradient,
                    opacity: 0.1,
                  }}
                />
              </Card>
            </MotionBox>
          </Grid>
        );
      })}
    </Grid>
  );
}