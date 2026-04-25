// src/app/[locale]/(frontend-pages)/auth/authForms/AuthRegister.tsx
"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useRouter, useParams } from "next/navigation";

import { textFieldStyle } from "@/app/components/shared/styles";
import { useI18nNs } from "@/app/context/i18nContext";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { RegisterDto } from "@/types/register.dto";
import { postWebFetcher } from "@/utils/fetchers.web.client";
import IntlPhoneField, { isE164Valid, } from "@/app/components/input/IntlPhoneField";

interface Props {
  subtext?: React.ReactNode;
  subtitle?: React.ReactNode;
}

type ApiError = {
  ok: false;
  data?: null;
  error: string;
  userMessage?: string;
  details?: Record<string, unknown> | string;
};

type ApiSuccess = {
  ok: true;
  data: unknown;
};

type ApiResponse = ApiError | ApiSuccess;

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string; // E.164 (+...)
  password: string;
  confirmPassword: string;
};

const asText = (v: unknown): string => {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);

  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    return (
      (typeof o.message === "string" && o.message) ||
      (typeof o.error === "string" && o.error) ||
      (typeof o.title === "string" && o.title) ||
      ""
    );
  }

  return String(v);
};

const safeParseJson = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const pickWithOk = (x: unknown): ApiResponse | null => {
  if (x && typeof x === "object" && "ok" in (x as Record<string, unknown>)) {
    return x as ApiResponse;
  }
  return null;
};

const unwrapApi = (raw: unknown): ApiResponse => {
  const r = raw as Record<string, any> | null | undefined;

  const candidates = [
    r?.data,
    r?.error?.data,
    r?.response?.data,
    r?.error?.response?.data,
    raw,
  ];

  for (const c of candidates) {
    const hit = pickWithOk(c);
    if (hit) return hit;
  }

  for (const c of candidates) {
    if (
      c &&
      typeof c === "object" &&
      ("userMessage" in (c as Record<string, unknown>) ||
        "details" in (c as Record<string, unknown>))
    ) {
      const obj = c as Record<string, unknown>;
      return {
        ok: false,
        error: typeof obj.error === "string" ? obj.error : "ERROR",
        userMessage:
          typeof obj.userMessage === "string" ? obj.userMessage : undefined,
        details:
          typeof obj.details === "string" || typeof obj.details === "object"
            ? (obj.details as Record<string, unknown> | string)
            : undefined,
      };
    }
  }

  return (raw ?? { ok: false, error: "UNKNOWN" }) as ApiResponse;
};

const FIELD_ALIASES: Record<string, string> = {
  username: "email",
  user_name: "email",
  user: "email",
  email: "email",
  culturecode: "general",
  phonenumber: "phonenumber",
  phone: "phonenumber",
  phonecountrycode: "phonenumber",
  confirm_password: "confirmpassword",
  confirmpassword: "confirmpassword",
  firstname: "firstname",
  lastname: "lastname",
  password: "password",
};

const toClientField = (rawKey: string): string => {
  const k = rawKey.toLowerCase().trim();
  return FIELD_ALIASES[k] ?? k;
};

const translateIfKey = (msg: string, t: (key: string) => string): string => {
  if (!msg) return "";
  if (msg.startsWith("[") && msg.endsWith("]")) {
    const key = msg.slice(1, -1);
    return t(key) || key;
  }
  return msg;
};

const findDetails = (obj: unknown): unknown => {
  if (!obj || typeof obj !== "object") return null;

  const o = obj as Record<string, unknown>;
  if (o.details) return o.details;
  if (o.data && typeof o.data === "object" && (o.data as any).details) {
    return (o.data as any).details;
  }
  if (o.errors) return o.errors;

  return null;
};

