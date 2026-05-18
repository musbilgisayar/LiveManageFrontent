"use client";

import React from "react";

import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";

import {
  IconBuildingCommunity,
  IconClock,
  IconEye,
} from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";

import {
  riskLabelKey,
  statusLabelKey,
} from "../../utils/adminManagementApplication.utils";

import type {
  AdminApplicationRiskLevel,
  AdminApplicationStatus,
  AdminManagementApplicationListItem,
} from "../../types/adminManagementApplication.types";

type ReviewListCardProps = {
  item: AdminManagementApplicationListItem;
  onOpen: () => void;
};

export default function ReviewListCard({
  item,
  onOpen,
}: ReviewListCardProps) {
  const theme = useTheme<Theme>();

  const { t } =
    useI18nNs("management-applications");

  const risk =
    item.riskLevel ?? "low";

  const riskColor =
    getRiskColor(theme, risk);

  const statusColor =
    getStatusColor(
      theme,
      item.status,
    );

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4,

        borderColor: alpha(
          theme.palette.text.primary,
          0.08,
        ),

        transition:
          "160ms ease",

        "&:hover": {
          borderColor: alpha(
            theme.palette.primary
              .main,
            0.28,
          ),

          boxShadow: `0 18px 48px ${alpha(
            theme.palette.common
              .black,
            0.08,
          )}`,
        },
      }}
    >
      <CardContent>
        <Stack
          direction={{
            xs: "column",
            md: "row",
          }}
          justifyContent="space-between"
          spacing={2}
        >
          <Stack
            direction="row"
            spacing={1.4}
            sx={{
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,

                borderRadius: 3,

                display: "grid",
                placeItems:
                  "center",

                bgcolor: alpha(
                  theme.palette
                    .primary.main,
                  0.08,
                ),

                color:
                  "primary.main",

                flexShrink: 0,
              }}
            >
              <IconBuildingCommunity
                size={22}
              />
            </Box>

            <Box
              sx={{
                minWidth: 0,
              }}
            >
              <Typography
                fontWeight={950}
                sx={{
                  overflowWrap:
                    "anywhere",
                }}
              >
                {item.propertyName ||
                  t(
                    "admin.reviewList.common.unnamedProperty",
                  )}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                {item.applicationNumber ||
                  item.id}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.45,

                  overflowWrap:
                    "anywhere",
                }}
              >
                {item.applicantName ||
                  t(
                    "admin.reviewList.common.unknownApplicant",
                  )}

                {item.applicantEmail
                  ? ` · ${item.applicantEmail}`
                  : ""}
              </Typography>

              {item.propertyAddress && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.35,

                    overflowWrap:
                      "anywhere",
                  }}
                >
                  {
                    item.propertyAddress
                  }
                </Typography>
              )}
            </Box>
          </Stack>

          <Stack
            spacing={1}
            alignItems={{
              xs: "flex-start",
              md: "flex-end",
            }}
            flexShrink={0}
          >
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              useFlexGap
            >
              <Chip
                size="small"
                label={t(
                  statusLabelKey(
                    item.status,
                  ),
                )}
                sx={{
                  fontWeight: 850,

                  borderRadius: 999,

                  color:
                    statusColor,

                  bgcolor: alpha(
                    statusColor,
                    0.08,
                  ),

                  border: `1px solid ${alpha(
                    statusColor,
                    0.16,
                  )}`,
                }}
              />

              <Chip
                size="small"
                label={`${t(
                  "admin.reviewList.risk",
                )}: ${t(
                  riskLabelKey(
                    risk,
                  ),
                )}`}
                sx={{
                  fontWeight: 850,

                  borderRadius: 999,

                  color: riskColor,

                  bgcolor: alpha(
                    riskColor,
                    0.08,
                  ),

                  border: `1px solid ${alpha(
                    riskColor,
                    0.16,
                  )}`,
                }}
              />
            </Stack>

            <Typography
              variant="caption"
              color="text.secondary"
            >
              <IconClock
                size={13}
                style={{
                  verticalAlign:
                    "middle",
                }}
              />{" "}
              {item.createdAt ||
                t(
                  "admin.detail.common.notProvided",
                )}
            </Typography>

            <Button
              variant="contained"
              size="small"
              startIcon={
                <IconEye size={17} />
              }
              onClick={onOpen}
              sx={{
                borderRadius: 999,
                fontWeight: 900,
                textTransform:
                  "none",
              }}
            >
              {t(
                "admin.reviewList.openDetail",
              )}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function getStatusColor(
  theme: Theme,
  status: AdminApplicationStatus,
) {
  if (status === "approved") {
    return theme.palette.success.main;
  }

  if (status === "rejected") {
    return theme.palette.error.main;
  }

  if (
    status ===
    "missing_information"
  ) {
    return theme.palette.warning.main;
  }

  if (status === "in_review") {
    return theme.palette.info.main;
  }

  return theme.palette.text.secondary;
}

function getRiskColor(
  theme: Theme,
  risk: AdminApplicationRiskLevel,
) {
  if (risk === "critical") {
    return theme.palette.error.main;
  }

  if (risk === "high") {
    return theme.palette.warning.main;
  }

  if (risk === "medium") {
    return theme.palette.info.main;
  }

  return theme.palette.success.main;
}