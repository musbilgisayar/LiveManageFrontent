// 📂 src/app/[locale]/(DashboardLayout)/layout/sidebar/MenuItems.ts

import { uniqueId } from "lodash";

import {
  IconActivity,
  IconBuildingCommunity,
  IconChecklist,
  IconClipboardList,
  IconFileDescription,
  IconGitMerge,
  IconHome,
  IconKey,
  IconLayoutGrid,
  IconMapPin,
  IconPoint,
  IconSettings,
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
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.managementApplications.create",
    icon: IconFileDescription,
    href: "/management-applications/create",
    requiredAnyPermissions: ["property.applications.create.self"],
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.managementApplications.my",
    icon: IconChecklist,
    href: "/management-applications/my",
    requiredAnyPermissions: ["property.applications.view_own.self"],
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.managementApplications.review",
    icon: IconShieldCheck,
    href: "/management-applications/review",
    requiredAnyPermissions: ["admin.property.applications.view_pending.tenant"],
  },

  {
    navlabel: true,
    subheader: "sidebar:group.realEstate",
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
      "property.applications.view_own.self",
      "admin.property.applications.view_pending.tenant",
    ],
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.realEstate.addresses",
    icon: IconMapPin,
    href: "/property-management/addresses",
    requiredAnyPermissions: [
      "profile.addresses.view.self",
      "address.hierarchy.view.global",
    ],
  },

  {
    navlabel: true,
    subheader: "sidebar:group.operations",
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
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.users.root",
    icon: IconUserCircle,
    href: "/apps/profile",
    requiredAnyPermissions: ["users.view.tenant", "account.me.view.self"],
    children: [
      {
        id: uniqueId(),
        title: "sidebar:menu.users.admin",
        icon: IconUsers,
        href: "/superadmin/users",
        requiredAnyPermissions: ["users.view.tenant"],
      },
      {
        id: uniqueId(),
        title: "sidebar:menu.users.profile",
        icon: IconPoint,
        href: "/apps/profile",
        requiredAnyPermissions: ["account.me.view.self"],
      },
    ],
  },

  {
    navlabel: true,
    subheader: "sidebar:group.authorization",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.authorization.roles.root",
    icon: IconShieldCheck,
    href: "/superadmin/roles",
    requiredAnyPermissions: ["roles.view.tenant"],
    children: [
      {
        id: uniqueId(),
        title: "sidebar:menu.authorization.roles.list",
        icon: IconUsers,
        href: "/superadmin/roles",
        requiredAnyPermissions: ["roles.view.tenant"],
      },
    ],
  },

  {
  id: uniqueId(),
  title: "sidebar:menu.authorization.permissions.root",
  icon: IconKey,
  href: "/permissions",
  requiredAnyPermissions: ["permissions.view.tenant"],
  children: [
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
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.monitoring.root",
    icon: IconActivity,
    href: "/superadmin/monitoring",
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
        href: "/superadmin/monitoring",
        requiredAnyPermissions: ["monitoring.summary.view.tenant"],
      },
      {
        id: uniqueId(),
        title: "sidebar:menu.monitoring.securityTimeline",
        icon: IconPoint,
        href: "/superadmin/monitoring/security-timeline",
        requiredAnyPermissions: ["monitoring.security_timeline.view.tenant"],
      },
      {
        id: uniqueId(),
        title: "sidebar:menu.monitoring.lockoutCenter",
        icon: IconPoint,
        href: "/superadmin/monitoring/lockouts",
        requiredAnyPermissions: ["monitoring.lockouts.view.tenant"],
      },
      {
        id: uniqueId(),
        title: "sidebar:menu.monitoring.auditTimeline",
        icon: IconPoint,
        href: "/superadmin/monitoring/audit-timeline",
        requiredAnyPermissions: ["monitoring.audit_timeline.view.tenant"],
      },
    ],
  },

  {
    navlabel: true,
    subheader: "sidebar:group.localization",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.localization.root",
    icon: IconGitMerge,
    href: "/superadmin/localization",
    requiredAnyPermissions: ["localization.view.global", "localization.manage.global"],
    children: [
      {
        id: uniqueId(),
        title: "sidebar:menu.localization.translations",
        icon: IconPoint,
        href: "/superadmin/localization",
        requiredAnyPermissions: [
          "localization.view.global",
          "localization.manage.global",
        ],
      },
      {
        id: uniqueId(),
        title: "sidebar:menu.localization.keys",
        icon: IconPoint,
        href: "/superadmin/localization/keys",
        requiredAnyPermissions: [
          "localization.view.global",
          "localization.manage.global",
        ],
      },
      {
        id: uniqueId(),
        title: "sidebar:menu.localization.namespaces",
        icon: IconPoint,
        href: "/superadmin/localization/namespaces",
        requiredAnyPermissions: [
          "localization.view.global",
          "localization.manage.global",
        ],
      },
    ],
  },

  {
    id: uniqueId(),
    title: "sidebar:menu.auth.maintenance",
    icon: IconSettings,
    href: "/auth/maintenance",
  },
];

export default Menuitems;