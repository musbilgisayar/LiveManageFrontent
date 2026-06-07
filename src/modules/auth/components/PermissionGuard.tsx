//bu dosya, belirli izinlere sahip kullanıcıların erişebileceği bir bileşen olan PermissionGuard'ı tanımlar. Bu bileşen, çocuk bileşenlerini sarmalayarak, kullanıcının gerekli izinlere sahip olup olmadığını kontrol eder ve uygun şekilde yönlendirir veya mesaj gösterir.
// src/modules/auth/components/PermissionGuard.tsx

"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { IconArrowBackUp, IconLockAccess } from "@tabler/icons-react";

import { useAuth } from "@/app/context/AuthContext";
import { useI18nNs } from "@/app/context/i18nContext";
import {
  buildLoginUrlWithReturnUrl,
  getCurrentReturnUrl,
} from "@/utils/sessionExpiredRedirect.client";

type PermissionGuardProps = {
  children: React.ReactNode;
  requiredAnyPermissions: string[];
};

const REDIRECT_DELAY_MS = 3000;

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

  const { t } = useI18nNs("auth");

  const locale = resolveLocale(
    params as Record<string, string | string[] | undefined>,
  );

  const { loading, isAuthenticated, hasAnyPermission } = useAuth();

  const allowed = hasAnyPermission(requiredAnyPermissions);

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.replace(
        buildLoginUrlWithReturnUrl(locale, getCurrentReturnUrl()),
      );
      return;
    }

    if (!allowed) {
      const timer = window.setTimeout(() => {
        router.replace(`/${locale}/dashboard`);
      }, REDIRECT_DELAY_MS);

      return () => window.clearTimeout(timer);
    }
  }, [loading, isAuthenticated, allowed, locale, router]);

  if (loading || !isAuthenticated) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
        }}
      >
        <Stack spacing={2} alignItems="center" textAlign="center">
          <CircularProgress size={30} />

          <Typography variant="body2" color="text.secondary">
            {t("permissionGuard.checking")}
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (!allowed) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
        }}
      >
        <Card
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 520,
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Stack spacing={3} alignItems="center" textAlign="center">
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "warning.light",
                  color: "warning.contrastText",
                }}
              >
                <IconLockAccess size={36} />
              </Box>

              <Stack spacing={1}>
                <Typography variant="h5" fontWeight={800}>
                  {t("permissionGuard.deniedTitle")}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {t("permissionGuard.deniedDescription")}
                </Typography>
              </Stack>

              <Alert severity="info" sx={{ width: "100%", textAlign: "left" }}>
                {t("permissionGuard.redirecting")}
              </Alert>

              <Stack direction="row" spacing={1.5} alignItems="center">
                <CircularProgress size={22} />

                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<IconArrowBackUp size={18} />}
                  onClick={() => router.replace(`/${locale}/dashboard`)}
                >
                  {t("permissionGuard.goDashboard")}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return <>{children}</>;
}