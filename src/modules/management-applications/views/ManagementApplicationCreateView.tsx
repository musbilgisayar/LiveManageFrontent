"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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

import {
  IconCircleCheck,
  IconFileCheck,
  IconShieldCheck,
} from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";
import { useAccountMe } from "@/modules/profile/hooks/useAccountMe";

import PageHero from "../components/create/PageHero";
import WizardStepper from "../components/create/WizardStepper";
import WizardFooter from "../components/create/WizardFooter";

import BasicStep from "../components/create/BasicStep";
import AddressAndBuildingStep from "../components/create/AddressAndBuildingStep";
import DocumentsStep from "../components/create/DocumentsStep";
import ReviewStep from "../components/create/ReviewStep";

import { useManagementApplicationCreate } from "../hooks/useManagementApplicationCreate";

import {
  createDefaultManagementApplicationAddress,
  initialManagementApplicationForm,
  managementApplicationWizardSteps,
} from "../utils/managementApplication.defaults";

import { documentCatalog } from "../components/create/constants";

import {
  getStepFields,
  validateManagementApplicationForm,
} from "../utils/managementApplication.validation";

import type {
  DocumentRequirement,
  ManagementApplicationFormState,
  RequiredDocumentKind,
  UploadedFileItem,
} from "../types/managementApplication.types";

const NS = "property:managementApplication.create";

