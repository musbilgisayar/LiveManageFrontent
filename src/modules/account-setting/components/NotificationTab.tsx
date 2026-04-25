"use client";

import React from "react";
import {
  Box,
  Button,
  CardContent,
  Stack,
  Typography,
  Avatar,
} from "@mui/material";
import Grid from "@mui/material/Grid"; // ✅ Grid2 API
import BlankCard from "@/app/components/shared/BlankCard";
import CustomTextField from "@/app/components/forms/theme-elements/CustomTextField";
import CustomFormLabel from "@/app/components/forms/theme-elements/CustomFormLabel";
import CustomSwitch from "@/app/components/forms/theme-elements/CustomSwitch";
import {
  IconMail,
  IconCheckbox,
  IconTruckDelivery,
  IconArticle,
} from "@tabler/icons-react";

export default function NotificationTab() {
  return (
    <Grid container spacing={3} justifyContent="center">
      <Grid size={{ xs: 12, lg: 9 }}>
        <BlankCard>
          <CardContent>
            <Typography variant="h4" mb={2}>
              Bildirim Tercihleri
            </Typography>
            <Typography color="textSecondary" mb={3}>
              E-posta bildirimlerini yönetebilirsiniz.
            </Typography>

            <CustomFormLabel htmlFor="email">E-posta</CustomFormLabel>
            <CustomTextField id="email" variant="outlined" fullWidth />

            {[
              { icon: <IconArticle />, title: "Bülten", desc: "Haber ve duyurular" },
              { icon: <IconCheckbox />, title: "Sipariş Onayı", desc: "Sipariş işlemleri" },
              { icon: <IconTruckDelivery />, title: "Teslimat", desc: "Kargolama durumu" },
              { icon: <IconMail />, title: "E-posta Bildirimleri", desc: "Genel güncellemeler" },
            ].map((n, i) => (
              <Stack key={i} direction="row" spacing={2} mt={3} alignItems="center">
                <Avatar
                  variant="rounded"
                  sx={{ bgcolor: "grey.100", color: "grey.500" }}
                >
                  {n.icon}
                </Avatar>
                <Box>
                  <Typography variant="h6">{n.title}</Typography>
                  <Typography color="textSecondary">{n.desc}</Typography>
                </Box>
                <Box sx={{ ml: "auto" }}>
                  <CustomSwitch />
                </Box>
              </Stack>
            ))}

            <Stack direction="row" justifyContent="end" mt={3} spacing={2}>
              <Button variant="contained">Kaydet</Button>
              <Button variant="text" color="error">
                İptal
              </Button>
            </Stack>
          </CardContent>
        </BlankCard>
      </Grid>
    </Grid>
  );
}
