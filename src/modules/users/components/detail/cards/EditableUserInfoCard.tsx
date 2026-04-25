// src/modules/users/components/detail/cards/EditableUserInfoCard.tsx
"use client";

import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export type EditableUserInfoField = {
  key: string;
  label: string;
  value?: string | null;
  editable?: boolean;
  multiline?: boolean;
  minRows?: number;
  icon?: React.ReactNode;
  action?: React.ReactNode;
};

type Props = {
  title: string;
  fields: EditableUserInfoField[];
  isEditing: boolean;
  isSaving?: boolean;
  error?: string | null;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (form: Record<string, string>) => void | Promise<void>;
  icon?: React.ReactNode;
  editLabel: string;
  cancelLabel: string;
  saveLabel: string;
};

function toInitialForm(fields: EditableUserInfoField[]): Record<string, string> {
  return fields.reduce<Record<string, string>>((acc, field) => {
    acc[field.key] = field.value ?? "";
    return acc;
  }, {});
}

function isEmptyValue(value?: string | null) {
  return !value || !value.trim();
}

export default function EditableUserInfoCard({
  title,
  fields,
  isEditing,
  isSaving = false,
  error = null,
  onEdit,
  onCancel,
  onSave,
  icon,
  editLabel,
  cancelLabel,
  saveLabel,
}: Props) {
  const [form, setForm] = React.useState<Record<string, string>>(() =>
    toInitialForm(fields)
  );

  React.useEffect(() => {
    setForm(toInitialForm(fields));
  }, [fields]);

  const hasEditableField = fields.some((x) => x.editable);

  const isDirty = React.useMemo(() => {
    return fields.some((field) => (field.value ?? "") !== (form[field.key] ?? ""));
  }, [fields, form]);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleCancel = () => {
    setForm(toInitialForm(fields));
    onCancel();
  };

  const handleSave = async () => {
    await onSave(form);
  };

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 4,
        overflow: "hidden",
        backgroundColor: "background.paper",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.2,
            minWidth: 0,
          }}
        >
          {icon && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                opacity: 0.95,
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
          )}

          <Typography
            variant="subtitle1"
            fontWeight={700}
            sx={{
              color: "#fff",
              letterSpacing: 0.3,
              lineHeight: 1.3,
              minWidth: 0,
            }}
          >
            {title}
          </Typography>
        </Box>

        {hasEditableField && !isEditing && (
          <Button
            variant="outlined"
            size="small"
            onClick={onEdit}
            startIcon={<EditOutlinedIcon fontSize="small" />}
            sx={{
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 700,
              color: "#fff",
              borderColor: "rgba(255,255,255,0.55)",
              backgroundColor: "rgba(255,255,255,0.08)",
              whiteSpace: "nowrap",
              "&:hover": {
                borderColor: "#fff",
                backgroundColor: "rgba(255,255,255,0.14)",
              },
            }}
          >
            {editLabel}
          </Button>
        )}

        {hasEditableField && isEditing && (
          <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleCancel}
              disabled={isSaving}
              startIcon={<CloseOutlinedIcon fontSize="small" />}
              sx={{
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 700,
                color: "#fff",
                borderColor: "rgba(255,255,255,0.55)",
                backgroundColor: "rgba(255,255,255,0.08)",
                "&:hover": {
                  borderColor: "#fff",
                  backgroundColor: "rgba(255,255,255,0.14)",
                },
              }}
            >
              {cancelLabel}
            </Button>

            <Button
              variant="contained"
              size="small"
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              startIcon={
                isSaving ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <SaveOutlinedIcon fontSize="small" />
                )
              }
              sx={{
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 700,
                whiteSpace: "nowrap",
                backgroundColor: "#fff",
                color: "primary.main",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.92)",
                  boxShadow: "none",
                },
                "&.Mui-disabled": {
                  backgroundColor: "rgba(255,255,255,0.45)",
                  color: "rgba(0,0,0,0.35)",
                },
              }}
            >
              {saveLabel}
            </Button>
          </Stack>
        )}
      </Box>

      <CardContent
        sx={{
          p: { xs: 2.5, md: 3 },
          flex: 1,
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack
          divider={<Divider flexItem sx={{ borderColor: "divider" }} />}
          spacing={0}
        >
          {fields.map((field, index) => {
            const editable = !!field.editable && isEditing;
            const currentValue = form[field.key] ?? "";
            const displayValue = field.value ?? "";
            const fieldIcon = field.icon ?? <InfoOutlinedIcon fontSize="small" />;

            return (
              <Box
                key={`${field.key}-${index}`}
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "24px minmax(88px, 108px) 12px minmax(0, 1fr)",
                    sm: "24px minmax(120px, 150px) 12px minmax(0, 1fr)",
                  },
                  columnGap: 1,
                  alignItems: "start",
                  py: 1.5,
                }}
              >
                <Box
                  sx={{
                    mt: editable ? "10px" : "2px",
                    minHeight: 24,
                    color: "text.secondary",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {fieldIcon}
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 600,
                    lineHeight: 1.6,
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                    pt: editable ? "8px" : 0,
                  }}
                >
                  {field.label}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 600,
                    lineHeight: 1.6,
                    textAlign: "center",
                    pt: editable ? "8px" : 0,
                  }}
                >
                  :
                </Typography>

                <Box sx={{ minWidth: 0 }}>
                  {editable ? (
                    <TextField
                      fullWidth
                      size="small"
                      value={currentValue}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      multiline={field.multiline}
                      minRows={field.multiline ? (field.minRows ?? 3) : undefined}
                    />
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1.5,
                        minWidth: 0,
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          color: isEmptyValue(displayValue)
                            ? "text.secondary"
                            : "text.primary",
                          fontWeight: isEmptyValue(displayValue) ? 500 : 700,
                          lineHeight: 1.6,
                          wordBreak: "break-word",
                          overflowWrap: "anywhere",
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        {isEmptyValue(displayValue) ? "—" : displayValue}
                      </Typography>

                      {field.action && <Box sx={{ flexShrink: 0 }}>{field.action}</Box>}
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}