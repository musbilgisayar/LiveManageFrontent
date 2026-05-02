// src/modules/management-applications/views/AdminManagementApplicationDetailView.tsx

"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
  IconAlertTriangle,
  IconArrowLeft,
  IconCheck,
  IconChecklist,
  IconClock,
  IconFileDescription,
  IconHome,
  IconMessage2,
  IconShieldCheck,
  IconUser,
  IconUserShield,
  IconX,
} from "@tabler/icons-react";

type ApplicationStatus =
  | "pending"
  | "in_review"
  | "missing_information"
  | "approved"
  | "rejected";

type RiskLevel = "low" | "medium" | "high" | "critical";
type CheckStatus = "passed" | "warning" | "failed";
type DocumentStatus = "valid" | "missing" | "needs_revision";

type ApplicationDetail = {
  applicationId: string;
  applicationNumber: string;
  status: ApplicationStatus;
  riskLevel: RiskLevel;
  createdAt: string;
  updatedAt: string;

  applicant: {
    userId: string;
    fullName: string;
    email: string;
    phone: string;
    emailVerified: boolean;
    phoneVerified: boolean;
    identityNumberMasked: string;
  };

  property: {
    propertyName: string;
    structureType: string;
    blockCount: number;
    totalApartmentCount: number;
    addressSummary: string;
  };

  authority: {
    representationType: string;
    requestedRole: string;
    authorityStartDate: string;
    authorityEndDate?: string;
    authorityScope: string;
  };

  documents: {
    id: string;
    documentType: string;
    fileName: string;
    fileSize: string;
    uploadedAt: string;
    status: DocumentStatus;
    adminNote?: string;
  }[];

  systemChecks: {
    id: string;
    label: string;
    description: string;
    status: CheckStatus;
  }[];

  timeline: {
    id: string;
    action: string;
    actorName: string;
    occurredAt: string;
    note?: string;
  }[];
};

const mockDetail: ApplicationDetail = {
  applicationId: "1",
  applicationNumber: "APP-2026-000123",
  status: "pending",
  riskLevel: "medium",
  createdAt: "02 Mayıs 2026 10:42",
  updatedAt: "02 Mayıs 2026 11:05",

  applicant: {
    userId: "user-1",
    fullName: "Ahmet Yılmaz",
    email: "ahmet@test.com",
    phone: "+41 79 123 45 67",
    emailVerified: true,
    phoneVerified: true,
    identityNumberMasked: "756.***.***.12",
  },

  property: {
    propertyName: "Green Park Sitesi",
    structureType: "Site Yönetimi",
    blockCount: 3,
    totalApartmentCount: 48,
    addressSummary: "Zürich / Altstetten, Bahnhofstrasse 12, 8048",
  },

  authority: {
    representationType: "Profesyonel Yönetici",
    requestedRole: "Tam Yetkili Yönetici",
    authorityStartDate: "02 Mayıs 2026",
    authorityEndDate: "Süresiz / belirtilmedi",
    authorityScope:
      "Yönetim işlemleri, muhasebe takibi, duyuru yayınlama ve bakım taleplerini yönetme.",
  },

  documents: [
    {
      id: "1",
      documentType: "Kimlik Belgesi",
      fileName: "kimlik.pdf",
      fileSize: "1.4 MB",
      uploadedAt: "02 Mayıs 2026",
      status: "valid",
    },
    {
      id: "2",
      documentType: "Yetki Belgesi",
      fileName: "yetki.pdf",
      fileSize: "820 KB",
      uploadedAt: "02 Mayıs 2026",
      status: "needs_revision",
      adminNote: "Belgede imza alanı eksik görünüyor.",
    },
  ],

  systemChecks: [
    {
      id: "1",
      label: "E-posta doğrulaması",
      description: "Başvuru sahibinin e-posta adresi doğrulanmış.",
      status: "passed",
    },
    {
      id: "2",
      label: "Telefon doğrulaması",
      description: "Başvuru sahibinin telefon numarası doğrulanmış.",
      status: "passed",
    },
    {
      id: "3",
      label: "Yetki belgesi kontrolü",
      description: "Yetki belgesinde revizyon gerekebilir.",
      status: "warning",
    },
  ],

  timeline: [
    {
      id: "1",
      action: "Başvuru oluşturuldu",
      actorName: "Ahmet Yılmaz",
      occurredAt: "02 Mayıs 2026 10:42",
    },
    {
      id: "2",
      action: "Belgeler yüklendi",
      actorName: "Ahmet Yılmaz",
      occurredAt: "02 Mayıs 2026 10:48",
      note: "2 belge eklendi.",
    },
    {
      id: "3",
      action: "Admin incelemesine alındı",
      actorName: "Sistem",
      occurredAt: "02 Mayıs 2026 11:05",
    },
  ],
};

