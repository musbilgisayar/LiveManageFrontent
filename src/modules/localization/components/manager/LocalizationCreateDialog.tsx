"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import type { LocalizationLanguageItem } from "../../types/LocalizationManager.types";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (
    namespace: string,
    key: string,
    values: Record<string, string>
  ) => Promise<void>;
  languages: LocalizationLanguageItem[];
  defaultNs: string;
  saving: boolean;
};

export default function LocalizationCreateDialog({
  open,
  onClose,
  onCreate,
  languages,
  defaultNs,
  saving,
}: Props) {
  const [namespace, setNamespace] = useState(defaultNs);
  const [key, setKey] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setNamespace(defaultNs);
    }
  }, [open, defaultNs]);

  const handleCreate = async () => {
    await onCreate(namespace, key, values);
    setKey("");
    setValues({});
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Yeni Anahtar</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Namespace"
              value={namespace}
              onChange={(event) => setNamespace(event.target.value)}
              size="small"
              sx={{ minWidth: 220 }}
            />

            <TextField
              label="Key"
              value={key}
              onChange={(event) => setKey(event.target.value)}
              size="small"
              sx={{ flex: 1 }}
            />
          </Stack>

          <Typography variant="caption" color="text.secondary">
            Oluşacak key: <b>{namespace}:{key}</b>
          </Typography>

          <Divider />

          {languages.map((language) => (
            <TextField
              key={language.cultureCode}
              fullWidth
              size="small"
              label={`${language.name} (${language.cultureCode})`}
              value={values[language.cultureCode] ?? ""}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  [language.cultureCode]: event.target.value,
                }))
              }
            />
          ))}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        <Button variant="contained" disabled={saving} onClick={handleCreate}>
          {saving ? "Kaydediliyor..." : "Oluştur"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}