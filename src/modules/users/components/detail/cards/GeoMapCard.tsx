"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  CardContent,
  Grid,
  Stack,
  Typography,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import BlankCard from "@/app/components/shared/BlankCard";
import CustomFormLabel from "@/app/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/app/components/forms/theme-elements/CustomTextField";
import CustomSelect from "@/app/components/forms/theme-elements/CustomSelect";
import { useI18nNs } from "@/app/context/i18nContext";
import { SelectChangeEvent } from "@mui/material/Select";

export default function GeoMapCard() {
  const { t } = useI18nNs(["account", "common"]);

  const [country, setCountry] = useState("tr");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState<number>(39.925533);
  const [longitude, setLongitude] = useState<number>(32.866287);
  const [loading, setLoading] = useState(false);

  const countries = [
    { value: "tr", label: "Türkiye" },
    { value: "de", label: "Almanya" },
    { value: "ch", label: "İsviçre" },
    { value: "us", label: "Amerika" },
  ];

  const handleSave = async () => {
    setLoading(true);
    try {
      await fetch("/api/v1.0/profile/address", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country,
          city,
          district,
          postalCode,
          description,
          latitude,
          longitude,
        }),
      });
      alert(t("common:alert.saved", { defaultValue: "Adres kaydedildi." }));
    } catch {
      alert(t("common:alert.error", { defaultValue: "Bir hata oluştu." }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <BlankCard>
      <CardContent>
        <Typography variant="h5" mb={1}>
          {t("account:geo.title", { defaultValue: "Konum ve Adres Bilgileri" })}
        </Typography>
        <Typography color="textSecondary" mb={3}>
          {t("account:geo.desc", {
            defaultValue: "Adres ve konum bilgilerinizi girin veya güncelleyin.",
          })}
        </Typography>

        <Grid container spacing={3}>
          {/* Ülke */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomFormLabel>
              {t("account:geo.country", { defaultValue: "Ülke" })}
            </CustomFormLabel>
            <CustomSelect
              value={country}
              onChange={(e: SelectChangeEvent<string>) =>
                setCountry(e.target.value)
              }
              fullWidth
            >
              {countries.map((c) => (
                <MenuItem key={c.value} value={c.value}>
                  {c.label}
                </MenuItem>
              ))}
            </CustomSelect>
          </Grid>

          {/* Şehir */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomFormLabel>
              {t("account:geo.city", { defaultValue: "Şehir" })}
            </CustomFormLabel>
            <CustomTextField
              value={city}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCity(e.target.value)
              }
              fullWidth
            />
          </Grid>

          {/* İlçe */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomFormLabel>
              {t("account:geo.district", { defaultValue: "İlçe / Semt" })}
            </CustomFormLabel>
            <CustomTextField
              value={district}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setDistrict(e.target.value)
              }
              fullWidth
            />
          </Grid>

          {/* Posta Kodu */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomFormLabel>
              {t("account:geo.postalCode", { defaultValue: "Posta Kodu" })}
            </CustomFormLabel>
            <CustomTextField
              value={postalCode}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPostalCode(e.target.value)
              }
              fullWidth
            />
          </Grid>

          {/* Açıklama */}
          <Grid size={{ xs: 12 }}>
            <CustomFormLabel>
              {t("account:geo.description", { defaultValue: "Adres Açıklaması" })}
            </CustomFormLabel>
            <CustomTextField
              multiline
              rows={2}
              value={description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setDescription(e.target.value)
              }
              fullWidth
            />
          </Grid>

          {/* Koordinatlar */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomFormLabel>
              {t("account:geo.latitude", { defaultValue: "Enlem (Latitude)" })}
            </CustomFormLabel>
            <CustomTextField
              type="number"
              value={latitude}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setLatitude(parseFloat(e.target.value))
              }
              fullWidth
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomFormLabel>
              {t("account:geo.longitude", { defaultValue: "Boylam (Longitude)" })}
            </CustomFormLabel>
            <CustomTextField
              type="number"
              value={longitude}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setLongitude(parseFloat(e.target.value))
              }
              fullWidth
            />
          </Grid>

          {/* Harita Placeholder */}
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                mt: 2,
                height: 300,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "grey.100",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography color="textSecondary">
                🗺️ {t("account:geo.mapPlaceholder", { defaultValue: "Harita buraya gelecek" })}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Kaydet Butonu */}
        <Stack direction="row" justifyContent="end" mt={3}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading}
            startIcon={loading && <CircularProgress size={16} />}
          >
            {t("common:button.save", { defaultValue: "Kaydet" })}
          </Button>
        </Stack>
      </CardContent>
    </BlankCard>
  );
}
