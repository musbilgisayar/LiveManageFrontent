// src/lib/config.ts

// API base URL - from env variable
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!API_BASE) {
  throw new Error("❌ Environment variable NEXT_PUBLIC_API_BASE_URL is missing.");
}

// Default language prefix (e.g., 'en', 'tr', not full culture code)
export const DEFAULT_LANG = "en"; // ⚠️ Bu, 'en-US' değil, sadece dil prefixi

// Development environment flag
export const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
