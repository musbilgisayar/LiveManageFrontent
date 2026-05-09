import type {
  ApiResponse,
  CreateManagedPropertyApplicationRequestDto,
  CreateManagementApplicationResponseData,
  ManagedPropertyApplicationListItemDto,
} from "../types/managementApplication.types";

async function parseJsonSafe<T>(res: Response): Promise<ApiResponse<T> | null> {
  try {
    return (await res.json()) as ApiResponse<T>;
  } catch {
    return null;
  }
}

function buildErrorResult<T>(message: string): ApiResponse<T> {
  return {
    ok: false,
    message,
    userMessage: message,
    data: null,
  };
}

export async function createManagementApplication(
  payload: CreateManagedPropertyApplicationRequestDto,
): Promise<ApiResponse<CreateManagementApplicationResponseData>> {
  try {
    const res = await fetch("/api/v1.0/property-management/applications", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const json = await parseJsonSafe<CreateManagementApplicationResponseData>(res);

    if (!res.ok) {
      return {
        ok: false,
        message: json?.message ?? null,
        userMessage:
          json?.userMessage || json?.message || "Başvuru gönderilemedi.",
        data: json?.data ?? null,
      };
    }

    return {
      ok: json?.ok ?? true,
      message: json?.message ?? null,
      userMessage: json?.userMessage ?? null,
      data: json?.data ?? null,
    };
  } catch (error) {
    console.error("[managementApplication.service][create] failed", error);

    return buildErrorResult(
      "Başvuru gönderilirken beklenmeyen bir hata oluştu.",
    );
  }
}

export async function getMyManagementApplications(): Promise<
  ApiResponse<ManagedPropertyApplicationListItemDto[]>
> {
  try {
    const res = await fetch("/api/v1.0/property-management/applications", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    const json =
      await parseJsonSafe<ManagedPropertyApplicationListItemDto[]>(res);

    if (!res.ok) {
      return {
        ok: false,
        message: json?.message ?? null,
        userMessage:
          json?.userMessage || json?.message || "Başvurular alınamadı.",
        data: [],
      };
    }

    return {
      ok: json?.ok ?? true,
      message: json?.message ?? null,
      userMessage: json?.userMessage ?? null,
      data: Array.isArray(json?.data) ? json.data : [],
    };
  } catch (error) {
    console.error("[managementApplication.service][getMy] failed", error);

    return {
      ...buildErrorResult("Başvurular alınırken beklenmeyen bir hata oluştu."),
      data: [],
    };
  }
}