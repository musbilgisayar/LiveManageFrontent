// 📂 src/app/[locale]/(DashboardLayout)/layout/sidebar/MenuItems.ts
// 🧭 LiveManage Sidebar Menü Konfigürasyonu
// - Tüm sabit metinler, senin çeviri stratejine göre key formatına çevrildi.
// - Namespace: "sidebar"
// - Örnek key: "sidebar:menu.home.modern", "sidebar:group.apps"
// - Aşağıda her ana bölüm için Türkçe açıklama (yorum satırları) eklendi.

import { uniqueId } from "lodash";

import {
  IconAward,
  IconBoxMultiple,
    IconLayoutGrid,
  IconBuildingEstate,
  IconSpeakerphone,
  IconClipboardList,
  IconPoint,
  IconAlertCircle,
  IconNotes,
  IconCalendar,
  IconMail,
  IconTicket,
  IconEdit,
  IconGitMerge,
  IconCurrencyDollar,
  IconApps,
  IconFileDescription,
  IconFileDots,
  IconFiles,
  IconBan,
  IconStar,
  IconMoodSmile,
  IconBorderAll,
  IconBorderHorizontal,
  IconBorderInner,
  IconBorderVertical,
  IconBorderTop,
  IconUserCircle,
  IconPackage,
  IconMessage2,
  IconBasket,
  IconChartLine,
  IconChartArcs,
  IconChartCandle,
  IconChartArea,
  IconChartDots,
  IconChartDonut3,
  IconChartRadar,
  IconLogin,
  IconUserPlus,
  IconRotate,
  IconBox,
  IconShoppingCart,
  IconAperture,
  IconLayout,
  IconSettings,
  IconHelp,
  IconZoomCode,
  IconBoxAlignBottom,
  IconBoxAlignLeft,
  IconBorderStyle2,
  IconLockAccess,
  IconAppWindow,
  IconNotebook,
  IconFileCheck,
  IconChartHistogram,
  IconListTree,
  IconChartArcs3,
  IconChartPpf,
  IconChartScatter,
  IconChartPie2,
  IconPageBreak,
  IconShieldCheck,
  IconUsers,
  IconToggleLeft,
  IconSettings2,
  IconTrash,
  IconActivity
} from "@tabler/icons-react";
import { IconBuildingCommunity } from "@tabler/icons-react";
import { ElementType } from "react-spring";
import { NavGroup } from "@/app/[locale]/(DashboardLayout)/types/layout/sidebar";

const Menuitems: NavGroup[] = [
  
 
    // 🛡 Authorization grubu: Rol & Yetki Yönetimi (Senin eklediğin alan)
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

// 🌐 Localization Manager (Çeviri Yönetimi)
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

{
  navlabel: true,
  subheader: "Gayrimenkul",
},
{
  id: uniqueId(),
  title: "Alanlarım",
  icon: IconLayoutGrid,
  href: "/my-spaces",
},
{
  id: uniqueId(),
  title: "Yeni Gayrimenkul Tanımla",
  icon: IconBuildingEstate,
  href: "/property-management/properties/create",
},
{
  navlabel: true,
  subheader: "İlan Yönetimi",
},
{
  id: uniqueId(),
  title: "İlan Ver",
  icon: IconSpeakerphone,
  href: "/listings-management/create/select-property",
},
{
  id: uniqueId(),
  title: "İlanlarım",
  icon: IconClipboardList,
  href: "/listings-management/my-listings",
},

// audit log izleme monitring dashboard
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


  // 📄 Pages grubu: Temaya ait hazır sayfalar (account, pricing, faq, sample page...)
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
    
     href: "/apps/account-setting", // ✅ Doğru yol
  },

   // Kullanıcı 
  {
    id: uniqueId(),
    title: "sidebar:menu.apps.users.root",
    icon: IconUserCircle,
    href: "/apps/profile",
    children: [

      {
  navlabel: true,
  subheader: "sidebar:group.admin",
},

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



  // 💰 eCommerce dashboard
  {
    id: uniqueId(),
    title: "sidebar:menu.home.ecommerce",
    icon: IconShoppingCart,
    href: "/dashboards/ecommerce",
  },


    // 📦   Contacts 
 {
    id: uniqueId(),
    title: "sidebar:menu.apps.contacts",
    icon: IconPackage,
    chip: "2",
    chipColor: "secondary",
    href: "/apps/contacts",
  },

  // 📦 Apps grubu: Uygulama modülleri (Contacts, Blog, E-Ticaret, Chat vb.)
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
        href:
          "/apps/blog/detail/streaming-video-way-before-it-was-cool-go-dark-tomorrow",
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


  // 📝 Forms grubu: Form elemanları, layout ve wizard örnekleri
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


  // 📈 Charts grubu: ApexCharts tabanlı grafikler
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

  // 📊 Mui Charts grubu: MUI tabanlı grafik örnekleri
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

  // 🌲 Mui Trees grubu: TreeView örnekleri
 

  // 🔐 Auth grubu: Login / Register / Two Steps / Error / Maintenance
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
      }
       
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

  // 🧩 Other grubu: Demo amaçlı çeşitli menü örnekleri
 
 
  {
    id: uniqueId(),
    title: "sidebar:menu.other.externalLink",
    external: true,
    icon: IconStar,
    href: "https://google.com",
  },


];

export default Menuitems;
