"use client";

import Link from "next/link";
import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
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
  IconButton,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import {
  IconArrowLeft,
  IconArrowRight,
  IconBath,
  IconBed,
  IconBuildingEstate,
  IconCalendar,
  IconCheck,
  IconChevronDown,
  IconClock,
  IconDeviceFloppy,
  IconEdit,
  IconEye,
  IconFlame,
  IconHomeStar,
  IconInfoCircle,
  IconMapPin,
  IconPhoto,
  IconRuler2,
  IconShieldCheck,
  IconSparkles,
  IconTag,
  IconUser,
  IconVideo,
} from "@tabler/icons-react";

type Props = {
  listingId: string;
};

type ListingType = "rent" | "sale";
type ListingStatus = "draft" | "published" | "passive";
type ListedByType = "emlakOfisinden" | "sahibinden" | "kiracidan";
type ListingCondition = "sifir" | "ikinciEl";
type YesNo = "Var" | "Yok";
type ParkingType = "Açık" | "Kapalı" | "Yok";

type ListingEditForm = {
  listingNo: string;
  title: string;
  type: ListingType;
  status: ListingStatus;
  condition: ListingCondition;
  listedBy: ListedByType;
  ownerDisplayName: string;
  contactRoleLabel: string;
  priceValue: string;
  dues: string;
  deposit: string;
  description: string;
  city: string;
  district: string;
  neighborhood: string;
  propertyName: string;
  unitInfo: string;
  grossArea: string;
  netArea: string;
  room: string;
  bathroomCount: string;
  buildingAge: string;
  floorInfo: string;
  heating: string;
  furnished: string;
  deedStatus: string;
  usageStatus: string;
  occupancyStatus: string;
  availableAt: string;
  elevator: YesNo;
  parking: ParkingType;
  photoCount: string;
  hasVideo: boolean;
  has3DTour: boolean;
  isFeatured: boolean;
  isPinned: boolean;
  coverImage: string;
};

type FormErrors = Partial<Record<keyof ListingEditForm, string>>;

const INITIAL_FORM: ListingEditForm = {
  listingNo: "LM-2401",
  title: "Merkezi konumda bakımlı 1+1 daire",
  type: "rent",
  status: "published",
  condition: "ikinciEl",
  listedBy: "emlakOfisinden",
  ownerDisplayName: "Live Emlak Premium",
  contactRoleLabel: "Emlak Ofisi",
  priceValue: "12500",
  dues: "1250",
  deposit: "2 kira bedeli",
  description:
    "Site içerisinde, ulaşımı kolay, bakımlı ve kullanıma hazır bağımsız bölüm. Günlük yaşam ihtiyaçlarına yakın, düzenli yapısı ve teknik verileri hazır.",
  city: "İstanbul",
  district: "Kadıköy",
  neighborhood: "Kozyatağı",
  propertyName: "Live Residence",
  unitInfo: "A Blok / No 12",
  grossArea: "165",
  netArea: "150",
  room: "1+1",
  bathroomCount: "1",
  buildingAge: "6",
  floorInfo: "6. Kat / 12",
  heating: "VRV",
  furnished: "Eşyalı",
  deedStatus: "Kat Mülkiyeti",
  usageStatus: "Kiracılı",
  occupancyStatus: "Kiracılı • Tahliye sürecinde",
  availableAt: "15 Mayıs 2026",
  elevator: "Var",
  parking: "Kapalı",
  photoCount: "12",
  hasVideo: true,
  has3DTour: true,
  isFeatured: true,
  isPinned: true,
  coverImage:
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
};

