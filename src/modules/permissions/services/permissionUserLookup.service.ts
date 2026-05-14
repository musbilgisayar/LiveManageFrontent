// File: src/modules/permissions/services/permissionUserLookup.service.ts
import type { PermissionUserLookupItemDto } from "../types/PermissionUserLookup.types";

type ErrorPayload = {
  userMessage?: string;
  message?: string;
  code?: string;
};

export class PermissionUserLookupError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "PermissionUserLookupError";
    this.status = status;
    this.code = code;
  }
}

async function readJson<T>(res: Response): Promise<T> {
  const text = await res.text();

  let json: unknown = null;

  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      if (!res.ok) {
        throw new PermissionUserLookupError(
          text || "Request failed",
          res.status
        );
      }

      throw new PermissionUserLookupError(
        "Geçersiz sunucu yanıtı alındı.",
        res.status || 500
      );
    }
  }

  if (!res.ok) {
    const errorBody =
      json && typeof json === "object" ? (json as ErrorPayload) : undefined;

    const message =
      errorBody?.userMessage ||
      errorBody?.message ||
      "Request failed";

    throw new PermissionUserLookupError(
      message,
      res.status,
      errorBody?.code
    );
  }

  return json as T;
}

export const permissionUserLookupService = {
  async searchUsers(
    query: string
  ): Promise<PermissionUserLookupItemDto[]> {
    const trimmed = query.trim();

    if (!trimmed) {
      return [];
    }

    const params = new URLSearchParams();
    params.set("q", trimmed);

    const res = await fetch(
      `/api/v1.0/permissions/users/search?${params.toString()}`,
      
      {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    const json = await readJson<unknown>(res);

    if (Array.isArray(json)) return json as PermissionUserLookupItemDto[];
    if (Array.isArray((json as { items?: unknown[] })?.items)) {
      return (json as { items: PermissionUserLookupItemDto[] }).items;
    }
    if (Array.isArray((json as { data?: unknown[] })?.data)) {
      return (json as { data: PermissionUserLookupItemDto[] }).data;
    }
    if (
      Array.isArray(
        (json as { data?: { items?: unknown[] } })?.data?.items
      )
    ) {
      return (json as { data: { items: PermissionUserLookupItemDto[] } }).data.items;
    }

    return [];
  },
};

