"use client";

 
import { Box, Card, MenuItem, Stack, TextField, Typography } from "@mui/material";
import {
  IconBuildingCommunity,
  IconMailCheck,
  IconPhoneCheck,
  IconUserShield,
} from "@tabler/icons-react";

import SectionCard from "./shared/SectionCard";
import SelectionCard from "./shared/SelectionCard";
import VerificationBadge from "./shared/VerificationBadge";
import {
  premiumFieldSx,
  representationOptions,
  structureOptions,
} from "./constants";
import type {
  ManagementApplicationFormErrors as FormErrors,
  ManagementApplicationFormState as FormState,
  RepresentationType,
} from "../../types/managementApplication.types";

 type BasicStepProps = {
  form: FormState;
  errors: FormErrors;
  applicantFullName: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  onPatch: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
};
export default function BasicStep({
  form,
  errors,
  applicantFullName,
  isEmailVerified,
  isPhoneVerified,
  onPatch,
}: BasicStepProps) {
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

<Card
  variant="outlined"
  sx={{
    borderRadius: 3,
    p: 2,
    bgcolor: "background.paper",
  }}
>
  <Stack spacing={0.5}>
    <Typography variant="caption" color="text.secondary" fontWeight={800}>
      Başvuran
    </Typography>

    <Typography fontWeight={900} fontSize={15}>
      {applicantFullName || "Hesap bilgisi yükleniyor..."}
    </Typography>

    <Typography variant="body2" color="text.secondary">
      Başvuru, oturum açmış kullanıcı hesabınız üzerinden oluşturulacaktır.
    </Typography>
  </Stack>
</Card>

          <TextField
            label="Kimlik / Vergi / Kayıt Numarası"
            value={form.taxOrIdentityNumber}
            onChange={(event) => onPatch("taxOrIdentityNumber", event.target.value)}
            error={!!errors.taxOrIdentityNumber}
            helperText={
              errors.taxOrIdentityNumber ?? "Gerçek kişi, şirket veya kurum numarası"
            }
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