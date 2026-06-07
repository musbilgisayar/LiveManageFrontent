import {
  isSessionExpiredPayload,
  redirectToLoginForSessionExpired,
} from "@/utils/sessionExpiredRedirect.client";

/**
 * apiClient
 * - Lightweight client for Next.js BFF requests.
 * - Uses HttpOnly cookie auth through the BFF.
 * - Centrally redirects on SESSION_EXPIRED responses.
 */

async function readJson(res: Response): Promise<any> {
  return res.json().catch(() => ({}));
}

function handleSessionExpired(json: unknown, status: number): void {
  if (isSessionExpiredPayload(json, status)) {
    redirectToLoginForSessionExpired();
  }
}

export const apiClient = {
  async get<T = any>(url: string, init?: RequestInit): Promise<{ data: T }> {
    const res = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        accept: "application/json",
        ...(init?.headers || {}),
      },
      ...init,
    });
    const json = await readJson(res);
    handleSessionExpired(json, res.status);
    if (!res.ok) throw new Error(`[GET] ${url} -> ${res.status}`);
    return { data: json };
  },

  async post<T = any>(
    url: string,
    body?: any,
    init?: RequestInit
  ): Promise<{ data: T }> {
    const res = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        ...(init?.headers || {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      ...init,
    });
    const json = await readJson(res);
    handleSessionExpired(json, res.status);
    if (!res.ok) throw new Error(`[POST] ${url} -> ${res.status}`);
    return { data: json };
  },

  async put<T = any>(
    url: string,
    body?: any,
    init?: RequestInit
  ): Promise<{ data: T }> {
    const res = await fetch(url, {
      method: "PUT",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        ...(init?.headers || {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      ...init,
    });
    const json = await readJson(res);
    handleSessionExpired(json, res.status);
    if (!res.ok) throw new Error(`[PUT] ${url} -> ${res.status}`);
    return { data: json };
  },

  async delete<T = any>(url: string, init?: RequestInit): Promise<{ data: T }> {
    const res = await fetch(url, {
      method: "DELETE",
      credentials: "include",
      headers: {
        accept: "application/json",
        ...(init?.headers || {}),
      },
      ...init,
    });
    const json = await readJson(res);
    handleSessionExpired(json, res.status);
    if (!res.ok) throw new Error(`[DELETE] ${url} -> ${res.status}`);
    return { data: json };
  },
};
