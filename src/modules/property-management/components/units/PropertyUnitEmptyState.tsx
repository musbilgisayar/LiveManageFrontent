"use client";

import React from "react";
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { IconBuildingEstate, IconPlus } from "@tabler/icons-react";

type Props = {
  onCreate: () => void;
};

export default function PropertyUnitEmptyState({ onCreate }: Props) {
  const theme = useTheme<Theme>();

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4,
        borderStyle: "dashed",
        borderColor: alpha(theme.palette.text.primary, 0.14),
      }}
    >
      <CardContent sx={{ py: 6, textAlign: "center" }}>
        <Stack spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 58,
              height: 58,
              borderRadius: 3,
              display: "grid",
              placeItems: "center",
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              color: "primary.main",
            }}
          >
            <IconBuildingEstate size={28} />
          </Box>

          <Typography fontWeight={900}>
            Bu üst kayıt altında bağımsız bölüm yok
          </Typography>

          <Typography variant="body2" color="text.secondary" maxWidth={520}>
            Seçili site veya apartmana bağlı daire, dükkan ya da ofis kaydı ekleyebilirsiniz.
          </Typography>

          <Button variant="contained" startIcon={<IconPlus size={18} />} onClick={onCreate}>
            İlk Kaydı Ekle
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}