export default function AdminManagementApplicationDetailView({
  applicationId,
}: {
  applicationId: string;
}) {
  const theme = useTheme<Theme>();
  const router = useRouter();

const [decision, setDecision] = useState<"approve" | "revision" | "reject">(
  "approve",
);
const [adminNote, setAdminNote] = useState("");

const [assignedRole, setAssignedRole] = useState("property_manager");
const [permissionScope, setPermissionScope] = useState("full_property");
const [validFrom, setValidFrom] = useState("2026-05-02");
const [validUntil, setValidUntil] = useState("");
const [notifyApplicant, setNotifyApplicant] = useState("yes");

  const data = mockDetail;

  const statusColor = getStatusColor(theme, data.status);
  const riskColor = getRiskColor(theme, data.riskLevel);

  const documentIssueCount = useMemo(
    () => data.documents.filter((x) => x.status !== "valid").length,
    [data.documents],
  );

  return (
    <Box>
      <Card
        variant="outlined"
        sx={{
          mb: 3,
          borderRadius: 5,
          borderColor: alpha(statusColor, 0.2),
          background: `linear-gradient(135deg, ${alpha(
            statusColor,
            0.06,
          )} 0%, ${alpha(theme.palette.background.paper, 0.96)} 100%)`,
        }}
      >
        <CardContent sx={{ p: { xs: 2.25, md: 3 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            spacing={2}
          >
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip
                  label={data.applicationNumber}
                  size="small"
                  sx={{
                    fontWeight: 900,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: "primary.main",
                  }}
                />
                <Chip
                  label={statusLabel(data.status)}
                  size="small"
                  sx={{
                    fontWeight: 900,
                    bgcolor: alpha(statusColor, 0.1),
                    color: statusColor,
                    border: `1px solid ${alpha(statusColor, 0.2)}`,
                  }}
                />
                <Chip
                  label={`Risk: ${riskLabel(data.riskLevel)}`}
                  size="small"
                  sx={{
                    fontWeight: 900,
                    bgcolor: alpha(riskColor, 0.1),
                    color: riskColor,
                    border: `1px solid ${alpha(riskColor, 0.2)}`,
                  }}
                />
              </Stack>

              <Typography variant="h4" fontWeight={950} lineHeight={1.1}>
                {data.property.propertyName}
              </Typography>

              <Typography color="text.secondary" sx={{ maxWidth: 820 }}>
                Başvuru sahibi, yetki bilgileri, belgeler ve sistem kontrolleri
                üzerinden başvuruyu inceleyip karar verin.
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <MetaChip label={`Oluşturma: ${data.createdAt}`} />
                <MetaChip label={`Güncelleme: ${data.updatedAt}`} />
                <MetaChip label={`${documentIssueCount} belge uyarısı`} />
              </Stack>
            </Stack>

            <Button
              startIcon={<IconArrowLeft size={18} />}
              onClick={() => router.push("/management-applications/review")}
              sx={{
                height: 44,
                borderRadius: 999,
                fontWeight: 850,
                textTransform: "none",
                alignSelf: { xs: "flex-start", md: "flex-start" },
              }}
            >
              Listeye Dön
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", xl: "1.45fr 0.9fr" },
          gap: 2,
          alignItems: "start",
        }}
      >
        <Stack spacing={2}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
              gap: 2,
            }}
          >
            <SectionCard title="Başvuru Sahibi" icon={<IconUser size={19} />}>
              <InfoRow label="Ad Soyad" value={data.applicant.fullName} />
              <InfoRow label="E-posta" value={data.applicant.email} />
              <InfoRow label="Telefon" value={data.applicant.phone} />
              <InfoRow
                label="Kimlik No"
                value={data.applicant.identityNumberMasked}
              />
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <CheckChip
                  ok={data.applicant.emailVerified}
                  label="E-posta doğrulandı"
                />
                <CheckChip
                  ok={data.applicant.phoneVerified}
                  label="Telefon doğrulandı"
                />
              </Stack>
            </SectionCard>

            <SectionCard title="Gayrimenkul Bilgisi" icon={<IconHome size={19} />}>
              <InfoRow label="Yapı adı" value={data.property.propertyName} />
              <InfoRow label="Yapı tipi" value={data.property.structureType} />
              <InfoRow
                label="Blok sayısı"
                value={String(data.property.blockCount)}
              />
              <InfoRow
                label="Daire sayısı"
                value={String(data.property.totalApartmentCount)}
              />
              <InfoRow label="Adres" value={data.property.addressSummary} wide />
            </SectionCard>
          </Box>

          <SectionCard
            title="Yetki ve Temsil Bilgileri"
            icon={<IconUserShield size={19} />}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 1.25,
              }}
            >
              <InfoBox label="Temsil şekli" value={data.authority.representationType} />
              <InfoBox label="Talep edilen rol" value={data.authority.requestedRole} />
              <InfoBox
                label="Yetki başlangıcı"
                value={data.authority.authorityStartDate}
              />
              <InfoBox
                label="Yetki bitişi"
                value={data.authority.authorityEndDate ?? "-"}
              />
            </Box>

            <Box sx={{ mt: 1.5 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={800}>
                Yetki kapsamı
              </Typography>
              <Typography fontWeight={750} sx={{ mt: 0.35 }}>
                {data.authority.authorityScope}
              </Typography>
            </Box>
          </SectionCard>

          <SectionCard
            title="Yüklenen Belgeler"
            icon={<IconFileDescription size={19} />}
          >
            <Stack spacing={1.1}>
              {data.documents.map((doc) => (
                <DocumentRow key={doc.id} doc={doc} />
              ))}
            </Stack>
          </SectionCard>
        </Stack>

        <Stack spacing={2}>
          <SectionCard
            title="Sistem Değerlendirmesi"
            icon={<IconShieldCheck size={19} />}
          >
            <Stack spacing={1}>
              {data.systemChecks.map((check) => (
                <SystemCheckRow key={check.id} check={check} />
              ))}
            </Stack>
          </SectionCard>

          <SectionCard title="İşlem Geçmişi" icon={<IconClock size={19} />}>
            <Stack spacing={1.2}>
              {data.timeline.map((item) => (
                <TimelineRow key={item.id} item={item} />
              ))}
            </Stack>
          </SectionCard>

   <Stack spacing={2}>
  <TextField
    select
    label="Karar"
    value={decision}
    onChange={(event) =>
      setDecision(event.target.value as "approve" | "revision" | "reject")
    }
    fullWidth
  >
    <MenuItem value="approve">Onayla ve yetki ata</MenuItem>
    <MenuItem value="revision">Eksik bilgi / belge iste</MenuItem>
    <MenuItem value="reject">Reddet</MenuItem>
  </TextField>

  {decision === "approve" && (
    <Box
      sx={{
        p: 1.6,
        borderRadius: 3.5,
        border: `1px solid ${alpha(theme.palette.success.main, 0.18)}`,
        bgcolor: alpha(theme.palette.success.main, 0.045),
      }}
    >
      <Stack spacing={2}>
        <Stack spacing={0.35}>
          <Typography fontWeight={950}>Rol ve Yetki Atama</Typography>
          <Typography variant="body2" color="text.secondary">
            Başvuru onaylandığında kullanıcı ilgili yapıya bağlanır ve seçilen
            rol/yetki kapsamı ile işlem yapabilir.
          </Typography>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 1.5,
          }}
        >
          <TextField
            select
            label="Atanacak rol"
            value={assignedRole}
            onChange={(event) => setAssignedRole(event.target.value)}
            fullWidth
          >
            <MenuItem value="property_manager">Tam Yetkili Yönetici</MenuItem>
            <MenuItem value="finance_manager">Muhasebe Yetkilisi</MenuItem>
            <MenuItem value="operations_manager">Operasyon Sorumlusu</MenuItem>
            <MenuItem value="maintenance_manager">Bakım Sorumlusu</MenuItem>
          </TextField>

          <TextField
            select
            label="Yetki kapsamı"
            value={permissionScope}
            onChange={(event) => setPermissionScope(event.target.value)}
            fullWidth
          >
            <MenuItem value="full_property">Tüm yapı</MenuItem>
            <MenuItem value="finance_only">Sadece muhasebe</MenuItem>
            <MenuItem value="operations_only">Sadece operasyon</MenuItem>
            <MenuItem value="maintenance_only">Sadece bakım</MenuItem>
          </TextField>

          <TextField
            label="Yetki başlangıç tarihi"
            type="date"
            value={validFrom}
            onChange={(event) => setValidFrom(event.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label="Yetki bitiş tarihi"
            type="date"
            value={validUntil}
            onChange={(event) => setValidUntil(event.target.value)}
            InputLabelProps={{ shrink: true }}
            helperText="Süresiz yetki için boş bırakılabilir."
            fullWidth
          />

          <TextField
            select
            label="Bildirim"
            value={notifyApplicant}
            onChange={(event) => setNotifyApplicant(event.target.value)}
            fullWidth
          >
            <MenuItem value="yes">Başvuru sahibine bildir</MenuItem>
            <MenuItem value="no">Şimdilik bildirim gönderme</MenuItem>
          </TextField>
        </Box>

        <Box
          sx={{
            p: 1.25,
            borderRadius: 3,
            bgcolor: alpha(theme.palette.background.paper, 0.7),
            border: `1px solid ${alpha(theme.palette.success.main, 0.14)}`,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Onay sonrası sistem: başvuru durumunu günceller, kullanıcı-yapı
            ilişkisini oluşturur, rol/yetki atar, ilgili cache kayıtlarını
            invalidate eder ve AuditLog/SecurityLog üretir.
          </Typography>
        </Box>
      </Stack>
    </Box>
  )}

  {decision === "revision" && (
    <Box
      sx={{
        p: 1.6,
        borderRadius: 3.5,
        border: `1px solid ${alpha(theme.palette.warning.main, 0.18)}`,
        bgcolor: alpha(theme.palette.warning.main, 0.045),
      }}
    >
      <Stack spacing={1}>
        <Typography fontWeight={950}>Revizyon Gerekçesi</Typography>
        <Typography variant="body2" color="text.secondary">
          Eksik veya hatalı bilgi/belge varsa başvuru sahibine açıklayıcı şekilde
          bildirilmelidir.
        </Typography>
      </Stack>
    </Box>
  )}

  {decision === "reject" && (
    <Box
      sx={{
        p: 1.6,
        borderRadius: 3.5,
        border: `1px solid ${alpha(theme.palette.error.main, 0.18)}`,
        bgcolor: alpha(theme.palette.error.main, 0.045),
      }}
    >
      <Stack spacing={1}>
        <Typography fontWeight={950}>Red Gerekçesi</Typography>
        <Typography variant="body2" color="text.secondary">
          Red işlemi kullanıcıya bildirileceği için gerekçe açık, kısa ve
          denetlenebilir olmalıdır.
        </Typography>
      </Stack>
    </Box>
  )}

  <TextField
    label={
      decision === "approve"
        ? "Admin notu"
        : decision === "revision"
          ? "Eksik bilgi / belge açıklaması"
          : "Red gerekçesi"
    }
    value={adminNote}
    onChange={(event) => setAdminNote(event.target.value)}
    placeholder={
      decision === "approve"
        ? "Onay ve yetki atamasıyla ilgili iç değerlendirme notu yazın..."
        : decision === "revision"
          ? "Hangi bilgi veya belgenin eksik olduğunu yazın..."
          : "Başvurunun neden reddedildiğini yazın..."
    }
    multiline
    minRows={4}
    fullWidth
  />

  <Stack spacing={1}>
    <Button
      variant="contained"
      color={
        decision === "reject"
          ? "error"
          : decision === "revision"
            ? "warning"
            : "success"
      }
      startIcon={
        decision === "reject" ? (
          <IconX size={18} />
        ) : decision === "revision" ? (
          <IconMessage2 size={18} />
        ) : (
          <IconCheck size={18} />
        )
      }
      sx={{
        height: 46,
        borderRadius: 999,
        fontWeight: 900,
        textTransform: "none",
      }}
    >
      {decision === "approve"
        ? "Onayla ve Yetki Ata"
        : decision === "revision"
          ? "Revizyon İste"
          : "Başvuruyu Reddet"}
    </Button>

    <Typography variant="caption" color="text.secondary">
      Bu işlem backend tarafında tek transaction/workflow olarak yürütülmeli:
      status güncelleme, rol atama, audit log, security log, cache invalidation
      ve bildirim.
    </Typography>
  </Stack>
</Stack>
       
        </Stack>
      </Box>
    </Box>
  );
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
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
        bgcolor: alpha(theme.palette.background.paper, 0.86),
      }}
    >
      <CardContent sx={{ p: 2.35 }}>
        <Stack spacing={1.75}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2.6,
                display: "grid",
                placeItems: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: "primary.main",
              }}
            >
              {icon}
            </Box>
            <Typography fontWeight={950}>{title}</Typography>
          </Stack>

          <Divider />

          {children}
        </Stack>
      </CardContent>
    </Card>
  );
}

