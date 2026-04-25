// src/modules/users/components/detail/cards/address-manager/dialogs/AddressCreateDialog.tsx
//bu dosya, AddressCreateDialog bileşenini içerir ve kullanıcıların adres bilgilerini oluşturmak veya düzenlemek için kullanılan bir dialog penceresidir. Bu bileşen, adres formunu yönetir, kullanıcı girişlerini işler, doğrulama yapar ve form gönderildiğinde gerekli verileri üst bileşene ileterek adres oluşturma veya güncelleme işlemini gerçekleştirir. Ayrıca, adres hiyerarşisi (ülke, il, ilçe, mahalle) ve ilgili verilerin yüklenmesi gibi işlemleri de yönetir.
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Switch,
  TextField,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useI18nNs } from "@/app/context/i18nContext";
import { useAddressHierarchy } from "../../../../../hooks/useAddressHierarchy";
import { useAddressCountries } from "../../../../../hooks/useAddressCountries";

export type AddressCreateForm = {
  country: string;
  countryCode: string;
  city: string;
  district: string;
  neighborhood: string;
  street: string;
  buildingNumber: string;
  apartmentNumber: string;
  postalCode: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  addressType: number;
  isPrimary: boolean;
  validFrom: string;
  validTo: string | null;
  provinceId: string;
  districtId: string;
  neighborhoodId: string;
};

type FieldErrors = Partial<
  Record<
    keyof AddressCreateForm | "provinceId" | "districtId" | "neighborhoodId",
    string[]
  >
>;

type Props = {
  open: boolean;
  mode?: "create" | "edit";
  initialValues?: Partial<AddressCreateForm> | null;
  backendErrors?: FieldErrors | null;
  onClose: () => void;
  onSubmit: (form: AddressCreateForm) => Promise<void>;
};

const createDefaultForm = (): AddressCreateForm => ({
  country: "",
  countryCode: "CH",
  city: "",
  district: "",
  neighborhood: "",
  street: "",
  buildingNumber: "",
  apartmentNumber: "",
  postalCode: "",
  description: "",
  latitude: null,
  longitude: null,
  addressType: 1,
  isPrimary: true,
  validFrom: new Date().toISOString(),
  validTo: null,
  provinceId: "",
  districtId: "",
  neighborhoodId: "",
});

