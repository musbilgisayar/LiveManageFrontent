// src/modules/users/components/detail/cards/AddressManagerCard.tsx
// bu dosya, AddressManagerCard bileşenini içerir ve kullanıcıların adres bilgilerini yönetmelerine olanak tanır. Bu bileşen, kullanıcıya bağlı adres kayıtlarını listeler, yeni adres ekleme, mevcut adresleri düzenleme ve silme işlemleri için arayüz sağlar. Ayrıca, adres türlerini göstermek ve birincil adresi belirlemek gibi özellikler de içerir. Kullanıcı etkileşimleri için gerekli fonksiyonlar ve durum yönetimi de bu bileşende yer almaktadır.

// src/modules/users/components/detail/cards/AddressManagerCard.tsx

"use client";

import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import {
  IconCirclePlus,
  IconPencil,
  IconStar,
  IconTrash,
} from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";
import { useUserAddressLinks } from "../../../hooks/useUserAddressLinks";
import {
  createAddress,
  createAddressLink,
  updateAddress,
  updateAddressLink,
} from "../../../services/userAddressManager.service";
import type { UserAddressLinkDto } from "../../../types/UserAddress.types";
import UserDetailCard from "./UserDetailCard";
import AddressCreateDialog, {
  type AddressCreateForm,
} from "./address-manager/dialogs/AddressCreateDialog";

type Props = {
  userId: string;
};

type TFunction = (
  key: string,
  vars?: Record<string, string | number>
) => string;

function getAddressTypeLabel(
  value: number | string | null | undefined,
  t: TFunction
) {
  if (typeof value === "string") {
    switch (value) {
      case "Home":
        return t("users:detail.addressTypes.home", { defaultValue: "Ev" });
      case "Work":
        return t("users:detail.addressTypes.work", { defaultValue: "İş" });
      case "Billing":
        return t("users:detail.addressTypes.billing", { defaultValue: "Fatura" });
      case "Other":
        return t("users:detail.addressTypes.other", { defaultValue: "Diğer" });
      default:
        return value;
    }
  }

  switch (value) {
    case 1:
      return t("users:detail.addressTypes.home", { defaultValue: "Ev" });
    case 2:
      return t("users:detail.addressTypes.work", { defaultValue: "İş" });
    case 3:
      return t("users:detail.addressTypes.billing", { defaultValue: "Fatura" });
    case 4:
      return t("users:detail.addressTypes.other", { defaultValue: "Diğer" });
    default:
      return t("users:detail.addressTypes.unknown", {
        defaultValue: "Belirsiz",
      });
  }
}

function mapAddressTypeToFormValue(
  value: number | string | null | undefined
): number {
  switch (value) {
    case 1:
    case "Home":
      return 1;
    case 2:
    case "Work":
      return 2;
    case 3:
    case "Billing":
      return 3;
    case 4:
    case "Other":
      return 4;
    default:
      return 1;
  }
}

function buildAddressTitle(item: UserAddressLinkDto): string {
  return item.address?.formattedAddress || item.address?.line || "-";
}

function buildAddressMeta(item: UserAddressLinkDto): string {
  return [
    item.address?.city,
    item.address?.district,
    item.address?.country,
  ]
    .filter(Boolean)
    .join(" • ");
}

