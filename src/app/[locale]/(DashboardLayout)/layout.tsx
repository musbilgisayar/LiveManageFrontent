// src/app/[locale]/(DashboardLayout)/layout.tsx

"use client";

import React from "react";
import DashboardContent from "./DashboardContent.client";

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardContent>{children}</DashboardContent>;
}