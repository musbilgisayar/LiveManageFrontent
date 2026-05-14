// src/lib/auth/getServerAuthState.ts
import { cookies, headers } from "next/headers";

export type ServerAuthState =
  | {
      isAuthenticated: true;
      user: any;
      cultureCode?: string | null;
    }
  | {
      isAuthenticated: false;
      user: null;
      cultureCode?: null;
    };

function extractUser(raw: any) {
  return (
    raw?.user ||
    raw?.data?.user ||
    raw?.data?.data?.user ||
    raw?.data?.data ||
    raw?.data ||
    null
  );
}

function extractCultureCode(raw: any): string | null {
  return (
    raw?.cultureCode ||
    raw?.data?.cultureCode ||
    raw?.data?.data?.cultureCode ||
    raw?.user?.cultureCode ||
    raw?.data?.user?.cultureCode ||
    raw?.data?.data?.user?.cultureCode ||
    null
  );
}

export async function getServerAuthState(
  lang?: string
): Promise<ServerAuthState> {
  try {
    const cookieStore = await cookies();
    const headerStore = await headers();

    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    const host = headerStore.get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

    const acceptLanguage =
      lang ||
      cookieStore.get("lm.lang")?.value ||
      headerStore.get("accept-language")?.split(",")[0] ||
      "tr";

    const response = await fetch(`${baseUrl}/api/v1.0/account/users/me`, {
      method: "GET",
      headers: {
        cookie: cookieHeader,
        "accept-language": acceptLanguage,
        "x-requested-with": "next-server-component",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return { isAuthenticated: false, user: null, cultureCode: null };
    }

    const json = await response.json();
    const user = extractUser(json);
    const cultureCode = extractCultureCode(json);

    if (!user) {
      return { isAuthenticated: false, user: null, cultureCode: null };
    }

    return {
      isAuthenticated: true,
      user,
      cultureCode,
    };
  } catch {
    return { isAuthenticated: false, user: null, cultureCode: null };
  }
}
