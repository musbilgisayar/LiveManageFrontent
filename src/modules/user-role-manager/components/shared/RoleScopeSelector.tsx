"use client";

import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";

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

  onChange: (
    value: RoleManagerScopeState,
  ) => void;

  disabled?: boolean;
};

export default function RoleScopeSelector({
  value,
  tenantOptions,
  onChange,
  disabled = false,
}: RoleScopeSelectorProps) {
  const handleModeChange = (
    mode: RoleManagerScopeMode,
  ) => {
    onChange({
      mode,
      tenantId:
        mode === "specificTenant"
          ? value.tenantId
          : null,
    });
  };

  const handleTenantChange = (
    tenantId: string,
  ) => {
    onChange({
      ...value,
      tenantId,
    });
  };

  return (
    <Stack
      direction={{
        xs: "column",
        md: "row",
      }}
      spacing={2}
    >
      <FormControl
        size="small"
        sx={{ minWidth: 220 }}
      >
        <InputLabel>
          Scope
        </InputLabel>

        <Select
          label="Scope"
          value={value.mode}
          disabled={disabled}
          onChange={(event) =>
            handleModeChange(
              event.target
                .value as RoleManagerScopeMode,
            )
          }
        >
          <MenuItem value="currentTenant">
            Current Tenant
          </MenuItem>

          <MenuItem value="allTenants">
            All Tenants
          </MenuItem>

          <MenuItem value="specificTenant">
            Specific Tenant
          </MenuItem>
        </Select>
      </FormControl>

      {value.mode ===
        "specificTenant" && (
        <FormControl
          size="small"
          sx={{ minWidth: 240 }}
        >
          <InputLabel>
            Tenant
          </InputLabel>

          <Select
            label="Tenant"
            value={value.tenantId ?? ""}
            disabled={disabled}
            onChange={(event) =>
              handleTenantChange(
                event.target.value,
              )
            }
          >
            {tenantOptions.map(
              (tenant) => (
                <MenuItem
                  key={tenant.id}
                  value={tenant.id}
                >
                  {tenant.name}
                </MenuItem>
              ),
            )}
          </Select>
        </FormControl>
      )}
    </Stack>
  );
}