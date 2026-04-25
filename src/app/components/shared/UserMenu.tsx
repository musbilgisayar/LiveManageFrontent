"use client";
import React, { useState, useRef } from "react";
import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LocaleLink from "@/app/components/shared/LocaleLink"; // 🔑 locale-aware link

const UserMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const handleOpen = () => setAnchorEl(btnRef.current);
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <Tooltip title="Hesap">
        <IconButton ref={btnRef} onClick={handleOpen}>
          <Avatar sx={{ width: 32, height: 32 }}>
            <PersonIcon fontSize="small" />
          </Avatar>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        disablePortal
        disableScrollLock
        container={anchorEl?.ownerDocument?.body}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {/* 🔑 auth2 route’a yönlendirme */}
        <MenuItem
          component={LocaleLink}
          href="/auth?tab=login"
          onClick={handleClose}
        >
          Giriş Yap
        </MenuItem>

        <MenuItem
          component={LocaleLink}
          href="/auth?tab=register"
          onClick={handleClose}
        >
          Kayıt Ol
        </MenuItem>

        {/* login sonrası menüler */}
        <MenuItem onClick={handleClose}>Profilim</MenuItem>
        <MenuItem onClick={handleClose}>Çıkış</MenuItem>
      </Menu>
    </>
  );
};

export default UserMenu;
