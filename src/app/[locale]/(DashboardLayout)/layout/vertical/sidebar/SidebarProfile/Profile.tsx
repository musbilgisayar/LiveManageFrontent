"use client";

import { Box, Avatar, Typography, IconButton, Tooltip, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { IconPower } from "@tabler/icons-react";
import { CustomizerContext } from "@/app/context/customizerContext";
import Link from "next/link";
import { useContext } from "react";

export const Profile = () => {
  const theme = useTheme();
  const lgUp = useMediaQuery(theme.breakpoints.up("lg"));

  // 🔹 Context null olasılığına karşı güvenli erişim
  const customizer = useContext(CustomizerContext);
  const isSidebarHover = customizer?.isSidebarHover ?? false;
  const isCollapse = customizer?.isCollapse ?? "full";

  // 🔹 Menü gizleme mantığı
  const hideMenu = lgUp ? isCollapse === "mini-sidebar" && !isSidebarHover : false;

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={2}
      sx={{
        m: 3,
        p: 2,
        bgcolor: "secondary.light",
        borderRadius: 2,
      }}
    >
      {!hideMenu && (
        <>
          {/* Kullanıcı avatarı */}
          <Avatar
            alt="User"
            src="/images/profile/user-1.jpg"
            sx={{ height: 40, width: 40 }}
          />

          {/* Kullanıcı bilgileri */}
          <Box>
            <Typography variant="h6">Mathew</Typography>
            <Typography variant="caption" color="textSecondary">
              Designer
            </Typography>
          </Box>

          {/* Çıkış butonu */}
          <Box sx={{ ml: "auto" }}>
            <Tooltip title="Logout" placement="top">
              <IconButton
                color="primary"
                component={Link}
                href="/auth/login"
                aria-label="logout"
                size="small"
              >
                <IconPower size={20} />
              </IconButton>
            </Tooltip>
          </Box>
        </>
      )}
    </Box>
  );
};
