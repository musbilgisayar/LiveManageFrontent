"use client";

import React from "react";
import {
  Alert,
  alpha,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import {
  IconArrowLeft,
  IconBuildingEstate,
  IconDeviceFloppy,
  IconInfoCircle,
  IconMapPin,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import type {
  AuthorizedProperty,
  PropertyUnitForm,
  UnitType,
} from "../../types/PropertyUnit.types";

type Props = {
  open: boolean;
  properties: AuthorizedProperty[];
  selectedProperty: AuthorizedProperty | null;
  onSelectProperty: (property: AuthorizedProperty | null) => void;

  form: PropertyUnitForm;
  editing: boolean;
  duplicateExists: boolean;
  canSave: boolean;

  onClose: () => void;
  onSave: () => void;
  onChange: <K extends keyof PropertyUnitForm>(
    key: K,
    value: PropertyUnitForm[K],
  ) => void;
};

export default function PropertyUnitUpsertDialog({
  open,
  properties,
  selectedProperty,
  onSelectProperty,
  form,
  editing,
  duplicateExists,
  canSave,
  onClose,
  onSave,
  onChange,
}: Props) {
  const step = selectedProperty ? 2 : 1;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ pb: 1.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h6" fontWeight={900}>
              {editing
                ? "Bağımsız Bölüm Güncelle"
                : step === 1
                  ? "Site Seçimi"
                  : `${selectedProperty?.name} içine yeni bağımsız bölüm`}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {step === 1
                ? "Önce bağımsız bölümün ekleneceği yetkili siteyi seçin."
                : `${selectedProperty?.district ?? "-"} · ${
                    selectedProperty?.province ?? "-"
                  }`}
            </Typography>
          </Box>

          <IconButton onClick={onClose}>
            <IconX size={19} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {step === 1 ? (
          <SiteSelectionStep
            properties={properties}
            onSelectProperty={onSelectProperty}
          />
        ) : (
          <UnitFormStep
            property={selectedProperty}
            form={form}
            duplicateExists={duplicateExists}
            onBack={() => {
              if (!editing) onSelectProperty(null);
            }}
            editing={editing}
            onChange={onChange}
          />
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {step === 2 && !editing && (
          <Button
            variant="outlined"
            startIcon={<IconArrowLeft size={18} />}
            onClick={() => onSelectProperty(null)}
          >
            Site Seçimine Dön
          </Button>
        )}

        <Box sx={{ flex: 1 }} />

        <Button variant="outlined" onClick={onClose}>
          Vazgeç
        </Button>

        {step === 2 && (
          <Button
            variant="contained"
            startIcon={<IconDeviceFloppy size={18} />}
            disabled={!canSave}
            onClick={onSave}
          >
            {editing ? "Bağımsız Bölümü Güncelle" : "Bağımsız Bölümü Kaydet"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

function SiteSelectionStep({
  properties,
  onSelectProperty,
}: {
  properties: AuthorizedProperty[];
  onSelectProperty: (property: AuthorizedProperty) => void;
}) {
  const theme = useTheme<Theme>();

  return (
    <Stack spacing={2.25}>
      <Box
        sx={{
          p: 2.25,
          borderRadius: 4,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
          bgcolor: alpha(theme.palette.primary.main, 0.035),
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2.75,
              display: "grid",
              placeItems: "center",
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              color: "primary.main",
              flexShrink: 0,
            }}
          >
            <IconBuildingEstate size={22} />
          </Box>

          <Box>
            <Typography fontWeight={900}>Yetkili site seçimi</Typography>
            <Typography variant="body2" color="text.secondary">
              Liste sadece kullanıcının işlem yapmaya yetkili olduğu site/apartmanları gösterir.
            </Typography>
          </Box>
        </Stack>
      </Box>

      <TextField
        select
        fullWidth
        label="Site / Apartman"
        defaultValue=""
        onChange={(event) => {
          const selected = properties.find((item) => item.id === event.target.value);
          if (selected) onSelectProperty(selected);
        }}
      >
        {properties.map((property) => (
          <MenuItem key={property.id} value={property.id}>
            {property.name} - {property.district} - {property.province}
          </MenuItem>
        ))}
      </TextField>

      <Alert severity="info" icon={<IconInfoCircle size={18} />} sx={{ borderRadius: 3 }}>
        Site seçildikten sonra blok, kat, kapı numarası ve kişi bilgileri girilir.
      </Alert>
    </Stack>
  );
}

function UnitFormStep({
  property,
  form,
  duplicateExists,
  editing,
  onBack,
  onChange,
}: {
  property: AuthorizedProperty | null;
  form: PropertyUnitForm;
  duplicateExists: boolean;
  editing: boolean;
  onBack: () => void;
  onChange: <K extends keyof PropertyUnitForm>(
    key: K,
    value: PropertyUnitForm[K],
  ) => void;
}) {
  return (
    <Stack spacing={2.25}>
      <SelectedPropertyInfo property={property} editing={editing} onBack={onBack} />

      <SectionTitle
        title="Bağımsız Bölüm Bilgileri"
        subtitle="Blok ve kapı numarası aynı site içinde mükerrer olamaz."
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 1.5,
        }}
      >
        <TextField
          label="Blok"
          value={form.blockName}
          onChange={(e) => onChange("blockName", e.target.value)}
          placeholder="Örn: A Blok"
          fullWidth
          required
        />

        <TextField
          select
          label="Kat"
          value={form.floor}
          onChange={(e) => onChange("floor", e.target.value)}
          fullWidth
        >
          <MenuItem value="">Belirtilmedi</MenuItem>
          <MenuItem value="Bodrum">Bodrum</MenuItem>
          <MenuItem value="Zemin">Zemin</MenuItem>
          {Array.from({ length: 40 }, (_, index) => index + 1).map((floor) => (
            <MenuItem key={floor} value={String(floor)}>
              {floor}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Kapı No"
          value={form.unitNumber}
          onChange={(e) => onChange("unitNumber", e.target.value)}
          placeholder="Örn: 12"
          fullWidth
          required
          error={duplicateExists}
          helperText={
            duplicateExists
              ? "Bu blok ve kapı numarası seçili site altında zaten kayıtlı."
              : " "
          }
        />

        <TextField
          select
          label="Tür"
          value={form.unitType}
          onChange={(e) => onChange("unitType", e.target.value as UnitType)}
          fullWidth
        >
          <MenuItem value="apartment">Daire</MenuItem>
          <MenuItem value="shop">Dükkan</MenuItem>
          <MenuItem value="office">Ofis</MenuItem>
        </TextField>
      </Box>

      <Divider />

      <SectionTitle
        title="İletişim Bilgileri"
        subtitle="Malik ve oturan bilgileri bağımsız bölüm kaydıyla birlikte saklanır."
      />

      <Stack spacing={2}>
        <Box>
          <Typography fontWeight={850} sx={{ mb: 1 }}>
            Ev Sahibi
          </Typography>

          <PersonFields
            fullName={form.ownerFullName}
            email={form.ownerEmail}
            phone={form.ownerPhone}
            onFullName={(value) => onChange("ownerFullName", value)}
            onEmail={(value) => onChange("ownerEmail", value)}
            onPhone={(value) => onChange("ownerPhone", value)}
          />
        </Box>

        <Box>
          <Typography fontWeight={850} sx={{ mb: 1 }}>
            Oturan / Kiracı
          </Typography>

          <PersonFields
            fullName={form.residentFullName}
            email={form.residentEmail}
            phone={form.residentPhone}
            onFullName={(value) => onChange("residentFullName", value)}
            onEmail={(value) => onChange("residentEmail", value)}
            onPhone={(value) => onChange("residentPhone", value)}
          />
        </Box>
      </Stack>

      <Alert severity="info" icon={<IconInfoCircle size={18} />} sx={{ borderRadius: 3 }}>
        Backend tarafında Tenant + PropertyId + BlockName + UnitNumber benzersiz kontrolü yapılmalı.
      </Alert>
    </Stack>
  );
}

function SelectedPropertyInfo({
  property,
  editing,
  onBack,
}: {
  property: AuthorizedProperty | null;
  editing: boolean;
  onBack: () => void;
}) {
  const theme = useTheme<Theme>();

  return (
    <Box
      sx={{
        p: 1.75,
        borderRadius: 3.5,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
        bgcolor: alpha(theme.palette.primary.main, 0.035),
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.25}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
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
            <IconMapPin size={20} />
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={800}>
              Seçili site
            </Typography>

            <Typography fontWeight={900}>{property?.name ?? "-"}</Typography>

            <Typography variant="body2" color="text.secondary">
              {property?.district ?? "-"} · {property?.province ?? "-"}
            </Typography>
          </Box>
        </Stack>

        {!editing && (
          <Button size="small" variant="outlined" onClick={onBack}>
            Değiştir
          </Button>
        )}
      </Stack>
    </Box>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <Box>
      <Typography fontWeight={900}>{title}</Typography>
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
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
        fullWidth
      />

      <TextField
        label="Telefon"
        value={phone}
        onChange={(e) => onPhone(e.target.value)}
        fullWidth
      />
    </Box>
  );
}