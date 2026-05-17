"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Box,
  Menu,
  Avatar,
  Typography,
  Divider,
  Button,
  ButtonBase,
  Chip,
} from "@mui/material";
import * as dropdownData from "./data";
import {
  IconBuildingCommunity,
  IconMail,
  IconShieldCheck,
} from "@tabler/icons-react";
import { Stack } from "@mui/system";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useI18nNs } from "@/app/context/i18nContext";
import { useAuth } from "@/app/context/AuthContext";
import { postWebFetcher } from "@/utils/fetchers.web.client";
import { clearTenantKey, getTenantKey } from "@/utils/tenant.client";

function joinName(firstName?: string, lastName?: string) {
  return [firstName, lastName].filter(Boolean).join(" ").trim();
}

function formatRole(role?: string) {
  if (!role) return "";

  return role
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}

const Profile = () => {
  const { t } = useI18nNs(["header"]);
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams() as { locale?: string };

  const activeLocale = params?.locale || "tr";

  const [anchorEl2, setAnchorEl2] = useState<HTMLElement | null>(null);

  const tr = (key: string, fallback: string) => {
    const value = t(key);
    return value === `[${key}]` ? fallback : value;
  };

  const profileIdentity = useMemo(() => {
    const extendedUser = user as
      | (NonNullable<typeof user> & {
          role?: string;
          primaryRole?: string;
          tenantId?: string;
          tenantName?: string;
        })
      | null;

    const displayName =
      user?.fullName ||
      user?.user?.fullName ||
      joinName(user?.firstName, user?.lastName) ||
      joinName(user?.user?.firstName, user?.user?.lastName) ||
      user?.userName ||
      user?.user?.userName ||
      user?.email ||
      user?.user?.email ||
      tr("header:profile.unknownUser", "Kullanici");

    const role =
      extendedUser?.primaryRole ||
      extendedUser?.role ||
      user?.roles?.[0] ||
      tr("header:profile.roleFallback", "Yetki profili atanmadi");

    const email =
      user?.email ||
      user?.user?.email ||
      tr("header:profile.emailFallback", "E-posta bulunamadi");

    const tenant =
      extendedUser?.tenantName ||
      user?.tenant ||
      extendedUser?.tenantId ||
      user?.user?.tenantId ||
      getTenantKey() ||
      tr("header:profile.tenantFallback", "Tenant secilmedi");

    return {
      displayName,
      role: formatRole(role),
      email,
      tenant,
    };
  }, [t, user]);

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
      <ButtonBase
        aria-label="show profile menu"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        sx={{
          borderRadius: 2,
          px: { xs: 0.5, md: 1 },
          py: 0.5,
          gap: 1,
          color: "text.secondary",
          textAlign: "left",
          "&:hover": {
            bgcolor: "action.hover",
          },
          ...(typeof anchorEl2 === "object" && {
            color: "primary.main",
            bgcolor: "primary.light",
          }),
        }}
        onClick={handleClick2}
      >
        <Avatar
          src="/images/profile/user-1.jpg"
          alt="ProfileImg"
          sx={{ width: 35, height: 35 }}
        />
        <Box
          sx={{
            display: { xs: "none", md: "block" },
            minWidth: 0,
            maxWidth: { md: 220, xl: 280 },
          }}
        >
          <Typography
            variant="subtitle2"
            color="textPrimary"
            fontWeight={600}
            noWrap
          >
            {profileIdentity.displayName}
          </Typography>
          <Stack direction="row" spacing={0.75} alignItems="center" minWidth={0}>
            <Typography
              variant="caption"
              color="textSecondary"
              display="flex"
              alignItems="center"
              gap={0.5}
              noWrap
              sx={{ minWidth: 0, maxWidth: 145 }}
              title={profileIdentity.email}
            >
              <IconMail width={13} height={13} />
              {profileIdentity.email}
            </Typography>
            <Typography
              variant="caption"
              color="textSecondary"
              display="flex"
              alignItems="center"
              gap={0.5}
              noWrap
              sx={{ minWidth: 0, maxWidth: 105 }}
              title={profileIdentity.tenant}
            >
              <IconBuildingCommunity width={13} height={13} />
              {profileIdentity.tenant}
            </Typography>
          </Stack>
        </Box>
      </ButtonBase>

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
          <Box minWidth={0}>
            <Typography variant="subtitle2" color="textPrimary" fontWeight={600}>
              {profileIdentity.displayName}
            </Typography>
            <Stack direction="row" spacing={1} mt={0.75} flexWrap="wrap" useFlexGap>
              <Chip
                size="small"
                icon={<IconShieldCheck width={15} height={15} />}
                label={profileIdentity.role}
                sx={{
                  maxWidth: 190,
                  bgcolor: "primary.light",
                  color: "primary.main",
                  fontWeight: 600,
                  "& .MuiChip-label": {
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                }}
              />
              <Chip
                size="small"
                icon={<IconBuildingCommunity width={15} height={15} />}
                label={profileIdentity.tenant}
                sx={{
                  maxWidth: 190,
                  bgcolor: "secondary.light",
                  color: "secondary.main",
                  fontWeight: 600,
                  "& .MuiChip-label": {
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                }}
              />
            </Stack>
            <Typography
              variant="subtitle2"
              color="textSecondary"
              display="flex"
              alignItems="center"
              gap={1}
              mt={1}
              sx={{
                maxWidth: 210,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={profileIdentity.email}
            >
              <IconMail width={15} height={15} />
              {profileIdentity.email}
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
