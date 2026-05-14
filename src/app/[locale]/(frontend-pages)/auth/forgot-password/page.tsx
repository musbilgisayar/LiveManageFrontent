// src/app/[locale]/(frontend-pages)/auth/forgot-password/page.tsx

import AuthTabs from "@/modules/auth/components/AuthTabs";

export default function ForgotPasswordPage() {
  return <AuthTabs initialTab="forgot" />;
}