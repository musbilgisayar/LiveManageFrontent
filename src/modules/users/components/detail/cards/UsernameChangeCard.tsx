"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { IconCheck, IconUser } from "@tabler/icons-react";

import BlankCard from "@/app/components/shared/BlankCard";
import CustomFormLabel from "@/app/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/app/components/forms/theme-elements/CustomTextField";
import { useI18nNs } from "@/app/context/i18nContext";
import {
  checkAdminUsernameAvailability,
  UsernameAvailabilityDto,
  UsernameAvailabilityResponse,
} from "@/modules/users/services/superAdminUsers.service";

type SubmitResponse = {
  ok?: boolean;
  message?: string | null;
  userMessage?: string | null;
  data?: unknown;
};

type Props = {
  userId: string;
  currentUserName: string;
  normalizedUserName?: string | null;
  isLoading?: boolean;
  onSubmit: (nextUserName: string) => Promise<SubmitResponse | null>;
  onReload?: () => void;
};

type AvailabilityState = "idle" | "checking" | "valid" | "taken" | "error";

const USERNAME_REGEX = /^[a-zA-Z0-9._-]{3,50}$/;
const AVAILABILITY_DEBOUNCE_MS = 500;

export default function UsernameChangeCard({
  userId,
  currentUserName,
  isLoading = false,
  onSubmit,
  onReload,
}: Props) {
  const theme = useTheme();
  const { t } = useI18nNs(["users", "common"]);

  const tr = (key: string, fallback: string) => {
    const value = t(key);
    return value === `[${key}]` ? fallback : value;
  };

  const [nextUserName, setNextUserName] = useState(currentUserName ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [touched, setTouched] = useState(false);

  const [availabilityState, setAvailabilityState] =
    useState<AvailabilityState>("idle");
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(
    null
  );
  const [availabilityCheckedValue, setAvailabilityCheckedValue] =
    useState<string>("");
  const [availabilityDto, setAvailabilityDto] =
    useState<UsernameAvailabilityDto | null>(null);

  const lastRequestIdRef = useRef(0);

  useEffect(() => {
    setNextUserName(currentUserName ?? "");
    setError(null);
    setSaved(false);
    setTouched(false);
    setAvailabilityState("idle");
    setAvailabilityMessage(null);
    setAvailabilityCheckedValue("");
    setAvailabilityDto(null);
    lastRequestIdRef.current = 0;
  }, [currentUserName, userId]);

  const trimmedCurrent = useMemo(
    () => (currentUserName ?? "").trim(),
    [currentUserName]
  );

  const trimmedNext = useMemo(
    () => (nextUserName ?? "").trim(),
    [nextUserName]
  );

  const isSameAsCurrent = useMemo(() => {
    return trimmedCurrent.toLowerCase() === trimmedNext.toLowerCase();
  }, [trimmedCurrent, trimmedNext]);

  const validationError = useMemo(() => {
    if (!trimmedNext) {
      return tr(
        "users:detail.usernameChange.validation.required",
        "Yeni kullanıcı adı zorunludur."
      );
    }

    if (trimmedNext.length < 3) {
      return tr(
        "users:detail.usernameChange.validation.minLength",
        "Kullanıcı adı en az 3 karakter olmalıdır."
      );
    }

    if (trimmedNext.length > 50) {
      return tr(
        "users:detail.usernameChange.validation.maxLength",
        "Kullanıcı adı en fazla 50 karakter olabilir."
      );
    }

    if (!USERNAME_REGEX.test(trimmedNext)) {
      return tr(
        "users:detail.usernameChange.validation.invalidFormat",
        "Sadece harf, rakam, nokta, alt çizgi ve tire kullanılabilir."
      );
    }

    if (isSameAsCurrent) {
      return tr(
        "users:detail.usernameChange.validation.sameValue",
        "Yeni kullanıcı adı mevcut değerle aynı olamaz."
      );
    }

    return null;
  }, [isSameAsCurrent, trimmedNext]);

  const resolveText = (response?: UsernameAvailabilityResponse | null) => {
    if (response?.userMessage?.trim()) return response.userMessage;

    if (response?.message?.trim()) {
      const translated = t(response.message);
      return translated === `[${response.message}]`
        ? response.message
        : translated;
    }

    return null;
  };

  const resolveAvailabilityMessage = (
    response: UsernameAvailabilityResponse | null | undefined,
    dto: UsernameAvailabilityDto | null
  ): string | null => {
    const backendText = resolveText(response);
    if (backendText) return backendText;

    switch (dto?.reason) {
      case "Taken":
        return tr(
          "users:detail.usernameChange.availability.taken",
          "Kullanıcı adı zaten kullanımda. Başka bir kullanıcı adı deneyiniz."
        );
      case "Cooldown":
        return tr(
          "users:detail.usernameChange.availability.cooldown",
          "Bu kullanıcı adı şu anda değiştirilemez. Lütfen daha sonra tekrar deneyiniz."
        );
      case "Same":
        return tr(
          "users:detail.usernameChange.validation.sameValue",
          "Yeni kullanıcı adı mevcut değerle aynı olamaz."
        );
      case "Invalid":
        return tr(
          "users:detail.usernameChange.validation.invalidFormat",
          "Sadece harf, rakam, nokta, alt çizgi ve tire kullanılabilir."
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    if (!touched) return;

    setAvailabilityState("idle");
    setAvailabilityMessage(null);
    setAvailabilityCheckedValue("");
    setAvailabilityDto(null);

    if (validationError || !trimmedNext) {
      return;
    }

    let isCancelled = false;
    const requestId = ++lastRequestIdRef.current;

    const timer = window.setTimeout(async () => {
      try {
        setAvailabilityState("checking");
        setAvailabilityMessage(
          tr(
            "users:detail.usernameChange.availability.checking",
            "Kullanıcı adı kontrol ediliyor..."
          )
        );

        const response = await checkAdminUsernameAvailability(userId, trimmedNext);

        if (isCancelled || requestId !== lastRequestIdRef.current) return;

        const dto = response?.data ?? null;
        const resolvedMessage = resolveAvailabilityMessage(response, dto);

        console.log("username availability response", response);
        console.log("username availability dto", dto);

        setAvailabilityDto(dto);
        setAvailabilityCheckedValue(trimmedNext);

        if (response?.ok === false) {
          setAvailabilityState("error");
          setAvailabilityMessage(
            resolvedMessage ??
              tr(
                "users:detail.usernameChange.availability.error",
                "Kullanıcı adı kontrol edilemedi."
              )
          );
          return;
        }

        if (dto?.isAvailable === true) {
          setAvailabilityState("valid");
          setAvailabilityMessage(
            resolvedMessage ??
              tr(
                "users:detail.usernameChange.availability.available",
                "Kullanıcı adı uygun."
              )
          );
          return;
        }

        if (dto?.isAvailable === false) {
          setAvailabilityState("taken");
          setAvailabilityMessage(
            resolvedMessage ??
              tr(
                "users:detail.usernameChange.availability.taken",
                "Kullanıcı adı zaten kullanımda. Başka bir kullanıcı adı deneyiniz."
              )
          );
          return;
        }

        setAvailabilityState("error");
        setAvailabilityMessage(
          resolvedMessage ??
            tr(
              "users:detail.usernameChange.availability.error",
              "Kullanıcı adı kontrol edilemedi."
            )
        );
      } catch (err) {
        if (isCancelled || requestId !== lastRequestIdRef.current) return;

        console.error("username availability failed", err);

        setAvailabilityState("error");
        setAvailabilityDto(null);
        setAvailabilityCheckedValue(trimmedNext);
        setAvailabilityMessage(
          tr(
            "users:detail.usernameChange.availability.error",
            "Kullanıcı adı kontrol edilemedi."
          )
        );
      }
    }, AVAILABILITY_DEBOUNCE_MS);

    return () => {
      isCancelled = true;
      window.clearTimeout(timer);
    };
  }, [trimmedNext, userId, validationError, touched]);

  const helperText = useMemo(() => {
    if (touched && validationError) {
      return validationError;
    }

    return tr(
      "users:detail.usernameChange.helper",
      "3–50 karakter. Harf, rakam, nokta, alt çizgi ve tire kullanılabilir."
    );
  }, [touched, validationError]);

  const resolveBackendMessage = (response?: SubmitResponse | null) => {
    if (response?.userMessage?.trim()) {
      return response.userMessage;
    }

    if (response?.message?.trim()) {
      const translated = t(response.message);
      return translated === `[${response.message}]`
        ? response.message
        : translated;
    }

    return null;
  };

  const handleReset = () => {
    setNextUserName(trimmedCurrent);
    setError(null);
    setSaved(false);
    setTouched(false);
    setAvailabilityState("idle");
    setAvailabilityMessage(null);
    setAvailabilityCheckedValue("");
    setAvailabilityDto(null);
    lastRequestIdRef.current = 0;
  };

  const isAvailabilityFresh = availabilityCheckedValue === trimmedNext;
  const isAvailabilityApproved =
    availabilityState === "valid" && isAvailabilityFresh;

  const canSubmit =
    !saving &&
    !isLoading &&
    !validationError &&
    !!trimmedNext &&
    isAvailabilityApproved;

  const handleSubmit = async () => {
    setTouched(true);
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      if (validationError) {
        setError(validationError);
        return;
      }

      if (!isAvailabilityFresh || availabilityState !== "valid") {
        setError(
          tr(
            "users:detail.usernameChange.availability.required",
            "Kaydetmeden önce kullanıcı adı uygunluğu doğrulanmalıdır."
          )
        );
        return;
      }

      const response = await onSubmit(trimmedNext);
      const backendMessage = resolveBackendMessage(response);

      if (response?.ok === false) {
        setError(
          backendMessage ??
            tr(
              "users:detail.usernameChange.fallbackError",
              "Kullanıcı adı güncellenirken bir hata oluştu."
            )
        );
        return;
      }

      setSaved(true);
      setError(null);
      onReload?.();
    } catch {
      setError(
        tr(
          "users:detail.usernameChange.fallbackError",
          "Kullanıcı adı güncellenirken bir hata oluştu."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const availabilityColor =
    availabilityState === "valid"
      ? theme.palette.success.main
      : availabilityState === "taken" || availabilityState === "error"
        ? theme.palette.warning.main
        : theme.palette.text.secondary;

  return (
    <BlankCard>
      <CardContent
        sx={{
          p: { xs: 2, md: 2.5 },
          maxWidth: 760,
        }}
      >
        <Stack spacing={2.25}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {tr(
                "users:detail.usernameChange.title",
                "Kullanıcı Adını Güncelle"
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {tr(
                "users:detail.usernameChange.descriptionShort",
                "Kullanıcının giriş yaparken kullandığı kullanıcı adını değiştirin."
              )}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {saved && (
            <Alert severity="success" sx={{ borderRadius: 2 }}>
              {tr("common:alert.saved", "Başarıyla kaydedildi.")}
            </Alert>
          )}

          <Box
            sx={{
              px: 1.5,
              py: 1.25,
              borderRadius: 2.5,
              border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
              backgroundColor: alpha(theme.palette.primary.main, 0.03),
            }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: "10px",
                  display: "grid",
                  placeItems: "center",
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: "primary.main",
                  flexShrink: 0,
                }}
              >
                <IconUser size={17} />
              </Box>

              <Box minWidth={0}>
                <Typography variant="caption" color="text.secondary" display="block">
                  {tr(
                    "users:detail.usernameChange.currentUserNameLabel",
                    "Mevcut kullanıcı adı"
                  )}
                </Typography>
                <Typography variant="body2" fontWeight={700} sx={{ wordBreak: "break-word" }}>
                  {trimmedCurrent || "-"}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Box>
            <CustomFormLabel htmlFor="username-change-input" sx={{ mb: 0.75 }}>
              {tr(
                "users:detail.usernameChange.newUserNameLabel",
                "Yeni kullanıcı adı"
              )}
            </CustomFormLabel>

            <CustomTextField
              id="username-change-input"
              fullWidth
              value={nextUserName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setSaved(false);
                setError(null);
                setNextUserName(e.target.value);
                if (!touched) setTouched(true);
              }}
              error={
                (touched && !!validationError) ||
                availabilityState === "taken" ||
                availabilityState === "error"
              }
              helperText={helperText}
              placeholder={tr(
                "users:detail.usernameChange.placeholder",
                "Yeni kullanıcı adını giriniz"
              )}
              disabled={saving || isLoading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  backgroundColor: alpha(theme.palette.background.default, 0.45),
                },
              }}
            />
          </Box>

          {!error && !saved && availabilityMessage && (
            <Box
              sx={{
                color: availabilityColor,
                mt: -0.5,
                fontSize: theme.typography.body2.fontSize,
                lineHeight: theme.typography.body2.lineHeight,
                fontWeight: theme.typography.body2.fontWeight,
              }}
            >
              {availabilityState === "checking" ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularProgress size={14} />
                  <span>{availabilityMessage}</span>
                </Stack>
              ) : (
                availabilityMessage
              )}
            </Box>
          )}

          <Stack
            direction={{ xs: "column-reverse", sm: "row" }}
            justifyContent="flex-end"
            spacing={1.25}
          >
            <Button
              variant="outlined"
              onClick={handleReset}
              disabled={saving || isLoading}
              sx={{
                minWidth: 110,
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 600,
                height: 42,
              }}
            >
              {tr("common:reset", "Sıfırla")}
            </Button>

            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!canSubmit}
              startIcon={
                saving ? (
                  <CircularProgress color="inherit" size={16} />
                ) : (
                  <IconCheck size={16} />
                )
              }
              sx={{
                minWidth: 190,
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 700,
                height: 42,
                boxShadow: "none",
              }}
            >
              {tr(
                "users:detail.usernameChange.submit",
                "Kullanıcı Adını Güncelle"
              )}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </BlankCard>
  );
}