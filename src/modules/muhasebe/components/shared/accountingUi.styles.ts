import type { Theme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";

export const accountingUi = {
  pageHeader: {
    root: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 2,
      flexWrap: "wrap",
    },
    title: {
      fontWeight: 900,
      letterSpacing: "-0.02em",
    },
    description: {
      mt: 0.5,
      color: "text.secondary",
    },
    actions: {
      display: "flex",
      gap: 1,
      flexWrap: "wrap",
      justifyContent: "flex-end",
    },
  },

  panel: {
    root: (theme: Theme) => ({
      borderRadius: 4,
      border: `1px solid ${theme.palette.divider}`,
      boxShadow: "none",
      overflow: "hidden",
      background: theme.palette.background.paper,
    }),
    content: {
      p: { xs: 2, md: 3 },
    },
  },

  filterPanel: {
    root: (theme: Theme) => ({
      p: 2,
      borderRadius: 3,
      bgcolor:
        theme.palette.mode === "dark"
          ? alpha(theme.palette.common.white, 0.03)
          : alpha(theme.palette.primary.main, 0.015),
      border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
    }),
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 1.5,
      flexWrap: "wrap",
    },
    title: {
      fontWeight: 700,
      color: "text.secondary",
      letterSpacing: "0.02em",
    },
    fields: {
      display: "flex",
      gap: 1.5,
      flexWrap: "wrap",
      alignItems: "center",
    },
  },

  viewToggle: {
    root: (theme: Theme) => ({
      borderRadius: 2,
      overflow: "hidden",
      bgcolor:
        theme.palette.mode === "dark"
          ? alpha(theme.palette.common.white, 0.06)
          : alpha(theme.palette.grey[900], 0.04),
      "& .MuiToggleButton-root": {
        border: `1px solid ${theme.palette.divider}`,
        px: 1.5,
        color: "text.secondary",
        "&.Mui-selected": {
          bgcolor: theme.palette.background.paper,
          color: "text.primary",
        },
      },
    }),
  },
};