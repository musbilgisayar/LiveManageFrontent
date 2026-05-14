// src/modules/listing-management/views/MyListingsView.tsx
"use client";

import Link from "next/link";
import React, { useMemo, useState, useCallback } from "react";
 import {
  Alert,
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  Fade,
  FormControlLabel,
  Grow,
  IconButton,
  InputAdornment,
  MenuItem,
  Slider,
  Slide,
  Snackbar,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";


import type { Theme } from "@mui/material/styles";
import {
  IconAlertTriangle,
  IconBuildingEstate,
  IconCalendar,
  IconCircleCheck,
  IconClock,
  IconCopy,
  IconEdit,
  IconEye,
  IconFileDescription,
  IconFlame,
  IconGridDots,
  IconHomeStar,
  IconLayoutList,
  IconMapPin,
  IconPhoto,
  IconPlayerPause,
  IconPlus,
  IconQrcode,
  IconSearch,
  IconSparkles,
  IconStack2,
  IconTrendingUp,
  IconUsers,
  IconVideo,
} from "@tabler/icons-react";

type ListingStatus = "all" | "draft" | "published" | "passive";
type ListingType = "all" | "rent" | "sale";
type ViewMode = "grid" | "list";
type SortBy = "newest" | "oldest" | "mostViewed" | "bestPerforming" | "highestPrice" | "lowestPrice";
type DateRangeFilter = "all" | "7d" | "30d" | "90d";
type RoomFilter = "all" | "studio" | "1+1" | "2+1" | "3+1" | "4+1" | "5+";
type ActionFeedback = {
  open: boolean;
  message: string;
};

type ListingItem = {
  id: string;
  listingNo: string;
  title: string;
  type: Exclude<ListingType, "all">;
  status: Exclude<ListingStatus, "all">;
  priceLabel: string;
  priceValue: number;
  propertyName: string;
  unitInfo: string;
  city: string;
  district: string;
  neighborhood: string;
  grossArea: number;
  netArea: number;
  room: string;
  roomFilterValue: Exclude<RoomFilter, "all">;
  bathroomCount: number;
  buildingAge: number;
  floorInfo: string;
  heating: string;
  dues: string;
  elevator: "Var" | "Yok";
  parking: "Açık" | "Kapalı" | "Yok";
  deedStatus: string;
  usageStatus: string;
  updatedAtLabel: string;
  updatedDaysAgo: number;
  publishedAtLabel: string;
  publishedDaysAgo: number;
  viewCount: number;
  favoriteCount: number;
  leadCount: number;
  averageStaySeconds: number;
  clickThroughRate: number;
  conversionRate: number;
  rankingPosition: number;
  isFeatured: boolean;
  isPinned: boolean;
  photoCount: number;
  hasVideo: boolean;
  has3DTour: boolean;
  coverImage?: string;
};

const INITIAL_LISTINGS: ListingItem[] = [
  {
    id: "1",
    listingNo: "LM-2401",
    title: "Merkezi konumda bakımlı 1+1 daire",
    type: "rent",
    status: "published",
    priceLabel: "12.500 TL / ay",
    priceValue: 12500,
    propertyName: "Live Residence",
    unitInfo: "A Blok / No 12",
    city: "İstanbul",
    district: "Kadıköy",
    neighborhood: "Kozyatağı",
    grossArea: 165,
    netArea: 150,
    room: "1+1",
    roomFilterValue: "1+1",
    bathroomCount: 1,
    buildingAge: 6,
    floorInfo: "6. Kat / 12",
    heating: "VRV",
    dues: "1.250 TL",
    elevator: "Var",
    parking: "Kapalı",
    deedStatus: "Kat Mülkiyeti",
    usageStatus: "Kiracılı",
    updatedAtLabel: "Bugün",
    updatedDaysAgo: 0,
    publishedAtLabel: "2 gün önce",
    publishedDaysAgo: 2,
    viewCount: 245,
    favoriteCount: 12,
    leadCount: 7,
    averageStaySeconds: 86,
    clickThroughRate: 18.4,
    conversionRate: 4.9,
    rankingPosition: 3,
    isFeatured: true,
    isPinned: true,
    photoCount: 12,
    hasVideo: true,
    has3DTour: true,
    coverImage:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "2",
    listingNo: "LM-2402",
    title: "Cadde üstü geniş dükkan",
    type: "sale",
    status: "published",
    priceLabel: "4.850.000 TL",
    priceValue: 4850000,
    propertyName: "Merkez Plaza",
    unitInfo: "Zemin / No 3",
    city: "Ankara",
    district: "Çankaya",
    neighborhood: "Kızılay",
    grossArea: 85,
    netArea: 78,
    room: "Stüdyo",
    roomFilterValue: "studio",
    bathroomCount: 1,
    buildingAge: 12,
    floorInfo: "Zemin",
    heating: "Merkezi",
    dues: "900 TL",
    elevator: "Yok",
    parking: "Yok",
    deedStatus: "Kat Mülkiyeti",
    usageStatus: "Boş",
    updatedAtLabel: "Dün",
    updatedDaysAgo: 1,
    publishedAtLabel: "5 gün önce",
    publishedDaysAgo: 5,
    viewCount: 189,
    favoriteCount: 8,
    leadCount: 5,
    averageStaySeconds: 71,
    clickThroughRate: 13.7,
    conversionRate: 4.2,
    rankingPosition: 6,
    isFeatured: false,
    isPinned: false,
    photoCount: 8,
    hasVideo: false,
    has3DTour: false,
    coverImage:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "3",
    listingNo: "LM-2403",
    title: "Deniz manzaralı lüks rezidans",
    type: "sale",
    status: "draft",
    priceLabel: "7.200.000 TL",
    priceValue: 7200000,
    propertyName: "Sahil Rezidans",
    unitInfo: "B Blok / No 15",
    city: "İzmir",
    district: "Karşıyaka",
    neighborhood: "Mavişehir",
    grossArea: 180,
    netArea: 162,
    room: "3+1",
    roomFilterValue: "3+1",
    bathroomCount: 2,
    buildingAge: 3,
    floorInfo: "11. Kat / 18",
    heating: "Yerden Isıtma",
    dues: "2.400 TL",
    elevator: "Var",
    parking: "Kapalı",
    deedStatus: "Kat Mülkiyeti",
    usageStatus: "Boş",
    updatedAtLabel: "3 gün önce",
    updatedDaysAgo: 3,
    publishedAtLabel: "Taslak",
    publishedDaysAgo: 0,
    viewCount: 0,
    favoriteCount: 0,
    leadCount: 0,
    averageStaySeconds: 0,
    clickThroughRate: 0,
    conversionRate: 0,
    rankingPosition: 0,
    isFeatured: false,
    isPinned: false,
    photoCount: 16,
    hasVideo: true,
    has3DTour: true,
    coverImage:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "4",
    listingNo: "LM-2404",
    title: "Metroya yakın stüdyo daire",
    type: "rent",
    status: "passive",
    priceLabel: "6.000 TL / ay",
    priceValue: 6000,
    propertyName: "Metro Konakları",
    unitInfo: "C Blok / No 4",
    city: "İstanbul",
    district: "Beşiktaş",
    neighborhood: "Gayrettepe",
    grossArea: 65,
    netArea: 58,
    room: "Stüdyo",
    roomFilterValue: "studio",
    bathroomCount: 1,
    buildingAge: 18,
    floorInfo: "2. Kat / 6",
    heating: "Doğalgaz",
    dues: "650 TL",
    elevator: "Var",
    parking: "Yok",
    deedStatus: "Kat İrtifakı",
    usageStatus: "Boş",
    updatedAtLabel: "1 hafta önce",
    updatedDaysAgo: 7,
    publishedAtLabel: "20 gün önce",
    publishedDaysAgo: 20,
    viewCount: 320,
    favoriteCount: 15,
    leadCount: 4,
    averageStaySeconds: 49,
    clickThroughRate: 9.8,
    conversionRate: 2.3,
    rankingPosition: 18,
    isFeatured: false,
    isPinned: false,
    photoCount: 5,
    hasVideo: false,
    has3DTour: false,
  },
  {
    id: "5",
    listingNo: "LM-2405",
    title: "Merkezi konumda ofis katı",
    type: "rent",
    status: "published",
    priceLabel: "25.000 TL / ay",
    priceValue: 25000,
    propertyName: "Plaza 2000",
    unitInfo: "Kat 5 / No 22",
    city: "Bursa",
    district: "Nilüfer",
    neighborhood: "Odunluk",
    grossArea: 200,
    netArea: 190,
    room: "5+1",
    roomFilterValue: "5+",
    bathroomCount: 2,
    buildingAge: 8,
    floorInfo: "5. Kat / 10",
    heating: "Merkezi",
    dues: "3.100 TL",
    elevator: "Var",
    parking: "Kapalı",
    deedStatus: "Kat Mülkiyeti",
    usageStatus: "Kiracılı",
    updatedAtLabel: "2 gün önce",
    updatedDaysAgo: 2,
    publishedAtLabel: "8 gün önce",
    publishedDaysAgo: 8,
    viewCount: 98,
    favoriteCount: 5,
    leadCount: 6,
    averageStaySeconds: 102,
    clickThroughRate: 22.1,
    conversionRate: 6.1,
    rankingPosition: 4,
    isFeatured: true,
    isPinned: false,
    photoCount: 10,
    hasVideo: true,
    has3DTour: false,
    coverImage:
      "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "6",
    listingNo: "LM-2406",
    title: "Bahçeli müstakil villa",
    type: "sale",
    status: "draft",
    priceLabel: "12.000.000 TL",
    priceValue: 12000000,
    propertyName: "Yeşil Vadi",
    unitInfo: "Villa No 8",
    city: "Antalya",
    district: "Konyaaltı",
    neighborhood: "Liman",
    grossArea: 350,
    netArea: 300,
    room: "6+2",
    roomFilterValue: "5+",
    bathroomCount: 4,
    buildingAge: 2,
    floorInfo: "Müstakil / 2 Kat",
    heating: "Yerden Isıtma",
    dues: "Yok",
    elevator: "Yok",
    parking: "Açık",
    deedStatus: "Müstakil Tapu",
    usageStatus: "Boş",
    updatedAtLabel: "5 gün önce",
    updatedDaysAgo: 5,
    publishedAtLabel: "Taslak",
    publishedDaysAgo: 0,
    viewCount: 0,
    favoriteCount: 0,
    leadCount: 0,
    averageStaySeconds: 0,
    clickThroughRate: 0,
    conversionRate: 0,
    rankingPosition: 0,
    isFeatured: false,
    isPinned: false,
    photoCount: 21,
    hasVideo: true,
    has3DTour: true,
    coverImage:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "7",
    listingNo: "LM-2407",
    title: "Site içinde aileye uygun 2+1 daire",
    type: "rent",
    status: "published",
    priceLabel: "18.750 TL / ay",
    priceValue: 18750,
    propertyName: "Park Panorama",
    unitInfo: "D Blok / No 9",
    city: "İstanbul",
    district: "Ümraniye",
    neighborhood: "Atakent",
    grossArea: 125,
    netArea: 112,
    room: "2+1",
    roomFilterValue: "2+1",
    bathroomCount: 2,
    buildingAge: 4,
    floorInfo: "9. Kat / 14",
    heating: "Merkezi",
    dues: "1.850 TL",
    elevator: "Var",
    parking: "Kapalı",
    deedStatus: "Kat Mülkiyeti",
    usageStatus: "Boş",
    updatedAtLabel: "Bugün",
    updatedDaysAgo: 0,
    publishedAtLabel: "4 gün önce",
    publishedDaysAgo: 4,
    viewCount: 412,
    favoriteCount: 24,
    leadCount: 16,
    averageStaySeconds: 118,
    clickThroughRate: 26.3,
    conversionRate: 7.8,
    rankingPosition: 2,
    isFeatured: true,
    isPinned: true,
    photoCount: 14,
    hasVideo: true,
    has3DTour: false,
    coverImage:
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "8",
    listingNo: "LM-2408",
    title: "Yeni binada satılık 4+1 dubleks",
    type: "sale",
    status: "published",
    priceLabel: "9.450.000 TL",
    priceValue: 9450000,
    propertyName: "Nova Park",
    unitInfo: "A Blok / Dubleks 18",
    city: "İstanbul",
    district: "Başakşehir",
    neighborhood: "Kayaşehir",
    grossArea: 240,
    netArea: 210,
    room: "4+1",
    roomFilterValue: "4+1",
    bathroomCount: 3,
    buildingAge: 1,
    floorInfo: "11-12. Kat / 12",
    heating: "Yerden Isıtma",
    dues: "2.950 TL",
    elevator: "Var",
    parking: "Kapalı",
    deedStatus: "Kat Mülkiyeti",
    usageStatus: "Boş",
    updatedAtLabel: "Dün",
    updatedDaysAgo: 1,
    publishedAtLabel: "6 gün önce",
    publishedDaysAgo: 6,
    viewCount: 268,
    favoriteCount: 19,
    leadCount: 11,
    averageStaySeconds: 96,
    clickThroughRate: 19.7,
    conversionRate: 5.8,
    rankingPosition: 5,
    isFeatured: false,
    isPinned: false,
    photoCount: 18,
    hasVideo: true,
    has3DTour: true,
    coverImage:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
  },
];

const STATUS_OPTIONS: { value: ListingStatus; label: string }[] = [
  { value: "all", label: "Tümü" },
  { value: "published", label: "Yayında" },
  { value: "draft", label: "Taslak" },
  { value: "passive", label: "Pasif" },
];

const TYPE_OPTIONS: { value: ListingType; label: string }[] = [
  { value: "all", label: "Tümü" },
  { value: "rent", label: "Kiralık" },
  { value: "sale", label: "Satılık" },
];

const ROOM_OPTIONS: { value: RoomFilter; label: string }[] = [
  { value: "all", label: "Tümü" },
  { value: "studio", label: "Stüdyo" },
  { value: "1+1", label: "1+1" },
  { value: "2+1", label: "2+1" },
  { value: "3+1", label: "3+1" },
  { value: "4+1", label: "4+1" },
  { value: "5+", label: "5+ ve üzeri" },
];

const DATE_RANGE_OPTIONS: { value: DateRangeFilter; label: string }[] = [
  { value: "all", label: "Tümü" },
  { value: "7d", label: "Son 7 gün" },
  { value: "30d", label: "Son 30 gün" },
  { value: "90d", label: "Son 90 gün" },
];

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "newest", label: "En yeni" },
  { value: "oldest", label: "En eski" },
  { value: "mostViewed", label: "En çok görüntülenen" },
  { value: "bestPerforming", label: "En iyi performans" },
  { value: "highestPrice", label: "En yüksek fiyat" },
  { value: "lowestPrice", label: "En düşük fiyat" },
];

