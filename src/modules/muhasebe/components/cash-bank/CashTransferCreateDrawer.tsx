"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Divider,
  Drawer,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { IconExchange, IconX } from "@tabler/icons-react";

import AccountingSelectField from "@/modules/muhasebe/components/shared/AccountingSelectField";
import type { CashBankAccount } from "@/modules/muhasebe/types/CashBank.types";

export interface CashTransferCreatePayload {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  currency: string;
  description?: string;
  transferredAt: string;
}

interface CashTransferCreateDrawerProps {
  open: boolean;
  accounts: CashBankAccount[];
  onClose: () => void;
  onCreated: (payload: CashTransferCreatePayload) => void;
}

export default function CashTransferCreateDrawer({
  open,
  accounts,
  onClose,
  onCreated,
}: CashTransferCreateDrawerProps) {
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("TRY");
  const [description, setDescription] = useState("");
  const [transferredAt, setTransferredAt] = useState(() =>
    new Date().toISOString().slice(0, 16),
  );

  useEffect(() => {
    if (open) {
      setFromAccountId(accounts[0]?.id ?? "");
      setToAccountId(accounts[1]?.id ?? accounts[0]?.id ?? "");
      setCurrency(accounts[0]?.currency ?? "TRY");
    }
  }, [open, accounts]);

  const fromAccount = accounts.find((account) => account.id === fromAccountId);

  const isSameAccount =
    Boolean(fromAccountId) && Boolean(toAccountId) && fromAccountId === toAccountId;

  const handleSubmit = () => {
    onCreated({
      fromAccountId,
      toAccountId,
      amount: Number(amount || 0),
      currency,
      description: description.trim() || undefined,
      transferredAt,
    });

    onClose();
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: "100vw", sm: 480 }, p: 3 }}>
        <Stack spacing={2.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" fontWeight={900}>
                Yeni Transfer
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Kasa ve banka hesapları arasında para aktarımı yapın.
              </Typography>
            </Box>

            <Button onClick={onClose} startIcon={<IconX size={18} />}>
              Kapat
            </Button>
          </Stack>

          <Divider />

          <AccountingSelectField
            label="Çıkış Hesabı"
            value={fromAccountId}
            onChange={(event) => {
              const nextAccountId = event.target.value;
              const account = accounts.find((item) => item.id === nextAccountId);

              setFromAccountId(nextAccountId);
              setCurrency(account?.currency ?? "TRY");
            }}
          >
            {accounts.map((account) => (
              <MenuItem key={account.id} value={account.id}>
                {account.name} · {account.type === "cash" ? "Kasa" : "Banka"}
              </MenuItem>
            ))}
          </AccountingSelectField>

          {fromAccount && (
            <Typography variant="caption" color="text.secondary">
              Çıkış hesabı bakiyesi:{" "}
              <strong>
                {fromAccount.balance.toLocaleString("tr-TR")} {fromAccount.currency}
              </strong>
            </Typography>
          )}

          <AccountingSelectField
            label="Giriş Hesabı"
            value={toAccountId}
            onChange={(event) => setToAccountId(event.target.value)}
          >
            {accounts.map((account) => (
              <MenuItem key={account.id} value={account.id}>
                {account.name} · {account.type === "cash" ? "Kasa" : "Banka"}
              </MenuItem>
            ))}
          </AccountingSelectField>

          {isSameAccount && (
            <Typography variant="caption" color="error">
              Çıkış ve giriş hesabı aynı olamaz.
            </Typography>
          )}

          <TextField
            size="small"
            label="Transfer Tutarı"
            type="number"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            fullWidth
          />

          <AccountingSelectField
            label="Para Birimi"
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
          >
            <MenuItem value="TRY">TRY</MenuItem>
            <MenuItem value="CHF">CHF</MenuItem>
            <MenuItem value="EUR">EUR</MenuItem>
            <MenuItem value="USD">USD</MenuItem>
          </AccountingSelectField>

          <TextField
            size="small"
            label="Transfer Tarihi"
            type="datetime-local"
            value={transferredAt}
            onChange={(event) => setTransferredAt(event.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            size="small"
            label="Açıklama"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            fullWidth
            multiline
            minRows={3}
          />

          <Button
            variant="contained"
            size="large"
            startIcon={<IconExchange size={18} />}
            onClick={handleSubmit}
            disabled={
              !fromAccountId ||
              !toAccountId ||
              isSameAccount ||
              !amount ||
              Number(amount) <= 0
            }
          >
            Transferi Oluştur
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}