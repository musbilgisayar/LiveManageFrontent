import type { NavGroup } from "@/app/[locale]/(DashboardLayout)/types/layout/sidebar";

function normalizePermission(value: string) {
  return value.trim().toLowerCase();
}

function toPermissionSet(permissions: string[]) {
  return new Set(
    permissions
      .filter(Boolean)
      .map((permission) => normalizePermission(permission))
  );
}

function hasAllPermissions(
  permissionSet: Set<string>,
  required: string[]
) {
  return required.every((permission) =>
    permissionSet.has(normalizePermission(permission))
  );
}

function hasAnyPermission(
  permissionSet: Set<string>,
  required: string[]
) {
  return required.some((permission) =>
    permissionSet.has(normalizePermission(permission))
  );
}

function canAccessItem(
  item: NavGroup,
  permissionSet: Set<string>
) {
  const requiredAll = item.requiredAllPermissions ?? [];
  const requiredAny = item.requiredAnyPermissions ?? [];

  if (requiredAll.length > 0 && !hasAllPermissions(permissionSet, requiredAll)) {
    return false;
  }

  if (requiredAny.length > 0 && !hasAnyPermission(permissionSet, requiredAny)) {
    return false;
  }

  return true;
}

export function filterMenuByPermissions(
  items: NavGroup[],
  permissions: string[]
): NavGroup[] {
  const permissionSet = toPermissionSet(permissions);

  return items
    .map((item) => {
      const cloned: NavGroup = { ...item };

      if (cloned.children?.length) {
        cloned.children = filterMenuByPermissions(
          cloned.children,
          permissions
        );
      }

      return cloned;
    })
    .filter((item, index, array) => {
      const selfVisible = canAccessItem(item, permissionSet);
      const hasVisibleChildren = !!item.children?.length;

      if (item.navlabel) {
        const nextItems = array.slice(index + 1);
        return nextItems.some((nextItem) => {
          if (nextItem.navlabel) return false;
          return canAccessItem(nextItem, permissionSet) || !!nextItem.children?.length;
        });
      }

      if (item.children?.length) {
        return selfVisible || hasVisibleChildren;
      }

      return selfVisible;
    });
}