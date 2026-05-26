import type {
  DocumentRequirement,
  ManagementApplicationFormErrors,
  ManagementApplicationFormState,
  WizardStepId,
} from "../types/managementApplication.types";

type TranslateFn = (key: string) => string;

const KEYS = {
  propertyNameRequired:
    "management-applications:create.validation.propertyNameRequired",
  contactFullNameRequired:
    "management-applications:create.validation.contactFullNameRequired",
  identityNumberRequired:
    "management-applications:create.validation.identityNumberRequired",
  authorityStartDateRequired:
    "management-applications:create.validation.authorityStartDateRequired",
  authorityEndDateInvalid:
    "management-applications:create.validation.authorityEndDateInvalid",
  countryRequired: "management-applications:create.validation.countryRequired",
  provinceRequired: "management-applications:create.validation.provinceRequired",
  districtRequired: "management-applications:create.validation.districtRequired",
  neighborhoodRequired:
    "management-applications:create.validation.neighborhoodRequired",
  streetRequired: "management-applications:create.validation.streetRequired",
  buildingNumberRequired:
    "management-applications:create.validation.buildingNumberRequired",
  postalCodeRequired:
    "management-applications:create.validation.postalCodeRequired",
  blockCountRequired:
    "management-applications:create.validation.blockCountRequired",
  totalApartmentCountRequired:
    "management-applications:create.validation.totalApartmentCountRequired",
  documentsRequired:
    "management-applications:create.validation.documentsRequired",
  consentsRequired:
    "management-applications:create.validation.consentsRequired",
} as const;

function tr(t: TranslateFn | undefined, fullKey: string, fallback: string) {
  if (!t) return fallback;

  const value = t(fullKey);

  if (!value) return fallback;
  if (value === fullKey) return fallback;
  if (value === `[${fullKey}]`) return fallback;

  return value;
}

export function validateManagementApplicationForm(
  form: ManagementApplicationFormState,
  requiredDocumentsMissing: DocumentRequirement[],
  t?: TranslateFn,
): ManagementApplicationFormErrors {
  const next: ManagementApplicationFormErrors = {};

  const blockCount = Number.parseInt(form.blockCount || "0", 10) || 0;
  const totalApartmentCount =
    Number.parseInt(form.totalApartmentCount || "0", 10) || 0;

  if (!form.propertyName.trim()) {
    next.propertyName = tr(
      t,
      KEYS.propertyNameRequired,
      "Lütfen yapı adını girin.",
    );
  }

  if (!form.contactFullName.trim()) {
    next.contactFullName = tr(
      t,
      KEYS.contactFullNameRequired,
      "Lütfen başvuru sahibinin adını girin.",
    );
  }

  if (!form.taxOrIdentityNumber.trim()) {
    next.taxOrIdentityNumber = tr(
      t,
      KEYS.identityNumberRequired,
      "Lütfen kimlik, vergi veya kayıt numarasını girin.",
    );
  }

  if (!form.authorityStartDate.trim()) {
    next.authorityStartDate = tr(
      t,
      KEYS.authorityStartDateRequired,
      "Lütfen yetki başlangıç tarihini seçin.",
    );
  }

  if (
    form.authorityStartDate &&
    form.authorityEndDate &&
    form.authorityEndDate < form.authorityStartDate
  ) {
    next.authorityEndDate = tr(
      t,
      KEYS.authorityEndDateInvalid,
      "Bitiş tarihi başlangıç tarihinden önce olamaz.",
    );
  }

  if (!form.address.countryCode.trim()) {
    next["address.countryCode"] = tr(
      t,
      KEYS.countryRequired,
      "Lütfen ülke seçin.",
    );
  }

  if (!form.address.provinceId.trim()) {
    next["address.provinceId"] = tr(
      t,
      KEYS.provinceRequired,
      "Lütfen il seçin.",
    );
  }

  if (!form.address.districtId.trim()) {
    next["address.districtId"] = tr(
      t,
      KEYS.districtRequired,
      "Lütfen ilçe seçin.",
    );
  }

  if (!form.address.neighborhoodId.trim()) {
    next["address.neighborhoodId"] = tr(
      t,
      KEYS.neighborhoodRequired,
      "Lütfen mahalle veya köy seçin.",
    );
  }

  if (!form.address.street.trim()) {
    next["address.street"] = tr(
      t,
      KEYS.streetRequired,
      "Lütfen cadde veya sokak bilgisini girin.",
    );
  }

  if (!form.address.buildingNumber.trim()) {
    next["address.buildingNumber"] = tr(
      t,
      KEYS.buildingNumberRequired,
      "Lütfen bina numarasını girin.",
    );
  }

  if (!form.address.postalCode.trim()) {
    next["address.postalCode"] = tr(
      t,
      KEYS.postalCodeRequired,
      "Lütfen posta kodunu girin.",
    );
  }

  if (blockCount <= 0) {
    next.blockCount = tr(
      t,
      KEYS.blockCountRequired,
      "Lütfen blok sayısını girin.",
    );
  }

  if (totalApartmentCount <= 0) {
    next.totalApartmentCount = tr(
      t,
      KEYS.totalApartmentCountRequired,
      "Lütfen toplam daire sayısını girin.",
    );
  }

  if (requiredDocumentsMissing.length > 0) {
    next.documents = tr(
      t,
      KEYS.documentsRequired,
      "Devam edebilmek için zorunlu belgeleri eklemeniz gerekiyor.",
    );
  }

  if (
    !form.consentAccuracy ||
    !form.consentAuthority ||
    !form.consentPrivacy ||
    !form.consentContract
  ) {
    next.consents = tr(
      t,
      KEYS.consentsRequired,
      "Başvuruyu göndermek için onay kutularını tamamlayın.",
    );
  }

  return next;
}

export function getStepFields(stepId: WizardStepId): string[] {
  if (stepId === "basic") {
    return [
      "propertyName",
      "contactFullName",
      "taxOrIdentityNumber",
      "authorityStartDate",
      "authorityEndDate",
    ];
  }

  if (stepId === "address") {
    return [
      "address.countryCode",
      "address.provinceId",
      "address.districtId",
      "address.neighborhoodId",
      "address.street",
      "address.buildingNumber",
      "address.postalCode",
      "blockCount",
      "totalApartmentCount",
    ];
  }

  if (stepId === "documents") {
    return ["documents"];
  }

  return ["consents"];
}