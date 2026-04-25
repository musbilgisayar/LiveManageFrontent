"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Box,
  Menu,
  Avatar,
  Typography,
  Divider,
  Button,
  IconButton,
} from "@mui/material";
import * as dropdownData from "./data";
import { IconMail } from "@tabler/icons-react";
import { Stack } from "@mui/system";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useI18nNs } from "@/app/context/i18nContext";
import { postWebFetcher } from "@/utils/fetchers.web.client";
import { clearTenantKey } from "@/utils/tenant.client";

const Profile = () => {
  const { t } = useI18nNs(["header"]);
  const router = useRouter();
  const params = useParams() as { locale?: string };

  const activeLocale = params?.locale || "tr";

  const [anchorEl2, setAnchorEl2] = useState<HTMLElement | null>(null);

  const handleClick2 = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl2(event.currentTarget);
  };

  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  const handleLogout = async () => {
    try {
      await postWebFetcher("/api/v1.0/account/logout", {
        logoutAllDevices: false,
      });

      clearTenantKey();

      // Cookie-first mimaride localStorage auth ana kaynak değil.
      // Eski kalıntılar varsa yine de temizleyelim.
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      document.cookie = "accessToken=; Max-Age=0; path=/";
      document.cookie = "refreshToken=; Max-Age=0; path=/";
      document.cookie = "lm.did=; Max-Age=0; path=/";
      document.cookie = "tenantKey=; Max-Age=0; path=/";
      document.cookie = "lm.tenant=; Max-Age=0; path=/";

      router.replace(`/${activeLocale}/auth/login`);
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <Box>
      <IconButton
        aria-label="show profile menu"
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        sx={{
          ...(typeof anchorEl2 === "object" && {
            color: "primary.main",
          }),
        }}
        onClick={handleClick2}
      >
        <Avatar
          src="/images/profile/user-1.jpg"
          alt="ProfileImg"
          sx={{ width: 35, height: 35 }}
        />
      </IconButton>

      <Menu
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        sx={{
          "& .MuiMenu-paper": {
            width: "360px",
            p: 4,
          },
        }}
      >
        <Typography variant="h5">
          {t("header:profile.userProfile")}
        </Typography>

        <Stack direction="row" py={3} spacing={2} alignItems="center">
          <Avatar
            src="/images/profile/user-1.jpg"
            alt="ProfileImg"
            sx={{ width: 95, height: 95 }}
          />
          <Box>
            <Typography variant="subtitle2" color="textPrimary" fontWeight={600}>
              Mathew Anderson
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              Designer
            </Typography>
            <Typography
              variant="subtitle2"
              color="textSecondary"
              display="flex"
              alignItems="center"
              gap={1}
            >
              <IconMail width={15} height={15} />
              info@modernize.com
            </Typography>
          </Box>
        </Stack>

        <Divider />

        {dropdownData.profile.map((profile) => (
          <Box key={profile.href}>
            <Box sx={{ py: 2, px: 0 }} className="hover-text-primary">
              <Link href={profile.href}>
                <Stack direction="row" spacing={2}>
                  <Box
                    width="45px"
                    height="45px"
                    bgcolor="primary.light"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink="0"
                  >
                    <Avatar
                      src={profile.icon}
                      alt={profile.icon}
                      sx={{ width: 24, height: 24, borderRadius: 0 }}
                    />
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      color="textPrimary"
                      className="text-hover"
                      noWrap
                      sx={{ width: "240px" }}
                    >
                      {t(profile.titleKey)}
                    </Typography>

                    <Typography
                      color="textSecondary"
                      variant="subtitle2"
                      sx={{ width: "240px" }}
                      noWrap
                    >
                      {t(profile.subtitleKey)}
                    </Typography>
                  </Box>
                </Stack>
              </Link>
            </Box>
          </Box>
        ))}

        <Box mt={2}>
          <Box bgcolor="primary.light" p={3} mb={3} overflow="hidden" position="relative">
            <Box display="flex" justifyContent="space-between">
              <Box>
                <Typography variant="h5" mb={2}>
                  {t("header:profile.unlimitedAccessLine1")}
                  <br />
                  {t("header:profile.unlimitedAccessLine2")}
                </Typography>

                <Button variant="contained" color="primary">
                  {t("header:profile.upgrade")}
                </Button>
              </Box>

              <Image
                src="/images/backgrounds/unlimited-bg.png"
                width={150}
                height={183}
                style={{ height: "auto", width: "auto" }}
                alt="unlimited"
                className="signup-bg"
              />
            </Box>
          </Box>

          <Button
            variant="outlined"
            color="primary"
            fullWidth
            onClick={handleLogout}
          >
            {t("header:profile.logout")}
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Profile;