"use client";

import React, { useState } from "react";
import {
  IconButton,
  Box,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Button,
  Chip,
} from "@mui/material";
import * as dropdownData from "./data";
import Scrollbar from "@/app/components/custom-scroll/Scrollbar";
import { IconBellRinging } from "@tabler/icons-react";
import { Stack } from "@mui/system";
import Link from "next/link";

const Notifications = () => {
  const [anchorEl2, setAnchorEl2] = useState<HTMLElement | null>(null);

  const handleClick2 = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl2(event.currentTarget);
  };

  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  return (
    <Box>
      <IconButton
        size="large"
        aria-label="Bildirimleri göster"
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        sx={{
          color: anchorEl2 ? "primary.main" : "text.secondary",
        }}
        onClick={handleClick2}
      >
        <Badge variant="dot" color="primary">
          <IconBellRinging size="21" stroke="1.5" />
        </Badge>
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
          },
        }}
      >
        <Stack
          direction="row"
          py={2}
          px={4}
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6">Bildirimler</Typography>

          <Chip label="5 yeni" color="primary" size="small" />
        </Stack>

        <Scrollbar sx={{ height: "385px" }}>
          {dropdownData.notifications.map((notification, index) => (
            <Box key={notification.avatar + index}>
              <MenuItem sx={{ py: 2, px: 4 }}>
                <Stack direction="row" spacing={2}>
                  <Avatar
                    src={notification.avatar}
                    alt="Bildirim avatarı"
                    sx={{
                      width: 48,
                      height: 48,
                    }}
                  />

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="textPrimary"
                      fontWeight={600}
                      noWrap
                      sx={{
                        width: "240px",
                      }}
                    >
                      Yeni bildirim
                    </Typography>

                    <Typography
                      color="textSecondary"
                      variant="subtitle2"
                      sx={{
                        width: "240px",
                      }}
                      noWrap
                    >
                      Yeni bir işlem gerçekleşti.
                    </Typography>
                  </Box>
                </Stack>
              </MenuItem>
            </Box>
          ))}
        </Scrollbar>

        <Box p={3} pb={1}>
          <Button
            href="/apps/email"
            variant="outlined"
            component={Link}
            color="primary"
            fullWidth
          >
            Tüm bildirimleri gör
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Notifications;
/*"use client";

import React, { useState } from "react";
import {
  IconButton,
  Box,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Button,
  Chip,
} from "@mui/material";
import * as dropdownData from "./data";
import Scrollbar from "@/app/components/custom-scroll/Scrollbar";
import { IconBellRinging } from "@tabler/icons-react";
import { Stack } from "@mui/system";
import Link from "next/link";
import { useI18nNs } from "@/app/context/i18nContext";

const Notifications = () => {
  const { t } = useI18nNs(["header"]);
  const [anchorEl2, setAnchorEl2] = useState<HTMLElement | null>(null);

  const handleClick2 = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl2(event.currentTarget);
  };

  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  return (
    <Box>
      <IconButton
        size="large"
        aria-label={t("header:notifications.ariaShowNotifications", {
          defaultValue: "Bildirimleri göster",
        })}
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        sx={{
          color: anchorEl2 ? "primary.main" : "text.secondary",
        }}
        onClick={handleClick2}
      >
        <Badge variant="dot" color="primary">
          <IconBellRinging size="21" stroke="1.5" />
        </Badge>
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
          },
        }}
      >
        <Stack
          direction="row"
          py={2}
          px={4}
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6">
            {t("header:notifications.title", {
              defaultValue: "Bildirimler",
            })}
          </Typography>

          <Chip
            label={t("header:notifications.newCount", {
              defaultValue: "5 yeni",
            })}
            color="primary"
            size="small"
          />
        </Stack>

        <Scrollbar sx={{ height: "385px" }}>
          {dropdownData.notifications.map((notification) => (
            <Box key={notification.avatar + notification.titleKey}>
              <MenuItem sx={{ py: 2, px: 4 }}>
                <Stack direction="row" spacing={2}>
                  <Avatar
                    src={notification.avatar}
                    alt={notification.avatar}
                    sx={{
                      width: 48,
                      height: 48,
                    }}
                  />

                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="textPrimary"
                      fontWeight={600}
                      noWrap
                      sx={{
                        width: "240px",
                      }}
                    >
                      {t(notification.titleKey)}
                    </Typography>

                    <Typography
                      color="textSecondary"
                      variant="subtitle2"
                      sx={{
                        width: "240px",
                      }}
                      noWrap
                    >
                      {t(notification.subtitleKey)}
                    </Typography>
                  </Box>
                </Stack>
              </MenuItem>
            </Box>
          ))}
        </Scrollbar>

        <Box p={3} pb={1}>
          <Button
            href="/apps/email"
            variant="outlined"
            component={Link}
            color="primary"
            fullWidth
          >
            {t("header:notifications.seeAll", {
              defaultValue: "Tüm bildirimleri gör",
            })}
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Notifications;*/