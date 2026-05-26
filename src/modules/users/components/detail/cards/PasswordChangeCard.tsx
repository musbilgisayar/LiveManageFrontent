"use client";

import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  Stack,
  TextField,
  Typography,
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
  userId?: string;
  source?: "self" | "admin";
  onPasswordCredentialChanged?: () => void | Promise<void>;
};

type AdminPasswordChangeRequestDto = {
  newPassword: string;
  reason?: string;
  logoutAllSessions?: boolean;
};

type StrengthLevel = "weak" | "medium" | "strong";

function tr(
  t: (key: string, params?: Record<string, any>) => string,
  key: string,
  fallback: string,
  params?: Record<string, any>
) {
  const value = t(key, params);
  if (!value || value === key || value === `[${key}]`) return fallback;
  return value;
}

function calcPasswordStrength(pwd: string): {
  score: number;
  level: StrengthLevel;
} {
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

  if (score >= 70) return { score, level: "strong" };
  if (score >= 45) return { score, level: "medium" };

  return { score, level: "weak" };
}

function mapBackendCodeToKey(code?: string | null): string | null {
  if (!code) return null;

  const normalized = String(code).trim().replace(/^\[|\]$/g, "");

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
    Unauthorized: "common:errors.unauthorized",
    Forbidden: "common:errors.forbidden",
    TooManyRequests: "common:errors.tooManyRequests",
  };

  return map[normalized] ?? null;
}

function extractBestErrorMessage(
  error: any,
  t: (key: string, params?: Record<string, any>) => string
): string {
  const payload = error?.payload;

  const code =
    payload?.errorCode ??
    payload?.code ??
    payload?.type ??
    payload?.data?.errorCode ??
    null;

  const key = mapBackendCodeToKey(code);

  if (key) {
    return tr(t, key, "İşlem sırasında hata oluştu.");
  }

  const directMessage =
    error?.message ||
    payload?.userMessage ||
    payload?.message ||
    payload?.error ||
    payload?.title;

  if (typeof directMessage === "string" && directMessage.trim()) {
    return directMessage;
  }

  const errors = payload?.errors ?? payload?.data?.errors;

  if (errors && typeof errors === "object") {
    for (const field of Object.keys(errors)) {
      const value = (errors as Record<string, unknown>)[field];

      if (Array.isArray(value) && value[0]) return String(value[0]);
      if (typeof value === "string" && value.trim()) return value;
    }
  }

  return tr(t, "account:password.error", "İşlem sırasında hata oluştu.");
}

