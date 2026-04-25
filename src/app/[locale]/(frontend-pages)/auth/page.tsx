// src/app/[locale]/(frontend-pages)/auth/page.tsx

import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import AuthTabs from "@/app/[locale]/(frontend-pages)/auth/authForms/AuthTabs";

function extractUser(raw: any) {
  return raw?.user || raw?.data?.user || raw?.data?.data?.user || null;
}

function getDashboardByRole(locale: string, role?: string) {
  const r = String(role || "user").toLowerCase();

  switch (r) {
    case "superadmin":
      return `/${locale}/superadmin/dashboard`;
    case "admin":
      return `/${locale}/admin/dashboard`;
    case "manager":
      return `/${locale}/manager/dashboard`;
    case "staff":
      return `/${locale}/staff/dashboard`;
    case "employee":
      return `/${locale}/employee/dashboard`;
    case "auditor":
      return `/${locale}/auditor/dashboard`;
    case "member":
      return `/${locale}/member/dashboard`;
    default:
      return `/${locale}/user/dashboard`;
  }
}

async function getServerAuth(locale: string) {
  try {
    const cookieStore = await cookies();
    const headerStore = await headers();

    const cookieHeader = cookieStore
      .getAll()
      .map((c: { name: string; value: string }) => `${c.name}=${c.value}`)
      .join("; ");

    const host = headerStore.get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

    const res = await fetch(`${baseUrl}/api/v1.0/account/me`, {
      method: "GET",
      headers: {
        cookie: cookieHeader,
        "accept-language": locale,
        "x-requested-with": "next-server-component",
      },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const json = await res.json();
    const user = extractUser(json);

    return user || null;
  } catch (error) {
    console.error("[AUTH PAGE] getServerAuth failed:", error);
    return null;
  }
}

export default async function AuthPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { locale } = await params;
  const { tab } = await searchParams;

  const user = await getServerAuth(locale);

  if (user) {
    const role =
      user?.primaryRole ||
      user?.role ||
      user?.roles?.[0];

    redirect(getDashboardByRole(locale, role));
  }

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: "2rem" }}>
      <AuthTabs initialTab={tab || "login"} />
    </div>
  );
}