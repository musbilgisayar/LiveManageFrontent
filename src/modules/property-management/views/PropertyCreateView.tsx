// src/modules/property-management/views/PropertyCreateView.tsx
"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
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
  type StepIconProps,
  StepLabel,
  Stepper,
  styled,
  Switch,
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
  IconBath,
  IconBed,
  IconBookmark,
  IconBuilding,
  IconBuildingEstate,
  IconBuildingStore,
  IconCalendar,
  IconCamera,
  IconCheck,
  IconChevronDown,
  IconCircleCheck,
  IconCurrentLocation,
  IconDeviceCctv,
  IconDoor,
  IconFlame,
  IconHome,
  IconInfoCircle,
  IconMapPin,
  IconRuler,
  IconShieldCheck,
  IconSofa,
  IconStack2,
  IconStairs,
} from "@tabler/icons-react";
import { useAddressCountries } from "../../users/hooks/useAddressCountries";
import { useAddressHierarchy } from "../../users/hooks/useAddressHierarchy";

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------
type PropertyType = "apartment" | "shop" | "office" | "villa";
type YesNo = "yes" | "no";
type ParkingType = "open" | "closed" | "none";
type FrontageType = "north" | "south" | "east" | "west" | "mixed";
type AddressVisibilityDefault = "full" | "masked" | "hidden";

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
  latitude: string;
  longitude: string;
  addressVisibilityDefault: AddressVisibilityDefault;
};

interface PropertyForm {
  type: PropertyType;

  // Identity
  name: string;
  propertyCode: string;
  internalCode: string;
  externalReferenceNo: string;
  buildingName: string;
  siteName: string;
  blockName: string;
  unitNumber: string;

  // Address
  address: PropertyAddressForm;

  // Shared technical
  grossArea: string;
  netArea: string;
  layoutType: string;
  bathroomCount: string;
  toiletCount: string;
  floor: string;
  totalFloors: string;
  buildingAge: string;
  constructionYear: string;
  heating: string;
  heatingInfrastructure: string;
  coolingInfrastructure: string;
  furnished: string;
  elevator: YesNo;
  parking: ParkingType;
  frontage: FrontageType;
  buildingCondition: string;
  structureType: string;

  // Building / site
  hasBuildingManagement: YesNo;
  hasSecurity: YesNo;
  hasCameraSystem: YesNo;
  hasGenerator: YesNo;
  hasWaterTank: YesNo;
  hasHydrophore: YesNo;
  earthquakeCompliance: string;

  // Energy / quality
  energyClass: string;
  hasThermalInsulation: YesNo;
  hasSoundInsulation: YesNo;

  // Legal
  deedStatus: string;
  parcelBlockNo: string;
  parcelNo: string;
  lotNo: string;
  independentSectionNo: string;
  zoningStatus: string;
  hasOccupancyPermit: YesNo;
  constructionPermitYear: string;
  usageTypeOnDeed: string;

  // Residential
  hasClosetWC: YesNo;
  hasAlaturkaWC: YesNo;
  hasEnSuiteBathroom: YesNo;
  isOpenKitchen: YesNo;
  hasBalcony: YesNo;
  balconyCount: string;

  // Shop details
  frontWidth: string;
  ceilingHeight: string;
  hasStorage: YesNo;
  hasMezzanine: YesNo;
  hasKitchenArea: YesNo;
  hasSignboardRight: YesNo;
  suitableForFoodBusiness: YesNo;
  suitableForOfficeUse: YesNo;

  // Office details
  meetingRoomCount: string;
  hasReception: YesNo;
  hasKitchenette: YesNo;
  hasAirConditioning: YesNo;
  hasFiberInternet: YesNo;
  hasCardAccess: YesNo;

  // Villa details
  landArea: string;
  gardenArea: string;
  hasGarden: YesNo;
  hasPool: YesNo;
  hasGarage: YesNo;
  hasTerrace: YesNo;
  hasFireplace: YesNo;
  isDetached: YesNo;
  isInCompound: YesNo;
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
    value: "villa",
    label: "Villa",
    icon: <IconBuildingEstate size={32} stroke={2} />,
    description: "Müstakil veya çok katlı konut",
  },
  {
    value: "shop",
    label: "Dükkan",
    icon: <IconBuildingStore size={32} stroke={2} />,
    description: "Ticari amaçlı bağımsız bölüm",
  },
  {
    value: "office",
    label: "Ofis",
    icon: <IconBuilding size={32} stroke={2} />,
    description: "İş yeri amaçlı bağımsız bölüm",
  },
];

const HEATING_OPTIONS = [
  { value: "central", label: "Merkezi" },
  { value: "combi", label: "Kombi (Doğalgaz)" },
  { value: "vrv", label: "VRV / Klima" },
  { value: "stove", label: "Soba" },
  { value: "heatPump", label: "Isı Pompası" },
  { value: "floorHeating", label: "Yerden Isıtma" },
  { value: "none", label: "Yok" },
];

const HEATING_INFRASTRUCTURE_OPTIONS = [
  { value: "naturalGas", label: "Doğalgaz Altyapısı Var" },
  { value: "centralLine", label: "Merkezi Hat Var" },
  { value: "electric", label: "Elektrik Altyapısı" },
  { value: "none", label: "Yok" },
];

const COOLING_INFRASTRUCTURE_OPTIONS = [
  { value: "multiSplit", label: "Multi Split Uygun" },
  { value: "vrv", label: "VRV Uygun" },
  { value: "centralCooling", label: "Merkezi Soğutma" },
  { value: "none", label: "Yok" },
];

const FURNISHED_OPTIONS = [
  { value: "furnished", label: "Eşyalı" },
  { value: "semiFurnished", label: "Yarı Eşyalı" },
  { value: "unfurnished", label: "Boş" },
];

const DEED_STATUS_OPTIONS = [
  { value: "floorOwnership", label: "Kat Mülkiyeti" },
  { value: "floorEasement", label: "Kat İrtifakı" },
  { value: "detachedTitle", label: "Müstakil Tapu" },
  { value: "sharedTitle", label: "Hisseli Tapu" },
];

const YES_NO_OPTIONS = [
  { value: "yes", label: "Var" },
  { value: "no", label: "Yok" },
];

const PARKING_OPTIONS = [
  { value: "open", label: "Açık" },
  { value: "closed", label: "Kapalı" },
  { value: "none", label: "Yok" },
];

const FRONTAGE_OPTIONS = [
  { value: "north", label: "Kuzey" },
  { value: "south", label: "Güney" },
  { value: "east", label: "Doğu" },
  { value: "west", label: "Batı" },
  { value: "mixed", label: "Birden Fazla Cephe" },
];

const RESIDENTIAL_LAYOUT_OPTIONS = [
  { value: "studio", label: "Stüdyo" },
  { value: "1+0", label: "1+0" },
  { value: "1+1", label: "1+1" },
  { value: "2+1", label: "2+1" },
  { value: "2+2", label: "2+2" },
  { value: "3+1", label: "3+1" },
  { value: "3+2", label: "3+2" },
  { value: "4+1", label: "4+1" },
  { value: "4+2", label: "4+2" },
  { value: "5+1", label: "5+1" },
  { value: "5+2", label: "5+2" },
  { value: "6+1", label: "6+1" },
  { value: "6+2", label: "6+2" },
  { value: "7+", label: "7+ ve üzeri" },
];

