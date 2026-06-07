"use client";

import { useSearchParams } from "next/navigation";
import AuthTabs from "@/modules/auth/components/AuthTabs";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "login";

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: "2rem" }}>
      <AuthTabs initialTab={tab} />
    </div>
  );
}
