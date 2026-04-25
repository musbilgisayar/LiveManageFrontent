// src/app/[locale]/test-placeholder/page.tsx
"use client";

import React from "react";
import { Box, Stack, Typography, TextField } from "@mui/material";

export default function TestPlaceholderPage() {
  return (
    <Box sx={{ p: 4, maxWidth: 600, mx: "auto" }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        🧪 Placeholder Test (Theme Override)
      </Typography>

      <Stack spacing={2}>
        <TextField
          fullWidth
          label="Ad"
          placeholder="Adınızı buraya yazın"
          variant="outlined"
        />
        <TextField
          fullWidth
          label="E-posta"
          placeholder="E-posta adresinizi girin"
          variant="outlined"
        />
        <TextField
          fullWidth
          label="Açıklama"
          placeholder="Kısa bir açıklama yazın"
          multiline
          rows={3}
        />
      </Stack>
    </Box>
  );
}
