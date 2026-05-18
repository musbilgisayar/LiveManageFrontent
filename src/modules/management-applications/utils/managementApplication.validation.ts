import type {
  DocumentRequirement,
  ManagementApplicationFormErrors,
  ManagementApplicationFormState,
  WizardStepId,
} from "../types/managementApplication.types";

type TranslateFn = (key: string) => string;

const NS = "property:managementApplication.create.validation";

function tr(t: TranslateFn | undefined, key: string, fallback: string) {
  const fullKey = `${NS}.${key}`;

  if (!t) return fallback;

  const value = t(fullKey);
  return value && value !== fullKey ? value : fallback;
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
    next.propertyName = tr(t, "propertyNameRequired", "Lütfen yapı adını girin.");
  }

  if (!form.contactFullName.trim()) {
    next.contactFullName = tr(
      t,
      "contactFullNameRequired",
      "Lütfen başvuru sahibinin adını girin.",
    );
  }

  if (!form.taxOrIdentityNumber.trim()) {
    next.taxOrIdentityNumber = tr(
      t,
      "identityNumberRequired",
      "Lütfen kimlik, vergi veya kayıt numarasını girin.",
    );
  }

  if (!form.authorityStartDate.trim()) {
    next.authorityStartDate = tr(
      t,
      "authorityStartDateRequired",
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
      "authorityEndDateInvalid",
      "Bitiş tarihi başlangıç tarihinden önce olamaz.",
    );
  }

  if (!form.address.countryCode.trim()) {
    next["address.countryCode"] = tr(t, "countryRequired", "Lütfen ülke seçin.");
  }

  if (!form.address.provinceId.trim()) {
    next["address.provinceId"] = tr(t, "provinceRequired", "Lütfen il seçin.");
  }

  if (!form.address.districtId.trim()) {
    next["address.districtId"] = tr(t, "districtRequired", "Lütfen ilçe seçin.");
  }

  if (!form.address.neighborhoodId.trim()) {
    next["address.neighborhoodId"] = tr(
      t,
      "neighborhoodRequired",
      "Lütfen mahalle veya köy seçin.",
    );
  }

  if (!form.address.street.trim()) {
    next["address.street"] = tr(
      t,
      "streetRequired",
      "Lütfen cadde veya sokak bilgisini girin.",
    );
  }

  if (!form.address.buildingNumber.trim()) {
    next["address.buildingNumber"] = tr(
      t,
      "buildingNumberRequired",
      "Lütfen bina numarasını girin.",
    );
  }

  if (!form.address.postalCode.trim()) {
    next["address.postalCode"] = tr(
      t,
      "postalCodeRequired",
      "Lütfen posta kodunu girin.",
    );
  }

  if (blockCount <= 0) {
    next.blockCount = tr(t, "blockCountRequired", "Lütfen blok sayısını girin.");
  }

  if (totalApartmentCount <= 0) {
    next.totalApartmentCount = tr(
      t,
      "totalApartmentCountRequired",
      "Lütfen toplam daire sayısını girin.",
    );
  }

  if (requiredDocumentsMissing.length > 0) {
    next.documents = tr(
      t,
      "documentsRequired",
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
      "consentsRequired",
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
