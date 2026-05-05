//bu dosya, muhasebe dönemleri oluşturma ve yönetme görünümünü içerir. Kullanıcılar yeni muhasebe dönemi oluşturabilir, mevcut dönemleri görüntüleyebilir ve düzenleyebilir. Her dönem için ad, başlangıç tarihi, bitiş tarihi, son ödeme tarihi ve durum gibi bilgileri girebilirler. Oluşturulan dönemler listelenir ve durumlarına göre filtrelenebilir. Ayrıca, oluşturulan dönemin aktif hale gelmesi için gerekli işlemler yapılır.
//src/modules/muhasebe/views/MuhasebePeriodsSetupView.tsx
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
import { IconCalendarStats, IconPlus } from "@tabler/icons-react";
import { setMuhasebeMockSetupStatus } from "../utils/muhasebeMockSetupStorage";

type PeriodStatus = "draft" | "published" | "closed" | "cancelled";

type AccountingPeriod = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  dueDate: string;
  status: PeriodStatus;
};

const mockPeriods: AccountingPeriod[] = [];

export default function MuhasebePeriodsSetupView() {
  const theme = useTheme();
  const router = useRouter();

  const [periods] = useState<AccountingPeriod[]>(mockPeriods);
  const [showForm, setShowForm] = useState(true);

  const [form, setForm] = useState({
    name: "Mayıs 2026 Aidat Dönemi",
    startDate: "2026-05-01",
    endDate: "2026-05-31",
    dueDate: "2026-05-31",
    status: "draft" as PeriodStatus,
  });

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack spacing={1} mb={3}>
        <Typography variant="h5" fontWeight={800}>
          Muhasebe Dönemi Oluşturma
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Aidat, tahsilat ve giderlerin hangi dönem içinde takip edileceğini belirleyin.
        </Typography>
      </Stack>

      <Stack spacing={2}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
          }}
        >
          <CardContent>
            <Stack spacing={1.25}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography fontWeight={800}>Dönemler</Typography>

                <Button
                  startIcon={<IconPlus size={16} />}
                  variant="contained"
                  onClick={() => setShowForm(true)}
                >
                  Yeni Dönem
                </Button>
              </Stack>

              {periods.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Henüz muhasebe dönemi oluşturulmadı.
                </Typography>
              ) : (
                periods.map((period) => (
                  <Stack
                    key={period.id}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                      p: 1.5,
                      borderRadius: 2.5,
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                    }}
                  >
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: 2,
                          display: "grid",
                          placeItems: "center",
                          color: theme.palette.primary.main,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                        }}
                      >
                        <IconCalendarStats size={18} />
                      </Box>

                      <Box>
                        <Typography fontWeight={700}>{period.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {period.startDate} - {period.endDate}
                        </Typography>
                      </Box>
                    </Stack>

                    <Typography fontWeight={800}>{period.status}</Typography>
                  </Stack>
                ))
              )}
            </Stack>
          </CardContent>
        </Card>

        {showForm && (
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
            }}
          >
            <CardContent>
              <Stack spacing={2}>
                <Typography fontWeight={800}>Yeni Muhasebe Dönemi</Typography>

                <TextField
                  label="Dönem Adı"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />

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
                    label="Başlangıç Tarihi"
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />

                  <TextField
                    label="Bitiş Tarihi"
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
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
                  select
                  label="Dönem Durumu"
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value as PeriodStatus })
                  }
                >
                  <MenuItem value="draft">Taslak</MenuItem>
                  <MenuItem value="published">Yayınlandı</MenuItem>
                </TextField>

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    onClick={() => {
                      setMuhasebeMockSetupStatus({ hasActivePeriod: true });
                      router.push("/muhasebe/setup");
                    }}
                  >
                    Kaydet
                  </Button>

                  <Button onClick={() => router.push("/muhasebe/setup")}>
                    İptal
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Box>
  );
}