const OFFICE_LAYOUT_OPTIONS = [
  { value: "openOffice", label: "Açık Ofis" },
  { value: "privateOffice", label: "Kapalı Ofis" },
  { value: "coworking", label: "Paylaşımlı Ofis" },
  { value: "1+0", label: "1+0" },
  { value: "1+1", label: "1+1" },
  { value: "2+1", label: "2+1" },
  { value: "3+1", label: "3+1" },
  { value: "4+1", label: "4+1" },
  { value: "5+", label: "5+ ve üzeri" },
];

const SHOP_LAYOUT_OPTIONS = [
  { value: "openArea", label: "Açık Alan" },
  { value: "singleSection", label: "Tek Bölüm" },
  { value: "withLoft", label: "Asma Katlı" },
  { value: "withStorage", label: "Depolu Dükkan" },
  { value: "showroom", label: "Showroom" },
  { value: "cornerShop", label: "Köşe Dükkan" },
];

const COUNT_OPTIONS = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
  { value: "6+", label: "6 ve üzeri" },
];

const BUILDING_CONDITION_OPTIONS = [
  { value: "new", label: "Yeni" },
  { value: "good", label: "İyi" },
  { value: "renovated", label: "Yenilenmiş" },
  { value: "needsRenovation", label: "Tadilat Gerekli" },
];

const STRUCTURE_TYPE_OPTIONS = [
  { value: "reinforcedConcrete", label: "Betonarme" },
  { value: "steel", label: "Çelik" },
  { value: "masonry", label: "Yığma" },
  { value: "wood", label: "Ahşap" },
  { value: "prefabricated", label: "Prefabrik" },
];

const EARTHQUAKE_COMPLIANCE_OPTIONS = [
  { value: "unknown", label: "Bilinmiyor" },
  { value: "compliant", label: "Uygun" },
  { value: "partiallyCompliant", label: "Kısmen Uygun" },
  { value: "notCompliant", label: "Uygun Değil" },
];

const ENERGY_CLASS_OPTIONS = [
  { value: "A+", label: "A+" },
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "C", label: "C" },
  { value: "D", label: "D" },
  { value: "E", label: "E" },
  { value: "F", label: "F" },
  { value: "G", label: "G" },
  { value: "unknown", label: "Bilinmiyor" },
];

const ADDRESS_VISIBILITY_OPTIONS = [
  { value: "full", label: "Tam Göster" },
  { value: "masked", label: "Maskele" },
  { value: "hidden", label: "Gizle" },
];

const ZONING_STATUS_OPTIONS = [
  { value: "residential", label: "Konut İmarlı" },
  { value: "commercial", label: "Ticari İmarlı" },
  { value: "mixed", label: "Karma İmarlı" },
  { value: "field", label: "Tarla" },
  { value: "land", label: "Arsa" },
  { value: "unknown", label: "Bilinmiyor" },
];

const USAGE_TYPE_ON_DEED_OPTIONS = [
  { value: "apartment", label: "Mesken" },
  { value: "office", label: "Ofis / Büro" },
  { value: "shop", label: "Dükkan / İşyeri" },
  { value: "villa", label: "Villa" },
  { value: "land", label: "Arsa" },
  { value: "warehouse", label: "Depo" },
  { value: "other", label: "Diğer" },
];

const createDefaultAddress = (): PropertyAddressForm => ({
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
  latitude: "",
  longitude: "",
  addressVisibilityDefault: "masked",
});

const INITIAL_FORM: PropertyForm = {
  type: "apartment",

  name: "",
  propertyCode: "",
  internalCode: "",
  externalReferenceNo: "",
  buildingName: "",
  siteName: "",
  blockName: "",
  unitNumber: "",

  address: createDefaultAddress(),

  grossArea: "",
  netArea: "",
  layoutType: "",
  bathroomCount: "",
  toiletCount: "",
  floor: "",
  totalFloors: "",
  buildingAge: "",
  constructionYear: "",
  heating: "",
  heatingInfrastructure: "",
  coolingInfrastructure: "",
  furnished: "",
  elevator: "yes",
  parking: "none",
  frontage: "mixed",
  buildingCondition: "",
  structureType: "",

  hasBuildingManagement: "no",
  hasSecurity: "no",
  hasCameraSystem: "no",
  hasGenerator: "no",
  hasWaterTank: "no",
  hasHydrophore: "no",
  earthquakeCompliance: "unknown",

  energyClass: "unknown",
  hasThermalInsulation: "no",
  hasSoundInsulation: "no",

  deedStatus: "",
  parcelBlockNo: "",
  parcelNo: "",
  lotNo: "",
  independentSectionNo: "",
  zoningStatus: "",
  hasOccupancyPermit: "no",
  constructionPermitYear: "",
  usageTypeOnDeed: "",

  hasClosetWC: "yes",
  hasAlaturkaWC: "no",
  hasEnSuiteBathroom: "no",
  isOpenKitchen: "no",
  hasBalcony: "no",
  balconyCount: "",

  frontWidth: "",
  ceilingHeight: "",
  hasStorage: "no",
  hasMezzanine: "no",
  hasKitchenArea: "no",
  hasSignboardRight: "no",
  suitableForFoodBusiness: "no",
  suitableForOfficeUse: "no",

  meetingRoomCount: "",
  hasReception: "no",
  hasKitchenette: "no",
  hasAirConditioning: "no",
  hasFiberInternet: "no",
  hasCardAccess: "no",

  landArea: "",
  gardenArea: "",
  hasGarden: "no",
  hasPool: "no",
  hasGarage: "no",
  hasTerrace: "no",
  hasFireplace: "no",
  isDetached: "yes",
  isInCompound: "no",
};

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------
function isResidential(type: PropertyType) {
  return type === "apartment" || type === "villa";
}

function isVilla(type: PropertyType) {
  return type === "villa";
}

function isOffice(type: PropertyType) {
  return type === "office";
}

function isShop(type: PropertyType) {
  return type === "shop";
}

function getLayoutOptions(type: PropertyType) {
  if (isOffice(type)) return OFFICE_LAYOUT_OPTIONS;
  if (isShop(type)) return SHOP_LAYOUT_OPTIONS;
  return RESIDENTIAL_LAYOUT_OPTIONS;
}

function getLayoutFieldLabel(type: PropertyType) {
  if (isOffice(type)) return "Ofis Plan Tipi";
  if (isShop(type)) return "Dükkan Plan Tipi";
  return "Yerleşim Tipi";
}

function getLayoutFieldTooltip(type: PropertyType) {
  if (isOffice(type)) return "Ofisin plan yapısı veya bölüm tipi.";
  if (isShop(type)) return "Dükkanın kullanım / bölümlenme tipi.";
  return "Konut için oda + salon veya genel yerleşim tipi.";
}

function getFloorFieldLabel(type: PropertyType) {
  if (isVilla(type)) return "Kullanım Katı / Kat Sayısı";
  if (isShop(type)) return "Bulunduğu Kat";
  return "Bulunduğu Kat";
}