const firstDetailMessage = (
  details: unknown,
  t: (k: string) => string,
  preferred: string[] = ["PhoneNumber", "phoneNumber", "phonenumber", "phone"]
): string => {
  if (!details || typeof details !== "object" || Array.isArray(details)) {
    return "";
  }

  const obj = details as Record<string, unknown>;

  for (const pk of preferred) {
    const v = obj[pk];
    if (Array.isArray(v) && v.length > 0) {
      return translateIfKey(String(v[0]), t);
    }
  }

  for (const v of Object.values(obj)) {
    if (Array.isArray(v) && v.length > 0) {
      return translateIfKey(String(v[0]), t);
    }
  }

  return "";
};

const normalizeDetails = (
  details: unknown,
  t: (k: string) => string
): Record<string, string[]> => {
  const e: Record<string, string[]> = {};

  if (!details || typeof details !== "object" || Array.isArray(details)) {
    return e;
  }

  for (const [field, value] of Object.entries(
    details as Record<string, unknown>
  )) {
    if (Array.isArray(value) && value.length > 0) {
      const clientField = toClientField(field);
      const first = translateIfKey(String(value[0]), t);

      if (
        [
          "email",
          "phonenumber",
          "firstname",
          "lastname",
          "password",
          "confirmpassword",
          "general",
        ].includes(clientField)
      ) {
        e[clientField] = [first];
      }
    }
  }

  if (Object.keys(e).length === 0) {
    const msg = firstDetailMessage(details, t);
    if (msg) e.general = [msg];
  }

  return e;
};

type SplitPhoneResult = {
  phoneCountryCode: string;
  phoneNumber: string;
};

// IntlPhoneField E.164 (+41791234567) döndürüyor varsayımıyla
// ülke kodunu ayırıyoruz.
const splitE164Phone = (value: string): SplitPhoneResult | null => {
  const phone = value.trim();
  if (!phone) return null;
  if (!phone.startsWith("+")) return null;

  const knownCodes = ["+41", "+49", "+90", "+43", "+33", "+39", "+1"];
  const known = knownCodes.find((code) => phone.startsWith(code));

  if (known) {
    return {
      phoneCountryCode: known,
      phoneNumber: phone.slice(known.length),
    };
  }

  const match = phone.match(/^(\+\d{1,3})(\d+)$/);
  if (!match) return null;

  return {
    phoneCountryCode: match[1],
    phoneNumber: match[2],
  };
};

