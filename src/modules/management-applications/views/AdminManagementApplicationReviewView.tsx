// src/modules/management-applications/views/AdminManagementApplicationReviewView.tsx
"use client";

import React, { useMemo, useState } from "react";
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import {
  IconArrowRight,
  IconCheck,
  IconFileDescription,
  IconMessageCircle,
  IconShieldCheck,
  IconUserCheck,
  IconX,
} from "@tabler/icons-react";

type ApplicationStatus = "pending" | "needs_revision" | "approved" | "rejected";
type ApplicationType = "existing_property_authority" | "new_property_request";
type RequestedRole =
  | "property_manager"
  | "finance_manager"
  | "operations_manager"
  | "full_admin";

type ApplicationItem = {
  id: string;
  applicantName: string;
  applicantEmail: string;
  applicationType: ApplicationType;
  requestedRole: RequestedRole;
  propertyName: string;
  location: string;
  description: string;
  status: ApplicationStatus;
  createdAt: string;
  documents: { id: string; name: string; kind: string }[];
};

const requestedRoleOptions: {
  value: RequestedRole;
  label: string;
}[] = [
  { value: "property_manager", label: "Yönetici" },
  { value: "finance_manager", label: "Muhasebe Yetkilisi" },
  { value: "operations_manager", label: "Operasyon Sorumlusu" },
  { value: "full_admin", label: "Tam Yetkili Yönetici" },
];

const applications: ApplicationItem[] = [
  {
    id: "APP-2026-0012",
    applicantName: "Mehmet Yılmaz",
    applicantEmail: "mehmet@example.com",
    applicationType: "new_property_request",
    requestedRole: "full_admin",
    propertyName: "Green Park Sitesi",
    location: "Zürich / Altstetten",
    description:
      "Sitenin yeni dönem yönetim yetkisi tarafıma verilmiştir. Karar evrakı ve vekalet belgesi ektedir.",
    status: "pending",
    createdAt: "02 Mayıs 2026",
    documents: [
      { id: "1", name: "Yönetim kararı.pdf", kind: "Yetki Belgesi" },
      { id: "2", name: "Vekaletname.pdf", kind: "Vekalet" },
    ],
  },
  {
    id: "APP-2026-0013",
    applicantName: "Ayşe Demir",
    applicantEmail: "ayse@example.com",
    applicationType: "existing_property_authority",
    requestedRole: "finance_manager",
    propertyName: "Mavi Bahçe Konakları",
    location: "İstanbul / Ataşehir",
    description:
      "Sitenin muhasebe süreçlerini yöneteceğim. Yetki tanımı mevcut yönetim tarafından iletildi.",
    status: "needs_revision",
    createdAt: "01 Mayıs 2026",
    documents: [{ id: "3", name: "Görevlendirme yazısı.pdf", kind: "Görevlendirme" }],
  },
];

