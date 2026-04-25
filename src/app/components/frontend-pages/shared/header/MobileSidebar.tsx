"use client";
import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Logo from "@/app/[locale]/(DashboardLayout)/layout/shared/logo/Logo";
import { Chip } from "@mui/material";
import { usePathname } from "next/navigation";

interface TopMenuItem {
  title: string;
  tooltip?: string;
  href: string;
  icon?: string;
  badge?: string;
  isExternal?: boolean;
  isFeatureEnabled: boolean;
  displayMode: string;
  new?: boolean;
}

const MobileSidebar = () => {
  const pathname = usePathname();
  const [navLinks, setNavLinks] = useState<TopMenuItem[]>([]);

  useEffect(() => {
    const lang = pathname.split("/")[1] || "en";

    fetch(`/api/v1/${lang}/menus/top`)
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter(
          (item: TopMenuItem) =>
            item.isFeatureEnabled && item.displayMode === "visible"
        );
        setNavLinks(filtered);
      })
      .catch((error) => {
        console.error("Mobile sidebar menu yüklenemedi:", error);
      });
  }, [pathname]);

  return (
    <>
      <Box px={3}>
        <Logo />
      </Box>
      <Box p={3}>
        <Stack direction="column" spacing={2}>
          {navLinks.map((navlink, i) => (
            <Button
              color="inherit"
              href={navlink.href}
              key={i}
              sx={{
                justifyContent: "start",
              }}
            >
              {navlink.title}
              {navlink.new && (
                <Chip
                  label="New"
                  size="small"
                  sx={{
                    ml: "6px",
                    borderRadius: "8px",
                    color: "primary.main",
                    backgroundColor: "rgba(93, 135, 255, 0.15)",
                  }}
                />
              )}
            </Button>
          ))}

          <Button
            color="inherit"
            href="#"
            sx={{
              justifyContent: "start",
            }}
          >
            Support
          </Button>
          <Button color="primary" variant="contained" href="/auth/login">
            Get Started
          </Button>
        </Stack>
      </Box>
    </>
  );
};

export default MobileSidebar;
