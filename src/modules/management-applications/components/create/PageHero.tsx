"use client";

import { alpha, Box, Card, Chip, LinearProgress, Stack, Typography, useTheme } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { IconShieldCheck } from "@tabler/icons-react";

type PageHeroProps = {
  progressValue: number;
  completedStepCount: number;
  totalSteps: number;
};

export default function PageHero({
  progressValue,
  completedStepCount,
  totalSteps,
}: PageHeroProps) {
  const theme = useTheme<Theme>();

  return (
    <Card
      variant="outlined"
      sx={{
        p: { xs: 2.25, md: 3 },
        borderRadius: 5,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.055,
        )}, ${alpha(theme.palette.background.paper, 0.96)})`,
        boxShadow: "0 16px 42px rgba(15, 23, 42, 0.04)",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={2.5}
      >
        <Stack spacing={0.85}>
          <Chip
            icon={<IconShieldCheck size={15} />}
            label="Güvenli başvuru süreci"
            size="small"
            sx={{
              width: "fit-content",
              borderRadius: 999,
              fontWeight: 800,
              bgcolor: alpha(theme.palette.success.main, 0.09),
              color: "success.dark",
            }}
          />

          <Typography
            sx={{
              fontSize: { xs: 23, md: 28 },
              fontWeight: 900,
              letterSpacing: "-0.035em",
              lineHeight: 1.18,
            }}
          >
            Yönetim başvurunuzu tamamlayın
          </Typography>

          <Typography color="text.secondary" sx={{ maxWidth: 760, fontSize: 14 }}>
            Yapı bilgileri, adres, belgeler ve onaylar sadeleştirilmiş bir akışla
            toplanır. Eksik alanlar varsa göndermeden önce size gösterilir.
          </Typography>
        </Stack>

        <Box
          sx={{
            minWidth: { xs: "100%", md: 260 },
            p: 2,
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
            bgcolor: alpha(theme.palette.background.paper, 0.72),
          }}
        >
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary" fontWeight={700}>
                Tamamlanma
              </Typography>
              <Typography variant="body2" fontWeight={900}>
                {progressValue === 0 ? "Henüz başlanmadı" : `%${progressValue}`}
              </Typography>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={progressValue}
              sx={{
                height: 8,
                borderRadius: 999,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                "& .MuiLinearProgress-bar": {
                  borderRadius: 999,
                },
              }}
            />

            <Typography variant="caption" color="text.secondary">
              {completedStepCount}/{totalSteps} adım tamamlandı.
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}