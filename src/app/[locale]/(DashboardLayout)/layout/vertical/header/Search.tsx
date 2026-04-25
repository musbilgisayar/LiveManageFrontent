"use client";

import { useState } from "react";
import {
  IconButton,
  Dialog,
  DialogContent,
  Stack,
  Divider,
  Box,
  List,
  ListItemText,
  Typography,
  TextField,
  ListItemButton,
} from "@mui/material";
import { IconSearch, IconX } from "@tabler/icons-react";
import Menuitems from "../sidebar/MenuItems";
import Link from "next/link";
import { useI18nNs } from "@/app/context/i18nContext"; // ✅ i18n hook'u eklendi

interface menuType {
  title: string;
  id: string;
  subheader: string;
  children: menuType[];
  href: string;
}

const Search = () => {
  const [showDrawer2, setShowDrawer2] = useState(false);
  const [search, setSearch] = useState("");

  const handleDrawerClose2 = () => {
    setShowDrawer2(false);
  };

  // ✅ çeviri hook'u
  const { t } = useI18nNs(["sidebar"]);

  const filterRoutes = (routes: menuType[], q: string) => {
    if (!q) return routes;
    return routes.filter((t) =>
      t.title
        ? t.title.toLowerCase().includes(q.toLowerCase()) ||
          t.href.toLowerCase().includes(q.toLowerCase())
        : false
    );
  };

  const searchData = filterRoutes(Menuitems as menuType[], search);

  return (
    <>
      <IconButton
        aria-label="show 4 new mails"
        color="inherit"
        aria-controls="search-menu"
        aria-haspopup="true"
        onClick={() => setShowDrawer2(true)}
        size="large"
      >
        <IconSearch size="16" />
      </IconButton>

      <Dialog
        open={showDrawer2}
        onClose={() => setShowDrawer2(false)}
        fullWidth
        maxWidth="sm"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{ sx: { position: "fixed", top: 30, m: 0 } }}
      >
        <DialogContent className="testdialog">
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              id="tb-search"
              placeholder={t("sidebar:search.placeholder", {
                defaultValue: "Search here",
              })}
              fullWidth
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                htmlInput: { "aria-label": "Search here" },
              }}
            />
            <IconButton size="small" onClick={handleDrawerClose2}>
              <IconX size="18" />
            </IconButton>
          </Stack>
        </DialogContent>

        <Divider />

        <Box p={2} sx={{ maxHeight: "60vh", overflow: "auto" }}>
          <Typography variant="h5" p={1}>
            {t("sidebar:quickLinks", { defaultValue: "Quick Page Links" })}
          </Typography>

          <List component="nav">
            {searchData.map((menu: menuType) => (
              <Box key={menu.id || menu.subheader}>
                {/* ana menü */}
                {menu.title && !menu.children && (
                  <ListItemButton
                    sx={{ py: 0.5, px: 1 }}
                    href={menu.href}
                    component={Link}
                  >
                    <ListItemText
                      primary={t(menu.title)} // ✅ çeviri burada
                      secondary={menu.href}
                      sx={{ my: 0, py: 0.5 }}
                    />
                  </ListItemButton>
                )}

                {/* alt menüler */}
                {menu.children &&
                  menu.children.map((child: menuType) => (
                    <ListItemButton
                      sx={{ py: 0.5, px: 1 }}
                      href={child.href}
                      component={Link}
                      key={child.id || child.subheader}
                    >
                      <ListItemText
                        primary={t(child.title)} // ✅ çeviri burada
                        secondary={child.href}
                        sx={{ my: 0, py: 0.5 }}
                      />
                    </ListItemButton>
                  ))}
              </Box>
            ))}
          </List>
        </Box>
      </Dialog>
    </>
  );
};

export default Search;
