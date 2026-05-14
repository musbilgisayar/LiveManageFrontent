"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
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
import LocalizationLanguageRow from "@/modules/localization/components/detail/LocalizationLanguageRow";
import type { LanguageItem } from "@/modules/localization/services/localizationService";
import type { LocalizationValueMap } from "@/modules/localization/types/LocalizationDetail.types";
import { composeLocalizationKey } from "@/modules/localization/utils/localizationDetail.utils";

type LocalizationCreateKeyDialogProps = {
  open: boolean;
  initialNamespace: string;
  languages: LanguageItem[];
  saving: boolean;
  t: (key: string) => string;
  onClose: () => void;
  onCreate: (params: {
    namespace: string;
    key: string;
    values: LocalizationValueMap;
  }) => Promise<boolean>;
};

export default function LocalizationCreateKeyDialog({
  open,
  initialNamespace,
  languages,
  saving,
  t,
  onClose,
  onCreate,
}: LocalizationCreateKeyDialogProps) {
  const [namespace, setNamespace] = useState(initialNamespace);
  const [key, setKey] = useState("");
  const [values, setValues] = useState<LocalizationValueMap>({});

  useEffect(() => {
    if (open) {
      setNamespace(initialNamespace);
    }
  }, [open, initialNamespace]);

  const handleCreate = async () => {
    const success = await onCreate({
      namespace,
      key,
      values,
    });

    if (!success) return;

    setKey("");
    setValues({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {t("localization:detail.dialog.create.title") || "Yeni Anahtar Ekle"}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label={
                t("localization:detail.dialog.create.namespaceLabel") ||
                "Namespace"
              }
              value={namespace}
              onChange={(event) => setNamespace(event.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
            />

            <TextField
              label={
                t("localization:detail.dialog.create.keyLabel") ||
                "Key (ns olmadan)"
              }
              value={key}
              onChange={(event) => setKey(event.target.value)}
              size="small"
              sx={{ flex: 1 }}
            />
          </Stack>

          <Typography variant="caption" color="text.secondary">
            {t("localization:detail.dialog.create.composedKeyLabel") ||
              "Oluşacak tam anahtar:"}{" "}
            <Box component="b">
              {composeLocalizationKey(namespace, key)}
            </Box>
          </Typography>

          <Divider />

          <Typography variant="subtitle1">
            {t("localization:detail.dialog.create.valuesTitle") ||
              "Değerler (Tüm Diller)"}
          </Typography>

          <Stack spacing={2} divider={<Divider />}>
            {languages.map((language) => (
              <LocalizationLanguageRow
                key={language.cultureCode}
                language={language}
                value={values[language.cultureCode] ?? ""}
                label={
                  t("localization:detail.dialog.create.valueLabel") || "Değer"
                }
                defaultLabel={t("common:default") || "Varsayılan"}
                onChange={(culture, value) =>
                  setValues((prev) => ({
                    ...prev,
                    [culture]: value,
                  }))
                }
              />
            ))}

          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          {t("common:cancel") || "İptal"}
        </Button>

        <Button variant="contained" onClick={handleCreate} disabled={saving}>
          {saving
            ? t("common:saving") || "Kaydediliyor..."
            : t("localization:detail.dialog.create.createButton") ||
            "Oluştur"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}