const LISTING_STATUS_OPTIONS = [
  { value: "published", label: "Yayında" },
  { value: "draft", label: "Taslak" },
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

const YES_NO_OPTIONS = [
  { value: "Var", label: "Var" },
  { value: "Yok", label: "Yok" },
];

const PARKING_OPTIONS = [
  { value: "Açık", label: "Açık" },
  { value: "Kapalı", label: "Kapalı" },
  { value: "Yok", label: "Yok" },
];

const PremiumConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
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

export default function ListingEditView({ listingId }: Props) {
  const theme = useTheme<Theme>();
  const topRef = useRef<HTMLDivElement>(null);

  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState<ListingEditForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [toast, setToast] = useState({ open: false, message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const detailHref = `/listings-management/my-listings/${listingId}`;
  const previewHref = `/listings-management/my-listings/${listingId}/preview`;

  const steps = ["Yayın & Kimlik", "Fiyat & İçerik", "Teknik & Kullanım", "Medya & Önizleme"];
  const completionPercentage = ((activeStep + 1) / steps.length) * 100;

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeStep]);

  const priceLabel = useMemo(() => formatPrice(form.priceValue, form.type), [form.priceValue, form.type]);

  const duesLabel = useMemo(() => {
    const numeric = Number(form.dues.replace(/[^\d]/g, ""));
    return numeric ? `${new Intl.NumberFormat("tr-TR").format(numeric)} TL` : "Aidat belirtilmedi";
  }, [form.dues]);

  const handleChange = useCallback(<K extends keyof ListingEditForm>(key: K, value: ListingEditForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
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

      if (step === 2) {
        if (!form.netArea.trim()) next.netArea = "Net alan zorunludur.";
        if (!form.grossArea.trim()) next.grossArea = "Brüt alan zorunludur.";
        if (!form.room.trim()) next.room = "Oda bilgisi zorunludur.";
        if (!form.deedStatus.trim()) next.deedStatus = "Tapu durumu zorunludur.";
      }

      if (step === 3) {
        if (!form.coverImage.trim()) next.coverImage = "Kapak görseli zorunludur.";
      }

      setErrors(next);
      return Object.keys(next).length === 0;
    },
    [form],
  );

  const handleSubmit = useCallback(() => {
    setIsSubmitting(true);

    setTimeout(() => {
      console.log("[ListingEditView] save payload:", {
        listingId,
        ...form,
      });

      setIsSubmitting(false);
      setToast({ open: true, message: "İlan değişiklikleri başarıyla kaydedildi." });
    }, 900);
  }, [form, listingId]);

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
                <Chip label="İlan Yönetimi" size="small" sx={{ fontWeight: 800, bgcolor: alpha(theme.palette.primary.main, 0.1), color: "primary.main" }} />
                <IconChevronDown size={14} style={{ transform: "rotate(-90deg)", color: theme.palette.text.disabled }} />
                <Chip label="İlan Düzenleme" size="small" variant="outlined" sx={{ fontWeight: 800 }} />
                <Chip label={`ID: ${listingId}`} size="small" variant="outlined" sx={{ fontWeight: 800 }} />
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight={900} letterSpacing="-0.03em" lineHeight={1.1}>
                    İlanı Düzenle
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                    Yayın, fiyat, teknik bilgiler ve medya görünümünü adım adım düzenleyin.
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Button component={Link} href={detailHref} variant="outlined" startIcon={<IconArrowLeft size={17} />} sx={{ borderRadius: 2.5, fontWeight: 800 }}>
                    Detaya Dön
                  </Button>
                  <Button component={Link} href={previewHref} variant="outlined" startIcon={<IconEye size={17} />} sx={{ borderRadius: 2.5, fontWeight: 800 }}>
                    Önizle
                  </Button>
                </Stack>
              </Stack>

              <Alert severity="info" sx={{ borderRadius: 3 }}>
                Gayrimenkulün sabit teknik kaydı ayrı, ilanın pazarlama ve yayın bilgileri bu ekrandan yönetilir.
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
          <Card variant="outlined" sx={{ borderRadius: 5, borderColor: alpha(theme.palette.divider, 0.6), background: alpha(theme.palette.background.paper, 0.8), backdropFilter: "blur(20px)" }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Stepper activeStep={activeStep} alternativeLabel connector={<PremiumConnector />}>
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel StepIconComponent={PremiumStepIcon}>
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        sx={{
                          color: activeStep === index ? "primary.main" : activeStep > index ? "success.main" : "text.disabled",
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
              {activeStep === 0 && <StepPublishIdentity form={form} errors={errors} onChange={handleChange} />}
              {activeStep === 1 && <StepPriceContent form={form} errors={errors} onChange={handleChange} priceLabel={priceLabel} duesLabel={duesLabel} />}
              {activeStep === 2 && <StepTechnicalUsage form={form} errors={errors} onChange={handleChange} />}
              {activeStep === 3 && <StepMediaPreview form={form} errors={errors} onChange={handleChange} priceLabel={priceLabel} duesLabel={duesLabel} />}
            </CardContent>
          </Card>
        </Fade>

        <Fade in timeout={800}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 1 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              component={activeStep === 0 ? Link : "button"}
              href={activeStep === 0 ? detailHref : undefined}
              startIcon={<IconArrowLeft size={18} />}
              sx={{ borderRadius: 3, fontWeight: 700, textTransform: "none", px: 3 }}
            >
              {activeStep === 0 ? "İptal" : "Geri"}
            </Button>

            <Button
              variant="contained"
              onClick={handleNext}
              disabled={isSubmitting}
              endIcon={isSubmitting ? undefined : activeStep === steps.length - 1 ? <IconCheck size={18} /> : <IconArrowRight size={18} />}
              sx={{
                borderRadius: 3,
                fontWeight: 800,
                textTransform: "none",
                px: 4,
                boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              {isSubmitting ? "Kaydediliyor..." : activeStep === steps.length - 1 ? "Kaydet ve Tamamla" : "Devam Et"}
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
  form: ListingEditForm;
  errors: FormErrors;
  onChange: <K extends keyof ListingEditForm>(key: K, value: ListingEditForm[K]) => void;
}) {
  return (
    <Stack spacing={3}>
      <StepHeader
        icon={<IconEdit size={20} />}
        title="Yayın & Kimlik"
        subtitle="İlan numarası, yayın durumu, ürün durumu ve ilanın kimden olduğu bilgilerini yönetin."
      />

      <GridBox>
        <PremiumTextField label="İlan No" value={form.listingNo} onChange={(v) => onChange("listingNo", v)} error={errors.listingNo} required />
        <PremiumSelect label="Yayın Durumu" value={form.status} onChange={(v) => onChange("status", v as ListingStatus)} options={LISTING_STATUS_OPTIONS} required />
        <PremiumSelect label="İlan Tipi" value={form.type} onChange={(v) => onChange("type", v as ListingType)} options={LISTING_TYPE_OPTIONS} required />
        <PremiumSelect label="Ürün Durumu" value={form.condition} onChange={(v) => onChange("condition", v as ListingCondition)} options={CONDITION_OPTIONS} required />
        <PremiumSelect label="Kimden" value={form.listedBy} onChange={(v) => onChange("listedBy", v as ListedByType)} options={LISTED_BY_OPTIONS} required />
        <PremiumTextField label="İletişim Rolü" value={form.contactRoleLabel} onChange={(v) => onChange("contactRoleLabel", v)} />
        <PremiumTextField label="Görünen kişi / firma adı" value={form.ownerDisplayName} onChange={(v) => onChange("ownerDisplayName", v)} error={errors.ownerDisplayName} required span2 />
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
  form: ListingEditForm;
  errors: FormErrors;
  priceLabel: string;
  duesLabel: string;
  onChange: <K extends keyof ListingEditForm>(key: K, value: ListingEditForm[K]) => void;
}) {
  return (
    <Stack spacing={3}>
      <StepHeader
        icon={<IconSparkles size={20} />}
        title="Fiyat & İçerik"
        subtitle="İlan başlığı, fiyat, aidat, depozito ve pazarlama metnini düzenleyin."
      />

      <PremiumTextField label="İlan Başlığı" value={form.title} onChange={(v) => onChange("title", v)} error={errors.title} required />

      <GridBox>
        <PremiumTextField label="Fiyat" value={form.priceValue} onChange={(v) => onChange("priceValue", v)} error={errors.priceValue} helper={`Önizleme: ${priceLabel}`} required />
        <PremiumTextField label="Aidat" value={form.dues} onChange={(v) => onChange("dues", v)} helper={`Önizleme: ${duesLabel}`} />
        <PremiumTextField label="Depozito" value={form.deposit} onChange={(v) => onChange("deposit", v)} span2 />
      </GridBox>

      <PremiumTextField label="Açıklama" value={form.description} onChange={(v) => onChange("description", v)} error={errors.description} multiline required />
    </Stack>
  );
}

function StepTechnicalUsage({
  form,
  errors,
  onChange,
}: {
  form: ListingEditForm;
  errors: FormErrors;
  onChange: <K extends keyof ListingEditForm>(key: K, value: ListingEditForm[K]) => void;
}) {
  return (
    <Stack spacing={3}>
      <StepHeader
        icon={<IconRuler2 size={20} />}
        title="Teknik & Kullanım"
        subtitle="Konum, birim, teknik detaylar, kullanım ve hukuki bilgileri yönetin."
      />

      <SectionBox title="Konum ve Birim" icon={<IconMapPin size={18} />}>
        <GridBox>
          <PremiumTextField label="Şehir" value={form.city} onChange={(v) => onChange("city", v)} />
          <PremiumTextField label="İlçe" value={form.district} onChange={(v) => onChange("district", v)} />
          <PremiumTextField label="Mahalle / Semt" value={form.neighborhood} onChange={(v) => onChange("neighborhood", v)} />
          <PremiumTextField label="Site / Proje adı" value={form.propertyName} onChange={(v) => onChange("propertyName", v)} />
          <PremiumTextField label="Blok / Daire / Birim" value={form.unitInfo} onChange={(v) => onChange("unitInfo", v)} span2 />
        </GridBox>
      </SectionBox>

      <SectionBox title="Fiziksel Özellikler" icon={<IconHomeStar size={18} />}>
        <GridBox>
          <PremiumTextField label="Brüt m²" value={form.grossArea} onChange={(v) => onChange("grossArea", v)} error={errors.grossArea} required />
          <PremiumTextField label="Net m²" value={form.netArea} onChange={(v) => onChange("netArea", v)} error={errors.netArea} required />
          <PremiumTextField label="Oda sayısı" value={form.room} onChange={(v) => onChange("room", v)} error={errors.room} required />
          <PremiumTextField label="Banyo sayısı" value={form.bathroomCount} onChange={(v) => onChange("bathroomCount", v)} />
          <PremiumTextField label="Bina yaşı" value={form.buildingAge} onChange={(v) => onChange("buildingAge", v)} />
          <PremiumTextField label="Kat bilgisi" value={form.floorInfo} onChange={(v) => onChange("floorInfo", v)} />
          <PremiumTextField label="Isıtma" value={form.heating} onChange={(v) => onChange("heating", v)} />
          <PremiumTextField label="Eşya durumu" value={form.furnished} onChange={(v) => onChange("furnished", v)} />
          <PremiumSelect label="Asansör" value={form.elevator} onChange={(v) => onChange("elevator", v as YesNo)} options={YES_NO_OPTIONS} />
          <PremiumSelect label="Otopark" value={form.parking} onChange={(v) => onChange("parking", v as ParkingType)} options={PARKING_OPTIONS} />
        </GridBox>
      </SectionBox>

      <SectionBox title="Kullanım ve Hukuki Bilgiler" icon={<IconShieldCheck size={18} />}>
        <GridBox>
          <PremiumTextField label="Tapu durumu" value={form.deedStatus} onChange={(v) => onChange("deedStatus", v)} error={errors.deedStatus} required />
          <PremiumTextField label="Mevcut kullanım" value={form.usageStatus} onChange={(v) => onChange("usageStatus", v)} />
          <PremiumTextField label="Kullanım durumu" value={form.occupancyStatus} onChange={(v) => onChange("occupancyStatus", v)} />
          <PremiumTextField label="Boşalma tarihi" value={form.availableAt} onChange={(v) => onChange("availableAt", v)} />
        </GridBox>
      </SectionBox>
    </Stack>
  );
}

function StepMediaPreview({
  form,
  errors,
  onChange,
  priceLabel,
  duesLabel,
}: {
  form: ListingEditForm;
  errors: FormErrors;
  priceLabel: string;
  duesLabel: string;
  onChange: <K extends keyof ListingEditForm>(key: K, value: ListingEditForm[K]) => void;
}) {
  const theme = useTheme<Theme>();

  return (
    <Stack spacing={3}>
      <StepHeader
        icon={<IconPhoto size={20} />}
        title="Medya & Önizleme"
        subtitle="Kapak görseli, medya ayarları ve son kullanıcıya yansıyacak özet görünümü kontrol edin."
      />

      <GridBox>
        <PremiumTextField label="Kapak görseli URL" value={form.coverImage} onChange={(v) => onChange("coverImage", v)} error={errors.coverImage} required span2 />
        <PremiumTextField label="Fotoğraf sayısı" value={form.photoCount} onChange={(v) => onChange("photoCount", v)} />
      </GridBox>

      <Box
        sx={{
          p: 2,
          borderRadius: 4,
          border: `1px solid ${alpha(theme.palette.divider, 0.55)}`,
          bgcolor: alpha(theme.palette.background.default, 0.45),
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <FormControlLabel control={<Switch checked={form.hasVideo} onChange={(e) => onChange("hasVideo", e.target.checked)} />} label="Video var" />
          <FormControlLabel control={<Switch checked={form.has3DTour} onChange={(e) => onChange("has3DTour", e.target.checked)} />} label="3D tur var" />
          <FormControlLabel control={<Switch checked={form.isFeatured} onChange={(e) => onChange("isFeatured", e.target.checked)} />} label="Öne çıkar" />
          <FormControlLabel control={<Switch checked={form.isPinned} onChange={(e) => onChange("isPinned", e.target.checked)} />} label="Sabit ilan" />
        </Stack>
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 5, overflow: "hidden", borderColor: alpha(theme.palette.primary.main, 0.14) }}>
        <Box
          sx={{
            height: 240,
            backgroundImage: form.coverImage ? `linear-gradient(180deg, transparent, ${alpha(theme.palette.common.black, 0.55)}), url(${form.coverImage})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            bgcolor: alpha(theme.palette.primary.main, 0.06),
            position: "relative",
          }}
        >
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ position: "absolute", top: 14, left: 14, right: 14 }}>
            <Chip label={form.type === "rent" ? "Kiralık" : "Satılık"} color="primary" sx={{ fontWeight: 900 }} />
            <Chip label={getConditionLabel(form.condition)} sx={glassChipSx(theme)} />
            <Chip label={getListedByLabel(form.listedBy)} sx={glassChipSx(theme)} />
            <Chip label={getStatusLabel(form.status)} sx={glassChipSx(theme)} />
          </Stack>

          <Box sx={{ position: "absolute", bottom: 16, left: 16, right: 16 }}>
            <Typography variant="h5" fontWeight={900} color="common.white">
              {form.title}
            </Typography>
            <Typography color="rgba(255,255,255,0.85)">
              {form.propertyName} • {form.unitInfo}
            </Typography>
          </Box>
        </Box>

        <CardContent sx={{ p: 2.5 }}>
          <Stack spacing={1.5}>
            <Typography variant="h4" fontWeight={900} color="primary.main">
              {priceLabel}
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <MiniMeta label={`${form.grossArea} m² brüt`} />
              <MiniMeta label={`${form.netArea} m² net`} />
              <MiniMeta label={form.room} />
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

      <Alert severity="info" sx={{ borderRadius: 3 }}>
        Gerçek fotoğraf yükleme ve sıralama sonraki adımda `ListingPhotoDto[]` ve upload endpoint’i ile bağlanmalı.
      </Alert>
    </Stack>
  );
}

function StepHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <Avatar variant="rounded" sx={{ width: 40, height: 40, borderRadius: 2.5, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08), color: "primary.main" }}>
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

function SectionBox({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  const theme = useTheme<Theme>();

  return (
    <Box sx={{ p: 2, borderRadius: 4, border: `1px solid ${alpha(theme.palette.divider, 0.5)}`, bgcolor: alpha(theme.palette.background.default, 0.4) }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ color: "primary.main", display: "inline-flex" }}>{icon}</Box>
          <Typography fontWeight={800}>{title}</Typography>
        </Stack>
        {children}
      </Stack>
    </Box>
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
            "&.Mui-focused": { boxShadow: `0 0 0 3px ${alpha(error ? theme.palette.error.main : theme.palette.primary.main, 0.15)}` },
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
        MenuProps={{
          PaperProps: {
            sx: {
              borderRadius: 3,
              mt: 1,
              boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
            },
          },
        }}
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

function formatPrice(value: string, listingType: ListingType) {
  const numeric = Number(value.replace(/[^\d]/g, ""));
  if (!numeric) return "Fiyat girilmedi";
  const formatted = new Intl.NumberFormat("tr-TR").format(numeric);
  return listingType === "rent" ? `${formatted} TL / ay` : `${formatted} TL`;
}