"use client";

import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { accountingUi } from "./accountingUi.styles";

interface AccountingFilterPanelProps {
  title?: string;
  actions?: React.ReactNode;
  search?: React.ReactNode;
  viewToggle?: React.ReactNode;
  children?: React.ReactNode;
}

export default function AccountingFilterPanel({
  title = "Filtreler",
  actions,
  search,
  viewToggle,
  children,
}: AccountingFilterPanelProps) {
  return (
    <Box sx={accountingUi.filterPanel.root}>
      <Stack spacing={1.5}>
        <Box sx={accountingUi.filterPanel.header}>
          <Typography fontSize={12} fontWeight={700} color="text.secondary">
            {title}
          </Typography>
        </Box>

        {(search || viewToggle) && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: { xs: "wrap", md: "nowrap" },

              "& .MuiTextField-root": {
                width: "100%",
              },

              "& .MuiInputBase-root": {
                height: 40,
                fontSize: 12,
              },

              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "background.paper",
              },

              "& .MuiInputAdornment-root svg": {
                width: 18,
                height: 18,
              },
            }}
          >
            {search && (
              <Box sx={{ flex: "1 1 320px", minWidth: { xs: "100%", md: 260 } }}>
                {search}
              </Box>
            )}

            {viewToggle && (
              <Box sx={{ flexShrink: 0, ml: { md: "auto" } }}>
                {viewToggle}
              </Box>
            )}
          </Box>
        )}

        {(children || actions) && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(5, minmax(150px, max-content)) auto",
              },
              gap: 1.25,
              alignItems: "center",

              "& .MuiTextField-root": {
                width: "auto",
                minWidth: 150,
              },

              "& .MuiInputBase-root": {
                height: 40,
                fontSize: 12,
              },

              "& .MuiInputLabel-root": {
                fontSize: 11,
              },

              "& .MuiSelect-select": {
                fontSize: 12,
              },

              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "background.paper",
              },
            }}
          >
            {children}

            {actions && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: { xs: "flex-start", sm: "flex-end" },
                  alignItems: "center",
                  height: 40,
                  minWidth: 150,

                  "& .MuiButton-root": {
                    whiteSpace: "nowrap",
                  },
                }}
              >
                {actions}
              </Box>
            )}
          </Box>
        )}
      </Stack>
    </Box>
  );
}