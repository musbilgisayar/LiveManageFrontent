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
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import {
  IconArrowRight,
  IconChecklist,
  IconClock,
  IconFileDescription,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconShieldCheck,
} from "@tabler/icons-react";

import   useManagementApplicationList   from "../hooks/useManagementApplicationList";
import type { ManagedPropertyApplicationListItemDto, ManagedPropertyApplicationStatus,} from "../types/managementApplication.types";

type ApplicationStatus =
  | "pending"
  | "underReview"
  | "approved"
  | "rejected"
  | "cancelled";

type ManagementApplicationItem = {
  id: string;
  applicationNumber: string;
  propertyName: string;
  location: string;
  status: ApplicationStatus;
  applicationType: string;
  requestedRole: string;
  documentCount: number;
  createdAt: string;
  updatedAt: string;
  description: string;
};

export default function ManagementApplicationListView() {
  const theme = useTheme<Theme>();
  const router = useRouter();

  const { items, isLoading, errorMessage, reload } =
    useManagementApplicationList();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ApplicationStatus | "all">("all");

  const applications = useMemo(() => {
    return items.map(mapApplicationListItem);
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();

    return applications.filter((item) => {
      const matchesSearch =
        !q ||
        item.applicationNumber.toLowerCase().includes(q) ||
        item.propertyName.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.requestedRole.toLowerCase().includes(q);

      const matchesStatus = status === "all" || item.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [applications, search, status]);

  const totalCount = applications.length;
  const inReviewCount = applications.filter(
    (x) => x.status === "pending" || x.status === "underReview",
  ).length;
  const revisionCount = 0;
  const approvedCount = applications.filter((x) => x.status === "approved").length;

  return (
    <Box>
      <Card
        variant="outlined"
        sx={{
          mb: 3,
          borderRadius: 5,
          borderColor: alpha(theme.palette.primary.main, 0.14),
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.055,
          )} 0%, ${alpha(theme.palette.background.paper, 0.96)} 100%)`,
          boxShadow: "0 16px 42px rgba(15, 23, 42, 0.04)",
        }}
      >
        <CardContent sx={{ p: { xs: 2.25, md: 3 } }}>
          <Stack spacing={2.5}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", md: "flex-start" }}
              spacing={2}
            >
              <Stack spacing={0.9}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Chip
                    label="Yönetim Başvuruları"
                    size="small"
                    sx={{
                      width: "fit-content",
                      fontWeight: 850,
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      color: "primary.main",
                    }}
                  />

                  <Chip
                    label={isLoading ? "Yükleniyor..." : `${totalCount} kayıt`}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontWeight: 850,
                      bgcolor: alpha(theme.palette.background.paper, 0.75),
                    }}
                  />
                </Stack>

                <Typography
                  sx={{
                    fontSize: { xs: 24, md: 29 },
                    fontWeight: 950,
                    letterSpacing: "-0.035em",
                    lineHeight: 1.12,
                  }}
                >
                  Başvurularım
                </Typography>

                <Typography color="text.secondary" sx={{ maxWidth: 820 }}>
                  Oluşturduğunuz yöneticilik başvurularını buradan takip edebilirsiniz.
                  Başvurular admin incelemesine alınır, gerekirse revizyon istenir ve uygun
                  görülürse ilgili gayrimenkule yetki atanır.
                </Typography>
              </Stack>

              <Button
                variant="contained"
                startIcon={<IconPlus size={18} />}
                onClick={() => router.push("/management-applications/create")}
                sx={{
                  height: 46,
                  px: 2.4,
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 900,
                  whiteSpace: "nowrap",
                  boxShadow: "0 12px 26px rgba(37, 99, 235, 0.22)",
                }}
              >
                Yeni Başvuru
              </Button>
            </Stack>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                  lg: "repeat(4, minmax(0, 1fr))",
                },
                gap: 1.5,
              }}
            >
              <MiniKpi icon={<IconFileDescription size={18} />} label="Toplam" value={totalCount} />
              <MiniKpi icon={<IconClock size={18} />} label="İncelemede" value={inReviewCount} tone="warning" />
              <MiniKpi icon={<IconChecklist size={18} />} label="Revizyon" value={revisionCount} tone="error" />
              <MiniKpi icon={<IconShieldCheck size={18} />} label="Onaylandı" value={approvedCount} tone="success" />
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Card
        variant="outlined"
        sx={{
          mb: 2.5,
          borderRadius: 5,
          borderColor: alpha(theme.palette.text.primary, 0.08),
          bgcolor: alpha(theme.palette.background.paper, 0.82),
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.4}
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <TextField
              size="small"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Başvuru no, yapı adı, konum veya rol ara..."
              fullWidth
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={18} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 999,
                  bgcolor: alpha(theme.palette.background.default, 0.36),
                },
              }}
            />

            <TextField
              select
              size="small"
              label="Durum"
              value={status}
              disabled={isLoading}
              onChange={(event) => setStatus(event.target.value as ApplicationStatus | "all")}
              sx={{
                minWidth: { xs: "100%", md: 220 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 999,
                  bgcolor: alpha(theme.palette.background.default, 0.36),
                },
              }}
            >
              <MenuItem value="all">Tümü</MenuItem>
              <MenuItem value="pending">Beklemede</MenuItem>
              <MenuItem value="underReview">İncelemede</MenuItem>
              <MenuItem value="approved">Onaylandı</MenuItem>
              <MenuItem value="rejected">Reddedildi</MenuItem>
              <MenuItem value="cancelled">İptal Edildi</MenuItem>
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      {isLoading && (
        <Card variant="outlined" sx={{ borderRadius: 4 }}>
          <CardContent>
            <Typography fontWeight={900}>Başvurular yükleniyor...</Typography>
          </CardContent>
        </Card>
      )}

      {errorMessage && !isLoading && (
        <Card variant="outlined" sx={{ borderRadius: 4 }}>
          <CardContent>
            <Stack spacing={1.5}>
              <Typography color="error" fontWeight={900}>
                {errorMessage}
              </Typography>

              <Button
                variant="outlined"
                startIcon={<IconRefresh size={17} />}
                onClick={reload}
                sx={{
                  width: "fit-content",
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 900,
                }}
              >
                Tekrar dene
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {!isLoading && !errorMessage && filteredItems.length === 0 && (
        <Card variant="outlined" sx={{ borderRadius: 4 }}>
          <CardContent>
            <Stack spacing={1}>
              <Typography fontWeight={900}>Henüz başvuru bulunamadı</Typography>
              <Typography color="text.secondary">
                Yeni bir site/apartman yönetim başvurusu oluşturabilirsiniz.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      )}

      {!isLoading && !errorMessage && filteredItems.length > 0 && (
        <Stack spacing={1.6}>
          {filteredItems.map((item) => (
            <ApplicationCard
              key={item.id}
              item={item}
              onOpen={() => router.push(`/management-applications/review/${item.id}`)}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}

function MiniKpi({
  icon,
  label,
  value,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone?: "default" | "success" | "warning" | "error";
}) {
  const theme = useTheme<Theme>();
  const color = getToneColor(theme, tone);

  return (
    <Box
      sx={{
        p: 1.55,
        borderRadius: 4,
        border: `1px solid ${alpha(color, 0.13)}`,
        bgcolor: alpha(theme.palette.background.paper, 0.82),
      }}
    >
      <Stack direction="row" spacing={1.2} alignItems="center">
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2.7,
            display: "grid",
            placeItems: "center",
            bgcolor: alpha(color, 0.1),
            color,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={800}>
            {label}
          </Typography>
          <Typography fontWeight={950} fontSize={19} lineHeight={1}>
            {value}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

function ApplicationCard({
  item,
  onOpen,
}: {
  item: ManagementApplicationItem;
  onOpen: () => void;
}) {
  const theme = useTheme<Theme>();
  const color = getStatusColor(theme, item.status);

  return (
    <Card
      variant="outlined"
      onClick={onOpen}
      sx={{
        borderRadius: 5,
        borderColor: alpha(color, 0.18),
        bgcolor: alpha(color, item.status === "approved" ? 0.035 : 0.025),
        cursor: "pointer",
        transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: theme.shadows[7],
          borderColor: alpha(color, 0.35),
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 2.45 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) auto" },
            gap: 2,
            alignItems: "center",
          }}
        >
          <Stack spacing={1.1} sx={{ minWidth: 0 }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
            >
              <Typography variant="h6" fontWeight={950} lineHeight={1.15}>
                {item.propertyName}
              </Typography>

              <Chip
                label={statusLabel(item.status)}
                size="small"
                sx={{
                  fontWeight: 850,
                  bgcolor: alpha(color, 0.1),
                  color,
                  border: `1px solid ${alpha(color, 0.18)}`,
                }}
              />

              <Chip
                label={item.applicationType}
                size="small"
                variant="outlined"
                sx={{
                  fontWeight: 850,
                  bgcolor: alpha(theme.palette.background.paper, 0.7),
                }}
              />
            </Stack>

            <Typography variant="body2" color="text.secondary">
              {item.location}
            </Typography>

            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              <MetaChip label={item.applicationNumber} />
              <MetaChip label={item.requestedRole} />
              <MetaChip label={`${item.documentCount} belge`} />
              <MetaChip label={`Oluşturma: ${item.createdAt}`} />
              <MetaChip label={`Güncelleme: ${item.updatedAt}`} />
            </Stack>

            <Typography color="text.secondary" sx={{ maxWidth: 880 }}>
              {item.description}
            </Typography>
          </Stack>

          <Button
            variant="contained"
            endIcon={<IconArrowRight size={17} />}
            onClick={(event) => {
              event.stopPropagation();
              onOpen();
            }}
            sx={{
              borderRadius: 999,
              px: 2.4,
              height: 44,
              textTransform: "none",
              fontWeight: 900,
              whiteSpace: "nowrap",
              boxShadow: "0 10px 22px rgba(37, 99, 235, 0.2)",
            }}
          >
            Detayı Gör
          </Button>
        </Box>
      </CardContent>
    </Card>
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
        height: 24,
        fontWeight: 800,
        bgcolor: alpha(theme.palette.background.paper, 0.78),
        borderColor: alpha(theme.palette.text.primary, 0.1),
      }}
    />
  );
}

function mapApplicationListItem(
  item: ManagedPropertyApplicationListItemDto,
): ManagementApplicationItem {
  const status = mapApplicationStatus(item.status);

  return {
    id: item.id,
    applicationNumber: `APP-${item.id.slice(0, 8).toUpperCase()}`,
    propertyName: item.propertyName,
    location: item.addressId ? `Adres ID: ${item.addressId}` : "Adres bilgisi yok",
    status,
    applicationType: "Yönetim başvurusu",
    requestedRole: "Yönetici",
    documentCount: 0,
    createdAt: formatDate(item.submittedAtUtc),
    updatedAt: formatDate(item.reviewedAtUtc || item.submittedAtUtc),
    description:
      item.description ||
      `${item.residentialUnitCount} konut, ${item.commercialUnitCount} ticari birim, ${
        item.blockCount ?? 0
      } blok için oluşturulmuş yönetim başvurusu.`,
  };
}

function mapApplicationStatus(
  status: ManagedPropertyApplicationStatus,
): ApplicationStatus {
  if (status === 1) return "underReview";
  if (status === 2) return "approved";
  if (status === 3) return "rejected";
  if (status === 4) return "cancelled";

  return "pending";
}

function formatDate(value?: string | null) {
  if (!value) return "-";

  try {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function getToneColor(theme: Theme, tone: "default" | "success" | "warning" | "error") {
  if (tone === "success") return theme.palette.success.main;
  if (tone === "warning") return theme.palette.warning.main;
  if (tone === "error") return theme.palette.error.main;
  return theme.palette.primary.main;
}

function getStatusColor(theme: Theme, status: ApplicationStatus) {
  if (status === "approved") return theme.palette.success.main;
  if (status === "underReview" || status === "pending") return theme.palette.warning.main;
  if (status === "rejected" || status === "cancelled") return theme.palette.error.main;
  return theme.palette.primary.main;
}

function statusLabel(status: ApplicationStatus) {
  if (status === "pending") return "Beklemede";
  if (status === "underReview") return "İncelemede";
  if (status === "approved") return "Onaylandı";
  if (status === "rejected") return "Reddedildi";
  if (status === "cancelled") return "İptal Edildi";
  return "Beklemede";
}