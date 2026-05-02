// src/modules/management-applications/views/ManagementApplicationCreateView.tsx
"use client";

import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  alpha,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import {
  IconArrowLeft,
  IconArrowRight,
  IconBuildingCommunity,
  IconCheck,
  IconCircleCheck,
  IconDownload,
  IconFileText,
  IconHome,
  IconInfoCircle,
  IconMapPin,
  IconMailCheck,
  IconPhoneCheck,
  IconShieldCheck,
  IconUpload,
  IconUserShield,
  IconX,
} from "@tabler/icons-react";
import { useAddressCountries } from "@/modules/users/hooks/useAddressCountries";
import { useAddressHierarchy } from "@/modules/users/hooks/useAddressHierarchy";

type ManagementStructureType = "site" | "apartment";

type RepresentationType =
  | "owner"
  | "proxy"
  | "board_member"
  | "professional_manager";

type RequiredDocumentKind =
  | "signed_contract"
  | "authority_decision"
  | "power_of_attorney"
  | "assignment_letter"
  | "professional_service_agreement"
  | "other";

type UploadedFileItem = {
  id: string;
  name: string;
  sizeLabel: string;
  kind: RequiredDocumentKind;
  description?: string;
};

type AddressForm = {
  country: string;
  countryCode: string;
  city: string;
  district: string;
  neighborhood: string;
  street: string;
  buildingNumber: string;
  apartmentNumber: string;
  postalCode: string;
  provinceId: string;
  districtId: string;
  neighborhoodId: string;
};

type FormState = {
  structureType: ManagementStructureType;
  propertyName: string;
  representationType: RepresentationType;
  blockCount: string;
  totalApartmentCount: string;
  contactFullName: string;
  contactEmail: string;
  contactPhone: string;
  taxOrIdentityNumber: string;
  authorityStartDate: string;
  authorityEndDate: string;
  address: AddressForm;
  note: string;
  consentAccuracy: boolean;
  consentAuthority: boolean;
  consentPrivacy: boolean;
  consentContract: boolean;
};

type FormErrors = Partial<Record<string, string>>;

type DocumentRequirement = {
  kind: RequiredDocumentKind;
  title: string;
  description: string;
  required: boolean;
};

type WizardStepId = "basic" | "address" | "documents" | "review";

type WizardStep = {
  id: WizardStepId;
  index: number;
  title: string;
  description: string;
};

const createDefaultAddress = (): AddressForm => ({
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

const initialForm: FormState = {
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
  address: createDefaultAddress(),
  note: "",
  consentAccuracy: false,
  consentAuthority: false,
  consentPrivacy: false,
  consentContract: false,
};

const wizardSteps: WizardStep[] = [
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

const structureOptions: Array<{
  value: ManagementStructureType;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    value: "site",
    label: "Site Yönetimi",
    description: "Birden fazla blok veya toplu yaşam alanı için başvuru",
    icon: <IconBuildingCommunity size={28} stroke={1.9} />,
  },
  {
    value: "apartment",
    label: "Apartman Yönetimi",
    description: "Tek yapı veya sınırlı bağımsız bölüm için başvuru",
    icon: <IconHome size={28} stroke={1.9} />,
  },
];

const representationOptions: Array<{
  value: RepresentationType;
  label: string;
  description: string;
}> = [
  {
    value: "owner",
    label: "Malik / Kat Maliki",
    description: "Doğrudan malik sıfatıyla başvuru",
  },
  {
    value: "proxy",
    label: "Vekil",
    description: "Vekaletname ile temsil",
  },
  {
    value: "board_member",
    label: "Yönetim Kurulu / Temsilci",
    description: "Karar veya görevlendirme ile temsil",
  },
  {
    value: "professional_manager",
    label: "Profesyonel Yönetici",
    description: "Sözleşme veya hizmet anlaşması ile temsil",
  },
];

const documentCatalog: Record<
  RequiredDocumentKind,
  { title: string; description: string }
> = {
  signed_contract: {
    title: "İmzalı Hizmet Sözleşmesi",
    description: "Sistemden indirilen sözleşmenin imzalanmış hali.",
  },
  authority_decision: {
    title: "Yönetim Kararı / Karar Defteri",
    description: "Yönetim veya kurul kararı ile verilen yetki belgesi.",
  },
  power_of_attorney: {
    title: "Vekaletname",
    description: "Temsil yetkisini gösteren resmi vekalet belgesi.",
  },
  assignment_letter: {
    title: "Görevlendirme Yazısı",
    description: "Kurul, yönetim veya malikçe verilmiş görevlendirme belgesi.",
  },
  professional_service_agreement: {
    title: "Profesyonel Yönetim Sözleşmesi",
    description: "Profesyonel yönetici ile yapı arasında yapılan hizmet sözleşmesi.",
  },
  other: {
    title: "Diğer Belge",
    description: "Başvuruyu destekleyen ek belge.",
  },
};

const premiumFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 3,
    bgcolor: "background.paper",
  },
  "& .MuiInputBase-input": {
    fontSize: 14,
  },
  "& .MuiSelect-select": {
    fontSize: 14,
    display: "flex",
    alignItems: "center",
  },
  "& .MuiFormHelperText-root": {
    ml: 0,
    mt: 0.6,
    minHeight: 20,
    fontWeight: 600,
  },
} as const;

