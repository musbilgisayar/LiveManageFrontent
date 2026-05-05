//bu sayfa, muhasebe modülü için bir tahakkuk (charge) oluşturma formu içerir. Kullanıcı, dönem adı, borçlandırma başlığı, uygulama şekli, tutar, para birimi, son ödeme tarihi ve açıklama gibi bilgileri girebilir. Form gönderildiğinde, mock setup durumunu günceller ve kullanıcıyı muhasebe ana sayfasına yönlendirir.
//src/modules/muhasebe/views/MuhasebeChargesSetupView.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { IconReceipt2 } from "@tabler/icons-react";
import { setMuhasebeMockSetupStatus } from "../utils/muhasebeMockSetupStorage";

type ChargeMode = "all-units" | "selected-units";

export default function MuhasebeChargesSetupView() {
  const theme = useTheme();
  const router = useRouter();

  const [form, setForm] = useState({
    periodName: "Mayıs 2026 Aidat Dönemi",
    chargeTitle: "Mayıs 2026 Aidatı",
    mode: "all-units" as ChargeMode,
    amount: "250",
    currency: "CHF",
    dueDate: "2026-05-31",
    description: "Mayıs ayı ortak gider aidatı",
  });

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack spacing={1} mb={3}>
        <Typography variant="h5" fontWeight={800}>
          Aidat / Borçlandırma Oluştur
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Seçili dönem için bağımsız bölümlere aidat borcu oluşturun.
        </Typography>
      </Stack>

      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
        }}
      >
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 2.5,
                  display: "grid",
                  placeItems: "center",
                  color: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                }}
              >
                <IconReceipt2 size={20} />
              </Box>

              <Box>
                <Typography fontWeight={800}>Yeni Tahakkuk</Typography>
                <Typography variant="caption" color="text.secondary">
                  Bu işlem dairelere borç yazar. Ödeme kaydı değildir.
                </Typography>
              </Box>
            </Stack>

            <TextField
              label="Dönem"
              value={form.periodName}
              disabled
            />

            <TextField
              label="Borçlandırma Başlığı"
              value={form.chargeTitle}
              onChange={(e) => setForm({ ...form, chargeTitle: e.target.value })}
            />

            <TextField
              select
              label="Uygulama Şekli"
              value={form.mode}
              onChange={(e) =>
                setForm({ ...form, mode: e.target.value as ChargeMode })
              }
            >
              <MenuItem value="all-units">Tüm aktif daireler</MenuItem>
              <MenuItem value="selected-units">Seçili daireler</MenuItem>
            </TextField>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "1fr 1fr 1fr",
                },
                gap: 2,
              }}
            >
              <TextField
                label="Daire Başına Tutar"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />

              <TextField
                label="Para Birimi"
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
              />

              <TextField
                label="Son Ödeme Tarihi"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <TextField
              label="Açıklama"
              multiline
              minRows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                onClick={() => {
                 setMuhasebeMockSetupStatus({ hasCharges: true });
router.push("/muhasebe");
                }}
              >
                Tahakkuk Oluştur
              </Button>

              <Button onClick={() => router.push("/muhasebe/setup")}>
                İptal
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}