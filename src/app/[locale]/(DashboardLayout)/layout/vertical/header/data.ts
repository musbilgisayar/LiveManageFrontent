interface NotificationType {
  avatar: string;
  titleKey: string;
  subtitleKey: string;
}

const notifications: NotificationType[] = [
  {
    avatar: "/images/profile/user-2.jpg",
    titleKey: "header:notifications.romanJoined",
    subtitleKey: "header:notifications.congratulate",
  },
  {
    avatar: "/images/profile/user-3.jpg",
    titleKey: "header:notifications.newMessage",
    subtitleKey: "header:notifications.salmaMessage",
  },
  {
    avatar: "/images/profile/user-4.jpg",
    titleKey: "header:notifications.newPayment",
    subtitleKey: "header:notifications.checkEarnings",
  },
  {
    avatar: "/images/profile/user-5.jpg",
    titleKey: "header:notifications.taskCompleted",
    subtitleKey: "header:notifications.assignTasks",
  },
  {
    avatar: "/images/profile/user-6.jpg",
    titleKey: "header:notifications.romanJoined",
    subtitleKey: "header:notifications.congratulate",
  },
  {
    avatar: "/images/profile/user-7.jpg",
    titleKey: "header:notifications.newMessage",
    subtitleKey: "header:notifications.salmaMessage",
  },
  {
    avatar: "/images/profile/user-8.jpg",
    titleKey: "header:notifications.newPayment",
    subtitleKey: "header:notifications.checkEarnings",
  },
  {
    avatar: "/images/profile/user-9.jpg",
    titleKey: "header:notifications.taskCompleted",
    subtitleKey: "header:notifications.assignTasks",
  },
];

interface ProfileType {
  href: string;
  titleKey: string;
  subtitleKey: string;
  icon: string;
}

const profile: ProfileType[] = [
  {
    href: "/apps/user-profile/profile",
    titleKey: "header:profile.myProfile",
    subtitleKey: "header:profile.accountSettings",
    icon: "/images/svgs/icon-account.svg",
  },
  {
    href: "/apps/email",
    titleKey: "header:profile.myInbox",
    subtitleKey: "header:profile.messagesEmails",
    icon: "/images/svgs/icon-inbox.svg",
  },
  {
    href: "/apps/kanban",
    titleKey: "header:profile.myTasks",
    subtitleKey: "header:profile.todoDailyTasks",
    icon: "/images/svgs/icon-tasks.svg",
  },
];

interface AppsLinkType {
  href: string;
  titleKey: string;
  subtextKey: string;
  avatar: string;
}

const appsLink: AppsLinkType[] = [
  {
    href: "/apps/chats",
    titleKey: "header:apps.chat",
    subtextKey: "header:apps.newMessages",
    avatar: "/images/svgs/icon-dd-chat.svg",
  },
  {
    href: "/apps/ecommerce/shop",
    titleKey: "header:apps.ecommerce",
    subtextKey: "header:apps.newStock",
    avatar: "/images/svgs/icon-dd-cart.svg",
  },
  {
    href: "/apps/notes",
    titleKey: "header:apps.notes",
    subtextKey: "header:apps.todoTasks",
    avatar: "/images/svgs/icon-dd-invoice.svg",
  },
  {
    href: "/apps/calendar",
    titleKey: "header:apps.calendar",
    subtextKey: "header:apps.dates",
    avatar: "/images/svgs/icon-dd-date.svg",
  },
  {
    href: "/apps/contacts",
    titleKey: "header:apps.contacts",
    subtextKey: "header:apps.unsavedContacts",
    avatar: "/images/svgs/icon-dd-mobile.svg",
  },
  {
    href: "/apps/tickets",
    titleKey: "header:apps.tickets",
    subtextKey: "header:apps.submitTickets",
    avatar: "/images/svgs/icon-dd-lifebuoy.svg",
  },
  {
    href: "/apps/email",
    titleKey: "header:apps.email",
    subtextKey: "header:apps.newEmails",
    avatar: "/images/svgs/icon-dd-message-box.svg",
  },
  {
    href: "/apps/blog/post",
    titleKey: "header:apps.blog",
    subtextKey: "header:apps.newBlog",
    avatar: "/images/svgs/icon-dd-application.svg",
  },
];

interface LinkType {
  href: string;
  titleKey: string;
}

const pageLinks: LinkType[] = [
  {
    href: "/theme-pages/pricing",
    titleKey: "header:pages.pricing",
  },
  {
    href: "/auth/login",
    titleKey: "header:pages.authentication",
  },
  {
    href: "/auth/auth1/register",
    titleKey: "header:pages.register",
  },
  {
    href: "/404",
    titleKey: "header:pages.error404",
  },
  {
    href: "/apps/note",
    titleKey: "header:pages.notes",
  },
  {
    href: "/apps/user-profile/profile",
    titleKey: "header:pages.userApp",
  },
  {
    href: "/apps/blog/post",
    titleKey: "header:pages.blog",
  },
  {
    href: "/apps/ecommerce/checkout",
    titleKey: "header:pages.shoppingCart",
  },
];

export { notifications, profile, pageLinks, appsLink };