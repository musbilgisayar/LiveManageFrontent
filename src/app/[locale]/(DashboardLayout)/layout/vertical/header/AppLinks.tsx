"use client";

import React from "react";
import { Avatar, Box, Typography, Grid, Stack } from "@mui/material";
import Link from "next/link";
import * as dropdownData from "./data";
import { useI18nNs } from "@/app/context/i18nContext";

const AppLinks = () => {
  const { t } = useI18nNs(["header"]);

  return (
    <Grid container spacing={3} mb={4}>
      {dropdownData.appsLink.map((links) => (
        <Grid
          key={links.href}
          size={{
            lg: 6,
          }}
        >
          <Link href={links.href} className="hover-text-primary">
            <Stack direction="row" spacing={2}>
              <Box
                minWidth="45px"
                height="45px"
                bgcolor="grey.100"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Avatar
                  src={links.avatar}
                  alt={links.avatar}
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: 0,
                  }}
                />
              </Box>

              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  color="textPrimary"
                  noWrap
                  className="text-hover"
                  sx={{
                    width: "240px",
                  }}
                >
                  {t(links.titleKey)}
                </Typography>

                <Typography
                  color="textSecondary"
                  variant="subtitle2"
                  fontSize="12px"
                  sx={{
                    width: "240px",
                  }}
                  noWrap
                >
                  {t(links.subtextKey)}
                </Typography>
              </Box>
            </Stack>
          </Link>
        </Grid>
      ))}
    </Grid>
  );
};

export default AppLinks;