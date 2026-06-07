//src/modules/management-applications/utils/managementApplication.defaults.ts
import type {
  ManagementApplicationAddressForm,
  ManagementApplicationFormState,
  WizardStep,
} from "../types/managementApplication.types";

export const createDefaultManagementApplicationAddress =
  (): ManagementApplicationAddressForm => ({
    addressId: null,
    country: "",
    countryCode: "TR",
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
  residentialUnitCount: "",
  commercialUnitCount: "",
  contactFullName: "",
  contactEmail: "",
  contactPhone: "",
  applicantType: "individual",
  taxOrIdentityNumber: "",
  mersisNumber: "",
  authorityStartDate: "",
  authorityEndDate: "",
  isAuthorityIndefinite: false,
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
      title: "management-applications:create.steps.basic.title",
      description:
        "management-applications:create.steps.basic.description",
    },
    {
      id: "address",
      index: 2,
      title: "management-applications:create.steps.address.title",
      description:
        "management-applications:create.steps.address.description",
    },
    {
      id: "documents",
      index: 3,
      title: "management-applications:create.steps.documents.title",
      description:
        "management-applications:create.steps.documents.description",
    },
    {
      id: "review",
      index: 4,
      title: "management-applications:create.steps.review.title",
      description:
        "management-applications:create.steps.review.description",
    },
  ]);
