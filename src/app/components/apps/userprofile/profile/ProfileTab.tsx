//src/app/components/apps/userprofile/profile/ProfileTab.tsx
'use client';

import React from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { IconHeart, IconPhoto, IconUserCircle } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface ProfileTabProps {
  roles: string[];
}

const ProfileTab: React.FC<ProfileTabProps> = ({ roles }) => {
  const pathname = usePathname();

  // /tr/apps/user-profile/profile -> /apps/user-profile/profile
  const currentPath = React.useMemo(
    () => pathname.replace(/^\/[a-z]{2}(?=\/|$)/i, ""),
    [pathname]
  );

  const profileTabs = [
    {
      label: "Profile",
      icon: <IconUserCircle size="20" />,
      to: "/apps/user-profile/profile",
    },
    {
      label: "Followers",
      icon: <IconHeart size="20" />,
      to: "/apps/user-profile/followers",
    },
    {
      label: "Friends",
      icon: <IconUserCircle size="20" />,
      to: "/apps/user-profile/friends",
    },
    {
      label: "Gallery",
      icon: <IconPhoto size="20" />,
      to: "/apps/user-profile/gallery",
    },
  ];

  const visibleTabs = roles.includes("admin")
    ? profileTabs
    : profileTabs.filter((t) => t.label !== "Gallery");

  React.useEffect(() => {
    console.groupCollapsed("%c[ProfileTab] Mount", "color:#6cf");
  
    console.table(visibleTabs.map((t) => ({ label: t.label, path: t.to })));
    console.groupEnd();
  }, [pathname, currentPath, roles, visibleTabs]);

  // currentPath visible tab'larda yoksa ilk tabı seç
  const safeValue =
    visibleTabs.some((t) => t.to === currentPath)
      ? currentPath
      : visibleTabs[0]?.to ?? false;

  return (
    <Box mt={1} sx={{ backgroundColor: (theme) => theme.palette.grey[100] }}>
      <Box justifyContent="end" display="flex" sx={{ maxWidth: { xs: 320, sm: "100%" } }}>
        <Tabs
          value={safeValue}
          allowScrollButtonsMobile
          aria-label="profile navigation tabs"
        >
          {visibleTabs.map((tab) => (
            <Tab
              key={tab.to}
              iconPosition="start"
              label={tab.label}
              sx={{ minHeight: "50px" }}
              icon={tab.icon}
              component={Link}
              href={tab.to}
              value={tab.to}
            />
          ))}
        </Tabs>
      </Box>
    </Box>
  );
};

export default ProfileTab;