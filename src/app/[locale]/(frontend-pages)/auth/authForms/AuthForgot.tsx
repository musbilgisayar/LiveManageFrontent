"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  InputAdornment,
  Alert,
} from "@mui/material";
import { textFieldStyle } from "@/app/components/shared/styles";
import { useI18nNs } from "@/app/context/i18nContext";
import EmailIcon from "@mui/icons-material/Email";

export default function AuthForgot() {
  const { t } = useI18nNs(["auth"]);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email) {
      setError(t("auth:forgot.emailRequired"));
      console.warn("⚠️ E-posta boş. İşlem durduruldu.");
      return;
    }

    console.info("📤 Şifre sıfırlama isteği hazırlanıyor...", { email });
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const endpoint = "/api/v1.0/account/forgot-password";
  

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

 

      if (res.ok) {
        setSent(true);
        setMessage(t("auth:forgot.success"));
        console.log("✅ Başarılı: Mail gönderildi.");
      } else {
        const text = await res.text();
        setError(`${t("auth:forgot.error")}: ${text}`);
        console.error("❌ Sunucu hatası:", res.status, text);
      }
    } catch (err) {
      console.error("💥 İstek hatası:", err);
      setError(t("auth:forgot.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t("auth:forgot.title")}
      </Typography>

      {!sent ? (
        <>
          <TextField
            fullWidth
            margin="normal"
            type="email"
            label={t("auth:forgot.email")}
            placeholder={t("auth:forgot.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              sx: textFieldStyle,
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: "primary.main" }} fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {message && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {message}
            </Alert>
          )}

          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? t("auth:forgot.sending") : t("auth:forgot.submit")}
          </Button>
        </>
      ) : (
        <Alert severity="success" sx={{ mt: 3 }}>
          ✅ {t("auth:forgot.success")}
        </Alert>
      )}

      <Typography variant="body2" align="center" sx={{ mt: 2 }}>
        {t("auth:forgot.backToLogin")}
      </Typography>
    </Box>
  );
}


/*"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  InputAdornment,
} from "@mui/material";
import { textFieldStyle } from "@/app/components/shared/styles";
import { useI18nNs } from "@/app/context/i18nContext";
import EmailIcon from "@mui/icons-material/Email";

export default function AuthForgot() {
  const { t } = useI18nNs(["auth"]);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) return alert(t("auth:forgot.emailRequired"));

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSent(true);
      } else {
        alert(t("auth:forgot.error"));
      }
    } catch (err) {
      console.error("İstek hatası:", err);
      alert(t("auth:forgot.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t("auth:forgot.title")}
      </Typography>

      {!sent ? (
        <>
          <TextField
            fullWidth
            margin="normal"
            type="email"
            label={t("auth:forgot.email")}
            placeholder={t("auth:forgot.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              sx: textFieldStyle,
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: "primary.main" }} fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? t("auth:forgot.sending") : t("auth:forgot.submit")}
          </Button>
        </>
      ) : (
        <Typography variant="body2" color="success.main" sx={{ mt: 3 }}>
          ✅ {t("auth:forgot.success")}
        </Typography>
      )}

      <Typography variant="body2" align="center" sx={{ mt: 2 }}>
        {t("auth:forgot.backToLogin")}
      </Typography>
    </Box>
  );
}
*/