const ITEMS_PER_PAGE = 6;

export default function MyListingsView() {
  const theme = useTheme<Theme>();
  const [listings, setListings] = useState<ListingItem[]>(INITIAL_LISTINGS);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ListingStatus>("all");
  const [listingType, setListingType] = useState<ListingType>("all");
  const [roomFilter, setRoomFilter] = useState<RoomFilter>("all");
  const [dateRange, setDateRange] = useState<DateRangeFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [feedback, setFeedback] = useState<ActionFeedback>({ open: false, message: "" });

  const maxPrice = useMemo(
    () => Math.max(...listings.map((item) => item.priceValue)),
    [listings],
  );
  const maxArea = useMemo(
    () => Math.max(...listings.map((item) => item.grossArea)),
    [listings],
  );

  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);
  const [areaRange, setAreaRange] = useState<[number, number]>([0, maxArea]);

  React.useEffect(() => {
    setPriceRange((prev) => [Math.min(prev[0], maxPrice), maxPrice]);
    setAreaRange((prev) => [Math.min(prev[0], maxArea), maxArea]);
  }, [maxPrice, maxArea]);

  const showFeedback = useCallback((message: string) => {
    setFeedback({ open: true, message });
  }, []);

  const filteredListings = useMemo(() => {
    const q = search.trim().toLowerCase();

    const next = listings.filter((item) => {
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.propertyName.toLowerCase().includes(q) ||
        item.unitInfo.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        item.district.toLowerCase().includes(q) ||
        item.neighborhood.toLowerCase().includes(q) ||
        item.listingNo.toLowerCase().includes(q);

      const matchesStatus = status === "all" || item.status === status;
      const matchesType = listingType === "all" || item.type === listingType;
      const matchesRoom = roomFilter === "all" || item.roomFilterValue === roomFilter;
      const matchesDate =
        dateRange === "all" ||
        (dateRange === "7d" && item.updatedDaysAgo <= 7) ||
        (dateRange === "30d" && item.updatedDaysAgo <= 30) ||
        (dateRange === "90d" && item.updatedDaysAgo <= 90);

      const matchesPrice = item.priceValue >= priceRange[0] && item.priceValue <= priceRange[1];
      const matchesArea = item.grossArea >= areaRange[0] && item.grossArea <= areaRange[1];
      const matchesFeatured = !onlyFeatured || item.isFeatured;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesRoom &&
        matchesDate &&
        matchesPrice &&
        matchesArea &&
        matchesFeatured
      );
    });

    next.sort((a, b) => {
      if (sortBy === "newest") return a.updatedDaysAgo - b.updatedDaysAgo;
      if (sortBy === "oldest") return b.updatedDaysAgo - a.updatedDaysAgo;
      if (sortBy === "mostViewed") return b.viewCount - a.viewCount;
      if (sortBy === "highestPrice") return b.priceValue - a.priceValue;
      if (sortBy === "lowestPrice") return a.priceValue - b.priceValue;
      return b.clickThroughRate + b.conversionRate - (a.clickThroughRate + a.conversionRate);
    });

    return next;
  }, [areaRange, dateRange, listingType, listings, onlyFeatured, priceRange, roomFilter, search, sortBy, status]);

  React.useEffect(() => {
    setPage(1);
  }, [search, status, listingType, roomFilter, dateRange, sortBy, priceRange, areaRange, onlyFeatured]);

  const totalPages = Math.max(1, Math.ceil(filteredListings.length / ITEMS_PER_PAGE));
  const paginatedListings = filteredListings.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const totalCount = listings.length;
  const publishedCount = listings.filter((l) => l.status === "published").length;
  const draftCount = listings.filter((l) => l.status === "draft").length;
  const passiveCount = listings.filter((l) => l.status === "passive").length;
  const totalViews = listings.reduce((sum, l) => sum + l.viewCount, 0);
  const totalLeads = listings.reduce((sum, l) => sum + l.leadCount, 0);
  const avgCtr = average(listings.map((l) => l.clickThroughRate));
  const featuredCount = listings.filter((l) => l.isFeatured).length;
  const lowPerformingCount = listings.filter((l) => l.status === "published" && l.clickThroughRate < 10).length;

  const isFiltered =
    search.trim() !== "" ||
    status !== "all" ||
    listingType !== "all" ||
    roomFilter !== "all" ||
    dateRange !== "all" ||
    onlyFeatured ||
    priceRange[0] !== 0 ||
    priceRange[1] !== maxPrice ||
    areaRange[0] !== 0 ||
    areaRange[1] !== maxArea;

  const isAllSelectedOnPage =
    paginatedListings.length > 0 && paginatedListings.every((item) => selectedIds.includes(item.id));

  const toggleSelectAllOnPage = () => {
    if (isAllSelectedOnPage) {
      setSelectedIds((prev) => prev.filter((id) => !paginatedListings.some((item) => item.id === id)));
      return;
    }

    setSelectedIds((prev) => Array.from(new Set([...prev, ...paginatedListings.map((item) => item.id)])));
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus("all");
    setListingType("all");
    setRoomFilter("all");
    setDateRange("all");
    setSortBy("newest");
    setOnlyFeatured(false);
    setPriceRange([0, maxPrice]);
    setAreaRange([0, maxArea]);
  };

  const handleTogglePassive = (id: string) => {
    setListings((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === "passive" ? "published" : "passive" }
          : item,
      ),
    );
    showFeedback("İlan durumu güncellendi");
  };

  const handleToggleFeatured = (id: string) => {
    setListings((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFeatured: !item.isFeatured } : item,
      ),
    );
    showFeedback("Öne çıkarma durumu güncellendi");
  };

  const handleDuplicate = (id: string) => {
    const source = listings.find((item) => item.id === id);
    if (!source) return;

    const nextId = `${Date.now()}`;
    const duplicated: ListingItem = {
      ...source,
      id: nextId,
      listingNo: `${source.listingNo}-KOPYA`,
      title: `${source.title} (Kopya)`,
      status: "draft",
      isPinned: false,
      isFeatured: false,
      viewCount: 0,
      favoriteCount: 0,
      leadCount: 0,
      clickThroughRate: 0,
      conversionRate: 0,
      averageStaySeconds: 0,
      rankingPosition: 0,
      updatedAtLabel: "Bugün",
      updatedDaysAgo: 0,
      publishedAtLabel: "Taslak",
      publishedDaysAgo: 0,
    };

    setListings((prev) => [duplicated, ...prev]);
    showFeedback("İlan kopyalandı ve taslak olarak oluşturuldu");
  };

  const handleShareQr = () => {
    showFeedback("QR paylaşım yakında aktif olacak");
  };

  const handleBulkPassive = () => {
    if (selectedIds.length === 0) return;
    setListings((prev) =>
      prev.map((item) =>
        selectedIds.includes(item.id) ? { ...item, status: "passive" } : item,
      ),
    );
    setSelectedIds([]);
    showFeedback("Seçili ilanlar pasife alındı");
  };

  const handleBulkFeature = () => {
    if (selectedIds.length === 0) return;
    setListings((prev) =>
      prev.map((item) =>
        selectedIds.includes(item.id) ? { ...item, isFeatured: true } : item,
      ),
    );
    setSelectedIds([]);
    showFeedback("Seçili ilanlar öne çıkarıldı");
  };

  const handleBulkCopy = () => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach((id) => handleDuplicate(id));
    setSelectedIds([]);
  };

  return (
    <>
      <Stack spacing={3}>
        <Slide direction="down" in timeout={500}>
          <Box
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: 5,
              position: "relative",
              overflow: "hidden",
              background: `linear-gradient(135deg, 
                ${alpha(theme.palette.primary.main, 0.08)} 0%, 
                ${alpha(theme.palette.primary.light, 0.05)} 35%, 
                ${alpha(theme.palette.info.main, 0.04)} 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
              "&::before": {
                content: '""',
                position: "absolute",
                top: -70,
                right: -70,
                width: 250,
                height: 250,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${alpha(
                  theme.palette.primary.main,
                  0.12,
                )} 0%, transparent 70%)`,
                pointerEvents: "none",
              },
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: -50,
                left: -50,
                width: 180,
                height: 180,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${alpha(
                  theme.palette.success.main,
                  0.1,
                )} 0%, transparent 70%)`,
                pointerEvents: "none",
              },
            }}
          >
            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Stack spacing={2.5}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2.5}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "center" }}
                >
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Chip
                        label="İlan Yönetimi"
                        size="small"
                        sx={{
                          fontWeight: 800,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: "primary.main",
                          backdropFilter: "blur(8px)",
                        }}
                      />
                      <Chip
                        label={`${totalCount} ilan`}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 800 }}
                      />
                      <Chip
                        label={`${featuredCount} öne çıkan`}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 800 }}
                      />
                    </Stack>

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
                      İlanlarım
                    </Typography>

                    <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                      İlanlarınızı yönetin, performansı takip edin, toplu işlemler yapın ve düşük
                      performanslı ilanları hızlıca iyileştirin.
                    </Typography>
                  </Box>

                  <Button
                    component={Link}
                    href="/listings-management/create/select-property"
                    variant="contained"
                    startIcon={<IconPlus size={20} stroke={2.5} />}
                    sx={{
                      borderRadius: 3,
                      fontWeight: 800,
                      textTransform: "none",
                      px: 3,
                      py: { xs: 1, md: 1.25 },
                      minHeight: { xs: 42, md: 48 },
                      flexShrink: 0,
                      boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                      "&:hover": {
                        boxShadow: `0 6px 28px ${alpha(theme.palette.primary.main, 0.4)}`,
                      },
                    }}
                  >
                    Yeni İlan Oluştur
                  </Button>
                </Stack>

                <Stack spacing={1.25}>
                  {lowPerformingCount > 0 && (
                    <Alert
                      severity="warning"
                      sx={{ borderRadius: 3 }}
                      icon={<IconAlertTriangle size={18} />}
                    >
                      {lowPerformingCount} yayındaki ilan düşük tıklanma oranına sahip. Kapak
                      görseli, fiyat veya başlık optimizasyonu önerilir.
                    </Alert>
                  )}
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Slide>

        <Fade in timeout={600}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, minmax(0, 1fr))",
                md: "repeat(3, minmax(0, 1fr))",
                xl: "repeat(6, minmax(0, 1fr))",
              },
              gap: 1.5,
              alignItems: "start",
            }}
          >
            <StatCard
              icon={<IconFileDescription size={20} stroke={2} />}
              label="Toplam"
              value={String(totalCount)}
              tone="default"
            />
            <StatCard
              icon={<IconCircleCheck size={20} stroke={2} />}
              label="Yayında"
              value={String(publishedCount)}
              tone="success"
            />
            <StatCard
              icon={<IconClock size={20} stroke={2} />}
              label="Taslak"
              value={String(draftCount)}
              tone="warning"
            />
            <StatCard
              icon={<IconAlertTriangle size={20} stroke={2} />}
              label="Pasif"
              value={String(passiveCount)}
              tone="info"
            />
            <StatCard
              icon={<IconTrendingUp size={20} stroke={2} />}
              label="Görüntülenme"
              value={totalViews.toLocaleString()}
              tone="default"
            />
            <StatCard
              icon={<IconUsers size={20} stroke={2} />}
              label="Potansiyel Müşteri"
              value={totalLeads.toLocaleString()}
              tone="success"
            />
          </Box>
        </Fade>

        <Fade in timeout={650}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
              gap: 2,
            }}
          >
            <MetricInsightCard
              title="Ortalama Tıklanma Oranı"
              value={`${avgCtr.toFixed(1)}%`}
              description="İlan kartı görüntülenmesinden detay açılmasına giden oran."
            />
            <MetricInsightCard
              title="Öne Çıkan İlan Payı"
              value={`${Math.round((featuredCount / Math.max(totalCount, 1)) * 100)}%`}
              description="Ücretli görünürlük kullanan ilanların toplam portföy içindeki oranı."
            />
          </Box>
        </Fade>

        {selectedIds.length > 0 && (
          <Fade in>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 4.5,
                borderColor: alpha(theme.palette.primary.main, 0.16),
                bgcolor: alpha(theme.palette.primary.main, 0.03),
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={1.5}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "center" }}
                >
                  <Typography fontWeight={900}>
                    {selectedIds.length} ilan seçildi
                  </Typography>

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Button
                      variant="outlined"
                      startIcon={<IconPlayerPause size={16} />}
                      onClick={handleBulkPassive}
                      sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: "none" }}
                    >
                      Toplu Pasifleştir
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<IconSparkles size={16} />}
                      onClick={handleBulkFeature}
                      sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: "none" }}
                    >
                      Toplu Öne Çıkar
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<IconCopy size={16} />}
                      onClick={handleBulkCopy}
                      sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: "none" }}
                    >
                      Toplu Kopyala
                    </Button>
                    <Button
                      variant="text"
                      onClick={() => setSelectedIds([])}
                      sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: "none" }}
                    >
                      Seçimi Temizle
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Fade>
        )}

        <Fade in timeout={700}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 5,
              borderColor: alpha(theme.palette.divider, 0.6),
              background: alpha(theme.palette.background.paper, 0.7),
              backdropFilter: "blur(16px)",
              boxShadow: `0 4px 24px ${alpha(theme.palette.common.black, 0.03)}`,
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
              <Stack spacing={2.5}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  alignItems={{ xs: "stretch", md: "center" }}
                >
                  <TextField
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="İlan başlığı, ilan no, mülk, şehir, ilçe veya mahalle ara..."
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <IconSearch size={20} stroke={2} />
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: 3,
                        bgcolor: "background.paper",
                        "&:hover": {
                          boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.12)}`,
                        },
                        "&.Mui-focused": {
                          boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.18)}`,
                        },
                      },
                    }}
                  />

                  <TextField
                    select
                    label="Durum"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ListingStatus)}
                    sx={{ minWidth: { xs: "100%", md: 150 } }}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    label="İlan tipi"
                    value={listingType}
                    onChange={(e) => setListingType(e.target.value as ListingType)}
                    sx={{ minWidth: { xs: "100%", md: 140 } }}
                  >
                    {TYPE_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>

                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(_, value) => value && setViewMode(value)}
                    size="medium"
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                      borderRadius: 3,
                      p: 0.5,
                      flexShrink: 0,
                      "& .MuiToggleButton-root": {
                        borderRadius: 2.5,
                        border: "none",
                        px: 2,
                        py: 1,
                        fontWeight: 700,
                        color: "text.secondary",
                        "&.Mui-selected": {
                          bgcolor: "background.paper",
                          color: "primary.main",
                          boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}`,
                        },
                      },
                    }}
                  >
                    <ToggleButton value="grid">
                      <IconGridDots size={18} style={{ marginRight: 6 }} />
                      Grid
                    </ToggleButton>
                    <ToggleButton value="list">
                      <IconLayoutList size={18} style={{ marginRight: 6 }} />
                      Liste
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Stack>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", xl: "repeat(4, minmax(0, 1fr))" },
                    gap: 2,
                  }}
                >
                  <TextField
                    select
                    label="Oda sayısı"
                    value={roomFilter}
                    onChange={(e) => setRoomFilter(e.target.value as RoomFilter)}
                  >
                    {ROOM_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    label="Tarih aralığı"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value as DateRangeFilter)}
                  >
                    {DATE_RANGE_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    label="Sıralama"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={onlyFeatured}
                        onChange={(e) => setOnlyFeatured(e.target.checked)}
                      />
                    }
                    label="Sadece öne çıkanlar"
                    sx={{ m: 0, height: "100%", alignItems: "center" }}
                  />
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", xl: "1fr 1fr" },
                    gap: 2,
                  }}
                >
                  <RangeFilter
                    label="Fiyat aralığı"
                    value={priceRange}
                    min={0}
                    max={maxPrice}
                    step={500}
                    formatValue={(value) => `${value.toLocaleString("tr-TR")} TL`}
                    onChange={setPriceRange}
                  />
                  <RangeFilter
                    label="Brüt m² aralığı"
                    value={areaRange}
                    min={0}
                    max={maxArea}
                    step={5}
                    formatValue={(value) => `${value} m²`}
                    onChange={setAreaRange}
                  />
                </Box>

                {isFiltered && (
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    {status !== "all" && (
                      <FilterChip label={`Durum: ${getStatusLabel(status)}`} onDelete={() => setStatus("all")} />
                    )}
                    {listingType !== "all" && (
                      <FilterChip label={`İlan tipi: ${listingType === "rent" ? "Kiralık" : "Satılık"}`} onDelete={() => setListingType("all")} />
                    )}
                    {roomFilter !== "all" && (
                      <FilterChip label={`Oda: ${roomFilter}`} onDelete={() => setRoomFilter("all")} />
                    )}
                    {dateRange !== "all" && (
                      <FilterChip label={`Tarih: ${DATE_RANGE_OPTIONS.find((item) => item.value === dateRange)?.label ?? ""}`} onDelete={() => setDateRange("all")} />
                    )}
                    {search.trim() && (
                      <FilterChip label={`Arama: "${search.trim()}"`} onDelete={() => setSearch("")} />
                    )}
                    <Button
                      size="small"
                      onClick={handleClearFilters}
                      sx={{
                        borderRadius: 2.5,
                        fontWeight: 700,
                        textTransform: "none",
                        color: "text.secondary",
                        fontSize: "0.75rem",
                      }}
                    >
                      Tümünü Temizle
                    </Button>
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Fade>

        {filteredListings.length > 0 ? (
          <>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.5}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Checkbox
                  checked={isAllSelectedOnPage}
                  indeterminate={!isAllSelectedOnPage && selectedIds.some((id) => paginatedListings.some((item) => item.id === id))}
                  onChange={toggleSelectAllOnPage}
                />
                <Typography fontWeight={800}>
                  {filteredListings.length} sonuç • Sayfa {page}/{totalPages}
                </Typography>
              </Stack>

              <Typography variant="body2" color="text.secondary">
                Yayındaki ilanlar için performans, medya ve hızlı işlem özetleri gösterilir.
              </Typography>
            </Stack>

            {viewMode === "list" ? (
              <Stack spacing={2}>
                {paginatedListings.map((listing, index) => (
                  <Grow in timeout={300 + index * 80} key={listing.id}>
                    <Box>
                      <ListingListItem
                        listing={listing}
                        query={search.trim()}
                        selected={selectedIds.includes(listing.id)}
                        onSelect={() => toggleSelectOne(listing.id)}
                        onTogglePassive={() => handleTogglePassive(listing.id)}
                        onToggleFeatured={() => handleToggleFeatured(listing.id)}
                        onDuplicate={() => handleDuplicate(listing.id)}
                        onShareQr={handleShareQr}
                      />
                    </Box>
                  </Grow>
                ))}
              </Stack>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "repeat(2, minmax(0, 1fr))",
                    xl: "repeat(3, minmax(0, 1fr))",
                  },
                  gap: 2,
                  alignItems: "stretch",
                }}
              >
                {paginatedListings.map((listing, index) => (
                  <Grow in timeout={300 + index * 80} key={listing.id}>
                    <Box>
                      <ListingGridCard
                        listing={listing}
                        query={search.trim()}
                        selected={selectedIds.includes(listing.id)}
                        onSelect={() => toggleSelectOne(listing.id)}
                        onTogglePassive={() => handleTogglePassive(listing.id)}
                        onToggleFeatured={() => handleToggleFeatured(listing.id)}
                        onDuplicate={() => handleDuplicate(listing.id)}
                        onShareQr={handleShareQr}
                      />
                    </Box>
                  </Grow>
                ))}
              </Box>
            )}

            <PaginationBar
              page={page}
              totalPages={totalPages}
              onPrev={() => setPage((prev) => Math.max(1, prev - 1))}
              onNext={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            />
          </>
        ) : (
          <Grow in timeout={400}>
            <Box>
              <PremiumEmptyState onClear={handleClearFilters} />
            </Box>
          </Grow>
        )}
      </Stack>

      <Snackbar
        open={feedback.open}
        autoHideDuration={2500}
        onClose={() => setFeedback({ open: false, message: "" })}
        message={feedback.message}
      />
    </>
  );
}

function MetricInsightCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  const theme = useTheme<Theme>();

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4.5,
        borderColor: alpha(theme.palette.divider, 0.6),
      }}
    >
      <CardContent sx={{ p: 2.25 }}>
        <Stack spacing={1}>
          <Typography variant="caption" color="text.secondary" fontWeight={700}>
            {title}
          </Typography>
          <Typography variant="h5" fontWeight={900}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

function RangeFilter({
  label,
  value,
  min,
  max,
  step,
  formatValue,
  onChange,
}: {
  label: string;
  value: [number, number];
  min: number;
  max: number;
  step: number;
  formatValue: (value: number) => string;
  onChange: (value: [number, number]) => void;
}) {
  return (
    <Box sx={{ px: 1 }}>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography fontWeight={700}>{label}</Typography>
        <Typography variant="body2" color="text.secondary">
          {formatValue(value[0])} - {formatValue(value[1])}
        </Typography>
      </Stack>
      <Slider
        value={value}
        onChange={(_, nextValue) => onChange(nextValue as [number, number])}
        min={min}
        max={max}
        step={step}
        valueLabelDisplay="auto"
      />
    </Box>
  );
}

function PaginationBar({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
      <Button
        variant="outlined"
        onClick={onPrev}
        disabled={page === 1}
        sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: "none" }}
      >
        Önceki
      </Button>
      <Typography fontWeight={800}>
        {page} / {totalPages}
      </Typography>
      <Button
        variant="outlined"
        onClick={onNext}
        disabled={page === totalPages}
        sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: "none" }}
      >
        Sonraki
      </Button>
    </Stack>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "default" | "success" | "warning" | "info";
}) {
  const theme = useTheme<Theme>();
  const styles = getToneStyles(theme, tone);

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 4,
        border: `1px solid ${styles.border}`,
        bgcolor: alpha(theme.palette.background.paper, 0.7),
        backdropFilter: "blur(8px)",
        transition: "all 200ms ease",
        minWidth: 0,
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: `0 8px 24px ${alpha(styles.color, 0.1)}`,
        },
      }}
    >
      <Stack spacing={1}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2.5,
            display: "grid",
            placeItems: "center",
            bgcolor: styles.bg,
            color: styles.color,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {label}
          </Typography>
          <Typography
            variant="h6"
            fontWeight={900}
            sx={{ color: styles.color }}
            noWrap
          >
            {value}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

