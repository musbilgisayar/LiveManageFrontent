//src/modules/users/components/detail/tabs/phone-manager/helpers/phoneDisplay_ultimate.ts

import type { UserPhoneNumberDtoUltimate } from "@/modules/users/types/UserPhone.types_ultimate";

export function formatPhoneDisplayUltimate(
  countryCode?: string | null,
  phoneNumber?: string | null
): string {
  const cc = (countryCode ?? "").trim();
  const pn = (phoneNumber ?? "").trim();

  if (!cc && !pn) return "-";
  if (!cc) return pn;
  if (!pn) return cc;

  return `${cc} ${pn}`;
}

export function maskPhoneForLogUltimate(
  countryCode?: string | null,
  phoneNumber?: string | null
): string {
  const cc = (countryCode ?? "").trim();
  const pn = (phoneNumber ?? "").replace(/\D/g, "");

  if (!pn) return cc || "***";

  const last2 = pn.slice(-2);
  return `${cc} *** *** ${last2}`.trim();
}

export function sortPhonesUltimate(
  items: UserPhoneNumberDtoUltimate[]
): UserPhoneNumberDtoUltimate[] {
  return [...items].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;

    const aDate = a.updatedAt ?? a.createdAt ?? "";
    const bDate = b.updatedAt ?? b.createdAt ?? "";

    return bDate.localeCompare(aDate);
  });
}