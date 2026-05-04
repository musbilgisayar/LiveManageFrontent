// src/modules/property-management/views/UnitDefinitionCreateView.tsx
"use client";

import React, { useMemo, useState } from "react";
import {
    Alert,
    alpha,
    Box,
    Button,
    Card,
    CardContent,    
    Chip,
    CircularProgress,
    Divider,
    InputAdornment,
    MenuItem,
    Stack,
    TextField,
    Typography,
    useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import {
    IconAlertTriangle,
    IconBuildingEstate,
    IconChecklist,
    IconDatabaseExport,
    IconEdit,
    IconHome,
    IconInfoCircle,
    IconListDetails,
    IconMail,
    IconMapPin,
    IconPhone,
    IconPlus,
    IconSearch,
    IconShieldCheck,
    IconTrash,
    IconUser,
    IconUserCheck,
} from "@tabler/icons-react";

type UnitType = "apartment" | "shop" | "office";
type MatchStatus = "idle" | "checking" | "exact" | "similar" | "new";

type UnitForm = {
    street: string;
    buildingNo: string;
    addressNote: string;

    blockName: string;
    floor: string;
    unitNumber: string;
    unitType: UnitType;

    ownerFullName: string;
    ownerEmail: string;
    ownerPhone: string;

    residentFullName: string;
    residentEmail: string;
    residentPhone: string;
};

type DraftUnit = UnitForm & {
    id: string;
    displayName: string;
    unitTypeLabel: string;
};

const initialForm: UnitForm = {
    street: "",
    buildingNo: "",
    addressNote: "",

    blockName: "",
    floor: "",
    unitNumber: "",
    unitType: "apartment",

    ownerFullName: "",
    ownerEmail: "",
    ownerPhone: "",

    residentFullName: "",
    residentEmail: "",
    residentPhone: "",
};

const addressHierarchy = {
    country: "İsviçre",
    province: "Zürich",
    district: "Altstetten",
    neighborhood: "Mahalle / Köy bilgisi",
};

function getUnitTypeLabel(unitType: UnitType) {
    if (unitType === "apartment") return "Daire";
    if (unitType === "shop") return "Dükkan";
    return "Ofis";
}

function buildDisplayName(form: UnitForm) {
    const block = form.blockName.trim() || "Blok belirtilmedi";
    const floor = form.floor.trim() ? `${form.floor}. Kat` : "Kat belirtilmedi";
    const no = form.unitNumber.trim() || "No belirtilmedi";
    return `${block} / ${floor} / ${no}`;
}

function isRequiredFormValid(form: UnitForm) {
    return Boolean(
        form.street.trim() &&
            form.buildingNo.trim() &&
            form.blockName.trim() &&
            form.unitNumber.trim() &&
            form.unitType,
    );
}

function clearUnitSpecificFields(prev: UnitForm): UnitForm {
    return {
        ...prev,
        blockName: "",
        floor: "",
        unitNumber: "",
        unitType: "apartment",
        ownerFullName: "",
        ownerEmail: "",
        ownerPhone: "",
        residentFullName: "",
        residentEmail: "",
        residentPhone: "",
    };
}

export default function UnitDefinitionCreateView() {
    const theme = useTheme<Theme>();

    const [form, setForm] = useState<UnitForm>(initialForm);
    const [matchStatus, setMatchStatus] = useState<MatchStatus>("idle");
    const [selectedExisting, setSelectedExisting] = useState(false);
    const [draftUnits, setDraftUnits] = useState<DraftUnit[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSubmittingAll, setIsSubmittingAll] = useState(false);

    const canCheck = Boolean(form.blockName.trim() && form.unitNumber.trim());
    const canAddToDraft = isRequiredFormValid(form) && matchStatus !== "checking";
    const canSubmitAll = draftUnits.length > 0 && !isSubmittingAll;

    const displayName = useMemo(() => buildDisplayName(form), [form]);
    const unitTypeLabel = useMemo(() => getUnitTypeLabel(form.unitType), [form.unitType]);

    function update<K extends keyof UnitForm>(key: K, value: UnitForm[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
        setSelectedExisting(false);

        if (["blockName", "floor", "unitNumber", "unitType"].includes(String(key))) {
            setMatchStatus("idle");
        }
    }

    function handleSmartCheck() {
        if (!canCheck) return;

        setMatchStatus("checking");

        window.setTimeout(() => {
            const normalizedBlock = form.blockName.trim().toLowerCase();
            const normalizedUnit = form.unitNumber.trim().toLowerCase();
            const hasExactInDraft = draftUnits.some(
                (item) =>
                    item.blockName.trim().toLowerCase() === normalizedBlock &&
                    item.unitNumber.trim().toLowerCase() === normalizedUnit,
            );

            if (hasExactInDraft || (normalizedBlock === "a" && normalizedUnit === "12")) {
                setMatchStatus("exact");
                return;
            }

            if (normalizedBlock.includes("a") || normalizedUnit === "12") {
                setMatchStatus("similar");
                return;
            }

            setMatchStatus("new");
        }, 500);
    }

    function resetAllFormState() {
        setForm(initialForm);
        setMatchStatus("idle");
        setSelectedExisting(false);
        setEditingId(null);
    }

    function resetAfterAddKeepAddress() {
        setForm((prev) => clearUnitSpecificFields(prev));
        setMatchStatus("idle");
        setSelectedExisting(false);
        setEditingId(null);
    }

    function handleAddToDraftList() {
        if (!canAddToDraft) return;

        const item: DraftUnit = {
            ...form,
            id: editingId ?? crypto.randomUUID(),
            displayName,
            unitTypeLabel,
        };

        setDraftUnits((prev) => {
            if (editingId) {
                return prev.map((x) => (x.id === editingId ? item : x));
            }

            return [item, ...prev];
        });

        resetAfterAddKeepAddress();
    }

    function handleDeleteDraft(id: string) {
        setDraftUnits((prev) => prev.filter((x) => x.id !== id));

        if (editingId === id) {
            resetAllFormState();
        }
    }

    function handleEditDraft(item: DraftUnit) {
        setForm({
            street: item.street,
            buildingNo: item.buildingNo,
            addressNote: item.addressNote,

            blockName: item.blockName,
            floor: item.floor,
            unitNumber: item.unitNumber,
            unitType: item.unitType,

            ownerFullName: item.ownerFullName,
            ownerEmail: item.ownerEmail,
            ownerPhone: item.ownerPhone,

            residentFullName: item.residentFullName,
            residentEmail: item.residentEmail,
            residentPhone: item.residentPhone,
        });

        setEditingId(item.id);
        setMatchStatus("idle");
        setSelectedExisting(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function handleCancelEdit() {
        resetAllFormState();
    }

    async function handleSubmitAll() {
        if (!canSubmitAll) return;

        setIsSubmittingAll(true);

        try {
            const payload = {
                addressHierarchy,
                units: draftUnits.map((item) => ({
                    street: item.street,
                    buildingNo: item.buildingNo,
                    addressNote: item.addressNote,
                    blockName: item.blockName,
                    floor: item.floor,
                    unitNumber: item.unitNumber,
                    unitType: item.unitType,
                    owner: {
                        fullName: item.ownerFullName,
                        email: item.ownerEmail,
                        phone: item.ownerPhone,
                    },
                    resident: {
                        fullName: item.residentFullName,
                        email: item.residentEmail,
                        phone: item.residentPhone,
                    },
                })),
            };

            console.log("Veritabanına gönderilecek payload:", payload);

            await new Promise((resolve) => window.setTimeout(resolve, 900));

            setDraftUnits([]);
            resetAllFormState();
        } finally {
            setIsSubmittingAll(false);
        }
    }

    return (
        <Box>
            <Box
                sx={{
                    mb: 3,
                    p: { xs: 2, md: 2.5 },
                    borderRadius: 5,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                    background: `linear-gradient(135deg, ${alpha(
                        theme.palette.primary.main,
                        0.07,
                    )} 0%, ${alpha(theme.palette.success.main, 0.045)} 100%)`,
                }}
            >
                <Stack spacing={1.25}>
                    <Chip
                        label="Adres ve Bağımsız Bölüm Tanımlama"
                        size="small"
                        sx={{
                            width: "fit-content",
                            fontWeight: 800,
                            color: "primary.main",
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                        }}
                    />

                    <Typography variant="h4" fontWeight={900}>
                        Daire / Dükkan Tanımla
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        İlk adresi bir kez girin, sonra bağımsız bölümleri hızlıca art arda listeye ekleyin.
                    </Typography>
                </Stack>
            </Box>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", lg: "1.25fr 0.85fr" },
                    gap: 2,
                    alignItems: "start",
                }}
            >
                <Stack spacing={2}>
                    <SectionCard
                        title="Adres Bilgileri (Değiştirilemez)"
                        subtitle="Üst adres sabit kalır. Listeye ekleme sonrası adres alanları korunur."
                        icon={<IconMapPin size={20} />}
                    >
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                                gap: 1.25,
                            }}
                        >
                            <ReadonlyInfo label="Ülke" value={addressHierarchy.country} />
                            <ReadonlyInfo label="İl / Kanton" value={addressHierarchy.province} />
                            <ReadonlyInfo label="İlçe / Bölge" value={addressHierarchy.district} />
                            <ReadonlyInfo label="Mahalle / Köy" value={addressHierarchy.neighborhood} />
                        </Box>

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                                gap: 1.5,
                            }}
                        >
                            <TextField
                                label="Sokak / Cadde"
                                value={form.street}
                                onChange={(e) => update("street", e.target.value)}
                                placeholder="Örn: Bahnhofstrasse"
                                fullWidth
                            />

                            <TextField
                                label="Bina No"
                                value={form.buildingNo}
                                onChange={(e) => update("buildingNo", e.target.value)}
                                placeholder="Örn: 18"
                                fullWidth
                            />

                            <TextField
                                label="Blok"
                                value={form.blockName}
                                onChange={(e) => update("blockName", e.target.value)}
                                placeholder="Örn: A Blok"
                                fullWidth
                            />

                            <TextField
                                label="Kat"
                                value={form.floor}
                                onChange={(e) => update("floor", e.target.value)}
                                placeholder="Örn: 3"
                                fullWidth
                            />

                            <TextField
                                label="Kapı No"
                                value={form.unitNumber}
                                onChange={(e) => update("unitNumber", e.target.value)}
                                placeholder="Örn: 12"
                                fullWidth
                            />

                            <TextField
                                select
                                label="Tür"
                                value={form.unitType}
                                onChange={(e) => update("unitType", e.target.value as UnitType)}
                                fullWidth
                            >
                                <MenuItem value="apartment">Daire</MenuItem>
                                <MenuItem value="shop">Dükkan</MenuItem>
                                <MenuItem value="office">Ofis</MenuItem>
                            </TextField>

                            <Box sx={{ gridColumn: { xs: "1 / -1", md: "1 / -1" } }}>
                                <TextField
                                    label="Adres Notu"
                                    value={form.addressNote}
                                    onChange={(e) => update("addressNote", e.target.value)}
                                    placeholder="Opsiyonel adres notu"
                                    fullWidth
                                    multiline
                                    minRows={2}
                                />
                            </Box>
                        </Box>
                    </SectionCard>

                    <SectionCard
                        title="İletişim Bilgileri"
                        subtitle="Sahip ve oturan bilgileri taslak kayıtla birlikte saklanır."
                        icon={<IconUserCheck size={20} />}
                    >
                        <Stack spacing={2.25}>
                            <Box>
                                <Typography fontWeight={800} sx={{ mb: 1 }}>
                                    Ev Sahibi
                                </Typography>

                                <PersonFields
                                    fullName={form.ownerFullName}
                                    email={form.ownerEmail}
                                    phone={form.ownerPhone}
                                    onFullName={(value) => update("ownerFullName", value)}
                                    onEmail={(value) => update("ownerEmail", value)}
                                    onPhone={(value) => update("ownerPhone", value)}
                                />
                            </Box>

                            <Divider />

                            <Box>
                                <Typography fontWeight={800} sx={{ mb: 1 }}>
                                    Oturan / Kiracı
                                </Typography>

                                <PersonFields
                                    fullName={form.residentFullName}
                                    email={form.residentEmail}
                                    phone={form.residentPhone}
                                    onFullName={(value) => update("residentFullName", value)}
                                    onEmail={(value) => update("residentEmail", value)}
                                    onPhone={(value) => update("residentPhone", value)}
                                />
                            </Box>
                        </Stack>
                    </SectionCard>
                </Stack>

                <Stack spacing={2}>
                    <SmartCheckCard
                        status={matchStatus}
                        displayName={displayName}
                        unitTypeLabel={unitTypeLabel}
                        selectedExisting={selectedExisting}
                        canCheck={canCheck}
                        onCheck={handleSmartCheck}
                        onUseExisting={() => setSelectedExisting(true)}
                    />

                    <Card
                        variant="outlined"
                        sx={{
                            borderRadius: 4.5,
                            borderColor: alpha(theme.palette.text.primary, 0.08),
                            position: { lg: "sticky" },
                            top: { lg: 88 },
                        }}
                    >
                        <CardContent sx={{ p: 2.25 }}>
                            <Stack spacing={2}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Box
                                        sx={{
                                            width: 38,
                                            height: 38,
                                            borderRadius: 2.5,
                                            display: "grid",
                                            placeItems: "center",
                                            bgcolor: alpha(theme.palette.success.main, 0.1),
                                            color: "success.main",
                                        }}
                                    >
                                        <IconShieldCheck size={20} />
                                    </Box>

                                    <Box>
                                        <Typography fontWeight={900}>
                                            {editingId ? "Taslak Güncelle" : "Kaydetme Özeti"}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Adres alanı korunur, bağımsız bölüm alanları temizlenir.
                                        </Typography>
                                    </Box>
                                </Stack>

                                <Divider />

                                <Stack spacing={1}>
                                    <SummaryRow
                                        label="Adres"
                                        value={`${addressHierarchy.province} / ${addressHierarchy.district}`}
                                    />
                                    <SummaryRow label="Sokak / Cadde" value={form.street || "Belirtilmedi"} />
                                    <SummaryRow label="Bina No" value={form.buildingNo || "Belirtilmedi"} />
                                    <SummaryRow label="Bağımsız bölüm" value={displayName} />
                                    <SummaryRow label="Tür" value={unitTypeLabel} />
                                    <SummaryRow label="Sahip" value={form.ownerFullName || "Belirtilmedi"} />
                                    <SummaryRow label="Oturan" value={form.residentFullName || "Belirtilmedi"} />
                                    <SummaryRow label="Taslak sayısı" value={String(draftUnits.length)} />
                                </Stack>

                                {!isRequiredFormValid(form) && (
                                    <Alert severity="info" sx={{ borderRadius: 3 }}>
                                        Sokak, bina no, blok, kapı no ve tür alanları doldurulmadan listeye ekleme
                                        yapılmamalı.
                                    </Alert>
                                )}

                                <Stack spacing={1}>
                                    <Button
                                        size="large"
                                        variant="contained"
                                        disabled={!canAddToDraft}
                                        startIcon={<IconPlus size={18} />}
                                        onClick={handleAddToDraftList}
                                    >
                                        {editingId ? "Liste Kaydını Güncelle" : "Listeye Ekle"}
                                    </Button>

                                    {editingId && (
                                        <Button size="large" variant="outlined" onClick={handleCancelEdit}>
                                            Güncellemeyi İptal Et
                                        </Button>
                                    )}

                                    <Button
                                        size="large"
                                        variant="outlined"
                                        color="success"
                                        disabled={!canSubmitAll}
                                        startIcon={
                                            isSubmittingAll ? (
                                                <CircularProgress size={18} color="inherit" />
                                            ) : (
                                                <IconDatabaseExport size={18} />
                                            )
                                        }
                                        onClick={handleSubmitAll}
                                    >
                                        {isSubmittingAll
                                            ? "Veritabanına Kaydediliyor..."
                                            : `Veritabanına Kaydet (${draftUnits.length})`}
                                    </Button>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>
                </Stack>
            </Box>

            <DraftUnitsList items={draftUnits} onEdit={handleEditDraft} onDelete={handleDeleteDraft} />
        </Box>
    );
}

