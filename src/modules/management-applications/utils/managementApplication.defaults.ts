import type {
  ManagementApplicationAddressForm,
  ManagementApplicationFormState,
  WizardStep,
} from "../types/managementApplication.types";

export const createDefaultManagementApplicationAddress =
  (): ManagementApplicationAddressForm => ({
    country: "",
    countryCode: "CH",
    city: "",
    district: "",
    neighborhood: "",
    street: "",
    buildingNumber: "",
    apartmentNumber: "",
    postalCode: "",
    provinceId: "",
    districtId: "",
    neighborhoodId: "",
  });

export const initialManagementApplicationForm: ManagementApplicationFormState = {
  structureType: "site",
  propertyName: "",
  representationType: "professional_manager",
  blockCount: "",
  totalApartmentCount: "",
  contactFullName: "",
  contactEmail: "",
  contactPhone: "",
  taxOrIdentityNumber: "",
  authorityStartDate: "",
  authorityEndDate: "",
  address: createDefaultManagementApplicationAddress(),
  note: "",
  consentAccuracy: false,
  consentAuthority: false,
  consentPrivacy: false,
  consentContract: false,
};

export const managementApplicationWizardSteps: WizardStep[] = [
  {
    id: "basic",
    index: 1,
    title: "Yönetim Bilgileri",
    description: "Yapı, temsil ve başvuru sahibi bilgileri",
  },
  {
    id: "address",
    index: 2,
    title: "Adres ve Yapı",
    description: "Adres, blok ve bağımsız bölüm bilgileri",
  },
  {
    id: "documents",
    index: 3,
    title: "Belgeler",
    description: "Zorunlu ve destekleyici belgeler",
  },
  {
    id: "review",
    index: 4,
    title: "Son Kontrol",
    description: "Özet, beyan ve gönderim",
  },
];