function ListingGridCard({
  listing,
  query,
  selected,
  onSelect,
  onTogglePassive,
  onToggleFeatured,
  onDuplicate,
  onShareQr,
}: {
  listing: ListingItem;
  query: string;
  selected: boolean;
  onSelect: () => void;
  onTogglePassive: () => void;
  onToggleFeatured: () => void;
  onDuplicate: () => void;
  onShareQr: () => void;
}) {
  const theme = useTheme<Theme>();
  const [isHovered, setIsHovered] = useState(false);
  const statusMeta = getStatusMeta(theme, listing.status);

  const placeholderGradient =
    listing.status === "published"
      ? `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.2)} 0%, ${alpha(
          theme.palette.primary.main,
          0.15,
        )} 100%)`
      : listing.status === "draft"
        ? `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.2)} 0%, ${alpha(
            theme.palette.warning.light,
            0.1,
          )} 100%)`
        : `linear-gradient(135deg, ${alpha(theme.palette.grey[400], 0.2)} 0%, ${alpha(
            theme.palette.grey[300],
            0.1,
          )} 100%)`;

  return (
    <Card
      variant="outlined"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        height: "100%",
        borderRadius: 5,
        overflow: "hidden",
        borderColor: selected
          ? theme.palette.primary.main
          : isHovered
            ? alpha(theme.palette.primary.main, 0.3)
            : alpha(theme.palette.divider, 0.5),
        borderWidth: selected ? 2 : 1,
        transition: "all 250ms cubic-bezier(0.4, 0, 0.2, 1)",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: isHovered
          ? `0 16px 48px ${alpha(theme.palette.common.black, 0.1)}`
          : `0 2px 8px ${alpha(theme.palette.common.black, 0.02)}`,
      }}
    >
      <ListingImage
        listing={listing}
        imageUrl={listing.coverImage}
        height={184}
        placeholderGradient={placeholderGradient}
        isHovered={isHovered}
        statusMeta={statusMeta}
        compact={false}
      />

      <CardContent sx={{ p: 2.25 }}>
        <Stack spacing={1.75}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Checkbox checked={selected} onChange={onSelect} />
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap justifyContent="flex-end">
              {listing.isPinned && <MiniStatusBadge label="Sabit" />}
              {listing.isFeatured && <MiniStatusBadge label="Öne Çıkan" />}
            </Stack>
          </Stack>

          <Box>
            <Typography
              fontWeight={900}
              fontSize="1rem"
              letterSpacing="-0.01em"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                lineHeight: 1.3,
              }}
            >
              {highlightText(listing.title, query)}
            </Typography>

            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.75 }}>
              <IconMapPin size={14} stroke={2} style={{ color: theme.palette.text.disabled }} />
              <Typography variant="body2" color="text.secondary">
                {highlightText(`${listing.city} / ${listing.district} • ${listing.neighborhood}`, query)}
              </Typography>
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {highlightText(`${listing.propertyName} • ${listing.unitInfo}`, query)}
            </Typography>
          </Box>

          <Typography variant="h6" fontWeight={900} color="primary.main" letterSpacing="-0.02em">
            {listing.priceLabel}
          </Typography>

          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            <MetaChip label={`${listing.grossArea} m² brüt`} />
            <MetaChip label={`${listing.netArea} m² net`} />
            <MetaChip label={listing.room} />
            <MetaChip label={`Aidat ${listing.dues}`} />
          </Stack>

          <PerformanceStrip listing={listing} />

          <QuickActions
            listing={listing}
            onTogglePassive={onTogglePassive}
            onToggleFeatured={onToggleFeatured}
            onDuplicate={onDuplicate}
            onShareQr={onShareQr}
          />

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ pt: 1, borderTop: `1px solid ${alpha(theme.palette.divider, 0.4)}` }}
          >
            <Typography variant="caption" color="text.disabled" fontWeight={600}>
              {listing.updatedAtLabel}
            </Typography>
            <Typography variant="caption" color="text.disabled" fontWeight={600}>
              Sıralama #{listing.rankingPosition || "-"}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function ListingListItem({
  listing,
  query,
  selected,
  onSelect,
  onTogglePassive,
  onToggleFeatured,
  onDuplicate,
  onShareQr,
}: {
  listing: ListingItem;
  query: string;
  selected: boolean;
  onSelect: () => void;
  onTogglePassive: () => void;
  onToggleFeatured: () => void;
  onDuplicate: () => void;
  onShareQr: () => void;
}) {
  const theme = useTheme<Theme>();
  const [isHovered, setIsHovered] = useState(false);
  const statusMeta = getStatusMeta(theme, listing.status);

  const placeholderGradient =
    listing.status === "published"
      ? `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.18)} 0%, ${alpha(
          theme.palette.primary.main,
          0.14,
        )} 100%)`
      : listing.status === "draft"
        ? `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.18)} 0%, ${alpha(
            theme.palette.warning.light,
            0.1,
          )} 100%)`
        : `linear-gradient(135deg, ${alpha(theme.palette.grey[400], 0.18)} 0%, ${alpha(
            theme.palette.grey[300],
            0.1,
          )} 100%)`;

  return (
    <Card
      variant="outlined"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        borderRadius: 5,
        borderColor: selected
          ? theme.palette.primary.main
          : isHovered
            ? alpha(theme.palette.primary.main, 0.3)
            : alpha(theme.palette.divider, 0.5),
        borderWidth: selected ? 2 : 1,
        transition: "all 250ms cubic-bezier(0.4, 0, 0.2, 1)",
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: isHovered
          ? `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`
          : "none",
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", lg: "flex-start" }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ flex: 1, minWidth: 0 }}>
              <Checkbox checked={selected} onChange={onSelect} />
              <Box sx={{ flexShrink: 0 }}>
                <ListingImage
                  listing={listing}
                  imageUrl={listing.coverImage}
                  height={108}
                  width={150}
                  borderRadius={14}
                  placeholderGradient={placeholderGradient}
                  isHovered={isHovered}
                  statusMeta={statusMeta}
                  compact
                />
              </Box>

              <Stack spacing={0.9} sx={{ minWidth: 0, flex: 1 }}>
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                  <StatusChip status={listing.status} />
                  <Chip
                    label={listing.type === "rent" ? "Kiralık" : "Satılık"}
                    size="small"
                    sx={{ fontWeight: 700, fontSize: "0.7rem" }}
                  />
                  {listing.isFeatured && <MiniStatusBadge label="Öne Çıkan" />}
                  {listing.isPinned && <MiniStatusBadge label="Sabit" />}
                </Stack>

                <Typography
                  fontWeight={900}
                  sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {highlightText(listing.title, query)}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {highlightText(`${listing.propertyName} • ${listing.unitInfo}`, query)}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {highlightText(`${listing.city} / ${listing.district} / ${listing.neighborhood}`, query)}
                </Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <MetaChip label={`${listing.grossArea} m² brüt`} />
                  <MetaChip label={`${listing.netArea} m² net`} />
                  <MetaChip label={listing.room} />
                  <MetaChip label={listing.floorInfo} />
                  <MetaChip label={`Aidat ${listing.dues}`} />
                </Stack>

                <PerformanceStrip listing={listing} compact />
              </Stack>
            </Stack>

            <Stack spacing={1.5} alignItems={{ xs: "flex-start", lg: "flex-end" }}>
              <Typography variant="h6" fontWeight={900} color="primary.main" noWrap>
                {listing.priceLabel}
              </Typography>

              <QuickActions
                listing={listing}
                onTogglePassive={onTogglePassive}
                onToggleFeatured={onToggleFeatured}
                onDuplicate={onDuplicate}
                onShareQr={onShareQr}
                compact
              />

              <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap justifyContent="flex-end">
                <Typography variant="caption" color="text.disabled" fontWeight={600}>
                  {listing.updatedAtLabel}
                </Typography>
                <Typography variant="caption" color="text.disabled" fontWeight={600}>
                  {listing.viewCount} görüntülenme
                </Typography>
                <Typography variant="caption" color="warning.dark" fontWeight={600}>
                  {listing.favoriteCount} favori
                </Typography>
                <Typography variant="caption" color="success.dark" fontWeight={600}>
                  {listing.leadCount} müşteri
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function ListingImage({
  listing,
  imageUrl,
  height,
  width,
  borderRadius = 0,
  placeholderGradient,
  isHovered,
  statusMeta,
  compact,
}: {
  listing: ListingItem;
  imageUrl?: string;
  height: number;
  width?: number;
  borderRadius?: number;
  placeholderGradient: string;
  isHovered: boolean;
  statusMeta: ReturnType<typeof getStatusMeta>;
  compact: boolean;
}) {
  const theme = useTheme<Theme>();

  return (
    <Box
      sx={{
        position: "relative",
        height,
        width: width ?? "100%",
        borderRadius,
        overflow: "hidden",
        background: imageUrl ? "transparent" : placeholderGradient,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {imageUrl ? (
        <Box
          component="img"
          src={imageUrl}
          alt=""
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 300ms ease",
            transform: isHovered ? "scale(1.05)" : "scale(1)",
            display: "block",
          }}
        />
      ) : (
        <Stack spacing={0.75} alignItems="center" sx={{ color: alpha(theme.palette.primary.main, 0.55) }}>
          <IconPhoto size={compact ? 20 : 34} stroke={1.8} />
          {!compact && (
            <Typography variant="caption" fontWeight={700}>
              Görsel yok
            </Typography>
          )}
        </Stack>
      )}

      <Chip
        label={statusMeta.label}
        size="small"
        sx={{
          position: "absolute",
          top: 10,
          right: 10,
          fontWeight: 800,
          fontSize: "0.7rem",
          color: statusMeta.color,
          bgcolor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: "blur(8px)",
          border: `1px solid ${statusMeta.border}`,
          boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.08)}`,
        }}
      />

      <Stack
        direction="row"
        spacing={0.5}
        alignItems="center"
        sx={{
          position: "absolute",
          top: 10,
          left: 10,
        }}
      >
        <Chip
          label={listing.type === "rent" ? "Kiralık" : "Satılık"}
          size="small"
          sx={{
            fontWeight: 800,
            fontSize: "0.7rem",
            bgcolor: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: "blur(8px)",
            border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          }}
        />
      </Stack>

      <Stack
        direction="row"
        spacing={0.5}
        alignItems="center"
        sx={{
          position: "absolute",
          bottom: 10,
          left: 10,
        }}
      >
        <MediaBadge icon={<IconPhoto size={12} />} label={String(listing.photoCount)} />
        {listing.hasVideo && <MediaBadge icon={<IconVideo size={12} />} label="Video" />}
        {listing.has3DTour && <MediaBadge icon={<IconSparkles size={12} />} label="3D" />}
      </Stack>

      {!compact && (
        <Fade in={isHovered}>
          <Box
            sx={{
              position: "absolute",
              bottom: 10,
              right: 10,
              display: "flex",
              gap: 0.5,
            }}
          >
            <Tooltip title="Görüntüle" arrow>
              <IconButton
                component={Link}
                href={`/listings-management/my-listings/${listing.id}`}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.background.paper, 0.9),
                  backdropFilter: "blur(8px)",
                  "&:hover": { bgcolor: "background.paper" },
                }}
              >
                <IconEye size={16} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Düzenle" arrow>
              <IconButton
                component={Link}
                href={`/listings-management/my-listings/${listing.id}/edit`}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.background.paper, 0.9),
                  backdropFilter: "blur(8px)",
                  "&:hover": { bgcolor: "background.paper" },
                }}
              >
                <IconEdit size={16} />
              </IconButton>
            </Tooltip>
          </Box>
        </Fade>
      )}
    </Box>
  );
}

function MediaBadge({
  icon,
  label,
}: {
  icon: React.ReactElement;
  label: string;
}) 

{
  const theme = useTheme<Theme>();

  return (
    <Chip
      icon={icon}
      label={label}
      size="small"
      sx={{
        height: 24,
        fontWeight: 800,
        fontSize: "0.7rem",
        color: theme.palette.common.white,
        bgcolor: alpha(theme.palette.common.black, 0.62),
        backdropFilter: "blur(8px)",
      }}
    />
  );
}

function PerformanceStrip({
  listing,
  compact = false,
}: {
  listing: ListingItem;
  compact?: boolean;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: compact
          ? { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(5, minmax(0, 1fr))" }
          : "repeat(5, minmax(0, 1fr))",
        gap: 0.75,
      }}
    >
      <MetricPill label="CTR" value={`${listing.clickThroughRate.toFixed(1)}%`} />
      <MetricPill label="Lead" value={String(listing.leadCount)} />
      <MetricPill label="Süre" value={`${listing.averageStaySeconds} sn`} />
      <MetricPill label="Dönüşüm" value={`${listing.conversionRate.toFixed(1)}%`} />
      <MetricPill label="Sıra" value={listing.rankingPosition > 0 ? `#${listing.rankingPosition}` : "-"} />
    </Box>
  );
}

function MetricPill({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const theme = useTheme<Theme>();

  return (
    <Box
      sx={{
        p: 1,
        borderRadius: 2.5,
        border: `1px solid ${alpha(theme.palette.divider, 0.65)}`,
        bgcolor: alpha(theme.palette.background.paper, 0.75),
      }}
    >
      <Typography variant="caption" color="text.secondary" fontWeight={700}>
        {label}
      </Typography>
      <Typography fontWeight={900} lineHeight={1.15}>
        {value}
      </Typography>
    </Box>
  );
}

function QuickActions({
  listing,
  onTogglePassive,
  onToggleFeatured,
  onDuplicate,
  onShareQr,
  compact = false,
}: {
  listing: ListingItem;
  onTogglePassive: () => void;
  onToggleFeatured: () => void;
  onDuplicate: () => void;
  onShareQr: () => void;
  compact?: boolean;
}) {
  return (
    <Stack
      direction={compact ? "row" : "column"}
      spacing={1}
      flexWrap="wrap"
      useFlexGap
      alignItems={compact ? "center" : "stretch"}
    >
      <Button
        variant="outlined"
        size="small"
        startIcon={<IconPlayerPause size={14} />}
        onClick={onTogglePassive}
        sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: "none" }}
      >
        {listing.status === "passive" ? "Yayına Al" : "Pasifleştir"}
      </Button>

      <Button
        variant={listing.isFeatured ? "contained" : "outlined"}
        size="small"
        startIcon={<IconSparkles size={14} />}
        onClick={onToggleFeatured}
        sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: "none" }}
      >
        {listing.isFeatured ? "Öne Çıkan" : "Öne Çıkar"}
      </Button>

      <Button
        variant="outlined"
        size="small"
        startIcon={<IconCopy size={14} />}
        onClick={onDuplicate}
        sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: "none" }}
      >
        Kopyala
      </Button>

      <Button
        variant="outlined"
        size="small"
        startIcon={<IconQrcode size={14} />}
        onClick={onShareQr}
        sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: "none" }}
      >
        QR Paylaş
      </Button>
    </Stack>
  );
}

