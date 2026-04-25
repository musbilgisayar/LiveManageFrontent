"use client";

import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  Stack,
  TextField,
  Typography,
  Chip,
} from "@mui/material";
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconCircleX,
  IconEye,
  IconEyeOff,
   IconPassword,
  IconShieldCheck,
} from "@tabler/icons-react";

import BlankCard from "@/app/components/shared/BlankCard";
import { useI18nNs } from "@/app/context/i18nContext";
import { postWebFetcher } from "@/utils/fetchers.web.client";

type Props = {
  userId: string;
};

type AdminPasswordChangeRequestDto = {
  newPassword: string;
  reason?: string;
  logoutAllSessions?: boolean;
};

type StrengthLevel = "weak" | "medium" | "strong";

function calcPasswordStrength(pwd: string): { score: number; level: StrengthLevel } {
  const p = (pwd ?? "").trim();
  if (!p) return { score: 0, level: "weak" };

  let score = 0;

  if (p.length >= 8) score += 25;
  if (p.length >= 12) score += 15;
  if (p.length >= 16) score += 10;

  if (/[a-z]/.test(p)) score += 15;
  if (/[A-Z]/.test(p)) score += 15;
  if (/\d/.test(p)) score += 10;
  if (/[^A-Za-z0-9]/.test(p)) score += 10;

  if (/^(.)\1+$/.test(p)) score = Math.min(score, 10);
  if (/(1234|abcd|qwer|password|passw0rd|1111|0000)/i.test(p)) {
    score = Math.min(score, 25);
  }

  score = Math.max(0, Math.min(100, score));

  let level: StrengthLevel = "weak";
  if (score >= 70) level = "strong";
  else if (score >= 45) level = "medium";

  return { score, level };
}

function mapBackendCodeToKey(code?: string | null): string | null {
  if (!code) return null;

  const c = String(code).trim();

  const map: Record<string, string> = {
    InvalidOldPassword: "account:password.errors.invalidOld",
    OldPasswordIncorrect: "account:password.errors.invalidOld",
    PasswordMismatch: "account:password.errors.mismatch",
    PasswordTooShort: "account:password.errors.tooShort",
    PasswordTooWeak: "account:password.errors.tooWeak",
    PasswordReused: "account:password.errors.reused",
    PasswordHistoryViolation: "account:password.errors.reused",
    PasswordSameAsOld: "account:password.errors.sameAsOld",
    UserLocked: "account:password.errors.locked",
    TooManyRequests: "common:errors.tooManyRequests",
    Unauthorized: "common:errors.unauthorized",
    Forbidden: "common:errors.forbidden",
  };

  return map[c] ?? null;
}

function extractBestErrorMessage(
  e: any,
  t: (key: string, params?: Record<string, any>) => string
): string {
  const p = e?.payload;

  const code = p?.errorCode ?? p?.code ?? p?.type ?? p?.data?.errorCode ?? null;
  const key = mapBackendCodeToKey(code);

  if (key) {
    const localized = t(key);
    if (typeof localized === "string" && localized.trim()) return localized;
  }

  const direct = e?.message || p?.userMessage || p?.message || p?.error || p?.title;
  if (typeof direct === "string" && direct.trim()) return direct;

  const errors = p?.errors ?? p?.data?.errors;
  if (errors && typeof errors === "object") {
    for (const k of Object.keys(errors)) {
      const v = (errors as any)[k];
      if (Array.isArray(v) && v[0]) return String(v[0]);
      if (typeof v === "string" && v.trim()) return v;
    }
  }

  return t("account:password.error") || "İşlem sırasında hata oluştu.";
}