function InfoRow({
  label,
  value,
  wide,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <Stack
      direction={wide ? "column" : "row"}
      justifyContent="space-between"
      spacing={wide ? 0.35 : 1}
    >
      <Typography color="text.secondary">{label}</Typography>
      <Typography fontWeight={850} textAlign={wide ? "left" : "right"}>
        {value}
      </Typography>
    </Stack>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  const theme = useTheme<Theme>();

  return (
    <Box
      sx={{
        p: 1.25,
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
        bgcolor: alpha(theme.palette.text.primary, 0.018),
      }}
    >
      <Typography variant="caption" color="text.secondary" fontWeight={800}>
        {label}
      </Typography>
      <Typography fontWeight={900} sx={{ mt: 0.25 }}>
        {value}
      </Typography>
    </Box>
  );
}

function MetaChip({ label }: { label: string }) {
  const theme = useTheme<Theme>();

  return (
    <Chip
      label={label}
      size="small"
      variant="outlined"
      sx={{
        fontWeight: 800,
        bgcolor: alpha(theme.palette.background.paper, 0.72),
      }}
    />
  );
}

function CheckChip({ ok, label }: { ok: boolean; label: string }) {
  const theme = useTheme<Theme>();
  const color = ok ? theme.palette.success.main : theme.palette.warning.main;

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        fontWeight: 850,
        bgcolor: alpha(color, 0.1),
        color,
        border: `1px solid ${alpha(color, 0.18)}`,
      }}
    />
  );
}

