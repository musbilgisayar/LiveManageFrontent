"use client";

import React from "react";

import {
  alpha,
  Box,
  Card,
  CardContent,
  MenuItem,
  TextField,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";

import {
  IconSearch,
} from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";

import {
  riskLabelKey,
  statusLabelKey,
} from "../../utils/adminManagementApplication.utils";

import type {
  AdminApplicationRiskLevel,
  AdminApplicationStatus,
  AdminManagementApplicationReviewFilter,
} from "../../types/adminManagementApplication.types";

type ReviewListFiltersProps = {
  filter: AdminManagementApplicationReviewFilter;

  onSearchChange: (value: string) => void;

  onStatusChange: (
    value: AdminApplicationStatus | "all",
  ) => void;

  onRiskChange: (
    value: AdminApplicationRiskLevel | "all",
  ) => void;
};

export default function ReviewListFilters({
  filter,
  onSearchChange,
  onStatusChange,
  onRiskChange,
}: ReviewListFiltersProps) {
  const theme = useTheme<Theme>();

  const { t } =
    useI18nNs("management-applications");

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4,

        borderColor: alpha(
          theme.palette.text.primary,
          0.08,
        ),
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "grid",

            gridTemplateColumns: {
              xs: "1fr",

              md: "minmax(0, 1.4fr) 220px 220px",
            },

            gap: 1.4,
          }}
        >
          <TextField
            value={filter.search}
            onChange={(event) =>
              onSearchChange(
                event.target.value,
              )
            }
            placeholder={t(
              "admin.reviewList.filters.searchPlaceholder",
            )}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <IconSearch
                  size={18}
                  style={{
                    marginRight: 8,
                    opacity: 0.65,
                  }}
                />
              ),
            }}
          />

          <TextField
            select
            size="small"
            label={t(
              "admin.reviewList.filters.status",
            )}
            value={filter.status}
            onChange={(event) =>
              onStatusChange(
                event.target
                  .value as
                  | AdminApplicationStatus
                  | "all",
              )
            }
          >
            <MenuItem value="all">
              {t(
                "admin.reviewList.filters.allStatuses",
              )}
            </MenuItem>

            <MenuItem value="pending">
              {t(
                statusLabelKey(
                  "pending",
                ),
              )}
            </MenuItem>

            <MenuItem value="in_review">
              {t(
                statusLabelKey(
                  "in_review",
                ),
              )}
            </MenuItem>

            <MenuItem value="missing_information">
              {t(
                statusLabelKey(
                  "missing_information",
                ),
              )}
            </MenuItem>

            <MenuItem value="approved">
              {t(
                statusLabelKey(
                  "approved",
                ),
              )}
            </MenuItem>

            <MenuItem value="rejected">
              {t(
                statusLabelKey(
                  "rejected",
                ),
              )}
            </MenuItem>
          </TextField>

          <TextField
            select
            size="small"
            label={t(
              "admin.reviewList.filters.risk",
            )}
            value={filter.risk}
            onChange={(event) =>
              onRiskChange(
                event.target
                  .value as
                  | AdminApplicationRiskLevel
                  | "all",
              )
            }
          >
            <MenuItem value="all">
              {t(
                "admin.reviewList.filters.allRisks",
              )}
            </MenuItem>

            <MenuItem value="low">
              {t(
                riskLabelKey("low"),
              )}
            </MenuItem>

            <MenuItem value="medium">
              {t(
                riskLabelKey(
                  "medium",
                ),
              )}
            </MenuItem>

            <MenuItem value="high">
              {t(
                riskLabelKey("high"),
              )}
            </MenuItem>

            <MenuItem value="critical">
              {t(
                riskLabelKey(
                  "critical",
                ),
              )}
            </MenuItem>
          </TextField>
        </Box>
      </CardContent>
    </Card>
  );
}