export default function ManagementApplicationCreateView() {
  const theme = useTheme<Theme>();

  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);

  const [selectedDocumentKind, setSelectedDocumentKind] =
    useState<RequiredDocumentKind>("signed_contract");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentDescription, setDocumentDescription] = useState("");
  const compactFileInputRef = useRef<HTMLInputElement | null>(null);

  const isEmailVerified = true;
  const isPhoneVerified = true;

  const currentStep = wizardSteps[activeStepIndex];

  const blockCount = Number.parseInt(form.blockCount || "0", 10) || 0;
  const totalApartmentCount =
    Number.parseInt(form.totalApartmentCount || "0", 10) || 0;

  const documentRequirements = useMemo<DocumentRequirement[]>(() => {
    const common: DocumentRequirement[] = [
      {
        kind: "signed_contract",
        title: documentCatalog.signed_contract.title,
        description: documentCatalog.signed_contract.description,
        required: true,
      },
    ];

    if (form.representationType === "proxy") {
      return [
        ...common,
        {
          kind: "power_of_attorney",
          title: documentCatalog.power_of_attorney.title,
          description: documentCatalog.power_of_attorney.description,
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
          description: documentCatalog.authority_decision.description,
          required: true,
        },
        {
          kind: "assignment_letter",
          title: documentCatalog.assignment_letter.title,
          description: documentCatalog.assignment_letter.description,
          required: false,
        },
      ];
    }

    if (form.representationType === "professional_manager") {
      return [
        ...common,
        {
          kind: "professional_service_agreement",
          title: documentCatalog.professional_service_agreement.title,
          description: documentCatalog.professional_service_agreement.description,
          required: true,
        },
        {
          kind: "authority_decision",
          title: documentCatalog.authority_decision.title,
          description: documentCatalog.authority_decision.description,
          required: true,
        },
      ];
    }

    return [
      ...common,
      {
        kind: "assignment_letter",
        title: "Malikliği / Yetkiyi Destekleyen Belge",
        description: "Tapu, malik karar yazısı veya resmi dayanak belge.",
        required: true,
      },
    ];
  }, [form.representationType]);

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

  const validationErrors = useMemo(
    () => validateForm(form, requiredDocumentsMissing),
    [form, requiredDocumentsMissing],
  );

  const visibleErrors = submitAttempted ? errors : {};

  const stepCompletion = useMemo<Record<WizardStepId, boolean>>(
    () => ({
      basic:
        isEmailVerified &&
        isPhoneVerified &&
        !!form.propertyName.trim() &&
        !!form.structureType &&
        !!form.representationType &&
        !!form.contactFullName.trim() &&
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
  const progressValue = Math.round((completedStepCount / wizardSteps.length) * 100);

  const canSubmit =
    stepCompletion.basic &&
    stepCompletion.address &&
    stepCompletion.documents &&
    stepCompletion.review;

  const handlePatch = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddressChange = (address: AddressForm) => {
    setForm((prev) => ({ ...prev, address }));
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddSelectedDocument = () => {
    if (!selectedFile) return;

    const nextItem: UploadedFileItem = {
      id: `${selectedDocumentKind}-${selectedFile.name}-${selectedFile.size}-${Date.now()}`,
      name: selectedFile.name,
      sizeLabel: formatFileSize(selectedFile.size),
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

    const nextErrors = validateForm(form, requiredDocumentsMissing);
    setErrors(nextErrors);

    const stepFields = getStepFields(currentStep.id);
    const hasStepError = stepFields.some((field) => !!nextErrors[field]);

    if (hasStepError) return;

    setSubmitAttempted(false);
    setActiveStepIndex((prev) => Math.min(prev + 1, wizardSteps.length - 1));
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

    const previousSteps = wizardSteps.slice(0, index);
    const canJump = previousSteps.every((step) => stepCompletion[step.id]);

    if (canJump) setActiveStepIndex(index);
  };

  return (
    <Stack spacing={3}>
      <PageHero
        progressValue={progressValue}
        completedStepCount={completedStepCount}
        totalSteps={wizardSteps.length}
      />

      <WizardStepper
        steps={wizardSteps}
        activeStepIndex={activeStepIndex}
        stepCompletion={stepCompletion}
        onStepClick={handleStepClick}
      />

      <Card
        variant="outlined"
        sx={{
          borderRadius: 5,
          border: `1px solid ${alpha(theme.palette.divider, 0.72)}`,
          bgcolor: alpha(theme.palette.background.paper, 0.94),
          boxShadow: "0 16px 42px rgba(15, 23, 42, 0.045)",
          overflow: "hidden",
        }}
      >
        <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 2.25, md: 3 } }}>
          <Stack spacing={0.6}>
            <Chip
              label={`Adım ${activeStepIndex + 1} / ${wizardSteps.length}`}
              size="small"
              sx={{
                width: "fit-content",
                borderRadius: 999,
                fontWeight: 800,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: "primary.main",
              }}
            />

            <Typography
              sx={{
                fontSize: { xs: 22, md: 25 },
                fontWeight: 900,
                letterSpacing: "-0.03em",
              }}
            >
              {currentStep.title}
            </Typography>

            <Typography color="text.secondary" sx={{ maxWidth: 760, fontSize: 14 }}>
              {currentStep.description}
            </Typography>
          </Stack>
        </Box>

        <Divider />

        <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 2.5, md: 4 } }}>
          {currentStep.id === "basic" && (
            <BasicStep
              form={form}
              errors={visibleErrors}
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
          totalSteps={wizardSteps.length}
          canSubmit={canSubmit}
          onBack={handleGoBack}
          onNext={handleGoNext}
        />
      </Card>
    </Stack>
  );
}

