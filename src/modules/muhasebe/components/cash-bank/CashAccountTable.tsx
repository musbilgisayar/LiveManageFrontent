"use client";

import React from "react";
import {
  alpha,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import type { CashBankAccount } from "@/modules/muhasebe/types/CashBank.types";
import { formatCashBankMoney } from "@/modules/muhasebe/utils/cashBankFormatters";

interface Props {
  accounts: CashBankAccount[];
}

export default function CashAccountTable({ accounts }: Props) {
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Hesap</TableCell>
            <TableCell>Tür</TableCell>
            <TableCell>Banka</TableCell>
            <TableCell align="right">Bakiye</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {accounts.map((acc) => (
            <TableRow key={acc.id} hover>
              <TableCell>
                <Typography fontWeight={700}>{acc.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {acc.code}
                </Typography>
              </TableCell>

              <TableCell>
                {acc.type === "cash" ? "Kasa" : "Banka"}
              </TableCell>

              <TableCell>
                {acc.bankName ?? "-"}
              </TableCell>

              <TableCell align="right">
                <Typography fontWeight={800}>
                  {formatCashBankMoney(acc.balance, acc.currency)}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}