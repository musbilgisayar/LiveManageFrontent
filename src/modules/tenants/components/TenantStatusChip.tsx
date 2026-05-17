// src/modules/tenants/components/TenantStatusChip.tsx

"use client";

import Chip from "@mui/material/Chip";

import { useI18nNs } from "@/app/context/i18nContext";

type TenantStatusChipProps = {
  isActive: boolean;
  size?: "small" | "medium";
};

export default function TenantStatusChip({
  isActive,
  size = "small",
}: TenantStatusChipProps) {
  const { t } = useI18nNs("tenants");

  return (
    <Chip
      size={size}
      label={
        isActive
          ? t("tenants:status.active")
          : t("tenants:status.passive")
      }
      color={isActive ? "success" : "default"}
      variant={isActive ? "filled" : "outlined"}
    />
  );
}