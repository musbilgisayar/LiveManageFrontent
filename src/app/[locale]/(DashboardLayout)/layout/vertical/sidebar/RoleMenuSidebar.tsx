"use client";

import { useState } from "react";
import {
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Collapse,
} from "@mui/material";
import {
  ShieldCheck,
  Users,
  UserPlus,
  ToggleLeft,
  Settings,
  Trash2,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useI18nNs } from "@/app/context/i18nContext";

interface RoleMenuSidebarProps {
  userRoles: string[];
}

export function RoleMenuSidebar({ userRoles }: RoleMenuSidebarProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { lang } = useParams();
  const { t } = useI18nNs(["roles"]);

  const isAuthorized =
    userRoles?.includes("SuperAdmin") || userRoles?.includes("Admin");
  if (!isAuthorized) return null;

  const go = (path: string) => {
    const safeLang = Array.isArray(lang) ? lang[0] : lang;
    router.push(`/${safeLang}/roles${path}`);
  };

  return (
    <>
      <ListItemButton onClick={() => setOpen(!open)}>
        <ListItemIcon>
          <ShieldCheck size={20} />
        </ListItemIcon>
        <ListItemText
          primary={t("roles:menu.title", { defaultValue: "Rol İşlemleri" })}
          primaryTypographyProps={{ fontWeight: "bold" }}
        />
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </ListItemButton>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding sx={{ pl: 4 }}>
          <ListItemButton onClick={() => go("")}>
            <ListItemIcon>
              <Users size={18} />
            </ListItemIcon>
            <ListItemText primary={t("roles:menu.list", { defaultValue: "Rolleri Listele" })} />
          </ListItemButton>

          <ListItemButton onClick={() => go("/create")}>
            <ListItemIcon>
              <UserPlus size={18} />
            </ListItemIcon>
            <ListItemText primary={t("roles:menu.create", { defaultValue: "Rol Ekle / Güncelle" })} />
          </ListItemButton>

          <ListItemButton onClick={() => go("/permissions")}>
            <ListItemIcon>
              <Settings size={18} />
            </ListItemIcon>
            <ListItemText primary={t("roles:menu.permissions", { defaultValue: "İzinleri Yönet" })} />
          </ListItemButton>

          <ListItemButton onClick={() => go("/toggle")}>
            <ListItemIcon>
              <ToggleLeft size={18} />
            </ListItemIcon>
            <ListItemText primary={t("roles:menu.toggle", { defaultValue: "Rol Aktif / Pasif Et" })} />
          </ListItemButton>

          <ListItemButton onClick={() => go("/delete")}>
            <ListItemIcon>
              <Trash2 size={18} />
            </ListItemIcon>
            <ListItemText primary={t("roles:menu.delete", { defaultValue: "Rol Sil" })} />
          </ListItemButton>
        </List>
      </Collapse>
    </>
  );
}
