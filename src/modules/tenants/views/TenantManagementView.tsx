// src/modules/tenants/views/TenantManagementView.tsx

"use client";

import { useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
} from "@mui/material";

import {
  IconBuildingCommunity,
  IconPlus,
} from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";

import TenantFormDialog from "../components/TenantFormDialog";
import TenantListTable from "../components/TenantListTable";
import TenantSummaryCards from "../components/TenantSummaryCards";

import { useTenants } from "../hooks/useTenants";

import type {
  TenantDetailDto,
  TenantListItemDto,
} from "../types/Tenant.types";

export default function TenantManagementView() {
  const { t } = useI18nNs("tenants");

  const [includeInactive, setIncludeInactive] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);

  const [dialogMode, setDialogMode] = useState<"create" | "edit">(
    "create"
  );

  const [selectedTenant, setSelectedTenant] =
    useState<TenantDetailDto | null>(null);

  const {
    tenants,
    loading,
    saving,
    error,

    totalCount,
    activeCount,
    passiveCount,

    reload,
    loadTenantDetail,

    createNewTenant,
    updateExistingTenant,
    changeTenantStatus,
  } = useTenants(includeInactive);

  const handleOpenCreate = () => {
    setSelectedTenant(null);
    setDialogMode("create");
    setDialogOpen(true);
  };

  const handleViewTenant = async (
    tenant: TenantListItemDto
  ) => {
    const detail = await loadTenantDetail(tenant.id);

    if (!detail) {
      return;
    }

    setSelectedTenant(detail);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (saving) {
      return;
    }

    setDialogOpen(false);
  };

  return (
    <Box>
      <Stack spacing={3}>
        <Card
          sx={{
            borderRadius: 3,
          }}
        >
          <CardContent>
            <Stack
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
            >
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                  }}
                >
                  <IconBuildingCommunity size={24} />
                </Box>

                <Box>
                  <Typography
                    variant="h5"
                    fontWeight={800}
                  >
                    {t("tenants:title")}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {t("tenants:subtitle")}
                  </Typography>
                </Box>
              </Stack>

              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={includeInactive}
                      onChange={(event) =>
                        setIncludeInactive(
                          event.target.checked
                        )
                      }
                    />
                  }
                  label={t("tenants:actions.showInactive")}
                />

                <Button
                  variant="contained"
                  startIcon={<IconPlus size={18} />}
                  onClick={handleOpenCreate}
                >
                  {t("tenants:actions.create")}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {error ? (
          <Alert severity="error">
            {error}
          </Alert>
        ) : null}

        <TenantSummaryCards
          totalCount={totalCount}
          activeCount={activeCount}
          passiveCount={passiveCount}
        />

        <TenantListTable
          tenants={tenants}
          loading={loading}
          onRefresh={reload}
          onView={handleViewTenant}
        />

        <TenantFormDialog
          open={dialogOpen}
          mode={dialogMode}
          tenant={selectedTenant}
          saving={saving}
          error={error}
          onClose={handleCloseDialog}
          onCreate={createNewTenant}
          onUpdate={updateExistingTenant}
          onStatusChange={changeTenantStatus}
        />
      </Stack>
    </Box>
  );
}