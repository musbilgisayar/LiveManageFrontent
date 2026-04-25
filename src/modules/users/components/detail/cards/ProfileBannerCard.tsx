"use client";

import React from "react";
import { Avatar, Box, Stack, Typography } from "@mui/material";
import { useI18nNs } from "@/app/context/i18nContext";

interface ProfileBannerProps {
  fullName?: string;
  role?: string;
  department?: string;

  profilePhotoUrl?: string | null;
  coverPhotoUrl?: string | null;
}

export default function ProfileBanner({
  fullName,
  role,
  department,
  profilePhotoUrl,
  coverPhotoUrl,
}: ProfileBannerProps) {
  const { t } = useI18nNs(["account"]);

  const safeFullName =
    fullName ||
    t("account:profile.fullNamePlaceholder", { defaultValue: "Kullanıcı Adı" });

  const safeRole =
    role ||
    t("account:profile.rolePlaceholder", { defaultValue: "Pozisyon" });

  const safeDepartment =
    department ||
    t("account:profile.departmentPlaceholder", {
      defaultValue: "Birim / Departman",
    });

  const initials =
    safeFullName
      ?.split(" ")
      .filter(Boolean)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <Box
      mb={3}
      sx={{
        position: "relative",
        borderRadius: 3,
        overflow: "hidden",
        bgcolor: "background.paper",
        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.08)",
      }}
    >
      {/* Cover */}
      <Box
        sx={{
          width: "100%",
          height: { xs: 160, sm: 200, md: 260 },
          backgroundColor: "#f0f0f0",
          backgroundImage: coverPhotoUrl ? `url(${coverPhotoUrl})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
        }}
      />

      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ p: 3, pt: 0 }}>
        <Box sx={{ mt: -6 }}>
          <Avatar
            src={profilePhotoUrl ?? undefined}
            sx={{
              width: 95,
              height: 95,
              border: "3px solid white",
              boxShadow: 3,
            }}
          >
            {initials}
          </Avatar>
        </Box>

        <Box flex={1}>
          <Typography variant="h6" fontWeight={600}>
            {safeFullName}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {safeRole} • {safeDepartment}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
