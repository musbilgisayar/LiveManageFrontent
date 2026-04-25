//
"use client";

import { Box } from "@mui/material";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function UserDetailSectionGrid({ children }: Props) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "1fr 1fr",
        },
        gap: 2,
      }}
    >
      {children}
    </Box>
  );
}