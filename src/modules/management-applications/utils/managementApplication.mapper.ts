//src/modules/management-applications/utils/managementApplication.mapper.ts
import type {
  CreateManagedPropertyApplicationRequestDto,
  ManagementApplicationFormState,
} from "../types/managementApplication.types";

function toPositiveInt(value: string): number {
  const parsed = Number.parseInt(value || "0", 10);

  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : 0;
}

export function mapManagementApplicationFormToCreateDto(
  form: ManagementApplicationFormState,
): CreateManagedPropertyApplicationRequestDto {
  return {
    propertyName: form.propertyName.trim(),

    description:
      form.note.trim() || null,

    addressId:
      form.address.addressId ?? null,

    residentialUnitCount:
      toPositiveInt(form.totalApartmentCount),

    commercialUnitCount: 0,

    blockCount:
      toPositiveInt(form.blockCount) || null,

    applicantNote:
      form.note.trim() || null,

    autoCreateUnitsAfterApproval: true,
  };
}