function getFloorFieldTooltip(type: PropertyType) {
  if (isVilla(type)) return "Villa için kullanım katı veya kat sayısı bilgisi.";
  if (isShop(type)) return "Dükkanın yer aldığı kat bilgisi.";
  return "Bağımsız bölümün bulunduğu kat.";
}

function getTotalFloorsFieldLabel(type: PropertyType) {
  if (isVilla(type)) return "Toplam Yapı Katı";
  return "Binadaki Toplam Kat";
}

function getTotalFloorsFieldTooltip(type: PropertyType) {
  if (isVilla(type)) return "Villanın toplam yapı kat adedi.";
  return "Binanın toplam kat adedi.";
}

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

  const handleChange = useCallback(
    (key: keyof PropertyForm, value: string | PropertyAddressForm) => {
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
    },
    [],
  );

  const handleAddressChange = useCallback(
    (value: PropertyAddressForm) => {
      handleChange("address", value);
    },
    [handleChange],
  );

  const handleSelectPropertyType = useCallback((type: PropertyType) => {
    setForm((prev) => ({
      ...prev,
      type,
      layoutType: "",
      bathroomCount: "",
      toiletCount: "",
      furnished: isResidential(type) ? prev.furnished : "",
      hasEnSuiteBathroom: isResidential(type) ? prev.hasEnSuiteBathroom : "no",
      isOpenKitchen: isResidential(type) ? prev.isOpenKitchen : "no",
      hasBalcony: isResidential(type) || isOffice(type) ? prev.hasBalcony : "no",
      balconyCount: isResidential(type) || isOffice(type) ? prev.balconyCount : "",
      frontWidth: isShop(type) ? prev.frontWidth : "",
      ceilingHeight: isShop(type) ? prev.ceilingHeight : "",
      hasStorage: isShop(type) ? prev.hasStorage : "no",
      hasMezzanine: isShop(type) ? prev.hasMezzanine : "no",
      hasKitchenArea: isShop(type) ? prev.hasKitchenArea : "no",
      hasSignboardRight: isShop(type) ? prev.hasSignboardRight : "no",
      suitableForFoodBusiness: isShop(type) ? prev.suitableForFoodBusiness : "no",
      suitableForOfficeUse: isShop(type) ? prev.suitableForOfficeUse : "no",
      meetingRoomCount: isOffice(type) ? prev.meetingRoomCount : "",
      hasReception: isOffice(type) ? prev.hasReception : "no",
      hasKitchenette: isOffice(type) ? prev.hasKitchenette : "no",
      hasAirConditioning: isOffice(type) ? prev.hasAirConditioning : "no",
      hasFiberInternet: isOffice(type) ? prev.hasFiberInternet : "no",
      hasCardAccess: isOffice(type) ? prev.hasCardAccess : "no",
      landArea: isVilla(type) ? prev.landArea : "",
      gardenArea: isVilla(type) ? prev.gardenArea : "",
      hasGarden: isVilla(type) ? prev.hasGarden : "no",
      hasPool: isVilla(type) ? prev.hasPool : "no",
      hasGarage: isVilla(type) ? prev.hasGarage : "no",
      hasTerrace: isVilla(type) ? prev.hasTerrace : "no",
      hasFireplace: isVilla(type) ? prev.hasFireplace : "no",
      isDetached: isVilla(type) ? prev.isDetached : "no",
      isInCompound: isVilla(type) ? prev.isInCompound : "no",
    }));
    setTimeout(() => setActiveStep(1), 300);
  }, []);

  const validateStep = useCallback(
    (step: number): boolean => {
      const newErrors: FormErrors = {};

      if (step === 0) {
        if (!form.type) newErrors.type = "Gayrimenkul türü seçilmelidir.";
      }

      if (step === 1) {
        if (!form.name.trim()) newErrors.name = "Gayrimenkul adı zorunludur.";
        if (!form.propertyCode.trim()) newErrors.propertyCode = "PropertyCode zorunludur.";
        if (!form.unitNumber.trim()) newErrors.unitNumber = "Bağımsız bölüm / numara zorunludur.";

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
        if (!form.address.postalCode.trim()) {
          newErrors["address.postalCode"] = "Posta kodu zorunludur.";
        }
      }

      if (step === 2) {
        if (!form.grossArea.trim()) newErrors.grossArea = "Brüt alan zorunludur.";
        if (!form.netArea.trim()) newErrors.netArea = "Net alan zorunludur.";
        if (!form.layoutType.trim()) {
          newErrors.layoutType = `${getLayoutFieldLabel(form.type)} zorunludur.`;
        }

        if (isResidential(form.type) || isOffice(form.type)) {
          if (!form.bathroomCount.trim()) newErrors.bathroomCount = "Banyo sayısı zorunludur.";
        }

        if (!form.toiletCount.trim()) newErrors.toiletCount = "Tuvalet sayısı zorunludur.";
        if (!form.floor.trim()) newErrors.floor = `${getFloorFieldLabel(form.type)} zorunludur.`;
        if (!form.totalFloors.trim()) {
          newErrors.totalFloors = `${getTotalFloorsFieldLabel(form.type)} zorunludur.`;
        }

        if (!form.constructionYear.trim()) {
          newErrors.constructionYear = "Yapım yılı zorunludur.";
        }
        if (!form.buildingCondition.trim()) {
          newErrors.buildingCondition = "Bina durumu zorunludur.";
        }
        if (!form.structureType.trim()) {
          newErrors.structureType = "Yapı tipi zorunludur.";
        }

        if ((isResidential(form.type) || isOffice(form.type)) && form.hasBalcony === "yes" && !form.balconyCount.trim()) {
          newErrors.balconyCount = "Balkon sayısı zorunludur.";
        }
      }

      if (step === 3) {
        if (!form.heating.trim()) newErrors.heating = "Isıtma bilgisi zorunludur.";
        if (!form.deedStatus.trim()) newErrors.deedStatus = "Tapu durumu zorunludur.";
        if (!form.parcelBlockNo.trim()) newErrors.parcelBlockNo = "Ada bilgisi zorunludur.";
        if (!form.parcelNo.trim()) newErrors.parcelNo = "Parsel bilgisi zorunludur.";
        if (!form.independentSectionNo.trim()) {
          newErrors.independentSectionNo = "Bağımsız bölüm no zorunludur.";
        }
        if (!form.usageTypeOnDeed.trim()) {
          newErrors.usageTypeOnDeed = "Tapudaki niteliği zorunludur.";
        }
        if (!form.energyClass.trim()) {
          newErrors.energyClass = "Enerji sınıfı zorunludur.";
        }

        if (isResidential(form.type) && !form.furnished.trim()) {
          newErrors.furnished = "Eşya durumu zorunludur.";
        }
      }

      if (step === 4) {
        if (isShop(form.type)) {
          if (!form.frontWidth.trim()) newErrors.frontWidth = "Cephe genişliği zorunludur.";
          if (!form.ceilingHeight.trim()) newErrors.ceilingHeight = "Tavan yüksekliği zorunludur.";
        }

        if (isOffice(form.type)) {
          if (!form.meetingRoomCount.trim()) {
            newErrors.meetingRoomCount = "Toplantı odası sayısı zorunludur.";
          }
        }

        if (isVilla(form.type)) {
          if (!form.landArea.trim()) newErrors.landArea = "Arsa m² zorunludur.";
          if (form.hasGarden === "yes" && !form.gardenArea.trim()) {
            newErrors.gardenArea = "Bahçe m² zorunludur.";
          }
        }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [form],
  );

  const handleSubmit = useCallback(() => {
    setIsSubmitting(true);

    setTimeout(() => {
      console.log("PROPERTY MASTER CREATE:", form);
      setToast({ open: true, message: "Gayrimenkul master kaydı başarıyla oluşturuldu!" });

      setTimeout(() => {
        router.push(returnUrl || "/property-management");
      }, 1200);
    }, 1000);
  }, [form, returnUrl, router]);

  const handleNext = useCallback(() => {
    if (!validateStep(activeStep)) return;

    if (activeStep === 4) {
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

  const completionPercentage = ((activeStep + 1) / 5) * 100;
  const steps = [
    "Gayrimenkul Türü",
    "Kimlik & Adres",
    "Teknik & Bina",
    "Hukuki & Enerji",
    "Tür Bazlı Detay",
  ];

  const summaryAddress = [
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
                    label="Master Kayıt"
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
                    Yeni Gayrimenkul Master Kaydı
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                    Bu ekran ilan oluşturma sayfası değildir. Burada yalnızca kalıcı, doğrulanabilir,
                    tekrar kullanılabilir mülk verisi tutulur. Fiyat, aidat, depozito, ilan açıklaması,
                    yayın durumu ve boşalma tarihi gibi alanlar burada yer almaz.
                  </Typography>
                </Box>

                <Alert severity="info" sx={{ borderRadius: 3 }}>
                  Sonraki aşamada ilan oluşturulurken yalnızca bu kayıt seçilir; fiyat, yayın ve ilan
                  medyası ayrıca yönetilir.
                </Alert>

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
                  summaryAddress={summaryAddress}
                />
              )}

              {activeStep === 2 && (
                <StepTwoContent form={form} onChange={handleChange} errors={errors} />
              )}

              {activeStep === 3 && (
                <StepThreeContent form={form} onChange={handleChange} errors={errors} />
              )}

              {activeStep === 4 && (
                <StepFourContent form={form} onChange={handleChange} errors={errors} />
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
                isSubmitting ? undefined : activeStep === 4 ? (
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
                : activeStep === 4
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
          Tür seçimi, bağımsız bölüm detaylarını ve tür bazlı alanları belirler.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            xl: "repeat(4, minmax(0, 1fr))",
          },
          gap: 2,
          alignItems: "stretch",
        }}
      >
        {PROPERTY_TYPES.map((type, index) => {
          const isSelected = selectedType === type.value;

          return (
            <Zoom in timeout={400 + index * 120} key={type.value}>
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
  summaryAddress,
}: {
  form: PropertyForm;
  onChange: (key: keyof PropertyForm, value: string | PropertyAddressForm) => void;
  onAddressChange: (value: PropertyAddressForm) => void;
  errors: FormErrors;
  summaryAddress: string;
}) {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6" fontWeight={800} letterSpacing="-0.02em">
          Kimlik & Adres Bilgileri
        </Typography>
        <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
          Burada mülkün kalıcı kimliği ve tekrar kullanılabilir adres bilgisi oluşturulur.
        </Typography>
      </Box>

      <Stack spacing={2.5}>
        <GridBox columns={{ xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }}>
          <TextFieldWithTooltip
            label="Gayrimenkul Adı"
            value={form.name}
            onChange={(v) => onChange("name", v)}
            error={!!errors.name}
            helperText={errors.name}
            placeholder="Örn: Live Residence A Blok Daire 12"
            tooltip="Yönetim panelinde görünen kayıt adı."
            icon={<IconBookmark size={18} stroke={2} />}
            required
          />

          <TextFieldWithTooltip
            label="PropertyCode"
            value={form.propertyCode}
            onChange={(v) => onChange("propertyCode", v)}
            error={!!errors.propertyCode}
            helperText={errors.propertyCode}
            placeholder="Örn: LM-PRP-2026-000123"
            tooltip="Sistem içi benzersiz mülk kodu."
            icon={<IconShieldCheck size={18} stroke={2} />}
            required
          />
        </GridBox>

        <GridBox columns={{ xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" }}>
          <TextFieldWithTooltip
            label="InternalCode"
            value={form.internalCode}
            onChange={(v) => onChange("internalCode", v)}
            placeholder="Örn: INT-00045"
            tooltip="İç operasyon veya entegrasyon kodu."
            icon={<IconBookmark size={18} stroke={2} />}
          />

          <TextFieldWithTooltip
            label="ExternalReferenceNo"
            value={form.externalReferenceNo}
            onChange={(v) => onChange("externalReferenceNo", v)}
            placeholder="Örn: SAP-REF-9091"
            tooltip="Dış sistem referans numarası."
            icon={<IconBookmark size={18} stroke={2} />}
          />

          <TextFieldWithTooltip
            label="Bağımsız Bölüm / Numara"
            value={form.unitNumber}
            onChange={(v) => onChange("unitNumber", v)}
            error={!!errors.unitNumber}
            helperText={errors.unitNumber}
            placeholder="Örn: 12"
            tooltip="Bağımsız bölüm numarası."
            icon={<IconDoor size={18} stroke={2} />}
            required
          />
        </GridBox>

        <GridBox columns={{ xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" }}>
          <TextFieldWithTooltip
            label="Site Adı"
            value={form.siteName}
            onChange={(v) => onChange("siteName", v)}
            placeholder="Örn: Live Residence"
            tooltip="Site veya proje adı."
            icon={<IconBuildingEstate size={18} stroke={2} />}
          />

          <TextFieldWithTooltip
            label="Bina Adı"
            value={form.buildingName}
            onChange={(v) => onChange("buildingName", v)}
            placeholder="Örn: Lotus Tower"
            tooltip="Bina adı."
            icon={<IconBuilding size={18} stroke={2} />}
          />

          <TextFieldWithTooltip
            label="Blok Adı"
            value={form.blockName}
            onChange={(v) => onChange("blockName", v)}
            placeholder="Örn: A Blok"
            tooltip="Proje veya site içindeki blok bilgisi."
            icon={<IconBuildingEstate size={18} stroke={2} />}
          />
        </GridBox>

        <AddressHierarchyCard
          value={form.address}
          onChange={onAddressChange}
          errors={errors}
          summaryAddress={summaryAddress}
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
  const residential = isResidential(form.type);
  const office = isOffice(form.type);
  const villa = isVilla(form.type);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6" fontWeight={800} letterSpacing="-0.02em">
          Teknik & Bina Bilgileri
        </Typography>
        <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
          Ortak teknik veriler ve bina/site bilgileri burada tutulur.
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
                Alan ve Yerleşim
              </Typography>
            </Stack>

            <GridBox columns={{ xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" }}>
              <TextFieldWithTooltip
                label="Brüt m²"
                value={form.grossArea}
                onChange={(v) => onChange("grossArea", v)}
                error={!!errors.grossArea}
                helperText={errors.grossArea}
                placeholder="165"
                tooltip="Toplam brüt alan."
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
                tooltip="Kullanılabilir net alan."
                required
                endAdornment="m²"
              />

              <PremiumSelect
                label={getLayoutFieldLabel(form.type)}
                value={form.layoutType}
                onChange={(v) => onChange("layoutType", v)}
                options={getLayoutOptions(form.type)}
                tooltip={getLayoutFieldTooltip(form.type)}
                icon={<IconBed size={18} stroke={2} />}
                error={!!errors.layoutType}
                helperText={errors.layoutType}
                required
              />
            </GridBox>
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
                Kat, Islak Hacim ve İç Özellikler
              </Typography>
            </Stack>

            <GridBox
              columns={{
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
              }}
            >
              {(residential || office) && (
                <PremiumSelect
                  label="Banyo Sayısı"
                  value={form.bathroomCount}
                  onChange={(v) => onChange("bathroomCount", v)}
                  options={COUNT_OPTIONS}
                  tooltip="Toplam banyo adedi."
                  icon={<IconBath size={18} stroke={2} />}
                  error={!!errors.bathroomCount}
                  helperText={errors.bathroomCount}
                  required
                />
              )}

              <PremiumSelect
                label="Tuvalet Sayısı"
                value={form.toiletCount}
                onChange={(v) => onChange("toiletCount", v)}
                options={COUNT_OPTIONS}
                tooltip="Toplam tuvalet adedi."
                icon={<IconBath size={18} stroke={2} />}
                error={!!errors.toiletCount}
                helperText={errors.toiletCount}
                required
              />

              <TextFieldWithTooltip
                label={getFloorFieldLabel(form.type)}
                value={form.floor}
                onChange={(v) => onChange("floor", v)}
                error={!!errors.floor}
                helperText={errors.floor}
                placeholder={villa ? "2" : "6"}
                tooltip={getFloorFieldTooltip(form.type)}
                icon={<IconStairs size={18} stroke={2} />}
                required
              />

              <TextFieldWithTooltip
                label={getTotalFloorsFieldLabel(form.type)}
                value={form.totalFloors}
                onChange={(v) => onChange("totalFloors", v)}
                error={!!errors.totalFloors}
                helperText={errors.totalFloors}
                placeholder={villa ? "2" : "12"}
                tooltip={getTotalFloorsFieldTooltip(form.type)}
                icon={<IconBuilding size={18} stroke={2} />}
                required
              />

              <TextFieldWithTooltip
                label="Yapım Yılı"
                value={form.constructionYear}
                onChange={(v) => onChange("constructionYear", v)}
                error={!!errors.constructionYear}
                helperText={errors.constructionYear}
                placeholder="2020"
                tooltip="Binanın inşa edildiği yıl."
                icon={<IconCalendar size={18} stroke={2} />}
                required
              />

              <TextFieldWithTooltip
                label="Bina Yaşı"
                value={form.buildingAge}
                onChange={(v) => onChange("buildingAge", v)}
                placeholder="6"
                tooltip="İstenirse yapım yılından türetilebilir; operasyonel kullanım için tutulur."
                icon={<IconCalendar size={18} stroke={2} />}
              />
            </GridBox>

            <GridBox
              columns={{
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
              }}
            >
              <PremiumSelect
                label="Klozet WC"
                value={form.hasClosetWC}
                onChange={(v) => onChange("hasClosetWC", v)}
                options={YES_NO_OPTIONS}
                tooltip="Alafranga klozet bulunup bulunmadığı."
                required
              />

              <PremiumSelect
                label="Alaturka WC"
                value={form.hasAlaturkaWC}
                onChange={(v) => onChange("hasAlaturkaWC", v)}
                options={YES_NO_OPTIONS}
                tooltip="Alaturka tuvalet bulunup bulunmadığı."
                required
              />

              {residential && (
                <PremiumSelect
                  label="Ebeveyn Banyosu"
                  value={form.hasEnSuiteBathroom}
                  onChange={(v) => onChange("hasEnSuiteBathroom", v)}
                  options={YES_NO_OPTIONS}
                  tooltip="Yatak odasına bağlı özel banyo bilgisi."
                  required
                />
              )}

              {residential && (
                <PremiumSelect
                  label="Açık Mutfak"
                  value={form.isOpenKitchen}
                  onChange={(v) => onChange("isOpenKitchen", v)}
                  options={YES_NO_OPTIONS}
                  tooltip="Açık mutfak planı olup olmadığı."
                  required
                />
              )}

              {(residential || office) && (
                <PremiumSelect
                  label="Balkon"
                  value={form.hasBalcony}
                  onChange={(v) => {
                    onChange("hasBalcony", v);
                    if (v === "no") onChange("balconyCount", "");
                  }}
                  options={YES_NO_OPTIONS}
                  tooltip="Bağımsız bölümde balkon bulunup bulunmadığı."
                  required
                />
              )}

              {(residential || office) && (
                <PremiumSelect
                  label="Balkon Sayısı"
                  value={form.balconyCount}
                  onChange={(v) => onChange("balconyCount", v)}
                  options={COUNT_OPTIONS}
                  tooltip="Toplam balkon adedi."
                  error={!!errors.balconyCount}
                  helperText={errors.balconyCount}
                  disabled={form.hasBalcony !== "yes"}
                  required={form.hasBalcony === "yes"}
                />
              )}
            </GridBox>
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
              <IconBuilding size={18} stroke={2} style={{ color: theme.palette.primary.main }} />
              <Typography fontWeight={700} fontSize="0.9rem">
                Bina / Site Bilgileri
              </Typography>
            </Stack>

            <GridBox
              columns={{
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
              }}
            >
              <PremiumSelect
                label="Bina Durumu"
                value={form.buildingCondition}
                onChange={(v) => onChange("buildingCondition", v)}
                options={BUILDING_CONDITION_OPTIONS}
                tooltip="Bina genel durum sınıfı."
                error={!!errors.buildingCondition}
                helperText={errors.buildingCondition}
                required
              />

              <PremiumSelect
                label="Yapı Tipi"
                value={form.structureType}
                onChange={(v) => onChange("structureType", v)}
                options={STRUCTURE_TYPE_OPTIONS}
                tooltip="Yapı sistemi."
                error={!!errors.structureType}
                helperText={errors.structureType}
                required
              />

              <PremiumSelect
                label="Deprem Uygunluğu"
                value={form.earthquakeCompliance}
                onChange={(v) => onChange("earthquakeCompliance", v)}
                options={EARTHQUAKE_COMPLIANCE_OPTIONS}
                tooltip="Deprem yönetmeliği / uygunluk değerlendirmesi."
                required
              />

              <PremiumSelect
                label="Asansör"
                value={form.elevator}
                onChange={(v) => onChange("elevator", v)}
                options={YES_NO_OPTIONS}
                tooltip="Binada asansör bulunup bulunmadığı."
                required
              />

              <PremiumSelect
                label="Otopark"
                value={form.parking}
                onChange={(v) => onChange("parking", v)}
                options={PARKING_OPTIONS}
                tooltip="Otopark tipi."
                required
              />

              <PremiumSelect
                label="Cephe"
                value={form.frontage}
                onChange={(v) => onChange("frontage", v)}
                options={FRONTAGE_OPTIONS}
                tooltip="Bağımsız bölümün ana cephe bilgisi."
                required
              />
            </GridBox>

            <GridBox
              columns={{
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
              }}
            >
              <PremiumSelect
                label="Bina Yönetimi"
                value={form.hasBuildingManagement}
                onChange={(v) => onChange("hasBuildingManagement", v)}
                options={YES_NO_OPTIONS}
                tooltip="Apartman / site yönetimi var mı?"
                icon={<IconBuilding size={18} stroke={2} />}
                required
              />

              <PremiumSelect
                label="Güvenlik"
                value={form.hasSecurity}
                onChange={(v) => onChange("hasSecurity", v)}
                options={YES_NO_OPTIONS}
                tooltip="Güvenlik hizmeti var mı?"
                icon={<IconShieldCheck size={18} stroke={2} />}
                required
              />

              <PremiumSelect
                label="Kamera Sistemi"
                value={form.hasCameraSystem}
                onChange={(v) => onChange("hasCameraSystem", v)}
                options={YES_NO_OPTIONS}
                tooltip="Kamera sistemi var mı?"
                icon={<IconDeviceCctv size={18} stroke={2} />}
                required
              />

              <PremiumSelect
                label="Jeneratör"
                value={form.hasGenerator}
                onChange={(v) => onChange("hasGenerator", v)}
                options={YES_NO_OPTIONS}
                tooltip="Ortak jeneratör bulunup bulunmadığı."
                required
              />

              <PremiumSelect
                label="Su Deposu"
                value={form.hasWaterTank}
                onChange={(v) => onChange("hasWaterTank", v)}
                options={YES_NO_OPTIONS}
                tooltip="Su deposu bulunup bulunmadığı."
                required
              />

              <PremiumSelect
                label="Hidrofor"
                value={form.hasHydrophore}
                onChange={(v) => onChange("hasHydrophore", v)}
                options={YES_NO_OPTIONS}
                tooltip="Hidrofor sistemi bulunup bulunmadığı."
                required
              />
            </GridBox>
          </Stack>
        </Box>
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------
// Step 3
// ----------------------------------------------------------------
function StepThreeContent({
  form,
  onChange,
  errors,
}: {
  form: PropertyForm;
  onChange: (key: keyof PropertyForm, value: string | PropertyAddressForm) => void;
  errors: FormErrors;
}) {
  const theme = useTheme<Theme>();
  const residential = isResidential(form.type);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6" fontWeight={800} letterSpacing="-0.02em">
          Hukuki & Enerji Bilgileri
        </Typography>
        <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
          Tapu, imar ve enerji kalitesi gibi kalıcı kayıt alanlarını tamamlayın.
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
              <IconFlame size={18} stroke={2} style={{ color: theme.palette.primary.main }} />
              <Typography fontWeight={700} fontSize="0.9rem">
                Isıtma / Soğutma / Enerji
              </Typography>
            </Stack>

            <GridBox
              columns={{
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
              }}
            >
              <PremiumSelect
                label="Isıtma"
                value={form.heating}
                onChange={(v) => onChange("heating", v)}
                options={HEATING_OPTIONS}
                tooltip="Sabit ısıtma sistemi."
                icon={<IconFlame size={18} stroke={2} />}
                error={!!errors.heating}
                helperText={errors.heating}
                required
              />

              <PremiumSelect
                label="Isıtma Altyapısı"
                value={form.heatingInfrastructure}
                onChange={(v) => onChange("heatingInfrastructure", v)}
                options={HEATING_INFRASTRUCTURE_OPTIONS}
                tooltip="Yapıdaki ısıtma altyapısı."
                required
              />

              <PremiumSelect
                label="Soğutma Altyapısı"
                value={form.coolingInfrastructure}
                onChange={(v) => onChange("coolingInfrastructure", v)}
                options={COOLING_INFRASTRUCTURE_OPTIONS}
                tooltip="Yapıdaki soğutma altyapısı."
                required
              />

              {residential && (
                <PremiumSelect
                  label="Eşya Durumu"
                  value={form.furnished}
                  onChange={(v) => onChange("furnished", v)}
                  options={FURNISHED_OPTIONS}
                  tooltip="Bağımsız bölümün eşya durumu."
                  icon={<IconSofa size={18} stroke={2} />}
                  error={!!errors.furnished}
                  helperText={errors.furnished}
                  required
                />
              )}

              <PremiumSelect
                label="Enerji Sınıfı"
                value={form.energyClass}
                onChange={(v) => onChange("energyClass", v)}
                options={ENERGY_CLASS_OPTIONS}
                tooltip="Enerji kimlik sınıfı."
                error={!!errors.energyClass}
                helperText={errors.energyClass}
                required
              />

              <PremiumSelect
                label="Isı Yalıtımı"
                value={form.hasThermalInsulation}
                onChange={(v) => onChange("hasThermalInsulation", v)}
                options={YES_NO_OPTIONS}
                tooltip="Isı yalıtımı var mı?"
                required
              />

              <PremiumSelect
                label="Ses Yalıtımı"
                value={form.hasSoundInsulation}
                onChange={(v) => onChange("hasSoundInsulation", v)}
                options={YES_NO_OPTIONS}
                tooltip="Ses yalıtımı var mı?"
                required
              />
            </GridBox>
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
              <IconShieldCheck size={18} stroke={2} style={{ color: theme.palette.primary.main }} />
              <Typography fontWeight={700} fontSize="0.9rem">
                Hukuki Bilgiler
              </Typography>
            </Stack>

            <GridBox
              columns={{
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
              }}
            >
              <PremiumSelect
                label="Tapu Durumu"
                value={form.deedStatus}
                onChange={(v) => onChange("deedStatus", v)}
                options={DEED_STATUS_OPTIONS}
                tooltip="Tapu statüsü."
                icon={<IconShieldCheck size={18} stroke={2} />}
                error={!!errors.deedStatus}
                helperText={errors.deedStatus}
                required
              />

              <TextFieldWithTooltip
                label="Ada"
                value={form.parcelBlockNo}
                onChange={(v) => onChange("parcelBlockNo", v)}
                error={!!errors.parcelBlockNo}
                helperText={errors.parcelBlockNo}
                placeholder="123"
                tooltip="Tapudaki ada bilgisi."
                required
              />

              <TextFieldWithTooltip
                label="Parsel"
                value={form.parcelNo}
                onChange={(v) => onChange("parcelNo", v)}
                error={!!errors.parcelNo}
                helperText={errors.parcelNo}
                placeholder="45"
                tooltip="Tapudaki parsel bilgisi."
                required
              />

              <TextFieldWithTooltip
                label="Lot No"
                value={form.lotNo}
                onChange={(v) => onChange("lotNo", v)}
                placeholder="Opsiyonel"
                tooltip="Varsa lot bilgisi."
              />

              <TextFieldWithTooltip
                label="Bağımsız Bölüm No"
                value={form.independentSectionNo}
                onChange={(v) => onChange("independentSectionNo", v)}
                error={!!errors.independentSectionNo}
                helperText={errors.independentSectionNo}
                placeholder="12"
                tooltip="Tapudaki bağımsız bölüm numarası."
                required
              />

              <PremiumSelect
                label="İmar Durumu"
                value={form.zoningStatus}
                onChange={(v) => onChange("zoningStatus", v)}
                options={ZONING_STATUS_OPTIONS}
                tooltip="İmar / kullanım durumu."
                required
              />

              <PremiumSelect
                label="Yapı Kullanma İzin Belgesi"
                value={form.hasOccupancyPermit}
                onChange={(v) => onChange("hasOccupancyPermit", v)}
                options={YES_NO_OPTIONS}
                tooltip="İskan / yapı kullanma izin belgesi."
                required
              />

              <TextFieldWithTooltip
                label="Ruhsat Yılı"
                value={form.constructionPermitYear}
                onChange={(v) => onChange("constructionPermitYear", v)}
                placeholder="2019"
                tooltip="Yapı ruhsat yılı."
                icon={<IconCalendar size={18} stroke={2} />}
              />

              <PremiumSelect
                label="Tapudaki Niteliği"
                value={form.usageTypeOnDeed}
                onChange={(v) => onChange("usageTypeOnDeed", v)}
                options={USAGE_TYPE_ON_DEED_OPTIONS}
                tooltip="Tapudaki kullanım / nitelik bilgisi."
                error={!!errors.usageTypeOnDeed}
                helperText={errors.usageTypeOnDeed}
                required
              />
            </GridBox>
          </Stack>
        </Box>

        <Alert severity="info" sx={{ borderRadius: 3 }}>
          Bu kayıtta fiyat, depozito, aidat, yayın durumu, ilan açıklaması ve boşalma tarihi yoktur.
          Bunlar ilan ekranında ayrıca tutulmalıdır.
        </Alert>
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------
// Step 4
// ----------------------------------------------------------------
function StepFourContent({
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
          Tür Bazlı Detaylar
        </Typography>
        <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
          Sadece seçilen mülk tipine ait detay alanları gösterilir.
        </Typography>
      </Box>

      <Stack spacing={2.5}>
        {isVilla(form.type) && (
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
                <IconBuildingEstate size={18} stroke={2} style={{ color: theme.palette.primary.main }} />
                <Typography fontWeight={700} fontSize="0.9rem">
                  Villa Detayları
                </Typography>
              </Stack>

              <GridBox
                columns={{
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  lg: "repeat(3, minmax(0, 1fr))",
                }}
              >
                <TextFieldWithTooltip
                  label="Arsa m²"
                  value={form.landArea}
                  onChange={(v) => onChange("landArea", v)}
                  error={!!errors.landArea}
                  helperText={errors.landArea}
                  placeholder="350"
                  tooltip="Villaya ait arsa alanı."
                  endAdornment="m²"
                  required
                />

                <PremiumSelect
                  label="Bahçe"
                  value={form.hasGarden}
                  onChange={(v) => {
                    onChange("hasGarden", v);
                    if (v === "no") onChange("gardenArea", "");
                  }}
                  options={YES_NO_OPTIONS}
                  tooltip="Bahçe var mı?"
                  required
                />

                <TextFieldWithTooltip
                  label="Bahçe m²"
                  value={form.gardenArea}
                  onChange={(v) => onChange("gardenArea", v)}
                  error={!!errors.gardenArea}
                  helperText={errors.gardenArea}
                  placeholder="120"
                  tooltip="Bahçe alanı."
                  endAdornment="m²"
                />

                <PremiumSelect
                  label="Havuz"
                  value={form.hasPool}
                  onChange={(v) => onChange("hasPool", v)}
                  options={YES_NO_OPTIONS}
                  tooltip="Havuz var mı?"
                  required
                />

                <PremiumSelect
                  label="Garaj"
                  value={form.hasGarage}
                  onChange={(v) => onChange("hasGarage", v)}
                  options={YES_NO_OPTIONS}
                  tooltip="Garaj var mı?"
                  required
                />

                <PremiumSelect
                  label="Teras"
                  value={form.hasTerrace}
                  onChange={(v) => onChange("hasTerrace", v)}
                  options={YES_NO_OPTIONS}
                  tooltip="Teras var mı?"
                  required
                />

                <PremiumSelect
                  label="Şömine"
                  value={form.hasFireplace}
                  onChange={(v) => onChange("hasFireplace", v)}
                  options={YES_NO_OPTIONS}
                  tooltip="Şömine var mı?"
                  required
                />

                <PremiumSelect
                  label="Müstakil"
                  value={form.isDetached}
                  onChange={(v) => onChange("isDetached", v)}
                  options={YES_NO_OPTIONS}
                  tooltip="Tam müstakil yapı mı?"
                  required
                />

                <PremiumSelect
                  label="Site İçinde"
                  value={form.isInCompound}
                  onChange={(v) => onChange("isInCompound", v)}
                  options={YES_NO_OPTIONS}
                  tooltip="Site / compound içinde mi?"
                  required
                />
              </GridBox>
            </Stack>
          </Box>
        )}

        {isShop(form.type) && (
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
                <IconBuildingStore size={18} stroke={2} style={{ color: theme.palette.primary.main }} />
                <Typography fontWeight={700} fontSize="0.9rem">
                  Dükkan Detayları
                </Typography>
              </Stack>

              <GridBox
                columns={{
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  lg: "repeat(3, minmax(0, 1fr))",
                }}
              >
                <TextFieldWithTooltip
                  label="Cephe Genişliği"
                  value={form.frontWidth}
                  onChange={(v) => onChange("frontWidth", v)}
                  error={!!errors.frontWidth}
                  helperText={errors.frontWidth}
                  placeholder="6.5"
                  tooltip="Vitrin / cephe genişliği."
                  endAdornment="m"
                  required
                />

                <TextFieldWithTooltip
                  label="Tavan Yüksekliği"
                  value={form.ceilingHeight}
                  onChange={(v) => onChange("ceilingHeight", v)}
                  error={!!errors.ceilingHeight}
                  helperText={errors.ceilingHeight}
                  placeholder="4.2"
                  tooltip="Net tavan yüksekliği."
                  endAdornment="m"
                  required
                />

                <PremiumSelect
                  label="Depo"
                  value={form.hasStorage}
                  onChange={(v) => onChange("hasStorage", v)}
                  options={YES_NO_OPTIONS}
                  tooltip="Depo alanı var mı?"
                  required
                />

                <PremiumSelect
                  label="Asma Kat"
                  value={form.hasMezzanine}
                  onChange={(v) => onChange("hasMezzanine", v)}
                  options={YES_NO_OPTIONS}
                  tooltip="Asma kat var mı?"
                  required
                />

                <PremiumSelect
                  label="Mutfak Alanı"
                  value={form.hasKitchenArea}
                  onChange={(v) => onChange("hasKitchenArea", v)}
                  options={YES_NO_OPTIONS}
                  tooltip="Hazırlık / mutfak alanı var mı?"
                  required
                />

                <PremiumSelect
                  label="Tabela Hakkı"
                  value={form.hasSignboardRight}
                  onChange={(v) => onChange("hasSignboardRight", v)}
                  options={YES_NO_OPTIONS}
                  tooltip="Tabela kullanım hakkı var mı?"
                  required
                />

                <PremiumSelect
                  label="Gıda İşletmesine Uygun"
                  value={form.suitableForFoodBusiness}
                  onChange={(v) => onChange("suitableForFoodBusiness", v)}
                  options={YES_NO_OPTIONS}
                  tooltip="Gıda işletmesi için uygun mu?"
                  required
                />

                <PremiumSelect
                  label="Ofis Kullanımına Uygun"
                  value={form.suitableForOfficeUse}
                  onChange={(v) => onChange("suitableForOfficeUse", v)}
                  options={YES_NO_OPTIONS}
                  tooltip="Ofis amaçlı kullanıma uygun mu?"
                  required
                />
              </GridBox>
            </Stack>
          </Box>
        )}

        {isOffice(form.type) && (
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
                <IconBuilding size={18} stroke={2} style={{ color: theme.palette.primary.main }} />
                <Typography fontWeight={700} fontSize="0.9rem">
                  Ofis Detayları
                </Typography>
              </Stack>

              <GridBox
                columns={{
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  lg: "repeat(3, minmax(0, 1fr))",
                }}
              >
                <PremiumSelect
                  label="Toplantı Odası Sayısı"
                  value={form.meetingRoomCount}
                  onChange={(v) => onChange("meetingRoomCount", v)}
                  options={COUNT_OPTIONS}
                  tooltip="Toplantı odası adedi."
                  error={!!errors.meetingRoomCount}
                  helperText={errors.meetingRoomCount}
                  required
                />

                <PremiumSelect
                  label="Resepsiyon"
                  value={form.hasReception}
                  onChange={(v) => onChange("hasReception", v)}
                  options={YES_NO_OPTIONS}
                  tooltip="Resepsiyon alanı var mı?"
                  required
                />

                <PremiumSelect
                  label="Mutfak / Kitchenette"
                  value={form.hasKitchenette}
                  onChange={(v) => onChange("hasKitchenette", v)}
                  options={YES_NO_OPTIONS}
                  tooltip="Kitchenette alanı var mı?"
                  required
                />

                <PremiumSelect
                  label="Klima"
                  value={form.hasAirConditioning}
                  onChange={(v) => onChange("hasAirConditioning", v)}
                  options={YES_NO_OPTIONS}
                  tooltip="Sabit klima sistemi var mı?"
                  required
                />

                <PremiumSelect
                  label="Fiber İnternet"
                  value={form.hasFiberInternet}
                  onChange={(v) => onChange("hasFiberInternet", v)}
                  options={YES_NO_OPTIONS}
                  tooltip="Fiber internet altyapısı var mı?"
                  required
                />

                <PremiumSelect
                  label="Kartlı Giriş"
                  value={form.hasCardAccess}
                  onChange={(v) => onChange("hasCardAccess", v)}
                  options={YES_NO_OPTIONS}
                  tooltip="Kartlı geçiş sistemi var mı?"
                  required
                />
              </GridBox>
            </Stack>
          </Box>
        )}

        {isResidential(form.type) && !isVilla(form.type) && (
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            Daire tipi için ek tür bazlı tablo şu an minimal tutuldu. İhtiyaç olursa
            `PropertyResidentialDetails` alanları ayrıca genişletilebilir.
          </Alert>
        )}
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
  summaryAddress,
}: {
  value: PropertyAddressForm;
  onChange: (next: PropertyAddressForm) => void;
  errors: FormErrors;
  summaryAddress: string;
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
      countries.find((item: { code: string; name: string }) => item.code === nextCountryCode) ?? null;

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
      latitude: "",
      longitude: "",
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

  const helperOrBlank = (helperValue?: string) => helperValue ?? " ";

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
              Gayrimenkulün kalıcı adresini ve varsayılan görünürlüğünü tanımlayın.
            </Typography>
          </Box>
        </Stack>

        {(errorMessage || countriesErrorMessage) && (
          <Alert severity="error">{errorMessage || countriesErrorMessage}</Alert>
        )}

        <GridBox
          columns={{
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(3, minmax(0, 1fr))",
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
            helperText={helperOrBlank(
              getError("provinceId") ?? (isProvincesLoading ? "Yükleniyor..." : undefined),
            )}
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
            helperText={helperOrBlank(
              getError("districtId") ?? (isDistrictsLoading ? "Yükleniyor..." : undefined),
            )}
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
            label="Daire / Bölüm No"
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

          <TextField
            size="small"
            sx={compactFieldSx}
            label="Latitude"
            value={value.latitude}
            onChange={(e) => handlePatch({ latitude: e.target.value })}
            fullWidth
            helperText={helperOrBlank(undefined)}
          />

          <TextField
            size="small"
            sx={compactFieldSx}
            label="Longitude"
            value={value.longitude}
            onChange={(e) => handlePatch({ longitude: e.target.value })}
            fullWidth
            helperText={helperOrBlank(undefined)}
          />

          <TextField
            select
            size="small"
            sx={compactFieldSx}
            label="Varsayılan Adres Görünürlüğü"
            value={value.addressVisibilityDefault}
            onChange={(e) =>
              handlePatch({
                addressVisibilityDefault: e.target.value as AddressVisibilityDefault,
              })
            }
            fullWidth
            helperText={helperOrBlank(
              "İlan tarafında ayrıca override edilebilir.",
            )}
          >
            {ADDRESS_VISIBILITY_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </GridBox>

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
            {summaryAddress || "Henüz adres seçilmedi"}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

// ----------------------------------------------------------------
// Reusable Layout
// ----------------------------------------------------------------
function GridBox({
  children,
  columns,
}: {
  children: React.ReactNode;
  columns: Record<string, string>;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: columns,
        gap: 2,
        alignItems: "start",
      }}
    >
      {children}
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
  error,
  helperText,
  disabled,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  tooltip?: string;
  icon?: React.ReactNode;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
}) {
  const theme = useTheme<Theme>();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Box>
      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.75 }}>
        <Typography
          variant="body2"
          fontWeight={700}
          color={
            disabled
              ? "text.disabled"
              : error
                ? "error.main"
                : isFocused
                  ? "primary.main"
                  : "text.primary"
          }
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

      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        displayEmpty
        fullWidth
        error={error}
        disabled={disabled}
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
                boxShadow: disabled
                  ? "none"
                  : `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
              },
              "&.Mui-focused": {
                boxShadow: disabled
                  ? "none"
                  : `0 0 0 3px ${alpha(
                      error ? theme.palette.error.main : theme.palette.primary.main,
                      0.15,
                    )}`,
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

      <Typography
        variant="caption"
        color={error ? "error.main" : "transparent"}
        fontWeight={600}
        sx={{ mt: 0.5, display: "block", minHeight: 20 }}
      >
        {helperText || "."}
      </Typography>
    </Box>
  );
}