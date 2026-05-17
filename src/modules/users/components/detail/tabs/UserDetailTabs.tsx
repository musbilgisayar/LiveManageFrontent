"use client";

import * as React from "react";
import { Box, Tab, Tabs } from "@mui/material";

// 🔥 Artık type'lar tek kaynaktan geliyor

import type {
  UserDetailTabDefinition,
  UserDetailTabKey,
} from "@/modules/users/types/UserDetail.types";

type Props = {
  tabs: UserDetailTabDefinition[];
  activeTab: UserDetailTabKey;
  onChange: (value: UserDetailTabKey) => void;
  t: (key: string) => string;
};

export default function UserDetailTabs({
  tabs,
  activeTab,
  onChange,
  t,
}: Props) {
  return (
    <Box
      sx={{
        p: 1,
        borderRadius: 4,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)",
        overflow: "hidden",
      }}
    >
      <Tabs
        value={activeTab}
        onChange={(_, value) => onChange(value)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        TabIndicatorProps={{ style: { display: "none" } }}
        sx={{
          minHeight: 56,
          "& .MuiTabs-flexContainer": {
            gap: 1,
            flexWrap: "nowrap",
          },
          "& .MuiTabs-scrollButtons": {
            borderRadius: 999,
          },
        }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.key}
            value={tab.key}
            disableRipple
            label={t(tab.labelKey)}
            sx={{
              minHeight: 44,
              px: 2,
              py: 1.25,
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
              color: "text.secondary",
              transition: "all 0.2s ease",
              border: "1px solid transparent",

              "&:hover": {
                bgcolor: "action.hover",
                color: "text.primary",
              },

              "&.Mui-selected": {
                color: "primary.main",
                bgcolor: "rgba(93, 134, 243, 0.10)",
                borderColor: "rgba(93, 134, 243, 0.28)",
              },
            }}
          />
        ))}
      </Tabs>
    </Box>
  );
}