//src/modules/auth/components/PermissionGuard.tsx
//bu dosya, belirli izinlere sahip olmayan kullanıcıların erişimini engellemek için kullanılan bir bileşendir. Kullanıcının kimlik doğrulama durumunu ve gerekli izinlere sahip olup olmadığını kontrol eder. Eğer kullanıcı doğrulanmamışsa, giriş sayfasına yönlendirilir. Eğer kullanıcı gerekli izinlere sahip değilse, yetkisiz erişim sayfasına yönlendirilir. İzinler kontrol edilirken, yükleniyor durumunda bir yükleme göstergesi ve mesajı görüntülenir.
"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";

import { useAuth } from "@/app/context/AuthContext";
import {
  buildLoginUrlWithReturnUrl,
  getCurrentReturnUrl,
} from "@/utils/sessionExpiredRedirect.client";

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
    router.replace(buildLoginUrlWithReturnUrl(locale, getCurrentReturnUrl()));
    return;
  }

  if (!allowed) {
    const timer = window.setTimeout(() => {
      router.replace(`/${locale}/dashboard`);
    }, 3000);

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
      <Stack spacing={2} alignItems="center" textAlign="center">
        <Typography variant="h6" fontWeight={700}>
          Bu sayfaya erişim yetkiniz yok.
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Birkaç saniye içinde ana panele yönlendirileceksiniz.
        </Typography>

        <CircularProgress size={24} />
      </Stack>
    </Box>
  );
}


  return <>{children}</>;
}