function SectionCard({
    title,
    subtitle,
    icon,
    children,
}: {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    const theme = useTheme<Theme>();

    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 4.5,
                borderColor: alpha(theme.palette.text.primary, 0.08),
            }}
        >
            <CardContent sx={{ p: 2.25 }}>
                <Stack spacing={2}>
                    <Stack direction="row" spacing={1} alignItems="center">
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
                            {icon}
                        </Box>

                        <Box>
                            <Typography variant="h6" fontWeight={900} lineHeight={1.15}>
                                {title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {subtitle}
                            </Typography>
                        </Box>
                    </Stack>

                    {children}
                </Stack>
            </CardContent>
        </Card>
    );
}

function ReadonlyInfo({ label, value }: { label: string; value: string }) {
    const theme = useTheme<Theme>();

    return (
        <Box
            sx={{
                p: 1.5,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
                bgcolor: alpha(theme.palette.text.primary, 0.018),
            }}
        >
            <Typography variant="caption" color="text.secondary">
                {label}
            </Typography>
            <Typography fontWeight={850}>{value}</Typography>
        </Box>
    );
}

function PersonFields({
    fullName,
    email,
    phone,
    onFullName,
    onEmail,
    onPhone,
}: {
    fullName: string;
    email: string;
    phone: string;
    onFullName: (value: string) => void;
    onEmail: (value: string) => void;
    onPhone: (value: string) => void;
}) {
    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
                gap: 1.5,
            }}
        >
            <TextField
                label="Ad Soyad"
                value={fullName}
                onChange={(e) => onFullName(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <IconUser size={18} />
                        </InputAdornment>
                    ),
                }}
                fullWidth
            />

            <TextField
                label="E-posta"
                value={email}
                onChange={(e) => onEmail(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <IconMail size={18} />
                        </InputAdornment>
                    ),
                }}
                fullWidth
            />

            <TextField
                label="Telefon"
                value={phone}
                onChange={(e) => onPhone(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <IconPhone size={18} />
                        </InputAdornment>
                    ),
                }}
                fullWidth
            />
        </Box>
    );
}

