"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Avatar,
  Box,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { IconSearch, IconUser } from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";
import { useSuperAdminUsers } from "../../hooks/useSuperAdminUsers";

export type UserLookupSelectValue = {
  id: string;
  fullName: string;
  email?: string | null;
  userName?: string | null;
  isActive?: boolean;
};

type Props = {
  value: UserLookupSelectValue | null;
  onChange: (user: UserLookupSelectValue | null) => void;
  label?: string;
};

export default function UserLookupSelect({
  value,
  onChange,
  label,
}: Props) {
  const { t } = useI18nNs(["users", "common"]);

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const { users, isLoading } = useSuperAdminUsers({
    pageNumber: 1,
    pageSize: 20,
    search: debouncedSearch,
  });

  const options = useMemo<UserLookupSelectValue[]>(() => {
    const safeUsers = Array.isArray(users) ? users : [];

    return safeUsers.map((user) => ({
      id: user.id,
      fullName:
        user.fullName?.trim() ||
        `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
        user.userName ||
        user.email ||
        user.id,
      email: user.email ?? null,
      userName: user.userName ?? null,
      isActive: Boolean(user.isActive),
    }));
  }, [users]);

  return (
    <Autocomplete
      fullWidth
      options={options}
      value={value}
      loading={isLoading}
      inputValue={searchInput}
      isOptionEqualToValue={(option, selected) => option.id === selected.id}
      getOptionLabel={(option) =>
        option.fullName || option.email || option.userName || option.id
      }
      onInputChange={(_, nextValue) => {
        setSearchInput(nextValue);
      }}
      onChange={(_, nextValue) => {
        onChange(nextValue);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label || t("users:list.searchPlaceholder")}
          size="small"
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                <IconSearch size={18} />
                {params.InputProps.startAdornment}
              </>
            ),
            endAdornment: (
              <>
                {isLoading ? (
                  <CircularProgress color="inherit" size={18} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => {
        const initials = option.fullName
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0]?.toUpperCase())
          .join("");

        return (
          <Box component="li" {...props} key={option.id}>
            <Stack direction="row" spacing={1.5} alignItems="center" minWidth={0}>
              <Avatar>
                {initials || <IconUser size={18} />}
              </Avatar>

              <Box minWidth={0}>
                <Typography variant="body2" fontWeight={800} noWrap>
                  {option.fullName}
                </Typography>

                <Typography variant="caption" color="text.secondary" noWrap>
                  {option.email || option.userName || option.id}
                </Typography>
              </Box>
            </Stack>
          </Box>
        );
      }}
    />
  );
}