//src/modules/users/components/detail/cards/SocialMedia/SocialMediaManagerCard.tsx
 "use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandTiktok,
  IconBrandX,
  IconBrandYoutube,
  IconCirclePlus,
  IconEdit,
  IconExternalLink,
  IconLink,
  IconTrash,
  IconWorld,
} from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";
import { useSocialMediaAccounts } from "@/modules/users/hooks/useSocialMediaAccounts";
import type {
  SocialMediaAccountListItemDto,
  SocialMediaFormValues,
} from "@/modules/users/types/UserSocialMedia.types";
import UserDetailCard from "../UserDetailCard";
import SocialMediaFormDialog from "./SocialMediaFormDialog";
import SocialMediaDeleteDialog from "./SocialMediaDeleteDialog";

type Props = {
  ownerType: string;
  ownerId: string;
  title?: string;
  canEdit?: boolean;
};

type EditTarget = SocialMediaAccountListItemDto | null;

const EMPTY_FORM: SocialMediaFormValues = {
  platform: "LinkedIn",
  url: "",
  userNameOrHandle: "",
  displayName: "",
  isPrimary: false,
  isActive: true,
  sortOrder: 0,
};

function normalizeHandle(value?: string | null) {
  if (!value) return "";
  return value.trim().replace(/^@+/, "").replace(/\s+/g, "");
}

function buildUrl(platform?: string, rawHandle?: string | null) {
  const handle = normalizeHandle(rawHandle);
  if (!platform || !handle) return "";

  switch (platform) {
    case "LinkedIn":
      return `https://www.linkedin.com/in/${handle}`;
    case "Instagram":
      return `https://www.instagram.com/${handle}`;
    case "Facebook":
      return `https://www.facebook.com/${handle}`;
    case "X":
      return `https://x.com/${handle}`;
    case "YouTube":
      return `https://www.youtube.com/@${handle}`;
    case "TikTok":
      return `https://www.tiktok.com/@${handle}`;
    case "Website":
      return `https://${handle}`;
    case "Other":
      return handle.startsWith("http://") || handle.startsWith("https://")
        ? handle
        : `https://${handle}`;
    default:
      return "";
  }
}

function getPlatformIcon(platform?: string) {
  const normalized = (platform ?? "").toLowerCase();

  if (normalized === "linkedin") return <IconBrandLinkedin size={18} />;
  if (normalized === "instagram") return <IconBrandInstagram size={18} />;
  if (normalized === "facebook") return <IconBrandFacebook size={18} />;
  if (normalized === "x" || normalized === "twitter") return <IconBrandX size={18} />;
  if (normalized === "youtube") return <IconBrandYoutube size={18} />;
  if (normalized === "tiktok") return <IconBrandTiktok size={18} />;
  if (normalized === "website") return <IconWorld size={18} />;

  return <IconLink size={18} />;
}

function buildFormFromItem(item: SocialMediaAccountListItemDto): SocialMediaFormValues {
  return {
    platform: item.platform ?? "LinkedIn",
    url: item.url ?? "",
    userNameOrHandle: item.userNameOrHandle ?? "",
    displayName: item.displayName ?? "",
    isPrimary: item.isPrimary ?? false,
    isActive: item.isActive ?? true,
    sortOrder: item.sortOrder ?? 0,
  };
}

function buildSocialTitle(item: SocialMediaAccountListItemDto): string {
  return item.displayName || item.platform || "-";
}

function buildSocialMeta(item: SocialMediaAccountListItemDto): string {
  const parts = [
    item.userNameOrHandle ? `@${item.userNameOrHandle.replace(/^@/, "")}` : null,
    item.url || null,
  ];

  return parts.filter(Boolean).join(" • ");
}