function SmartCheckCard({
    status,
    displayName,
    unitTypeLabel,
    selectedExisting,
    canCheck,
    onCheck,
    onUseExisting,
}: {
    status: MatchStatus;
    displayName: string;
    unitTypeLabel: string;
    selectedExisting: boolean;
    canCheck: boolean;
    onCheck: () => void;
    onUseExisting: () => void;
}) {
    const theme = useTheme<Theme>();

    const exact = status === "exact";
    const similar = status === "similar";
    const isNew = status === "new";
    const isChecking = status === "checking";

    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 4.5,
                borderColor: alpha(
                    exact || similar
                        ? theme.palette.warning.main
                        : isNew
                          ? theme.palette.success.main
                          : theme.palette.text.primary,
                    exact || similar || isNew ? 0.25 : 0.08,
                ),
            }}
        >
            <CardContent sx={{ p: 2.25 }}>
                <Stack spacing={2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Box
                            sx={{
                                width: 38,
                                height: 38,
                                borderRadius: 2.5,
                                display: "grid",
                                placeItems: "center",
                                bgcolor: alpha(
                                    exact || similar
                                        ? theme.palette.warning.main
                                        : isNew
                                          ? theme.palette.success.main
                                          : theme.palette.primary.main,
                                    0.1,
                                ),
                                color:
                                    exact || similar
                                        ? "warning.main"
                                        : isNew
                                          ? "success.main"
                                          : "primary.main",
                            }}
                        >
                            {exact || similar ? <IconAlertTriangle size={20} /> : <IconSearch size={20} />}
                        </Box>

                        <Box>
                            <Typography fontWeight={900}>Akıllı Kayıt Kontrolü</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Mükerrer kayıt oluşmasını önlemek için blok ve kapı numarasını kontrol eder.
                            </Typography>
                        </Box>
                    </Stack>

                    <Divider />

                    {status === "idle" && (
                        <Alert severity="info" sx={{ borderRadius: 3 }}>
                            Blok ve daire/dükkan numarasını girip kontrol başlatın.
                        </Alert>
                    )}

                    {isChecking && (
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <CircularProgress size={18} />
                            <Typography variant="body2" color="text.secondary">
                                Kayıtlar kontrol ediliyor...
                            </Typography>
                        </Stack>
                    )}

                    {exact && (
                        <Stack spacing={1.5}>
                            <Alert severity="warning" sx={{ borderRadius: 3 }}>
                                Bu bağımsız bölüm zaten sistemde var gibi görünüyor.
                            </Alert>

                            <ExistingUnitPreview title={displayName} subtitle={`${unitTypeLabel} • Mevcut kayıt`} />

                            <Button variant={selectedExisting ? "contained" : "outlined"} onClick={onUseExisting}>
                                {selectedExisting ? "Var olan kayıt seçildi" : "Var olanı kullan"}
                            </Button>
                        </Stack>
                    )}

                    {similar && (
                        <Stack spacing={1.5}>
                            <Alert severity="warning" sx={{ borderRadius: 3 }}>
                                Benzer bir kayıt bulundu. Eklemeye devam etmeden önce bilgileri kontrol edin.
                            </Alert>

                            <ExistingUnitPreview title={displayName} subtitle={`${unitTypeLabel} • Benzer kayıt`} />
                        </Stack>
                    )}

                    {isNew && (
                        <Alert severity="success" sx={{ borderRadius: 3 }}>
                            Bu bağımsız bölüm yeni görünüyor. Taslak listeye ekleyebilirsiniz.
                        </Alert>
                    )}

                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<IconChecklist size={18} />}
                        onClick={onCheck}
                        disabled={!canCheck || isChecking}
                    >
                        {isChecking ? "Kontrol Ediliyor..." : "Kontrol Başlat"}
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}

