// src/app/utils/authHelpers.ts

import { jwtDecode } from "jwt-decode";

export interface UserPayload {
  sub: string;
  email?: string;
  displayName?: string;
  roles: string[];
  [key: string]: any;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/**
 * Web auth artık cookie tabanlı olduğu için localStorage token zorunlu kabul edilmez.
 * Bu helper sadece browser ortamında, accessToken localStorage'da gerçekten varsa decode eder.
 * SSR sırasında asla patlamaz.
 */
export function getUserFromToken(): UserPayload | null {
  if (!isBrowser()) {
    return null;
  }

  const token = window.localStorage.getItem("accessToken");
  if (!token) {
    return null;
  }

  try {
    const decoded: any = jwtDecode(token);

    const possibleKeys = ["roles", "roleClaims", "userRoles", "permissions"];
    const msClaim =
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

    let foundRoles: any[] = [];

    if (decoded[msClaim]) {
      const value = decoded[msClaim];
      foundRoles = Array.isArray(value) ? value : [value];
    }

    if (!foundRoles.length) {
      for (const key of possibleKeys) {
        if (decoded[key]) {
          foundRoles = Array.isArray(decoded[key])
            ? decoded[key]
            : [decoded[key]];
          break;
        }
      }
    }

    if (!foundRoles.length && typeof decoded.role === "string") {
      foundRoles = [decoded.role];
    }

    const roles = foundRoles
      .map((r: any) => (typeof r === "string" ? r : r?.roleName ?? ""))
      .filter(Boolean);

    return {
      sub: decoded.sub,
      email: decoded.email,
      displayName: decoded.displayName ?? decoded.fullName ?? decoded.name,
      roles,
      ...decoded,
    };
  } catch (err) {
    console.error("❌ [authHelpers] Token decode hatası:", err);
    return null;
  }
}