export default function ManagementApplicationCreateView() {
  const router = useRouter();
  const theme = useTheme<Theme>();
  const { t } = useI18nNs(["property"]);
  const { user } = useAccountMe();

  const translate = (key: string, fallback: string) => {
    const value = t(key);
    return value && value !== key ? value : fallback;
  };

  const [form, setForm] = useState<ManagementApplicationFormState>(
    initialManagementApplicationForm,
  );

  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);
  const [selectedDocumentKind, setSelectedDocumentKind] =
    useState<RequiredDocumentKind>("signed_contract");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentDescription, setDocumentDescription] = useState("");
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const { isSubmitting, submitMessage, existingApplicationId, submit } =
    useManagementApplicationCreate();

  const compactFileInputRef = useRef<HTMLInputElement | null>(null);

  const isEmailVerified = true;
  const isPhoneVerified = true;

  const applicantFullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    translate(`${NS}.defaults.user`, "Kullanıcı");

  const currentStep = managementApplicationWizardSteps[activeStepIndex];

  const currentStepTitle = translate(
    `${NS}.steps.${currentStep.id}.title`,
    currentStep.title,
  );

  const currentStepDescription = translate(
    `${NS}.steps.${currentStep.id}.description`,
    currentStep.description,
  );

  const blockCount = Number.parseInt(form.blockCount || "0", 10) || 0;
  const totalApartmentCount =
    Number.parseInt(form.totalApartmentCount || "0", 10) || 0;

  const getDocumentText = (
    kind: RequiredDocumentKind,
    field: "title" | "description",
  ) => {
    const item = documentCatalog[kind];

    if (!item) {
      return field === "title"
        ? translate(`${NS}.documents.fallback.title`, "Belge")
        : "";
    }

    const key = field === "title" ? item.titleKey : item.descriptionKey;
    const fallback =
      field === "title" ? item.fallbackTitle : item.fallbackDescription;

    return translate(key, fallback);
  };

  const documentRequirements = useMemo<DocumentRequirement[]>(() => {
    const common: DocumentRequirement[] = [
      {
        kind: "signed_contract",
        title: getDocumentText("signed_contract", "title"),
        description: getDocumentText("signed_contract", "description"),
        required: true,
      },
    ];

    if (form.representationType === "proxy") {
      return [
        ...common,
        {
          kind: "power_of_attorney",
          title: getDocumentText("power_of_attorney", "title"),
          description: getDocumentText("power_of_attorney", "description"),
          required: true,
        },
      ];
    }

    if (form.representationType === "board_member") {
      return [
        ...common,
        {
          kind: "authority_decision",
          title: getDocumentText("authority_decision", "title"),
          description: getDocumentText("authority_decision", "description"),
          required: true,
        },
        {
          kind: "assignment_letter",
          title: getDocumentText("assignment_letter", "title"),
          description: getDocumentText("assignment_letter", "description"),
          required: false,
        },
      ];
    }

    if (form.representationType === "professional_manager") {
      return [
        ...common,
        {
          kind: "professional_service_agreement",
          title: getDocumentText("professional_service_agreement", "title"),
          description: getDocumentText(
            "professional_service_agreement",
            "description",
          ),
          required: true,
        },
        {
          kind: "authority_decision",
          title: getDocumentText("authority_decision", "title"),
          description: getDocumentText("authority_decision", "description"),
          required: true,
        },
      ];
    }

    return [
      ...common,
      {
        kind: "assignment_letter",
        title: getDocumentText("assignment_letter", "title"),
        description: getDocumentText("assignment_letter", "description"),
        required: true,
      },
    ];
  }, [form.representationType, t]);

  const uploadedKindCounts = useMemo(() => {
    return uploadedFiles.reduce<Record<RequiredDocumentKind, number>>(
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

  const requiredDocumentsMissing = useMemo(() => {
    return documentRequirements.filter(
      (item) => item.required && uploadedKindCounts[item.kind] <= 0,
    );
  }, [documentRequirements, uploadedKindCounts]);

  const validationErrors = useMemo(
    () =>
      validateManagementApplicationForm(form, requiredDocumentsMissing, t),
    [form, requiredDocumentsMissing, t],
  );

  const visibleErrors = submitAttempted ? validationErrors : {};

  const summaryAddress = useMemo(() => {
    return [
      form.address.neighborhood,
      form.address.street,
      form.address.buildingNumber ? `No:${form.address.buildingNumber}` : "",
      form.address.apartmentNumber ? `D:${form.address.apartmentNumber}` : "",
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

      documents: requiredDocumentsMissing.length === 0,

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

  const completedStepCount = Object.values(stepCompletion).filter(Boolean).length;

  const progressValue = Math.round(
    (completedStepCount / managementApplicationWizardSteps.length) * 100,
  );

  const canSubmit =
    stepCompletion.basic &&
    stepCompletion.address &&
    stepCompletion.documents &&
    stepCompletion.review;

  useEffect(() => {
    if (!applicantFullName.trim()) return;

    setForm((prev) =>
      prev.contactFullName.trim()
        ? prev
        : {
            ...prev,
            contactFullName: applicantFullName,
          },
    );
  }, [applicantFullName]);

  const handlePatch = <K extends keyof ManagementApplicationFormState>(
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
    setUploadedFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddSelectedDocument = () => {
    if (!selectedFile) return;

    const nextItem: UploadedFileItem = {
      id: `${selectedDocumentKind}-${selectedFile.name}-${selectedFile.size}-${Date.now()}`,
      name: selectedFile.name,
      sizeLabel:
        selectedFile.size < 1024 * 1024
          ? `${Math.max(1, Math.round(selectedFile.size / 1024))} KB`
          : `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
      kind: selectedDocumentKind,
      description: documentDescription.trim() || undefined,
    };

    setUploadedFiles((prev) => [...prev, nextItem]);
    setSelectedFile(null);
    setDocumentDescription("");

    if (compactFileInputRef.current) {
      compactFileInputRef.current.value = "";
    }
  };

  const handleGoNext = () => {
    setSubmitAttempted(true);

    const nextErrors = validateManagementApplicationForm(
      form,
      requiredDocumentsMissing,
      t,
    );

    const stepFields = getStepFields(currentStep.id);
    const hasStepError = stepFields.some((field) => !!nextErrors[field]);

    if (hasStepError) return;

    setSubmitAttempted(false);

    setActiveStepIndex((prev) =>
      Math.min(prev + 1, managementApplicationWizardSteps.length - 1),
    );
  };

  const handleGoBack = () => {
    setSubmitAttempted(false);
    setActiveStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleStepClick = (index: number) => {
    setSubmitAttempted(false);

    if (index <= activeStepIndex) {
      setActiveStepIndex(index);
      return;
    }

    const previousSteps = managementApplicationWizardSteps.slice(0, index);

    const canJump = previousSteps.every(
      (step) => stepCompletion[step.id as keyof typeof stepCompletion],
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
      t,
    );

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
          position: "relative",
          borderRadius: 6,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
          bgcolor: alpha(theme.palette.background.paper, 0.96),
          boxShadow: `0 24px 70px ${alpha(theme.palette.common.black, 0.08)}`,
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            height: 140,
            pointerEvents: "none",
            background: `linear-gradient(135deg, ${alpha(
              theme.palette.primary.main,
              0.12,
            )}, ${alpha(theme.palette.info.main, 0.06)}, transparent)`,
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            px: { xs: 2, md: 4 },
            py: { xs: 2.5, md: 3.5 },
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
          >
            <Stack spacing={0.9}>
              <Chip
                icon={<IconFileCheck size={16} />}
                label={`${translate(`${NS}.stepLabel`, "Adım")} ${
                  activeStepIndex + 1
                } / ${managementApplicationWizardSteps.length}`}
                size="small"
                sx={{
                  width: "fit-content",
                  borderRadius: 999,
                  fontWeight: 900,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: "primary.main",
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
                  "& .MuiChip-icon": {
                    color: "primary.main",
                  },
                }}
              />

              <Typography
                sx={{
                  fontSize: { xs: 23, md: 28 },
                  fontWeight: 950,
                  letterSpacing: "-0.04em",
                }}
              >
                {currentStepTitle}
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  maxWidth: 780,
                  fontSize: 14.5,
                  lineHeight: 1.7,
                }}
              >
                {currentStepDescription}
              </Typography>
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              sx={{
                p: 1,
                borderRadius: 999,
                bgcolor: alpha(theme.palette.background.paper, 0.72),
                border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                boxShadow: `0 10px 28px ${alpha(theme.palette.common.black, 0.05)}`,
              }}
            >
              <Chip
                icon={<IconShieldCheck size={16} />}
                label={translate(`${NS}.securityBadge`, "Güvenli inceleme")}
                size="small"
                sx={{
                  borderRadius: 999,
                  fontWeight: 800,
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  color: "success.main",
                  "& .MuiChip-icon": {
                    color: "success.main",
                  },
                }}
              />

              <Chip
                label={`%${progressValue}`}
                size="small"
                sx={{
                  borderRadius: 999,
                  fontWeight: 900,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: "primary.main",
                }}
              />
            </Stack>
          </Stack>
        </Box>

        <Divider />

        <Box
          sx={{
            position: "relative",
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
              totalApartmentCount={totalApartmentCount}
              onPatch={handlePatch}
              onAddressChange={handleAddressChange}
            />
          )}

          {currentStep.id === "documents" && (
            <DocumentsStep
              requirements={documentRequirements}
              uploadedKindCounts={uploadedKindCounts}
              uploadedFiles={uploadedFiles}
              selectedKind={selectedDocumentKind}
              selectedFile={selectedFile}
              description={documentDescription}
              error={visibleErrors.documents}
              inputRef={compactFileInputRef}
              onKindChange={setSelectedDocumentKind}
              onFileChange={setSelectedFile}
              onDescriptionChange={setDocumentDescription}
              onAdd={handleAddSelectedDocument}
              onRemove={handleRemoveFile}
            />
          )}

          {currentStep.id === "review" && (
            <ReviewStep
              form={form}
              errors={visibleErrors}
              blockCount={blockCount}
              totalApartmentCount={totalApartmentCount}
              summaryAddress={summaryAddress}
              uploadedFiles={uploadedFiles}
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
        PaperProps={{
          sx: {
            borderRadius: 5,
            overflow: "hidden",
            boxShadow: `0 24px 70px ${alpha(theme.palette.common.black, 0.18)}`,
          },
        }}
      >
        <Box
          sx={{
            px: 3,
            pt: 3,
            pb: 1,
            background: `linear-gradient(135deg, ${alpha(
              theme.palette.success.main,
              0.15,
            )}, ${alpha(theme.palette.primary.main, 0.08)})`,
          }}
        >
          <Box
            sx={{
              width: 54,
              height: 54,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              bgcolor: alpha(theme.palette.success.main, 0.14),
              color: "success.main",
              mb: 2,
            }}
          >
            <IconCircleCheck size={32} stroke={2.2} />
          </Box>

          <DialogTitle sx={{ p: 0, fontWeight: 950, letterSpacing: "-0.03em" }}>
            {translate(`${NS}.success.title`, "Başvurunuz alınmıştır")}
          </DialogTitle>
        </Box>

        <DialogContent sx={{ px: 3, pt: 2 }}>
          <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
            {translate(
              `${NS}.success.description`,
              "Site/apartman yönetim başvurunuz başarıyla oluşturuldu. Başvurunuz incelenmek üzere sisteme alınmıştır.",
            )}
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
              px: 3,
            }}
          >
            {translate(`${NS}.success.ok`, "Tamam")}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
