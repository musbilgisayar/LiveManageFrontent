// 📂 src/app/[locale]/(DashboardLayout)/layout/sidebar/MenuItems.ts

import { uniqueId } from "lodash";

import {
  IconListDetails,
  IconReceipt2,
  IconLogin,
  IconNotes,
  IconActivity,
  IconAlertCircle,
  IconAppWindow,
  IconApps,
  IconBasket,
  IconBoxAlignBottom,
  IconBoxAlignLeft,
  IconBuildingCommunity,
  IconBuildingEstate,
  IconCalendar,
  IconChartArea,
  IconChartArcs,
  IconChartArcs3,
  IconChartCandle,
  IconChartDonut3,
  IconChartDots,
  IconChartHistogram,
  IconChartLine,
  IconChartPie2,
  IconChartPpf,
  IconChartRadar,
  IconChartScatter,
  IconClipboardList,
  IconCoin,
  IconCurrencyDollar,
  IconEdit,
  IconFileCheck,
  IconFileDescription,
  IconFileDots,
  IconFiles,
  IconGitMerge,
  IconHelp,
  IconHome,
  IconLayout,
  IconLayoutGrid,
  IconLockAccess,
  IconMail,
  IconMapPin,
  IconMessage2,
  IconMoodSmile,
  IconNotebook,
  IconPackage,
  IconPageBreak,
  IconPoint,
  IconRotate,
  IconSettings,
  IconShieldCheck,
  IconShoppingCart,
  IconSpeakerphone,
  IconStar,
  IconTicket,
  IconTool,
  IconUserCircle,
  IconUserPlus,
  IconUsers,
  IconZoomCode,
  IconChecklist,
  IconPlus,
} from "@tabler/icons-react";

import { NavGroup } from "@/app/[locale]/(DashboardLayout)/types/layout/sidebar";

