//src/modules/muhasebe/components/shared/AccountingSelectField.tsx
"use client";

import React from "react";
import TextField, { type TextFieldProps } from "@mui/material/TextField";

type AccountingSelectFieldProps = Omit<TextFieldProps, "select" | "size">;

export default function AccountingSelectField({
  children,
  SelectProps,
  sx,
  ...props
}: AccountingSelectFieldProps) {
  return (
    <TextField
      {...props}
      select
      size="small"
      sx={sx}
      SelectProps={{
        ...SelectProps,
        MenuProps: {
          ...SelectProps?.MenuProps,
          PaperProps: {
            ...SelectProps?.MenuProps?.PaperProps,
            sx: {
              borderRadius: 2,
              mt: 0.75,
              boxShadow: "0 18px 45px rgba(15, 23, 42, 0.12)",
              border: (theme) => `1px solid ${theme.palette.divider}`,

              "& .MuiMenuItem-root": {
                fontSize: 10,
                minHeight: 36,
                px: 2,
              },

              "& .MuiMenuItem-root.Mui-selected": {
                fontWeight: 700,
              },

              "& .MuiMenuItem-root:hover": {
                bgcolor: "action.hover",
              },

              ...SelectProps?.MenuProps?.PaperProps?.sx,
            },
          },
        },
      }}
    >
      {children}
    </TextField>
  );
}