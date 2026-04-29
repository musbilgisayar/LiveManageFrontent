// src/modules/property-management/views/PropertyCreateView.tsx
"use client";

import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Alert,
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Fade,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  OutlinedInput,
  Select,
  Slide,
  Snackbar,
  Stack,
  Step,
  StepConnector,
  stepConnectorClasses,
  StepIconProps,
  StepLabel,
  Stepper,
  styled,
  TextField,
  Tooltip,
  Typography,
  useTheme,
  Zoom,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import {
  IconArrowLeft,
  IconArrowRight,
  IconBed,
  IconBookmark,
  IconBuilding,
  IconBuildingEstate,
  IconBuildingStore,
  IconCalendar,
  IconCheck,
  IconChevronDown,
  IconCircleCheck,
  IconFlame,
  IconHome,
  IconInfoCircle,
  IconMapPin,
  IconRuler,
  IconSofa,
  IconStack2,
  IconStairs,
} from "@tabler/icons-react";
import { useAddressCountries } from "../../users/hooks/useAddressCountries";
import { useAddressHierarchy } from "../../users/hooks/useAddressHierarchy";

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------
type PropertyType = "apartment" | "shop" | "office";

type PropertyAddressForm = {
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

interface PropertyForm {
  type: PropertyType;
  name: string;
  address: PropertyAddressForm;
  grossArea: string;
  netArea: string;
  roomCount: string;
  floor: string;
  buildingAge: string;
  heating: string;
  furnished: string;
}

interface FormErrors {
  [key: string]: string;
}

// ----------------------------------------------------------------
// Constants
// ----------------------------------------------------------------
const PROPERTY_TYPES: {
  value: PropertyType;
  label: string;
  icon: React.ReactNode;
  description: string;
}[] = [
  {
    value: "apartment",
    label: "Daire",
    icon: <IconHome size={32} stroke={2} />,
    description: "Konut amaçlı bağımsız bölüm",
  },
  {
    value: "shop",
    label: "Dükkan",
    icon: <IconBuildingStore size={32} stroke={2} />,
    description: "Ticari amaçlı zemin kat birimi",
  },
  {
    value: "office",
    label: "Ofis",
    icon: <IconBuilding size={32} stroke={2} />,
    description: "İş yeri amaçlı ofis birimi",
  },
];

const HEATING_OPTIONS = [
  { value: "central", label: "Merkezi" },
  { value: "combi", label: "Kombi (Doğalgaz)" },
  { value: "stove", label: "Soba" },
  { value: "heatPump", label: "Isı Pompası" },
  { value: "floorHeating", label: "Yerden Isıtma" },
  { value: "none", label: "Yok" },
];

const FURNISHED_OPTIONS = [
  { value: "furnished", label: "Eşyalı" },
  { value: "semiFurnished", label: "Yarı Eşyalı" },
  { value: "unfurnished", label: "Boş" },
];

const createDefaultAddress = (): PropertyAddressForm => ({
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

const INITIAL_FORM: PropertyForm = {
  type: "apartment",
  name: "",
  address: createDefaultAddress(),
  grossArea: "",
  netArea: "",
  roomCount: "",
  floor: "",
  buildingAge: "",
  heating: "",
  furnished: "",
};

// ----------------------------------------------------------------
// Custom Stepper Connector
// ----------------------------------------------------------------
const PremiumConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.primary.main})`,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: alpha(theme.palette.divider, 0.8),
    borderRadius: 1,
    transition: "background 500ms ease",
  },
}));

function PremiumStepIcon(props: StepIconProps) {
  const { active, completed, icon } = props;
  const theme = useTheme<Theme>();

  return (
    <Box
      sx={{
        width: 44,
        height: 44,
        borderRadius: 3,
        display: "grid",
        placeItems: "center",
        fontWeight: 800,
        fontSize: "0.9rem",
        transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        bgcolor: completed
          ? alpha(theme.palette.success.main, 0.12)
          : active
            ? alpha(theme.palette.primary.main, 0.12)
            : alpha(theme.palette.divider, 0.4),
        color: completed
          ? theme.palette.success.main
          : active
            ? theme.palette.primary.main
            : theme.palette.text.disabled,
        border: `2px solid ${
          completed
            ? alpha(theme.palette.success.main, 0.3)
            : active
              ? alpha(theme.palette.primary.main, 0.3)
              : "transparent"
        }`,
        boxShadow: active
          ? `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`
          : completed
            ? `0 0 0 4px ${alpha(theme.palette.success.main, 0.1)}`
            : "none",
        transform: active ? "scale(1.08)" : "scale(1)",
      }}
    >
      {completed ? <IconCheck size={20} stroke={3} /> : icon}
    </Box>
  );
}

// ----------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------
export default function PropertyCreateView() {
  const theme = useTheme<Theme>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const topRef = useRef<HTMLDivElement>(null);

  const returnUrl = searchParams.get("returnUrl");
  const preselectedType = searchParams.get("type") as PropertyType | null;

  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState<PropertyForm>(() => ({
    ...INITIAL_FORM,
    type: preselectedType || "apartment",
  }));
  const [errors, setErrors] = useState<FormErrors>({});
  const [toast, setToast] = useState({ open: false, message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeStep]);

  const handleChange = useCallback((key: keyof PropertyForm, value: string | PropertyAddressForm) => {
    setForm((prev) => ({ ...prev, [key]: value as never }));
    setErrors((prev) => {
      const next = { ...prev };
      if (key === "address") {
        Object.keys(next).forEach((errorKey) => {
          if (errorKey.startsWith("address.")) delete next[errorKey];
        });
      } else if (next[key as string]) {
        delete next[key as string];
      }
      return next;
    });
  }, []);

  const handleAddressChange = useCallback((value: PropertyAddressForm) => {
    handleChange("address", value);
  }, [handleChange]);

  const handleSelectPropertyType = useCallback((type: PropertyType) => {
    setForm((prev) => ({ ...prev, type }));
    setTimeout(() => setActiveStep(1), 300);
  }, []);

  const validateStep = useCallback(
    (step: number): boolean => {
      const newErrors: FormErrors = {};

      if (step === 0) {
        if (!form.type) newErrors.type = "Gayrimenkul türü seçilmelidir.";
      }

      if (step === 1) {
        if (!form.name.trim()) newErrors.name = "Başlık zorunludur.";
        if (!form.address.countryCode.trim()) newErrors["address.countryCode"] = "Ülke zorunludur.";
        if (!form.address.provinceId.trim()) newErrors["address.provinceId"] = "İl seçilmelidir.";
        if (!form.address.districtId.trim()) newErrors["address.districtId"] = "İlçe seçilmelidir.";
        if (!form.address.neighborhoodId.trim()) {
          newErrors["address.neighborhoodId"] = "Mahalle / köy seçilmelidir.";
        }
        if (!form.address.street.trim()) newErrors["address.street"] = "Sokak / cadde zorunludur.";
        if (!form.address.buildingNumber.trim()) {
          newErrors["address.buildingNumber"] = "Bina numarası zorunludur.";
        }
        if (!form.address.postalCode.trim()) newErrors["address.postalCode"] = "Posta kodu zorunludur.";
      }

      if (step === 2) {
        if (!form.grossArea.trim()) newErrors.grossArea = "Brüt alan zorunludur.";
        if (!form.netArea.trim()) newErrors.netArea = "Net alan zorunludur.";
        if (!form.roomCount.trim()) newErrors.roomCount = "Oda sayısı zorunludur.";
        if (!form.floor.trim()) newErrors.floor = "Kat bilgisi zorunludur.";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [form],
  );

  const handleSubmit = useCallback(() => {
    setIsSubmitting(true);

    setTimeout(() => {
      console.log("PROPERTY CREATE:", form);
      setToast({ open: true, message: "Gayrimenkul başarıyla kaydedildi!" });

      setTimeout(() => {
        router.push(returnUrl || "/property-management");
      }, 1200);
    }, 1000);
  }, [form, returnUrl, router]);

  const handleNext = useCallback(() => {
    if (!validateStep(activeStep)) return;

    if (activeStep === 2) {
      handleSubmit();
      return;
    }

    setActiveStep((prev) => prev + 1);
  }, [activeStep, validateStep, handleSubmit]);

  const handleBack = useCallback(() => {
    if (activeStep === 0) {
      router.push(returnUrl || "/property-management");
      return;
    }

    setActiveStep((prev) => prev - 1);
  }, [activeStep, returnUrl, router]);

  const completionPercentage = ((activeStep + 1) / 3) * 100;
  const steps = ["Gayrimenkul Türü", "Lokasyon & Kimlik", "Fiziksel Özellikler"];

  return (
    <Box ref={topRef} sx={{ maxWidth: 900, mx: "auto" }}>
      <Stack spacing={3}>
        <Slide direction="down" in timeout={500}>
          <Box
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 5,
              position: "relative",
              overflow: "hidden",
              background: `linear-gradient(135deg, 
                ${alpha(theme.palette.primary.main, 0.08)} 0%, 
                ${alpha(theme.palette.primary.light, 0.05)} 40%, 
                ${alpha(theme.palette.info.main, 0.04)} 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
              "&::before": {
                content: '""',
                position: "absolute",
                top: -60,
                right: -60,
                width: 220,
                height: 220,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${alpha(
                  theme.palette.primary.main,
                  0.12,
                )} 0%, transparent 70%)`,
                pointerEvents: "none",
              },
            }}
          >
            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Stack spacing={2.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label="Gayrimenkul Yönetimi"
                    size="small"
                    sx={{
                      fontWeight: 800,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: "primary.main",
                      backdropFilter: "blur(8px)",
                    }}
                  />
                  <IconChevronDown
                    size={14}
                    style={{ transform: "rotate(-90deg)", color: theme.palette.text.disabled }}
                  />
                  <Chip
                    label="Yeni Kayıt"
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 800 }}
                  />
                </Stack>

                <Box>
                  <Typography
                    variant="h4"
                    fontWeight={900}
                    letterSpacing="-0.03em"
                    lineHeight={1.1}
                    sx={{
                      background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${alpha(
                        theme.palette.text.primary,
                        0.7,
                      )} 100%)`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Yeni Gayrimenkul Tanımla
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                    Gayrimenkul bilgilerini adım adım girin. Bu bilgiler ilan oluşturma sürecinde
                    otomatik kullanılacaktır.
                  </Typography>
                </Box>

                <Box>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <Typography variant="caption" fontWeight={700} color="text.secondary">
                      Tamamlanma
                    </Typography>
                    <Typography variant="caption" fontWeight={800} color="primary.main">
                      %{Math.round(completionPercentage)}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={completionPercentage}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 4,
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                      },
                    }}
                  />
                </Box>
              </Stack>
            </Box>
          </Box>
        </Slide>

        <Fade in timeout={700}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 5,
              borderColor: alpha(theme.palette.divider, 0.6),
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: "blur(20px)",
              overflow: "visible",
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Stepper activeStep={activeStep} alternativeLabel connector={<PremiumConnector />}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel StepIconComponent={PremiumStepIcon}>
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        sx={{
                          color:
                            activeStep === steps.indexOf(label)
                              ? "primary.main"
                              : activeStep > steps.indexOf(label)
                                ? "success.main"
                                : "text.disabled",
                        }}
                      >
                        {label}
                      </Typography>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>
        </Fade>

        <Fade in timeout={400} key={activeStep}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 5,
              borderColor: alpha(theme.palette.divider, 0.6),
              background: alpha(theme.palette.background.paper, 0.7),
              backdropFilter: "blur(16px)",
              boxShadow: `0 4px 24px ${alpha(theme.palette.common.black, 0.03)}`,
              overflow: "visible",
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
              {activeStep === 0 && (
                <StepZeroContent
                  selectedType={form.type}
                  onSelect={handleSelectPropertyType}
                  errors={errors}
                />
              )}

              {activeStep === 1 && (
                <StepOneContent
                  form={form}
                  onChange={handleChange}
                  onAddressChange={handleAddressChange}
                  errors={errors}
                />
              )}

              {activeStep === 2 && (
                <StepTwoContent form={form} onChange={handleChange} errors={errors} />
              )}
            </CardContent>
          </Card>
        </Fade>

        <Fade in timeout={800}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 1 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              startIcon={<IconArrowLeft size={18} stroke={2} />}
              sx={{
                borderRadius: 3,
                fontWeight: 700,
                textTransform: "none",
                borderColor: alpha(theme.palette.divider, 0.8),
                px: 3,
              }}
            >
              {activeStep === 0 ? "İptal" : "Geri"}
            </Button>

            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={
                isSubmitting ? undefined : activeStep === 2 ? (
                  <IconCheck size={18} stroke={2.5} />
                ) : (
                  <IconArrowRight size={18} stroke={2.5} />
                )
              }
              disabled={isSubmitting}
              sx={{
                borderRadius: 3,
                fontWeight: 800,
                textTransform: "none",
                px: 4,
                boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                "&:hover": {
                  boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.4)}`,
                },
                "&:disabled": {
                  bgcolor: alpha(theme.palette.primary.main, 0.6),
                },
              }}
            >
              {isSubmitting
                ? "Kaydediliyor..."
                : activeStep === 2
                  ? "Kaydet ve Tamamla"
                  : "Devam Et"}
            </Button>
          </Stack>
        </Fade>
      </Stack>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        TransitionComponent={Slide}
      >
        <Card
          sx={{
            borderRadius: 4,
            bgcolor: alpha(theme.palette.success.main, 0.95),
            color: "#fff",
            backdropFilter: "blur(12px)",
            boxShadow: `0 8px 32px ${alpha(theme.palette.success.main, 0.4)}`,
          }}
        >
          <CardContent sx={{ py: 1.5, px: 2.5 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <IconCircleCheck size={22} stroke={2.5} />
              <Typography fontWeight={800}>{toast.message}</Typography>
            </Stack>
          </CardContent>
        </Card>
      </Snackbar>
    </Box>
  );
}

// ----------------------------------------------------------------
// Step 0
// ----------------------------------------------------------------
function StepZeroContent({
  selectedType,
  onSelect,
  errors,
}: {
  selectedType: PropertyType;
  onSelect: (type: PropertyType) => void;
  errors: FormErrors;
}) {
  const theme = useTheme<Theme>();

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6" fontWeight={800} letterSpacing="-0.02em">
          Gayrimenkul Türünü Seçin
        </Typography>
        <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
          İlan vermek istediğiniz gayrimenkulün türünü belirleyin.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(3, minmax(0, 1fr))",
          },
          gap: 2,
          alignItems: "stretch",
        }}
      >
        {PROPERTY_TYPES.map((type, index) => {
          const isSelected = selectedType === type.value;

          return (
            <Zoom in timeout={400 + index * 150} key={type.value}>
              <Card
                onClick={() => onSelect(type.value)}
                sx={{
                  cursor: "pointer",
                  borderRadius: 4,
                  border: `2px solid ${
                    isSelected
                      ? theme.palette.primary.main
                      : alpha(theme.palette.divider, 0.5)
                  }`,
                  bgcolor: isSelected
                    ? alpha(theme.palette.primary.main, 0.04)
                    : "background.paper",
                  transition: "all 250ms cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: `0 12px 32px ${alpha(theme.palette.common.black, 0.08)}`,
                    borderColor: isSelected
                      ? theme.palette.primary.main
                      : alpha(theme.palette.primary.main, 0.4),
                  },
                  position: "relative",
                  overflow: "visible",
                  height: "100%",
                }}
              >
                {isSelected && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: -10,
                      right: -10,
                      width: 28,
                      height: 28,
                      borderRadius: 2,
                      bgcolor: theme.palette.primary.main,
                      display: "grid",
                      placeItems: "center",
                      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
                    }}
                  >
                    <IconCheck size={16} stroke={3} color="#fff" />
                  </Box>
                )}

                <CardContent sx={{ p: 2.5, textAlign: "center", height: "100%" }}>
                  <Stack spacing={1.5} alignItems="center" justifyContent="center" sx={{ height: "100%" }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 4,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: isSelected
                          ? alpha(theme.palette.primary.main, 0.1)
                          : alpha(theme.palette.divider, 0.3),
                        color: isSelected ? "primary.main" : "text.secondary",
                        transition: "all 250ms ease",
                      }}
                    >
                      {type.icon}
                    </Box>

                    <Box>
                      <Typography fontWeight={800} fontSize="1rem">
                        {type.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {type.description}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Zoom>
          );
        })}
      </Box>

      {errors.type && (
        <Typography variant="caption" color="error" fontWeight={600}>
          {errors.type}
        </Typography>
      )}
    </Stack>
  );
}

// ----------------------------------------------------------------
// Step 1
// ----------------------------------------------------------------
function StepOneContent({
  form,
  onChange,
  onAddressChange,
  errors,
}: {
  form: PropertyForm;
  onChange: (key: keyof PropertyForm, value: string | PropertyAddressForm) => void;
  onAddressChange: (value: PropertyAddressForm) => void;
  errors: FormErrors;
}) {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6" fontWeight={800} letterSpacing="-0.02em">
          Lokasyon & Kimlik Bilgileri
        </Typography>
        <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
          Gayrimenkulün tanımlayıcı ve konum bilgilerini girin.
        </Typography>
      </Box>

      <Stack spacing={2.5}>
        <TextFieldWithTooltip
          label="Gayrimenkul Başlığı"
          value={form.name}
          onChange={(v) => onChange("name", v)}
          error={!!errors.name}
          helperText={errors.name}
          placeholder="Örn: Green Park Sitesi A Blok Daire 12"
          tooltip="Gayrimenkulü tanımlayıcı benzersiz bir isim verin."
          icon={<IconBookmark size={18} stroke={2} />}
          required
        />

        <AddressHierarchyCard
          value={form.address}
          onChange={onAddressChange}
          errors={errors}
        />
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------
// Step 2
// ----------------------------------------------------------------
function StepTwoContent({
  form,
  onChange,
  errors,
}: {
  form: PropertyForm;
  onChange: (key: keyof PropertyForm, value: string | PropertyAddressForm) => void;
  errors: FormErrors;
}) {
  const theme = useTheme<Theme>();

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6" fontWeight={800} letterSpacing="-0.02em">
          Fiziksel Özellikler
        </Typography>
        <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
          Gayrimenkulün alan, oda sayısı ve diğer fiziksel detaylarını belirtin.
        </Typography>
      </Box>

      <Stack spacing={2.5}>
        <Box
          sx={{
            p: 2,
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            bgcolor: alpha(theme.palette.background.default, 0.4),
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <IconRuler size={18} stroke={2} style={{ color: theme.palette.primary.main }} />
              <Typography fontWeight={700} fontSize="0.9rem">
                Alan Bilgileri
              </Typography>
            </Stack>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                },
                gap: 2,
                alignItems: "start",
              }}
            >
              <TextFieldWithTooltip
                label="Brüt m²"
                value={form.grossArea}
                onChange={(v) => onChange("grossArea", v)}
                error={!!errors.grossArea}
                helperText={errors.grossArea}
                placeholder="165"
                tooltip="Gayrimenkulün toplam brüt alanı (duvarlar dahil)."
                required
                endAdornment="m²"
              />

              <TextFieldWithTooltip
                label="Net m²"
                value={form.netArea}
                onChange={(v) => onChange("netArea", v)}
                error={!!errors.netArea}
                helperText={errors.netArea}
                placeholder="150"
                tooltip="Gayrimenkulün kullanılabilir net alanı."
                required
                endAdornment="m²"
              />
            </Box>
          </Stack>
        </Box>

        <Box
          sx={{
            p: 2,
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            bgcolor: alpha(theme.palette.background.default, 0.4),
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <IconStack2 size={18} stroke={2} style={{ color: theme.palette.primary.main }} />
              <Typography fontWeight={700} fontSize="0.9rem">
                Oda & Kat Bilgileri
              </Typography>
            </Stack>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                },
                gap: 2,
                alignItems: "start",
              }}
            >
              <TextFieldWithTooltip
                label="Oda Sayısı"
                value={form.roomCount}
                onChange={(v) => onChange("roomCount", v)}
                error={!!errors.roomCount}
                helperText={errors.roomCount}
                placeholder="3+1"
                tooltip="Salon + oda sayısı formatında girin."
                icon={<IconBed size={18} stroke={2} />}
                required
              />

              <TextFieldWithTooltip
                label="Bulunduğu Kat"
                value={form.floor}
                onChange={(v) => onChange("floor", v)}
                error={!!errors.floor}
                helperText={errors.floor}
                placeholder="3"
                tooltip="Gayrimenkulün bulunduğu kat numarası."
                icon={<IconStairs size={18} stroke={2} />}
                required
              />
            </Box>
          </Stack>
        </Box>

        <Box
          sx={{
            p: 2,
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            bgcolor: alpha(theme.palette.background.default, 0.4),
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <IconInfoCircle size={18} stroke={2} style={{ color: theme.palette.primary.main }} />
              <Typography fontWeight={700} fontSize="0.9rem">
                Diğer Özellikler
              </Typography>
            </Stack>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  lg: "repeat(3, minmax(0, 1fr))",
                },
                gap: 2,
                alignItems: "start",
              }}
            >
              <TextFieldWithTooltip
                label="Bina Yaşı"
                value={form.buildingAge}
                onChange={(v) => onChange("buildingAge", v)}
                placeholder="5"
                tooltip="Binanın yapım yılına göre yaşı."
                icon={<IconCalendar size={18} stroke={2} />}
              />

              <PremiumSelect
                label="Isıtma"
                value={form.heating}
                onChange={(v) => onChange("heating", v)}
                options={HEATING_OPTIONS}
                tooltip="Gayrimenkulün ısıtma sistemi."
                icon={<IconFlame size={18} stroke={2} />}
              />

              <PremiumSelect
                label="Eşya Durumu"
                value={form.furnished}
                onChange={(v) => onChange("furnished", v)}
                options={FURNISHED_OPTIONS}
                tooltip="Gayrimenkulün eşya durumu."
                icon={<IconSofa size={18} stroke={2} />}
              />
            </Box>
          </Stack>
        </Box>
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------
// Address Card
// ----------------------------------------------------------------
function AddressHierarchyCard({
  value,
  onChange,
  errors,
}: {
  value: PropertyAddressForm;
  onChange: (next: PropertyAddressForm) => void;
  errors: FormErrors;
}) {
  const theme = useTheme<Theme>();

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

  const hydratedRef = useRef(false);

  useEffect(() => {
    if (!value.countryCode) return;
    if (hydratedRef.current) return;

    hydratedRef.current = true;

    const hydrate = async () => {
      await reloadProvinces(value.countryCode);

      if (value.provinceId) {
        await setSelectedProvinceId(value.provinceId);
      }

      if (value.districtId) {
        await setSelectedDistrictId(value.districtId);
      }

      if (value.neighborhoodId) {
        setSelectedNeighborhoodId(value.neighborhoodId);
      }
    };

    void hydrate();
  }, [
    value.countryCode,
    value.provinceId,
    value.districtId,
    value.neighborhoodId,
    reloadProvinces,
    setSelectedProvinceId,
    setSelectedDistrictId,
    setSelectedNeighborhoodId,
  ]);

  const safeCountryCode = countries.some((item: { code: string }) => item.code === value.countryCode)
    ? value.countryCode
    : "";

  const handlePatch = (patch: Partial<PropertyAddressForm>) => {
    onChange({ ...value, ...patch });
  };

  const handleCountryChange = async (countryCode: string) => {
    const nextCountryCode = countryCode.trim().toUpperCase();
    const selectedCountry =
      countries.find((item: { code: string; name: string }) => item.code === nextCountryCode) ??
      null;

    clearAll();
    await reloadProvinces(nextCountryCode);

    handlePatch({
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
    const selectedProvince = provinces.find((item) => item.id === nextProvinceId) ?? null;

    await setSelectedProvinceId(nextProvinceId);

    handlePatch({
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
    const selectedDistrict = districts.find((item) => item.id === nextDistrictId) ?? null;

    await setSelectedDistrictId(nextDistrictId);

    handlePatch({
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
    const selectedNeighborhood = neighborhoods.find((item) => item.id === nextNeighborhoodId) ?? null;

    setSelectedNeighborhoodId(nextNeighborhoodId);

    handlePatch({
      neighborhoodId: nextNeighborhoodId,
      neighborhood: selectedNeighborhood?.name ?? "",
      postalCode: selectedNeighborhood?.postalCode ?? value.postalCode,
    });
  };

  const compactFieldSx = {
    "& .MuiOutlinedInput-root": {
      height: 40,
      borderRadius: 3,
      bgcolor: "background.paper",
    },
    "& .MuiInputBase-input": {
      fontSize: 14,
      py: 1,
    },
    "& .MuiSelect-select": {
      display: "flex",
      alignItems: "center",
      minHeight: "unset",
      py: 1,
      fontSize: 14,
    },
    "& .MuiFormHelperText-root": {
      minHeight: 20,
      mt: 0.5,
      ml: 0,
      fontWeight: 600,
    },
  } as const;

  const getError = (field: keyof PropertyAddressForm | `address.${string}`) => {
    const key = field.startsWith("address.") ? field : `address.${field}`;
    return errors[key];
  };

  const helperOrBlank = (value?: string) => value ?? " ";

  const summary = [
    value.neighborhood,
    value.street,
    value.buildingNumber ? `No:${value.buildingNumber}` : "",
    value.apartmentNumber ? `D:${value.apartmentNumber}` : "",
    value.district,
    value.city,
    value.postalCode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 4,
        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        bgcolor: alpha(theme.palette.background.default, 0.4),
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <IconMapPin size={18} stroke={2} style={{ color: theme.palette.primary.main }} />
          <Box>
            <Typography fontWeight={700} fontSize="0.95rem">
              Adres Bilgileri
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gayrimenkulün konumunu hiyerarşik olarak seçin.
            </Typography>
          </Box>
        </Stack>

        {(errorMessage || countriesErrorMessage) && (
          <Alert severity="error">{errorMessage || countriesErrorMessage}</Alert>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
            },
            gap: 2,
            alignItems: "start",
          }}
        >
          <TextField
            select
            size="small"
            sx={compactFieldSx}
            label="Ülke"
            value={safeCountryCode}
            onChange={(e) => void handleCountryChange(e.target.value)}
            fullWidth
            disabled={isCountriesLoading}
            helperText={helperOrBlank(isCountriesLoading ? "Yükleniyor..." : undefined)}
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
            size="small"
            sx={compactFieldSx}
            label="Ülke Kodu"
            value={value.countryCode}
            fullWidth
            InputProps={{ readOnly: true }}
            helperText={helperOrBlank(getError("countryCode"))}
            error={!!getError("countryCode")}
          />

          <TextField
            select
            size="small"
            sx={compactFieldSx}
            label="İl"
            value={value.provinceId}
            onChange={(e) => void handleProvinceChange(e.target.value)}
            fullWidth
            disabled={!value.countryCode || isProvincesLoading}
            error={!!getError("provinceId")}
            helperText={helperOrBlank(getError("provinceId") ?? (isProvincesLoading ? "Yükleniyor..." : undefined))}
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
            size="small"
            sx={compactFieldSx}
            label="İlçe"
            value={value.districtId}
            onChange={(e) => void handleDistrictChange(e.target.value)}
            fullWidth
            disabled={!value.provinceId || isDistrictsLoading}
            error={!!getError("districtId")}
            helperText={helperOrBlank(getError("districtId") ?? (isDistrictsLoading ? "Yükleniyor..." : undefined))}
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
            size="small"
            sx={compactFieldSx}
            label="Mahalle / Köy"
            value={value.neighborhoodId}
            onChange={(e) => handleNeighborhoodChange(e.target.value)}
            fullWidth
            disabled={!value.districtId || isNeighborhoodsLoading}
            error={!!getError("neighborhoodId")}
            helperText={helperOrBlank(
              getError("neighborhoodId") ?? (isNeighborhoodsLoading ? "Yükleniyor..." : undefined),
            )}
          >
            <MenuItem value="">Mahalle / köy seçiniz</MenuItem>
            {neighborhoods.map((neighborhood) => (
              <MenuItem key={neighborhood.id} value={neighborhood.id}>
                {neighborhood.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            size="small"
            sx={compactFieldSx}
            label="Sokak / Cadde"
            value={value.street}
            onChange={(e) => handlePatch({ street: e.target.value })}
            fullWidth
            error={!!getError("street")}
            helperText={helperOrBlank(getError("street"))}
          />

          <TextField
            size="small"
            sx={compactFieldSx}
            label="Bina No"
            value={value.buildingNumber}
            onChange={(e) => handlePatch({ buildingNumber: e.target.value })}
            fullWidth
            error={!!getError("buildingNumber")}
            helperText={helperOrBlank(getError("buildingNumber"))}
          />

          <TextField
            size="small"
            sx={compactFieldSx}
            label="Daire No"
            value={value.apartmentNumber}
            onChange={(e) => handlePatch({ apartmentNumber: e.target.value })}
            fullWidth
            helperText={helperOrBlank(undefined)}
          />

          <TextField
            size="small"
            sx={compactFieldSx}
            label="Posta Kodu"
            value={value.postalCode}
            onChange={(e) => handlePatch({ postalCode: e.target.value })}
            fullWidth
            error={!!getError("postalCode")}
            helperText={helperOrBlank(getError("postalCode"))}
          />
        </Box>

        <Box
          sx={{
            p: 1.5,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
            bgcolor: alpha(theme.palette.primary.main, 0.03),
          }}
        >
          <Typography variant="caption" color="text.secondary" display="block">
            Seçilen adres özeti
          </Typography>
          <Typography fontWeight={700} sx={{ mt: 0.5 }}>
            {summary || "Henüz adres seçilmedi"}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

// ----------------------------------------------------------------
// Reusable Form Components
// ----------------------------------------------------------------
function TextFieldWithTooltip({
  label,
  value,
  onChange,
  error,
  helperText,
  placeholder,
  tooltip,
  icon,
  required,
  multiline,
  endAdornment,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
  placeholder?: string;
  tooltip?: string;
  icon?: React.ReactNode;
  required?: boolean;
  multiline?: boolean;
  endAdornment?: string;
}) {
  const theme = useTheme<Theme>();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Box>
      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.75 }}>
        <Typography
          variant="body2"
          fontWeight={700}
          color={error ? "error.main" : isFocused ? "primary.main" : "text.primary"}
          sx={{ transition: "color 200ms ease" }}
        >
          {label}
        </Typography>

        {required && (
          <Typography variant="caption" color="error" fontWeight={800}>
            *
          </Typography>
        )}

        {tooltip && (
          <Tooltip title={tooltip} arrow placement="top">
            <IconButton size="small" sx={{ p: 0.25 }}>
              <IconInfoCircle size={14} style={{ color: theme.palette.text.disabled }} />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      <TextField
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        error={error}
        helperText={helperText}
        fullWidth
        multiline={multiline}
        minRows={multiline ? 2 : 1}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        InputProps={{
          startAdornment: icon ? (
            <InputAdornment position="start">{icon}</InputAdornment>
          ) : undefined,
          endAdornment: endAdornment ? (
            <InputAdornment position="end">
              <Typography variant="body2" color="text.disabled" fontWeight={600}>
                {endAdornment}
              </Typography>
            </InputAdornment>
          ) : undefined,
          sx: {
            borderRadius: 3,
            bgcolor: "background.paper",
            transition: "all 200ms ease",
            "&:hover": {
              boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
            },
            "&.Mui-focused": {
              boxShadow: `0 0 0 3px ${alpha(
                error ? theme.palette.error.main : theme.palette.primary.main,
                0.15,
              )}`,
            },
          },
        }}
        FormHelperTextProps={{
          sx: { fontWeight: 600, ml: 0, mt: 0.5 },
        }}
      />
    </Box>
  );
}

function PremiumSelect({
  label,
  value,
  onChange,
  options,
  tooltip,
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  tooltip?: string;
  icon?: React.ReactNode;
}) {
  const theme = useTheme<Theme>();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Box>
      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.75 }}>
        <Typography
          variant="body2"
          fontWeight={700}
          color={isFocused ? "primary.main" : "text.primary"}
          sx={{ transition: "color 200ms ease" }}
        >
          {label}
        </Typography>

        {tooltip && (
          <Tooltip title={tooltip} arrow placement="top">
            <IconButton size="small" sx={{ p: 0.25 }}>
              <IconInfoCircle size={14} style={{ color: theme.palette.text.disabled }} />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        displayEmpty
        fullWidth
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        input={
          <OutlinedInput
            startAdornment={
              icon ? <InputAdornment position="start">{icon}</InputAdornment> : undefined
            }
            sx={{
              borderRadius: 3,
              bgcolor: "background.paper",
              "&:hover": {
                boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
              },
              "&.Mui-focused": {
                boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.15)}`,
              },
            }}
          />
        }
        MenuProps={{
          PaperProps: {
            sx: {
              borderRadius: 3,
              mt: 1,
              boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
              border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            },
          },
        }}
      >
        <MenuItem value="" disabled>
          <Typography variant="body2" color="text.disabled">
            Seçiniz
          </Typography>
        </MenuItem>

        {options.map((opt) => (
          <MenuItem
            key={opt.value}
            value={opt.value}
            sx={{
              borderRadius: 2,
              mx: 0.5,
              my: 0.25,
              fontWeight: 600,
              "&.Mui-selected": {
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: "primary.main",
                fontWeight: 800,
              },
            }}
          >
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
}