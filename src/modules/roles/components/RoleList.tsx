// 📁 src/modules/roles/components/RoleList.tsx
"use client";

import React from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  CircularProgress,
  Tooltip,
  Box,
  Typography,
} from "@mui/material";
import { Chip } from "@mui/material";
import { Edit, Delete } from "lucide-react";
import type { RoleDto } from "../types";
import { useI18nNs } from "@/app/context/i18nContext"; // 🌍 senin veritabanı tabanlı çeviri sistemi

type Props = {
  roles: RoleDto[];
  isLoading?: boolean;
  labels: { name: string; description: string; actions: string };
  onEdit?: (role: RoleDto) => void;
  onDelete?: (role: RoleDto) => void;
};

/**
 * 📋 RoleList
 * - Kurumsal temaya uygun sade tablo
 * - Veritabanı tabanlı çeviri destekli
 */
export function RoleList({ roles, isLoading, labels, onEdit, onDelete }: Props) {
  const { t } = useI18nNs(["roles"]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (!roles || roles.length === 0) {
    return (
      <Typography
        variant="body2"
        sx={{
          textAlign: "center",
          py: 3,
          color: "text.secondary",
          fontStyle: "italic",
        }}
      >
        {t("roles:noData")}
      </Typography>
    );
  }

  return (
    <Table size="small" sx={{ minWidth: 500 }}>
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 600 }}>{labels.name}</TableCell>
          <TableCell sx={{ fontWeight: 600 }}>{labels.description}</TableCell>
          <TableCell sx={{ fontWeight: 600, width: 120, textAlign: "right" }}>
            {labels.actions}
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {roles.map((r) => (
          <TableRow
            key={r.id}
            hover
            sx={{
              "&:hover": { backgroundColor: "action.hover" },
              transition: "background 0.2s ease-in-out",
            }}
          >
            {/* 🧩 Role Name */}
            <TableCell>
                {r.name?.startsWith("roles:")
                  ? t(r.name)
                  : t(`roles:name.${r.name.toLowerCase()}`) || r.name}
            </TableCell>


            {/* 🧩 Role Description */}
            <TableCell>
              {r.description?.startsWith("roles:")
                ? t(r.description)
                : r.description ?? "-"}
            </TableCell>

             {/* 🧩 Aktif mi */}
            <TableCell align="center">
              {r.isActive ? (
                <Chip label={t("roles:active")} color="success" size="small" />
              ) : (
                <Chip label={t("roles:inactive")} color="default" size="small" />
              )}
            </TableCell>


            {/* 🧩 Actions */}
            <TableCell align="right">
              <Tooltip title={t("roles:action.edit")}>
                <IconButton size="small" color="primary" onClick={() => onEdit?.(r)}>
                  <Edit size={18} />
                </IconButton>
              </Tooltip>
              <Tooltip title={t("roles:action.delete")}>
                <IconButton size="small" color="error" onClick={() => onDelete?.(r)}>
                  <Delete size={18} />
                </IconButton>
              </Tooltip>
            </TableCell>



          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
