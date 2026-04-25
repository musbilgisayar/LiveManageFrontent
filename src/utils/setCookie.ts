// src/app/utils/setCookie.ts  
export function setCookie(name: string, value: string, maxAgeSeconds: number) {
  try {
    const isProd = process.env.NODE_ENV === "production";
    const secure = isProd ? "Secure;" : ""; // dev ortamında kaldır
    const sameSite = isProd ? "Strict" : "Lax";

    document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; ${secure} SameSite=${sameSite}`;
    console.debug(`[Cookie] ${name} set (secure=${!!isProd})`);
  } catch (err) {
    console.warn("[Cookie] setCookie failed:", err);
  }
}
