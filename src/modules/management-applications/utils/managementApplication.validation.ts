import type {
  DocumentRequirement,
  ManagementApplicationFormErrors,
  ManagementApplicationFormState,
  WizardStepId,
} from "../types/managementApplication.types";

export function validateManagementApplicationForm(
  form: ManagementApplicationFormState,
  requiredDocumentsMissing: DocumentRequirement[],
): ManagementApplicationFormErrors {
  const next: ManagementApplicationFormErrors = {};

  const blockCount = Number.parseInt(form.blockCount || "0", 10) || 0;

  const totalApartmentCount =
    Number.parseInt(form.totalApartmentCount || "0", 10) || 0;

  if (!form.propertyName.trim()) {
    next.propertyName = "Lütfen yapı adını girin.";
  }

  if (!form.contactFullName.trim()) {
    next.contactFullName = "Lütfen başvuru sahibinin adını girin.";
  }

  if (!form.taxOrIdentityNumber.trim()) {
    next.taxOrIdentityNumber =
      "Lütfen kimlik, vergi veya kayıt numarasını girin.";
  }

  if (!form.authorityStartDate.trim()) {
    next.authorityStartDate =
      "Lütfen yetki başlangıç tarihini seçin.";
  }

  if (
    form.authorityStartDate &&
    form.authorityEndDate &&
    form.authorityEndDate < form.authorityStartDate
  ) {
    next.authorityEndDate =
      "Bitiş tarihi başlangıç tarihinden önce olamaz.";
  }

  if (!form.address.countryCode.trim()) {
    next["address.countryCode"] = "Lütfen ülke seçin.";
  }

  if (!form.address.provinceId.trim()) {
    next["address.provinceId"] = "Lütfen il seçin.";
  }

  if (!form.address.districtId.trim()) {
    next["address.districtId"] = "Lütfen ilçe seçin.";
  }

  if (!form.address.neighborhoodId.trim()) {
    next["address.neighborhoodId"] =
      "Lütfen mahalle veya köy seçin.";
  }

  if (!form.address.street.trim()) {
    next["address.street"] =
      "Lütfen cadde veya sokak bilgisini girin.";
  }

  if (!form.address.buildingNumber.trim()) {
    next["address.buildingNumber"] =
      "Lütfen bina numarasını girin.";
  }

  if (!form.address.postalCode.trim()) {
    next["address.postalCode"] =
      "Lütfen posta kodunu girin.";
  }

  if (blockCount <= 0) {
    next.blockCount = "Lütfen blok sayısını girin.";
  }

  if (totalApartmentCount <= 0) {
    next.totalApartmentCount =
      "Lütfen toplam daire sayısını girin.";
  }

  if (requiredDocumentsMissing.length > 0) {
    next.documents =
      "Devam edebilmek için zorunlu belgeleri eklemeniz gerekiyor.";
  }

  if (
    !form.consentAccuracy ||
    !form.consentAuthority ||
    !form.consentPrivacy ||
    !form.consentContract
  ) {
    next.consents =
      "Başvuruyu göndermek için onay kutularını tamamlayın.";
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