// src/modules/management-applications/utils/managementApplication.mapper.ts

import type {
  CreateManagedPropertyApplicationRequestDto,
  ManagementApplicantType,
  ManagementApplicationFormState,
  RepresentationType,
} from "../types/managementApplication.types";

function toPositiveInt(value?: string | null): number {
  const parsed = Number.parseInt(value || "0", 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function trimOrNull(value?: string | null): string | null {
  const text = value?.trim();

  return text && text.length > 0 ? text : null;
}

function toUtcOrNull(value?: string | null): string | null {
  const text = value?.trim();

  if (!text) return null;

  const date = new Date(text);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function mapRepresentationTypeToBackend(
  value?: RepresentationType | null,
): number | null {
  switch (value) {
    case "owner":
      return 1;

    case "proxy":
      return 2;

    case "board_member":
      return 3;

    case "professional_manager":
      return 4;

    default:
      return null;
  }
}

function mapApplicantTypeToBackend(
  value?: ManagementApplicantType | null,
): number | null {
  switch (value) {
    case "individual":
      return 1;

    case "company":
      return 2;

    default:
      return null;
  }
}

export function mapManagementApplicationFormToCreateDto(
  form: ManagementApplicationFormState,
): CreateManagedPropertyApplicationRequestDto {
  const note = trimOrNull(form.note);
  const taxOrIdentityNumber = trimOrNull(form.taxOrIdentityNumber);
  const isCompany = form.applicantType === "company";

  return {
    propertyName: form.propertyName.trim(),

    description: note,

    addressId: form.address.addressId ?? null,

    residentialUnitCount: toPositiveInt(form.residentialUnitCount),

    commercialUnitCount: toPositiveInt(form.commercialUnitCount),

    blockCount: toPositiveInt(form.blockCount) || null,

    applicantNote: note,

    representationType: mapRepresentationTypeToBackend(
      form.representationType,
    ),

    requestedRoleId: form.requestedRoleId ?? null,

    requestedRoleNameSnapshot: trimOrNull(
      form.requestedRoleNameSnapshot,
    ),

    authorityScope: trimOrNull(form.authorityScope),

    authorityStartDateUtc: toUtcOrNull(form.authorityStartDate),

    authorityEndDateUtc: form.isAuthorityIndefinite
      ? null
      : toUtcOrNull(form.authorityEndDate),

    isAuthorityIndefinite: Boolean(form.isAuthorityIndefinite),

    autoCreateUnitsAfterApproval: true,

    applicantType: mapApplicantTypeToBackend(form.applicantType),

    identityNumber: isCompany ? null : taxOrIdentityNumber,

    taxNumber: isCompany ? taxOrIdentityNumber : null,

    mersisNumber: isCompany ? trimOrNull(form.mersisNumber) : null,
  };
}