function PremiumEmptyState({ onClear }: { onClear: () => void }) {
  const theme = useTheme<Theme>();

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 5,
        borderStyle: "dashed",
        borderColor: alpha(theme.palette.divider, 0.8),
        bgcolor: alpha(theme.palette.background.default, 0.4),
        backdropFilter: "blur(12px)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(
            theme.palette.primary.main,
            0.06,
          )} 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      <CardContent sx={{ p: { xs: 4, md: 6 }, position: "relative", zIndex: 1 }}>
        <Stack spacing={3} alignItems="center" textAlign="center">
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: 4,
              display: "grid",
              placeItems: "center",
              bgcolor: alpha(theme.palette.primary.main, 0.06),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              animation: "pulse 2s ease-in-out infinite",
              "@keyframes pulse": {
                "0%, 100%": { boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0.2)}` },
                "50%": { boxShadow: `0 0 0 16px ${alpha(theme.palette.primary.main, 0)}` },
              },
            }}
          >
            <IconStack2 size={36} stroke={1.5} style={{ color: theme.palette.primary.main }} />
          </Box>

          <Box>
            <Typography variant="h5" fontWeight={900} letterSpacing="-0.02em">
              Eşleşen ilan bulunamadı
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 480, mx: "auto" }}>
              Filtreler çok dar olabilir. Fiyat aralığı, oda sayısı veya tarih filtresini gevşeterek
              tekrar deneyin.
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={onClear}
            sx={{
              borderRadius: 3,
              fontWeight: 800,
              textTransform: "none",
              boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            Filtreleri Temizle
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

function FilterChip({ label, onDelete }: { label: string; onDelete: () => void }) {
  const theme = useTheme<Theme>();

  return (
    <Chip
      label={label}
      size="small"
      onDelete={onDelete}
      sx={{
        fontWeight: 700,
        bgcolor: alpha(theme.palette.primary.main, 0.06),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
        backdropFilter: "blur(8px)",
        fontSize: "0.75rem",
        "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.1) },
        "& .MuiChip-deleteIcon": {
          "&:hover": { color: theme.palette.error.main },
        },
      }}
    />
  );
}

function MetaChip({ label }: { label: string }) {
  return (
    <Chip
      label={label}
      size="small"
      variant="outlined"
      sx={{
        borderRadius: 2,
        borderColor: (theme) => alpha(theme.palette.divider, 0.6),
        bgcolor: (theme) => alpha(theme.palette.background.paper, 0.6),
        fontWeight: 600,
        fontSize: "0.7rem",
      }}
    />
  );
}

function MiniStatusBadge({ label }: { label: string }) {
  const theme = useTheme<Theme>();

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        fontWeight: 700,
        fontSize: "0.7rem",
        bgcolor: alpha(theme.palette.primary.main, 0.08),
      }}
    />
  );
}

function StatusChip({ status }: { status: ListingItem["status"] }) {
  const theme = useTheme<Theme>();
  const meta = getStatusMeta(theme, status);

  return (
    <Chip
      label={meta.label}
      size="small"
      sx={{
        fontWeight: 800,
        fontSize: "0.7rem",
        color: meta.color,
        bgcolor: meta.bg,
        border: `1px solid ${meta.border}`,
      }}
    />
  );
}

function highlightText(text: string, query: string) {
  const safeQuery = query.trim();
  if (!safeQuery) return text;

  const escaped = safeQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "ig"));

  return parts.map((part, index) =>
    part.toLowerCase() === safeQuery.toLowerCase() ? (
      <Box
        key={`${part}-${index}`}
        component="span"
        sx={{
          bgcolor: "warning.light",
          color: "warning.contrastText",
          borderRadius: 0.75,
          px: 0.25,
        }}
      >
        {part}
      </Box>
    ) : (
      <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
    ),
  );
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getToneStyles(theme: Theme, tone: "default" | "success" | "warning" | "info") {
  const map = {
    success: {
      bg: alpha(theme.palette.success.main, 0.1),
      color: theme.palette.success.dark,
      border: alpha(theme.palette.success.main, 0.2),
    },
    warning: {
      bg: alpha(theme.palette.warning.main, 0.12),
      color: theme.palette.warning.dark,
      border: alpha(theme.palette.warning.main, 0.22),
    },
    info: {
      bg: alpha(theme.palette.info.main, 0.1),
      color: theme.palette.info.dark,
      border: alpha(theme.palette.info.main, 0.2),
    },
    default: {
      bg: alpha(theme.palette.primary.main, 0.08),
      color: theme.palette.primary.main,
      border: alpha(theme.palette.primary.main, 0.14),
    },
  };

  return map[tone];
}

function getStatusMeta(theme: Theme, status: ListingItem["status"]) {
  const map = {
    published: {
      label: "Yayında",
      color: theme.palette.success.dark,
      bg: alpha(theme.palette.success.main, 0.1),
      border: alpha(theme.palette.success.main, 0.2),
    },
    draft: {
      label: "Taslak",
      color: theme.palette.warning.dark,
      bg: alpha(theme.palette.warning.main, 0.12),
      border: alpha(theme.palette.warning.main, 0.22),
    },
    passive: {
      label: "Pasif",
      color: theme.palette.text.disabled,
      bg: alpha(theme.palette.grey[400], 0.12),
      border: alpha(theme.palette.grey[400], 0.2),
    },
  };

  return map[status];
}

function getStatusLabel(status: ListingStatus): string {
  const map: Record<ListingStatus, string> = {
    all: "Tümü",
    published: "Yayında",
    draft: "Taslak",
    passive: "Pasif",
  };

  return map[status];
}
