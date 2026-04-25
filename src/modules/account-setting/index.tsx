"use client";

import * as React from "react";
import PageContainer from "@/app/components/container/PageContainer";
import Breadcrumb from "@/app/[locale]/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb";
import { Tabs, Tab, Box, CardContent, Divider } from "@mui/material";
import Grid from "@mui/material/Grid";
import BlankCard from "@/app/components/shared/BlankCard";
import { IconArticle, IconBell, IconLock, IconUserCircle } from "@tabler/icons-react";

import CredentialsTab from "./components/CredentialsTab";
import ProfilePage from "@/modules/profile";
import NotificationTab from "./components/NotificationTab";
import BillsTab from "./components/BillsTab";
import SecurityTab from "./components/SecurityTab";

import { useI18nNs } from "@/app/context/i18nContext";

export default function AccountSettingPage() {
  const { t } = useI18nNs(["account-settings", "common"]);

  const [tab, setTab] = React.useState(0);
  const handleChange = (_: React.SyntheticEvent, newValue: number) => setTab(newValue);

  const tabs = [
    {
      label: t("account-settings:tabs.account", { defaultValue: "Account" }),
      icon: <IconUserCircle size={20} />,
      component: <ProfilePage />,
    },
    {
      label: t("account-settings:tabs.credentials", { defaultValue: "Credentials" }),
      icon: <IconLock size={20} />,
      component: <CredentialsTab />,
    },
    {
      label: t("account-settings:tabs.notifications", { defaultValue: "Notifications" }),
      icon: <IconBell size={20} />,
      component: <NotificationTab />,
    },
    {
      label: t("account-settings:tabs.bills", { defaultValue: "Bills" }),
      icon: <IconArticle size={20} />,
      component: <BillsTab />,
    },
    {
      label: t("account-settings:tabs.security", { defaultValue: "Security" }),
      icon: <IconLock size={20} />,
      component: <SecurityTab />,
    },
  ];

  return (
    <PageContainer
      title={t("account-settings:page.title", { defaultValue: "Account Settings" })}
      description={t("account-settings:page.description", {
        defaultValue: "Kullanıcı hesap ayarları sayfası",
      })}
    >
      <Breadcrumb
        title={t("account-settings:breadcrumb.title", { defaultValue: "Account Settings" })}
        items={[
          {
            title: t("account-settings:breadcrumb.dashboard", { defaultValue: "Dashboard" }),
            to: "/dashboard",
          },
          { title: t("account-settings:breadcrumb.current", { defaultValue: "Account Settings" }) },
        ]}
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
        
        <BlankCard>
  <Box sx={{ width: "100%" }}>
    <Tabs
      value={tab}
      onChange={handleChange}
      variant="standard"
      aria-label="account-tabs"
    >
      {tabs.map((tt, i) => (
        <Tab
          key={i}
          label={tt.label}
          icon={tt.icon}
          iconPosition="start"
        />
      ))}
    </Tabs>
  </Box>

  <Divider />
  <CardContent>{tabs[tab].component}</CardContent>
</BlankCard>

        </Grid>
      </Grid>
    </PageContainer>
  );
}