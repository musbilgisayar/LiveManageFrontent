"use client";

import { Box, MenuItem, Stack, TextField } from "@mui/material";

import { useI18nNs } from "@/app/context/i18nContext";
import { useAddressCountries } from "@/modules/users/hooks/useAddressCountries";
import { useAddressHierarchy } from "@/modules/users/hooks/useAddressHierarchy";

import InlineNotice from "./shared/InlineNotice";
import { premiumFieldSx } from "./constants";

import type {
  ManagementApplicationAddressForm as AddressForm,
  ManagementApplicationFormErrors as FormErrors,
} from "../../types/managementApplication.types";

type AddressHierarchySectionProps = {
  value: AddressForm;
  onChange: (next: AddressForm) => void;
  errors: FormErrors;
};

const NS = "property:managementApplication.create.addressHierarchy";

export default function AddressHierarchySection({
  value,
  onChange,
  errors,
}: AddressHierarchySectionProps) {
  const { t } = useI18nNs(["property"]);

  const tr = (key: string, fallback: string) => {
    const fullKey = `${NS}.${key}`;
    const translated = t(fullKey);
    return translated && translated !== fullKey ? translated : fallback;
  };

  const {
    countries,
    isLoading: isCountriesLoading,
    errorMessage: countriesErrorMessage,
  } = useAddressCountries({
    includeAll: true,
    autoLoad: true,
  });

  const {
    provinces,
    districts,
    neighborhoods,
    isProvincesLoading,
    isDistrictsLoading,
    isNeighborhoodsLoading,
    errorMessage,
    setSelectedProvinceId,
    setSelectedDistrictId,
    setSelectedNeighborhoodId,
    clearAll,
    reloadProvinces,
  } = useAddressHierarchy({
    autoLoad: false,
  });

  const patch = (partial: Partial<AddressForm>) => {
    onChange({ ...value, ...partial });
  };

  const handleCountryChange = async (countryCode: string) => {
    const nextCountryCode = countryCode.trim().toUpperCase();

    const selectedCountry =
      countries.find(
        (item: { code: string; name: string }) =>
          item.code === nextCountryCode,
      ) ?? null;

    clearAll();
    await reloadProvinces(nextCountryCode);

    patch({
      countryCode: nextCountryCode,
      country: selectedCountry?.name ?? "",
      provinceId: "",
      districtId: "",
      neighborhoodId: "",
      city: "",
      district: "",
      neighborhood: "",
      street: "",
      buildingNumber: "",
      apartmentNumber: "",
      postalCode: "",
    });
  };

  const handleProvinceChange = async (provinceId: string) => {
    const nextProvinceId = provinceId.trim();

    const selectedProvince =
      provinces.find((item) => item.id === nextProvinceId) ?? null;

    await setSelectedProvinceId(nextProvinceId);

    patch({
      provinceId: nextProvinceId,
      city: selectedProvince?.name ?? "",
      districtId: "",
      neighborhoodId: "",
      district: "",
      neighborhood: "",
      street: "",
      buildingNumber: "",
      apartmentNumber: "",
      postalCode: "",
    });
  };

  const handleDistrictChange = async (districtId: string) => {
    const nextDistrictId = districtId.trim();

    const selectedDistrict =
      districts.find((item) => item.id === nextDistrictId) ?? null;

    await setSelectedDistrictId(nextDistrictId);

    patch({
      districtId: nextDistrictId,
      district: selectedDistrict?.name ?? "",
      neighborhoodId: "",
      neighborhood: "",
      street: "",
      buildingNumber: "",
      apartmentNumber: "",
      postalCode: "",
    });
  };

  const handleNeighborhoodChange = (neighborhoodId: string) => {
    const nextNeighborhoodId = neighborhoodId.trim();

    const selectedNeighborhood =
      neighborhoods.find((item) => item.id === nextNeighborhoodId) ?? null;

    setSelectedNeighborhoodId(nextNeighborhoodId);

    patch({
      neighborhoodId: nextNeighborhoodId,
      neighborhood: selectedNeighborhood?.name ?? "",
      postalCode: selectedNeighborhood?.postalCode ?? value.postalCode,
    });
  };

  const safeCountryCode = countries.some(
    (item: { code: string }) => item.code === value.countryCode,
  )
    ? value.countryCode
    : "";

  const getError = (field: keyof AddressForm) => errors[`address.${field}`];

  const loadingText = tr("loading", "Yükleniyor...");

  const summaryText =
    [
      value.neighborhood,
      value.street,
      value.buildingNumber ? `No:${value.buildingNumber}` : "",
      value.apartmentNumber ? `D:${value.apartmentNumber}` : "",
      value.district,
      value.city,
      value.postalCode,
    ]
      .filter(Boolean)
      .join(", ") || tr("summaryEmpty", "Henüz adres tamamlanmadı");

  return (
    <Stack spacing={2}>
      {(errorMessage || countriesErrorMessage) && (
        <InlineNotice tone="warning">
          {errorMessage || countriesErrorMessage}
        </InlineNotice>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, minmax(0, 1fr))",
            xl: "repeat(3, minmax(0, 1fr))",
          },
          gap: 2,
        }}
      >
        <TextField
          select
          label={tr("country", "Ülke")}
          value={safeCountryCode}
          onChange={(event) => void handleCountryChange(event.target.value)}
          disabled={isCountriesLoading}
          helperText={isCountriesLoading ? loadingText : " "}
          fullWidth
          sx={premiumFieldSx}
        >
          <MenuItem value="">
            {tr("countryPlaceholder", "Ülke seçiniz")}
          </MenuItem>

          {countries.map(
            (country: {
              code: string;
              name: string;
              flagEmoji?: string | null;
            }) => (
              <MenuItem key={country.code} value={country.code}>
                {country.flagEmoji ? `${country.flagEmoji} ` : ""}
                {country.name}
              </MenuItem>
            ),
          )}
        </TextField>

        <TextField
          label={tr("countryCode", "Ülke kodu")}
          value={value.countryCode}
          InputProps={{ readOnly: true }}
          error={!!getError("countryCode")}
          helperText={getError("countryCode") ?? " "}
          fullWidth
          sx={premiumFieldSx}
        />

        <TextField
          select
          label={tr("province", "İl")}
          value={value.provinceId}
          onChange={(event) => void handleProvinceChange(event.target.value)}
          disabled={!value.countryCode || isProvincesLoading}
          error={!!getError("provinceId")}
          helperText={
            getError("provinceId") ?? (isProvincesLoading ? loadingText : " ")
          }
          fullWidth
          sx={premiumFieldSx}
        >
          <MenuItem value="">
            {tr("provincePlaceholder", "İl seçiniz")}
          </MenuItem>

          {provinces.map((province) => (
            <MenuItem key={province.id} value={province.id}>
              {province.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label={tr("district", "İlçe")}
          value={value.districtId}
          onChange={(event) => void handleDistrictChange(event.target.value)}
          disabled={!value.provinceId || isDistrictsLoading}
          error={!!getError("districtId")}
          helperText={
            getError("districtId") ?? (isDistrictsLoading ? loadingText : " ")
          }
          fullWidth
          sx={premiumFieldSx}
        >
          <MenuItem value="">
            {tr("districtPlaceholder", "İlçe seçiniz")}
          </MenuItem>

          {districts.map((district) => (
            <MenuItem key={district.id} value={district.id}>
              {district.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label={tr("neighborhood", "Mahalle / Köy")}
          value={value.neighborhoodId}
          onChange={(event) => handleNeighborhoodChange(event.target.value)}
          disabled={!value.districtId || isNeighborhoodsLoading}
          error={!!getError("neighborhoodId")}
          helperText={
            getError("neighborhoodId") ??
            (isNeighborhoodsLoading ? loadingText : " ")
          }
          fullWidth
          sx={premiumFieldSx}
        >
          <MenuItem value="">
            {tr("neighborhoodPlaceholder", "Mahalle / köy seçiniz")}
          </MenuItem>

          {neighborhoods.map((neighborhood) => (
            <MenuItem key={neighborhood.id} value={neighborhood.id}>
              {neighborhood.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label={tr("street", "Cadde / Sokak")}
          value={value.street}
          onChange={(event) => patch({ street: event.target.value })}
          error={!!getError("street")}
          helperText={getError("street") ?? " "}
          fullWidth
          sx={premiumFieldSx}
        />

        <TextField
          label={tr("buildingNumber", "Bina no")}
          value={value.buildingNumber}
          onChange={(event) => patch({ buildingNumber: event.target.value })}
          error={!!getError("buildingNumber")}
          helperText={getError("buildingNumber") ?? " "}
          fullWidth
          sx={premiumFieldSx}
        />

        <TextField
          label={tr("apartmentNumber", "Daire / Kapı no")}
          value={value.apartmentNumber}
          onChange={(event) => patch({ apartmentNumber: event.target.value })}
          helperText={tr("optional", "Opsiyonel")}
          fullWidth
          sx={premiumFieldSx}
        />

        <TextField
          label={tr("postalCode", "Posta kodu")}
          value={value.postalCode}
          onChange={(event) => patch({ postalCode: event.target.value })}
          error={!!getError("postalCode")}
          helperText={getError("postalCode") ?? " "}
          fullWidth
          sx={premiumFieldSx}
        />
      </Box>

      <InlineNotice tone="info">
        {tr("summary", "Adres özeti")}: {summaryText}
      </InlineNotice>
    </Stack>
  );
}