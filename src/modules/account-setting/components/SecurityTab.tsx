"use client";

import React from "react";
import {
  Box,
  Button,
  CardContent,
  Divider,
  Typography,
  Avatar,
  Stack,
  IconButton,
} from "@mui/material";
import Grid from "@mui/material/Grid"; // ✅ Doğru import
import BlankCard from "@/app/components/shared/BlankCard";
import {
  IconDeviceLaptop,
  IconDeviceMobile,
  IconDotsVertical,
} from "@tabler/icons-react";
import { useI18nNs } from "@/app/context/i18nContext"; // ✅ senin i18n hook’un

export default function SecurityTab() {
  const { t } = useI18nNs(["account"]); // 🌐 Namespace: account

  return (
    <Grid container spacing={3} justifyContent="center">
      <Grid size={{ xs: 12, lg: 8 }}>
        <BlankCard>
          <CardContent>
            <Typography variant="h4" mb={2}>
              {t("account:security.title")}
            </Typography>

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Typography color="textSecondary">
                {t("account:security.twoFactorDesc")}
              </Typography>
              <Button variant="contained">
                {t("account:security.activate")}
              </Button>
            </Stack>

            <Divider />

            <Stack direction="row" spacing={2} py={2}>
              <Avatar
                sx={{ bgcolor: "primary.light", color: "primary.main" }}
              >
                <IconDeviceLaptop size={22} />
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {t("account:security.devices")}
                </Typography>
                <Typography color="textSecondary">
                  {t("account:security.devicesDesc")}
                </Typography>
              </Box>
            </Stack>

            <Divider />

            <Stack direction="row" spacing={2} py={2} alignItems="center">
              <IconDeviceMobile size={22} />
              <Box>
                <Typography variant="h6">
                  {t("account:security.sampleDeviceName")}
                </Typography>
                <Typography color="textSecondary">
                  {t("account:security.sampleDeviceLocation")}
                </Typography>
              </Box>
              <Box sx={{ ml: "auto" }}>
                <IconButton>
                  <IconDotsVertical size={18} />
                </IconButton>
              </Box>
            </Stack>
          </CardContent>
        </BlankCard>
      </Grid>
    </Grid>
  );
}
