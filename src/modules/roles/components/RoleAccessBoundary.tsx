"use client";

import React from "react";
import { Box } from "@mui/material";
import { useRoleAccess } from "../hooks/useRoleAccess"; // ✅ doğru path

type Props = {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

/**
 * 🔒 RoleAccessBoundary
 * UI üzerinde dinamik yetki kontrolü.
 */
export function RoleAccessBoundary({ permission, children, fallback = null }: Props) {
  const access = useRoleAccess();
  if (!access.has(permission)) return <>{fallback}</>;
  return <Box component="span">{children}</Box>;
}
