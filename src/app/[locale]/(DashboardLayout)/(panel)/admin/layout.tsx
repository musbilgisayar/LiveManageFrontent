"use client";

import PermissionGuard from "@/modules/auth/components/PermissionGuard";

const ADMIN_REQUIRED_PERMISSIONS = [
  "users.view.tenant",
  "roles.view.tenant",
  "permissions.view.tenant",
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PermissionGuard requiredAnyPermissions={ADMIN_REQUIRED_PERMISSIONS}>
      {children}
    </PermissionGuard>
  );
}