function ExistingUnitPreview({ title, subtitle }: { title: string; subtitle: string }) {
    const theme = useTheme<Theme>();

    return (
        <Box
            sx={{
                p: 1.5,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.18)}`,
                bgcolor: alpha(theme.palette.warning.main, 0.045),
            }}
        >
            <Typography fontWeight={900}>{title}</Typography>
            <Typography variant="body2" color="text.secondary">
                {subtitle}
            </Typography>
        </Box>
    );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Typography variant="body2" color="text.secondary">
                {label}
            </Typography>
            <Typography variant="body2" fontWeight={800} textAlign="right">
                {value}
            </Typography>
        </Stack>
    );
}

function DraftUnitsList({
    items,
    onEdit,
    onDelete,
}: {
    items: DraftUnit[];
    onEdit: (item: DraftUnit) => void;
    onDelete: (id: string) => void;
}) {
    const theme = useTheme<Theme>();

    return (
        <Card
            variant="outlined"
            sx={{
                mt: 3,
                borderRadius: 4.5,
                borderColor: alpha(theme.palette.text.primary, 0.08),
            }}
        >
            <CardContent sx={{ p: 2.25 }}>
                <Stack spacing={2}>
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1}
                        alignItems={{ xs: "flex-start", sm: "center" }}
                        justifyContent="space-between"
                    >
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Box
                                sx={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: 2.5,
                                    display: "grid",
                                    placeItems: "center",
                                    bgcolor: alpha(theme.palette.info.main, 0.1),
                                    color: "info.main",
                                    flexShrink: 0,
                                }}
                            >
                                <IconListDetails size={20} />
                            </Box>

                            <Box>
                                <Typography variant="h6" fontWeight={900}>
                                    Taslak Kayıt Listesi
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Listeye eklenen kayıtlar burada görünür. Veritabanına henüz gönderilmemiştir.
                                </Typography>
                            </Box>
                        </Stack>

                        <Chip
                            label={`${items.length} kayıt`}
                            sx={{
                                fontWeight: 800,
                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                                color: "primary.main",
                            }}
                        />
                    </Stack>

                    <Divider />

                    {items.length === 0 ? (
                        <Box
                            sx={{
                                py: 4,
                                px: 2,
                                borderRadius: 3,
                                border: `1px dashed ${alpha(theme.palette.text.primary, 0.14)}`,
                                bgcolor: alpha(theme.palette.text.primary, 0.018),
                                textAlign: "center",
                            }}
                        >
                            <Stack spacing={1} alignItems="center">
                                <Box
                                    sx={{
                                        width: 52,
                                        height: 52,
                                        borderRadius: 3,
                                        display: "grid",
                                        placeItems: "center",
                                        bgcolor: alpha(theme.palette.text.primary, 0.04),
                                        color: "text.secondary",
                                    }}
                                >
                                    <IconBuildingEstate size={24} />
                                </Box>

                                <Typography fontWeight={800}>Henüz taslak kayıt yok</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Formdan bağımsız bölüm ekledikçe burada kart olarak listelenecek.
                                </Typography>
                            </Stack>
                        </Box>
                    ) : (
                        <Stack spacing={1.5}>
                            {items.map((item, index) => (
                                <Box
                                    key={item.id}
                                    sx={{
                                        p: 1.75,
                                        borderRadius: 3,
                                        border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
                                        bgcolor: alpha(theme.palette.text.primary, 0.012),
                                    }}
                                >
                                    <Stack spacing={1.5}>
                                        <Stack
                                            direction={{ xs: "column", md: "row" }}
                                            spacing={1}
                                            justifyContent="space-between"
                                            alignItems={{ xs: "flex-start", md: "center" }}
                                        >
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Chip
                                                    label={`#${index + 1}`}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 800,
                                                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                                                        color: "primary.main",
                                                    }}
                                                />
                                                <Typography fontWeight={900}>{item.displayName}</Typography>
                                                <Chip
                                                    icon={<IconHome size={14} />}
                                                    label={item.unitTypeLabel}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </Stack>

                                            <Stack direction="row" spacing={1}>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<IconEdit size={16} />}
                                                    onClick={() => onEdit(item)}
                                                >
                                                    Düzenle
                                                </Button>
                                                <Button
                                                    size="small"
                                                    color="error"
                                                    variant="outlined"
                                                    startIcon={<IconTrash size={16} />}
                                                    onClick={() => onDelete(item.id)}
                                                >
                                                    Sil
                                                </Button>
                                            </Stack>
                                        </Stack>

                                        <Box
                                            sx={{
                                                display: "grid",
                                                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
                                                gap: 1.25,
                                            }}
                                        >
                                            <InfoMini
                                                label="Adres"
                                                value={`${item.street || "Belirtilmedi"} ${item.buildingNo || ""}`.trim()}
                                            />
                                            <InfoMini label="Sahip" value={item.ownerFullName || "Belirtilmedi"} />
                                            <InfoMini
                                                label="Oturan / Kiracı"
                                                value={item.residentFullName || "Belirtilmedi"}
                                            />
                                            <InfoMini label="Tür" value={item.unitTypeLabel} />
                                            <InfoMini
                                                label="Adres Notu"
                                                value={item.addressNote || "Belirtilmedi"}
                                            />
                                        </Box>
                                    </Stack>
                                </Box>
                            ))}
                        </Stack>
                    )}

                    <Alert severity="info" icon={<IconInfoCircle size={18} />} sx={{ borderRadius: 3 }}>
                        Bu alan geçici taslak listedir. Nihai kayıt için sağdaki “Veritabanına Kaydet” butonu
                        kullanılmalıdır.
                    </Alert>
                </Stack>
            </CardContent>
        </Card>
    );
}

function InfoMini({ label, value }: { label: string; value: string }) {
    const theme = useTheme<Theme>();

    return (
        <Box
            sx={{
                p: 1.25,
                borderRadius: 2.5,
                border: `1px solid ${alpha(theme.palette.text.primary, 0.07)}`,
                bgcolor: alpha(theme.palette.background.paper, 0.65),
            }}
        >
            <Typography variant="caption" color="text.secondary">
                {label}
            </Typography>
            <Typography variant="body2" fontWeight={800}>
                {value}
            </Typography>
        </Box>
    );
}