export default function PasswordChangeCard({
  userId,
  source = "self",
  onPasswordCredentialChanged,
}: Props) {
  const { t } = useI18nNs(["account", "common"]);

  const isAdminMode = source === "admin";
  const minLen = 8;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [saving, setSaving] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const rules = useMemo(() => {
    const current = currentPassword ?? "";
    const next = newPassword ?? "";
    const confirm = confirmPassword ?? "";

    const items = [
      {
        key: "len",
        ok: next.trim().length >= minLen,
        label:
          tr(t, "account:password.rules.minLen", `En az ${minLen} karakter`, {
            minLen,
          }),
      },
      {
        key: "lower",
        ok: /[a-z]/.test(next),
        label: tr(t, "account:password.rules.lower", "En az 1 küçük harf"),
      },
      {
        key: "upper",
        ok: /[A-Z]/.test(next),
        label: tr(t, "account:password.rules.upper", "En az 1 büyük harf"),
      },
      {
        key: "digit",
        ok: /\d/.test(next),
        label: tr(t, "account:password.rules.digit", "En az 1 rakam"),
      },
      {
        key: "symbol",
        ok: /[^A-Za-z0-9]/.test(next),
        label: tr(t, "account:password.rules.symbol", "En az 1 sembol"),
      },
      {
        key: "match",
        ok: next.length > 0 && next === confirm,
        label: tr(t, "account:password.rules.match", "Tekrar şifre ile aynı"),
      },
      {
        key: "notSameAsOld",
        ok: isAdminMode || (next.length > 0 && next !== current),
        label: tr(
          t,
          "account:password.rules.notSameAsOld",
          "Eski şifreyle aynı değil"
        ),
      },
    ];

    return isAdminMode
      ? items.filter((item) => item.key !== "notSameAsOld")
      : items;
  }, [confirmPassword, currentPassword, isAdminMode, newPassword, t]);

  const strength = useMemo(
    () => calcPasswordStrength(newPassword),
    [newPassword]
  );

  const strengthLabel = useMemo(() => {
    const key = `account:password.strength.${strength.level}`;
    const value = t(key);

    if (typeof value === "string" && value.trim() && value !== key) {
      return value;
    }

    if (strength.level === "strong") return "Güçlü";
    if (strength.level === "medium") return "Orta";
    return "Zayıf";
  }, [strength.level, t]);

  const strengthColor = useMemo(() => {
    if (strength.level === "strong") return "success";
    if (strength.level === "medium") return "warning";
    return "default";
  }, [strength.level]);

  const completedRuleCount = useMemo(
    () => rules.filter((rule) => rule.ok).length,
    [rules]
  );

  const validationError = useMemo(() => {
    const current = currentPassword.trim();
    const next = newPassword.trim();
    const confirm = confirmPassword.trim();

    if ((!isAdminMode && !current) || !next || !confirm) {
      return tr(t, "account:password.required", "Lütfen tüm alanları doldurun.");
    }

    if (next.length < minLen) {
      return tr(
        t,
        "account:password.short",
        `Şifre en az ${minLen} karakter olmalı.`
      );
    }

    if (next !== confirm) {
      return tr(t, "account:password.mismatch", "Yeni şifreler eşleşmiyor.");
    }

    if (!isAdminMode && current === next) {
      return tr(
        t,
        "account:password.errors.sameAsOld",
        "Yeni şifre eski şifreyle aynı olamaz."
      );
    }

    return null;
  }, [confirmPassword, currentPassword, isAdminMode, newPassword, t]);

  const canSubmit = !saving && validationError === null;

  function handleCapsLock(event: React.KeyboardEvent<HTMLInputElement>) {
    setCapsLockOn(event.getModifierState?.("CapsLock") || false);
  }

  function resetForm() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setCapsLockOn(false);
  }

  function renderPasswordAdornment(
    visible: boolean,
    onToggle: () => void,
    label: string
  ) {
    return (
      <InputAdornment position="end">
        <IconButton
          edge="end"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onToggle}
          aria-label={label}
          disabled={saving}
        >
          {visible ? <IconEyeOff size={18} /> : <IconEye size={18} />}
        </IconButton>
      </InputAdornment>
    );
  }

  async function handleSubmit() {
    setError(null);
    setSuccessMessage(null);

    if (validationError) {
      setError(validationError);
      return;
    }

    if (isAdminMode && !userId?.trim()) {
      setError(tr(t, "account:password.error", "Geçersiz kullanıcı bilgisi."));
      return;
    }

    setSaving(true);

    try {
      const response = isAdminMode
        ? await postWebFetcher(
            `/api/v1.0/superadmin/users/${encodeURIComponent(
              userId ?? ""
            )}/password-change`,
            {
              newPassword,
              reason: "SuperAdmin kullanıcı detay ekranından parola güncellendi",
              logoutAllSessions: true,
            } as AdminPasswordChangeRequestDto
          )
        : await postWebFetcher("/api/v1.0/account/change-password", {
            currentPassword,
            oldPassword: currentPassword,
            newPassword,
            confirmPassword,
          });

      const ok = response?.ok ?? response?.success ?? true;

      if (ok === false) {
        const requestError: any = new Error(
          response?.userMessage ||
            response?.message ||
            response?.error ||
            tr(t, "account:password.error", "İşlem başarısız.")
        );

        requestError.payload = response;
        throw requestError;
      }

      setSuccessMessage(
        response?.userMessage ||
          response?.message ||
          tr(t, "account:password.success", "Şifreniz başarıyla değiştirildi.")
      );

      resetForm();
      await onPasswordCredentialChanged?.();
    } catch (error: any) {
      setError(extractBestErrorMessage(error, t));
    } finally {
      setSaving(false);
    }
  }

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
                {isAdminMode
                  ? tr(t, "account:password.adminTitle", "Kullanıcı Şifresini Güncelle")
                  : tr(t, "account:password.title", "Şifre Değiştir")}
              </Typography>

              <Typography variant="body2" sx={{ opacity: 0.92, mt: 0.5 }}>
                {isAdminMode
                  ? tr(
                      t,
                      "account:password.adminDesc",
                      "Kullanıcı için yeni ve güvenli bir şifre belirleyin."
                    )
                  : tr(
                      t,
                      "account:password.desc",
                      "Mevcut şifrenizi doğrulayarak yeni şifrenizi belirleyin."
                    )}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {saving && (
          <Stack direction="row" alignItems="center" gap={1} mb={2}>
            <CircularProgress size={16} />
            <Typography variant="body2" color="text.secondary">
              {tr(t, "common:loading", "Kaydediliyor...")}
            </Typography>
          </Stack>
        )}

        {capsLockOn && (
          <Alert
            severity="warning"
            icon={<IconAlertTriangle size={18} />}
            sx={{ mb: 2, borderRadius: 2.5 }}
          >
            {tr(t, "account:password.capsLock", "Caps Lock açık görünüyor.")}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2.5 }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2.5 }}>
            {successMessage}
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
                {!isAdminMode && (
                  <TextField
                    fullWidth
                    label={tr(t, "account:password.current", "Mevcut Şifre")}
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    onKeyUp={handleCapsLock}
                    onKeyDown={handleCapsLock}
                    disabled={saving}
                    slotProps={{
                      input: {
                        endAdornment: renderPasswordAdornment(
                          showCurrentPassword,
                          () => setShowCurrentPassword((value) => !value),
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
                )}

                <TextField
                  fullWidth
                  label={tr(t, "account:password.new", "Yeni Şifre")}
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  onKeyUp={handleCapsLock}
                  onKeyDown={handleCapsLock}
                  disabled={saving}
                  helperText={tr(
                    t,
                    "account:password.hint",
                    `En az ${minLen} karakter. Büyük/küçük harf, rakam ve sembol önerilir.`
                  )}
                  slotProps={{
                    input: {
                      endAdornment: renderPasswordAdornment(
                        showNewPassword,
                        () => setShowNewPassword((value) => !value),
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
                  fullWidth
                  label={tr(
                    t,
                    "account:password.repeat",
                    "Yeni Şifre (Tekrar)"
                  )}
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  onKeyUp={handleCapsLock}
                  onKeyDown={handleCapsLock}
                  disabled={saving}
                  slotProps={{
                    input: {
                      endAdornment: renderPasswordAdornment(
                        showConfirmPassword,
                        () => setShowConfirmPassword((value) => !value),
                        "Toggle confirm password visibility"
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
                      <IconPassword size={18} />
                    </Box>

                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {tr(
                          t,
                          "account:password.rules.title",
                          "Şifre Kuralları"
                        )}
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
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      {tr(t, "account:password.strength.label", "Şifre Gücü")}
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

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: "block" }}
                  >
                    {tr(
                      t,
                      "account:password.strength.note",
                      "Bu gösterge tahminidir. Gerçek kurallar backend tarafından uygulanır."
                    )}
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
                        bgcolor: rule.ok
                          ? "rgba(76, 175, 80, 0.06)"
                          : "transparent",
                        border: "1px solid",
                        borderColor: rule.ok
                          ? "rgba(76, 175, 80, 0.18)"
                          : "transparent",
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
            {isAdminMode
              ? tr(
                  t,
                  "account:password.adminFooterNote",
                  "Admin tarafından yapılan şifre değişiklikleri audit log ile izlenir."
                )
              : tr(
                  t,
                  "account:password.footerNote",
                  "Şifre güncelleme sonrası tüm oturumlar kapatılabilir."
                )}
          </Typography>

          <Button
            variant="contained"
            onClick={handleSubmit}
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
            {isAdminMode
              ? tr(t, "account:password.adminButton", "Şifreyi Güncelle")
              : tr(t, "account:password.changeButton", "Şifreyi Değiştir")}
          </Button>
        </Stack>
      </Box>
    </BlankCard>
  );
}