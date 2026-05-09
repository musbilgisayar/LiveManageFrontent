"use client";

import React, { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import type { Theme } from "@mui/material/styles";

import PageHero from "../components/create/PageHero";
import WizardStepper from "../components/create/WizardStepper";
import WizardFooter from "../components/create/WizardFooter";

import BasicStep from "../components/create/BasicStep";
import AddressAndBuildingStep from "../components/create/AddressAndBuildingStep";
import DocumentsStep from "../components/create/DocumentsStep";
import ReviewStep from "../components/create/ReviewStep";

import { useManagementApplicationCreate } from "../hooks/useManagementApplicationCreate";
import { useAccountMe } from "@/modules/profile/hooks/useAccountMe";
import {
  createDefaultManagementApplicationAddress,
  initialManagementApplicationForm,
  managementApplicationWizardSteps,
} from "../utils/managementApplication.defaults";

import {
  documentCatalog,
} from "../components/create/constants";

import {
  getStepFields,
  validateManagementApplicationForm,
} from "../utils/managementApplication.validation";

import type {
  DocumentRequirement,
  ManagementApplicationFormErrors,
  ManagementApplicationFormState,
  RequiredDocumentKind,
  UploadedFileItem,
} from "../types/managementApplication.types";

export default function ManagementApplicationCreateView() {

  const router = useRouter();
  const theme = useTheme<Theme>();
  const { user } = useAccountMe();

  const [form, setForm] =
    useState<ManagementApplicationFormState>(
      initialManagementApplicationForm,
    );

  const [errors, setErrors] =
    useState<ManagementApplicationFormErrors>({});

  const [submitAttempted, setSubmitAttempted] =
    useState(false);

  const [activeStepIndex, setActiveStepIndex] =
    useState(0);

  const [uploadedFiles, setUploadedFiles] =
    useState<UploadedFileItem[]>([]);

  const [selectedDocumentKind, setSelectedDocumentKind] =
    useState<RequiredDocumentKind>("signed_contract");

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [documentDescription, setDocumentDescription] =
    useState("");
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const {
    isSubmitting,
    submitMessage,
    existingApplicationId,
    submit,
  } = useManagementApplicationCreate();
  const compactFileInputRef =
    useRef<HTMLInputElement | null>(null);

  const isEmailVerified = true;
  const isPhoneVerified = true;
  const applicantFullName =
    [
      user?.firstName,
      user?.lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() || "Kullanıcı";

  const currentStep = managementApplicationWizardSteps[activeStepIndex];

  const blockCount =
    Number.parseInt(form.blockCount || "0", 10) || 0;

  const totalApartmentCount =
    Number.parseInt(form.totalApartmentCount || "0", 10) || 0;

  const documentRequirements =
    useMemo<DocumentRequirement[]>(() => {
      const common: DocumentRequirement[] = [
        {
          kind: "signed_contract",
          title: documentCatalog.signed_contract.title,
          description:
            documentCatalog.signed_contract.description,
          required: true,
        },
      ];

      if (form.representationType === "proxy") {
        return [
          ...common,
          {
            kind: "power_of_attorney",
            title: documentCatalog.power_of_attorney.title,
            description:
              documentCatalog.power_of_attorney.description,
            required: true,
          },
        ];
      }

      if (form.representationType === "board_member") {
        return [
          ...common,
          {
            kind: "authority_decision",
            title: documentCatalog.authority_decision.title,
            description:
              documentCatalog.authority_decision.description,
            required: true,
          },
          {
            kind: "assignment_letter",
            title: documentCatalog.assignment_letter.title,
            description:
              documentCatalog.assignment_letter.description,
            required: false,
          },
        ];
      }

      if (form.representationType === "professional_manager") {
        return [
          ...common,
          {
            kind: "professional_service_agreement",
            title:
              documentCatalog.professional_service_agreement.title,
            description:
              documentCatalog.professional_service_agreement
                .description,
            required: true,
          },
          {
            kind: "authority_decision",
            title: documentCatalog.authority_decision.title,
            description:
              documentCatalog.authority_decision.description,
            required: true,
          },
        ];
      }

      return [
        ...common,
        {
          kind: "assignment_letter",
          title:
            "Malikliği / Yetkiyi Destekleyen Belge",
          description:
            "Tapu, malik karar yazısı veya resmi dayanak belge.",
          required: true,
        },
      ];
    }, [form.representationType]);

  const uploadedKindCounts = useMemo(() => {
    return uploadedFiles.reduce<
      Record<RequiredDocumentKind, number>
    >(
      (acc, item) => {
        acc[item.kind] += 1;
        return acc;
      },
      {
        signed_contract: 0,
        authority_decision: 0,
        power_of_attorney: 0,
        assignment_letter: 0,
        professional_service_agreement: 0,
        other: 0,
      },
    );
  }, [uploadedFiles]);

  const requiredDocumentsMissing =
    useMemo(() => {
      return documentRequirements.filter(
        (item) =>
          item.required &&
          uploadedKindCounts[item.kind] <= 0,
      );
    }, [
      documentRequirements,
      uploadedKindCounts,
    ]);

  const validationErrors = useMemo(
    () =>
      validateManagementApplicationForm(
        form,
        requiredDocumentsMissing,
      ),
    [form, requiredDocumentsMissing],
  );

  const visibleErrors = submitAttempted
    ? errors
    : {};

  const summaryAddress = useMemo(() => {
    return [
      form.address.neighborhood,
      form.address.street,
      form.address.buildingNumber
        ? `No:${form.address.buildingNumber}`
        : "",
      form.address.apartmentNumber
        ? `D:${form.address.apartmentNumber}`
        : "",
      form.address.district,
      form.address.city,
      form.address.postalCode,
    ]
      .filter(Boolean)
      .join(", ");
  }, [form.address]);

  const stepCompletion = useMemo(
    () => ({
      basic:
        isEmailVerified &&
        isPhoneVerified &&
        !!form.propertyName.trim() &&
        !!form.structureType &&
        !!form.representationType &&
        // !!form.contactFullName.trim() &&
        !!form.taxOrIdentityNumber.trim() &&
        !!form.authorityStartDate.trim() &&
        !validationErrors.authorityEndDate,

      address:
        !!form.address.countryCode.trim() &&
        !!form.address.provinceId.trim() &&
        !!form.address.districtId.trim() &&
        !!form.address.neighborhoodId.trim() &&
        !!form.address.street.trim() &&
        !!form.address.buildingNumber.trim() &&
        !!form.address.postalCode.trim() &&
        blockCount > 0 &&
        totalApartmentCount > 0,

      documents:
        requiredDocumentsMissing.length === 0,

      review:
        form.consentAccuracy &&
        form.consentAuthority &&
        form.consentPrivacy &&
        form.consentContract,
    }),
    [
      blockCount,
      form,
      isEmailVerified,
      isPhoneVerified,
      requiredDocumentsMissing.length,
      totalApartmentCount,
      validationErrors.authorityEndDate,
    ],
  );

  const completedStepCount =
    Object.values(stepCompletion).filter(Boolean)
      .length;

  const progressValue = Math.round(
    (completedStepCount / managementApplicationWizardSteps.length) *
    100,
  );

  const canSubmit =
    stepCompletion.basic &&
    stepCompletion.address &&
    stepCompletion.documents &&
    stepCompletion.review;

  const handlePatch = <
    K extends keyof ManagementApplicationFormState,
  >(
    key: K,
    value: ManagementApplicationFormState[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleAddressChange = (
    address: ReturnType<typeof createDefaultManagementApplicationAddress>,
  ) => {
    setForm((prev) => ({
      ...prev,
      address,
    }));
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles((prev) =>
      prev.filter((item) => item.id !== id),
    );
  };

  const handleAddSelectedDocument = () => {
    if (!selectedFile) return;

    const nextItem: UploadedFileItem = {
      id: `${selectedDocumentKind}-${selectedFile.name}-${selectedFile.size}-${Date.now()}`,
      name: selectedFile.name,
      sizeLabel:
        selectedFile.size < 1024 * 1024
          ? `${Math.max(
            1,
            Math.round(selectedFile.size / 1024),
          )} KB`
          : `${(
            selectedFile.size /
            (1024 * 1024)
          ).toFixed(1)} MB`,
      kind: selectedDocumentKind,
      description:
        documentDescription.trim() || undefined,
    };

    setUploadedFiles((prev) => [
      ...prev,
      nextItem,
    ]);

    setSelectedFile(null);
    setDocumentDescription("");

    if (compactFileInputRef.current) {
      compactFileInputRef.current.value = "";
    }
  };

  const handleGoNext = () => {
    setSubmitAttempted(true);

    const nextErrors =
      validateManagementApplicationForm(
        form,
        requiredDocumentsMissing,
      );

    setErrors(nextErrors);

    const stepFields = getStepFields(
      currentStep.id,
    );

    const hasStepError = stepFields.some(
      (field) => !!nextErrors[field],
    );

    if (hasStepError) return;

    setSubmitAttempted(false);

    setActiveStepIndex((prev) =>
      Math.min(
        prev + 1,
        managementApplicationWizardSteps.length - 1,
      ),
    );
  };

  const handleGoBack = () => {
    setSubmitAttempted(false);

    setActiveStepIndex((prev) =>
      Math.max(prev - 1, 0),
    );
  };

  const handleStepClick = (
    index: number,
  ) => {
    setSubmitAttempted(false);

    if (index <= activeStepIndex) {
      setActiveStepIndex(index);
      return;
    }

    const previousSteps =
      managementApplicationWizardSteps.slice(0, index);

    const canJump = previousSteps.every(
      (step) =>
        stepCompletion[
        step.id as keyof typeof stepCompletion
        ],
    );

    if (canJump) {
      setActiveStepIndex(index);
    }
  };

  const handleSubmit = async () => {
    setSubmitAttempted(true);

    const nextErrors = validateManagementApplicationForm(
      form,
      requiredDocumentsMissing,
    );

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;


    const result = await submit(form);

    if (result.ok && result.data?.id) {
      setSuccessDialogOpen(true);
    }
  };

  return (
    <Stack spacing={3}>
      <PageHero
        progressValue={progressValue}
        completedStepCount={completedStepCount}
        totalSteps={managementApplicationWizardSteps.length}
      />

      <WizardStepper
        steps={managementApplicationWizardSteps}
        activeStepIndex={activeStepIndex}
        stepCompletion={stepCompletion}
        onStepClick={handleStepClick}
      />



      <Card
        variant="outlined"
        sx={{
          borderRadius: 5,
          border: `1px solid ${alpha(
            theme.palette.divider,
            0.72,
          )}`,
          bgcolor: alpha(
            theme.palette.background.paper,
            0.94,
          ),
          boxShadow:
            "0 16px 42px rgba(15, 23, 42, 0.045)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: { xs: 2, md: 4 },
            py: { xs: 2.25, md: 3 },
          }}
        >
          <Stack spacing={0.6}>
            <Chip
              label={`Adım ${activeStepIndex + 1
                } / ${managementApplicationWizardSteps.length}`}
              size="small"
              sx={{
                width: "fit-content",
                borderRadius: 999,
                fontWeight: 800,
                bgcolor: alpha(
                  theme.palette.primary.main,
                  0.08,
                ),
                color: "primary.main",
              }}
            />

            <Typography
              sx={{
                fontSize: {
                  xs: 22,
                  md: 25,
                },
                fontWeight: 900,
                letterSpacing: "-0.03em",
              }}
            >
              {currentStep.title}
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                maxWidth: 760,
                fontSize: 14,
              }}
            >
              {currentStep.description}
            </Typography>
          </Stack>
        </Box>

        <Divider />

        <Box
          sx={{
            px: { xs: 2, md: 4 },
            py: { xs: 2.5, md: 4 },
          }}
        >
          {currentStep.id === "basic" && (
            <BasicStep
              form={form}
              errors={visibleErrors}
              applicantFullName={applicantFullName}
              isEmailVerified={isEmailVerified}
              isPhoneVerified={isPhoneVerified}
              onPatch={handlePatch}
            />
          )}

          {currentStep.id === "address" && (
            <AddressAndBuildingStep
              form={form}
              errors={visibleErrors}
              blockCount={blockCount}
              totalApartmentCount={
                totalApartmentCount
              }
              onPatch={handlePatch}
              onAddressChange={
                handleAddressChange
              }
            />
          )}

          {currentStep.id ===
            "documents" && (
              <DocumentsStep
                requirements={
                  documentRequirements
                }
                uploadedKindCounts={
                  uploadedKindCounts
                }
                uploadedFiles={
                  uploadedFiles
                }
                selectedKind={
                  selectedDocumentKind
                }
                selectedFile={selectedFile}
                description={
                  documentDescription
                }
                error={
                  visibleErrors.documents
                }
                inputRef={
                  compactFileInputRef
                }
                onKindChange={
                  setSelectedDocumentKind
                }
                onFileChange={
                  setSelectedFile
                }
                onDescriptionChange={
                  setDocumentDescription
                }
                onAdd={
                  handleAddSelectedDocument
                }
                onRemove={
                  handleRemoveFile
                }
              />
            )}

          {currentStep.id === "review" && (
            <ReviewStep
              form={form}
              errors={visibleErrors}
              blockCount={blockCount}
              totalApartmentCount={
                totalApartmentCount
              }
              summaryAddress={
                summaryAddress
              }
              uploadedFiles={
                uploadedFiles
              }
              onPatch={handlePatch}
            />
          )}
        </Box>

        <Divider />

        <WizardFooter
          activeStepIndex={activeStepIndex}
          totalSteps={managementApplicationWizardSteps.length}
          canSubmit={canSubmit}
          isSubmitting={isSubmitting}
          submitMessage={submitMessage}
          existingApplicationId={existingApplicationId}
          onBack={handleGoBack}
          onNext={handleGoNext}
          onSubmit={handleSubmit}
          onExistingApplicationOpen={() => {
            if (existingApplicationId) {
              router.push(`/management-applications/${existingApplicationId}`);
            }
          }}
        />

      </Card>
      <Dialog
        open={successDialogOpen}
        onClose={() => {
          setSuccessDialogOpen(false);
          router.replace("/management-applications");
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 900 }}>
          Başvurunuz alınmıştır
        </DialogTitle>

        <DialogContent>
          <Typography color="text.secondary">
            Site/apartman yönetim başvurunuz başarıyla oluşturuldu. Başvurunuz
            incelenmek üzere sisteme alınmıştır.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            variant="contained"
            onClick={() => {
              setSuccessDialogOpen(false);
              router.replace("/management-applications");
            }}
            sx={{
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 900,
            }}
          >
            Tamam
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}