const Menuitems: NavGroup[] = [
  // 🛡 Authorization
  {
    navlabel: true,
    subheader: "sidebar:group.authorization",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.authorization.roles.root",
    icon: IconShieldCheck,
    href: "/superadmin/roles",
    children: [
      {
        id: uniqueId(),
        title: "sidebar:menu.authorization.roles.list",
        icon: IconUsers,
        href: "/superadmin/roles",
      },
    ],
  },

  // 🌐 Localization Manager
  {
    id: uniqueId(),
    title: "sidebar:menu.manager.localization.root",
    icon: IconGitMerge,
    href: "/superadmin/localization",
    children: [
      {
        id: uniqueId(),
        title: "sidebar:menu.manager.localization.translations",
        icon: IconPoint,
        href: "/superadmin/localization",
      },
      {
        id: uniqueId(),
        title: "sidebar:menu.manager.localization.keys",
        icon: IconPoint,
        href: "/superadmin/localization/keys",
      },
      {
        id: uniqueId(),
        title: "sidebar:menu.manager.localization.namespaces",
        icon: IconPoint,
        href: "/superadmin/localization/namespaces",
      },
    ],
  },

  // 🏠 Gayrimenkul - Master Data
  {
    navlabel: true,
    subheader: "sidebar:group.realEstate",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.realEstate.mySpaces",
    icon: IconLayoutGrid,
    href: "/my-spaces",
  },
  {
    id: "pending-actions",
    title: "Onay Bekleyen İşlemler",
    icon: IconChecklist,
    href: "/pending-actions",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.realEstate.properties",
    icon: IconBuildingEstate,
    href: "/property-management/properties",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.realEstate.units",
    icon: IconHome,
    href: "/property-management/units",
  },
  {
    id: uniqueId(),
    title: "Daire / Dükkan Tanımla",
    icon: IconPlus,
    href: "/property-management/1/units/create",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.realEstate.addresses",
    icon: IconMapPin,
    href: "/property-management/addresses",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.realEstate.createProperty",
    icon: IconBuildingEstate,
    href: "/property-management/properties/create",
  },

  // ⚙️ Operasyonlar
  {
    navlabel: true,
    subheader: "sidebar:group.operations",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.operations.propertyOperations",
    icon: IconBuildingCommunity,
    href: "/operation-management/properties",
  },


  {
    id: "muhasebe",
    title: "Muhasebe",
    icon: IconCoin,
    children: [
      {
        id: "muhasebe-dashboard",
        title: "Dashboard",
        href: "/muhasebe",
      },
      {
        id: "muhasebe-setup",
        title: "Tanımlamalar",
        href: "/muhasebe/setup",
      },
      {
        id: "muhasebe-expenses",
        title: "Giderler",
        href: "/muhasebe/expenses",
        icon: IconReceipt2,
      },

      {
  id: uniqueId(),
  title: "Expense Categories",
  icon: IconListDetails,
  href: "/muhasebe/expense-categories",
}
    ],
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.operations.unitRelations",
    icon: IconUsers,
    href: "/superadmin/operations/units",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.operations.maintenance",
    icon: IconTool,
    href: "/superadmin/operations/maintenance",
  },

  // 📢 İlan Yönetimi
  {
    navlabel: true,
    subheader: "sidebar:group.listingManagement",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.listings.create",
    icon: IconSpeakerphone,
    href: "/listings-management/create/select-property",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.listings.myListings",
    icon: IconClipboardList,
    href: "/listings-management/my-listings",
  },

  // 🧾 Yönetim Başvuruları
  {
    navlabel: true,
    subheader: "sidebar:group.managementApplications",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.managementApplications.create",
    icon: IconFileDescription,
    href: "/management-applications/create",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.managementApplications.my",
    icon: IconChecklist,
    href: "/management-applications/my",
  },

  // 🛡️ Admin Alanı
  {
    navlabel: true,
    subheader: "sidebar:group.admin",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.managementApplications.review",
    icon: IconShieldCheck,
    href: "/management-applications/review",
  },

  // 🧭 Monitoring
  {
    id: uniqueId(),
    title: "sidebar:menu.monitoring.root",
    icon: IconActivity,
    href: "/superadmin/monitoring",
    children: [
      {
        id: uniqueId(),
        title: "sidebar:menu.monitoring.dashboard",
        icon: IconPoint,
        href: "/superadmin/monitoring",
      },
      {
        id: uniqueId(),
        title: "sidebar:menu.monitoring.securityTimeline",
        icon: IconPoint,
        href: "/superadmin/monitoring/security-timeline",
      },
      {
        id: uniqueId(),
        title: "sidebar:menu.monitoring.lockoutCenter",
        icon: IconPoint,
        href: "/superadmin/monitoring/lockouts",
      },
      {
        id: uniqueId(),
        title: "sidebar:menu.monitoring.auditTimeline",
        icon: IconPoint,
        href: "/superadmin/monitoring/audit-timeline",
      },
    ],
  },

  // 📄 Pages
  {
    navlabel: true,
    subheader: "sidebar:group.pages",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.pages.roleBasedAccess",
    icon: IconLockAccess,
    href: "/theme-pages/casl",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.pages.pricing",
    icon: IconCurrencyDollar,
    href: "/theme-pages/pricing",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.pages.accountSettings",
    icon: IconUserCircle,
    href: "/apps/account-setting",
  },

  // 👥 Kullanıcılar
  {
    id: uniqueId(),
    title: "sidebar:menu.apps.users.root",
    icon: IconUserCircle,
    href: "/apps/profile",
    children: [
      {
        id: uniqueId(),
        title: "sidebar:menu.admin.users.root",
        icon: IconUsers,
        href: "/superadmin/users",
      },
      {
        id: uniqueId(),
        title: "sidebar:menu.apps.users.profile",
        icon: IconPoint,
        href: "/apps/profile",
      },
      {
        id: uniqueId(),
        title: "sidebar:menu.apps.users.followers",
        icon: IconPoint,
        href: "/apps/user-profile/followers",
      },
      {
        id: uniqueId(),
        title: "sidebar:menu.apps.users.friends",
        icon: IconPoint,
        href: "/apps/user-profile/friends",
      },
      {
        id: uniqueId(),
        title: "sidebar:menu.apps.users.gallery",
        icon: IconPoint,
        href: "/apps/user-profile/gallery",
      },
    ],
  },

  {
    id: uniqueId(),
    title: "sidebar:menu.pages.faq",
    icon: IconHelp,
    href: "/theme-pages/faq",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.pages.tablerIcon",
    icon: IconMoodSmile,
    href: "/icons",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.pages.samplePage",
    icon: IconPageBreak,
    href: "/sample-page",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.pages.landingPage",
    icon: IconAppWindow,
    href: "/landingpage",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.pages.widgets.root",
    icon: IconLayout,
    href: "/widgets/cards",
    children: [
      {
        id: uniqueId(),
        title: "sidebar:menu.pages.widgets.cards",
        icon: IconPoint,
        href: "/widgets/cards",
      },
      {
        id: uniqueId(),
        title: "sidebar:menu.pages.widgets.banners",
        icon: IconPoint,
        href: "/widgets/banners",
      },
      {
        id: uniqueId(),
        title: "sidebar:menu.pages.widgets.charts",
        icon: IconPoint,
        href: "/widgets/charts",
      },
    ],
  },

  // 💰 Dashboard
  {
    id: uniqueId(),
    title: "sidebar:menu.home.ecommerce",
    icon: IconShoppingCart,
    href: "/dashboards/ecommerce",
  },

  // 📦 Contacts
  {
    id: uniqueId(),
    title: "sidebar:menu.apps.contacts",
    icon: IconPackage,
    chip: "2",
    chipColor: "secondary",
    href: "/apps/contacts",
  },

  // 📦 Apps
  {
    navlabel: true,
    subheader: "sidebar:group.apps",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.apps.blog.root",
    icon: IconChartDonut3,
    href: "/apps/blog/",
    children: [
      {
        id: uniqueId(),
        title: "sidebar:menu.apps.blog.posts",
        icon: IconPoint,
        href: "/apps/blog/post",
      },
      {
        id: uniqueId(),
        title: "sidebar:menu.apps.blog.detail",
        icon: IconPoint,
        href: "/apps/blog/detail/streaming-video-way-before-it-was-cool-go-dark-tomorrow",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.apps.ecommerce.root",
    icon: IconBasket,
    href: "/apps/ecommerce/",
    children: [
      {
        id: uniqueId(),
        title: "sidebar:menu.apps.ecommerce.shop",
        icon: IconPoint,
        href: "/apps/ecommerce/shop",
      },
      {
        id: uniqueId(),
        title: "sidebar:menu.apps.ecommerce.detail",
        icon: IconPoint,
        href: "/apps/ecommerce/detail/1",
      },
      {
        id: uniqueId(),
        title: "sidebar:menu.apps.ecommerce.list",
        icon: IconPoint,
        href: "/apps/ecommerce/list",
      },
      {
        id: uniqueId(),
        title: "sidebar:menu.apps.ecommerce.checkout",
        icon: IconPoint,
        href: "/apps/ecommerce/checkout",
      },
      {
        id: uniqueId(),
        title: "sidebar:menu.apps.ecommerce.addProduct",
        icon: IconPoint,
        href: "/apps/ecommerce/add-product",
      },
      {
        id: uniqueId(),
        title: "sidebar:menu.apps.ecommerce.editProduct",
        icon: IconPoint,
        href: "/apps/ecommerce/edit-product",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.apps.chats",
    icon: IconMessage2,
    href: "/apps/chats",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.apps.notes",
    icon: IconNotes,
    href: "/apps/notes",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.apps.calendar",
    icon: IconCalendar,
    href: "/apps/calendar",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.apps.email",
    icon: IconMail,
    href: "/apps/email",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.apps.tickets",
    icon: IconTicket,
    href: "/apps/tickets",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.apps.kanban",
    icon: IconNotebook,
    href: "/apps/kanban",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.apps.invoice.root",
    icon: IconFileCheck,
    href: "/apps/invoice/list",
    children: [
      {
        id: uniqueId(),
        title: "sidebar:menu.apps.invoice.list",
        icon: IconPoint,
        href: "/apps/invoice/list",
      },
      {
        id: uniqueId(),
        title: "sidebar:menu.apps.invoice.details",
        icon: IconPoint,
        href: "/apps/invoice/detail/PineappleInc",
      },
      {
        id: uniqueId(),
        title: "sidebar:menu.apps.invoice.create",
        icon: IconPoint,
        href: "/apps/invoice/create",
      },
      {
        id: uniqueId(),
        title: "sidebar:menu.apps.invoice.edit",
        icon: IconPoint,
        href: "/apps/invoice/edit/PineappleInc",
      },
    ],
  },

  // 📝 Forms
  {
    navlabel: true,
    subheader: "sidebar:group.forms",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.forms.elements.root",
    icon: IconApps,
    href: "/forms/form-elements/autocomplete",
    children: [
      {
        id: uniqueId(),
        title: "sidebar:menu.forms.elements.autocomplete",
        icon: IconPoint,
        href: "/forms/form-elements/autocomplete",
      },
      {
        id: uniqueId(),
        title: "sidebar:menu.forms.elements.button",
        icon: IconPoint,
        href: "/forms/form-elements/button",
      },
      {
        id: uniqueId(),
        title: "sidebar:menu.forms.elements.checkbox",
        icon: IconPoint,
        href: "/forms/form-elements/checkbox",
      },
      {
        id: uniqueId(),
        title: "sidebar:menu.forms.elements.radio",
        icon: IconPoint,
        href: "/forms/form-elements/radio",
      },
      {
        id: uniqueId(),
        title: "sidebar:menu.forms.elements.dateTime",
        icon: IconPoint,
        href: "/forms/form-elements/date-time",
      },
      {
        id: uniqueId(),
        title: "sidebar:menu.forms.elements.slider",
        icon: IconPoint,
        href: "/forms/form-elements/slider",
      },
      {
        id: uniqueId(),
        title: "sidebar:menu.forms.elements.switch",
        icon: IconPoint,
        href: "/forms/form-elements/switch",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.forms.layout",
    icon: IconFileDescription,
    href: "/forms/form-layout",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.forms.horizontal",
    icon: IconBoxAlignBottom,
    href: "/forms/form-horizontal",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.forms.vertical",
    icon: IconBoxAlignLeft,
    href: "/forms/form-vertical",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.forms.custom",
    icon: IconFileDots,
    href: "/forms/form-custom",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.forms.wizard",
    icon: IconFiles,
    href: "/forms/form-wizard",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.forms.validation",
    icon: IconFiles,
    href: "/forms/form-validation",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.forms.tiptapEditor",
    icon: IconEdit,
    href: "/forms/form-tiptap",
  },

  // 📈 Charts
  {
    navlabel: true,
    subheader: "sidebar:group.charts",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.charts.line",
    icon: IconChartLine,
    href: "/charts/line",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.charts.gradient",
    icon: IconChartArcs,
    href: "/charts/gradient",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.charts.area",
    icon: IconChartArea,
    href: "/charts/area",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.charts.candlestick",
    icon: IconChartCandle,
    href: "/charts/candlestick",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.charts.column",
    icon: IconChartDots,
    href: "/charts/column",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.charts.doughnutPie",
    icon: IconChartDonut3,
    href: "/charts/doughnut",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.charts.radialbarRadar",
    icon: IconChartRadar,
    href: "/charts/radialbar",
  },

  // 📊 MUI Charts
  {
    navlabel: true,
    subheader: "sidebar:group.muiCharts",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.muiCharts.barCharts",
    icon: IconChartHistogram,
    href: "/muicharts/barcharts",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.muiCharts.lineCharts.root",
    icon: IconChartLine,
    href: "/muicharts/linecharts/line",
    children: [
      {
        id: uniqueId(),
        title: "sidebar:menu.muiCharts.lineCharts.lines",
        icon: IconPoint,
        href: "/muicharts/linecharts/line",
      },
      {
        id: uniqueId(),
        title: "sidebar:menu.muiCharts.lineCharts.area",
        icon: IconPoint,
        href: "/muicharts/linecharts/area",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.muiCharts.pieCharts",
    icon: IconChartPie2,
    href: "/muicharts/piecharts",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.muiCharts.scatterCharts",
    icon: IconChartScatter,
    href: "/muicharts/scattercharts",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.muiCharts.sparklineCharts",
    icon: IconChartPpf,
    href: "/muicharts/sparklinecharts",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.muiCharts.gaugeCharts",
    icon: IconChartArcs3,
    href: "/muicharts/gaugecharts",
  },

  // 🔐 Auth
  {
    navlabel: true,
    subheader: "sidebar:group.auth",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.auth.login.root",
    icon: IconLogin,
    href: "/auth/login",
    children: [
      {
        id: uniqueId(),
        title: "sidebar:menu.auth.login.side",
        icon: IconPoint,
        href: "/auth/login",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.auth.register.root",
    icon: IconUserPlus,
    href: "/auth/register",
    children: [
      {
        id: uniqueId(),
        title: "sidebar:menu.auth.register.side",
        icon: IconPoint,
        href: "/auth/register",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.auth.forgotPassword.root",
    icon: IconRotate,
    href: "/auth/forgot-password",
    children: [
      {
        id: uniqueId(),
        title: "sidebar:menu.auth.forgotPassword.side",
        icon: IconPoint,
        href: "/auth/forgot-password",
      },
      {
        id: uniqueId(),
        title: "sidebar:menu.auth.forgotPassword.boxed",
        icon: IconPoint,
        href: "/auth/auth2/forgot-password",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.auth.twoSteps.root",
    icon: IconZoomCode,
    href: "/auth/two-steps",
    children: [
      {
        id: uniqueId(),
        title: "sidebar:menu.auth.twoSteps.side",
        icon: IconPoint,
        href: "/auth/two-steps",
      },
      {
        id: uniqueId(),
        title: "sidebar:menu.auth.twoSteps.boxed",
        icon: IconPoint,
        href: "/auth/auth2/two-steps",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.auth.error",
    icon: IconAlertCircle,
    href: "/auth/error",
  },
  {
    id: uniqueId(),
    title: "sidebar:menu.auth.maintenance",
    icon: IconSettings,
    href: "/auth/maintenance",
  },

  // 🔗 External
  {
    id: uniqueId(),
    title: "sidebar:menu.other.externalLink",
    external: true,
    icon: IconStar,
    href: "https://google.com",
  },
];

export default Menuitems;