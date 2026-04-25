// src/app/[locale]/(DashboardLayout)/apps/profile/page.tsx
"use client";

import React from "react";
import ProfilePage from "@/modules/profile"; // ✅ index.tsx üzerinden çağırıyoruz

export default function ProfileRoute() {
  return <ProfilePage />;
}
