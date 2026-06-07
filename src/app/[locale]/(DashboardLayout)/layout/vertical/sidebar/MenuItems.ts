// 📂 src/app/[locale]/(DashboardLayout)/layout/sidebar/MenuItems.ts

import { uniqueId } from "lodash";

import {
  IconListSearch,
  IconFolders,
  IconLanguage,
  IconActivity,
  IconBuildingCommunity,
  IconChecklist,
  IconClipboardList,
  IconFileDescription,
  IconHome,
  IconKey,
  IconLayoutGrid,
  IconMapPin,
  IconPoint,
  IconShieldCheck,
  IconSpeakerphone,
  IconUserCircle,
  IconUsers,
} from "@tabler/icons-react";

import { NavGroup } from "@/app/[locale]/(DashboardLayout)/types/layout/sidebar";

const Menuitems: NavGroup[] = [
  {
    navlabel: true,
    subheader: "sidebar:group.dashboard",
    requiredAnyPermissions: ["account.me.view.self"],
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.dashboard.root",
    icon: IconHome,
    href: "/dashboard",
    requiredAnyPermissions: ["account.me.view.self"],
  },

  {
    navlabel: true,
    subheader: "sidebar:group.managementApplications",
    requiredAnyPermissions: [
      "property.applications.create.self",
      "property.applications.view_own.self",
      "admin.property.applications.view_pending.tenant",
    ],
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.managementApplications.dashboard",
    icon: IconBuildingCommunity,
    href: "/management-applications",
    requiredAnyPermissions: [
      "property.applications.create.self",
      "property.applications.view_own.self",
      "admin.property.applications.view_pending.tenant",
    ],
  },

  {
    navlabel: true,
    subheader: "sidebar:group.realEstate",
    requiredAnyPermissions: [
      "property.applications.view_own.self",
      "admin.property.applications.view_pending.tenant",
      "profile.addresses.view.self",
      "address.hierarchy.view.global",
    ],
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.realEstate.mySpaces",
    icon: IconLayoutGrid,
    href: "/my-spaces",
    requiredAnyPermissions: [
      "property.applications.view_own.self",
      "admin.property.applications.view_pending.tenant",
    ],
  },
{
  id: uniqueId(),
  title: "sidebar:menu.realEstate.pendingActions",
  icon: IconChecklist,
  href: "/pending-actions",
  requiredAnyPermissions: [
    "admin.property.applications.view_pending.tenant",
  ],
},


  {
    navlabel: true,
    subheader: "sidebar:group.operations",
    requiredAnyPermissions: ["property.operations.view.tenant"],
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.operations.propertyOperations",
    icon: IconBuildingCommunity,
    href: "/operation-management/properties",
    requiredAnyPermissions: ["property.operations.view.tenant"],
  },

  {
    navlabel: true,
    subheader: "sidebar:group.listingManagement",
    requiredAnyPermissions: [
      "listings.create.tenant",
      "listings.view_own.self",
      "listings.view.tenant",
    ],
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.listings.create",
    icon: IconSpeakerphone,
    href: "/listings-management/create/select-property",
    requiredAnyPermissions: ["listings.create.tenant"],
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.listings.myListings",
    icon: IconClipboardList,
    href: "/listings-management/my-listings",
    requiredAnyPermissions: ["listings.view_own.self", "listings.view.tenant"],
  },

  {
    navlabel: true,
    subheader: "sidebar:group.users",
    requiredAnyPermissions: ["account.me.view.self", "users.view.tenant"],
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.users.myProfile",
    icon: IconUserCircle,
    href: "/my-profile",
    requiredAnyPermissions: ["account.me.view.self"],
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.users.admin",
    icon: IconUsers,
    href: "/users",
    requiredAnyPermissions: ["users.view.tenant"],
  },

  {
    navlabel: true,
    subheader: "sidebar:group.authorization",
    requiredAnyPermissions: [
      "roles.view.tenant",
      "permissions.view.tenant",
      "permissions.assign.tenant",
      "permissions.revoke.tenant",
      "permissions.role_permissions.view.tenant",
    ],
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.authorization.roles.root",
    icon: IconShieldCheck,
    href: "/roles",
    requiredAnyPermissions: ["roles.view.tenant"],
    children: [
      {
        id: uniqueId(),
        title: "sidebar:menu.authorization.roles.list",
        icon: IconUsers,
        href: "/roles",
        requiredAnyPermissions: ["roles.view.tenant"],
      },
    ],
  },
  {
  id: uniqueId(),
  title: "sidebar:menu.authorization.roleManager",
  icon: IconShieldCheck,
  href: "/role-manager",
  requiredAnyPermissions: [
    "rolemanager.summary.view.tenant",
    "rolemanager.distribution.view.tenant",
    "rolemanager.users.view.tenant",
  ],
},
  {
    id: uniqueId(),
    title: "sidebar:menu.authorization.permissions.root",
    icon: IconKey,
    href: "/permissions",
    requiredAnyPermissions: [
      "permissions.view.tenant",
      "permissions.assign.tenant",
      "permissions.revoke.tenant",
      "permissions.role_permissions.view.tenant",
    ],


    
    children: [
      {
        id: uniqueId(),
        title: "sidebar:menu.permissions.userOverrides",
        icon: IconShieldCheck,
        href: "/permissions/user-overrides",
        requiredAnyPermissions: [
          "permissions.assign.tenant",
          "permissions.revoke.tenant",
          "permissions.view.tenant",
        ],
      },
      {
        id: uniqueId(),
        title: "sidebar:menu.authorization.permissions.dashboard",
        icon: IconPoint,
        href: "/permissions",
        requiredAnyPermissions: ["permissions.view.tenant"],
      },
      {
        id: uniqueId(),
        title: "sidebar:menu.authorization.permissions.catalog",
        icon: IconPoint,
        href: "/permissions/catalog",
        requiredAnyPermissions: ["permissions.view.tenant"],
      },
      {
        id: uniqueId(),
        title: "sidebar:menu.authorization.permissions.roleMatrix",
        icon: IconPoint,
        href: "/permissions/role-matrix",
        requiredAnyPermissions: ["permissions.role_permissions.view.tenant"],
      },
    ],
  },

  {
    navlabel: true,
    subheader: "sidebar:group.monitoring",
    requiredAnyPermissions: [
      "monitoring.summary.view.tenant",
      "monitoring.security_timeline.view.tenant",
      "monitoring.lockouts.view.tenant",
      "monitoring.audit_timeline.view.tenant",
    ],
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.monitoring.root",
    icon: IconActivity,
    href: "/monitoring",
    requiredAnyPermissions: [
      "monitoring.summary.view.tenant",
      "monitoring.security_timeline.view.tenant",
      "monitoring.lockouts.view.tenant",
      "monitoring.audit_timeline.view.tenant",
    ],
    children: [
      {
        id: uniqueId(),
        title: "sidebar:menu.monitoring.dashboard",
        icon: IconPoint,
        href: "/monitoring",
        requiredAnyPermissions: ["monitoring.summary.view.tenant"],
      },
      {
        id: uniqueId(),
        title: "sidebar:menu.monitoring.securityTimeline",
        icon: IconPoint,
        href: "/monitoring/security-timeline",
        requiredAnyPermissions: ["monitoring.security_timeline.view.tenant"],
      },
      {
        id: uniqueId(),
        title: "sidebar:menu.monitoring.lockoutCenter",
        icon: IconPoint,
        href: "/monitoring/lockouts",
        requiredAnyPermissions: ["monitoring.lockouts.view.tenant"],
      },
      {
        id: uniqueId(),
        title: "sidebar:menu.monitoring.auditTimeline",
        icon: IconPoint,
        href: "/monitoring/audit-timeline",
        requiredAnyPermissions: ["monitoring.audit_timeline.view.tenant"],
      },
    ],
  },

  {
    navlabel: true,
    subheader: "sidebar:group.localization",
    requiredAnyPermissions: ["localization.view.global"],
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.localization.dashboard",
    icon: IconLanguage,
    href: "/localization/dashboard",
    requiredAnyPermissions: ["localization.view.global"],
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.localization.manager",
    icon: IconListSearch,
    href: "/localization/manager",
    requiredAnyPermissions: ["localization.view.global"],
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.localization.namespaces",
    icon: IconFolders,
    href: "/localization/namespaces",
    requiredAnyPermissions: ["localization.view.global"],
  },

];

export default Menuitems;
