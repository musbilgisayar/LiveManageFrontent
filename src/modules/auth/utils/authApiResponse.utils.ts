// src/modules/auth/utils/authApiResponse.utils.ts

export type ApiErrorResponse = {
  ok: false;
  success?: false;
  isSuccess?: false;
  error?: string;
  message?: string;
  title?: string;
  userMessage?: string;
  details?: Record<string, unknown> | string | null;
};

export type ApiSuccessResponse<TData = unknown> = {
  ok: true;
  success?: true;
  isSuccess?: true;
  message?: string;
  userMessage?: string;
  data?: TData;
};

export type ApiResponse<TData = unknown> =
  | ApiSuccessResponse<TData>
  | ApiErrorResponse;

export function asText(value: unknown): string {
  if (value == null) return "";

  if (typeof value === "string") return value;

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;

    return (
      (typeof obj.userMessage === "string" && obj.userMessage) ||
      (typeof obj.message === "string" && obj.message) ||
      (typeof obj.error === "string" && obj.error) ||
      (typeof obj.title === "string" && obj.title) ||
      ""
    );
  }

  return String(value);
}

export function unwrapApiResponse<TData = unknown>(
  raw: unknown
): ApiResponse<TData> {
  if (!raw || typeof raw !== "object") {
    return {
      ok: false,
      error: "UNKNOWN_RESPONSE",
      message: "Unknown response.",
    };
  }

  const obj = raw as Record<string, unknown>;

  if (
    typeof obj.ok === "boolean" ||
    typeof obj.success === "boolean" ||
    typeof obj.isSuccess === "boolean"
  ) {
    const ok =
      obj.ok === true ||
      obj.success === true ||
      obj.isSuccess === true;

    return {
      ...(obj as Record<string, unknown>),
      ok,
    } as ApiResponse<TData>;
  }

  const data = obj.data;

  if (data && typeof data === "object") {
    const dataObj = data as Record<string, unknown>;

    if (
      typeof dataObj.ok === "boolean" ||
      typeof dataObj.success === "boolean" ||
      typeof dataObj.isSuccess === "boolean"
    ) {
      const ok =
        dataObj.ok === true ||
        dataObj.success === true ||
        dataObj.isSuccess === true;

      return {
        ...dataObj,
        ok,
      } as ApiResponse<TData>;
    }
  }

  return {
    ok: false,
    error: "INVALID_RESPONSE_SHAPE",
    message: asText(raw) || "Invalid response shape.",
  };
}

export function findValidationDetails(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return null;

  const obj = raw as Record<string, unknown>;

  if (obj.details) return obj.details;
  if (obj.errors) return obj.errors;

  if (obj.data && typeof obj.data === "object") {
    const dataObj = obj.data as Record<string, unknown>;

    if (dataObj.details) return dataObj.details;
    if (dataObj.errors) return dataObj.errors;
  }

  if (obj.error && typeof obj.error === "object") {
    const errorObj = obj.error as Record<string, unknown>;

    if (errorObj.details) return errorObj.details;
    if (errorObj.errors) return errorObj.errors;

    if (errorObj.data && typeof errorObj.data === "object") {
      const errorDataObj = errorObj.data as Record<string, unknown>;

      if (errorDataObj.details) return errorDataObj.details;
      if (errorDataObj.errors) return errorDataObj.errors;
    }
  }

  return null;
}
