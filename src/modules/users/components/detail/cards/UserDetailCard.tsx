"use client";

import { Box, Card, CardContent, Typography } from "@mui/material";
import { ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
};

export default function UserDetailCard({ title, children, icon }: Props) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 4,
        overflow: "hidden",
        backgroundColor: "background.paper",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.2,
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
        }}
      >
        {/* Icon */}
        {icon && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              color: "#fff",
              opacity: 0.9,
            }}
          >
            {icon}
          </Box>
        )}

        {/* Title */}
        <Typography
          variant="subtitle1"
          fontWeight={700}
          sx={{
            color: "#fff",
            letterSpacing: 0.3,
            lineHeight: 1.3,
          }}
        >
          {title}
        </Typography>
      </Box>

      {/* Content */}
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        {children}
      </CardContent>
    </Card>
  );
}