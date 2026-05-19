//src/modules/management-applications/views/MyManagementApplicationsView.tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Skeleton,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";

import {
  IconArrowRight,
  IconChecklist,
  IconClockHour4,
  IconFilePlus,
  IconFolderOpen,
  IconRefresh,
  IconShieldCheck,
} from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";

import useManagementApplicationsDashboard from "../hooks/useManagementApplicationsDashboard";

function getDisplayValue(value: unknown, fallback = "-") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
}

function getApplicationStatusKey(status: unknown): string {
  switch (Number(status)) {
    case 0:
      return "status.pending";

    case 1:
      return "status.underReview";

    case 2:
      return "status.documentRequested";

    case 3:
      return "status.approved";

    case 4:
      return "status.rejected";

    case 5:
      return "status.cancelled";

    default:
      return "status.unknown";
  }
}

function getApplicationStatusChipColor(
  status: unknown,
):
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning" {
  switch (Number(status)) {
    case 0:
      return "warning"; // pending

    case 1:
      return "info"; // under review

    case 2:
      return "secondary"; // document requested

    case 3:
      return "success"; // approved

    case 4:
      return "error"; // rejected

    case 5:
      return "default"; // cancelled

    default:
      return "default";
  }
}

export default function MyManagementApplicationsView() {
  const theme = useTheme();
  const params = useParams();

  const locale = String(params?.locale || "tr");

  const { t } = useI18nNs("management-applications");

  const tx = (key: string) =>
    t(`management-applications:${key}`);

  const {
    summary,
    recentApplications,
    isLoading,
    errorMessage,
    refresh,
  } = useManagementApplicationsDashboard();

  const stats = [
    {
      label: tx("dashboard.kpi.total"),
      value: summary.total,
      icon: IconFolderOpen,
      color: theme.palette.primary.main,
    },
    {
      label: tx("dashboard.kpi.inReview"),
      value: summary.inReview,
      icon: IconClockHour4,
      color: theme.palette.warning.main,
    },
    {
      label: tx("dashboard.kpi.approved"),
      value: summary.approved,
      icon: IconShieldCheck,
      color: theme.palette.success.main,
    },
    {
      label: tx("dashboard.kpi.documentRequested"),
      value: summary.documentRequested,
      icon: IconChecklist,
      color: theme.palette.info.main,
    },
  ];

  return (
    <Stack spacing={3}>
      {errorMessage ? (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<IconRefresh size={16} />}
              onClick={() => void refresh()}
            >
              {tx("dashboard.error.retry")}
            </Button>
          }
        >
          {errorMessage}
        </Alert>
      ) : null}

      <Card
        sx={{
          borderRadius: 5,
          overflow: "hidden",
          border: `1px solid ${alpha(
            theme.palette.primary.main,
            0.14,
          )}`,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.14,
          )}, ${alpha(
            theme.palette.background.paper,
            0.96,
          )})`,
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack
            direction={{
              xs: "column",
              md: "row",
            }}
            spacing={3}
            alignItems={{
              xs: "flex-start",
              md: "center",
            }}
            justifyContent="space-between"
          >
            <Stack spacing={1.5}>
              <Chip
                icon={<IconFolderOpen size={18} />}
                label={tx("my.hero.badge")}
                color="primary"
                sx={{
                  alignSelf: "flex-start",
                  fontWeight: 700,
                }}
              />

              <Typography
                variant="h3"
                fontWeight={800}
              >
                {tx("my.hero.title")}
              </Typography>

              <Typography
                variant="body1"
                color="text.secondary"
                maxWidth={760}
              >
                {tx("my.hero.description")}
              </Typography>
            </Stack>

            <Button
              component={Link}
              href={`/${locale}/management-applications/create`}
              variant="contained"
              size="large"
              startIcon={<IconFilePlus size={20} />}
              sx={{
                borderRadius: 3,
                whiteSpace: "nowrap",
              }}
            >
              {tx("my.hero.createButton")}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <Grid
              key={item.label}
              size={{
                xs: 12,
                sm: 6,
                lg: 3,
              }}
              sx={{ display: "flex" }}
            >
              <Card
                sx={{
                  flex: 1,
                  borderRadius: 4,
                  border: `1px solid ${alpha(
                    item.color,
                    0.16,
                  )}`,
                  background: alpha(
                    item.color,
                    0.055,
                  ),
                }}
              >
                <CardContent>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                  >
                    <Box
                      sx={{
                        width: 46,
                        height: 46,
                        borderRadius: 3,
                        display: "grid",
                        placeItems: "center",
                        color: item.color,
                        backgroundColor: alpha(
                          item.color,
                          0.14,
                        ),
                      }}
                    >
                      <Icon size={24} />
                    </Box>

                    <Box>
                      <Typography
                        variant="h4"
                        fontWeight={800}
                      >
                        {isLoading ? (
                          <Skeleton width={42} />
                        ) : (
                          item.value
                        )}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {item.label}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Card
        sx={{
          borderRadius: 4,
          border: `1px solid ${alpha(
            theme.palette.divider,
            0.75,
          )}`,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              alignItems={{
                xs: "flex-start",
                sm: "center",
              }}
              justifyContent="space-between"
              spacing={2}
            >
              <Box>
                <Typography
                  variant="h5"
                  fontWeight={800}
                >
                  {tx("my.recent.title")}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {tx("my.recent.description")}
                </Typography>
              </Box>

              <Button
                component={Link}
                href={`/${locale}/management-applications/create`}
                variant="outlined"
                startIcon={<IconFilePlus size={18} />}
              >
                {tx("my.recent.new")}
              </Button>
            </Stack>

            {isLoading ? (
              <Stack spacing={2}>
                {[1, 2, 3].map((item) => (
                  <Skeleton
                    key={item}
                    height={72}
                  />
                ))}
              </Stack>
            ) : recentApplications.length === 0 ? (
              <Alert severity="info">
                {tx("my.recent.empty")}
              </Alert>
            ) : (
              <Stack
                divider={<Divider flexItem />}
              >
                {recentApplications.map((item) => {
                  const record =
                    item as unknown as Record<
                      string,
                      unknown
                    >;

                  const applicationId =
                    getDisplayValue(
                      record.id ??
                      record.applicationId,
                    );

                  return (
                    <Stack
                      key={applicationId}
                      direction={{
                        xs: "column",
                        md: "row",
                      }}
                      spacing={2}
                      alignItems={{
                        xs: "flex-start",
                        md: "center",
                      }}
                      justifyContent="space-between"
                      sx={{ py: 2 }}
                    >
                      <Box>
                        <Typography
                          fontWeight={700}
                        >
                          {getDisplayValue(
                            record.propertyName ??
                            record.name ??
                            record.title,
                          )}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {getDisplayValue(
                            record.applicationNumber ??
                            record.referenceNo ??
                            applicationId,
                          )}
                        </Typography>
                      </Box>

                      <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                      >
                        <Chip
                          label={t(
                            getApplicationStatusKey(
                              record.status,
                            ),
                          )}
                          color={getApplicationStatusChipColor(
                            record.status,
                          )}
                          variant="filled"
                          size="small"
                        />

                        <Button
                          component={Link}
                          href={`/${locale}/management-applications/my/${applicationId}`}
                          endIcon={
                            <IconArrowRight size={18} />
                          }
                        >
                          {tx("my.recent.detail")}
                        </Button>
                      </Stack>
                    </Stack>
                  );
                })}
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}