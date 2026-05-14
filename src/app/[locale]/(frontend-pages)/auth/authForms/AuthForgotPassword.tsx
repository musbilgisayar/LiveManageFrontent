//src/app/[locale]/(frontend-pages)/auth/authForms/AuthForgotPassword.tsx
"use client";
import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
  Stack,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { textFieldStyle } from "@/app/components/shared/styles";
import AuthSocialButtons from "./AuthSocialButtons";

// MUI ikonları
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function AuthLogin() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Login
      </Typography>

      {/* Email */}
      <TextField
        fullWidth
        margin="normal"
        label="Email"
        type="email"
        variant="outlined"
        InputLabelProps={{ shrink: true }}
        placeholder="Enter your email"
        InputProps={{
          sx: textFieldStyle,
          startAdornment: (
            <InputAdornment position="start">
              <EmailIcon sx={{ color: "primary.main" }} fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      {/* Password */}
      <TextField
        fullWidth
        margin="normal"
        label="Password"
        type={showPassword ? "text" : "password"}
        variant="outlined"
        InputLabelProps={{ shrink: true }}
        placeholder="Enter your password"
        InputProps={{
          sx: textFieldStyle,
          startAdornment: (
            <InputAdornment position="start">
              <LockIcon sx={{ color: "primary.main" }} fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
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

      {/* Remember me */}
      <FormControlLabel control={<Checkbox />} label="Remember me" sx={{ mt: 1 }} />

      {/* Login button */}
      <Button fullWidth variant="contained" sx={{ mt: 2 }}>
        Login
      </Button>

      {/* Links */}
      <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
        <Typography variant="body2" color="primary" sx={{ cursor: "pointer" }}>
          Forgot Password? (Go to Forgot tab)
        </Typography>
        <Typography variant="body2" color="primary" sx={{ cursor: "pointer" }}>
          New user? Register tab
        </Typography>
      </Stack>

      {/* Sosyal medya giriş butonları */}
      <AuthSocialButtons />
    </Box>
  );
}
