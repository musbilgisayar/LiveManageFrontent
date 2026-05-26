import { alpha } from "@mui/material";
import type { Theme } from "@mui/material/styles";

export const premiumUploadShadow = (theme: Theme) =>
  `0 18px 46px ${alpha(
    theme.palette.common.black,
    theme.palette.mode === "dark" ? 0.28 : 0.07,
  )}`;

export const premiumUploadHoverShadow = (theme: Theme, color: string) =>
  `0 22px 58px ${alpha(color, theme.palette.mode === "dark" ? 0.24 : 0.18)}`;

export const premiumUploadTransition =
  "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background-color 180ms ease";