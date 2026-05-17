// src/modules/auth/components/AuthSocialButtons.tsx

"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Script from "next/script";
import { Avatar, Box } from "@mui/material";
import { Stack } from "@mui/system";

import CustomSocialButton from "@/app/components/forms/theme-elements/CustomSocialButton";
import { useI18nNs } from "@/app/context/i18nContext";
import { setTenantKey } from "@/utils/tenant.client";
import { loginWithGoogleWeb } from "../services/authLogin.service";

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void | Promise<void>;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            use_fedcm_for_prompt?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              shape?: "rectangular" | "pill" | "circle" | "square";
              width?: number | string;
              logo_alignment?: "left" | "center";
              locale?: string;
            }
          ) => void;
        };
      };
    };
  }
}

type Props = {
  locale: string;
  rememberMe: boolean;
  tenantKey: string;
  disabled?: boolean;

  onSuccess: (
    redirectTo: string,
    resolvedTenantKey?: string
  ) => void | Promise<void>;
  onError: (message: string) => void;
  onStart?: () => void;
};

function cultureFromLocale(locale: string) {
  switch ((locale || "tr").split("-")[0].toLowerCase()) {
    case "en":
      return "en-US";
    case "de":
      return "de-DE";
    case "fr":
      return "fr-FR";
    case "it":
      return "it-IT";
    case "ar":
      return "ar-SA";
    default:
      return "tr-TR";
  }
}

function routeLocaleFromCulture(cultureCode: string | undefined, fallbackLocale: string) {
  const locale = (cultureCode || fallbackLocale || "tr")
    .split("-")[0]
    .toLowerCase();

  return ["tr", "en", "de", "fr", "it", "ar"].includes(locale) ? locale : "tr";
}

function withLocalePrefix(redirectTo: string | undefined, locale: string) {
  const fallback = `/${locale}/dashboard`;
  if (!redirectTo) return fallback;
  if (/^https?:\/\//i.test(redirectTo)) return fallback;
  if (/^\/(tr|en|de|fr|it|ar)(\/|$)/i.test(redirectTo)) return redirectTo;
  if (redirectTo.startsWith(`/${locale}/`)) return redirectTo;
  if (redirectTo === `/${locale}`) return redirectTo;
  if (redirectTo.startsWith("/")) return `/${locale}${redirectTo}`;
  return fallback;
}

export default function AuthSocialButtons({
  locale,
  rememberMe,
  tenantKey,
  disabled,
  onSuccess,
  onError,
  onStart,
}: Props) {
  const { t } = useI18nNs(["auth"]);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const tr = useCallback(
    (key: string, fallback: string) => {
      const value = t(key);
      return value === `[${key}]` ? fallback : value;
    },
    [t]
  );

  const googleClientId = useMemo(
    () => process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ?? "",
    []
  );

  const handleGoogleCredential = useCallback(
    async (credential?: string) => {
      if (!credential) {
        setGoogleLoading(false);
        onError(
          tr(
            "auth:external.google.missingCredential",
            "Google oturum bilgisi alınamadı."
          )
        );
        return;
      }

      try {
        setGoogleLoading(true);
        setTenantKey(tenantKey);
        onStart?.();

        const result = await loginWithGoogleWeb({
          idToken: credential,
          clientType: "web",
          deviceId: null,
          rememberMe,
          cultureCode: cultureFromLocale(locale),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });

        if (!result.ok) {
          onError(
            result.userMessage ||
            result.message ||
            result.error ||
            result.title ||
            tr("auth:external.google.error", "Google ile giriş tamamlanamadı.")
          );
          return;
        }

        const resolvedTenantKey =
          result.data?.user?.tenantKey ||
          tenantKey;

        if (resolvedTenantKey) {
          setTenantKey(resolvedTenantKey);

          console.info("[GoogleLogin] Tenant senkronize edildi", {
            requestedTenantKey: tenantKey,
            resolvedTenantKey,
          });
        }

        const redirectLocale = routeLocaleFromCulture(
          result.data?.user?.cultureCode ?? result.data?.cultureCode,
          locale
        );

        await onSuccess(
          withLocalePrefix(result.data?.redirectTo, redirectLocale),
          resolvedTenantKey
        );

        await onSuccess(withLocalePrefix(result.data?.redirectTo, redirectLocale));

      } catch (error) {
        onError(
          error instanceof Error
            ? error.message ||
            tr("auth:external.google.error", "Google ile giriş tamamlanamadı.")
            : tr("auth:external.google.error", "Google ile giriş tamamlanamadı.")
        );
      } finally {
        setGoogleLoading(false);
      }
    },
    [locale, onError, onStart, onSuccess, rememberMe, tenantKey, tr]
  );

  const initializeGoogle = useCallback(() => {
    const googleId = window.google?.accounts?.id;
    const container = googleButtonRef.current;

    if (!googleClientId || !googleId || !container) return;

    googleId.initialize({
      client_id: googleClientId,
      callback: (response) => {
        void handleGoogleCredential(response.credential);
      },
      auto_select: false,
      cancel_on_tap_outside: true,
      use_fedcm_for_prompt: false,
    });

    container.innerHTML = "";
    googleId.renderButton(container, {
      theme: "outline",
      size: "large",
      text: "signin_with",
      shape: "rectangular",
      width: 180,
      logo_alignment: "left",
      locale: (locale || "tr").split("-")[0].toLowerCase(),
    });

    setGoogleReady(true);
  }, [googleClientId, handleGoogleCredential, locale]);

  return (
    <Stack direction="row" justifyContent="center" spacing={2} mt={3}>
      {googleClientId && (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onLoad={initializeGoogle}
        />
      )}

      {googleClientId ? (
        <Box
          ref={googleButtonRef}
          aria-busy={googleLoading}
          sx={{
            minWidth: 180,
            minHeight: 40,
            opacity: disabled || googleLoading || !googleReady ? 0.65 : 1,
            pointerEvents:
              disabled || googleLoading || !googleReady ? "none" : "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        />
      ) : (
        <CustomSocialButton
          type="button"
          disabled
          title={tr(
            "auth:external.google.clientIdMissing",
            "Google giriş yapılandırması eksik."
          )}
        >
          <Avatar
            src="/images/svgs/google-icon.svg"
            alt="Google"
            sx={{ width: 20, height: 20, mr: 1 }}
          />
          {tr("auth:external.google.button", "Google")}
        </CustomSocialButton>
      )}

      <CustomSocialButton type="button" disabled>
        <Avatar
          src="/images/svgs/facebook-icon.svg"
          alt="Facebook"
          sx={{ width: 20, height: 20, mr: 1 }}
        />
        Facebook
      </CustomSocialButton>
    </Stack>
  );
}
