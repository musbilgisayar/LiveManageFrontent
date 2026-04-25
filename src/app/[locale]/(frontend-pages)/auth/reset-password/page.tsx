"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { textFieldStyle } from "@/app/components/shared/styles";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useI18nNs } from "@/app/context/i18nContext";

export default function ResetPasswordPage() {
  const { t } = useI18nNs(["auth"]);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    
  }, [token]);

  const handleSubmit = async () => {
    if (!token) {
      setError("❌ Token eksik veya geçersiz.");
      
      return;
    }
    if (!email || !newPassword || !confirmPassword) {
      setError("⚠️ Lütfen tüm alanları doldurun.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("⚠️ Şifreler uyuşmuyor.");
      return;
    }

    setLoading(true);
    setError(null);
   

    try {
      const res = await fetch("/api/v1.0/account/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, newPassword, confirmPassword }),
      });

      const json = await res.json();
     

      if (json.ok) {
        setDone(true);
        
      } else {
        setError(`❌ Hata: ${json.error || "Bilinmeyen hata"}`);
      }
    } catch (err) {
      console.error("💥 [ResetPasswordForm] Ağ hatası:", err);
      setError("Sunucuya erişilemedi.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography variant="h6" color="success.main">
          ✅ Şifreniz başarıyla güncellendi!
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {t("auth:forgot.backToLogin")}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 6 }}>
      <Typography variant="h5" gutterBottom>
        {t("auth:reset.title") || "Yeni Şifre Belirle"}
      </Typography>

      <TextField
        fullWidth
        margin="normal"
        label="E-posta"
        type="email"
        variant="outlined"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="E-posta adresinizi girin"
        InputProps={{ sx: textFieldStyle }}
      />

      <TextField
        fullWidth
        margin="normal"
        label="Yeni Şifre"
        type={showPassword ? "text" : "password"}
        variant="outlined"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="Yeni şifre"
        InputProps={{
          sx: textFieldStyle,
          startAdornment: (
            <InputAdornment position="start">
              <LockIcon sx={{ color: "primary.main" }} fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword((p) => !p)} edge="end">
                {showPassword ? (
                  <VisibilityOff sx={{ color: "primary.main" }} fontSize="small" />
                ) : (
                  <Visibility sx={{ color: "primary.main" }} fontSize="small" />
                )}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <TextField
        fullWidth
        margin="normal"
        label="Yeni Şifre (Tekrar)"
        type={showPassword ? "text" : "password"}
        variant="outlined"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Yeni şifreyi tekrar girin"
        InputProps={{ sx: textFieldStyle }}
      />

      {error && (
        <Typography color="error" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}

      <Button
        fullWidth
        variant="contained"
        sx={{ mt: 3 }}
        disabled={loading}
        onClick={handleSubmit}
      >
        {loading ? (
          <>
            <CircularProgress size={18} sx={{ mr: 1, color: "inherit" }} />
            Gönderiliyor...
          </>
        ) : (
          "Şifreyi Güncelle"
        )}
      </Button>
    </Box>
  );
}
