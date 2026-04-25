"use client";

import React from "react";
import { useAuth } from "@/app/context/AuthContext";  
import { useRouter } from "next/navigation";

interface RoleGuardProps {
  allowed: string[];   // örn: ["SuperAdmin", "Admin"]
  children: React.ReactNode;
}

export default function RoleGuard({ allowed, children }: RoleGuardProps) {
  const { user } = useAuth(); // JWT'den çözülmüş kullanıcı
  const router = useRouter();

  // henüz kullanıcı yoksa ya da login değilse
  if (!user) return null;

  // eğer rol uyuşmuyorsa
  const hasAccess = user.roles?.some((r: string) => allowed.includes(r));
  if (!hasAccess) {
    router.push(`/${user.locale || "tr"}/forbidden`);
    return null;
  }

  return <>{children}</>;
}
