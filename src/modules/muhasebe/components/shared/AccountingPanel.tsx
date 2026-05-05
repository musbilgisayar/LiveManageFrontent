"use client";

import React from "react";
import { Card, CardContent } from "@mui/material";
import { accountingUi } from "./accountingUi.styles";

interface AccountingPanelProps {
  children: React.ReactNode;
}

export default function AccountingPanel({ children }: AccountingPanelProps) {
  return (
    <Card elevation={0} sx={accountingUi.panel.root}>
      <CardContent sx={accountingUi.panel.content}>{children}</CardContent>
    </Card>
  );
}