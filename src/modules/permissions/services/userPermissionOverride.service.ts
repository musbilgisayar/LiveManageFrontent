import type {
  AssignUserPermissionRequest,
  EffectivePermissionDto,
  GenericResponseDto,
  PermissionDefinitionDto,
  RevokeAllUserPermissionsRequest,
  RevokeUserPermissionRequest,
  UserPermissionDto,
  UserPermissionHistoryDto,
} from "../types/UserPermissionOverride.types";

async function readJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message =
      json?.userMessage ||
      json?.message ||
      "Request failed";

    throw new Error(message);
  }

  return json as T;
}

export const userPermissionOverrideService = {
  async getCatalog(): Promise<PermissionDefinitionDto[]> {
    const res = await fetch("/api/v1.0/permissions", {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });

    return readJson<PermissionDefinitionDto[]>(res);
  },

  async getModules(): Promise<string[]> {
    const res = await fetch("/api/v1.0/permissions/modules", {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });

    return readJson<string[]>(res);
  },

  async getUserDirectPermissions(
    userId: string
  ): Promise<UserPermissionDto[]> {
    const res = await fetch(
      `/api/v1.0/user-permissions/${userId}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      }
    );

    return readJson<UserPermissionDto[]>(res);
  },

  async getUserEffectivePermissions(
    userId: string
  ): Promise<EffectivePermissionDto[]> {
    const res = await fetch(
      `/api/v1.0/user-permissions/${userId}/effective`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      }
    );

    return readJson<EffectivePermissionDto[]>(res);
  },

  async getUserPermissionHistory(
    userId: string
  ): Promise<UserPermissionHistoryDto[]> {
    const res = await fetch(
      `/api/v1.0/user-permissions/${userId}/history`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      }
    );

    return readJson<UserPermissionHistoryDto[]>(res);
  },

  async assignPermission(
    request: AssignUserPermissionRequest
  ): Promise<GenericResponseDto> {
    const res = await fetch(
      "/api/v1.0/user-permissions/assign",
      {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      }
    );

    return readJson<GenericResponseDto>(res);
  },

  async revokePermission(
    request: RevokeUserPermissionRequest
  ): Promise<GenericResponseDto> {
    const res = await fetch(
      "/api/v1.0/user-permissions/revoke",
      {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      }
    );

    return readJson<GenericResponseDto>(res);
  },

  async revokeAll(
    request: RevokeAllUserPermissionsRequest
  ): Promise<GenericResponseDto> {
    const res = await fetch(
      "/api/v1.0/user-permissions/revoke-all",
      {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      }
    );

    return readJson<GenericResponseDto>(res);
  },
};