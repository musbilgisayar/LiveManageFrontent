// src/modules/tenants/components/TenantOptionSelect.tsx

"use client";

import {
  Box,
  CircularProgress,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from "@mui/material";

import { useI18nNs } from "@/app/context/i18nContext";

import { useTenantOptions } from "../hooks/useTenantOptions";

type TenantOptionSelectProps = {
  value: string;
  onChange: (tenantId: string) => void;

  label?: string;
  disabled?: boolean;
  includeInactive?: boolean;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
};

export default function TenantOptionSelect({
  value,
  onChange,
  label,
  disabled = false,
  includeInactive = false,
  error = false,
  helperText,
  fullWidth = true,
}: TenantOptionSelectProps) {
  const { t } = useI18nNs("tenants");
  const { options, loading } = useTenantOptions(includeInactive);

  const resolvedLabel = label ?? t("tenants:fields.name");

  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value);
  };

  return (
    <FormControl
      fullWidth={fullWidth}
      error={error}
      disabled={disabled || loading}
    >
      <InputLabel>{resolvedLabel}</InputLabel>

      <Select
        value={value}
        label={resolvedLabel}
        onChange={handleChange}
        endAdornment={
          loading ? (
            <Box sx={{ display: "flex", alignItems: "center", pr: 2 }}>
              <CircularProgress size={18} />
            </Box>
          ) : undefined
        }
      >
        {options.map((tenant) => (
          <MenuItem key={tenant.id} value={tenant.id}>
            {tenant.name} ({tenant.key})
          </MenuItem>
        ))}
      </Select>

      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  );
}