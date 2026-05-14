// src/modules/monitoring/views/MonitoringDashboardView.tsx

"use client";

import React from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";

import { useI18nNs } from "@/app/context/i18nContext";

import {
  IconLogin,
  IconLock,
  IconShieldCheck,
  IconAlertTriangle,
  IconWorld,
  IconChartBar,
} from "@tabler/icons-react";

import MonitoringSummaryCard from "../components/dashboard/MonitoringSummaryCard";
import { useMonitoringSummary } from "../hooks/useMonitoringSummary";

function SectionGrid({
  children,
  columns = 3,
}: {
  children: React.ReactNode;
  columns?: number;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: `repeat(${columns}, 1fr)`,
        },
        gap: 2,
      }}
    >
      {children}
    </Box>
  );
}

export default function MonitoringDashboardView() {
  const { t } = useI18nNs(["monitoring", "common"]);
  const { summary, isLoading, error, refresh } = useMonitoringSummary();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={4}>
        <Alert severity="error">{error}</Alert>
        <Box mt={2}>
          <Button variant="contained" onClick={refresh}>
            {t("common:retry", { defaultValue: "Tekrar Dene" })}
          </Button>
        </Box>
      </Box>
    );
  }

  if (!summary) return null;

  return (
    <Box>
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={600}>
          {t("monitoring:dashboard.title", {
            defaultValue: "Monitoring Dashboard",
          })}
        </Typography>

        <Button variant="outlined" onClick={refresh}>
          {t("common:refresh", { defaultValue: "Yenile" })}
        </Button>
      </Box>

      {/* 🔒 ACTIVE */}
      <Typography variant="subtitle1" mb={2}>
        {t("monitoring:dashboard.active", {
          defaultValue: "Aktif Durumlar",
        })}
      </Typography>

      <Box mb={4}>
        <SectionGrid columns={2}>
          <MonitoringSummaryCard
            title={t("monitoring:cards.userLockout.title", {
              defaultValue: "Aktif User Lockout",
            })}
            value={summary.active.userLockoutCount}
            description={t("monitoring:cards.userLockout.desc", {
              defaultValue: "Şu anda kilitli kullanıcı sayısı",
            })}
            icon={<IconLock size={20} />}
            tone="danger"
            href="/monitoring/lockouts"
          />

          <MonitoringSummaryCard
            title={t("monitoring:cards.ipLockout.title", {
              defaultValue: "Aktif IP Lockout",
            })}
            value={summary.active.ipLockoutCount}
            description={t("monitoring:cards.ipLockout.desc", {
              defaultValue: "Şu anda engellenmiş IP adresleri",
            })}
            icon={<IconShieldCheck size={20} />}
            tone="warning"
            href="/monitoring/lockouts"
          />
        </SectionGrid>
      </Box>

      {/* 📊 LAST 24 HOURS */}
      <Typography variant="subtitle1" mb={2}>
        {t("monitoring:dashboard.last24", {
          defaultValue: "Son 24 Saat",
        })}
      </Typography>

      <Box mb={4}>
        <SectionGrid columns={3}>
          <MonitoringSummaryCard
            title={t("monitoring:cards.failedLogin.title", {
              defaultValue: "Başarısız Login",
            })}
            value={summary.last24Hours.failedLoginCount}
            description={t("monitoring:cards.failedLogin.desc", {
              defaultValue: "Başarısız giriş denemeleri",
            })}
            icon={<IconAlertTriangle size={20} />}
            tone="warning"
            href="/monitoring/security-timeline"
          />

          <MonitoringSummaryCard
            title={t("monitoring:cards.successLogin.title", {
              defaultValue: "Başarılı Login",
            })}
            value={summary.last24Hours.successfulLoginCount}
            description={t("monitoring:cards.successLogin.desc", {
              defaultValue: "Başarılı girişler",
            })}
            icon={<IconLogin size={20} />}
            tone="success"
          />

          <MonitoringSummaryCard
            title={t("monitoring:cards.lockoutDecision.title", {
              defaultValue: "Lockout Decision",
            })}
            value={summary.last24Hours.lockoutDecisionCount}
            description={t("monitoring:cards.lockoutDecision.desc", {
              defaultValue: "Kilitlenme kararları",
            })}
            icon={<IconLock size={20} />}
            tone="danger"
            href="/monitoring/security-timeline"
          />

          <MonitoringSummaryCard
            title={t("monitoring:cards.sensitiveAudit.title", {
              defaultValue: "Sensitive Audit",
            })}
            value={summary.last24Hours.sensitiveAuditCount}
            description={t("monitoring:cards.sensitiveAudit.desc", {
              defaultValue: "Hassas veri erişimleri",
            })}
            icon={<IconShieldCheck size={20} />}
            tone="info"
          />

          <MonitoringSummaryCard
            title={t("monitoring:cards.notFound.title", {
              defaultValue: "Not Found",
            })}
            value={summary.last24Hours.notFoundCount}
            description={t("monitoring:cards.notFound.desc", {
              defaultValue: "404 istekleri",
            })}
            icon={<IconWorld size={20} />}
            tone="default"
          />
        </SectionGrid>
      </Box>

      {/* ⚠️ RISK */}
      <Typography variant="subtitle1" mb={2}>
        {t("monitoring:dashboard.risk", {
          defaultValue: "Risk Dağılımı",
        })}
      </Typography>

      <SectionGrid columns={4}>
        {summary.riskDistribution.map((item) => (
          <MonitoringSummaryCard
            key={item.level}
            title={item.level.toUpperCase()}
            value={item.count}
            icon={<IconChartBar size={20} />}
            tone={
              item.level === "critical"
                ? "danger"
                : item.level === "high"
                ? "warning"
                : item.level === "medium"
                ? "info"
                : "default"
            }
          />
        ))}
      </SectionGrid>
    </Box>
  );
}
