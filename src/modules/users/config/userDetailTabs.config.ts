import { UserDetailRole, UserDetailTabDefinition } from "@/modules/users/types/UserDetail.types";

const ALL_TABS: UserDetailTabDefinition[] = [
  { key: "overview", labelKey: "users:detail.tabs.overview" },
  { key: "account", labelKey: "users:detail.tabs.account" },
  { key: "contact", labelKey: "users:detail.tabs.contact" },
  { key: "verification", labelKey: "users:detail.tabs.verification" },
  { key: "security", labelKey: "users:detail.tabs.security" },
  { key: "professional", labelKey: "users:detail.tabs.professional" },
  { key: "preferences", labelKey: "users:detail.tabs.preferences" },
  { key: "lifecycle", labelKey: "users:detail.tabs.lifecycle" },
];

const TAB_ACCESS: Record<UserDetailRole, UserDetailTabDefinition["key"][]> = {
  superadmin: [
    "overview",
    "account",
    "contact",
    "verification",
    "security",
    "professional",
    "preferences",
    "lifecycle",
  ],
  admin: ["overview", "account", "contact", "verification", "professional", "preferences"],
  manager: ["overview", "contact", "professional", "preferences"],
  auditor: ["overview", "verification", "security", "lifecycle"],
  staff: ["overview", "contact", "professional"],
  employee: ["overview", "contact", "professional", "preferences"],
  member: ["overview", "contact", "preferences"],
  user: ["overview", "contact", "preferences"],
};

export function getUserDetailTabs(role: UserDetailRole): UserDetailTabDefinition[] {
  const allowed = new Set(TAB_ACCESS[role] ?? ["overview"]);
  return ALL_TABS.filter((tab) => allowed.has(tab.key));
}