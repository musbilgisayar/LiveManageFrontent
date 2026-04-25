//src/modules/users/components/detail/cards/EmailChangeCard.tsx
"use client";

import { useState } from "react";
import { Alert, Button, Stack, TextField, Typography } from "@mui/material";
import AlternateEmailOutlinedIcon from "@mui/icons-material/AlternateEmailOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { useI18nNs } from "@/app/context/i18nContext";
import { requestEmailChange } from "@/modules/users/services/emailChange.service";
type Props = {
  initialEmail?: string | null;
};

export default function EmailChangeCard({ initialEmail }: Props) {
  const { t } = useI18nNs(["users", "common"]);
  const [email, setEmail] = useState(initialEmail ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const tr = (key: string, fallback: string) => {
    const value = t(key);
    return value === `[${key}]` ? fallback : value;
  };

const handleSubmit = async () => {
  try {
    setLoading(true);
    setMessage(null);

    await requestEmailChange({
      newEmail: email,
    });

    setMessage(
      tr(
        "users:detail.emailChangeCard.success",
        "E-posta değişiklik isteği gönderildi."
      )
    );
  } catch (err: any) {
    setMessage(
      err?.message ??
        tr(
          "users:detail.emailChangeCard.error",
          "E-posta değiştirilirken bir hata oluştu."
        )
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        {tr(
          "users:detail.emailChangeCard.formDescription",
          "Yeni e-posta adresinizi girin. Doğrulama bağlantısı bu adrese gönderilecektir."
        )}
      </Typography>

      <TextField
        fullWidth
        type="email"
        label={tr("users:detail.fields.newEmail", "Yeni e-posta")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={tr(
          "users:detail.fields.newEmailPlaceholder",
          "ornek@domain.com"
        )}
        InputProps={{
          startAdornment: <AlternateEmailOutlinedIcon fontSize="small" />,
        }}
      />

      <Button
        variant="contained"
        startIcon={<SaveOutlinedIcon />}
        onClick={handleSubmit}
        disabled={loading}
        sx={{
          alignSelf: "flex-start",
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 999,
        }}
      >
        {loading
          ? tr("common:loading", "Yükleniyor...")
          : tr("users:detail.emailChangeCard.submit", "E-posta değiştir")}
      </Button>

      {message && <Alert severity="info">{message}</Alert>}
    </Stack>
  );
}