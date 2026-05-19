"use client";

import {
  alpha,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";

import {
  IconAlertTriangle,
  IconDeviceFloppy,
  IconShieldLock,
  IconX,
} from "@tabler/icons-react";

import { Controller, useForm } from "react-hook-form";

import { useI18nNs } from "@/app/context/i18nContext";

interface RoleEditFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RoleFormValues) => void;
  defaultValues: RoleFormValues;
}

export interface RoleFormValues {
  id: string;
  name: string;
  description: string;
  priority: number;
  category: number;
  isSensitive: boolean;
  complianceTag: string;
  expirationDate: string;
  permissions: string[];
  isDeleted: boolean;
}

function getCategoryColor(category: number) {
  switch (category) {
    case 1:
      return "error";

    case 2:
      return "primary";

    case 3:
      return "success";

    default:
      return "default";
  }
}

export default function RoleEditDialog({
  open,
  onClose,
  onSubmit,
  defaultValues,
}: RoleEditFormProps) {
  const theme = useTheme();

  const { t } = useI18nNs(["roles"]);

  const tr = (key: string, fallback: string) => {
    const value = t(key);

    return !value || value === key || value === `[${key}]`
      ? fallback
      : value;
  };

  const { control, handleSubmit } =
    useForm<RoleFormValues>({
      defaultValues,
    });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 5,
          overflow: "hidden",

          border: `1px solid ${alpha(
            theme.palette.primary.main,
            0.14,
          )}`,
        },
      }}
    >
      <DialogTitle
        sx={{
          px: 3,
          py: 2.5,

          background: alpha(
            theme.palette.primary.main,
            0.06,
          ),
        }}
      >
        <Stack spacing={1.5}>
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,

                display: "grid",
                placeItems: "center",

                bgcolor: alpha(
                  theme.palette.primary.main,
                  0.12,
                ),

                color: theme.palette.primary.main,
              }}
            >
              <IconShieldLock size={24} />
            </Box>

            <Box>
              <Typography
                variant="h5"
                fontWeight={900}
              >
                {tr(
                  "roles:edit.title",
                  "Rol düzenle",
                )}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                {tr(
                  "roles:edit.description",
                  "Rol özelliklerini ve güvenlik seviyesini güncelleyin.",
                )}
              </Typography>
            </Box>
          </Stack>

          {defaultValues.isSensitive ? (
            <Chip
              color="error"
              icon={
                <IconAlertTriangle size={16} />
              }
              label={tr(
                "roles:sensitive",
                "Hassas rol",
              )}
              sx={{
                alignSelf: "flex-start",
                fontWeight: 700,
              }}
            />
          ) : null}
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Stack
            direction={{
              xs: "column",
              md: "row",
            }}
            spacing={2}
          >
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={tr(
                    "roles:fields.name",
                    "Rol adı",
                  )}
                  fullWidth
                />
              )}
            />

            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  label={tr(
                    "roles:fields.priority",
                    "Öncelik",
                  )}
                  fullWidth
                />
              )}
            />
          </Stack>

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={tr(
                  "roles:fields.description",
                  "Açıklama",
                )}
                fullWidth
                multiline
                rows={4}
              />
            )}
          />

          <Stack
            direction={{
              xs: "column",
              md: "row",
            }}
            spacing={2}
          >
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label={tr(
                    "roles:fields.category",
                    "Kategori",
                  )}
                  fullWidth
                >
                  <MenuItem value={1}>
                    {tr(
                      "roles:categories.system",
                      "Sistem",
                    )}
                  </MenuItem>

                  <MenuItem value={2}>
                    {tr(
                      "roles:categories.organization",
                      "Organizasyon",
                    )}
                  </MenuItem>

                  <MenuItem value={3}>
                    {tr(
                      "roles:categories.custom",
                      "Özel",
                    )}
                  </MenuItem>
                </TextField>
              )}
            />

            <Controller
              name="complianceTag"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={tr(
                    "roles:fields.complianceTag",
                    "Compliance etiketi",
                  )}
                  fullWidth
                />
              )}
            />
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
          >
            <Chip
              size="small"
              color={getCategoryColor(
                defaultValues.category,
              )}
              label={`${tr(
                "roles:fields.category",
                "Kategori",
              )}: ${defaultValues.category}`}
            />

            <Chip
              size="small"
              variant="outlined"
              label={`ID: ${defaultValues.id}`}
            />
          </Stack>

          <Divider />

          <Controller
            name="isSensitive"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={field.value}
                    onChange={(e) =>
                      field.onChange(
                        e.target.checked,
                      )
                    }
                  />
                }
                label={tr(
                  "roles:fields.isSensitive",
                  "Hassas rol",
                )}
              />
            )}
          />

          <Controller
            name="isDeleted"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={field.value}
                    onChange={(e) =>
                      field.onChange(
                        e.target.checked,
                      )
                    }
                  />
                }
                label={tr(
                  "roles:fields.isDeleted",
                  "Pasif / silinmiş",
                )}
              />
            )}
          />
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
        }}
      >
        <Button
          color="inherit"
          startIcon={<IconX size={18} />}
          onClick={onClose}
          sx={{
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          {tr(
            "roles:action.cancel",
            "İptal",
          )}
        </Button>

        <Button
          variant="contained"
          startIcon={
            <IconDeviceFloppy size={18} />
          }
          onClick={handleSubmit(onSubmit)}
          sx={{
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 800,
          }}
        >
          {tr(
            "roles:action.save",
            "Kaydet",
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}