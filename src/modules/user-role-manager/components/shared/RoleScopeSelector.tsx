"use client";

import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";

import {
  IconBuildingCommunity,
  IconWorld,
} from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";

import type {
  RoleManagerScopeMode,
  RoleManagerScopeState,
} from "../../types/RoleManager.types";

type TenantOption = {
  id: string;
  name: string;
};

type RoleScopeSelectorProps = {
  value: RoleManagerScopeState;
  tenantOptions: TenantOption[];
  onChange: (value: RoleManagerScopeState) => void;
  disabled?: boolean;
};

export default function RoleScopeSelector({
  value,
  tenantOptions,
  onChange,
  disabled = false,
}: RoleScopeSelectorProps) {
  const { t } = useI18nNs("userRoleManager");

  const tenantSelectDisabled =
    disabled || value.mode !== "specificTenant";

  const selectedTenant = tenantOptions.find(
    (tenant) => tenant.id === value.tenantId,
  );

  const handleModeChange = (mode: RoleManagerScopeMode) => {
    onChange({
      mode,
      tenantId:
        mode === "specificTenant"
          ? value.tenantId
          : null,
    });
  };

  const handleTenantChange = (tenantId: string) => {
    onChange({
      ...value,
      tenantId: tenantId || null,
    });
  };

  return (
    <Box
      sx={{
        p: 1,
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: (theme) =>
          alpha(theme.palette.background.paper, 0.82),
        backdropFilter: "blur(10px)",
      }}
    >
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={1.5}
        alignItems="stretch"
      >
        <FormControl
          size="small"
          sx={{
            minWidth: {
              xs: "100%",
              sm: 250,
            },
            "& .MuiOutlinedInput-root": {
              height: 48,
              borderRadius: 3,
              bgcolor: "background.paper",
              fontWeight: 800,
            },
          }}
        >
          <InputLabel>{t("scope.label")}</InputLabel>

          <Select
            label={t("scope.label")}
            value={value.mode}
            disabled={disabled}
            onChange={(event) =>
              handleModeChange(
                event.target.value as RoleManagerScopeMode,
              )
            }
            renderValue={(mode) => (
              <Stack direction="row" spacing={1} alignItems="center">
                {mode === "allTenants" ? (
                  <IconWorld size={18} />
                ) : (
                  <IconBuildingCommunity size={18} />
                )}

                <Typography variant="body2" fontWeight={800}>
                  {mode === "currentTenant" &&
                    t("scope.currentTenant")}
                  {mode === "specificTenant" &&
                    t("scope.specificTenant")}
                  {mode === "allTenants" &&
                    t("scope.allTenants")}
                </Typography>
              </Stack>
            )}
          >
            <MenuItem value="currentTenant">
              {t("scope.currentTenant")}
            </MenuItem>

            <MenuItem value="allTenants">
              {t("scope.allTenants")}
            </MenuItem>

            <MenuItem value="specificTenant">
              {t("scope.specificTenant")}
            </MenuItem>
          </Select>
        </FormControl>

        <Tooltip
          arrow
          title={
            value.mode !== "specificTenant"
              ? t("scope.tenantDisabledHint")
              : ""
          }
        >
          <Box>
            <FormControl
              size="small"
              disabled={tenantSelectDisabled}
              sx={{
                minWidth: {
                  xs: "100%",
                  sm: 290,
                },
                opacity: tenantSelectDisabled ? 0.6 : 1,
                "& .MuiOutlinedInput-root": {
                  height: 48,
                  borderRadius: 3,
                  bgcolor: "background.paper",
                  fontWeight: 800,
                },
              }}
            >
              <InputLabel>{t("scope.tenant")}</InputLabel>

              <Select
                label={t("scope.tenant")}
                value={value.tenantId ?? ""}
                disabled={tenantSelectDisabled}
                onChange={(event) =>
                  handleTenantChange(event.target.value)
                }
                displayEmpty
                renderValue={() => {
                  if (!selectedTenant) {
                    return (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {t("scope.selectTenant")}
                      </Typography>
                    );
                  }

                  return (
                    <Typography variant="body2" fontWeight={800} noWrap>
                      {selectedTenant.name}
                    </Typography>
                  );
                }}
              >
                <MenuItem value="">
                  {t("scope.selectTenant")}
                </MenuItem>

                {tenantOptions.map((tenant) => (
                  <MenuItem key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Tooltip>
      </Stack>
    </Box>
  );
}