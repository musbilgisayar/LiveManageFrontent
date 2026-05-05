"use client";

import React from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { IconLayoutGrid, IconLayoutList } from "@tabler/icons-react";
import { accountingUi } from "./accountingUi.styles";

export type AccountingViewMode = "grid" | "list";

interface AccountingViewToggleProps {
  value: AccountingViewMode;
  onChange: (value: AccountingViewMode) => void;
}

export default function AccountingViewToggle({
  value,
  onChange,
}: AccountingViewToggleProps) {
  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={(_, nextValue) => {
        if (nextValue) onChange(nextValue);
      }}
      size="small"
      sx={accountingUi.viewToggle.root}
    >
      <ToggleButton value="grid">
        <IconLayoutGrid size={18} />
      </ToggleButton>

      <ToggleButton value="list">
        <IconLayoutList size={18} />
      </ToggleButton>
    </ToggleButtonGroup>
  );
}