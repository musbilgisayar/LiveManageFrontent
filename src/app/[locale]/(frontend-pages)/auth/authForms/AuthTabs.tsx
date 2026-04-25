//src\app\[locale]\(frontend-pages)\auth\authForms\AuthTabs.tsx
"use client";
import React, { useState } from "react";
import { Tabs, Tab, Paper } from "@mui/material";
import AuthLogin from "./AuthLogin";
import AuthRegister from "./AuthRegister";
import AuthForgot from "./AuthForgot";
import { useI18nNs } from "@/app/context/i18nContext";

type Props = {
  initialTab?: string;
};

export default function AuthTabs({ initialTab = "login" }: Props) {
  const [tab, setTab] = useState(initialTab);
  const { t } = useI18nNs(["auth"]);

  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    setTab(newValue);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 3,
        boxShadow: 5,
        backgroundColor: "#fff",
      }}
    >
      <Tabs
        value={tab}
        onChange={handleChange}
        centered
        sx={{
          mb: 3,
          backgroundColor: "#a7c8fbff",
          borderRadius: "12px 12px 0 0",
          minHeight: 44,
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: 600,
            flex: 1,
            minHeight: 44,
            borderRadius: "12px 12px 0 0",
            color: "rgba(0,0,0,0.6)",
          },
          "& .Mui-selected": {
            backgroundColor: "primary.main",
            color: "white !important",
          },
          "& .MuiTabs-indicator": {
            display: "none",
          },
        }}
      >
        <Tab value="login" label={t("auth:tabs.login")} />
        <Tab value="register" label={t("auth:tabs.register")} />
        <Tab value="forgot" label={t("auth:tabs.forgot")} />
      </Tabs>

      {tab === "login" && <AuthLogin />}
      {tab === "register" && <AuthRegister />}
      {tab === "forgot" && <AuthForgot />}
    </Paper>
  );
}
