"use client";

import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";

import type {
  RoleManagerUserFilters,
} from "../../types/RoleManager.types";

import type {
  AppRoleListItemDto,
} from "../../types/AppRole.types";

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
  return (
    <Stack
      spacing={2}
      direction={{
        xs: "column",
        md: "row",
      }}
      alignItems={{
        xs: "stretch",
        md: "center",
      }}
    >
      <TextField
        size="small"
        label="Search"
        value={filters.search}
        disabled={disabled}
        onChange={(event) =>
          onChange({
            ...filters,
            search: event.target.value,
          })
        }
        sx={{ minWidth: 260 }}
      />

      <FormControl
        size="small"
        sx={{ minWidth: 190 }}
      >
        <InputLabel>Role</InputLabel>

        <Select
          label="Role"
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
            All roles
          </MenuItem>

          {roles.map((role) => (
            <MenuItem
              key={role.id}
              value={role.id}
            >
              {role.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl
        size="small"
        sx={{ minWidth: 170 }}
      >
        <InputLabel>Verified</InputLabel>

        <Select
          label="Verified"
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
            All
          </MenuItem>
          <MenuItem value="true">
            Verified
          </MenuItem>
          <MenuItem value="false">
            Not verified
          </MenuItem>
        </Select>
      </FormControl>

      <FormControl
        size="small"
        sx={{ minWidth: 170 }}
      >
        <InputLabel>Active role</InputLabel>

        <Select
          label="Active role"
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
            All
          </MenuItem>
          <MenuItem value="true">
            Has role
          </MenuItem>
          <MenuItem value="false">
            No role
          </MenuItem>
        </Select>
      </FormControl>

      <Button
        variant="outlined"
        disabled={disabled}
        onClick={onReset}
      >
        Reset
      </Button>
    </Stack>
  );
}