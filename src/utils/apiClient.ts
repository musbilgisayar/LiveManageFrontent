// 📁 src/utils/apiClient.ts
/**
 * 🌐 apiClient
 * - Next.js BFF (3000) katmanına yönlendirilmiş istekler için hafif client
 * - Her çağrı 200 {ok,data,error} yapısına uygun döner
 * - JWT, locale ve correlation header'ları BFF tarafında otomatik eklenir
 */
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
    if (!res.ok) throw new Error(`[GET] ${url} → ${res.status}`);
    const json = await res.json().catch(() => ({}));
    return { data: json };
  },

  async post<T = any>(url: string, body?: any, init?: RequestInit): Promise<{ data: T }> {
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
    if (!res.ok) throw new Error(`[POST] ${url} → ${res.status}`);
    const json = await res.json().catch(() => ({}));
    return { data: json };
  },

  async put<T = any>(url: string, body?: any, init?: RequestInit): Promise<{ data: T }> {
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
    if (!res.ok) throw new Error(`[PUT] ${url} → ${res.status}`);
    const json = await res.json().catch(() => ({}));
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
    if (!res.ok) throw new Error(`[DELETE] ${url} → ${res.status}`);
    const json = await res.json().catch(() => ({}));
    return { data: json };
  },
};
