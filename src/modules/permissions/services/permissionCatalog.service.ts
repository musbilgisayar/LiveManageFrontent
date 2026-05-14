// src/modules/permissions/services/permissionCatalog.service.ts

import type {
  PermissionCatalogDto,
  PermissionDefinitionDto,
  PermissionLevel,
  PermissionModuleSummaryDto,
  PermissionRiskLevel,
  PermissionScope,
} from "../types/Permission.types";

type ApiEnvelope<T> = {
  ok?: boolean;
  data?: T;
  userMessage?: string;
  message?: string;
  error?: string;
  success?: boolean;
};

function unwrapApiData<T>(json: ApiEnvelope<T> | T): T {
  if (json && typeof json === "object" && "data" in json) {
    return (json as ApiEnvelope<T>).data as T;
  }

  return json as T;
}

function toScope(value: unknown): PermissionScope {
  return value === "self" || value === "tenant" || value === "global"
    ? value
    : "tenant";
}

function toLevel(value: unknown): PermissionLevel {
  const level = String(value ?? "1");

  return level === "1" || level === "2" || level === "3" || level === "4"
    ? level
    : "1";
}

function toRiskLevel(level: PermissionLevel, isSensitive: boolean): PermissionRiskLevel {
  if (isSensitive || level === "4") return "critical";
  if (level === "3") return "high";
  if (level === "2") return "medium";
  return "low";
}

function mapPermission(raw: any): PermissionDefinitionDto {
  const level = toLevel(raw.level);
  const isSensitive = Boolean(raw.isRestricted ?? raw.isSensitive ?? false);

  return {
    id: raw.id,
    code: raw.permissionCode ?? raw.code ?? "",
    module: raw.module ?? "",
    action: raw.action ?? "",
    scope: toScope(raw.scope),
    group: raw.group ?? "",
    level,
    descriptionKey: raw.description?.key ?? raw.descriptionKey ?? "",
    fallbackDescription: raw.descriptionText ?? raw.fallbackDescription ?? "",
    isSensitive,
    riskLevel: toRiskLevel(level, isSensitive),
    isActive: Boolean(raw.isEnabled ?? raw.isActive ?? true),
  };
}

function buildModuleSummaries(
  permissions: PermissionDefinitionDto[]
): PermissionModuleSummaryDto[] {
  const moduleNames = Array.from(
    new Set(permissions.map((x) => x.module).filter(Boolean))
  ).sort();

  return moduleNames.map((module) => {
    const modulePermissions = permissions.filter((x) => x.module === module);

    return {
      module,
      displayNameKey: `permissions:module.${module}`,
      fallbackDisplayName: module,
      totalPermissions: modulePermissions.length,
      sensitivePermissions: modulePermissions.filter((x) => x.isSensitive).length,
      tenantScoped: modulePermissions.filter((x) => x.scope === "tenant").length,
      selfScoped: modulePermissions.filter((x) => x.scope === "self").length,
      globalScoped: modulePermissions.filter((x) => x.scope === "global").length,
    };
  });
}

function normalizeCatalog(raw: any): PermissionCatalogDto {
  const permissions: PermissionDefinitionDto[] = Array.isArray(raw)
    ? raw.map(mapPermission)
    : Array.isArray(raw?.permissions)
      ? raw.permissions.map(mapPermission)
      : [];

  return {
    permissions,
    modules: buildModuleSummaries(permissions),
  };
}

export async function getPermissionCatalog(): Promise<PermissionCatalogDto> {
  const response = await fetch("/api/v1.0/permissions", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  const json = await response.json().catch(() => null);

  if (!response.ok || json?.ok === false) {
    throw new Error(
      json?.userMessage ||
        json?.message ||
        json?.error ||
        "permissions:catalog.loadError"
    );
  }

  const raw = unwrapApiData<any>(json);
 

  return normalizeCatalog(raw);
}