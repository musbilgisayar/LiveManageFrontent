"use client";

import React, { useState } from "react";
import { Box, Button, CardContent, Avatar, Stack, Typography } from "@mui/material";
import BlankCard from "@/app/components/shared/BlankCard";
import { useI18nNs } from "@/app/context/i18nContext";

export default function ProfilePhotoCard() {
  const { t } = useI18nNs(["account"]);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await fetch("/api/v1.0/account/profile-photo", { method: "POST", body: formData });
      alert(t("account:profilePhoto.success"));
    } catch {
      alert(t("account:profilePhoto.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => setPreview(null);

  return (
    <BlankCard>
      <CardContent>
        <Typography variant="h5" mb={1}>
          {t("account:profilePhoto.title")}
        </Typography>
        <Typography color="textSecondary" mb={3}>
          {t("account:profilePhoto.desc")}
        </Typography>

        <Box textAlign="center">
          <Avatar
            src={preview ?? "/images/profile/user-1.jpg"}
            sx={{ width: 120, height: 120, margin: "0 auto" }}
          />
          <Stack direction="row" justifyContent="center" spacing={2} my={3}>
            <Button variant="contained" component="label" disabled={loading}>
              {t("account:profilePhoto.upload")}
              <input hidden accept="image/*" type="file" onChange={handleUpload} />
            </Button>
            <Button variant="outlined" color="error" onClick={handleReset}>
              {t("account:profilePhoto.reset")}
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </BlankCard>
  );
}