function PageHero({
  progressValue,
  completedStepCount,
  totalSteps,
}: {
  progressValue: number;
  completedStepCount: number;
  totalSteps: number;
}) {
  const theme = useTheme<Theme>();

  return (
    <Card
      variant="outlined"
      sx={{
        p: { xs: 2.25, md: 3 },
        borderRadius: 5,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.055,
        )}, ${alpha(theme.palette.background.paper, 0.96)})`,
        boxShadow: "0 16px 42px rgba(15, 23, 42, 0.04)",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={2.5}
      >
        <Stack spacing={0.85}>
          <Chip
            icon={<IconShieldCheck size={15} />}
            label="Güvenli başvuru süreci"
            size="small"
            sx={{
              width: "fit-content",
              borderRadius: 999,
              fontWeight: 800,
              bgcolor: alpha(theme.palette.success.main, 0.09),
              color: "success.dark",
            }}
          />

          <Typography
            sx={{
              fontSize: { xs: 23, md: 28 },
              fontWeight: 900,
              letterSpacing: "-0.035em",
              lineHeight: 1.18,
            }}
          >
            Yönetim başvurunuzu tamamlayın
          </Typography>

          <Typography color="text.secondary" sx={{ maxWidth: 760, fontSize: 14 }}>
            Yapı bilgileri, adres, belgeler ve onaylar sadeleştirilmiş bir akışla
            toplanır. Eksik alanlar varsa göndermeden önce size gösterilir.
          </Typography>
        </Stack>

        <Box
          sx={{
            minWidth: { xs: "100%", md: 260 },
            p: 2,
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
            bgcolor: alpha(theme.palette.background.paper, 0.72),
          }}
        >
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary" fontWeight={700}>
                Tamamlanma
              </Typography>
              <Typography variant="body2" fontWeight={900}>
                {progressValue === 0 ? "Henüz başlanmadı" : `%${progressValue}`}
              </Typography>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={progressValue}
              sx={{
                height: 8,
                borderRadius: 999,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                "& .MuiLinearProgress-bar": {
                  borderRadius: 999,
                },
              }}
            />

            <Typography variant="caption" color="text.secondary">
              {completedStepCount}/{totalSteps} adım tamamlandı.
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}

function WizardStepper({
  steps,
  activeStepIndex,
  stepCompletion,
  onStepClick,
}: {
  steps: WizardStep[];
  activeStepIndex: number;
  stepCompletion: Record<WizardStepId, boolean>;
  onStepClick: (index: number) => void;
}) {
  const theme = useTheme<Theme>();

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 5,
        border: `1px solid ${alpha(theme.palette.divider, 0.72)}`,
        bgcolor: alpha(theme.palette.background.paper, 0.94),
        boxShadow: "0 10px 32px rgba(15, 23, 42, 0.035)",
        p: { xs: 1.35, md: 1.75 },
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: `repeat(${steps.length}, 1fr)` },
          gap: 1.1,
        }}
      >
        {steps.map((step, index) => {
          const active = index === activeStepIndex;
          const done = stepCompletion[step.id];

          return (
            <Box
              key={step.id}
              onClick={() => onStepClick(index)}
              role="button"
              tabIndex={0}
              sx={{
                p: 1.25,
                borderRadius: 4,
                cursor: "pointer",
                border: `1px solid ${
                  active
                    ? alpha(theme.palette.primary.main, 0.3)
                    : alpha(theme.palette.divider, 0.64)
                }`,
                bgcolor: active
                  ? alpha(theme.palette.primary.main, 0.065)
                  : done
                    ? alpha(theme.palette.success.main, 0.045)
                    : alpha(theme.palette.background.default, 0.24),
                transition: "all 160ms ease",
                "&:hover": {
                  borderColor: alpha(theme.palette.primary.main, 0.28),
                  bgcolor: alpha(theme.palette.primary.main, 0.045),
                },
              }}
            >
              <Stack direction="row" spacing={1.1} alignItems="center">
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                    fontWeight: 900,
                    color: done
                      ? "success.main"
                      : active
                        ? "primary.main"
                        : "text.secondary",
                    bgcolor: done
                      ? alpha(theme.palette.success.main, 0.1)
                      : active
                        ? alpha(theme.palette.primary.main, 0.1)
                        : alpha(theme.palette.grey[500], 0.08),
                  }}
                >
                  {done ? <IconCheck size={17} /> : step.index}
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={900} noWrap sx={{ fontSize: 14 }}>
                    {step.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {step.description}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          );
        })}
      </Box>
    </Card>
  );
}

function BasicStep({
  form,
  errors,
  isEmailVerified,
  isPhoneVerified,
  onPatch,
}: {
  form: FormState;
  errors: FormErrors;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  onPatch: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}) {
  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={1.25}>
        <VerificationBadge
          ok={isEmailVerified}
          icon={<IconMailCheck size={17} />}
          label="E-posta doğrulandı"
          hint={form.contactEmail || "Hesabınızdaki doğrulanmış e-posta kullanılacak"}
        />
        <VerificationBadge
          ok={isPhoneVerified}
          icon={<IconPhoneCheck size={17} />}
          label="Telefon doğrulandı"
          hint={form.contactPhone || "Hesabınızdaki doğrulanmış telefon kullanılacak"}
        />
      </Stack>

      <SectionCard
        icon={<IconBuildingCommunity size={19} />}
        title="Yapı türü"
        description="Başvurunun hangi yapı türü için yapılacağını seçin."
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
          }}
        >
          {structureOptions.map((item) => (
            <SelectionCard
              key={item.value}
              selected={form.structureType === item.value}
              title={item.label}
              description={item.description}
              icon={item.icon}
              onClick={() => onPatch("structureType", item.value)}
            />
          ))}
        </Box>
      </SectionCard>

      <SectionCard
        icon={<IconUserShield size={19} />}
        title="Başvuru ve temsil bilgileri"
        description="Resmi muhatap, temsil şekli ve yetki süresini girin."
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
          }}
        >
          <TextField
            label="Yapı adı"
            value={form.propertyName}
            onChange={(event) => onPatch("propertyName", event.target.value)}
            error={!!errors.propertyName}
            helperText={errors.propertyName ?? "Örn: Green Park Sitesi"}
            fullWidth
            sx={premiumFieldSx}
          />

          <TextField
            select
            label="Temsil şekli"
            value={form.representationType}
            onChange={(event) =>
              onPatch("representationType", event.target.value as RepresentationType)
            }
            helperText={
              representationOptions.find(
                (item) => item.value === form.representationType,
              )?.description ?? " "
            }
            fullWidth
            sx={premiumFieldSx}
          >
            {representationOptions.map((item) => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Ad Soyad / Yetkili Kişi"
            value={form.contactFullName}
            onChange={(event) => onPatch("contactFullName", event.target.value)}
            error={!!errors.contactFullName}
            helperText={errors.contactFullName ?? "Başvuruda resmi muhatap olacak kişi"}
            fullWidth
            sx={premiumFieldSx}
          />

          <TextField
            label="Kimlik / Vergi / Kayıt Numarası"
            value={form.taxOrIdentityNumber}
            onChange={(event) => onPatch("taxOrIdentityNumber", event.target.value)}
            error={!!errors.taxOrIdentityNumber}
            helperText={errors.taxOrIdentityNumber ?? "Gerçek kişi, şirket veya kurum numarası"}
            fullWidth
            sx={premiumFieldSx}
          />

          <TextField
            label="Yetki başlangıç tarihi"
            type="date"
            value={form.authorityStartDate}
            onChange={(event) => onPatch("authorityStartDate", event.target.value)}
            InputLabelProps={{ shrink: true }}
            error={!!errors.authorityStartDate}
            helperText={errors.authorityStartDate ?? " "}
            fullWidth
            sx={premiumFieldSx}
          />

          <TextField
            label="Yetki bitiş tarihi"
            type="date"
            value={form.authorityEndDate}
            onChange={(event) => onPatch("authorityEndDate", event.target.value)}
            InputLabelProps={{ shrink: true }}
            error={!!errors.authorityEndDate}
            helperText={errors.authorityEndDate ?? "Süresiz ise boş bırakabilirsiniz"}
            fullWidth
            sx={premiumFieldSx}
          />
        </Box>
      </SectionCard>
    </Stack>
  );
}

function AddressAndBuildingStep({
  form,
  errors,
  blockCount,
  totalApartmentCount,
  onPatch,
  onAddressChange,
}: {
  form: FormState;
  errors: FormErrors;
  blockCount: number;
  totalApartmentCount: number;
  onPatch: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  onAddressChange: (next: AddressForm) => void;
}) {
  return (
    <Stack spacing={3}>
      <SectionCard
        icon={<IconMapPin size={19} />}
        title="Adres bilgileri"
        description="Adresinizi hiyerarşik seçimlerle tamamlayın."
      >
        <AddressHierarchySection
          value={form.address}
          onChange={onAddressChange}
          errors={errors}
        />
      </SectionCard>

      <SectionCard
        icon={<IconHome size={19} />}
        title="Yapı ölçeği"
        description="Başvuru yapılan yapının blok ve daire bilgisini girin."
      >
        <Stack spacing={2}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2,
            }}
          >
            <TextField
              type="number"
              label="Blok sayısı"
              value={form.blockCount}
              onChange={(event) => onPatch("blockCount", event.target.value)}
              error={!!errors.blockCount}
              helperText={errors.blockCount ?? "Yapıdaki toplam blok sayısı"}
              fullWidth
              sx={premiumFieldSx}
            />

            <TextField
              type="number"
              label="Toplam daire sayısı"
              value={form.totalApartmentCount}
              onChange={(event) => onPatch("totalApartmentCount", event.target.value)}
              error={!!errors.totalApartmentCount}
              helperText={errors.totalApartmentCount ?? "Yapıdaki toplam daire sayısı"}
              fullWidth
              sx={premiumFieldSx}
            />
          </Box>

          <InlineNotice tone="info">
            Başvuru özeti: {getStructureLabel(form.structureType)} ·{" "}
            {form.propertyName || "Yapı adı girilmedi"} · {blockCount || 0} blok ·{" "}
            {totalApartmentCount || 0} daire
          </InlineNotice>
        </Stack>
      </SectionCard>
    </Stack>
  );
}

function DocumentsStep({
  requirements,
  uploadedKindCounts,
  uploadedFiles,
  selectedKind,
  selectedFile,
  description,
  error,
  inputRef,
  onKindChange,
  onFileChange,
  onDescriptionChange,
  onAdd,
  onRemove,
}: {
  requirements: DocumentRequirement[];
  uploadedKindCounts: Record<RequiredDocumentKind, number>;
  uploadedFiles: UploadedFileItem[];
  selectedKind: RequiredDocumentKind;
  selectedFile: File | null;
  description: string;
  error?: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onKindChange: (kind: RequiredDocumentKind) => void;
  onFileChange: (file: File | null) => void;
  onDescriptionChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <Stack spacing={3}>
      <DocumentRequirementSummary
        requirements={requirements}
        uploadedKindCounts={uploadedKindCounts}
      />

      <CompactDocumentUploader
        requirements={requirements}
        selectedKind={selectedKind}
        selectedFile={selectedFile}
        description={description}
        onKindChange={onKindChange}
        onFileChange={onFileChange}
        onDescriptionChange={onDescriptionChange}
        onAdd={onAdd}
        inputRef={inputRef}
      />

      <UploadedDocumentList files={uploadedFiles} onRemove={onRemove} />

      {error && <InlineNotice tone="warning">{error}</InlineNotice>}
    </Stack>
  );
}

function ReviewStep({
  form,
  errors,
  blockCount,
  totalApartmentCount,
  summaryAddress,
  uploadedFiles,
  onPatch,
}: {
  form: FormState;
  errors: FormErrors;
  blockCount: number;
  totalApartmentCount: number;
  summaryAddress: string;
  uploadedFiles: UploadedFileItem[];
  onPatch: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}) {
  return (
    <Stack spacing={3}>
      <SectionCard
        icon={<IconInfoCircle size={19} />}
        title="Başvuru açıklaması"
        description="Eklemek istediğiniz özel bir not varsa yazabilirsiniz."
      >
        <TextField
          label="Açıklama"
          value={form.note}
          onChange={(event) => onPatch("note", event.target.value)}
          helperText="Bu alan zorunlu değildir."
          multiline
          minRows={4}
          fullWidth
          sx={premiumFieldSx}
        />
      </SectionCard>

      <SummaryPanel
        items={[
          { label: "Yapı tipi", value: getStructureLabel(form.structureType) },
          { label: "Yapı adı", value: form.propertyName || "-" },
          { label: "Temsil", value: getRepresentationLabel(form.representationType) },
          { label: "Yetkili kişi", value: form.contactFullName || "-" },
          { label: "Yetki başlangıcı", value: form.authorityStartDate || "-" },
          {
            label: "Yetki bitişi",
            value: form.authorityEndDate || "Süresiz / belirtilmedi",
          },
          { label: "Adres", value: summaryAddress || "-" },
          { label: "Blok sayısı", value: `${blockCount}` },
          { label: "Toplam daire sayısı", value: `${totalApartmentCount}` },
          { label: "Eklenen belge", value: `${uploadedFiles.length} belge` },
        ]}
      />

      <LegalConsentBox form={form} errors={errors} onPatch={onPatch} />
    </Stack>
  );
}

function SectionCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const theme = useTheme<Theme>();

  return (
    <Box
      sx={{
        p: { xs: 2, md: 2.35 },
        borderRadius: 4.5,
        border: `1px solid ${alpha(theme.palette.divider, 0.72)}`,
        bgcolor: alpha(theme.palette.background.paper, 0.84),
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.032)",
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 3,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              color: "primary.main",
            }}
          >
            {icon}
          </Box>

          <Box>
            <Typography fontWeight={900} fontSize={16}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.25}>
              {description}
            </Typography>
          </Box>
        </Stack>

        {children}
      </Stack>
    </Box>
  );
}

function SelectionCard({
  selected,
  title,
  description,
  icon,
  onClick,
}: {
  selected: boolean;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  const theme = useTheme<Theme>();

  return (
    <Box
      onClick={onClick}
      role="button"
      tabIndex={0}
      sx={{
        position: "relative",
        p: 2,
        minHeight: 128,
        borderRadius: 4,
        border: `1px solid ${
          selected
            ? alpha(theme.palette.primary.main, 0.42)
            : alpha(theme.palette.divider, 0.76)
        }`,
        bgcolor: selected
          ? alpha(theme.palette.primary.main, 0.055)
          : alpha(theme.palette.background.default, 0.28),
        cursor: "pointer",
        transition: "all 160ms ease",
        "&:hover": {
          transform: "translateY(-1px)",
          borderColor: alpha(theme.palette.primary.main, 0.34),
          bgcolor: alpha(theme.palette.primary.main, 0.045),
        },
      }}
    >
      {selected && (
        <Box
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 28,
            height: 28,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            bgcolor: "primary.main",
            color: "primary.contrastText",
          }}
        >
          <IconCheck size={16} stroke={2.8} />
        </Box>
      )}

      <Stack spacing={1.25}>
        <Box
          sx={{
            width: 50,
            height: 50,
            borderRadius: 3.25,
            display: "grid",
            placeItems: "center",
            bgcolor: selected
              ? alpha(theme.palette.primary.main, 0.1)
              : alpha(theme.palette.grey[500], 0.08),
            color: selected ? "primary.main" : "text.primary",
          }}
        >
          {icon}
        </Box>

        <Box>
          <Typography fontWeight={900} fontSize={15.5}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.35}>
            {description}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

function VerificationBadge({
  ok,
  icon,
  label,
  hint,
}: {
  ok: boolean;
  icon: React.ReactNode;
  label: string;
  hint: string;
}) {
  const theme = useTheme<Theme>();
  const color = ok ? theme.palette.success.main : theme.palette.warning.main;

  return (
    <Box
      sx={{
        flex: 1,
        px: 1.45,
        py: 1.15,
        borderRadius: 3.25,
        border: `1px solid ${alpha(color, 0.18)}`,
        bgcolor: alpha(color, 0.06),
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Box sx={{ display: "inline-flex", color }}>{icon}</Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={900}>
            {label}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {hint}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

function AddressHierarchySection({
  value,
  onChange,
  errors,
}: {
  value: AddressForm;
  onChange: (next: AddressForm) => void;
  errors: FormErrors;
}) {
  const {
    countries,
    isLoading: isCountriesLoading,
    errorMessage: countriesErrorMessage,
  } = useAddressCountries({
    includeAll: true,
    autoLoad: true,
  });

  const {
    provinces,
    districts,
    neighborhoods,
    isProvincesLoading,
    isDistrictsLoading,
    isNeighborhoodsLoading,
    errorMessage,
    setSelectedProvinceId,
    setSelectedDistrictId,
    setSelectedNeighborhoodId,
    clearAll,
    reloadProvinces,
  } = useAddressHierarchy({
    autoLoad: false,
  });

  const patch = (partial: Partial<AddressForm>) => {
    onChange({ ...value, ...partial });
  };

  const handleCountryChange = async (countryCode: string) => {
    const nextCountryCode = countryCode.trim().toUpperCase();
    const selectedCountry =
      countries.find(
        (item: { code: string; name: string }) => item.code === nextCountryCode,
      ) ?? null;

    clearAll();
    await reloadProvinces(nextCountryCode);

    patch({
      countryCode: nextCountryCode,
      country: selectedCountry?.name ?? "",
      provinceId: "",
      districtId: "",
      neighborhoodId: "",
      city: "",
      district: "",
      neighborhood: "",
      street: "",
      buildingNumber: "",
      apartmentNumber: "",
      postalCode: "",
    });
  };

  const handleProvinceChange = async (provinceId: string) => {
    const nextProvinceId = provinceId.trim();
    const selectedProvince =
      provinces.find((item) => item.id === nextProvinceId) ?? null;

    await setSelectedProvinceId(nextProvinceId);

    patch({
      provinceId: nextProvinceId,
      city: selectedProvince?.name ?? "",
      districtId: "",
      neighborhoodId: "",
      district: "",
      neighborhood: "",
      street: "",
      buildingNumber: "",
      apartmentNumber: "",
      postalCode: "",
    });
  };

  const handleDistrictChange = async (districtId: string) => {
    const nextDistrictId = districtId.trim();
    const selectedDistrict =
      districts.find((item) => item.id === nextDistrictId) ?? null;

    await setSelectedDistrictId(nextDistrictId);

    patch({
      districtId: nextDistrictId,
      district: selectedDistrict?.name ?? "",
      neighborhoodId: "",
      neighborhood: "",
      street: "",
      buildingNumber: "",
      apartmentNumber: "",
      postalCode: "",
    });
  };

  const handleNeighborhoodChange = (neighborhoodId: string) => {
    const nextNeighborhoodId = neighborhoodId.trim();
    const selectedNeighborhood =
      neighborhoods.find((item) => item.id === nextNeighborhoodId) ?? null;

    setSelectedNeighborhoodId(nextNeighborhoodId);

    patch({
      neighborhoodId: nextNeighborhoodId,
      neighborhood: selectedNeighborhood?.name ?? "",
      postalCode: selectedNeighborhood?.postalCode ?? value.postalCode,
    });
  };

  const safeCountryCode = countries.some(
    (item: { code: string }) => item.code === value.countryCode,
  )
    ? value.countryCode
    : "";

  const getError = (field: keyof AddressForm) => errors[`address.${field}`];

  return (
    <Stack spacing={2}>
      {(errorMessage || countriesErrorMessage) && (
        <InlineNotice tone="warning">
          {errorMessage || countriesErrorMessage}
        </InlineNotice>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, minmax(0, 1fr))",
            xl: "repeat(3, minmax(0, 1fr))",
          },
          gap: 2,
        }}
      >
        <TextField
          select
          label="Ülke"
          value={safeCountryCode}
          onChange={(event) => void handleCountryChange(event.target.value)}
          disabled={isCountriesLoading}
          helperText={isCountriesLoading ? "Yükleniyor..." : " "}
          fullWidth
          sx={premiumFieldSx}
        >
          <MenuItem value="">Ülke seçiniz</MenuItem>
          {countries.map(
            (country: { code: string; name: string; flagEmoji?: string | null }) => (
              <MenuItem key={country.code} value={country.code}>
                {country.flagEmoji ? `${country.flagEmoji} ` : ""}
                {country.name}
              </MenuItem>
            ),
          )}
        </TextField>

        <TextField
          label="Ülke kodu"
          value={value.countryCode}
          InputProps={{ readOnly: true }}
          error={!!getError("countryCode")}
          helperText={getError("countryCode") ?? " "}
          fullWidth
          sx={premiumFieldSx}
        />

        <TextField
          select
          label="İl"
          value={value.provinceId}
          onChange={(event) => void handleProvinceChange(event.target.value)}
          disabled={!value.countryCode || isProvincesLoading}
          error={!!getError("provinceId")}
          helperText={
            getError("provinceId") ?? (isProvincesLoading ? "Yükleniyor..." : " ")
          }
          fullWidth
          sx={premiumFieldSx}
        >
          <MenuItem value="">İl seçiniz</MenuItem>
          {provinces.map((province) => (
            <MenuItem key={province.id} value={province.id}>
              {province.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="İlçe"
          value={value.districtId}
          onChange={(event) => void handleDistrictChange(event.target.value)}
          disabled={!value.provinceId || isDistrictsLoading}
          error={!!getError("districtId")}
          helperText={
            getError("districtId") ?? (isDistrictsLoading ? "Yükleniyor..." : " ")
          }
          fullWidth
          sx={premiumFieldSx}
        >
          <MenuItem value="">İlçe seçiniz</MenuItem>
          {districts.map((district) => (
            <MenuItem key={district.id} value={district.id}>
              {district.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Mahalle / Köy"
          value={value.neighborhoodId}
          onChange={(event) => handleNeighborhoodChange(event.target.value)}
          disabled={!value.districtId || isNeighborhoodsLoading}
          error={!!getError("neighborhoodId")}
          helperText={
            getError("neighborhoodId") ??
            (isNeighborhoodsLoading ? "Yükleniyor..." : " ")
          }
          fullWidth
          sx={premiumFieldSx}
        >
          <MenuItem value="">Mahalle / köy seçiniz</MenuItem>
          {neighborhoods.map((neighborhood) => (
            <MenuItem key={neighborhood.id} value={neighborhood.id}>
              {neighborhood.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Cadde / Sokak"
          value={value.street}
          onChange={(event) => patch({ street: event.target.value })}
          error={!!getError("street")}
          helperText={getError("street") ?? " "}
          fullWidth
          sx={premiumFieldSx}
        />

        <TextField
          label="Bina no"
          value={value.buildingNumber}
          onChange={(event) => patch({ buildingNumber: event.target.value })}
          error={!!getError("buildingNumber")}
          helperText={getError("buildingNumber") ?? " "}
          fullWidth
          sx={premiumFieldSx}
        />

        <TextField
          label="Daire / Kapı no"
          value={value.apartmentNumber}
          onChange={(event) => patch({ apartmentNumber: event.target.value })}
          helperText="Opsiyonel"
          fullWidth
          sx={premiumFieldSx}
        />

        <TextField
          label="Posta kodu"
          value={value.postalCode}
          onChange={(event) => patch({ postalCode: event.target.value })}
          error={!!getError("postalCode")}
          helperText={getError("postalCode") ?? " "}
          fullWidth
          sx={premiumFieldSx}
        />
      </Box>

      <InlineNotice tone="info">
        Adres özeti:{" "}
        {[
          value.neighborhood,
          value.street,
          value.buildingNumber ? `No:${value.buildingNumber}` : "",
          value.apartmentNumber ? `D:${value.apartmentNumber}` : "",
          value.district,
          value.city,
          value.postalCode,
        ]
          .filter(Boolean)
          .join(", ") || "Henüz adres tamamlanmadı"}
      </InlineNotice>
    </Stack>
  );
}

function DocumentRequirementSummary({
  requirements,
  uploadedKindCounts,
}: {
  requirements: DocumentRequirement[];
  uploadedKindCounts: Record<RequiredDocumentKind, number>;
}) {
  const theme = useTheme<Theme>();

  return (
    <SectionCard
      icon={<IconCircleCheck size={19} />}
      title="Gerekli belge özeti"
      description="Temsil şeklinize göre tamamlanması gereken belgeler aşağıda gösterilir."
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 1.25,
        }}
      >
        {requirements.map((item) => {
          const uploadedCount = uploadedKindCounts[item.kind];
          const completed = uploadedCount > 0;

          return (
            <Box
              key={item.kind}
              sx={{
                p: 1.3,
                borderRadius: 3.25,
                border: `1px solid ${alpha(
                  completed ? theme.palette.success.main : theme.palette.divider,
                  completed ? 0.24 : 0.74,
                )}`,
                bgcolor: alpha(
                  completed ? theme.palette.success.main : theme.palette.background.default,
                  completed ? 0.06 : 0.3,
                ),
              }}
            >
              <Stack direction="row" spacing={1.1} alignItems="center">
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    color: completed ? "success.main" : "text.disabled",
                    bgcolor: completed
                      ? alpha(theme.palette.success.main, 0.09)
                      : alpha(theme.palette.grey[500], 0.08),
                    flexShrink: 0,
                  }}
                >
                  {completed ? <IconCheck size={17} /> : <IconFileText size={17} />}
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={900} noWrap sx={{ fontSize: 14 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {completed
                      ? `${uploadedCount} dosya eklendi`
                      : item.required
                        ? "Zorunlu belge bekleniyor"
                        : "İsteğe bağlı"}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          );
        })}
      </Box>

      <Button
        component={Link}
        href="/documents/live-manage-management-agreement.pdf"
        target="_blank"
        rel="noreferrer"
        variant="outlined"
        startIcon={<IconDownload size={17} />}
        sx={{
          mt: 2,
          borderRadius: 999,
          fontWeight: 900,
          textTransform: "none",
          width: "fit-content",
        }}
      >
        Hizmet sözleşmesini indir
      </Button>
    </SectionCard>
  );
}

function CompactDocumentUploader({
  requirements,
  selectedKind,
  selectedFile,
  description,
  onKindChange,
  onDescriptionChange,
  onFileChange,
  onAdd,
  inputRef,
}: {
  requirements: DocumentRequirement[];
  selectedKind: RequiredDocumentKind;
  selectedFile: File | null;
  description: string;
  onKindChange: (kind: RequiredDocumentKind) => void;
  onDescriptionChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
  onAdd: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const theme = useTheme<Theme>();

  const allOptions = useMemo(() => {
    const map = new Map<RequiredDocumentKind, DocumentRequirement>();

    requirements.forEach((item) => map.set(item.kind, item));

    map.set("other", {
      kind: "other",
      title: documentCatalog.other.title,
      description: documentCatalog.other.description,
      required: false,
    });

    return Array.from(map.values());
  }, [requirements]);

  const selectedRequirement = allOptions.find((item) => item.kind === selectedKind);
  const canAdd = !!selectedFile && !!selectedKind;

  return (
    <SectionCard
      icon={<IconUpload size={19} />}
      title="Belge ekle"
      description="Belge türünü seçin, dosyanızı ekleyin ve gerekiyorsa kısa bir açıklama yazın."
    >
      <Stack spacing={2}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.1fr 1.1fr" },
            gap: 2,
          }}
        >
          <TextField
            select
            label="Belge türü"
            value={selectedKind}
            onChange={(event) =>
              onKindChange(event.target.value as RequiredDocumentKind)
            }
            helperText={
              selectedRequirement?.required
                ? "Bu belge zorunlu belgeler arasında."
                : "Bu belge isteğe bağlı olarak eklenebilir."
            }
            fullWidth
            sx={premiumFieldSx}
          >
            {allOptions.map((item) => (
              <MenuItem key={item.kind} value={item.kind}>
                {item.title}
                {item.required ? " · Zorunlu" : ""}
              </MenuItem>
            ))}
          </TextField>

          <Box>
            <input
              ref={inputRef}
              type="file"
              hidden
              accept=".pdf,.jpg,.jpeg,.png,.tif,.tiff"
              onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
            />

            <Box
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
              sx={{
                minHeight: 56,
                px: 1.5,
                py: 1,
                borderRadius: 3.25,
                border: `1px solid ${alpha(theme.palette.divider, 0.86)}`,
                bgcolor: alpha(theme.palette.background.default, 0.35),
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                transition: "all 160ms ease",
                "&:hover": {
                  borderColor: alpha(theme.palette.primary.main, 0.35),
                  bgcolor: alpha(theme.palette.primary.main, 0.035),
                },
              }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 2.5,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: "primary.main",
                  flexShrink: 0,
                }}
              >
                <IconUpload size={18} />
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography fontWeight={900} noWrap>
                  {selectedFile ? selectedFile.name : "Dosya seçin"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedFile
                    ? formatFileSize(selectedFile.size)
                    : "PDF, JPG, PNG, TIF · En fazla 10 MB"}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <TextField
          label="Açıklama"
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          placeholder="İsteğe bağlı kısa açıklama yazabilirsiniz."
          helperText="Bu alan zorunlu değildir."
          fullWidth
          sx={premiumFieldSx}
        />

        {selectedRequirement && (
          <InlineNotice tone="info">{selectedRequirement.description}</InlineNotice>
        )}

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={1.5}
        >
          <Typography variant="body2" color="text.secondary">
            Eklenen belgeler aşağıdaki listede görünecektir.
          </Typography>

          <Button
            variant="contained"
            disabled={!canAdd}
            onClick={onAdd}
            startIcon={<IconUpload size={17} />}
            sx={{
              height: 46,
              borderRadius: 999,
              px: 2.75,
              textTransform: "none",
              fontWeight: 950,
              boxShadow: canAdd
                ? "0 10px 22px rgba(37, 99, 235, 0.2)"
                : "none",
            }}
          >
            Belgeyi Ekle
          </Button>
        </Stack>
      </Stack>
    </SectionCard>
  );
}

function UploadedDocumentList({
  files,
  onRemove,
}: {
  files: UploadedFileItem[];
  onRemove: (id: string) => void;
}) {
  const theme = useTheme<Theme>();

  return (
    <SectionCard
      icon={<IconFileText size={19} />}
      title="Eklenen belgeler"
      description="Başvuruya eklenen dosyaları buradan kontrol edebilirsiniz."
    >
      {files.length === 0 ? (
        <Box
          sx={{
            p: 2,
            borderRadius: 4,
            border: `1px dashed ${alpha(theme.palette.divider, 0.9)}`,
            bgcolor: alpha(theme.palette.background.default, 0.35),
          }}
        >
          <Typography fontWeight={900}>Henüz belge eklenmedi</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.4}>
            Dosya seçip “Belgeyi Ekle” dediğinizde burada listelenecek.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1}>
          {files.map((file) => (
            <Stack
              key={file.id}
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
              spacing={1.25}
              sx={{
                p: 1.25,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.68)}`,
                bgcolor: alpha(theme.palette.background.default, 0.3),
              }}
            >
              <Stack direction="row" spacing={1.2} alignItems="center" sx={{ minWidth: 0 }}>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 2.5,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: alpha(theme.palette.success.main, 0.09),
                    color: "success.main",
                    flexShrink: 0,
                  }}
                >
                  <IconFileText size={18} />
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={900} noWrap>
                    {file.name}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {getDocumentTitle(file.kind)} · {file.sizeLabel}
                  </Typography>

                  {file.description && (
                    <Typography variant="body2" color="text.secondary" mt={0.3}>
                      {file.description}
                    </Typography>
                  )}
                </Box>
              </Stack>

              <Button
                color="error"
                size="small"
                startIcon={<IconX size={15} />}
                onClick={() => onRemove(file.id)}
                sx={{
                  alignSelf: { xs: "flex-end", sm: "center" },
                  textTransform: "none",
                  fontWeight: 900,
                }}
              >
                Kaldır
              </Button>
            </Stack>
          ))}
        </Stack>
      )}
    </SectionCard>
  );
}

