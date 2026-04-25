'use client';

import React, { useState } from "react";
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Button,
  Stack,
  Divider,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
} from "@mui/material";
import { setCookie } from "@/utils/setCookie";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomCheckbox from "@/app/components/forms/theme-elements/CustomCheckbox";
import CustomTextField from "@/app/components/forms/theme-elements/CustomTextField";
import CustomFormLabel from "@/app/components/forms/theme-elements/CustomFormLabel";
import AuthSocialButtons from "./AuthSocialButtons";
import { useI18nNs } from "@/app/context/i18nContext";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { localeHref } from "@/app/components/shared/LocaleLink";

/* ========================= Utils: Güvenli Log ========================= */

const DEBUG_AUTH_LOGIN =
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_DEBUG_AUTH_LOGIN === "true";

const now = () =>
  new Date().toLocaleString("tr-TR", { hour12: false });

const createTraceId = () => {
  const base = Math.random().toString(36).slice(2, 8).toUpperCase();
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate()
  ).padStart(2, "0")}-${base}`;
};

const maskEmailLike = (v?: string) =>
  !v
    ? ""
    : v.includes("@")
    ? `${v.split("@")[0].slice(0, 4)}***@${v.split("@")[1]}`
    : v;

const maskToken = (t?: string) =>
  !t ? "" : `${t.slice(0, 12)}... (len=${t.length})`;

const authLog = (lvl: "log" | "warn" | "error", trace: string, ...msg: any[]) => {
  if (lvl === "log" && !DEBUG_AUTH_LOGIN) return;
  console[lvl](`[AuthLogin][${trace}] ${now()} —`, ...msg);
};

/* ========================= Validasyon ========================= */

const schema = z.object({
  username: z.string().min(1, { message: "Validation:Username.Required" }),
  password: z.string().min(1, { message: "Validation:Password.Required" }),
});

/* ========================= Types ========================= */

type LoginBody = { username: string; password: string };

type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string | null | object;
  details?: Record<string, string[]>;
};

type LoginData = {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  user?: { id?: string; displayName?: string; role?: string };
  redirectTo?: string;
};

/* ========================= Component ========================= */

interface Props {
  title?: string;
  subtitle?: React.ReactNode;
  subtext?: React.ReactNode;
  onChangeView?: (view: "login" | "register" | "forgot" | "twoSteps") => void;
  onNavigate?: (view: "login" | "register" | "forgot") => void;
}

const AuthLogin = ({ title, subtitle, subtext, onNavigate }: Props) => {
  const { t } = useI18nNs(["auth", "validation"]);
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale || "tr";
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginBody>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const sendClientAudit = async (payload: any) => {
    try {
      await fetch("/api/v1.0/audit/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      authLog("warn", "CLIENT-AUDIT", "[ClientAudit] send failed:", e);
    }
  };

  const onSubmit = async (formData: LoginBody) => {
    const traceId = createTraceId();
    const t0 = performance.now();
    setServerError(null);

    const maskedUser = maskEmailLike(formData.username);
    const returnUrl = searchParams.get("returnUrl") || `/${locale}/dashboard`;
    const url = "/api/v1.0/account/login";

    authLog("log", traceId, `submit start user=${maskedUser} returnUrl=${returnUrl}`);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "x-correlation-id": traceId,
        },
        body: JSON.stringify(formData),
      });

      const rawText = await res.text();
      let result: ApiResponse<LoginData> = { ok: false };

      try {
        result = JSON.parse(rawText || "{}");
      } catch {
        authLog("warn", traceId, "response not JSON");
      }

      if (!res.ok || !result.ok) {
        authLog("warn", traceId, "login failed", {
          resOk: res.ok,
          resultOk: result.ok,
          status: res.status,
        });

        await sendClientAudit({
          event: "LoginFailed",
          traceId,
          username: maskedUser,
          status: res.status,
          serverError: result?.error ?? result?.details,
          timestamp: new Date().toISOString(),
        });

        let msg = t("auth:login.error");

        if (typeof result?.error === "string") {
          const key = result.error.includes(":")
            ? result.error
            : result.error.replace(".", ":");
          msg = t(key) || msg;
        } else if (result?.details) {
          msg = Object.values(result.details).flat()[0] || msg;
        }

        setServerError(msg);
        return;
      }

      const at = result?.data?.accessToken;
      const rt = result?.data?.refreshToken;

      authLog("log", traceId, `login success tokens: at=${!!at} rt=${!!rt}`);

      if (at) {
        localStorage.setItem("accessToken", at);
        setCookie("accessToken", at, 15 * 60);
        authLog("log", traceId, "accessToken stored", maskToken(at));
      }

      if (rt) {
        localStorage.setItem("refreshToken", rt);
        setCookie("refreshToken", rt, 7 * 24 * 60 * 60);
        authLog("log", traceId, "refreshToken stored", maskToken(rt));
      }

      await new Promise((r) => setTimeout(r, 300));

      const backendRedirect = result?.data?.redirectTo || "";
      const userRole = result?.data?.user?.role?.toLowerCase?.() || "user";
      let targetUrl = backendRedirect || returnUrl;

      if (!searchParams.get("returnUrl") && !backendRedirect) {
        const rolePath = [
          "superadmin",
          "admin",
          "manager",
          "staff",
          "employee",
          "auditor",
          "member",
          "user",
        ].includes(userRole)
          ? userRole
          : "user";

        targetUrl = `/${locale}/${rolePath}/dashboard`;
      }

      const cleanedTargetUrl = localeHref(targetUrl, locale);

      authLog("log", traceId, `redirecting to ${cleanedTargetUrl} role=${userRole}`);

      await sendClientAudit({
        event: "LoginSuccess",
        traceId,
        username: maskedUser,
        role: userRole,
        redirect: cleanedTargetUrl,
        timestamp: new Date().toISOString(),
      });

      if (DEBUG_AUTH_LOGIN) {
       
      }

      router.push(cleanedTargetUrl);

      authLog(
        "log",
        traceId,
        `completed in ${(performance.now() - t0).toFixed(0)}ms`
      );
    } catch (err) {
      authLog("error", traceId, "exception", err);
      setServerError(err instanceof Error ? err.message : t("auth:login.error"));

      await sendClientAudit({
        event: "LoginException",
        traceId,
        error: String(err),
        timestamp: new Date().toISOString(),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {title && (
        <Typography fontWeight="700" variant="h3" mb={1}>
          {t("auth:login.title")}
        </Typography>
      )}

      {subtext}
      <AuthSocialButtons />

      <Box mt={3}>
        <Divider>
          <Typography component="span" color="textSecondary" variant="h6" fontWeight="400" px={2}>
            {t("auth:login.or")}
          </Typography>
        </Divider>
      </Box>

      <Stack spacing={2} mt={3}>
        <div>
          <CustomFormLabel htmlFor="username">
            {t("auth:login.username")}
          </CustomFormLabel>
          <CustomTextField id="username" type="text" fullWidth {...register("username")} />
          {errors.username && (
            <Alert severity="error">{t(errors.username.message!)}</Alert>
          )}
        </div>

        <div>
          <CustomFormLabel htmlFor="password">
            {t("auth:login.password")}
          </CustomFormLabel>
          <CustomTextField
            id="password"
            type={showPassword ? "text" : "password"}
            fullWidth
            {...register("password")}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((p) => !p)}
                    edge="end"
                    aria-label={t("auth:login.showPassword")}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {errors.password && (
            <Alert severity="error">{t(errors.password.message!)}</Alert>
          )}
        </div>

        <Stack direction="row" alignItems="center" justifyContent="space-between" my={1}>
          <FormGroup>
            <FormControlLabel
              control={<CustomCheckbox defaultChecked />}
              label={t("auth:login.remember")}
            />
          </FormGroup>

          <Typography
            component="button"
            onClick={() => onNavigate?.("forgot")}
            style={{ background: "none", border: "none", color: "blue", cursor: "pointer" }}
          >
            {t("auth:login.forgot")}
          </Typography>
        </Stack>

        <Button
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            t("auth:login.signIn")
          )}
        </Button>

        {serverError && <Alert severity="error">{serverError}</Alert>}
      </Stack>

      <Stack direction="row" spacing={1} mt={3}>
        <Typography color="textSecondary" variant="h6" fontWeight="400">
          {t("auth:login.newHere")}
        </Typography>
        <Typography
          component="button"
          onClick={() => onNavigate?.("register")}
          style={{ background: "none", border: "none", color: "blue", cursor: "pointer" }}
        >
          {t("auth:login.createAccount")}
        </Typography>
      </Stack>
    </form>
  );
};

export default AuthLogin;