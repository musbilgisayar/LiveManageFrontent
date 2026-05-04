"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  alpha,
  Box,
  Button,
  Chip,
  InputAdornment,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import {
  IconArrowLeft,
  IconChevronRight,
  IconLayoutGrid,
  IconList,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";
import type {
  AuthorizedProperty,
  PropertyUnit,
  PropertyUnitForm,
} from "../types/PropertyUnit.types";
import {
  authorizedPropertiesMock,
  propertyUnitsMock,
} from "../data/propertyUnit.mock";
import {
  emptyPropertyUnitForm,
  getUnitTypeLabel,
  isPropertyUnitFormValid,
} from "../utils/propertyUnit.helpers";
import PropertyUnitGrid from "../components/units/PropertyUnitGrid";
import PropertyUnitTable from "../components/units/PropertyUnitTable";
import PropertyUnitEmptyState from "../components/units/PropertyUnitEmptyState";
import PropertyUnitUpsertDialog from "../components/units/PropertyUnitUpsertDialog";

export default function PropertyUnitsView({ propertyId }: { propertyId: string }) {
  const theme = useTheme<Theme>();
  const router = useRouter();

  const [view, setView] = useState<"grid" | "table">("grid");
  const [search, setSearch] = useState("");

  const [authorizedProperties] = useState<AuthorizedProperty[]>(authorizedPropertiesMock);
  const [selectedProperty, setSelectedProperty] = useState<AuthorizedProperty | null>(null);

  const [units, setUnits] = useState<PropertyUnit[]>(propertyUnitsMock);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [form, setForm] = useState<PropertyUnitForm>(emptyPropertyUnitForm);

  const visibleUnits = useMemo(() => {
    return units;
  }, [units]);

  const filteredUnits = useMemo(() => {
    return visibleUnits.filter((unit) =>
      `${unit.blockName} ${unit.floor} ${unit.unitNumber} ${unit.ownerFullName} ${
        unit.residentFullName
      } ${getUnitTypeLabel(unit.unitType)}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  }, [visibleUnits, search]);

  const total = filteredUnits.length;
  const occupied = filteredUnits.filter((item) => item.status === "occupied").length;
  const vacant = filteredUnits.filter((item) => item.status === "vacant").length;

  const duplicateExists = selectedProperty
    ? units.some(
        (item) =>
          item.id !== editingUnitId &&
          item.propertyId === selectedProperty.id &&
          item.blockName.trim().toLowerCase() === form.blockName.trim().toLowerCase() &&
          item.unitNumber.trim().toLowerCase() === form.unitNumber.trim().toLowerCase(),
      )
    : false;

  function updateForm<K extends keyof PropertyUnitForm>(
    key: K,
    value: PropertyUnitForm[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function openCreateDialog() {
    setEditingUnitId(null);
    setSelectedProperty(null);
    setForm(emptyPropertyUnitForm);
    setDialogOpen(true);
  }

  function openEditDialog(unit: PropertyUnit) {
    const property =
      authorizedProperties.find((item) => item.id === unit.propertyId) ?? null;

    setSelectedProperty(property);
    setEditingUnitId(unit.id);

    setForm({
      blockName: unit.blockName,
      floor: unit.floor,
      unitNumber: unit.unitNumber,
      unitType: unit.unitType,

      ownerFullName: unit.ownerFullName,
      ownerEmail: unit.ownerEmail,
      ownerPhone: unit.ownerPhone,

      residentFullName: unit.residentFullName,
      residentEmail: unit.residentEmail,
      residentPhone: unit.residentPhone,
    });

    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingUnitId(null);
    setSelectedProperty(null);
    setForm(emptyPropertyUnitForm);
  }

  function saveUnit() {
    if (!selectedProperty || !isPropertyUnitFormValid(form) || duplicateExists) return;

    if (editingUnitId) {
      setUnits((prev) =>
        prev.map((item) =>
          item.id === editingUnitId
            ? {
                ...item,
                propertyId: selectedProperty.id,
                ...form,
                status: form.residentFullName.trim() ? "occupied" : "vacant",
                rentStatus: form.residentFullName.trim() ? "Düzenli" : "Boş",
                duesStatus: form.residentFullName.trim() ? "Ödendi" : "-",
              }
            : item,
        ),
      );

      closeDialog();
      return;
    }

    const newUnit: PropertyUnit = {
      id: crypto.randomUUID(),
      propertyId: selectedProperty.id,
      ...form,
      status: form.residentFullName.trim() ? "occupied" : "vacant",
      rentStatus: form.residentFullName.trim() ? "Düzenli" : "Boş",
      duesStatus: form.residentFullName.trim() ? "Ödendi" : "-",
    };

    setUnits((prev) => [newUnit, ...prev]);
    closeDialog();
  }

  function deleteUnit(unitId: string) {
    setUnits((prev) => prev.filter((item) => item.id !== unitId));
  }

  return (
    <Box>
      <Stack spacing={2.25} mb={3}>
        <Box
          sx={{
            p: { xs: 2, md: 2.5 },
            borderRadius: 5,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
            background: `linear-gradient(135deg, ${alpha(
              theme.palette.primary.main,
              0.07,
            )} 0%, ${alpha(theme.palette.success.main, 0.045)} 100%)`,
          }}
        >
          <Stack spacing={2}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
            >
              <Button
                size="small"
                variant="outlined"
                startIcon={<IconArrowLeft size={17} />}
                onClick={() => router.back()}
                sx={{
                  borderRadius: 999,
                  fontWeight: 800,
                  bgcolor: alpha(theme.palette.background.paper, 0.65),
                }}
              >
                Geri
              </Button>

              <BreadcrumbText label="Gayrimenkul Yönetimi" />
              <IconChevronRight size={15} color={theme.palette.text.secondary} />

              <BreadcrumbText label="Site / Apartmanlar" />
              <IconChevronRight size={15} color={theme.palette.text.secondary} />

              <BreadcrumbText label="Bağımsız Bölümler" active />
            </Stack>

            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
            >
              <Box>
                <Chip
                  size="small"
                  label="Bağımsız Bölüm Yönetimi"
                  sx={{
                    mb: 1,
                    fontWeight: 800,
                    color: "primary.main",
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  }}
                />

                <Typography variant="h5" fontWeight={900}>
                  Daire / Dükkan / Ofis Yönetimi
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Yeni kayıt oluştururken önce yetkili site seçilir, sonra blok ve bağımsız bölüm bilgileri girilir.
                </Typography>
              </Box>

              <Button
                variant="contained"
                startIcon={<IconPlus size={18} />}
                onClick={openCreateDialog}
              >
                Yeni Bağımsız Bölüm
              </Button>
            </Stack>
          </Stack>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip label={`Toplam: ${total}`} />
          <Chip color="success" label={`Dolu: ${occupied}`} />
          <Chip color="warning" label={`Boş: ${vacant}`} />
        </Stack>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          alignItems={{ xs: "stretch", md: "center" }}
          justifyContent="space-between"
        >
          <TextField
            size="small"
            placeholder="Blok, kapı no, malik veya kiracı ara..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{ minWidth: { md: 420 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconSearch size={16} />
                </InputAdornment>
              ),
            }}
          />

          <ToggleButtonGroup
            size="small"
            value={view}
            exclusive
            onChange={(_, value) => value && setView(value)}
          >
            <ToggleButton value="grid">
              <IconLayoutGrid size={16} />
            </ToggleButton>

            <ToggleButton value="table">
              <IconList size={16} />
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>

      {filteredUnits.length === 0 ? (
        <PropertyUnitEmptyState onCreate={openCreateDialog} />
      ) : view === "grid" ? (
        <PropertyUnitGrid
          units={filteredUnits}
          propertyId={propertyId}
          onEdit={openEditDialog}
          onDelete={deleteUnit}
        />
      ) : (
        <PropertyUnitTable
          units={filteredUnits}
          propertyId={propertyId}
          onEdit={openEditDialog}
          onDelete={deleteUnit}
        />
      )}

      <PropertyUnitUpsertDialog
        open={dialogOpen}
        properties={authorizedProperties}
        selectedProperty={selectedProperty}
        onSelectProperty={setSelectedProperty}
        form={form}
        editing={Boolean(editingUnitId)}
        duplicateExists={duplicateExists}
        canSave={Boolean(selectedProperty) && isPropertyUnitFormValid(form) && !duplicateExists}
        onClose={closeDialog}
        onSave={saveUnit}
        onChange={updateForm}
      />
    </Box>
  );
}

function BreadcrumbText({
  label,
  active,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <Typography
      variant="body2"
      fontWeight={active ? 900 : 750}
      color={active ? "primary.main" : "text.secondary"}
      sx={{
        cursor: active ? "default" : "pointer",
        "&:hover": {
          color: active ? "primary.main" : "text.primary",
        },
      }}
    >
      {label}
    </Typography>
  );
}