function SummaryPanel({ items }: { items: Array<{ label: string; value: string }> }) {
  const theme = useTheme<Theme>();

  return (
    <SectionCard
      icon={<IconCircleCheck size={19} />}
      title="Başvuru özeti"
      description="Göndermeden önce bilgilerinizi kontrol edin."
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 1.25,
        }}
      >
        {items.map((item) => (
          <Box
            key={item.label}
            sx={{
              p: 1.3,
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.68)}`,
              bgcolor: alpha(theme.palette.background.default, 0.28),
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={800}>
              {item.label}
            </Typography>
            <Typography fontWeight={900} mt={0.25} sx={{ fontSize: 14 }}>
              {item.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </SectionCard>
  );
}

function LegalConsentBox({
  form,
  errors,
  onPatch,
}: {
  form: FormState;
  errors: FormErrors;
  onPatch: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}) {
  return (
    <SectionCard
      icon={<IconShieldCheck size={19} />}
      title="Beyan ve onaylar"
      description="Başvurunuzu göndermek için aşağıdaki onayları tamamlayın."
    >
      <Stack spacing={0.6}>
        <FormControlLabel
          control={
            <Checkbox
              checked={form.consentAccuracy}
              onChange={(event) => onPatch("consentAccuracy", event.target.checked)}
            />
          }
          label="Beyan ettiğim bilgilerin doğru ve güncel olduğunu kabul ediyorum."
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={form.consentAuthority}
              onChange={(event) => onPatch("consentAuthority", event.target.checked)}
            />
          }
          label="İlgili yapı adına başvuru yapmaya yetkili olduğumu beyan ediyorum."
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={form.consentPrivacy}
              onChange={(event) => onPatch("consentPrivacy", event.target.checked)}
            />
          }
          label="Aydınlatma metnini okudum ve başvuru kapsamında veri işleme sürecini anladım."
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={form.consentContract}
              onChange={(event) => onPatch("consentContract", event.target.checked)}
            />
          }
          label="Hizmet sözleşmesi ve platform koşullarını kabul ediyorum."
        />
      </Stack>

      {errors.consents && (
        <Box sx={{ mt: 1.5 }}>
          <InlineNotice tone="warning">{errors.consents}</InlineNotice>
        </Box>
      )}
    </SectionCard>
  );
}

function WizardFooter({
  activeStepIndex,
  totalSteps,
  canSubmit,
  onBack,
  onNext,
}: {
  activeStepIndex: number;
  totalSteps: number;
  canSubmit: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  const theme = useTheme<Theme>();
  const isLastStep = activeStepIndex === totalSteps - 1;
  const canGoBack = activeStepIndex > 0;

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 2.25, md: 3 } }}>
      <Stack
        direction={{ xs: "column-reverse", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={2}
      >
        <Button
          variant="outlined"
          startIcon={<IconArrowLeft size={18} />}
          onClick={onBack}
          disabled={!canGoBack}
          sx={{
            height: 50,
            minWidth: 140,
            borderRadius: 999,
            textTransform: "none",
            fontWeight: 900,
            borderColor: alpha(theme.palette.primary.main, 0.18),
          }}
        >
          Geri
        </Button>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.25}
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: { xs: "center", sm: "left" } }}
          >
            Adım {activeStepIndex + 1}/{totalSteps}
          </Typography>

          <Button
            variant="contained"
            endIcon={!isLastStep ? <IconArrowRight size={18} /> : undefined}
            disabled={isLastStep && !canSubmit}
            onClick={isLastStep ? undefined : onNext}
            sx={{
              height: 52,
              minWidth: { xs: "100%", sm: 220 },
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 950,
              fontSize: 15,
              boxShadow: "0 10px 24px rgba(37, 99, 235, 0.22)",
            }}
          >
            {isLastStep ? "Başvuruyu Gönder" : "Devam Et"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

function InlineNotice({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "info" | "warning";
}) {
  const theme = useTheme<Theme>();
  const color =
    tone === "warning" ? theme.palette.warning.main : theme.palette.info.main;

  return (
    <Box
      sx={{
        p: 1.3,
        borderRadius: 3.25,
        bgcolor: alpha(color, 0.065),
        border: `1px solid ${alpha(color, 0.16)}`,
      }}
    >
      <Typography variant="body2" color="text.secondary" fontWeight={600}>
        {children}
      </Typography>
    </Box>
  );
}

function validateForm(
  form: FormState,
  requiredDocumentsMissing: DocumentRequirement[],
): FormErrors {
  const next: FormErrors = {};

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
    next.taxOrIdentityNumber = "Lütfen kimlik, vergi veya kayıt numarasını girin.";
  }

  if (!form.authorityStartDate.trim()) {
    next.authorityStartDate = "Lütfen yetki başlangıç tarihini seçin.";
  }

  if (
    form.authorityStartDate &&
    form.authorityEndDate &&
    form.authorityEndDate < form.authorityStartDate
  ) {
    next.authorityEndDate = "Bitiş tarihi başlangıç tarihinden önce olamaz.";
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
    next["address.neighborhoodId"] = "Lütfen mahalle veya köy seçin.";
  }

  if (!form.address.street.trim()) {
    next["address.street"] = "Lütfen cadde veya sokak bilgisini girin.";
  }

  if (!form.address.buildingNumber.trim()) {
    next["address.buildingNumber"] = "Lütfen bina numarasını girin.";
  }

  if (!form.address.postalCode.trim()) {
    next["address.postalCode"] = "Lütfen posta kodunu girin.";
  }

  if (blockCount <= 0) {
    next.blockCount = "Lütfen blok sayısını girin.";
  }

  if (totalApartmentCount <= 0) {
    next.totalApartmentCount = "Lütfen toplam daire sayısını girin.";
  }

  if (requiredDocumentsMissing.length > 0) {
    next.documents = "Devam edebilmek için zorunlu belgeleri eklemeniz gerekiyor.";
  }

  if (
    !form.consentAccuracy ||
    !form.consentAuthority ||
    !form.consentPrivacy ||
    !form.consentContract
  ) {
    next.consents = "Başvuruyu göndermek için onay kutularını tamamlayın.";
  }

  return next;
}

function getStepFields(stepId: WizardStepId): string[] {
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

function getStructureLabel(value: ManagementStructureType) {
  return value === "site" ? "Site Yönetimi" : "Apartman Yönetimi";
}

function getRepresentationLabel(value: RepresentationType) {
  return representationOptions.find((item) => item.value === value)?.label ?? "-";
}

function getDocumentTitle(kind: RequiredDocumentKind) {
  return documentCatalog[kind]?.title ?? "Belge";
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}