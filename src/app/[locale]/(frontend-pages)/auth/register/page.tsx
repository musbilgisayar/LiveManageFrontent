// src/app/[locale]/(frontend-pages)/auth/register/page.tsx

import AuthTabs from "@/modules/auth/components/AuthTabs";

export default function RegisterPage() {
  return <AuthTabs initialTab="register" />;
}