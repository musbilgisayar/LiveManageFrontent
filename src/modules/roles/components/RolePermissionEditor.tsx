"use client";

import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Box,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import { ChevronDown } from "lucide-react";
import { useParams } from "next/navigation";
import { roleService } from "../services";
import { useSnackbar } from "notistack";

/**
 * 🎛️ RolePermissionEditor
 * Rolün izinlerini düzenlemek için kategori bazlı liste
 */
type PermissionItem = {
  key: string;
  name: string;
  description?: string;
  category?: string;
  granted: boolean;
};

type Props = {
  roleId: string;
  onClose?: () => void;
};

export function RolePermissionEditor({ roleId, onClose }: Props) {
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  const { locale } = useParams() as { locale?: string };
  const lang = locale ?? "tr";

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await roleService.getPermissions(roleId, { lang });
        if (mounted) setPermissions(data);
      } catch (err) {
        console.error("RolePermissionEditor load error:", err);
        enqueueSnackbar("❌ Failed to load permissions", { variant: "error" });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [roleId, lang, enqueueSnackbar]);

  const handleToggle = (key: string) => {
    setPermissions((prev) =>
      prev.map((p) =>
        p.key === key ? { ...p, granted: !p.granted } : p
      )
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const grantedKeys = permissions.filter((p) => p.granted).map((p) => p.key);
      await roleService.updatePermissions(roleId, grantedKeys, { lang });
      enqueueSnackbar("✅ Permissions updated", { variant: "success" });
      onClose?.();
    } catch (err) {
      enqueueSnackbar("❌ Failed to save permissions", { variant: "error" });
      console.error("RolePermissionEditor save error:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  // 🔹 Gruplama (kategori bazlı)
  const grouped = permissions.reduce((acc, p) => {
    const cat = p.category ?? "General";
    acc[cat] = acc[cat] ?? [];
    acc[cat].push(p);
    return acc;
  }, {} as Record<string, PermissionItem[]>);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Permissions
      </Typography>

      {Object.entries(grouped).map(([cat, items]) => (
        <Accordion key={cat} disableGutters>
          <AccordionSummary expandIcon={<ChevronDown size={18} />}>
            <Typography sx={{ fontWeight: 600 }}>{cat}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1}>
              {items.map((p) => (
                <FormControlLabel
                  key={p.key}
                  control={
                    <Checkbox
                      checked={p.granted}
                      onChange={() => handleToggle(p.key)}
                      color="primary"
                    />
                  }
                  label={p.name}
                />
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}

      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          color="inherit"
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={saving}
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </Stack>
    </Box>
  );
}
