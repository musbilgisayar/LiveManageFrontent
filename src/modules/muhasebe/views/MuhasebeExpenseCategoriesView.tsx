"use client";

import React, { useMemo, useState } from "react";
import {
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Drawer,
  Fade,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  IconEdit,
  IconPlus,
  IconSearch,
  IconTrash,
  IconX,
  IconSettings,
} from "@tabler/icons-react";
import { useMuhasebeExpenseCategories } from "@/modules/muhasebe/hooks/useMuhasebeExpenseCategories";
import type { ExpenseCategory } from "@/modules/muhasebe/types/MuhasebeExpenseCategory.types";

type CategoryStatus = "active" | "inactive";

interface CategoryForm {
  name: string;
  code: string;
  description: string;
  isActive: boolean;
}

const INITIAL_FORM: CategoryForm = {
  name: "",
  code: "",
  description: "",
  isActive: true,
};

export default function MuhasebeExpenseCategoriesView() {
  const theme = useTheme();

  const { categories, create, update, toggleActive } = useMuhasebeExpenseCategories();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | CategoryStatus>("all");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>(INITIAL_FORM);

  const filtered = useMemo(() => {
    let list = [...categories];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (x) =>
          x.name.toLowerCase().includes(q) ||
          x.code.toLowerCase().includes(q),
      );
    }

    if (statusFilter !== "all") {
      list = list.filter((x) =>
        statusFilter === "active" ? x.isActive : !x.isActive,
      );
    }

    return list.sort((a, b) => a.sortOrder - b.sortOrder);
  }, [categories, search, statusFilter]);

  const openCreate = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setDrawerOpen(true);
  };

  const openEdit = (item: ExpenseCategory) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      code: item.code,
      description: item.description || "",
      isActive: item.isActive,
    });
    setDrawerOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;

    const normalizedCode =
      form.code.trim() ||
      form.name
        .trim()
        .toUpperCase()
        .replaceAll(" ", "_")
        .replaceAll("İ", "I")
        .replaceAll("Ş", "S")
        .replaceAll("Ğ", "G")
        .replaceAll("Ü", "U")
        .replaceAll("Ö", "O")
        .replaceAll("Ç", "C");

    if (editingId) {
      update(editingId, {
        name: form.name.trim(),
        code: normalizedCode,
        description: form.description.trim() || undefined,
        isActive: form.isActive,
      });
    } else {
      create({
        name: form.name.trim(),
        code: normalizedCode,
        description: form.description.trim() || undefined,
        isActive: form.isActive,
        isSystem: false,
        sortOrder: categories.length + 1,
      });
    }

    setDrawerOpen(false);
    setEditingId(null);
    setForm(INITIAL_FORM);
  };

  const handleToggleActive = (item: ExpenseCategory) => {
    toggleActive(item.id);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={900}>
            Gider Kalemleri
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gider kategorilerini yönetin
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<IconPlus size={18} />}
          onClick={openCreate}
        >
          Yeni Kalem
        </Button>
      </Stack>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2}>
            <TextField
              size="small"
              placeholder="Ara..."
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={18} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              select
              size="small"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as CategoryStatus | "all")
              }
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="all">Tümü</MenuItem>
              <MenuItem value="active">Aktif</MenuItem>
              <MenuItem value="inactive">Pasif</MenuItem>
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      <Stack spacing={2}>
        {filtered.map((item) => (
          <Fade in key={item.id}>
            <Card
              sx={{
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
              }}
            >
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar>
                      <IconSettings size={18} />
                    </Avatar>

                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography fontWeight={800}>{item.name}</Typography>

                        {item.isSystem && (
                          <Chip size="small" label="Sistem" color="info" />
                        )}

                        <Chip
                          size="small"
                          label={item.isActive ? "Aktif" : "Pasif"}
                          color={item.isActive ? "success" : "default"}
                          variant={item.isActive ? "filled" : "outlined"}
                        />
                      </Stack>

                      <Typography variant="caption" color="text.secondary">
                        {item.code}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Switch
                      checked={item.isActive}
                      onChange={() => handleToggleActive(item)}
                    />

                    <Tooltip title="Düzenle">
                      <IconButton onClick={() => openEdit(item)}>
                        <IconEdit size={18} />
                      </IconButton>
                    </Tooltip>

                    {!item.isSystem && (
                      <Tooltip title="Pasife al">
                        <IconButton onClick={() => handleToggleActive(item)}>
                          <IconTrash size={18} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Fade>
        ))}
      </Stack>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: "100%", sm: 420 } } }}
      >
        <Box sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" mb={2}>
            <Typography fontWeight={900}>
              {editingId ? "Kalemi Düzenle" : "Yeni Kalem"}
            </Typography>

            <IconButton onClick={() => setDrawerOpen(false)}>
              <IconX size={18} />
            </IconButton>
          </Stack>

          <Stack spacing={2}>
            <TextField
              label="Ad"
              value={form.name}
              onChange={(e) =>
                setForm((p) => ({ ...p, name: e.target.value }))
              }
            />

            <TextField
              label="Kod"
              value={form.code}
              onChange={(e) =>
                setForm((p) => ({ ...p, code: e.target.value }))
              }
              helperText="Boş bırakılırsa addan otomatik üretilir."
            />

            <TextField
              label="Açıklama"
              multiline
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
            />

            <Stack direction="row" alignItems="center" spacing={1}>
              <Switch
                checked={form.isActive}
                onChange={(e) =>
                  setForm((p) => ({ ...p, isActive: e.target.checked }))
                }
              />
              <Typography>Aktif</Typography>
            </Stack>

            <Divider />

            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              <Button onClick={() => setDrawerOpen(false)}>İptal</Button>
              <Button variant="contained" onClick={handleSave}>
                Kaydet
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  );
}