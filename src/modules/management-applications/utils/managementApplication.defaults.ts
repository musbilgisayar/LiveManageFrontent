//src/modules/management-applications/utils/managementApplication.defaults.ts
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

const managementApplicationWizardStepOrder: WizardStep["id"][] = [
  "basic",
  "address",
  "documents",
  "review",
];

function orderManagementApplicationWizardSteps(
  steps: WizardStep[],
): WizardStep[] {
  return steps
    .slice()
    .sort(
      (left, right) =>
        managementApplicationWizardStepOrder.indexOf(left.id) -
        managementApplicationWizardStepOrder.indexOf(right.id),
    )
    .map((step, index) => ({
      ...step,
      index: index + 1,
    }));
}

export const managementApplicationWizardSteps: WizardStep[] =
  orderManagementApplicationWizardSteps([
    {
      id: "basic",
      index: 1,
      title: "Temel Bilgiler",
      description: "Yapı, temsil ve başvuru sahibi bilgileri",
    },
    {
      id: "address",
      index: 2,
      title: "Adres Bilgileri",
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
      title: "Onay",
      description: "Özet, beyan ve gönderim",
    },
  ]);