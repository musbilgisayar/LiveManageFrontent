"use client";

import React from "react";
import { Box, Stack, Typography, TextField } from "@mui/material";

export default function PlaceholderTest() {
  return (
    <Box sx={{ p: 4, maxWidth: 600 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        🧪 Placeholder Test (Theme Override Aktif)
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
