// src/modules/users/mappers/userPhone.mapper_ultimate.ts

import type {
  UserPhoneFormValuesUltimate,
  UserPhoneNumberCreateRequestUltimate,
  UserPhoneNumberDtoUltimate,
  UserPhoneNumberUpdateRequestUltimate,
} from "../types/UserPhone.types_ultimate";

function cleanCountryCodeUltimate(value: string): string {
  const raw = (value ?? "").trim().replace(/\s+/g, "");
  if (!raw) return "";
  return raw.startsWith("+") ? raw : `+${raw.replace(/^\+/, "")}`;
}

function cleanPhoneNumberUltimate(value: string): string {
  return (value ?? "").trim().replace(/[^\d]/g, "");
}

function cleanLabelUltimate(value: string): string | null {
  const trimmed = (value ?? "").trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function mapPhoneFormToCreateRequestUltimate(
  userId: string,
  values: UserPhoneFormValuesUltimate
): UserPhoneNumberCreateRequestUltimate {
  return {
    userId,
    phoneType: values.phoneType as UserPhoneNumberCreateRequestUltimate["phoneType"],
    countryCode: cleanCountryCodeUltimate(values.countryCode),
    phoneNumber: cleanPhoneNumberUltimate(values.phoneNumber),
    label: cleanLabelUltimate(values.label),
    isPrimary: Boolean(values.isPrimary),
  };
}

export function mapPhoneFormToUpdateRequestUltimate(
  phoneId: string,
  values: UserPhoneFormValuesUltimate
): UserPhoneNumberUpdateRequestUltimate {
  return {
    phoneId,
    phoneType: values.phoneType as UserPhoneNumberUpdateRequestUltimate["phoneType"],
    countryCode: cleanCountryCodeUltimate(values.countryCode),
    phoneNumber: cleanPhoneNumberUltimate(values.phoneNumber),
    label: cleanLabelUltimate(values.label),
    isPrimary: Boolean(values.isPrimary),
  };
}

export function mapPhoneDtoToFormValuesUltimate(
  dto: UserPhoneNumberDtoUltimate
): UserPhoneFormValuesUltimate {
  return {
    countryCode: dto.countryCode ?? "",
    phoneNumber: dto.phoneNumber ?? "",
    phoneType: dto.phoneType ?? "",
    label: dto.label ?? "",
    isPrimary: Boolean(dto.isPrimary),
  };
}