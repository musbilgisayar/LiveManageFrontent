"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";

import { useAuth } from "@/app/context/AuthContext";

type PermissionGuardProps = {
  children: React.ReactNode;
  requiredAnyPermissions: string[];
};

function resolveLocale(params: Record<string, string | string[] | undefined>) {
  const raw = params.locale;

  if (Array.isArray(raw)) {
    return raw[0] ?? "tr";
  }

  return raw ?? "tr";
}

export default function PermissionGuard({
  children,
  requiredAnyPermissions,
}: PermissionGuardProps) {
  const router = useRouter();
  const params = useParams();

  const locale = resolveLocale(
    params as Record<string, string | string[] | undefined>
  );

  const { loading, isAuthenticated, hasAnyPermission } = useAuth();

  const allowed = hasAnyPermission(requiredAnyPermissions);

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.replace(`/${locale}/auth/login`);
      return;
    }

    if (!allowed) {
      router.replace(`/${locale}/unauthorized`);
    }
  }, [loading, isAuthenticated, allowed, locale, router]);

  if (loading || !isAuthenticated || !allowed) {
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
            Yetki kontrol ediliyor...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return <>{children}</>;
}