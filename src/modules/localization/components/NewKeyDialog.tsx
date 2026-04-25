// src/modules/localization/components/NewKeyDialog.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Stack,
  TextField,
  Divider,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { useI18nNs } from "@/app/context/i18nContext";

interface LanguageItem {
  cultureCode: string;
  name: string;
  flagEmoji: string;
  isDefault: boolean;
}

type ValueMap = Record<string, string>;

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (ns: string, key: string, values: ValueMap) => Promise<void>;
  languages: LanguageItem[];
  defaultNs?: string;
  saving?: boolean;
}

export default function NewKeyDialog({
  open,
  onClose,
  onCreate,
  languages,
  defaultNs = "common",
  saving = false,
}: Props) {
  const { t } = useI18nNs("localization");

  const [createNs, setCreateNs] = useState(defaultNs);
  const [createKey, setCreateKey] = useState("");
  const [createValues, setCreateValues] = useState<ValueMap>({});

  const tr = useCallback(
    (key: string, fallback: string) => {
      const value = t(key);
      return value === `[${key}]` ? fallback : value;
    },
    [t]
  );

  useEffect(() => {
    if (!open) return;

    setCreateNs(defaultNs);
    setCreateKey("");
    setCreateValues({});
  }, [open, defaultNs]);

  const composedKey = useMemo(() => {
    const ns = createNs.trim();
    const key = createKey.trim();
    return `${ns}:${key}`;
  }, [createNs, createKey]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {tr("localization:newKeyDialog.title", "Yeni Anahtar Ekle")}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label={tr("localization:newKeyDialog.namespaceLabel", "Namespace")}
              value={createNs}
              onChange={(event) => setCreateNs(event.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
            />

            <TextField
              label={tr(
                "localization:newKeyDialog.keyLabel",
                "Key (namespace olmadan)"
              )}
              value={createKey}
              onChange={(event) => setCreateKey(event.target.value)}
              size="small"
              sx={{ flex: 1 }}
            />
          </Stack>

          <Typography variant="caption" color="text.secondary">
            {tr(
              "localization:newKeyDialog.composedKeyLabel",
              "Oluşacak tam anahtar:"
            )}{" "}
            <b>{composedKey}</b>
          </Typography>

          <Divider />

          <Typography variant="subtitle1">
            {tr(
              "localization:newKeyDialog.valuesTitle",
              "Değerler (Tüm Diller)"
            )}
          </Typography>

          <Stack spacing={2} divider={<Divider />}>
            {languages.map((lang) => (
              <Stack
                key={lang.cultureCode}
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems="center"
              >
                <Box sx={{ width: 220, display: "flex", alignItems: "center" }}>
                  <span style={{ fontSize: 20, marginRight: 8 }}>
                    {lang.flagEmoji ?? "🏳️"}
                  </span>

                  <div>
                    <Typography variant="subtitle2">{lang.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {lang.cultureCode}
                      {lang.isDefault
                        ? ` • ${tr(
                            "localization:newKeyDialog.defaultLanguageBadge",
                            "Varsayılan"
                          )}`
                        : ""}
                    </Typography>
                  </div>
                </Box>

                <TextField
                  fullWidth
                  size="small"
                  label={tr("localization:newKeyDialog.valueLabel", "Değer")}
                  placeholder={tr(
                    "localization:newKeyDialog.valuePlaceholder",
                    "Çeviri değerini girin"
                  )}
                  value={createValues[lang.cultureCode] ?? ""}
                  onChange={(event) =>
                    setCreateValues((prev) => ({
                      ...prev,
                      [lang.cultureCode]: event.target.value,
                    }))
                  }
                />
              </Stack>
            ))}
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          {tr("localization:newKeyDialog.cancelButton", "İptal")}
        </Button>

        <Button
          variant="contained"
          onClick={() => onCreate(createNs, createKey, createValues)}
          disabled={saving}
        >
          {saving
            ? tr("localization:newKeyDialog.savingButton", "Kaydediliyor...")
            : tr("localization:newKeyDialog.createButton", "Oluştur")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}