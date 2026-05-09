// src/modules/permissions/services/permissionCatalog.service.ts

import { PERMISSION_CATALOG_MOCK } from "../utils/permissionMockData";
import type { PermissionCatalogDto } from "../types/Permission.types";

const USE_MOCK = true;

export async function getPermissionCatalog(): Promise<PermissionCatalogDto> {
  if (USE_MOCK) {
    return PERMISSION_CATALOG_MOCK;
  }

  const response = await fetch("/api/v1.0/permissions", {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Permission catalog could not be loaded.");
  }

  const json = await response.json();

  return json?.data ?? json;
}