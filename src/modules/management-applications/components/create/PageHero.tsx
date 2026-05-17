"use client";

import {
  alpha,
  Box,
  Card,
  Chip,
  LinearProgress,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { IconShieldCheck } from "@tabler/icons-react";
import { useI18nNs } from "@/app/context/i18nContext";

type PageHeroProps = {
  progressValue: number;
  completedStepCount: number;
  totalSteps: number;
};

const NS = "property:managementApplication.create.hero";

export default function PageHero({
  progressValue,
  completedStepCount,
  totalSteps,
}: PageHeroProps) {
  const theme = useTheme<Theme>();
  const { t } = useI18nNs(["property"]);

  const tr = (key: string, fallback: string) => {
    const value = t(`${NS}.${key}`);
    return value && value !== `${NS}.${key}` ? value : fallback;
  };

  return (
    <Card
      variant="outlined"
      sx={{
        p: { xs: 2.25, md: 3 },
        borderRadius: 5,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.08,
        )}, ${alpha(theme.palette.info.main, 0.045)}, ${alpha(
          theme.palette.background.paper,
          0.98,
        )})`,
        boxShadow: `0 22px 70px ${alpha(theme.palette.common.black, 0.07)}`,
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
            label={tr("badge", "Güvenli başvuru süreci")}
            size="small"
            sx={{
              width: "fit-content",
              borderRadius: 999,
              fontWeight: 900,
              bgcolor: alpha(theme.palette.success.main, 0.1),
              color: "success.dark",
              border: `1px solid ${alpha(theme.palette.success.main, 0.18)}`,
              "& .MuiChip-icon": {
                color: "success.main",
              },
            }}
          />

          <Typography
            sx={{
              fontSize: { xs: 23, md: 30 },
              fontWeight: 950,
              letterSpacing: "-0.04em",
              lineHeight: 1.15,
            }}
          >
            {tr("title", "Yönetim başvurunuzu tamamlayın")}
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              maxWidth: 760,
              fontSize: 14.5,
              lineHeight: 1.75,
            }}
          >
            {tr(
              "description",
              "Yapı bilgileri, adres, belgeler ve onaylar sadeleştirilmiş bir akışla toplanır. Eksik alanlar varsa göndermeden önce size gösterilir.",
            )}
          </Typography>
        </Stack>

        <Box
          sx={{
            minWidth: { xs: "100%", md: 280 },
            p: 2,
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
            bgcolor: alpha(theme.palette.background.paper, 0.78),
            boxShadow: `0 14px 40px ${alpha(theme.palette.common.black, 0.045)}`,
          }}
        >
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary" fontWeight={800}>
                {tr("progressLabel", "Tamamlanma")}
              </Typography>

              <Typography variant="body2" fontWeight={950}>
                {progressValue === 0
                  ? tr("notStarted", "Henüz başlanmadı")
                  : `%${progressValue}`}
              </Typography>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={progressValue}
              sx={{
                height: 9,
                borderRadius: 999,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                "& .MuiLinearProgress-bar": {
                  borderRadius: 999,
                },
              }}
            />

            <Typography variant="caption" color="text.secondary">
              {tr("completedSteps", "{completed}/{total} adım tamamlandı.")
                .replace("{completed}", String(completedStepCount))
                .replace("{total}", String(totalSteps))}
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}