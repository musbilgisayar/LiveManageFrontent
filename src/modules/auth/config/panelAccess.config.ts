//bu dosya, kullanıcı izinlerine göre yönlendirme yapılacak panellerin tanımlandığı ve çözümleme fonksiyonunun bulunduğu konfigürasyon dosyasıdır. Bu yapı, farklı kullanıcı rollerine sahip panellerin yönetilmesini ve kullanıcıların uygun panellere yönlendirilmesini sağlar. Her panel, belirli izinlere sahip kullanıcılar tarafından erişilebilir olacak şekilde tanımlanır ve çözümleme fonksiyonu, kullanıcının izinlerine göre en uygun panel yolunu belirler.
// src/modules/auth/confige/panelAccess.config.ts
export type PanelKey =
  | "superadmin"
  | "admin"
  | "manager"
  | "staff"
  | "employee"
  | "auditor"
  | "member"
  | "user";

export type PanelAccessRule = {
  key: PanelKey;
  label: string;
  path: string;
  priority: number;
  requiredAnyPermissions: string[];
};

export const PANEL_ACCESS_RULES: PanelAccessRule[] = [
  {
    key: "superadmin",
    label: "SuperAdmin Panel",
    path: "/superadmin/dashboard",
    priority: 100,
    requiredAnyPermissions: [
      "monitoring.summary.view.tenant",
      "permissions.view.tenant",
      "audit.entity_history.view.tenant",
      "localization.manage.global",
      "culture.cache.clear.global",
    ],
  },
  {
    key: "admin",
    label: "Admin Panel",
    path: "/admin/dashboard",
    priority: 90,
    requiredAnyPermissions: [
      "users.view.tenant",
      "users.detail.tenant",
      "roles.view.tenant",
      "permissions.view.tenant",
    ],
  },
  {
    key: "manager",
    label: "Manager Panel",
    path: "/manager/dashboard",
    priority: 80,
    requiredAnyPermissions: [
      "admin.property.applications.view_pending.tenant",
    ],
  },
  {
    key: "user",
    label: "User Panel",
    path: "/user/dashboard",
    priority: 10,
    requiredAnyPermissions: [
      "account.me.view.self",
      "profile.addresses.view.self",
      "property.applications.view_own.self",
    ],
  },
];

export function resolvePanelPathByPermissions(
  permissions: string[],
  locale: string
): string {
  const permissionSet = new Set(
    permissions.map((permission) => permission.toLowerCase())
  );

  const matchedRule = [...PANEL_ACCESS_RULES]
    .sort((a, b) => b.priority - a.priority)
    .find((rule) =>
      rule.requiredAnyPermissions.some((permission) =>
        permissionSet.has(permission.toLowerCase())
      )
    );

  if (!matchedRule) {
    return `/${locale}/unauthorized`;
  }

  return `/${locale}${matchedRule.path}`;
}