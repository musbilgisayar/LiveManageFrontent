// src/app/[locale]/(frontend-pages)/auth/page.tsx

import AuthTabs from "@/modules/auth/components/AuthTabs";

type AuthPageProps = {
  searchParams?: Promise<{
    tab?: string;
  }>;
};

export default async function AuthPage({
  searchParams,
}: AuthPageProps) {
  const params = await searchParams;

  return <AuthTabs initialTab={params?.tab ?? "login"} />;
}