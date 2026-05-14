// src/modules/auth/views/AuthView.tsx

"use client";

import React, { useMemo, useState } from "react";
import { Box, Paper, Tab, Tabs } from "@mui/material";

import { useI18nNs } from "@/app/context/i18nContext";

import AuthLoginForm from "../components/AuthLoginForm";
import AuthRegisterForm from "../components/AuthRegisterForm";
import AuthForgotForm from "../components/AuthForgotForm";
import AuthTwoStepsForm from "../components/AuthTwoStepsForm";

export type AuthViewTab = "login" | "register" | "forgot" | "twoSteps";

type AuthViewProps = {
  initialTab?: string;
};

function normalizeAuthTab(value?: string): AuthViewTab {
  if (
    value === "login" ||
    value === "register" ||
    value === "forgot" ||
    value === "twoSteps"
  ) {
    return value;
  }

  return "login";
}

export default function AuthView({ initialTab = "login" }: AuthViewProps) {
  const { t } = useI18nNs(["auth"]);
  const [tab, setTab] = useState<AuthViewTab>(() =>
    normalizeAuthTab(initialTab)
  );

  const visibleTabs = useMemo(
    () => [
      {
        value: "login" as const,
        label: t("auth:tabs.login"),
      },
      {
        value: "register" as const,
        label: t("auth:tabs.register"),
      },
      {
        value: "forgot" as const,
        label: t("auth:tabs.forgot"),
      },
    ],
    [t]
  );

  const handleChange = (_event: React.SyntheticEvent, nextTab: AuthViewTab) => {
    setTab(nextTab);
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 520,
        mx: "auto",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2.5, sm: 3 },
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
          {visibleTabs.map((item) => (
            <Tab key={item.value} value={item.value} label={item.label} />
          ))}
        </Tabs>

        {tab === "login" && <AuthLoginForm />}
        {tab === "register" && <AuthRegisterForm />}
        {tab === "forgot" && <AuthForgotForm />}
        {tab === "twoSteps" && (
          <AuthTwoStepsForm onChangeView={(nextView) => setTab(nextView)} />
        )}
      </Paper>
    </Box>
  );
}