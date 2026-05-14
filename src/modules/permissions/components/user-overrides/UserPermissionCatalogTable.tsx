"use client";

import {
  Chip,
  LinearProgress,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { useI18nNs } from "@/app/context/i18nContext";
import type { UserPermissionCatalogRow } from "../../types/UserPermissionOverride.types";
import {
  getLevelLabel,
  getSafePermissionText,
} from "../../utils/userPermissionOverride.utils";

interface Props {
  rows: UserPermissionCatalogRow[];
  disabled: boolean;
  savingPermissionId: string | null;
  onToggle: (
    row: UserPermissionCatalogRow,
    nextChecked: boolean
  ) => void;
}

export default function UserPermissionCatalogTable({
  rows,
  disabled,
  savingPermissionId,
  onToggle,
}: Props) {
  const { t } = useI18nNs(["permission", "permissions"]);

  const getDescriptionText = (row: UserPermissionCatalogRow) => {
    const desc =
      getSafePermissionText(row.description) ||
      getSafePermissionText(row.displayName);

    if (!desc) {
      return "Açıklama yok";
    }

    if (desc.includes(":")) {
      return t(desc);
    }

    return desc;
  };

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>
            {t("permission:userOverrides.table.permission")}
          </TableCell>
          <TableCell>
            {t("permission:userOverrides.table.module")}
          </TableCell>
          <TableCell>
            {t("permission:userOverrides.table.scope")}
          </TableCell>
          <TableCell>
            {t("permission:userOverrides.table.source")}
          </TableCell>
          <TableCell align="right">
            {t("permission:userOverrides.table.direct")}
          </TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {rows.map((row) => {
          const saving = savingPermissionId === row.permissionId;

          return (
            <TableRow key={row.permissionId} hover>
              <TableCell>
                <Stack spacing={0.5}>
                  <Typography variant="body2" fontWeight={800}>
                    {row.permissionCode}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {getDescriptionText(row)}
                  </Typography>

                  {saving && <LinearProgress />}
                </Stack>
              </TableCell>

              <TableCell>{row.module}</TableCell>

              <TableCell>
                <Chip size="small" label={row.scope} />
              </TableCell>

              <TableCell>
                <Stack direction="row" spacing={0.5} flexWrap="wrap">
                  {row.isRoleSource && (
                    <Chip
                      size="small"
                      color="info"
                      label={t("permission:userOverrides.source.role")}
                    />
                  )}

                  {row.isDirect && (
                    <Chip
                      size="small"
                      color="success"
                      label={t("permission:userOverrides.source.direct")}
                    />
                  )}

                  <Chip
                    size="small"
                    variant="outlined"
                    label={getLevelLabel(row.level)}
                  />
                </Stack>
              </TableCell>

              <TableCell align="right">
                <Switch
                  checked={row.isDirect}
                  disabled={disabled || saving}
                  onChange={(e) => onToggle(row, e.target.checked)}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}