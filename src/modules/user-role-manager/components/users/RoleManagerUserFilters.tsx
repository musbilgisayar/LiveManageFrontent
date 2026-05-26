"use client";

import {
  Box,
  Button,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  alpha,
} from "@mui/material";

import {
  IconFilterOff,
  IconSearch,
} from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";

import type { RoleManagerUserFilters } from "../../types/RoleManager.types";
import type { AppRoleListItemDto } from "../../types/AppRole.types";

type RoleManagerUserFiltersProps = {
  filters: RoleManagerUserFilters;
  roles: AppRoleListItemDto[];
  disabled?: boolean;
  onChange: (filters: RoleManagerUserFilters) => void;
  onReset: () => void;
};

export default function RoleManagerUserFilters({
  filters,
  roles,
  disabled = false,
  onChange,
  onReset,
}: RoleManagerUserFiltersProps) {
  const { t } = useI18nNs("userRoleManager");

  const fieldSx = {
    minWidth: {
      xs: "100%",
      md: 180,
    },
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      bgcolor: "background.paper",
      fontWeight: 700,
    },
  };

  return (
    <Box
      sx={{
        p: 2,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        bgcolor: (theme) =>
          alpha(theme.palette.primary.main, 0.025),
      }}
    >
      <Stack
        spacing={1.5}
        direction={{
          xs: "column",
          lg: "row",
        }}
        alignItems={{
          xs: "stretch",
          lg: "center",
        }}
      >
        <TextField
          size="small"
          label={t("filters.search")}
          value={filters.search}
          disabled={disabled}
          onChange={(event) =>
            onChange({
              ...filters,
              search: event.target.value,
            })
          }
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconSearch size={18} />
              </InputAdornment>
            ),
          }}
          sx={{
            ...fieldSx,
            flex: 1,
            minWidth: {
              xs: "100%",
              lg: 300,
            },
          }}
        />

        <FormControl size="small" sx={fieldSx}>
          <InputLabel>{t("filters.role")}</InputLabel>

          <Select
            label={t("filters.role")}
            value={filters.roleId ?? ""}
            disabled={disabled}
            onChange={(event) =>
              onChange({
                ...filters,
                roleId: event.target.value || null,
              })
            }
          >
            <MenuItem value="">
              {t("filters.allRoles")}
            </MenuItem>

            {roles.map((role) => (
              <MenuItem key={role.id} value={role.id}>
                {role.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={fieldSx}>
          <InputLabel>{t("filters.verified")}</InputLabel>

          <Select
            label={t("filters.verified")}
            value={
              filters.isVerified === null
                ? ""
                : String(filters.isVerified)
            }
            disabled={disabled}
            onChange={(event) =>
              onChange({
                ...filters,
                isVerified:
                  event.target.value === ""
                    ? null
                    : event.target.value === "true",
              })
            }
          >
            <MenuItem value="">
              {t("filters.all")}
            </MenuItem>

            <MenuItem value="true">
              {t("badges.verified")}
            </MenuItem>

            <MenuItem value="false">
              {t("badges.notVerified")}
            </MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={fieldSx}>
          <InputLabel>{t("filters.activeRole")}</InputLabel>

          <Select
            label={t("filters.activeRole")}
            value={
              filters.hasActiveRole === null
                ? ""
                : String(filters.hasActiveRole)
            }
            disabled={disabled}
            onChange={(event) =>
              onChange({
                ...filters,
                hasActiveRole:
                  event.target.value === ""
                    ? null
                    : event.target.value === "true",
              })
            }
          >
            <MenuItem value="">
              {t("filters.all")}
            </MenuItem>

            <MenuItem value="true">
              {t("filters.hasRole")}
            </MenuItem>

            <MenuItem value="false">
              {t("filters.noRole")}
            </MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          disabled={disabled}
          onClick={onReset}
          startIcon={<IconFilterOff size={18} />}
          sx={{
            height: 40,
            px: 2,
            borderRadius: 2,
            fontWeight: 800,
            whiteSpace: "nowrap",
            ml: {
              lg: "auto",
            },
          }}
        >
          {t("actions.reset")}
        </Button>
      </Stack>
    </Box>
  );
}