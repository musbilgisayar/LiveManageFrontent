// src/modules/property-management/views/UnitListingCreateView.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Alert,
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Fade,
  FormControlLabel,
  IconButton,
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
  type StepIconProps,
  StepLabel,
  Stepper,
  styled,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import {
  IconArrowLeft,
  IconArrowRight,
  IconBath,
  IconBed,
  IconBuildingEstate,
  IconCamera,
  IconCheck,
  IconChevronDown,
  IconDeviceFloppy,
  IconEye,
  IconFlame,
  IconHomeStar,
  IconInfoCircle,
  IconMapPin,
  IconPhoto,
  IconReceipt2,
  IconRuler2,
  IconShieldCheck,
  IconSparkles,
  IconTag,
  IconTrash,
  IconUser,
  IconVideo,
} from "@tabler/icons-react";

type ListingType = "rent" | "sale";
type ListingStatus = "draft" | "published" | "passive";
type ListedByType = "emlakOfisinden" | "sahibinden" | "kiracidan";
type ListingCondition = "sifir" | "ikinciEl";

type UnitListingSource = {
  id: string;
  block: string;
  unitNumber: string;
  unitType: "apartment" | "shop" | "office";
  grossArea: number;
  netArea: number;
  roomCount: string;
  bathroomCount: number;
  floor: number;
  buildingAge: number;
  heatingType: string;
  furnished: boolean;
  usageStatus: string;
  titleDeedStatus: string;
};

type ListingPhoto = {
  id: string;
  file: File;
  previewUrl: string;
};

type ListingCreateForm = {
  listingNo: string;
  type: ListingType;
  status: ListingStatus;
  condition: ListingCondition;
  listedBy: ListedByType;
  ownerDisplayName: string;
  contactRoleLabel: string;
  title: string;
  priceValue: string;
  dues: string;
  deposit: string;
  description: string;
  availableAt: string;
  occupancyStatus: string;
  hasVideo: boolean;
  has3DTour: boolean;
  isFeatured: boolean;
  isPinned: boolean;
};

type FormErrors = Partial<Record<keyof ListingCreateForm | "photos", string>>;

const units: UnitListingSource[] = [
  {
    id: "12",
    block: "A",
    unitNumber: "12",
    unitType: "apartment",
    grossArea: 165,
    netArea: 150,
    roomCount: "1+1",
    bathroomCount: 1,
    floor: 6,
    buildingAge: 10,
    heatingType: "VRV",
    furnished: true,
    usageStatus: "Boş",
    titleDeedStatus: "Kat Mülkiyeti",
  },
];

const createInitialForm = (unit: UnitListingSource): ListingCreateForm => ({
  listingNo: `LM-${new Date().getFullYear()}-${unit.id}`,
  type: "rent",
  status: "draft",
  condition: "ikinciEl",
  listedBy: "emlakOfisinden",
  ownerDisplayName: "Live Emlak Premium",
  contactRoleLabel: "Emlak Ofisi",
  title: `Merkezi konumda bakımlı ${unit.roomCount} ${getUnitTypeLabel(unit.unitType).toLowerCase()}`,
  priceValue: "12500",
  dues: "",
  deposit: "2 kira bedeli",
  description:
    "Site içerisinde, ulaşımı kolay, bakımlı ve kullanıma hazır bağımsız bölüm. Günlük yaşam ihtiyaçlarına yakın, düzenli yapısı ve teknik verileri hazır.",
  availableAt: "",
  occupancyStatus: unit.usageStatus,
  hasVideo: false,
  has3DTour: false,
  isFeatured: false,
  isPinned: false,
});

const LISTING_STATUS_OPTIONS = [
  { value: "draft", label: "Taslak" },
  { value: "published", label: "Yayında" },
  { value: "passive", label: "Pasif" },
];

const LISTING_TYPE_OPTIONS = [
  { value: "rent", label: "Kiralık" },
  { value: "sale", label: "Satılık" },
];

const CONDITION_OPTIONS = [
  { value: "sifir", label: "Sıfır" },
  { value: "ikinciEl", label: "İkinci El" },
];

