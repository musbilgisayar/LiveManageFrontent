//src/modules/muhasebe/components/cash-bank/CashAccountCreateDrawer.tsx
"use client";

import React, { useState } from "react";
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
import { IconBuildingBank, IconCash, IconX } from "@tabler/icons-react";

import AccountingSelectField from "@/modules/muhasebe/components/shared/AccountingSelectField";
import type { CashBankAccountType } from "@/modules/muhasebe/types/CashBank.types";

export interface CashAccountCreatePayload {
  name: string;
  code: string;
  type: CashBankAccountType;
  bankName?: string;
  iban?: string;
  currency: string;
  openingBalance: number;
  description?: string;
}

interface CashAccountCreateDrawerProps {
  open: boolean;
  defaultType: CashBankAccountType;
  onClose: () => void;
  onCreated: (payload: CashAccountCreatePayload) => void;
}

export default function CashAccountCreateDrawer({
  open,
  defaultType,
  onClose,
  onCreated,
}: CashAccountCreateDrawerProps) {
  const [type, setType] = useState<CashBankAccountType>(defaultType);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [iban, setIban] = useState("");
  const [currency, setCurrency] = useState("TRY");
  const [openingBalance, setOpeningBalance] = useState("0");
  const [description, setDescription] = useState("");

  const isBank = type === "bank";

  const handleSubmit = () => {
    onCreated({
      name,
      code,
      type,
      bankName: isBank ? bankName : undefined,
      iban: isBank ? iban : undefined,
      currency,
      openingBalance: Number(openingBalance || 0),
      description,
    });

    onClose();
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: "100vw", sm: 460 }, p: 3 }}>
        <Stack spacing={2.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" fontWeight={900}>
                Yeni Hesap Oluştur
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Kasa veya banka hesabı tanımlayın.
              </Typography>
            </Box>

            <Button onClick={onClose} startIcon={<IconX size={18} />}>
              Kapat
            </Button>
          </Stack>

          <Divider />

          <AccountingSelectField
            label="Hesap Türü"
            value={type}
            onChange={(event) => setType(event.target.value as CashBankAccountType)}
          >
            <MenuItem value="cash">
              <Stack direction="row" spacing={1} alignItems="center">
                <IconCash size={18} />
                <span>Kasa</span>
              </Stack>
            </MenuItem>

            <MenuItem value="bank">
              <Stack direction="row" spacing={1} alignItems="center">
                <IconBuildingBank size={18} />
                <span>Banka</span>
              </Stack>
            </MenuItem>
          </AccountingSelectField>

          <TextField
            size="small"
            label="Hesap Adı"
            value={name}
            onChange={(event) => setName(event.target.value)}
            fullWidth
          />

          <TextField
            size="small"
            label="Hesap Kodu"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            fullWidth
          />

          {isBank && (
            <>
              <TextField
                size="small"
                label="Banka Adı"
                value={bankName}
                onChange={(event) => setBankName(event.target.value)}
                fullWidth
              />

              <TextField
                size="small"
                label="IBAN"
                value={iban}
                onChange={(event) => setIban(event.target.value)}
                fullWidth
              />
            </>
          )}

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
            label="Açılış Bakiyesi"
            type="number"
            value={openingBalance}
            onChange={(event) => setOpeningBalance(event.target.value)}
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
            disabled={!name.trim() || !code.trim()}
          >
            Hesabı Oluştur
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}