"use client";

import React from "react";

import {
  alpha,
  Card,
  CardContent,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";

import {
  IconAlertTriangle,
} from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";

export default function ReviewListEmpty() {
  const theme = useTheme<Theme>();

  const { t } =
    useI18nNs("management-applications");

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4,

        borderColor: alpha(
          theme.palette.text.primary,
          0.08,
        ),
      }}
    >
      <CardContent>
        <Stack
          spacing={1}
          alignItems="center"
          sx={{
            py: 4,
          }}
        >
          <IconAlertTriangle
            size={34}
            color={
              theme.palette.warning
                .main
            }
          />

          <Typography
            fontWeight={900}
          >
            {t(
              "admin.reviewList.empty.title",
            )}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
          >
            {t(
              "admin.reviewList.empty.description",
            )}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}