function DocumentRow({
  doc,
}: {
  doc: ApplicationDetail["documents"][number];
}) {
  const theme = useTheme<Theme>();
  const color = getDocumentColor(theme, doc.status);

  return (
    <Box
      sx={{
        p: 1.35,
        borderRadius: 3.3,
        border: `1px solid ${alpha(color, 0.16)}`,
        bgcolor: alpha(color, 0.035),
      }}
    >
      <Stack direction="row" justifyContent="space-between" spacing={1}>
        <Box>
          <Typography fontWeight={900}>{doc.documentType}</Typography>
          <Typography variant="body2" color="text.secondary">
            {doc.fileName} · {doc.fileSize} · {doc.uploadedAt}
          </Typography>

          {doc.adminNote && (
            <Typography variant="body2" color="warning.main" sx={{ mt: 0.6 }}>
              {doc.adminNote}
            </Typography>
          )}
        </Box>

        <Chip
          label={documentStatusLabel(doc.status)}
          size="small"
          sx={{
            fontWeight: 850,
            bgcolor: alpha(color, 0.1),
            color,
            border: `1px solid ${alpha(color, 0.18)}`,
          }}
        />
      </Stack>
    </Box>
  );
}

function SystemCheckRow({
  check,
}: {
  check: ApplicationDetail["systemChecks"][number];
}) {
  const theme = useTheme<Theme>();
  const color = getCheckColor(theme, check.status);

  return (
    <Box
      sx={{
        p: 1.25,
        borderRadius: 3,
        border: `1px solid ${alpha(color, 0.15)}`,
        bgcolor: alpha(color, 0.035),
      }}
    >
      <Stack direction="row" spacing={1.1} alignItems="flex-start">
        <Box sx={{ mt: 0.25, color }}>
          {check.status === "passed" ? (
            <IconCheck size={17} />
          ) : check.status === "failed" ? (
            <IconX size={17} />
          ) : (
            <IconAlertTriangle size={17} />
          )}
        </Box>

        <Box>
          <Typography fontWeight={900}>{check.label}</Typography>
          <Typography variant="body2" color="text.secondary">
            {check.description}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

function TimelineRow({
  item,
}: {
  item: ApplicationDetail["timeline"][number];
}) {
  const theme = useTheme<Theme>();

  return (
    <Stack direction="row" spacing={1.1}>
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          bgcolor: "primary.main",
          mt: 0.8,
          flexShrink: 0,
        }}
      />

      <Box
        sx={{
          pb: 1,
          borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.06)}`,
          flex: 1,
        }}
      >
        <Typography fontWeight={900}>{item.action}</Typography>
        <Typography variant="caption" color="text.secondary">
          {item.actorName} · {item.occurredAt}
        </Typography>
        {item.note && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
            {item.note}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

function getStatusColor(theme: Theme, status: ApplicationStatus) {
  if (status === "approved") return theme.palette.success.main;
  if (status === "rejected") return theme.palette.error.main;
  if (status === "missing_information") return theme.palette.warning.main;
  if (status === "in_review") return theme.palette.info.main;
  return theme.palette.primary.main;
}

function statusLabel(status: ApplicationStatus) {
  if (status === "approved") return "Onaylandı";
  if (status === "rejected") return "Reddedildi";
  if (status === "missing_information") return "Eksik Bilgi";
  if (status === "in_review") return "İncelemede";
  return "Bekliyor";
}

function getRiskColor(theme: Theme, risk: RiskLevel) {
  if (risk === "critical") return theme.palette.error.dark;
  if (risk === "high") return theme.palette.error.main;
  if (risk === "medium") return theme.palette.warning.main;
  return theme.palette.success.main;
}

function riskLabel(risk: RiskLevel) {
  if (risk === "critical") return "Kritik";
  if (risk === "high") return "Yüksek";
  if (risk === "medium") return "Orta";
  return "Düşük";
}

function getDocumentColor(theme: Theme, status: DocumentStatus) {
  if (status === "valid") return theme.palette.success.main;
  if (status === "needs_revision") return theme.palette.warning.main;
  return theme.palette.error.main;
}

function documentStatusLabel(status: DocumentStatus) {
  if (status === "valid") return "Geçerli";
  if (status === "needs_revision") return "Revizyon Gerekli";
  return "Eksik";
}

function getCheckColor(theme: Theme, status: CheckStatus) {
  if (status === "passed") return theme.palette.success.main;
  if (status === "failed") return theme.palette.error.main;
  return theme.palette.warning.main;
}