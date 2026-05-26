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
  onPasswordCreated?: () => void | Promise<void>;
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

  if (score >= 70) return { score, level: "strong" };
  if (score >= 45) return { score, level: "medium" };

  return { score, level: "weak" };
}

function isPasswordAlreadyExistsError(e: any): boolean {
  const payload = e?.payload;

  const values = [
    e?.message,
    payload?.message,
    payload?.userMessage,
    payload?.error,
    payload?.code,
    payload?.errorCode,
    payload?.type,
    payload?.data?.errorCode,
  ];

  return values.some((x) =>
    String(x ?? "").includes("PasswordAlreadyExists")
  );
}

function extractBestErrorMessage(
  e: any,
  t: (key: string, params?: Record<string, any>) => string
): string {
  const payload = e?.payload;

  const direct =
    payload?.userMessage ||
    payload?.message ||
    payload?.error ||
    payload?.title ||
    e?.message;

  if (typeof direct === "string" && direct.trim()) {
    if (direct.includes("PasswordAlreadyExists")) {
      return (
        t("account:password.errors.alreadyExists") ||
        "Bu hesapta zaten şifre mevcut."
      );
    }

    return direct;
  }

  return t("account:password.error") || "İşlem sırasında hata oluştu.";
}

export default function CreatePasswordCard({ onPasswordCreated }: Props) {
  const { t } = useI18nNs(["account", "common"]);

  const [newPwd, setNewPwd] = useState("");
  const [repeatPwd, setRepeatPwd] = useState("");

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
        label:
          t("account:password.rules.minLen", { minLen }) ||
          `En az ${minLen} karakter`,
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
    ];
  }, [newPwd, repeatPwd, t]);

  const strength = useMemo(() => calcPasswordStrength(newPwd), [newPwd]);

  const strengthLabel = useMemo(() => {
    const text = t(`account:password.strength.${strength.level}`);
    if (typeof text === "string" && text.trim()) return text;

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
    () => rules.filter((x) => x.ok).length,
    [rules]
  );

  const validationError = useMemo(() => {
    const n = newPwd.trim();
    const r = repeatPwd.trim();

    if (!n || !r) {
      return t("account:password.required") || "Lütfen tüm alanları doldurun.";
    }

    if (n.length < minLen) {
      return (
        t("account:password.short") ||
        `Şifre en az ${minLen} karakter olmalı.`
      );
    }

    if (n !== r) {
      return t("account:password.mismatch") || "Yeni şifreler eşleşmiyor.";
    }

    return null;
  }, [newPwd, repeatPwd, t]);

  const canSubmit = !saving && validationError === null;

  const handleCapsLock = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLockOn(e.getModifierState?.("CapsLock") || false);
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
    setNewPwd("");
    setRepeatPwd("");
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

    setSaving(true);

    try {
      const json: any = await postWebFetcher("/api/v1.0/account/create-password", {
        newPassword: newPwd,
        confirmPassword: repeatPwd,
      });

      const ok = json?.ok ?? json?.success ?? true;

      if (ok === false) {
        const error: any = new Error(
          json?.userMessage ||
            json?.message ||
            json?.error ||
            t("account:password.error") ||
            "İşlem başarısız."
        );

        error.payload = json;
        throw error;
      }

      setSavedMessage(
        json?.userMessage ||
          json?.message ||
          t("account:password.createSuccess") ||
          "Şifreniz başarıyla oluşturuldu."
      );

      resetForm();
      await onPasswordCreated?.();
    } catch (e: any) {
      if (isPasswordAlreadyExistsError(e)) {
        setSavedMessage(
          t("account:password.alreadyExistsSwitchingToChange") ||
            "Bu hesapta zaten şifre mevcut. Şifre değiştirme moduna geçildi."
        );
        setError(null);
        resetForm();
        await onPasswordCreated?.();
        return;
      }

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
                {t("account:password.createTitle") || "Şifre Oluştur"}
              </Typography>

              <Typography variant="body2" sx={{ opacity: 0.92, mt: 0.5 }}>
                {t("account:password.createDesc") ||
                  "Hesabınız için şifre oluşturarak e-posta ve şifre ile de giriş yapabilirsiniz."}
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
          <Alert
            severity="warning"
            icon={<IconAlertTriangle size={18} />}
            sx={{ mb: 2, borderRadius: 2.5 }}
          >
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

        {!savedMessage && (
          <Alert severity="info" sx={{ mb: 2, borderRadius: 2.5 }}>
            {t("account:password.createInfo") ||
              "Google ile giriş yapıyorsunuz. Şifre oluşturduktan sonra hesabınıza hem Google hem e-posta/şifre ile giriş yapabilirsiniz."}
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
                      <IconPassword size={18} />
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
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >
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

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: "block" }}
                  >
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
            {t("account:password.createFooterNote") ||
              "Şifre oluşturduktan sonra hem sosyal giriş hem de e-posta/şifre ile giriş yapabilirsiniz."}
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
            {t("account:password.createButton") || "Şifre oluştur"}
          </Button>
        </Stack>
      </Box>
    </BlankCard>
  );
}