const LISTED_BY_OPTIONS = [
  { value: "emlakOfisinden", label: "Emlak Ofisinden" },
  { value: "sahibinden", label: "Sahibinden" },
  { value: "kiracidan", label: "Kiracıdan" },
];

const PremiumConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: { top: 22 },
  [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}`]: {
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
  },
  [`&.${stepConnectorClasses.completed} .${stepConnectorClasses.line}`]: {
    background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.primary.main})`,
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: alpha(theme.palette.divider, 0.8),
    borderRadius: 1,
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
        boxShadow: active ? `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}` : "none",
        transform: active ? "scale(1.08)" : "scale(1)",
        transition: "all 300ms ease",
      }}
    >
      {completed ? <IconCheck size={20} stroke={3} /> : icon}
    </Box>
  );
}

export default function UnitListingCreateView({
  propertyId,
  unitId,
}: {
  propertyId: string;
  unitId: string;
}) {
  const theme = useTheme<Theme>();
  const topRef = useRef<HTMLDivElement>(null);
  const photosRef = useRef<ListingPhoto[]>([]);

  const unit = units.find((item) => item.id === unitId) ?? units[0];

  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState<ListingCreateForm>(() => createInitialForm(unit));
  const [photos, setPhotos] = useState<ListingPhoto[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [toast, setToast] = useState({ open: false, message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = ["Yayın & Kimlik", "Fiyat & İçerik", "Teknik Kontrol", "Medya & Önizleme"];
  const completionPercentage = ((activeStep + 1) / steps.length) * 100;

  const listHref = "/listings-management/my-listings";
  const selectPropertyHref = "/listings-management/create/select-property";

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => {
    return () => {
      photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    };
  }, []);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeStep]);

  const priceLabel = useMemo(() => formatPrice(form.priceValue, form.type), [form.priceValue, form.type]);

  const duesLabel = useMemo(() => {
    const numeric = Number(form.dues.replace(/[^\d]/g, ""));
    return numeric ? `${new Intl.NumberFormat("tr-TR").format(numeric)} TL` : "Aidat belirtilmedi";
  }, [form.dues]);

  const coverPhoto = photos[0]?.previewUrl;

  const handleChange = useCallback(<K extends keyof ListingCreateForm>(key: K, value: ListingCreateForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const handlePhotoChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const newPhotos = files.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setPhotos((prev) => [...prev, ...newPhotos]);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.photos;
      return next;
    });

    event.target.value = "";
  }, []);

  const handleRemovePhoto = useCallback((photoId: string) => {
    setPhotos((prev) => {
      const target = prev.find((item) => item.id === photoId);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== photoId);
    });
  }, []);

  const validateStep = useCallback(
    (step: number) => {
      const next: FormErrors = {};

      if (step === 0) {
        if (!form.listingNo.trim()) next.listingNo = "İlan no zorunludur.";
        if (!form.ownerDisplayName.trim()) next.ownerDisplayName = "Görünen kişi / firma adı zorunludur.";
      }

      if (step === 1) {
        if (!form.title.trim()) next.title = "İlan başlığı zorunludur.";
        if (!form.priceValue.trim()) next.priceValue = "Fiyat zorunludur.";
        if (!form.description.trim()) next.description = "Açıklama zorunludur.";
      }

      if (step === 3 && photos.length === 0) {
        next.photos = "En az bir kapak fotoğrafı eklenmesi önerilir.";
      }

      setErrors(next);
      return Object.keys(next).length === 0;
    },
    [form, photos.length],
  );

  const handleSubmit = useCallback(() => {
    setIsSubmitting(true);

    setTimeout(() => {
      console.log("[UnitListingCreateView] create payload:", {
        propertyId,
        unitId,
        form,
        photos,
      });

      setIsSubmitting(false);
      setToast({ open: true, message: "İlan taslak olarak oluşturuldu." });
    }, 900);
  }, [form, photos, propertyId, unitId]);

  const handleNext = useCallback(() => {
    if (!validateStep(activeStep)) return;

    if (activeStep === steps.length - 1) {
      handleSubmit();
      return;
    }

    setActiveStep((prev) => prev + 1);
  }, [activeStep, handleSubmit, steps.length, validateStep]);

  const handleBack = useCallback(() => {
    if (activeStep === 0) return;
    setActiveStep((prev) => prev - 1);
  }, [activeStep]);

  return (
    <Box ref={topRef} sx={{ maxWidth: 1120, mx: "auto" }}>
      <Stack spacing={3}>
        <Slide direction="down" in timeout={500}>
          <Box
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 5,
              position: "relative",
              overflow: "hidden",
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(
                theme.palette.primary.light,
                0.05,
              )} 40%, ${alpha(theme.palette.info.main, 0.04)} 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
            }}
          >
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Chip
                  label="İlan Yönetimi"
                  size="small"
                  sx={{
                    fontWeight: 800,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: "primary.main",
                  }}
                />
                <IconChevronDown
                  size={14}
                  style={{ transform: "rotate(-90deg)", color: theme.palette.text.disabled }}
                />
                <Chip label="Yeni İlan" size="small" variant="outlined" sx={{ fontWeight: 800 }} />
                <Chip label={`Property: ${propertyId}`} size="small" variant="outlined" />
                <Chip label={`Unit: ${unitId}`} size="small" variant="outlined" />
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight={900} letterSpacing="-0.03em" lineHeight={1.1}>
                    Yeni İlan Oluştur
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                    Gayrimenkulün sabit teknik bilgileri korunur. Bu ekranda yalnızca ilan, fiyat,
                    medya ve yayın bilgilerini tamamlarsınız.
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Button
                    component={Link}
                    href={selectPropertyHref}
                    variant="outlined"
                    startIcon={<IconArrowLeft size={17} />}
                    sx={{ borderRadius: 2.5, fontWeight: 800 }}
                  >
                    Seçime Dön
                  </Button>
                  <Button
                    component={Link}
                    href={listHref}
                    variant="outlined"
                    startIcon={<IconEye size={17} />}
                    sx={{ borderRadius: 2.5, fontWeight: 800 }}
                  >
                    İlanlarım
                  </Button>
                </Stack>
              </Stack>

              <Alert severity="info" sx={{ borderRadius: 3 }}>
                Teknik bilgiler ana gayrimenkul kaydından gelir. İlan ekranında fiyat, kimden,
                ürün durumu, açıklama ve medya bilgileri oluşturulur.
              </Alert>

              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
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
        </Slide>

        <Fade in timeout={700}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 5,
              borderColor: alpha(theme.palette.divider, 0.6),
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: "blur(20px)",
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Stepper activeStep={activeStep} alternativeLabel connector={<PremiumConnector />}>
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel StepIconComponent={PremiumStepIcon}>
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        sx={{
                          color:
                            activeStep === index
                              ? "primary.main"
                              : activeStep > index
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
              background: alpha(theme.palette.background.paper, 0.72),
              backdropFilter: "blur(16px)",
              boxShadow: `0 4px 24px ${alpha(theme.palette.common.black, 0.03)}`,
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
              {activeStep === 0 && (
                <StepPublishIdentity form={form} errors={errors} onChange={handleChange} />
              )}

              {activeStep === 1 && (
                <StepPriceContent
                  form={form}
                  errors={errors}
                  onChange={handleChange}
                  priceLabel={priceLabel}
                  duesLabel={duesLabel}
                />
              )}

              {activeStep === 2 && <StepTechnicalCheck unit={unit} propertyId={propertyId} unitId={unitId} />}

              {activeStep === 3 && (
                <StepMediaPreview
                  form={form}
                  errors={errors}
                  photos={photos}
                  unit={unit}
                  priceLabel={priceLabel}
                  duesLabel={duesLabel}
                  coverPhoto={coverPhoto}
                  onChange={handleChange}
                  onPhotoChange={handlePhotoChange}
                  onRemovePhoto={handleRemovePhoto}
                />
              )}
            </CardContent>
          </Card>
        </Fade>

        <Fade in timeout={800}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 1 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              component={activeStep === 0 ? Link : "button"}
              href={activeStep === 0 ? selectPropertyHref : undefined}
              startIcon={<IconArrowLeft size={18} />}
              sx={{ borderRadius: 3, fontWeight: 700, textTransform: "none", px: 3 }}
            >
              {activeStep === 0 ? "İptal" : "Geri"}
            </Button>

            <Button
              variant="contained"
              onClick={handleNext}
              disabled={isSubmitting}
              endIcon={
                isSubmitting ? undefined : activeStep === steps.length - 1 ? (
                  <IconCheck size={18} />
                ) : (
                  <IconArrowRight size={18} />
                )
              }
              sx={{
                borderRadius: 3,
                fontWeight: 800,
                textTransform: "none",
                px: 4,
                boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              {isSubmitting
                ? "Kaydediliyor..."
                : activeStep === steps.length - 1
                  ? "Taslak Olarak Oluştur"
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
              <IconCheck size={22} stroke={2.5} />
              <Typography fontWeight={800}>{toast.message}</Typography>
            </Stack>
          </CardContent>
        </Card>
      </Snackbar>
    </Box>
  );
}

function StepPublishIdentity({
  form,
  errors,
  onChange,
}: {
  form: ListingCreateForm;
  errors: FormErrors;
  onChange: <K extends keyof ListingCreateForm>(key: K, value: ListingCreateForm[K]) => void;
}) {
  return (
    <Stack spacing={3}>
      <StepHeader
        icon={<IconReceipt2 size={20} />}
        title="Yayın & Kimlik"
        subtitle="İlan numarası, yayın durumu, ilan tipi, ürün durumu ve kimden bilgisini belirleyin."
      />

      <GridBox>
        <PremiumTextField
          label="İlan No"
          value={form.listingNo}
          onChange={(v) => onChange("listingNo", v)}
          error={errors.listingNo}
          required
        />
        <PremiumSelect
          label="Yayın Durumu"
          value={form.status}
          onChange={(v) => onChange("status", v as ListingStatus)}
          options={LISTING_STATUS_OPTIONS}
          required
        />
        <PremiumSelect
          label="İlan Tipi"
          value={form.type}
          onChange={(v) => onChange("type", v as ListingType)}
          options={LISTING_TYPE_OPTIONS}
          required
        />
        <PremiumSelect
          label="Ürün Durumu"
          value={form.condition}
          onChange={(v) => onChange("condition", v as ListingCondition)}
          options={CONDITION_OPTIONS}
          required
        />
        <PremiumSelect
          label="Kimden"
          value={form.listedBy}
          onChange={(v) => onChange("listedBy", v as ListedByType)}
          options={LISTED_BY_OPTIONS}
          required
        />
        <PremiumTextField
          label="İletişim Rolü"
          value={form.contactRoleLabel}
          onChange={(v) => onChange("contactRoleLabel", v)}
        />
        <PremiumTextField
          label="Görünen kişi / firma adı"
          value={form.ownerDisplayName}
          onChange={(v) => onChange("ownerDisplayName", v)}
          error={errors.ownerDisplayName}
          required
          span2
        />
      </GridBox>
    </Stack>
  );
}

function StepPriceContent({
  form,
  errors,
  onChange,
  priceLabel,
  duesLabel,
}: {
  form: ListingCreateForm;
  errors: FormErrors;
  priceLabel: string;
  duesLabel: string;
  onChange: <K extends keyof ListingCreateForm>(key: K, value: ListingCreateForm[K]) => void;
}) {
  return (
    <Stack spacing={3}>
      <StepHeader
        icon={<IconSparkles size={20} />}
        title="Fiyat & İçerik"
        subtitle="İlan başlığı, fiyat, aidat, depozito, boşalma tarihi ve açıklama metnini oluşturun."
      />

      <PremiumTextField
        label="İlan Başlığı"
        value={form.title}
        onChange={(v) => onChange("title", v)}
        error={errors.title}
        required
      />

      <GridBox>
        <PremiumTextField
          label="Fiyat"
          value={form.priceValue}
          onChange={(v) => onChange("priceValue", v)}
          error={errors.priceValue}
          helper={`Önizleme: ${priceLabel}`}
          required
        />
        <PremiumTextField
          label="Aidat"
          value={form.dues}
          onChange={(v) => onChange("dues", v)}
          helper={`Önizleme: ${duesLabel}`}
        />
        <PremiumTextField
          label="Depozito"
          value={form.deposit}
          onChange={(v) => onChange("deposit", v)}
        />
        <PremiumTextField
          label="Boşalma Tarihi"
          value={form.availableAt}
          onChange={(v) => onChange("availableAt", v)}
          helper="Örn: 15 Mayıs 2026"
        />
        <PremiumTextField
          label="Kullanım Durumu"
          value={form.occupancyStatus}
          onChange={(v) => onChange("occupancyStatus", v)}
          span2
        />
      </GridBox>

      <PremiumTextField
        label="Açıklama"
        value={form.description}
        onChange={(v) => onChange("description", v)}
        error={errors.description}
        multiline
        required
      />
    </Stack>
  );
}

function StepTechnicalCheck({
  unit,
  propertyId,
  unitId,
}: {
  unit: UnitListingSource;
  propertyId: string;
  unitId: string;
}) {
  return (
    <Stack spacing={3}>
      <StepHeader
        icon={<IconShieldCheck size={20} />}
        title="Teknik Kontrol"
        subtitle="Bu bilgiler gayrimenkul ana kaydından otomatik gelir. İlan içinde değiştirilmez."
      />

      <Alert severity="info" sx={{ borderRadius: 3 }}>
        Property ID: {propertyId} / Unit ID: {unitId}. Bu bilgiler backend bağlantısında gerçek unit
        detayından beslenecek.
      </Alert>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(3, minmax(0, 1fr))" },
          gap: 1.5,
        }}
      >
        <SpecTile label="Birim türü" value={getUnitTypeLabel(unit.unitType)} icon={<IconBuildingEstate size={18} />} />
        <SpecTile label="Blok / No" value={`${unit.block} / ${unit.unitNumber}`} icon={<IconMapPin size={18} />} />
        <SpecTile label="Brüt m²" value={`${unit.grossArea}`} icon={<IconRuler2 size={18} />} />
        <SpecTile label="Net m²" value={`${unit.netArea}`} icon={<IconRuler2 size={18} />} />
        <SpecTile label="Oda sayısı" value={unit.roomCount} icon={<IconBed size={18} />} />
        <SpecTile label="Banyo" value={`${unit.bathroomCount}`} icon={<IconBath size={18} />} />
        <SpecTile label="Kat" value={`${unit.floor}`} icon={<IconHomeStar size={18} />} />
        <SpecTile label="Bina yaşı" value={`${unit.buildingAge}`} icon={<IconReceipt2 size={18} />} />
        <SpecTile label="Isıtma" value={unit.heatingType} icon={<IconFlame size={18} />} />
        <SpecTile label="Eşya" value={unit.furnished ? "Eşyalı" : "Boş"} icon={<IconTag size={18} />} />
        <SpecTile label="Kullanım" value={unit.usageStatus} icon={<IconInfoCircle size={18} />} />
        <SpecTile label="Tapu" value={unit.titleDeedStatus} icon={<IconShieldCheck size={18} />} />
      </Box>
    </Stack>
  );
}

function StepMediaPreview({
  form,
  errors,
  photos,
  unit,
  priceLabel,
  duesLabel,
  coverPhoto,
  onChange,
  onPhotoChange,
  onRemovePhoto,
}: {
  form: ListingCreateForm;
  errors: FormErrors;
  photos: ListingPhoto[];
  unit: UnitListingSource;
  priceLabel: string;
  duesLabel: string;
  coverPhoto?: string;
  onChange: <K extends keyof ListingCreateForm>(key: K, value: ListingCreateForm[K]) => void;
  onPhotoChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: (photoId: string) => void;
}) {
  const theme = useTheme<Theme>();

  return (
    <Stack spacing={3}>
      <StepHeader
        icon={<IconCamera size={20} />}
        title="Medya & Önizleme"
        subtitle="Fotoğraf yükleyin, medya ayarlarını belirleyin ve son ilan görünümünü kontrol edin."
      />

      <Box
        sx={{
          p: 2,
          borderRadius: 4,
          border: `1px dashed ${alpha(theme.palette.primary.main, 0.24)}`,
          bgcolor: alpha(theme.palette.primary.main, 0.03),
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
        >
          <Box>
            <Typography fontWeight={900}>Fotoğraf yükleyin</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              İlk görsel kapak fotoğrafı olarak kullanılacaktır.
            </Typography>
            {errors.photos && (
              <Typography variant="caption" color="warning.dark" fontWeight={700}>
                {errors.photos}
              </Typography>
            )}
          </Box>

          <Button
            component="label"
            variant="contained"
            startIcon={<IconPhoto size={18} />}
            sx={{ borderRadius: 2.5, flexShrink: 0, fontWeight: 800 }}
          >
            Fotoğraf Seç
            <input
              hidden
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              onChange={onPhotoChange}
            />
          </Button>
        </Stack>
      </Box>

      {photos.length > 0 ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr 1fr",
              md: "repeat(3, minmax(0, 1fr))",
            },
            gap: 1.25,
          }}
        >
          {photos.map((photo, index) => (
            <PhotoPreviewCard
              key={photo.id}
              photo={photo}
              index={index}
              onRemove={() => onRemovePhoto(photo.id)}
            />
          ))}
        </Box>
      ) : (
        <EmptyPhotoState />
      )}

      <Box
        sx={{
          p: 2,
          borderRadius: 4,
          border: `1px solid ${alpha(theme.palette.divider, 0.55)}`,
          bgcolor: alpha(theme.palette.background.default, 0.45),
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <FormControlLabel
            control={<Switch checked={form.hasVideo} onChange={(e) => onChange("hasVideo", e.target.checked)} />}
            label="Video var"
          />
          <FormControlLabel
            control={<Switch checked={form.has3DTour} onChange={(e) => onChange("has3DTour", e.target.checked)} />}
            label="3D tur var"
          />
          <FormControlLabel
            control={<Switch checked={form.isFeatured} onChange={(e) => onChange("isFeatured", e.target.checked)} />}
            label="Öne çıkar"
          />
          <FormControlLabel
            control={<Switch checked={form.isPinned} onChange={(e) => onChange("isPinned", e.target.checked)} />}
            label="Sabit ilan"
          />
        </Stack>
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 5, overflow: "hidden" }}>
        <Box
          sx={{
            height: 260,
            backgroundImage: coverPhoto
              ? `linear-gradient(180deg, transparent, ${alpha(theme.palette.common.black, 0.55)}), url(${coverPhoto})`
              : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            bgcolor: alpha(theme.palette.primary.main, 0.06),
            position: "relative",
            display: coverPhoto ? "block" : "grid",
            placeItems: coverPhoto ? undefined : "center",
          }}
        >
          {!coverPhoto && (
            <Stack spacing={1} alignItems="center" sx={{ color: "text.secondary" }}>
              <IconPhoto size={36} />
              <Typography fontWeight={900}>Kapak fotoğrafı henüz eklenmedi</Typography>
            </Stack>
          )}

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ position: "absolute", top: 14, left: 14, right: 14 }}>
            <Chip label={getListingTypeLabel(form.type)} color="primary" sx={{ fontWeight: 900 }} />
            <Chip label={getConditionLabel(form.condition)} sx={glassChipSx(theme)} />
            <Chip label={getListedByLabel(form.listedBy)} sx={glassChipSx(theme)} />
            <Chip label={getStatusLabel(form.status)} sx={glassChipSx(theme)} />
          </Stack>

          <Box sx={{ position: "absolute", bottom: 16, left: 16, right: 16 }}>
            <Typography variant="h5" fontWeight={900} color={coverPhoto ? "common.white" : "text.primary"}>
              {form.title}
            </Typography>
            <Typography color={coverPhoto ? "rgba(255,255,255,0.85)" : "text.secondary"}>
              Blok {unit.block} / No {unit.unitNumber} • {unit.roomCount}
            </Typography>
          </Box>
        </Box>

        <CardContent sx={{ p: 2.5 }}>
          <Stack spacing={1.5}>
            <Typography variant="h4" fontWeight={900} color="primary.main">
              {priceLabel}
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <MiniMeta label={`${unit.grossArea} m² brüt`} />
              <MiniMeta label={`${unit.netArea} m² net`} />
              <MiniMeta label={unit.roomCount} />
              <MiniMeta label={`Aidat ${duesLabel}`} />
              {form.hasVideo && <MiniMeta label="Video" />}
              {form.has3DTour && <MiniMeta label="3D Tur" />}
            </Stack>

            <Divider />

            <Typography color="text.secondary" lineHeight={1.7}>
              {form.description}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

function StepHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <Avatar
        variant="rounded"
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2.5,
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
          color: "primary.main",
        }}
      >
        {icon}
      </Avatar>
      <Box>
        <Typography variant="h6" fontWeight={900}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>
    </Stack>
  );
}

function GridBox({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, alignItems: "start" }}>
      {children}
    </Box>
  );
}

function PremiumTextField({
  label,
  value,
  onChange,
  error,
  helper,
  required,
  multiline,
  span2,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helper?: string;
  required?: boolean;
  multiline?: boolean;
  span2?: boolean;
}) {
  const theme = useTheme<Theme>();
  const [focused, setFocused] = useState(false);

  return (
    <Box sx={{ gridColumn: span2 ? { xs: "span 1", md: "span 2" } : undefined }}>
      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.75 }}>
        <Typography variant="body2" fontWeight={700} color={error ? "error.main" : focused ? "primary.main" : "text.primary"}>
          {label}
        </Typography>
        {required && (
          <Typography variant="caption" color="error" fontWeight={800}>
            *
          </Typography>
        )}
      </Stack>

      <TextField
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={!!error}
        helperText={error || helper || " "}
        fullWidth
        multiline={multiline}
        minRows={multiline ? 6 : 1}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        InputProps={{
          sx: {
            borderRadius: 3,
            bgcolor: "background.paper",
            "&:hover": { boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}` },
            "&.Mui-focused": {
              boxShadow: `0 0 0 3px ${alpha(error ? theme.palette.error.main : theme.palette.primary.main, 0.15)}`,
            },
          },
        }}
        FormHelperTextProps={{ sx: { fontWeight: 600, ml: 0, mt: 0.5 } }}
      />
    </Box>
  );
}

function PremiumSelect({
  label,
  value,
  onChange,
  options,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}) {
  const theme = useTheme<Theme>();

  return (
    <Box>
      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.75 }}>
        <Typography variant="body2" fontWeight={700}>
          {label}
        </Typography>
        {required && (
          <Typography variant="caption" color="error" fontWeight={800}>
            *
          </Typography>
        )}
        <Tooltip title={label} arrow>
          <IconButton size="small" sx={{ p: 0.25 }}>
            <IconInfoCircle size={14} style={{ color: theme.palette.text.disabled }} />
          </IconButton>
        </Tooltip>
      </Stack>

      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        fullWidth
        input={
          <OutlinedInput
            sx={{
              borderRadius: 3,
              bgcolor: "background.paper",
              "&:hover": { boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}` },
              "&.Mui-focused": { boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.15)}` },
            }}
          />
        }
      >
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value} sx={{ fontWeight: 700 }}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>

      <Typography variant="caption" color="transparent" sx={{ mt: 0.5, display: "block", minHeight: 20 }}>
        .
      </Typography>
    </Box>
  );
}

function SpecTile({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  const theme = useTheme<Theme>();

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 3.5,
        border: `1px solid ${alpha(theme.palette.divider, 0.65)}`,
        bgcolor: alpha(theme.palette.background.paper, 0.72),
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="center">
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2.5,
            display: "grid",
            placeItems: "center",
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            color: "primary.main",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Typography fontWeight={900}>{value}</Typography>
        </Box>
      </Stack>
    </Box>
  );
}

function PhotoPreviewCard({
  photo,
  index,
  onRemove,
}: {
  photo: ListingPhoto;
  index: number;
  onRemove: () => void;
}) {
  const theme = useTheme<Theme>();

  return (
    <Box
      sx={{
        borderRadius: 3.5,
        overflow: "hidden",
        border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
        bgcolor: theme.palette.background.paper,
      }}
    >
      <Box
        sx={{
          position: "relative",
          aspectRatio: "4 / 3",
          backgroundImage: `url(${photo.previewUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Chip
          label={index === 0 ? "Kapak" : `Foto ${index + 1}`}
          size="small"
          sx={{
            position: "absolute",
            top: 10,
            left: 10,
            fontWeight: 800,
            bgcolor: alpha(theme.palette.background.paper, 0.88),
          }}
        />
      </Box>

      <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center" sx={{ p: 1.25 }}>
        <Typography variant="caption" color="text.secondary" noWrap>
          {photo.file.name}
        </Typography>

        <Button
          size="small"
          color="inherit"
          startIcon={<IconTrash size={14} />}
          onClick={onRemove}
          sx={{ minWidth: "auto", px: 1 }}
        >
          Sil
        </Button>
      </Stack>
    </Box>
  );
}

function EmptyPhotoState() {
  const theme = useTheme<Theme>();

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 4,
        border: `1px dashed ${alpha(theme.palette.text.primary, 0.14)}`,
        bgcolor: alpha(theme.palette.text.primary, 0.015),
      }}
    >
      <Stack spacing={1} alignItems="center" textAlign="center">
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2.5,
            display: "grid",
            placeItems: "center",
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            color: "primary.main",
          }}
        >
          <IconPhoto size={20} />
        </Box>

        <Typography fontWeight={900}>Henüz fotoğraf eklenmedi</Typography>
        <Typography variant="body2" color="text.secondary">
          En az bir kapak görseli eklemek ilan kalitesini ciddi biçimde artırır.
        </Typography>
      </Stack>
    </Box>
  );
}

