//src/app/[locale]/(frontend-pages)/auth/login/page.tsx

"use client";
import { useSearchParams } from "next/navigation";
import AuthTabs from "@/app/[locale]/(frontend-pages)/auth/authForms/AuthTabs";

export default function AuthPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "login";

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: "2rem" }}>
      <AuthTabs initialTab={tab} />
    </div>
  );
}