export function PasswordChangeCard({ userId }: Props) {
  const { t } = useI18nNs(["account", "common"]);

  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [repeatPwd, setRepeatPwd] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);

  const [capsLockOn, setCapsLockOn] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const minLen = 8;

  const rules = useMemo(() => {
    const p = newPwd ?? "";
    const r = repeatPwd ?? "";

    return [
      {
        key: "len",
        ok: p.trim().length >= minLen,
        label: t("account:password.rules.minLen", { minLen }) || `En az ${minLen} karakter`,
      },
      {
        key: "lower",
        ok: /[a-z]/.test(p),
        label: t("account:password.rules.lower") || "En az 1 küçük harf",
      },
      {
        key: "upper",
        ok: /[A-Z]/.test(p),
        label: t("account:password.rules.upper") || "En az 1 büyük harf",
      },
      {
        key: "digit",
        ok: /\d/.test(p),
        label: t("account:password.rules.digit") || "En az 1 rakam",
      },
      {
        key: "symbol",
        ok: /[^A-Za-z0-9]/.test(p),
        label: t("account:password.rules.symbol") || "En az 1 sembol",
      },
      {
        key: "match",
        ok: p.length > 0 && p === r,
        label: t("account:password.rules.match") || "Tekrar şifre ile aynı",
      },
      {
        key: "notSameAsOld",
        ok: p.length > 0 && p !== oldPwd,
        label: t("account:password.rules.notSameAsOld") || "Eski şifreyle aynı değil",
      },
    ];
  }, [newPwd, repeatPwd, oldPwd, t]);

  const strength = useMemo(() => calcPasswordStrength(newPwd), [newPwd]);

  const strengthLabel = useMemo(() => {
    const key = `account:password.strength.${strength.level}`;
    const text = t(key);
    if (typeof text === "string" && text.trim()) return text;
    return strength.level === "strong"
      ? "Güçlü"
      : strength.level === "medium"
      ? "Orta"
      : "Zayıf";
  }, [strength.level, t]);

  const strengthColor = useMemo(() => {
    if (strength.level === "strong") return "success";
    if (strength.level === "medium") return "warning";
    return "default";
  }, [strength.level]);

  const completedRuleCount = useMemo(
    () => rules.filter((x) => x.ok).length,
    [rules]
  );

  const validationError = useMemo(() => {
    const oldTrimmed = oldPwd.trim();
    const n = newPwd.trim();
    const r = repeatPwd.trim();

    if (!oldTrimmed || !n || !r) {
      return t("account:password.required") || "Lütfen tüm alanları doldurun.";
    }

    if (n.length < minLen) {
      return t("account:password.short") || `Şifre en az ${minLen} karakter olmalı.`;
    }

    if (n !== r) {
      return t("account:password.mismatch") || "Yeni şifreler eşleşmiyor.";
    }

    return null;
  }, [oldPwd, newPwd, repeatPwd, t]);

  const canSubmit = !saving && validationError === null;

  const handleCapsLock = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const on = (e.getModifierState && e.getModifierState("CapsLock")) || false;
    setCapsLockOn(on);
  };

  const adornment = (shown: boolean, toggle: () => void, ariaLabel: string) => (
    <InputAdornment position="end">
      <IconButton
        onMouseDown={(e) => e.preventDefault()}
        onClick={toggle}
        edge="end"
        aria-label={ariaLabel}
        disabled={saving}
      >
        {shown ? <IconEyeOff size={18} /> : <IconEye size={18} />}
      </IconButton>
    </InputAdornment>
  );

  const resetForm = () => {
    setOldPwd("");
    setNewPwd("");
    setRepeatPwd("");
    setShowOld(false);
    setShowNew(false);
    setShowRepeat(false);
    setCapsLockOn(false);
  };

  const handleSave = async () => {
    setSavedMessage(null);
    setError(null);

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!userId?.trim()) {
      setError(t("account:password.error") || "Geçersiz kullanıcı kimliği.");
      return;
    }

    setSaving(true);

    try {
      const dto: AdminPasswordChangeRequestDto = {
        newPassword: newPwd,
        reason: "SuperAdmin kullanıcı detay ekranından parola güncellendi",
        logoutAllSessions: true,
      };

      const json: any = await postWebFetcher(
        `/api/v1.0/superadmin/users/${encodeURIComponent(userId)}/password-change`,
        dto
      );

      const ok = json?.ok ?? json?.success ?? true;

      if (ok === false) {
        const code = json?.errorCode ?? json?.code ?? null;
        const key = mapBackendCodeToKey(code);
        const msg =
          (key ? t(key) : null) ||
          json?.userMessage ||
          json?.message ||
          json?.error ||
          t("account:password.error") ||
          "İşlem başarısız.";

        throw new Error(msg);
      }

      setSavedMessage(
        json?.userMessage ||
          json?.message ||
          t("account:password.success") ||
          "Şifre değiştirildi."
      );

      resetForm();
    } catch (e: any) {
      setError(extractBestErrorMessage(e, t));
    } finally {
      setSaving(false);
    }
  };

  return (
    <BlankCard
      sx={{
        borderRadius: 5,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: { xs: 2.5, md: 3 } }}>
        <Box
          sx={{
            mb: 3,
            p: 2.5,
            borderRadius: 3,
            background: "linear-gradient(135deg, #5d86f3 0%, #4b6fe8 100%)",
            color: "common.white",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                bgcolor: "rgba(255,255,255,0.16)",
              }}
            >
              <IconShieldCheck size={22} />
            </Box>

            <Box>
              <Typography variant="h5" fontWeight={700}>
                {t("account:password.title") || "Şifre Değiştir"}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.92, mt: 0.5 }}>
                {t("account:password.desc") || "Güvenliğiniz için güçlü bir şifre belirleyin."}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {saving && (
          <Stack direction="row" alignItems="center" gap={1} mb={2}>
            <CircularProgress size={16} />
            <Typography variant="body2" color="text.secondary">
              {t("common:loading", { defaultValue: "Kaydediliyor..." })}
            </Typography>
          </Stack>
        )}

        {capsLockOn && (
          <Alert severity="warning" icon={<IconAlertTriangle size={18} />} sx={{ mb: 2, borderRadius: 2.5 }}>
            {t("account:password.capsLock") || "Caps Lock açık görünüyor."}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2.5 }}>
            {error}
          </Alert>
        )}

        {savedMessage && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2.5 }}>
            {savedMessage}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <Box
              sx={{
                p: { xs: 2, md: 2.5 },
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 4,
                bgcolor: "background.paper",
                height: "100%",
              }}
            >
              <Stack spacing={2.5}>
                <TextField
                  label={t("account:password.current") || "Mevcut Şifre"}
                  type={showOld ? "text" : "password"}
                  value={oldPwd}
                  onChange={(e) => setOldPwd(e.target.value)}
                  onKeyUp={handleCapsLock}
                  onKeyDown={handleCapsLock}
                  fullWidth
                  disabled={saving}
                  slotProps={{
                    input: {
                      endAdornment: adornment(
                        showOld,
                        () => setShowOld((s) => !s),
                        "Toggle current password visibility"
                      ),
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                />

                <TextField
                  label={t("account:password.new") || "Yeni Şifre"}
                  type={showNew ? "text" : "password"}
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  onKeyUp={handleCapsLock}
                  onKeyDown={handleCapsLock}
                  fullWidth
                  disabled={saving}
                  helperText={
                    t("account:password.hint") ||
                    `En az ${minLen} karakter. Büyük/küçük harf, rakam ve sembol önerilir.`
                  }
                  slotProps={{
                    input: {
                      endAdornment: adornment(
                        showNew,
                        () => setShowNew((s) => !s),
                        "Toggle new password visibility"
                      ),
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                />

                <TextField
                  label={t("account:password.repeat") || "Yeni Şifre (Tekrar)"}
                  type={showRepeat ? "text" : "password"}
                  value={repeatPwd}
                  onChange={(e) => setRepeatPwd(e.target.value)}
                  onKeyUp={handleCapsLock}
                  onKeyDown={handleCapsLock}
                  fullWidth
                  disabled={saving}
                  slotProps={{
                    input: {
                      endAdornment: adornment(
                        showRepeat,
                        () => setShowRepeat((s) => !s),
                        "Toggle repeat password visibility"
                      ),
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                />

                {validationError && !error && (
                  <Typography variant="body2" color="text.secondary">
                    {validationError}
                  </Typography>
                )}
              </Stack>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, lg: 5 }}>
            <Box
              sx={{
                p: { xs: 2, md: 2.5 },
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 4,
                bgcolor: "#fafbff",
                height: "100%",
              }}
            >
              <Stack spacing={2.5}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  flexWrap="wrap"
                  gap={1}
                >
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        display: "grid",
                        placeItems: "center",
                        bgcolor: "primary.light",
                        color: "primary.main",
                      }}
                    >
                      < IconPassword size={18} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {t("account:password.rules.title") || "Şifre Kuralları"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {completedRuleCount}/{rules.length} tamamlandı
                      </Typography>
                    </Box>
                  </Stack>

                  <Chip
                    size="small"
                    color={strengthColor}
                    label={strengthLabel}
                    variant={strengthColor === "default" ? "outlined" : "filled"}
                  />
                </Stack>

                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" fontWeight={600}>
                      {t("account:password.strength.label") || "Şifre Gücü"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {strength.score}/100
                    </Typography>
                  </Stack>

                  <LinearProgress
                    variant="determinate"
                    value={strength.score}
                    sx={{
                      height: 10,
                      borderRadius: 999,
                      bgcolor: "grey.200",
                    }}
                  />

                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                    {t("account:password.strength.note") ||
                      "Bu gösterge tahminidir. Gerçek kurallar backend tarafından uygulanır."}
                  </Typography>
                </Box>

                <Stack spacing={0.5}>
                  {rules.map((rule) => (
                    <Stack
                      key={rule.key}
                      direction="row"
                      alignItems="center"
                      spacing={1.25}
                      sx={{
                        py: 1.1,
                        px: 1,
                        borderRadius: 2,
                        bgcolor: rule.ok ? "rgba(76, 175, 80, 0.06)" : "transparent",
                        border: "1px solid",
                        borderColor: rule.ok ? "rgba(76, 175, 80, 0.18)" : "transparent",
                      }}
                    >
                      {rule.ok ? (
                        <IconCircleCheck size={18} color="green" />
                      ) : (
                        <IconCircleX size={18} color="grey" />
                      )}

                      <Typography
                        variant="body2"
                        color={rule.ok ? "text.primary" : "text.secondary"}
                      >
                        {rule.label}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Box>
          </Grid>
        </Grid>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mt={3}
          gap={2}
          flexWrap="wrap"
        >
          <Typography variant="caption" color="text.secondary">
            {t("account:password.footerNote") ||
              "Şifre güncelleme sonrası tüm oturumlar kapatılabilir."}
          </Typography>

          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!canSubmit}
            startIcon={saving ? <CircularProgress size={16} /> : undefined}
            sx={{
              minWidth: 160,
              borderRadius: 999,
              px: 3.5,
              py: 1.1,
              fontWeight: 700,
              textTransform: "none",
              boxShadow: "none",
            }}
          >
            {t("common:button.save") || "Kaydet"}
          </Button>
        </Stack>
      </Box>
    </BlankCard>
  );
}