function MiniMeta({ label }: { label: string }) {
  return <Chip label={label} size="small" variant="outlined" sx={{ fontWeight: 700 }} />;
}

function glassChipSx(theme: Theme) {
  return {
    fontWeight: 900,
    bgcolor: alpha(theme.palette.background.paper, 0.88),
    backdropFilter: "blur(10px)",
    border: `1px solid ${alpha(theme.palette.divider, 0.45)}`,
  };
}

function formatPrice(value: string, listingType: ListingType) {
  const numeric = Number(value.replace(/[^\d]/g, ""));
  if (!numeric) return "Fiyat girilmedi";
  const formatted = new Intl.NumberFormat("tr-TR").format(numeric);
  return listingType === "rent" ? `${formatted} TL / ay` : `${formatted} TL`;
}

function getListingTypeLabel(type: ListingType) {
  return type === "rent" ? "Kiralık" : "Satılık";
}

function getStatusLabel(status: ListingStatus) {
  if (status === "published") return "Yayında";
  if (status === "draft") return "Taslak";
  return "Pasif";
}

function getListedByLabel(value: ListedByType) {
  if (value === "emlakOfisinden") return "Emlak Ofisinden";
  if (value === "kiracidan") return "Kiracıdan";
  return "Sahibinden";
}

function getConditionLabel(value: ListingCondition) {
  return value === "sifir" ? "Sıfır" : "İkinci El";
}

function getUnitTypeLabel(type: UnitListingSource["unitType"]) {
  if (type === "shop") return "Dükkan";
  if (type === "office") return "Ofis";
  return "Daire";
}