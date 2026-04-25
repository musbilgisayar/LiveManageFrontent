// src/modules/users/types/UserAddress.types.ts

export type AddressTypeValue =
  | "Home"
  | "Work"
  | "Billing"
  | "Other";

export type OwnerKindValue =
  | "Kisisel"
  | "InsaatFirmasi"
  | "Departman"
  | "Lokasyon"
  | "Hane"
  | "Tedarikci"
  | "Musteri"
  | "Emlakci"
  | "Site";

export type AddressTypeNumber = 1 | 2 | 3 | 4;

export type UserAddressDto = {
  addressId: string;
  addressType?: AddressTypeNumber | AddressTypeValue | null;
  isPrimary?: boolean;
  line?: string | null;
  countryCode?: string | null;
  country?: string | null;
  city?: string | null;
  district?: string | null;
  neighborhood?: string | null;

  provinceId?: string | null;
  districtId?: string | null;
  neighborhoodId?: string | null;

  street?: string | null;
  buildingNumber?: string | null;
  apartmentNumber?: string | null;
  postalCode?: string | null;
  description?: string | null;
  formattedAddress?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  altitude?: number | null;
};

export type UserAddressLinkDto = {
  linkId: string;
  ownerId: string;
  ownerKind: number | OwnerKindValue;
  addressId: string;
  addressType: AddressTypeNumber | AddressTypeValue | number | string;
  isPrimary: boolean;
  validFrom?: string | null;
  validTo?: string | null;
  address?: UserAddressDto | null;
};

export type GetUserAddressLinksParams = {
  ownerId: string;
  ownerKind: OwnerKindValue;
};

export type UserAddressLinksResponse = UserAddressLinkDto[];

/**
 * Edit/update akışında frontend içinde kullanmak için ortak payload tipi.
 * Backend update endpoint'i string AddressType beklediği için burada AddressTypeValue kullanıyoruz.
 */
export type UpdateUserAddressLinkPayload = {
  linkId: string;
  addressType: AddressTypeValue;
  isPrimary: boolean;
  validFrom: string;
  validTo: string | null;
};

/**
 * Address update request tipi.
 * PUT /profile/addresses endpoint'i için kullanılabilir.
 */
export type UpdateUserAddressPayload = {
  addressId: string;
  countryCode: string;
  country: string;
  city: string;
  district: string;
  neighborhood: string;
  street: string;
  buildingNumber: string;
  apartmentNumber: string;
  postalCode: string;
  description: string;
  formattedAddress: string;
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
};