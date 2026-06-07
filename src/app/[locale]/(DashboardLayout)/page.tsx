"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";

import { useAuth } from "@/app/context/AuthContext";
import { resolvePanelPathByPermissions } from "@/modules/auth/config/panelAccess.config";
import {
  buildLoginUrlWithReturnUrl,
  getCurrentReturnUrl,
} from "@/utils/sessionExpiredRedirect.client";

function resolveLocale(params: Record<string, string | string[] | undefined>) {
  const raw = params.locale;

  if (Array.isArray(raw)) {
    return raw[0] ?? "tr";
  }

  return raw ?? "tr";
}

export default function DashboardPage() {
  const router = useRouter();
  const params = useParams();

  const locale = resolveLocale(
    params as Record<string, string | string[] | undefined>
  );

  const { loading, isAuthenticated, effectivePermissions } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.replace(buildLoginUrlWithReturnUrl(locale, getCurrentReturnUrl()));
      return;
    }

    const targetPath = resolvePanelPathByPermissions(
      effectivePermissions,
      locale
    );

    router.replace(targetPath);
  }, [loading, isAuthenticated, effectivePermissions, locale, router]);

  return (
    <Box
      sx={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Stack spacing={2} alignItems="center">
        <CircularProgress size={28} />
        <Typography variant="body2" color="text.secondary">
          Panel hazırlanıyor...
        </Typography>
      </Stack>
    </Box>
  );
}
