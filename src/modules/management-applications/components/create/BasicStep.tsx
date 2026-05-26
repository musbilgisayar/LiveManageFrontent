// src/modules/management-applications/components/create/BasicStep.tsx
"use client";

import {
  alpha,
  Box,
  Chip,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";

import type { Theme } from "@mui/material/styles";

import {
  IconBuildingCommunity,
  IconCheck,
  IconFileDescription,
  IconId,
  IconMail,
  IconPhone,
  IconShieldCheck,
} from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";

import type {
  ManagementApplicationFormErrors as FormErrors,
  ManagementApplicationFormState as FormState,
  ManagementStructureType,
  RepresentationType,
} from "../../types/managementApplication.types";

import {
  representationOptions,
  structureOptions,
} from "./constants";

type BasicStepProps = {
  form: FormState;
  errors: FormErrors;
  applicantFullName: string;
  applicantEmail: string;
  applicantPhone: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  onPatch: <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => void;
};

const KEYS = {
  title:
    "management-applications:create.basic.title",

  description:
    "management-applications:create.basic.description",

  verifiedSource:
    "management-applications:create.basic.verifiedSource",

  applicant:
    "management-applications:create.basic.applicant",

  contactEmail:
    "management-applications:create.basic.contact.email",

  contactPhone:
    "management-applications:create.basic.contact.phone",

  verified:
    "management-applications:create.basic.verified",

  notVerified:
    "management-applications:create.basic.notVerified",

  structureTitle:
    "management-applications:create.basic.structure.title",

  structureDescription:
    "management-applications:create.basic.structure.description",

  structureSelectLabel:
    "management-applications:create.basic.structure.selectLabel",

  representationTitle:
    "management-applications:create.basic.representation.title",

  representationDescription:
    "management-applications:create.basic.representation.description",

  propertyName:
    "management-applications:create.basic.fields.propertyName",

  propertyNameDescription:
    "management-applications:create.basic.fields.propertyNameDescription",

  propertyNameHint:
    "management-applications:create.basic.fields.propertyNameHint",

  authorityTitle:
    "management-applications:create.basic.authority.title",

  authorityDescription:
    "management-applications:create.basic.authority.description",

  identityNumber:
    "management-applications:create.basic.fields.identityNumber",

  identityNumberHint:
    "management-applications:create.basic.fields.identityNumberHint",

  authorityStartDate:
    "management-applications:create.basic.fields.authorityStartDate",

  authorityEndDate:
    "management-applications:create.basic.fields.authorityEndDate",

  authorityEndDateHint:
    "management-applications:create.basic.fields.authorityEndDateHint",
} as const;

export default function BasicStep({
  form,
  errors,
  applicantFullName,
  applicantEmail,
  applicantPhone,
  isEmailVerified,
  isPhoneVerified,
  onPatch,
}: BasicStepProps) {
  const theme = useTheme<Theme>();

  const { t } = useI18nNs("management-applications");

  const tr = (
    fullKey: string,
    fallback: string,
  ) => {
    const value = t(fullKey);

    if (!value) return fallback;
    if (value === fullKey) return fallback;
    if (value === `[${fullKey}]`) return fallback;

    return value;
  };

  const trDirect = (
    key: string,
    fallback: string,
  ) => {
    const value = t(key);

    if (!value) return fallback;
    if (value === key) return fallback;
    if (value === `[${key}]`) return fallback;

    return value;
  };

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 3,
      bgcolor: "background.paper",
      boxShadow: `0 12px 28px ${alpha(
        theme.palette.common.black,
        theme.palette.mode === "dark"
          ? 0.22
          : 0.04,
      )}`,
      transition: "all 180ms ease",

      "& input::placeholder": {
        color: alpha(
          theme.palette.text.secondary,
          0.42,
        ),
        opacity: 1,
        fontWeight: 400,
      },

      "&:hover": {
        boxShadow: `0 16px 36px ${alpha(
          theme.palette.common.black,
          theme.palette.mode === "dark"
            ? 0.28
            : 0.06,
        )}`,
      },

      "&.Mui-focused": {
        boxShadow: `0 18px 42px ${alpha(
          theme.palette.primary.main,
          0.13,
        )}`,
      },
    },

    "& .MuiInputLabel-root": {
      color: alpha(
        theme.palette.text.secondary,
        0.72,
      ),
      fontWeight: 700,
    },
  };

  const identityItems = [
    {
      icon: <IconId size={18} />,
      label: tr(
        KEYS.applicant,
        "Başvuran kişi",
      ),
      value: applicantFullName || "-",
      verificationState: "none" as const,
    },
    {
      icon: <IconMail size={18} />,
      label: tr(
        KEYS.contactEmail,
        "E-posta",
      ),
      value:
        applicantEmail ||
        form.contactEmail ||
        "-",
      verificationState: isEmailVerified
        ? ("verified" as const)
        : ("unverified" as const),
    },
    {
      icon: <IconPhone size={18} />,
      label: tr(
        KEYS.contactPhone,
        "Telefon",
      ),
      value:
        applicantPhone ||
        form.contactPhone ||
        "-",
      verificationState: isPhoneVerified
        ? ("verified" as const)
        : ("unverified" as const),
    },
  ];

  return (
    <Stack spacing={2.5}>
      <Box
        sx={{
          p: {
            xs: 2,
            md: 2.5,
          },
          borderRadius: 5,
          border: "1px solid",
          borderColor: alpha(
            theme.palette.primary.main,
            0.14,
          ),
          bgcolor: "background.paper",
          background: `
            radial-gradient(circle at top right, ${alpha(
              theme.palette.primary.main,
              0.08,
            )} 0%, transparent 36%),
            linear-gradient(135deg, ${alpha(
              theme.palette.background.paper,
              0.98,
            )}, ${alpha(
              theme.palette.background.default,
              0.58,
            )})
          `,
          boxShadow: `0 22px 64px ${alpha(
            theme.palette.common.black,
            theme.palette.mode === "dark"
              ? 0.3
              : 0.07,
          )}`,
        }}
      >
        <Stack spacing={2.2}>
          <Stack
            direction={{
              xs: "column",
              md: "row",
            }}
            spacing={1.5}
            justifyContent="space-between"
            alignItems={{
              xs: "flex-start",
              md: "center",
            }}
          >
            <Box>
              <Typography
                fontWeight={950}
                sx={{
                  fontSize: {
                    xs: 21,
                    md: 25,
                  },
                  letterSpacing: "-0.04em",
                  lineHeight: 1.12,
                }}
              >
                {tr(
                  KEYS.title,
                  "Temel başvuru bilgileri",
                )}
              </Typography>

              <Typography
                sx={{
                  mt: 0.7,
                  maxWidth: 760,
                  color: alpha(
                    theme.palette.text.secondary,
                    0.82,
                  ),
                  fontSize: 14.5,
                  lineHeight: 1.7,
                  fontWeight: 500,
                }}
              >
                {tr(
                  KEYS.description,
                  "Başvuru sahibi, temsil şekli ve yönetilecek yapıya ait temel bilgileri kontrol edin.",
                )}
              </Typography>
            </Box>

            <Chip
              icon={
                <IconShieldCheck size={15} />
              }
              label={tr(
                KEYS.verifiedSource,
                "Kimlik bilgileri hesaptan alınır",
              )}
              size="small"
            />
          </Stack>

          <Stack spacing={1.2}>
            {identityItems.map((item) => (
              <Box
                key={item.label}
                sx={{
                  p: 1.25,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: alpha(
                    theme.palette.divider,
                    0.68,
                  ),
                }}
              >
                <Stack
                  direction="row"
                  spacing={1.2}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    {item.icon}

                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 900,
                          fontSize: 13,
                        }}
                      >
                        {item.label}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {item.value}
                      </Typography>
                    </Box>
                  </Stack>

                  {item.verificationState ===
                    "verified" && (
                    <Chip
                      icon={
                        <IconCheck size={13} />
                      }
                      label={tr(
                        KEYS.verified,
                        "Doğrulandı",
                      )}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  )}

                  {item.verificationState ===
                    "unverified" && (
                    <Chip
                      label={tr(
                        KEYS.notVerified,
                        "Doğrulanmadı",
                      )}
                      size="small"
                      color="warning"
                      variant="outlined"
                    />
                  )}
                </Stack>
              </Box>
            ))}
          </Stack>
        </Stack>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr",
          },
          gap: 2,
        }}
      >
        <TextField
          select
          label={tr(
            KEYS.structureSelectLabel,
            "Yapı türü",
          )}
          value={form.structureType || ""}
          onChange={(event) =>
            onPatch(
              "structureType",
              event.target.value as ManagementStructureType,
            )
          }
          fullWidth
          error={!!errors.structureType}
          helperText={errors.structureType}
          sx={fieldSx}
        >
          {structureOptions.map((item) => (
            <MenuItem
              key={item.value}
              value={item.value}
            >
              {trDirect(
                item.labelKey,
                item.fallbackLabel,
              )}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label={tr(
            KEYS.representationTitle,
            "Temsil şekli",
          )}
          value={form.representationType || ""}
          onChange={(event) =>
            onPatch(
              "representationType",
              event.target.value as RepresentationType,
            )
          }
          fullWidth
          error={!!errors.representationType}
          helperText={
            errors.representationType
          }
          sx={fieldSx}
        >
          {representationOptions.map(
            (item) => (
              <MenuItem
                key={item.value}
                value={item.value}
              >
                {trDirect(
                  item.labelKey,
                  item.fallbackLabel,
                )}
              </MenuItem>
            ),
          )}
        </TextField>
      </Box>

      <TextField
        label={tr(
          KEYS.propertyName,
          "Yapı adı",
        )}
        placeholder={tr(
          KEYS.propertyNameHint,
          "Örn: Green Park Sitesi",
        )}
        value={form.propertyName}
        onChange={(event) =>
          onPatch(
            "propertyName",
            event.target.value,
          )
        }
        fullWidth
        error={!!errors.propertyName}
        helperText={
          errors.propertyName ||
          tr(
            KEYS.propertyNameDescription,
            "Başvuruda görünecek site, apartman veya yapı adını yazın.",
          )
        }
        sx={fieldSx}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr 1fr",
          },
          gap: 2,
        }}
      >
        <TextField
          label={tr(
            KEYS.identityNumber,
            "Kimlik / vergi numarası",
          )}
          placeholder={tr(
            KEYS.identityNumberHint,
            "TCKN, VKN veya kayıt no",
          )}
          value={form.taxOrIdentityNumber}
          onChange={(event) =>
            onPatch(
              "taxOrIdentityNumber",
              event.target.value,
            )
          }
          fullWidth
          error={
            !!errors.taxOrIdentityNumber
          }
          helperText={
            errors.taxOrIdentityNumber
          }
          sx={fieldSx}
        />

        <TextField
          type="date"
          label={tr(
            KEYS.authorityStartDate,
            "Yetki başlangıç tarihi",
          )}
          value={form.authorityStartDate}
          onChange={(event) =>
            onPatch(
              "authorityStartDate",
              event.target.value,
            )
          }
          fullWidth
          error={
            !!errors.authorityStartDate
          }
          helperText={
            errors.authorityStartDate
          }
          InputLabelProps={{
            shrink: true,
          }}
          sx={fieldSx}
        />

        <TextField
          type="date"
          label={tr(
            KEYS.authorityEndDate,
            "Yetki bitiş tarihi",
          )}
          value={form.authorityEndDate}
          onChange={(event) =>
            onPatch(
              "authorityEndDate",
              event.target.value,
            )
          }
          fullWidth
          error={
            !!errors.authorityEndDate
          }
          helperText={
            errors.authorityEndDate ||
            tr(
              KEYS.authorityEndDateHint,
              "Süreli yetki yoksa boş bırakın",
            )
          }
          InputLabelProps={{
            shrink: true,
          }}
          sx={fieldSx}
        />
      </Box>
    </Stack>
  );
}