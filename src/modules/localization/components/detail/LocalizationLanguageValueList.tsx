"use client";

import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import LocalizationLanguageRow from "@/modules/localization/components/detail/LocalizationLanguageRow";
import type { LanguageItem } from "@/modules/localization/services/localizationService";
import type { LocalizationValueMap } from "@/modules/localization/types/LocalizationDetail.types";

type LocalizationLanguageValueListProps = {
  languages: LanguageItem[];
  values: LocalizationValueMap;
  loading: boolean;
  saving: boolean;
  t: (key: string) => string;
  onValueChange: (culture: string, value: string) => void;
  onSaveAll: () => void;
};

export default function LocalizationLanguageValueList({
  languages,
  values,
  loading,
  saving,
  t,
  onValueChange,
  onSaveAll,
}: LocalizationLanguageValueListProps) {
  return (
    <Card>
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="h6">
            {t("localization:detail.allLanguages.title") || "Tüm Diller"}
          </Typography>

          <Button
            variant="contained"
            disabled={saving || loading}
            startIcon={saving ? <CircularProgress size={16} /> : undefined}
            onClick={onSaveAll}
          >
            {t("localization:detail.actions.saveAllLanguages") ||
              "Kaydet (Tüm Diller)"}
          </Button>
        </Stack>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={2} divider={<Divider />}>
            {languages.map((language) => (
              <LocalizationLanguageRow
                key={language.cultureCode}
                language={language}
                value={values[language.cultureCode] ?? ""}
                label={t("localization:detail.fields.value") || "Value"}
                defaultLabel={t("common:default") || "Varsayılan"}
                onChange={onValueChange}
              />
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}