export default function AddressManagerCard({ userId }: Props) {
  const [backendErrors, setBackendErrors] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const { t } = useI18nNs(["users", "common"]);

  const {
    items,
    isLoading,
    isSettingPrimary,
    isDeleting,
    error,
    refetch,
    setPrimary,
    deleteLink,
  } = useUserAddressLinks(userId, "Kisisel");

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UserAddressLinkDto | null>(null);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const primaryCompare = Number(b.isPrimary) - Number(a.isPrimary);
      if (primaryCompare !== 0) return primaryCompare;

      const aType = a.addressType ?? 999;
      const bType = b.addressType ?? 999;
      return Number(aType) - Number(bType);
    });
  }, [items]);

  const editInitialValues = useMemo<AddressCreateForm | null>(() => {
    if (!editingItem) return null;

    return {
      country: editingItem.address?.country ?? "",
      countryCode: editingItem.address?.countryCode ?? "CH",
      city: editingItem.address?.city ?? "",
      district: editingItem.address?.district ?? "",
      neighborhood: editingItem.address?.neighborhood ?? "",
      provinceId: editingItem.address?.provinceId ?? "",
      districtId: editingItem.address?.districtId ?? "",
      neighborhoodId: editingItem.address?.neighborhoodId ?? "",
      street: editingItem.address?.street ?? "",
      buildingNumber: editingItem.address?.buildingNumber ?? "",
      apartmentNumber: editingItem.address?.apartmentNumber ?? "",
      postalCode: editingItem.address?.postalCode ?? "",
      description: editingItem.address?.description ?? "",
      latitude: editingItem.address?.latitude ?? null,
      longitude: editingItem.address?.longitude ?? null,
      addressType: mapAddressTypeToFormValue(editingItem.addressType),
      isPrimary: editingItem.isPrimary ?? false,
      validFrom: editingItem.validFrom ?? new Date().toISOString(),
      validTo: editingItem.validTo ?? null,
    };
  }, [editingItem]);

  const handleCreateSubmit = async (form: AddressCreateForm) => {
    try {
      setBackendErrors(null);

      const addressId = await createAddress(form);

      await createAddressLink({
        ownerId: userId,
        ownerKind: "Kisisel",
        addressId,
        addressType: form.addressType,
        isPrimary: form.isPrimary,
        validFrom: form.validFrom,
        validTo: form.validTo,
      });

      await refetch();
      setCreateOpen(false);
      setSuccessMessage(
        t("common:alert.saved", {
          defaultValue: "Adres başarıyla oluşturuldu",
        })
      );
    } catch (err: any) {
      console.error("[AdresYonetimKarti][OlusturmaHatasi]", err);

      const apiErrors =
        err?.response?.data?.errors ||
        err?.errors ||
        err?.data?.errors ||
        null;

      if (apiErrors) {
        setBackendErrors({
          street: apiErrors?.Street,
          postalCode: apiErrors?.PostalCode,
          buildingNumber: apiErrors?.BuildingNumber,
          provinceId: apiErrors?.City,
          districtId: apiErrors?.District,
          neighborhoodId: apiErrors?.Neighborhood,
        });
        return;
      }

      alert(
        err instanceof Error
          ? err.message
          : t("common:alert.error", {
              defaultValue: "Adres oluşturulurken hata oluştu",
            })
      );
    }
  };

  const handleEdit = (item: UserAddressLinkDto) => {
    setEditingItem(item);
    setEditOpen(true);
  };

  const handleEditSubmit = async (form: AddressCreateForm) => {
    if (!editingItem?.addressId || !editingItem?.linkId) {
      const message = t("common:alert.error", {
        defaultValue: "Düzenlenecek adres bilgisi bulunamadı.",
      });
      alert(message);
      throw new Error(message);
    }

    try {
      setBackendErrors(null);

      await updateAddress(editingItem.addressId, form);

      await updateAddressLink({
        linkId: editingItem.linkId,
        addressType: form.addressType,
        isPrimary: form.isPrimary,
        validFrom: form.validFrom,
        validTo: form.validTo,
      });

      await refetch();
      setEditOpen(false);
      setEditingItem(null);
      setSuccessMessage(
        t("users:detail.addressManager.editSuccess", {
          defaultValue: "Adres başarıyla güncellendi.",
        })
      );
    } catch (err: any) {
      console.error("[AdresYonetimKarti][GuncellemeHatasi]", err);

      const apiErrors =
        err?.response?.data?.errors ||
        err?.errors ||
        err?.data?.errors ||
        null;

      if (apiErrors) {
        setBackendErrors({
          street: apiErrors?.Street,
          postalCode: apiErrors?.PostalCode,
          buildingNumber: apiErrors?.BuildingNumber,
          provinceId: apiErrors?.City,
          districtId: apiErrors?.District,
          neighborhoodId: apiErrors?.Neighborhood,
        });
        throw err;
      }

      alert(
        err instanceof Error
          ? err.message
          : t("common:alert.error", {
              defaultValue: "Adres güncellenirken hata oluştu",
            })
      );
      throw err;
    }
  };

  const handleSetPrimary = async (linkId: string) => {
    try {
      await setPrimary(linkId);
      setSuccessMessage(
        t("users:detail.addressManager.setPrimarySuccess", {
          defaultValue: "Birincil adres başarıyla güncellendi.",
        })
      );
    } catch (err: unknown) {
      console.error("[AdresYonetimKarti][BirincilYapmaHatasi]", err);

      alert(
        err instanceof Error
          ? err.message
          : t("common:alert.error", {
              defaultValue: "Birincil adres ayarlanırken hata oluştu",
            })
      );
    }
  };

  const handleDelete = async (linkId: string, addressText?: string | null) => {
    const confirmMessage = t("users:detail.addressManager.deleteConfirm", {
      defaultValue: `${addressText || "Bu adres öğesini"} silmek istediğinizden emin misiniz?`,
    });

    if (!window.confirm(confirmMessage)) return;

    try {
      await deleteLink(linkId);
      setSuccessMessage(
        t("users:detail.addressManager.deleteSuccess", {
          defaultValue: "Adres bağlantısı başarıyla kaldırıldı.",
        })
      );
    } catch (err: unknown) {
      console.error("[AdresYonetimKarti][SilmeHatasi]", err);

      alert(
        err instanceof Error
          ? err.message
          : t("common:alert.error", {
              defaultValue: "Adres silinirken hata oluştu",
            })
      );
    }
  };

  return (
    <UserDetailCard title={t("users:detail.cards.addresses")}>
      <Stack spacing={1.5}>
        <Typography variant="body2" color="text.secondary">
          {t("users:detail.addressManager.description", {
            defaultValue: "Bu kart kullanıcıya bağlı adres kayıtlarını listeler.",
          })}
        </Typography>

        {isLoading ? (
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={20} />
              <Typography variant="body2">
                {t("common:loading", { defaultValue: "Yükleniyor..." })}
              </Typography>
            </Stack>
          </Paper>
        ) : null}

        {!isLoading && !!error ? (
          <Alert severity="error">
            {error ||
              t("users:detail.addressManager.loadError", {
                defaultValue: "Adresler yüklenemedi.",
              })}
          </Alert>
        ) : null}

        {!isLoading && !error && sortedItems.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
            <Typography variant="body2" color="text.secondary">
              {t("users:detail.addressManager.empty", {
                defaultValue: "Henüz adres bulunmuyor.",
              })}
            </Typography>
          </Paper>
        ) : null}

        {!isLoading && !error && sortedItems.length > 0 ? (
          <Paper
            variant="outlined"
            sx={{
              borderRadius: 3,
              px: 2,
              py: 0.5,
            }}
          >
            <Stack>
              {sortedItems.map((item, index) => (
                <React.Fragment key={item.linkId}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={2}
                    sx={{ py: 1.75 }}
                  >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        useFlexGap
                        flexWrap="wrap"
                        sx={{ mb: 0.75 }}
                      >
                        <Chip
                          label={getAddressTypeLabel(item.addressType, t)}
                          size="small"
                          variant="outlined"
                          sx={{ borderRadius: 999 }}
                        />

                        {item.isPrimary ? (
                          <Chip
                            label={t("users:detail.addressManager.primary", {
                              defaultValue: "Birincil",
                            })}
                            color="primary"
                            size="small"
                            sx={{ borderRadius: 999 }}
                          />
                        ) : null}
                      </Stack>

                      <Typography
                        variant="body1"
                        fontWeight={600}
                        sx={{ mb: 0.5, lineHeight: 1.45 }}
                      >
                        {buildAddressTitle(item)}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {buildAddressMeta(item) || "-"}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={0.5}>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(item)}
                        title={t("users:detail.addressManager.actions.edit", {
                          defaultValue: "Düzenle",
                        })}
                        sx={{ color: "text.secondary" }}
                      >
                        <IconPencil size={18} />
                      </IconButton>

                      <IconButton
                        size="small"
                        disabled={item.isPrimary || isSettingPrimary}
                        onClick={() => void handleSetPrimary(item.linkId)}
                        title={t(
                          "users:detail.addressManager.actions.setPrimary",
                          { defaultValue: "Birincil yap" }
                        )}
                        sx={{ color: "text.secondary" }}
                      >
                        <IconStar size={18} />
                      </IconButton>

                      <IconButton
                        size="small"
                        color="error"
                        disabled={isDeleting}
                        onClick={() =>
                          void handleDelete(
                            item.linkId,
                            item.address?.formattedAddress ||
                              item.address?.line ||
                              "Bu adres öğesi"
                          )
                        }
                        title={t("users:detail.addressManager.actions.delete", {
                          defaultValue: "Kaldır",
                        })}
                      >
                        <IconTrash size={18} />
                      </IconButton>
                    </Stack>
                  </Stack>

                  {index !== sortedItems.length - 1 ? <Divider /> : null}
                </React.Fragment>
              ))}
            </Stack>
          </Paper>
        ) : null}

        <Box sx={{ pt: 0.5 }}>
          <Button
            variant="text"
            startIcon={<IconCirclePlus size={18} />}
            onClick={() => setCreateOpen(true)}
            sx={{
              borderRadius: 999,
              px: 1.5,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {t("users:detail.addressManager.addNew", {
              defaultValue: "Yeni adres",
            })}
          </Button>
        </Box>
      </Stack>

      <AddressCreateDialog
        open={createOpen}
        mode="create"
        onClose={() => {
          setCreateOpen(false);
          setBackendErrors(null);
        }}
        onSubmit={handleCreateSubmit}
        backendErrors={backendErrors}
      />

      {editOpen && editingItem && (
        <AddressCreateDialog
          open={editOpen}
          mode="edit"
          initialValues={editInitialValues}
          onClose={() => {
            setEditOpen(false);
            setEditingItem(null);
            setBackendErrors(null);
          }}
          onSubmit={handleEditSubmit}
          backendErrors={backendErrors}
        />
      )}

      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage("")}
        message={successMessage}
      />
    </UserDetailCard>
  );
}