export default function AddressCreateDialog({
  open,
  mode = "create",
  initialValues,
  backendErrors,
  onClose,
  onSubmit,
}: Props) {
  const { t } = useI18nNs(["users", "common"]);

  const mergedInitialForm = useMemo<AddressCreateForm>(() => {
    const defaultForm = createDefaultForm();

    return {
      ...defaultForm,
      ...(initialValues ?? {}),
      validFrom: initialValues?.validFrom ?? defaultForm.validFrom,
      validTo:
        initialValues?.validTo !== undefined
          ? initialValues.validTo
          : defaultForm.validTo,
      countryCode: (initialValues?.countryCode ?? defaultForm.countryCode)
        .trim()
        .toUpperCase(),
      provinceId: (initialValues?.provinceId ?? "").trim(),
      districtId: (initialValues?.districtId ?? "").trim(),
      neighborhoodId: (initialValues?.neighborhoodId ?? "").trim(),
    };
  }, [initialValues]);

  const [form, setForm] = useState<AddressCreateForm>(mergedInitialForm);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<
    Partial<Record<keyof AddressCreateForm, boolean>>
  >({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const hydratedEditKeyRef = useRef<string | null>(null);
  const isHydratingEditRef = useRef(false);

  const {
    countries,
    isLoading: isCountriesLoading,
    errorMessage: countriesErrorMessage,
  } = useAddressCountries({
    includeAll: true,
    autoLoad: open,
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

  const safeCountryCode = countries.some(
    (item: { code: string }) => item.code === form.countryCode
  )
    ? form.countryCode
    : "";

  useEffect(() => {
    if (!open) return;

    setForm(mergedInitialForm);
    setTouched({});
    setSubmitAttempted(false);
    hydratedEditKeyRef.current = null;
  }, [open, mergedInitialForm]);

  useEffect(() => {
    if (!open) {
      clearAll();
      hydratedEditKeyRef.current = null;
    }
  }, [open, clearAll]);

useEffect(() => {
  if (!open || mode !== "edit") return;

  const hydrateKey = [
    mergedInitialForm.countryCode,
    mergedInitialForm.provinceId,
    mergedInitialForm.districtId,
    mergedInitialForm.neighborhoodId,
  ].join("|");

  if (hydratedEditKeyRef.current === hydrateKey || isHydratingEditRef.current) {
    return;
  }

  hydratedEditKeyRef.current = hydrateKey;
  isHydratingEditRef.current = true;

  const hydrateHierarchyForEdit = async () => {
    try {
      const countryCode = mergedInitialForm.countryCode?.trim().toUpperCase();
      const provinceId = mergedInitialForm.provinceId?.trim();
      const districtId = mergedInitialForm.districtId?.trim();
      const neighborhoodId = mergedInitialForm.neighborhoodId?.trim();

      if (!countryCode) return;

      clearAll();

      await reloadProvinces(countryCode);

      if (provinceId) {
        await setSelectedProvinceId(provinceId);
      }

      if (districtId) {
        await setSelectedDistrictId(districtId);
      }

      if (neighborhoodId) {
        setSelectedNeighborhoodId(neighborhoodId);
      }

      setForm((prev) => ({
        ...prev,
        countryCode,
        provinceId: provinceId ?? "",
        districtId: districtId ?? "",
        neighborhoodId: neighborhoodId ?? "",
      }));
    } finally {
      isHydratingEditRef.current = false;
    }
  };

  void hydrateHierarchyForEdit();
}, [
  open,
  mode,
  mergedInitialForm.countryCode,
  mergedInitialForm.provinceId,
  mergedInitialForm.districtId,
  mergedInitialForm.neighborhoodId,
  clearAll,
  reloadProvinces,
  setSelectedProvinceId,
  setSelectedDistrictId,
  setSelectedNeighborhoodId,
]);

  const compactFieldSx = {
    "& .MuiOutlinedInput-root": {
      height: 40,
    },
    "& .MuiInputBase-input": {
      fontSize: 14,
      py: 1,
    },
    "& .MuiSelect-select": {
      display: "flex",
      alignItems: "center",
      minHeight: "unset",
      py: 1,
      fontSize: 14,
    },
    "& .MuiFormHelperText-root": {
      minHeight: 20,
      mt: 0.5,
    },
  } as const;

  const multilineFieldSx = {
    "& .MuiInputBase-input": {
      fontSize: 14,
    },
    "& .MuiFormHelperText-root": {
      minHeight: 20,
      mt: 0.5,
    },
  } as const;

  const handleChange = <K extends keyof AddressCreateForm>(
    key: K,
    value: AddressCreateForm[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const handleCountryChange = async (countryCode: string) => {
    const nextCountryCode = countryCode.trim().toUpperCase();
    const selectedCountry =
      countries.find(
        (item: { code: string; name: string }) => item.code === nextCountryCode
      ) ?? null;

    clearAll();
    await reloadProvinces(nextCountryCode);

    setForm((prev) => ({
      ...prev,
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
    }));

    setTouched((prev) => ({
      ...prev,
      countryCode: true,
      provinceId: true,
      districtId: true,
      neighborhoodId: true,
    }));
  };

  const handleProvinceChange = async (provinceId: string) => {
    const nextProvinceId = provinceId.trim();
    const selectedProvince =
      provinces.find((item) => item.id === nextProvinceId) ?? null;

    await setSelectedProvinceId(nextProvinceId);

    setForm((prev) => ({
      ...prev,
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
    }));

    setTouched((prev) => ({
      ...prev,
      provinceId: true,
      districtId: true,
      neighborhoodId: true,
    }));
  };

  const handleDistrictChange = async (districtId: string) => {
    const nextDistrictId = districtId.trim();
    const selectedDistrict =
      districts.find((item) => item.id === nextDistrictId) ?? null;

    await setSelectedDistrictId(nextDistrictId);

    setForm((prev) => ({
      ...prev,
      districtId: nextDistrictId,
      district: selectedDistrict?.name ?? "",
      neighborhoodId: "",
      neighborhood: "",
      street: "",
      buildingNumber: "",
      apartmentNumber: "",
      postalCode: "",
    }));

    setTouched((prev) => ({
      ...prev,
      districtId: true,
      neighborhoodId: true,
    }));
  };

  const handleNeighborhoodChange = (neighborhoodId: string) => {
    const nextNeighborhoodId = neighborhoodId.trim();
    const selectedNeighborhood =
      neighborhoods.find((item) => item.id === nextNeighborhoodId) ?? null;

    setSelectedNeighborhoodId(nextNeighborhoodId);

    setForm((prev) => ({
      ...prev,
      neighborhoodId: nextNeighborhoodId,
      neighborhood: selectedNeighborhood?.name ?? "",
      postalCode: selectedNeighborhood?.postalCode ?? prev.postalCode,
    }));

    setTouched((prev) => ({
      ...prev,
      neighborhoodId: true,
      postalCode: true,
    }));
  };

  const clientErrors: FieldErrors = {
    ...(form.provinceId
      ? {}
      : {
          provinceId: [
            t("users:detail.addressValidation.provinceRequired", {
              defaultValue: "İl seçilmelidir.",
            }),
          ],
        }),
    ...(form.districtId
      ? {}
      : {
          districtId: [
            t("users:detail.addressValidation.districtRequired", {
              defaultValue: "İlçe seçilmelidir.",
            }),
          ],
        }),
    ...(form.neighborhoodId
      ? {}
      : {
          neighborhoodId: [
            t("users:detail.addressValidation.neighborhoodRequired", {
              defaultValue: "Mahalle / köy seçilmelidir.",
            }),
          ],
        }),
    ...(form.street.trim()
      ? {}
      : {
          street: [
            t("users:detail.addressValidation.streetRequired", {
              defaultValue: "Sokak zorunludur.",
            }),
          ],
        }),
    ...(form.buildingNumber.trim()
      ? {}
      : {
          buildingNumber: [
            t("users:detail.addressValidation.buildingNumberRequired", {
              defaultValue: "Bina numarası zorunludur.",
            }),
          ],
        }),
    ...(form.postalCode.trim()
      ? {}
      : {
          postalCode: [
            t("users:detail.addressValidation.postalCodeRequired", {
              defaultValue: "Posta kodu zorunludur.",
            }),
          ],
        }),
  };

  const mergedErrors: FieldErrors = {
    ...clientErrors,
    ...(backendErrors ?? {}),
  };

  const getFieldError = (field: keyof FieldErrors) => {
    const shouldShow =
      submitAttempted ||
      touched[field as keyof AddressCreateForm] ||
      field === "provinceId" ||
      field === "districtId" ||
      field === "neighborhoodId";

    if (!shouldShow) return undefined;

    const messages = mergedErrors[field];
    return messages?.[0];
  };

  const helperOrBlank = (value?: string) => value ?? " ";

  const isSubmitDisabled =
    loading ||
    isCountriesLoading ||
    isProvincesLoading ||
    isDistrictsLoading ||
    isNeighborhoodsLoading ||
    !form.countryCode ||
    !form.provinceId ||
    !form.districtId ||
    !form.neighborhoodId ||
    !form.street.trim() ||
    !form.buildingNumber.trim() ||
    !form.postalCode.trim();

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const handleSubmit = async () => {
    setSubmitAttempted(true);

    const hasClientErrors =
      !form.provinceId ||
      !form.districtId ||
      !form.neighborhoodId ||
      !form.street.trim() ||
      !form.buildingNumber.trim() ||
      !form.postalCode.trim();

    if (hasClientErrors) return;

    try {
      setLoading(true);
      await onSubmit(form);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>
        {mode === "edit"
          ? t("users:detail.addressEditDialog.title", {
              defaultValue: "Adresi Düzenle",
            })
          : t("users:detail.addressCreateDialog.title", {
              defaultValue: "Yeni Adres Ekle",
            })}
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={1.5} mt={0.5}>
          {errorMessage || countriesErrorMessage ? (
            <Grid size={{ xs: 12 }}>
              <Alert severity="error">
                {errorMessage || countriesErrorMessage}
              </Alert>
            </Grid>
          ) : null}

          <Grid size={{ xs: 12, md: 8 }}>
            <TextField
              select
              size="small"
              sx={compactFieldSx}
              label={t("users:detail.addressForm.country", {
                defaultValue: "Ülke",
              })}
              value={safeCountryCode}
              onChange={(e) => void handleCountryChange(e.target.value)}
              fullWidth
              disabled={isCountriesLoading || loading}
              helperText={helperOrBlank(
                isCountriesLoading
                  ? t("common:loading", { defaultValue: "Yükleniyor..." })
                  : undefined
              )}
            >
              <MenuItem value="">
                {t("users:detail.addressForm.selectCountry", {
                  defaultValue: "Ülke seçiniz",
                })}
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
                )
              )}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              size="small"
              sx={compactFieldSx}
              label={t("users:detail.addressForm.countryCode", {
                defaultValue: "Ülke Kodu",
              })}
              value={form.countryCode}
              fullWidth
              InputProps={{ readOnly: true }}
              helperText={helperOrBlank(undefined)}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              size="small"
              sx={compactFieldSx}
              label={t("users:detail.addressForm.city", {
                defaultValue: "Şehir",
              })}
              value={form.provinceId}
              onChange={(e) => void handleProvinceChange(e.target.value)}
              fullWidth
              disabled={!form.countryCode || isProvincesLoading || loading}
              error={!!getFieldError("provinceId")}
              helperText={helperOrBlank(
                getFieldError("provinceId") ??
                  (isProvincesLoading
                    ? t("common:loading", { defaultValue: "Yükleniyor..." })
                    : undefined)
              )}
            >
              <MenuItem value="">
                {t("users:detail.addressForm.selectProvince", {
                  defaultValue: "İl seçiniz",
                })}
              </MenuItem>

              {provinces.map((province) => (
                <MenuItem key={province.id} value={province.id}>
                  {province.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              size="small"
              sx={compactFieldSx}
              label={t("users:detail.addressForm.district", {
                defaultValue: "İlçe",
              })}
              value={form.districtId}
              onChange={(e) => void handleDistrictChange(e.target.value)}
              fullWidth
              disabled={!form.provinceId || isDistrictsLoading || loading}
              error={!!getFieldError("districtId")}
              helperText={helperOrBlank(
                getFieldError("districtId") ??
                  (isDistrictsLoading
                    ? t("common:loading", { defaultValue: "Yükleniyor..." })
                    : undefined)
              )}
            >
              <MenuItem value="">
                {t("users:detail.addressForm.selectDistrict", {
                  defaultValue: "İlçe seçiniz",
                })}
              </MenuItem>

              {districts.map((district) => (
                <MenuItem key={district.id} value={district.id}>
                  {district.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              size="small"
              sx={compactFieldSx}
              label={t("users:detail.addressForm.neighborhood", {
                defaultValue: "Mahalle / Köy",
              })}
              value={form.neighborhoodId}
              onChange={(e) => handleNeighborhoodChange(e.target.value)}
              fullWidth
              disabled={!form.districtId || isNeighborhoodsLoading || loading}
              error={!!getFieldError("neighborhoodId")}
              helperText={helperOrBlank(
                getFieldError("neighborhoodId") ??
                  (isNeighborhoodsLoading
                    ? t("common:loading", { defaultValue: "Yükleniyor..." })
                    : undefined)
              )}
            >
              <MenuItem value="">
                {t("users:detail.addressForm.selectNeighborhood", {
                  defaultValue: "Mahalle / köy seçiniz",
                })}
              </MenuItem>

              {neighborhoods.map((neighborhood) => (
                <MenuItem key={neighborhood.id} value={neighborhood.id}>
                  {neighborhood.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              size="small"
              sx={compactFieldSx}
              label={t("users:detail.addressForm.street", {
                defaultValue: "Sokak / Cadde",
              })}
              value={form.street}
              onChange={(e) => handleChange("street", e.target.value)}
              fullWidth
              error={!!getFieldError("street")}
              helperText={helperOrBlank(getFieldError("street"))}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              size="small"
              sx={compactFieldSx}
              label={t("users:detail.addressForm.buildingNumber", {
                defaultValue: "Bina No",
              })}
              value={form.buildingNumber}
              onChange={(e) => handleChange("buildingNumber", e.target.value)}
              fullWidth
              error={!!getFieldError("buildingNumber")}
              helperText={helperOrBlank(getFieldError("buildingNumber"))}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              size="small"
              sx={compactFieldSx}
              label={t("users:detail.addressForm.apartmentNumber", {
                defaultValue: "Daire No",
              })}
              value={form.apartmentNumber}
              onChange={(e) => handleChange("apartmentNumber", e.target.value)}
              fullWidth
              helperText={helperOrBlank(undefined)}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              size="small"
              sx={compactFieldSx}
              label={t("users:detail.addressForm.postalCode", {
                defaultValue: "Posta Kodu",
              })}
              value={form.postalCode}
              onChange={(e) => handleChange("postalCode", e.target.value)}
              fullWidth
              error={!!getFieldError("postalCode")}
              helperText={helperOrBlank(getFieldError("postalCode"))}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              size="small"
              sx={compactFieldSx}
              label={t("users:detail.addressForm.addressType", {
                defaultValue: "Adres Türü",
              })}
              value={form.addressType}
              onChange={(e) =>
                handleChange("addressType", Number(e.target.value))
              }
              fullWidth
              helperText={helperOrBlank(undefined)}
            >
              <MenuItem value={1}>
                {t("users:detail.addressTypes.home", {
                  defaultValue: "Ev",
                })}
              </MenuItem>
              <MenuItem value={2}>
                {t("users:detail.addressTypes.work", {
                  defaultValue: "İş",
                })}
              </MenuItem>
              <MenuItem value={3}>
                {t("users:detail.addressTypes.billing", {
                  defaultValue: "Fatura",
                })}
              </MenuItem>
              <MenuItem value={4}>
                {t("users:detail.addressTypes.other", {
                  defaultValue: "Diğer",
                })}
              </MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <FormControlLabel
              sx={{ mt: { xs: 0, md: 1 } }}
              control={
                <Switch
                  checked={form.isPrimary}
                  onChange={(e) => handleChange("isPrimary", e.target.checked)}
                />
              }
              label={t("users:detail.addressForm.isPrimary", {
                defaultValue: "Birincil adres",
              })}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              size="small"
              sx={multilineFieldSx}
              label={t("users:detail.addressForm.description", {
                defaultValue: "Açıklama",
              })}
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              multiline
              rows={2}
              fullWidth
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              size="small"
              sx={compactFieldSx}
              label={t("users:detail.addressForm.latitude", {
                defaultValue: "Enlem",
              })}
              value={form.latitude ?? ""}
              onChange={(e) =>
                handleChange(
                  "latitude",
                  e.target.value === "" ? null : Number(e.target.value)
                )
              }
              fullWidth
              helperText={helperOrBlank(undefined)}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              size="small"
              sx={compactFieldSx}
              label={t("users:detail.addressForm.longitude", {
                defaultValue: "Boylam",
              })}
              value={form.longitude ?? ""}
              onChange={(e) =>
                handleChange(
                  "longitude",
                  e.target.value === "" ? null : Number(e.target.value)
                )
              }
              fullWidth
              helperText={helperOrBlank(undefined)}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          {t("common:button.cancel", {
            defaultValue: "İptal",
          })}
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
        >
          {mode === "edit"
            ? t("common:button.update", {
                defaultValue: "Güncelle",
              })
            : t("common:button.save", {
                defaultValue: "Kaydet",
              })}
        </Button>
      </DialogActions>
    </Dialog>
  );
}