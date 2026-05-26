//src/modules/management-applications/views/ManagementApplicationCreateView.tsx
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
import { useAuth } from "@/app/context/AuthContext";
import { useAccountMe } from "@/modules/profile/hooks/useAccountMe";
import { useUserPhoneNumbersUltimate } from "@/modules/users/hooks/useUserPhoneNumbers_ultimate";

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

function cleanText(value?: string | null): string {
  return (value ?? "").trim();
}

function joinNonEmpty(
  values: Array<string | null | undefined>,
  separator = " ",
): string {
  return values.map(cleanText).filter(Boolean).join(separator).trim();
}

function readString(
  source: Record<string, unknown> | null,
  keys: string[],
): string {
  for (const key of keys) {
    const value = source?.[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function readBoolean(
  source: Record<string, unknown> | null,
  keys: string[],
): boolean {
  return keys.some((key) => source?.[key] === true);
}

function firstNonEmptyString(...values: Array<unknown>): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

export default function ManagementApplicationCreateView() {
  const router = useRouter();
  const theme = useTheme<Theme>();
  const { t: tNs } = useI18nNs("management-applications");
  const { user } = useAccountMe();
  const { user: authUser } = useAuth();

  const t = (key: string, fallback?: string) => {
    const value = tNs(key);

    if (!value) return fallback ?? key;
    if (value === key) return fallback ?? key;
    if (value === `[${key}]`) return fallback ?? key;

    return value;
  };

  const [form, setForm] = useState<ManagementApplicationFormState>(
    initialManagementApplicationForm,
  );

  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);
  const [selectedDocumentKind, setSelectedDocumentKind] =
    useState<RequiredDocumentKind>("SignedContract");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentDescription, setDocumentDescription] = useState("");
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const { isSubmitting, submitMessage, existingApplicationId, submit } =
    useManagementApplicationCreate();

  const compactFileInputRef = useRef<HTMLInputElement | null>(null);

  const accountRecord = user as Record<string, unknown> | null;
  const selfProfileRecord = accountRecord;
  const selfIdentityRecord =
    selfProfileRecord?.identity && typeof selfProfileRecord.identity === "object"
      ? (selfProfileRecord.identity as Record<string, unknown>)
      : null;
  const selfContactRecord =
    selfProfileRecord?.contact && typeof selfProfileRecord.contact === "object"
      ? (selfProfileRecord.contact as Record<string, unknown>)
      : null;
  const selfVerificationRecord =
    selfProfileRecord?.verification && typeof selfProfileRecord.verification === "object"
      ? (selfProfileRecord.verification as Record<string, unknown>)
      : null;
  const authRecord = authUser as Record<string, unknown> | null;
  const accountNestedUser =
    accountRecord?.user && typeof accountRecord.user === "object"
      ? (accountRecord.user as Record<string, unknown>)
      : null;
  const authNestedUser =
    authRecord?.user && typeof authRecord.user === "object"
      ? (authRecord.user as Record<string, unknown>)
      : null;

  const applicantUserId = firstNonEmptyString(
    readString(selfIdentityRecord, ["id", "userId", "appUserId", "applicationUserId", "sub"]),
    authUser?.id,
    authUser?.userId,
    authUser?.appUserId,
    authUser?.applicationUserId,
    authUser?.sub,
    authUser?.user?.id,
    authUser?.user?.userId,
    authUser?.user?.appUserId,
    authUser?.user?.applicationUserId,
    readString(accountRecord, ["id", "userId", "appUserId", "applicationUserId", "sub"]),
    readString(accountNestedUser, ["id", "userId", "appUserId", "applicationUserId", "sub"]),
    readString(selfProfileRecord, ["id", "userId", "appUserId", "applicationUserId", "sub"]),
  );

  const { items: applicantPhoneItems } = useUserPhoneNumbersUltimate(
    applicantUserId || undefined,
    { enabled: Boolean(applicantUserId) },
  );

  const selectedApplicantPhone = useMemo(() => {
    return (
      applicantPhoneItems.find((item) => item.isPrimary && item.isVerified) ||
      applicantPhoneItems.find((item) => item.isVerified) ||
      applicantPhoneItems.find((item) => item.isPrimary) ||
      applicantPhoneItems[0] ||
      null
    );
  }, [applicantPhoneItems]);

  const firstName =
    readString(selfIdentityRecord, ["firstName", "givenName"]) ||
    readString(selfProfileRecord, ["firstName", "givenName"]) ||
    readString(accountRecord, ["firstName", "givenName"]) ||
    readString(accountNestedUser, ["firstName", "givenName"]) ||
    readString(authRecord, ["firstName", "givenName"]) ||
    readString(authNestedUser, ["firstName", "givenName"]);

  const lastName =
    readString(selfIdentityRecord, ["lastName", "surname", "familyName"]) ||
    readString(selfProfileRecord, ["lastName", "surname", "familyName"]) ||
    readString(accountRecord, ["lastName", "surname", "familyName"]) ||
    readString(accountNestedUser, ["lastName", "surname", "familyName"]) ||
    readString(authRecord, ["lastName", "surname", "familyName"]) ||
    readString(authNestedUser, ["lastName", "surname", "familyName"]);

  const applicantEmail =
    readString(selfContactRecord, ["email", "emailAddress"]) ||
    readString(selfProfileRecord, ["email", "emailAddress"]) ||
    readString(accountRecord, ["email", "emailAddress"]) ||
    readString(accountNestedUser, ["email", "emailAddress"]) ||
    readString(authRecord, ["email", "emailAddress"]) ||
    readString(authNestedUser, ["email", "emailAddress"]);

  const applicantFullName =
    joinNonEmpty([firstName, lastName]) ||
    readString(selfIdentityRecord, ["fullName", "displayName", "name", "userName"]) ||
    readString(selfProfileRecord, ["fullName", "displayName", "name", "userName"]) ||
    readString(accountRecord, ["fullName", "displayName", "name", "userName"]) ||
    readString(accountNestedUser, ["fullName", "displayName", "name", "userName"]) ||
    readString(authRecord, ["fullName", "displayName", "name", "userName"]) ||
    readString(authNestedUser, ["fullName", "displayName", "name", "userName"]) ||
    applicantEmail;

  const phoneCountryCode =
    readString(selfContactRecord, ["phoneCountryCode", "countryCode"]) ||
    readString(selfProfileRecord, ["phoneCountryCode", "countryCode"]) ||
    readString(accountRecord, ["phoneCountryCode", "countryCode"]) ||
    readString(accountNestedUser, ["phoneCountryCode", "countryCode"]) ||
    readString(authRecord, ["phoneCountryCode", "countryCode"]) ||
    readString(authNestedUser, ["phoneCountryCode", "countryCode"]) ||
    cleanText(selectedApplicantPhone?.countryCode);

  const phoneNumber =
    readString(selfContactRecord, ["phoneNumber", "phone", "mobilePhone"]) ||
    readString(selfProfileRecord, ["phoneNumber", "phone", "mobilePhone"]) ||
    readString(accountRecord, ["phoneNumber", "phone", "mobilePhone"]) ||
    readString(accountNestedUser, ["phoneNumber", "phone", "mobilePhone"]) ||
    readString(authRecord, ["phoneNumber", "phone", "mobilePhone"]) ||
    readString(authNestedUser, ["phoneNumber", "phone", "mobilePhone"]) ||
    cleanText(selectedApplicantPhone?.phoneNumber);

  const applicantPhone = joinNonEmpty(
    [phoneCountryCode, phoneNumber],
    " ",
  );

  const isEmailVerified =
    readBoolean(selfVerificationRecord, ["isEmailConfirmed", "emailConfirmed", "emailVerified"]) ||
    readBoolean(selfProfileRecord, ["isEmailConfirmed", "emailConfirmed", "emailVerified"]) ||
    readBoolean(accountRecord, ["isEmailConfirmed", "emailConfirmed", "emailVerified"]) ||
    readBoolean(accountNestedUser, ["isEmailConfirmed", "emailConfirmed", "emailVerified"]) ||
    readBoolean(authRecord, ["isEmailConfirmed", "emailConfirmed", "emailVerified"]) ||
    readBoolean(authNestedUser, ["isEmailConfirmed", "emailConfirmed", "emailVerified"]);

  const isPhoneVerified =
    readBoolean(selfVerificationRecord, ["isPhoneConfirmed", "phoneConfirmed", "phoneVerified"]) ||
    readBoolean(selfProfileRecord, ["isPhoneConfirmed", "phoneConfirmed", "phoneVerified"]) ||
    readBoolean(accountRecord, ["isPhoneConfirmed", "phoneConfirmed", "phoneVerified"]) ||
    readBoolean(accountNestedUser, ["isPhoneConfirmed", "phoneConfirmed", "phoneVerified"]) ||
    readBoolean(authRecord, ["isPhoneConfirmed", "phoneConfirmed", "phoneVerified"]) ||
    readBoolean(authNestedUser, ["isPhoneConfirmed", "phoneConfirmed", "phoneVerified"]) ||
    selectedApplicantPhone?.isVerified === true;

  const currentStep = managementApplicationWizardSteps[activeStepIndex];

  const currentStepTitle = t(
    `management-applications:create.steps.${currentStep.id}.title`,
    currentStep.title,
  );

  const currentStepDescription = t(
    `management-applications:create.steps.${currentStep.id}.description`,
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
        ? t("management-applications:create.documents.fallback.title", "Belge")
        : "";
    }

    const key = field === "title" ? item.titleKey : item.descriptionKey;
    const fallback =
      field === "title" ? item.fallbackTitle : item.fallbackDescription;

    return t(key, fallback);
  };

  const documentRequirements = useMemo<DocumentRequirement[]>(() => {
    const common: DocumentRequirement[] = [
      {
        kind: "SignedContract",
        title: getDocumentText("SignedContract", "title"),
        description: getDocumentText("SignedContract", "description"),
        required: true,
      },
    ];

    if (form.representationType === "proxy") {
      return [
        ...common,
        {
          kind: "PowerOfAttorney",
          title: getDocumentText("PowerOfAttorney", "title"),
          description: getDocumentText("PowerOfAttorney", "description"),
          required: true,
        },
      ];
    }

    if (form.representationType === "board_member") {
      return [
        ...common,
        {
          kind: "AuthorityDecision",
          title: getDocumentText("AuthorityDecision", "title"),
          description: getDocumentText("AuthorityDecision", "description"),
          required: true,
        },
        {
          kind: "AssignmentLetter",
          title: getDocumentText("AssignmentLetter", "title"),
          description: getDocumentText("AssignmentLetter", "description"),
          required: false,
        },
      ];
    }

    if (form.representationType === "professional_manager") {
      return [
        ...common,
        {
          kind: "ProfessionalServiceAgreement",
          title: getDocumentText("ProfessionalServiceAgreement", "title"),
          description: getDocumentText(
            "ProfessionalServiceAgreement",
            "description",
          ),
          required: true,
        },
        {
          kind: "AuthorityDecision",
          title: getDocumentText("AuthorityDecision", "title"),
          description: getDocumentText("AuthorityDecision", "description"),
          required: true,
        },
      ];
    }

    return [
      ...common,
      {
        kind: "AssignmentLetter",
        title: getDocumentText("AssignmentLetter", "title"),
        description: getDocumentText("AssignmentLetter", "description"),
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
        SignedContract: 0,
        AuthorityDecision: 0,
        PowerOfAttorney: 0,
        AssignmentLetter: 0,
        ProfessionalServiceAgreement: 0,
        IdentityDocument: 0,
        PropertyRegistryDocument: 0,
        Other: 0,
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
    if (!applicantFullName && !applicantEmail && !applicantPhone) return;

    setForm((prev) => {
      const nextContactFullName =
        prev.contactFullName.trim() || applicantFullName;
      const nextContactEmail = prev.contactEmail.trim() || applicantEmail;
      const nextContactPhone = prev.contactPhone.trim() || applicantPhone;

      if (
        prev.contactFullName === nextContactFullName &&
        prev.contactEmail === nextContactEmail &&
        prev.contactPhone === nextContactPhone
      ) {
        return prev;
      }

      return {
        ...prev,
        contactFullName: nextContactFullName,
        contactEmail: nextContactEmail,
        contactPhone: nextContactPhone,
      };
    });
  }, [
    applicantEmail,
    applicantFullName,
    applicantPhone,
  ]);

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
      file: selectedFile,
      uploadStatus: "local",
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
  if (currentStep.id !== "review") {
    handleGoNext();
    return;
  }

  setSubmitAttempted(true);

  const nextErrors = validateManagementApplicationForm(
    form,
    requiredDocumentsMissing,
    t,
  );

  if (Object.keys(nextErrors).length > 0) return;

  const result = await submit(form, uploadedFiles);

  if (result.ok && result.data?.id) {
    setSuccessDialogOpen(true);
  }
};

  return (
    <Stack spacing={3}>
      <PageHero />

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
                label={`${t("management-applications:create.stepLabel", "Adım")} ${
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
                label={t("management-applications:create.securityBadge", "Güvenli inceleme")}
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
              applicantEmail={applicantEmail}
              applicantPhone={applicantPhone}
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
            {t("management-applications:create.success.title", "Başvurunuz alınmıştır")}
          </DialogTitle>
        </Box>

        <DialogContent sx={{ px: 3, pt: 2 }}>
          <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
            {t(
              "management-applications:create.success.description",
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
            {t("management-applications:create.success.ok", "Tamam")}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
