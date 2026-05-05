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
import {
  IconArrowDownLeft,
  IconArrowUpRight,
  IconX,
} from "@tabler/icons-react";

import AccountingSelectField from "@/modules/muhasebe/components/shared/AccountingSelectField";
import type {
  CashBankAccount,
  CashBankTransactionType,
} from "@/modules/muhasebe/types/CashBank.types";

export interface CashTransactionCreatePayload {
  accountId: string;
  type: "income" | "expense";
  amount: number;
  currency: string;
  description: string;
  sourceModule: "manual" | "payment" | "expense" | "income";
  sourceReference?: string;
  occurredAt: string;
}

interface CashTransactionCreateDrawerProps {
  open: boolean;
  defaultType: "income" | "expense";
  accounts: CashBankAccount[];
  onClose: () => void;
  onCreated: (payload: CashTransactionCreatePayload) => void;
}

export default function CashTransactionCreateDrawer({
  open,
  defaultType,
  accounts,
  onClose,
  onCreated,
}: CashTransactionCreateDrawerProps) {
  const [type, setType] = useState<"income" | "expense">(defaultType);
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("TRY");
  const [description, setDescription] = useState("");
  const [sourceModule, setSourceModule] =
    useState<CashTransactionCreatePayload["sourceModule"]>("manual");
  const [sourceReference, setSourceReference] = useState("");
  const [occurredAt, setOccurredAt] = useState(() =>
    new Date().toISOString().slice(0, 16),
  );

  useEffect(() => {
    if (open) {
      setType(defaultType);
      setAccountId(accounts[0]?.id ?? "");
      setCurrency(accounts[0]?.currency ?? "TRY");
    }
  }, [open, defaultType, accounts]);

  const selectedAccount = accounts.find((account) => account.id === accountId);

  const handleSubmit = () => {
    onCreated({
      accountId,
      type,
      amount: Number(amount || 0),
      currency,
      description,
      sourceModule,
      sourceReference: sourceReference.trim() || undefined,
      occurredAt,
    });

    onClose();
  };

  const title =
    type === "income" ? "Yeni Para Girişi" : "Yeni Para Çıkışı";

  const descriptionText =
    type === "income"
      ? "Kasa veya banka hesabına manuel para girişi kaydedin."
      : "Kasa veya banka hesabından manuel para çıkışı kaydedin.";

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: "100vw", sm: 480 }, p: 3 }}>
        <Stack spacing={2.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" fontWeight={900}>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {descriptionText}
              </Typography>
            </Box>

            <Button onClick={onClose} startIcon={<IconX size={18} />}>
              Kapat
            </Button>
          </Stack>

          <Divider />

          <AccountingSelectField
            label="Hareket Türü"
            value={type}
            onChange={(event) =>
              setType(event.target.value as CashTransactionCreatePayload["type"])
            }
          >
            <MenuItem value="income">
              <Stack direction="row" spacing={1} alignItems="center">
                <IconArrowDownLeft size={18} />
                <span>Para Girişi</span>
              </Stack>
            </MenuItem>

            <MenuItem value="expense">
              <Stack direction="row" spacing={1} alignItems="center">
                <IconArrowUpRight size={18} />
                <span>Para Çıkışı</span>
              </Stack>
            </MenuItem>
          </AccountingSelectField>

          <AccountingSelectField
            label="Hesap"
            value={accountId}
            onChange={(event) => {
              const nextAccountId = event.target.value;
              const account = accounts.find((item) => item.id === nextAccountId);

              setAccountId(nextAccountId);
              setCurrency(account?.currency ?? "TRY");
            }}
          >
            {accounts.map((account) => (
              <MenuItem key={account.id} value={account.id}>
                {account.name} · {account.type === "cash" ? "Kasa" : "Banka"}
              </MenuItem>
            ))}
          </AccountingSelectField>

          {selectedAccount && (
            <Typography variant="caption" color="text.secondary">
              Seçili hesap bakiyesi:{" "}
              <strong>
                {selectedAccount.balance.toLocaleString("tr-TR")}{" "}
                {selectedAccount.currency}
              </strong>
            </Typography>
          )}

          <TextField
            size="small"
            label="Tutar"
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
            label="Tarih"
            type="datetime-local"
            value={occurredAt}
            onChange={(event) => setOccurredAt(event.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <AccountingSelectField
            label="Kaynak"
            value={sourceModule}
            onChange={(event) =>
              setSourceModule(
                event.target.value as CashTransactionCreatePayload["sourceModule"],
              )
            }
          >
            <MenuItem value="manual">Manuel</MenuItem>
            <MenuItem value="payment">Tahsilat</MenuItem>
            <MenuItem value="expense">Gider</MenuItem>
            <MenuItem value="income">Gelir</MenuItem>
          </AccountingSelectField>

          <TextField
            size="small"
            label="Referans No"
            value={sourceReference}
            onChange={(event) => setSourceReference(event.target.value)}
            fullWidth
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
            onClick={handleSubmit}
            disabled={!accountId || !amount || Number(amount) <= 0 || !description.trim()}
          >
            Hareketi Kaydet
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}