//bu dosya, muhasebe tanımlamaları için temel bir rehber görünümü içerir. Kullanıcılar, muhasebe işlemlerine başlamadan önce gerekli tanımlamaları tamamlamak için bu görünümü kullanabilirler. Kasa/banka hesabı oluşturma, muhasebe dönemi oluşturma ve aidat/borçlandırma işlemleri gibi temel adımlar bu görünümde sunulur. Her adımın tamamlanma durumu gösterilir ve kullanıcılar eksik adımları tamamlamak için yönlendirilir. Ayrıca, mock tanımlamaları sıfırlama seçeneği de sunulur.
// src/modules/muhasebe/views/MuhasebeTanımlamaView.tsx
"use client";

import React, { useState } from "react";
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import {
  IconBuildingBank,
  IconCalendarStats,
  IconCircleCheck,
  IconReceipt2,
} from "@tabler/icons-react";
import { useMuhasebeSetupStatus } from "../hooks/useMuhasebeSetupStatus";

import {
  resetMuhasebeMockSetupStatus,
  setMuhasebeMockSetupStatus,
} from "../utils/muhasebeMockSetupStorage";

type DialogType = "cash" | "period" | "charge" | null;

export default function MuhasebeTanımlamaView() {
  const theme = useTheme();

  const propertyId = "demo-property-a";
  const { data, refresh } = useMuhasebeSetupStatus(propertyId);

  const status = data ?? {
    hasCashAccount: false,
    hasActivePeriod: false,
    hasCharges: false,
  };

  const [openDialog, setOpenDialog] = useState<DialogType>(null);

  const closeDialog = () => setOpenDialog(null);

  const completeCash = async () => {
    setMuhasebeMockSetupStatus({ hasCashAccount: true });
    closeDialog();
    await refresh();
  };

  const completePeriod = async () => {
    setMuhasebeMockSetupStatus({ hasActivePeriod: true });
    closeDialog();
    await refresh();
  };

  const completeCharge = async () => {
    setMuhasebeMockSetupStatus({ hasCharges: true });
    closeDialog();
    await refresh();
  };

  return (
   <Box sx={{ p: 0 }}>
      <Stack spacing={1} mb={3}>
        <Typography variant="h5" fontWeight={800}>
          Muhasebe Tanımlamaları
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Muhasebe işlemlerine başlamadan önce gerekli temel tanımlamaları tamamlayın.
        </Typography>

        <Button
  variant="outlined"
  size="small"
  onClick={async () => {
    resetMuhasebeMockSetupStatus();
    await refresh();
  }}
  sx={{ alignSelf: "flex-start", borderRadius: 2.5 }}
>
  Mock Tanımlamaları Sıfırla
</Button>

      </Stack>

      <Stack spacing={2}>
        <SetupCard
          icon={<IconBuildingBank />}
          title="Kasa / Banka Tanımla"
          description="Ödeme ve gider hareketleri için en az bir hesap oluşturun."
          completed={status.hasCashAccount}
          buttonText="Hesap Oluştur"
          onClick={() => setOpenDialog("cash")}
        />

        <SetupCard
          icon={<IconCalendarStats />}
          title="Muhasebe Dönemi Oluştur"
          description="Aidat ve giderlerin işleneceği aktif dönemi oluşturun."
          completed={status.hasActivePeriod}
          disabled={!status.hasCashAccount}
          disabledText="Önce kasa/banka oluştur"
          buttonText="Dönem Oluştur"
          onClick={() => setOpenDialog("period")}
        />

        <SetupCard
          icon={<IconReceipt2 />}
          title="Aidat / Borçlandırma"
          description="Seçili dönem için bağımsız bölümlere aidat borcu oluşturun."
          completed={status.hasCharges}
          disabled={!status.hasActivePeriod}
          disabledText="Önce dönem oluştur"
          buttonText="Aidat Oluştur"
          onClick={() => setOpenDialog("charge")}
        />
      </Stack>

      <Dialog open={openDialog === "cash"} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>Kasa / Banka Hesabı Oluştur</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Hesap Adı" defaultValue="Banka Hesabı" />
            <TextField select label="Hesap Türü" defaultValue="bank">
              <MenuItem value="cash">Nakit</MenuItem>
              <MenuItem value="bank">Banka</MenuItem>
              <MenuItem value="postfinance">PostFinance</MenuItem>
              <MenuItem value="twint">TWINT</MenuItem>
            </TextField>
            <TextField label="Başlangıç Bakiyesi" defaultValue="0" />
            <TextField label="Para Birimi" defaultValue="CHF" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>İptal</Button>
          <Button variant="contained" onClick={completeCash}>
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog === "period"} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>Muhasebe Dönemi Oluştur</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Dönem Adı" defaultValue="Mayıs 2026 Aidat Dönemi" />
            <TextField label="Başlangıç Tarihi" type="date" defaultValue="2026-05-01" InputLabelProps={{ shrink: true }} />
            <TextField label="Bitiş Tarihi" type="date" defaultValue="2026-05-31" InputLabelProps={{ shrink: true }} />
            <TextField label="Son Ödeme Tarihi" type="date" defaultValue="2026-05-31" InputLabelProps={{ shrink: true }} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>İptal</Button>
          <Button variant="contained" onClick={completePeriod}>
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog === "charge"} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>Aidat / Borçlandırma Oluştur</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Borçlandırma Başlığı" defaultValue="Mayıs 2026 Aidatı" />
            <TextField select label="Uygulama Şekli" defaultValue="all">
              <MenuItem value="all">Tüm aktif daireler</MenuItem>
              <MenuItem value="selected">Seçili daireler</MenuItem>
            </TextField>
            <TextField label="Daire Başına Tutar" defaultValue="250" />
            <TextField label="Para Birimi" defaultValue="CHF" />
            <TextField label="Son Ödeme Tarihi" type="date" defaultValue="2026-05-31" InputLabelProps={{ shrink: true }} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>İptal</Button>
          <Button variant="contained" onClick={completeCharge}>
            Tahakkuk Oluştur
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function SetupCard({
  icon,
  title,
  description,
  completed,
  disabled,
  disabledText,
  buttonText,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  completed: boolean;
  disabled?: boolean;
  disabledText?: string;
  buttonText: string;
  onClick: () => void;
}) {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
      }}
    >
      <CardContent>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "center" }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2.5,
                display: "grid",
                placeItems: "center",
                color: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              }}
            >
              {icon}
            </Box>

            <Box>
              <Typography fontWeight={800}>{title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            </Box>
          </Stack>

          {completed ? (
            <Chip
              color="success"
              icon={<IconCircleCheck size={16} />}
              label="Tamamlandı"
            />
          ) : (
            <Button variant="contained" disabled={disabled} onClick={onClick}>
              {disabled ? disabledText : buttonText}
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}