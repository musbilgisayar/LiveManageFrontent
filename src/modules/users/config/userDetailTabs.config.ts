//src/modules/users/config/userDetailTabs.config.ts
import type {
  UserDetailTabDefinition,
  UserDetailTabKey,
} from "@/modules/users/types/UserDetail.types";

export type UserDetailMode = "admin" | "self";

export type UserDetailTabConfig = UserDetailTabDefinition & {
  visibleIn: UserDetailMode[];
  requiredAnyPermissions?: string[];
};

export const USER_DETAIL_TABS: UserDetailTabConfig[] = [
  {
    key: "overview",
    labelKey: "users:detail.tabs.overview",
    visibleIn: ["admin", "self"],
  },
  {
    key: "identity",
    labelKey: "users:detail.tabs.identity",
    visibleIn: ["admin", "self"],
  },
  {
    key: "contact",
    labelKey: "users:detail.tabs.contact",
    visibleIn: ["admin", "self"],
  },
  {
    key: "preferences",
    labelKey: "users:detail.tabs.preferences",
    visibleIn: ["admin", "self"],
  },
  {
    key: "security",
    labelKey: "users:detail.tabs.security",
    visibleIn: ["admin", "self"],
  },
  {
    key: "organization",
    labelKey: "users:detail.tabs.organization",
    visibleIn: ["admin"],
  },
  {
    key: "permissions",
    labelKey: "users:detail.tabs.permissions",
    visibleIn: ["admin"],
  },
  {
    key: "audit",
    labelKey: "users:detail.tabs.audit",
    visibleIn: ["admin"],
  },
  {
    key: "system",
    labelKey: "users:detail.tabs.system",
    visibleIn: ["admin"],
  },
];

type GetUserDetailTabsParams = {
  mode: UserDetailMode;
  permissions?: string[] | null;
};

function hasAnyPermission(
  userPermissions: string[] | null | undefined,
  requiredPermissions: string[] | undefined
): boolean {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }

  const permissionSet = new Set(userPermissions);

  return requiredPermissions.some((permission) => permissionSet.has(permission));
}

export function getUserDetailTabs({
  mode,
  permissions,
}: GetUserDetailTabsParams): UserDetailTabDefinition[] {
  return USER_DETAIL_TABS.filter((tab) => {
    if (!tab.visibleIn.includes(mode)) {
      return false;
    }

    return hasAnyPermission(permissions, tab.requiredAnyPermissions);
  }).map((tab) => ({
    key: tab.key,
    labelKey: tab.labelKey,
  }));
}

export function isUserDetailTabVisible(
  key: UserDetailTabKey,
  params: GetUserDetailTabsParams
): boolean {
  return getUserDetailTabs(params).some((tab) => tab.key === key);
}