export default function SocialMediaManagerCard({
  ownerType,
  ownerId,
  title,
  canEdit = true,
}: Props) {
  const { t } = useI18nNs(["users", "common"]);

  const {
    items,
    isLoading,
    isValidating,
    error,
    createFromForm,
    updateFromForm,
    deleteItem,
  } = useSocialMediaAccounts({
    ownerType,
    ownerId,
    enabled: Boolean(ownerType && ownerId),
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EditTarget>(null);
  const [deleteTarget, setDeleteTarget] = useState<EditTarget>(null);
  const [form, setForm] = useState<SocialMediaFormValues>(EMPTY_FORM);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const isEditMode = Boolean(editTarget);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const primaryCompare = Number(b.isPrimary) - Number(a.isPrimary);
      if (primaryCompare !== 0) return primaryCompare;

      const aSort = a.sortOrder ?? 999;
      const bSort = b.sortOrder ?? 999;
      return Number(aSort) - Number(bSort);
    });
  }, [items]);

  useEffect(() => {
    if (!dialogOpen) {
      setForm(EMPTY_FORM);
      setEditTarget(null);
      setSubmitError(null);
    }
  }, [dialogOpen]);

  const handleOpenCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setSubmitError(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: SocialMediaAccountListItemDto) => {
    setEditTarget(item);
    setForm(buildFormFromItem(item));
    setSubmitError(null);
    setDialogOpen(true);
  };

  const handleOpenDelete = (item: SocialMediaAccountListItemDto) => {
    setDeleteTarget(item);
    setDeleteOpen(true);
  };

  const handleCloseDelete = () => {
    if (deleteLoading) return;
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  const handleFormChange = (field: keyof SocialMediaFormValues, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    setSubmitLoading(true);

    const generatedUrl = buildUrl(form.platform, form.userNameOrHandle);

    const payloadForm: SocialMediaFormValues = {
      ...form,
      userNameOrHandle: normalizeHandle(form.userNameOrHandle),
      url: generatedUrl,
    };

    try {
      let ok = false;

      if (isEditMode && editTarget?.id) {
        ok = await updateFromForm(editTarget.id, payloadForm);

        if (ok) {
          setSuccessMessage(
            t("users:socialMedia.editSuccess", {
              defaultValue: "Sosyal medya hesabı başarıyla güncellendi.",
            })
          );
        }
      } else {
        ok = await createFromForm(payloadForm);

        if (ok) {
          setSuccessMessage(
            t("users:socialMedia.createSuccess", {
              defaultValue: "Sosyal medya hesabı başarıyla oluşturuldu.",
            })
          );
        }
      }

      if (!ok) {
        setSubmitError(
          t("users:socialMedia.form.submitError", {
            defaultValue: "İşlem tamamlanamadı. Lütfen bilgileri kontrol edip tekrar deneyin.",
          })
        );
        return;
      }

      setDialogOpen(false);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;

    setDeleteLoading(true);
    try {
      const ok = await deleteItem(deleteTarget.id);
      if (!ok) return;

      handleCloseDelete();

      setSuccessMessage(
        t("users:socialMedia.deleteSuccess", {
          defaultValue: "Sosyal medya hesabı başarıyla kaldırıldı.",
        })
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <UserDetailCard
      title={
        title ||
        t("users:socialMedia.title", {
          defaultValue: "Sosyal medya hesapları",
        })
      }
    >
      <Stack spacing={1.5}>
        <Typography variant="body2" color="text.secondary">
          {t("users:socialMedia.description", {
            defaultValue:
              "Kullanıcıya veya ilgili owner kaydına ait sosyal medya bağlantılarını burada yönetebilirsiniz.",
          })}
        </Typography>

        {isLoading ? (
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={20} />
              <Typography variant="body2">
                {t("users:socialMedia.loading", {
                  defaultValue: "Sosyal medya kayıtları yükleniyor...",
                })}
              </Typography>
            </Stack>
          </Paper>
        ) : null}

        {!isLoading && !!error ? (
          <Alert severity="error">
            {error ||
              t("users:socialMedia.error", {
                defaultValue: "Sosyal medya kayıtları alınırken hata oluştu.",
              })}
          </Alert>
        ) : null}

        {!isLoading && !error && sortedItems.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
            <Typography variant="body2" color="text.secondary">
              {t("users:socialMedia.empty", {
                defaultValue: "Henüz kayıtlı sosyal medya hesabı bulunmuyor.",
              })}
            </Typography>
          </Paper>
        ) : null}

        {!isLoading && !error && sortedItems.length > 0 ? (
          <Paper
            variant="outlined"
            sx={{
              borderRadius: 3,
              px: 2,
              py: 0.5,
            }}
          >
            <Stack>
              {sortedItems.map((item, index) => (
                <React.Fragment key={item.id}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={2}
                    sx={{ py: 1.75 }}
                  >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        useFlexGap
                        flexWrap="wrap"
                        sx={{ mb: 0.75 }}
                      >
                        <Chip
                          icon={getPlatformIcon(item.platform)}
                          label={item.platform || "-"}
                          size="small"
                          variant="outlined"
                          sx={{ borderRadius: 999 }}
                        />

                        {item.isPrimary ? (
                          <Chip
                            label={t("users:socialMedia.primary", {
                              defaultValue: "Birincil",
                            })}
                            color="primary"
                            size="small"
                            sx={{ borderRadius: 999 }}
                          />
                        ) : null}

                        <Chip
                          label={
                            item.isActive
                              ? t("users:socialMedia.active", {
                                  defaultValue: "Aktif",
                                })
                              : t("users:socialMedia.passive", {
                                  defaultValue: "Pasif",
                                })
                          }
                          color={item.isActive ? "success" : "default"}
                          size="small"
                          variant={item.isActive ? "filled" : "outlined"}
                          sx={{ borderRadius: 999 }}
                        />
                      </Stack>

                      <Typography
                        variant="body1"
                        fontWeight={600}
                        sx={{ mb: 0.5, lineHeight: 1.45 }}
                      >
                        {buildSocialTitle(item)}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {buildSocialMeta(item) || "-"}
                      </Typography>

                      <Typography variant="caption" color="text.secondary" display="block">
                        {t("users:socialMedia.sortOrder", {
                          defaultValue: "Sıra",
                        })}
                        : {item.sortOrder ?? 0}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={0.5}>
                      <Tooltip
                        title={t("users:socialMedia.openProfile", {
                          defaultValue: "Bağlantıyı aç",
                        })}
                      >
                        <IconButton
                          size="small"
                          component="a"
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          sx={{ color: "primary.main" }}
                        >
                          <IconExternalLink size={18} />
                        </IconButton>
                      </Tooltip>

                      {canEdit ? (
                        <Tooltip
                          title={t("users:socialMedia.edit", {
                            defaultValue: "Düzenle",
                          })}
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEdit(item)}
                            sx={{ color: "text.secondary" }}
                          >
                            <IconEdit size={18} />
                          </IconButton>
                        </Tooltip>
                      ) : null}

                      {canEdit ? (
                        <Tooltip
                          title={t("users:socialMedia.delete", {
                            defaultValue: "Sil",
                          })}
                        >
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDelete(item)}
                          >
                            <IconTrash size={18} />
                          </IconButton>
                        </Tooltip>
                      ) : null}
                    </Stack>
                  </Stack>

                  {index !== sortedItems.length - 1 ? <Divider /> : null}
                </React.Fragment>
              ))}
            </Stack>
          </Paper>
        ) : null}

        {isValidating && !isLoading ? (
          <Typography variant="caption" color="text.secondary">
            {t("users:socialMedia.refreshing", {
              defaultValue: "Liste güncelleniyor...",
            })}
          </Typography>
        ) : null}

        {canEdit ? (
          <Box sx={{ pt: 0.5 }}>
            <Button
              variant="text"
              startIcon={<IconCirclePlus size={18} />}
              onClick={handleOpenCreate}
              sx={{
                borderRadius: 999,
                px: 1.5,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              {t("users:socialMedia.add", {
                defaultValue: "Hesap ekle",
              })}
            </Button>
          </Box>
        ) : null}
      </Stack>

      <SocialMediaFormDialog
        open={dialogOpen}
        isEditMode={isEditMode}
        form={form}
        loading={submitLoading}
        error={submitError}
        onClose={() => !submitLoading && setDialogOpen(false)}
        onSubmit={handleSubmit}
        onChange={handleFormChange}
      />

      <SocialMediaDeleteDialog
        open={deleteOpen}
        loading={deleteLoading}
        item={deleteTarget}
        onClose={handleCloseDelete}
        onConfirm={handleDelete}
      />

      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage("")}
        message={successMessage}
      />
    </UserDetailCard>
  );
}