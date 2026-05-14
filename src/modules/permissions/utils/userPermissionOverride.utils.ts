import type {
  EffectivePermissionDto,
  PermissionDefinitionDto,
  UserPermissionCatalogRow,
  UserPermissionDto,
  UserPermissionFilters,
} from "../types/UserPermissionOverride.types";

export function getPermissionId(
  permission: PermissionDefinitionDto
): string {
  return permission.permissionId || permission.id || "";
}

export function buildPermissionRows(params: {
  catalog: PermissionDefinitionDto[];
  direct: UserPermissionDto[];
  effective: EffectivePermissionDto[];
}): UserPermissionCatalogRow[] {
  const directByCode = new Map(
    params.direct.map((x) => [x.permissionCode, x])
  );

  const effectiveByCode = new Map(
    params.effective.map((x) => [x.permissionCode, x])
  );

  return params.catalog
    .map((permission) => {
      const permissionId = getPermissionId(permission);

      const direct = directByCode.get(
        permission.permissionCode
      );

      const effective = effectiveByCode.get(
        permission.permissionCode
      );

      const source = String(
        effective?.source || ""
      ).toLowerCase();

      const roleNames = effective?.roleNames ?? [];

      return {
        permissionId,
        permissionCode: permission.permissionCode,
        module: permission.module,
        action: permission.action,
        scope: permission.scope,
        group: permission.group,
        level: permission.level,
        description: permission.description,
        displayName: permission.displayName,

        isDirect: Boolean(direct),

        isEffective: Boolean(
          effective?.isGranted ?? effective
        ),

        isRoleSource:
          source.includes("role") ||
          roleNames.length > 0,

        roleNames,

        grantedAt: direct?.grantedAt,
        expirationDate: direct?.expirationDate,
      } satisfies UserPermissionCatalogRow;
    })
    .filter((x) => Boolean(x.permissionId));
}

export function filterPermissionRows(
  rows: UserPermissionCatalogRow[],
  filters: UserPermissionFilters
) {
  const search = filters.search
    .trim()
    .toLowerCase();

  return rows.filter((row) => {
    const matchesSearch =
      !search ||
      row.permissionCode
        .toLowerCase()
        .includes(search) ||
      row.module
        .toLowerCase()
        .includes(search) ||
      row.action
        .toLowerCase()
        .includes(search) ||
      String(row.description || "")
        .toLowerCase()
        .includes(search);

    const matchesModule =
      filters.module === "all" ||
      row.module === filters.module;

    const matchesScope =
      filters.scope === "all" ||
      row.scope === filters.scope;

    const matchesLevel =
      filters.level === "all" ||
      String(row.level || "") === filters.level;

    const matchesSource =
      filters.source === "all" ||
      (filters.source === "direct" &&
        row.isDirect) ||
      (filters.source === "role" &&
        row.isRoleSource) ||
      (filters.source === "effective" &&
        row.isEffective) ||
      (filters.source === "missing" &&
        !row.isEffective);

    return (
      matchesSearch &&
      matchesModule &&
      matchesScope &&
      matchesLevel &&
      matchesSource
    );
  });
}

export function getLevelLabel(
  level?: string | null
) {
  switch (String(level || "")) {
    case "1":
      return "View";

    case "2":
      return "Write";

    case "3":
      return "Critical";

    case "4":
      return "Sensitive";

    default:
      return "Standard";
  }
}
export function getSafePermissionText(
  value: unknown
): string {
  if (typeof value === "string") return value;

  if (
    value &&
    typeof value === "object" &&
    "key" in value &&
    typeof (value as { key?: unknown }).key === "string"
  ) {
    return (value as { key: string }).key;
  }

  return "";
}