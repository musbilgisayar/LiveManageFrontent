"use client";

import React from "react";
import {
  Box,
  Button,
  CardContent,
  Stack,
  Typography,
  Avatar,
  Tooltip,
  IconButton,
} from "@mui/material";
import Grid from "@mui/material/Grid"; // ✅ senin projede kullanılan Grid2 API
import BlankCard from "@/app/components/shared/BlankCard";
import CustomFormLabel from "@/app/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/app/components/forms/theme-elements/CustomTextField";
import { IconPackage, IconCirclePlus } from "@tabler/icons-react";

export default function BillsTab() {
  return (
    <Grid container spacing={3} justifyContent="center" mt={1}>
      {/* Dış kart */}
      <Grid
        size={{
          xs: 12,
          lg: 9,
        }}
      >
        <BlankCard>
          <CardContent>
            <Typography variant="h4" mb={2}>
              Faturalandırma Bilgileri
            </Typography>

            {/* Form alanları */}
            <Grid container spacing={3}>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <CustomFormLabel>Şirket Adı</CustomFormLabel>
                <CustomTextField fullWidth />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <CustomFormLabel>Adres</CustomFormLabel>
                <CustomTextField fullWidth />
              </Grid>
            </Grid>

            {/* Mevcut Plan */}
            <Stack direction="row" alignItems="center" spacing={2} mt={4}>
              <Avatar sx={{ bgcolor: "grey.100", color: "grey.600" }}>
                <IconPackage size={20} />
              </Avatar>
              <Box>
                <Typography variant="h6">Mevcut Plan</Typography>
                <Typography color="textSecondary">Premium</Typography>
              </Box>
              <Box sx={{ ml: "auto" }}>
                <Tooltip title="Planı değiştir">
                  <IconButton>
                    <IconCirclePlus size={20} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Stack>

            {/* Butonlar */}
            <Stack direction="row" justifyContent="end" spacing={2} mt={3}>
              <Button variant="contained" color="primary">
                Kaydet
              </Button>
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