export function AdminManagementApplicationReviewView() {
  const theme = useTheme<Theme>();
  const [selectedId, setSelectedId] = useState<string>(applications[0]?.id ?? "");
  const [reviewNote, setReviewNote] = useState("");

  const selectedApplication = useMemo<ApplicationItem>(
    () => applications.find((item) => item.id === selectedId) ?? applications[0],
    [selectedId],
  );

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: 5,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
          background: `linear-gradient(135deg,
            ${alpha(theme.palette.primary.main, 0.08)} 0%,
            ${alpha(theme.palette.warning.main, 0.04)} 100%)`,
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              label="Admin İnceleme"
              size="small"
              sx={{
                fontWeight: 800,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
              }}
            />
            <Chip
              label={`${applications.length} başvuru`}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 700 }}
            />
          </Stack>

          <Box>
            <Typography variant="h4" fontWeight={900} letterSpacing="-0.03em">
              Yönetim Başvurularını İncele
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75, maxWidth: 860 }}>
              Başvuruları değerlendir, mevcut gayrimenkulle eşleştir veya yeni
              gayrimenkul oluşturup kullanıcıya ilgili rolü ata.
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", xl: "0.88fr 1.12fr" },
          gap: 2,
          alignItems: "start",
        }}
      >
        <Card variant="outlined" sx={{ borderRadius: 4.5 }}>
          <CardContent sx={{ p: 2.25 }}>
            <Stack spacing={1.25}>
              <Typography variant="h6" fontWeight={900}>
                Başvuru Listesi
              </Typography>

              {applications.map((item) => {
                const meta = getStatusMeta(theme, item.status);

                return (
                  <Box
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    role="button"
                    tabIndex={0}
                    sx={{
                      p: 1.5,
                      borderRadius: 3.5,
                      cursor: "pointer",
                      border: `1px solid ${
                        selectedId === item.id
                          ? alpha(theme.palette.primary.main, 0.28)
                          : alpha(theme.palette.divider, 0.8)
                      }`,
                      bgcolor:
                        selectedId === item.id
                          ? alpha(theme.palette.primary.main, 0.04)
                          : alpha(theme.palette.background.paper, 0.8),
                    }}
                  >
                    <Stack spacing={0.8}>
                      <Stack direction="row" justifyContent="space-between" spacing={1}>
                        <Typography fontWeight={800}>{item.applicantName}</Typography>
                        <Chip
                          label={meta.label}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            color: meta.color,
                            bgcolor: meta.bg,
                            border: `1px solid ${meta.border}`,
                          }}
                        />
                      </Stack>

                      <Typography variant="body2" color="text.secondary">
                        {item.propertyName}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        {item.id} • {item.createdAt}
                      </Typography>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          </CardContent>
        </Card>

        <Stack spacing={2}>
          <SectionCard
            title="Başvuru Detayı"
            subtitle="Başvuru içeriği ve belge özeti."
            icon={<IconFileDescription size={20} />}
          >
            <Stack spacing={1.25}>
              <SummaryRow label="Başvuru no" value={selectedApplication.id} />
              <SummaryRow label="Başvuran" value={selectedApplication.applicantName} />
              <SummaryRow label="E-posta" value={selectedApplication.applicantEmail} />
              <SummaryRow
                label="Başvuru tipi"
                value={
                  selectedApplication.applicationType === "existing_property_authority"
                    ? "Mevcut yapı için yetki talebi"
                    : "Yeni yapı başvurusu"
                }
              />
              <SummaryRow
                label="Talep edilen rol"
                value={getRoleLabel(selectedApplication.requestedRole)}
              />
              <SummaryRow label="Yapı adı" value={selectedApplication.propertyName} />
              <SummaryRow label="Konum" value={selectedApplication.location} />
            </Stack>

            <Divider />

            <Box>
              <Typography fontWeight={800} sx={{ mb: 0.75 }}>
                Başvuru açıklaması
              </Typography>
              <Typography color="text.secondary">{selectedApplication.description}</Typography>
            </Box>

            <Divider />

            <Stack spacing={1}>
              <Typography fontWeight={800}>Belgeler</Typography>

              {selectedApplication.documents.map((doc) => (
                <Stack
                  key={doc.id}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    p: 1.15,
                    borderRadius: 2.5,
                    border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                  }}
                >
                  <Box>
                    <Typography fontWeight={700}>{doc.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {doc.kind}
                    </Typography>
                  </Box>

                  <Button size="small" sx={{ fontWeight: 700 }}>
                    İncele
                  </Button>
                </Stack>
              ))}
            </Stack>
          </SectionCard>

          <SectionCard
            title="Admin Kararı"
            subtitle="Eşleştirme, atama ve durum işlemleri."
            icon={<IconUserCheck size={20} />}
          >
            <Stack spacing={2}>
              <TextField select label="İşlem türü" defaultValue="assign_existing" fullWidth>
                <MenuItem value="assign_existing">Mevcut gayrimenkule ata</MenuItem>
                <MenuItem value="create_and_assign">Yeni gayrimenkul oluştur ve ata</MenuItem>
                <MenuItem value="request_revision">Revizyon iste</MenuItem>
                <MenuItem value="reject">Reddet</MenuItem>
              </TextField>

              <TextField select label="Hedef gayrimenkul" defaultValue="1" fullWidth>
                <MenuItem value="1">Green Park Sitesi</MenuItem>
                <MenuItem value="2">Mavi Bahçe Konakları</MenuItem>
              </TextField>

              <TextField
                select
                label="Atanacak rol"
                defaultValue={selectedApplication.requestedRole}
                fullWidth
              >
                {requestedRoleOptions.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="İnceleme notu"
                value={reviewNote}
                onChange={(event) => setReviewNote(event.target.value)}
                multiline
                minRows={4}
                placeholder="Başvuru sonucuna ilişkin admin notu..."
                fullWidth
              />

              <Box
                sx={{
                  p: 1.4,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.info.main, 0.06),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.14)}`,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Onay akışında kullanıcı ilgili property’ye membership olarak atanmalı.
                  Kullanıcı doğrudan property oluşturmaz; yalnızca admin onayı ile erişim kazanır.
                </Typography>
              </Box>

              <Stack direction={{ xs: "column", md: "row" }} spacing={1.25}>
                <Button
                  variant="contained"
                  startIcon={<IconCheck size={18} />}
                  sx={{ borderRadius: 2.75, fontWeight: 800, textTransform: "none" }}
                >
                  Onayla ve Ata
                </Button>

                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<IconMessageCircle size={18} />}
                  sx={{ borderRadius: 2.75, fontWeight: 800, textTransform: "none" }}
                >
                  Revizyon İste
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<IconX size={18} />}
                  sx={{ borderRadius: 2.75, fontWeight: 800, textTransform: "none" }}
                >
                  Reddet
                </Button>
              </Stack>
            </Stack>
          </SectionCard>

          <Card
            variant="outlined"
            sx={{
              borderRadius: 4.5,
              bgcolor: alpha(theme.palette.primary.main, 0.03),
            }}
          >
            <CardContent sx={{ p: 2.25 }}>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 2.5,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: "primary.main",
                  }}
                >
                  <IconArrowRight size={18} />
                </Box>

                <Box>
                  <Typography fontWeight={800}>Önerilen işlem</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Başvuru uygun ise membership oluştur, değilse revizyon veya red akışına al.
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Stack>
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
        borderColor: alpha(theme.palette.divider, 0.75),
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
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

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      justifyContent="space-between"
      alignItems="flex-start"
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={800} textAlign="right">
        {value}
      </Typography>
    </Stack>
  );
}

function getStatusMeta(theme: Theme, status: ApplicationStatus) {
  if (status === "approved") {
    return {
      label: "Onaylandı",
      color: theme.palette.success.dark,
      bg: alpha(theme.palette.success.main, 0.1),
      border: alpha(theme.palette.success.main, 0.2),
    };
  }

  if (status === "rejected") {
    return {
      label: "Reddedildi",
      color: theme.palette.error.dark,
      bg: alpha(theme.palette.error.main, 0.1),
      border: alpha(theme.palette.error.main, 0.2),
    };
  }

  if (status === "needs_revision") {
    return {
      label: "Revizyon Gerekli",
      color: theme.palette.warning.dark,
      bg: alpha(theme.palette.warning.main, 0.12),
      border: alpha(theme.palette.warning.main, 0.22),
    };
  }

  return {
    label: "İncelemede",
    color: theme.palette.primary.main,
    bg: alpha(theme.palette.primary.main, 0.08),
    border: alpha(theme.palette.primary.main, 0.16),
  };
}

function getRoleLabel(role: RequestedRole) {
  if (role === "finance_manager") return "Muhasebe Yetkilisi";
  if (role === "operations_manager") return "Operasyon Sorumlusu";
  if (role === "full_admin") return "Tam Yetkili Yönetici";
  return "Yönetici";
}