export default function AuthRegister({ subtext, subtitle }: Props) {
  const { t } = useI18nNs(["auth", "validation"]);
  const router = useRouter();
  const params = useParams() as { locale?: string };

  const activeLocale = (params?.locale || "tr").split("-")[0].toLowerCase();

  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fieldProps = (name: keyof FormState) => ({
    error: !!errors[name.toLowerCase()]?.length,
    helperText: errors[name.toLowerCase()]?.[0]
      ? asText(errors[name.toLowerCase()]![0])
      : undefined,
    required: name !== "phoneNumber",
    InputProps: { sx: textFieldStyle },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));

    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[name.toLowerCase()];
      return copy;
    });
  };

  const validate = (state: FormState) => {
    const e: Record<string, string[]> = {};
    const req = (msg: string) => msg || "Bu alan zorunludur.";
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!state.firstName.trim()) {
      e.firstname = [req(t("validation:requiredFirstName"))];
    }

    if (!state.lastName.trim()) {
      e.lastname = [req(t("validation:requiredLastName"))];
    }

    if (!state.email.trim()) {
      e.email = [req(t("validation:requiredEmail"))];
    } else if (!emailRe.test(state.email)) {
      e.email = [
        t("validation:invalidEmail") || "Geçerli bir e-posta giriniz.",
      ];
    }

    if (!state.password) {
      e.password = [req(t("validation:requiredPassword"))];
    }

    if (!state.confirmPassword) {
      e.confirmpassword = [req(t("validation:requiredConfirmPassword"))];
    }

    if (
      state.password &&
      state.confirmPassword &&
      state.password !== state.confirmPassword
    ) {
      e.password = e.password ?? [];
      e.confirmpassword = e.confirmpassword ?? [];

      const msg =
        t("validation:passwordsDoNotMatch") || "Parolalar eşleşmiyor.";

      e.password.push(msg);
      e.confirmpassword.push(msg);
    }

    if (state.phoneNumber && !isE164Valid(state.phoneNumber)) {
      e.phonenumber = [
        t("validation:invalidPhone") ||
        "Telefon numarası E.164 formatında olmalıdır. Örn: +905551112233",
      ];
    }

    if (Object.keys(e).length) {
      setErrors(e);
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    setErrors({});

    if (!validate(form)) return;

    const cultureCode = navigator.language || "en-US";
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

    const splitPhone = form.phoneNumber ? splitE164Phone(form.phoneNumber) : null;

    if (form.phoneNumber && !splitPhone) {
      setErrors({
        phonenumber: [
          t("validation:invalidPhone") ||
          "Telefon numarası ayrıştırılamadı.",
        ],
      });
      return;
    }

    const payload: RegisterDto = {
      email: form.email.trim(),
      phoneCountryCode: splitPhone?.phoneCountryCode ?? null,
      phoneNumber: splitPhone?.phoneNumber ?? null,
      displayName: `${form.firstName} ${form.lastName}`.trim(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      fullName: `${form.firstName} ${form.lastName}`.trim(),
      cultureCode,
      timeZone,
      password: form.password,
      requireEmailConfirmation: true,
      twoFactorEnabled: false,
    };
    try {
      const raw = await postWebFetcher("/api/v1.0/account/register", payload);
      const data = unwrapApi(raw);

      if ((data as any)?.userMessage) {
        const msg = String((data as any).userMessage);

        if (
          msg.includes("RegisterSuccess") ||
          msg.includes("Account.RegisterSuccess")
        ) {
          router.push(`/${activeLocale}/email/verify-email`);
          return;
        }

        setErrors({ general: [msg] });
        return;
      }

      const details =
        ("details" in data && (data as any).details) ||
        findDetails(raw) ||
        findDetails((raw as any)?.error) ||
        findDetails((raw as any)?.error?.data);

      if (details) {
        const norm = normalizeDetails(details, t);
        if (Object.keys(norm).length > 0) {
          setErrors(norm);
          return;
        }
      }

      if ("ok" in data && (data as any).ok) {
        router.push(`/${activeLocale}/email/verify-email`);
        return;
      }

      setErrors({
        general: [t("auth:register.error") || "Bilinmeyen bir hata oluştu."],
      });
    } catch (err: any) {
      const raw = err?.payload ?? null;
      const data = unwrapApi(raw);

      const details =
        ("details" in (data as any) && (data as any).details) ||
        findDetails(raw) ||
        findDetails(raw?.error) ||
        findDetails(raw?.error?.data);

      if (details) {
        const norm = normalizeDetails(details, t);
        if (Object.keys(norm).length > 0) {
          setErrors(norm);
          return;
        }
      }

      if ((data as any)?.userMessage) {
        setErrors({ general: [String((data as any).userMessage)] });
        return;
      }

      setErrors({
        general: [
          err?.message ||
          t("auth:register.networkError") ||
          "Ağ hatası.",
        ],
      });
    }

  };

  const rules = [
    { test: /.{8,}/, label: t("auth:passwordRules.minLength") },
    { test: /[A-Z]/, label: t("auth:passwordRules.uppercase") },
    { test: /[a-z]/, label: t("auth:passwordRules.lowercase") },
    { test: /\d/, label: t("auth:passwordRules.number") },
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        {t("auth:register.title")}
      </Typography>

      {!!errors.general?.length && (
        <Typography color="error" sx={{ mb: 2 }}>
          {asText(errors.general[0])}
        </Typography>
      )}

      {subtext}

      <TextField
        fullWidth
        margin="normal"
        name="firstName"
        value={form.firstName}
        onChange={handleChange}
        label={t("auth:register.firstName")}
        placeholder={t("auth:register.firstNamePlaceholder")}
        {...fieldProps("firstName")}
        InputProps={{
          ...fieldProps("firstName").InputProps,
          startAdornment: (
            <InputAdornment position="start">
              <PersonIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        fullWidth
        margin="normal"
        name="lastName"
        value={form.lastName}
        onChange={handleChange}
        label={t("auth:register.lastName")}
        placeholder={t("auth:register.lastNamePlaceholder")}
        {...fieldProps("lastName")}
        InputProps={{
          ...fieldProps("lastName").InputProps,
          startAdornment: (
            <InputAdornment position="start">
              <PersonIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        fullWidth
        margin="normal"
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        label={t("auth:register.email")}
        placeholder={t("auth:register.emailPlaceholder")}
        {...fieldProps("email")}
        InputProps={{
          ...fieldProps("email").InputProps,
          startAdornment: (
            <InputAdornment position="start">
              <EmailIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <Box sx={{ mt: 2 }}>
        <IntlPhoneField
          label={t("auth:register.phone")}
          value={form.phoneNumber}
          onChange={(val) => {
            setForm((p) => ({ ...p, phoneNumber: val || "" }));
            setErrors((prev) => {
              const cp = { ...prev };
              delete cp.phonenumber;
              delete cp.phone;
              return cp;
            });
          }}
          error={!!errors.phonenumber?.length}
          helperText={
            errors.phonenumber?.[0]
              ? asText(errors.phonenumber[0])
              : undefined
          }
          defaultCountry={(navigator.language?.split("-")[1] || "TR") as any}
        />
      </Box>

      <Tooltip
        placement="right"
        arrow
        title={
          <Stack spacing={0.5}>
            {rules.map((rule, i) => {
              const valid = rule.test.test(form.password);
              return (
                <Stack
                  key={i}
                  direction="row"
                  spacing={0.5}
                  alignItems="center"
                >
                  {valid ? (
                    <CheckCircleIcon fontSize="small" />
                  ) : (
                    <CancelIcon fontSize="small" />
                  )}
                  <Typography
                    variant="caption"
                    sx={{ color: valid ? "success.dark" : "error.dark" }}
                  >
                    {rule.label}
                  </Typography>
                </Stack>
              );
            })}
          </Stack>
        }
      >
        <TextField
          fullWidth
          margin="normal"
          name="password"
          type={showPassword ? "text" : "password"}
          value={form.password}
          onChange={handleChange}
          label={t("auth:register.password")}
          placeholder={t("auth:register.passwordPlaceholder")}
          {...fieldProps("password")}
          InputProps={{
            ...fieldProps("password").InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((prev) => !prev)}
                  edge="end"
                >
                  {showPassword ? (
                    <VisibilityOff fontSize="small" />
                  ) : (
                    <Visibility fontSize="small" />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Tooltip>

      <TextField
        fullWidth
        margin="normal"
        name="confirmPassword"
        type={showConfirmPassword ? "text" : "password"}
        value={form.confirmPassword}
        onChange={handleChange}
        label={t("auth:register.confirmPassword")}
        placeholder={t("auth:register.confirmPasswordPlaceholder")}
        error={!!errors.confirmpassword?.length}
        helperText={
          errors.confirmpassword?.[0]
            ? asText(errors.confirmpassword[0])
            : undefined
        }
        InputProps={{
          sx: textFieldStyle,
          startAdornment: (
            <InputAdornment position="start">
              <LockIcon fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                edge="end"
              >
                {showConfirmPassword ? (
                  <VisibilityOff fontSize="small" />
                ) : (
                  <Visibility fontSize="small" />
                )}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={handleSubmit}>
        {t("auth:register.submit")}
      </Button>

      <Typography variant="body2" align="center" sx={{ mt: 2 }}>
        {t("auth:register.alreadyUser")}
      </Typography>

      {subtitle}
    </Box>
  );
}