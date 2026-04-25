"use client";

import { Alert, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { IconCirclePlus } from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";
import UserDetailCard from "./UserDetailCard";

type PhoneItem = {
  id: string;
  type: "mobile" | "home" | "work";
  countryCode: string;
  number: string;
  isPrimary?: boolean;
  isVerified?: boolean;
};

type Props = {
  userId: string;
};

export default function PhoneNumbersCard({ userId }: Props) {
  const { t } = useI18nNs(["users", "common"]);

  const phones: PhoneItem[] = [
    {
      id: "1",
      type: "mobile",
      countryCode: "+41",
      number: "79 123 45 67",
      isPrimary: true,
      isVerified: true,
    },
    {
      id: "2",
      type: "home",
      countryCode: "+41",
      number: "31 555 00 11",
    },
  ];

  return (
    <UserDetailCard
      title={t("users:detail.cards.phoneNumbers", {
        defaultValue: "Telefon Numaraları",
      })}
      action={
        <Button
          size="small"
          startIcon={<IconCirclePlus size={16} />}
          variant="contained"
        >
          {t("common:actions.add", { defaultValue: "Ekle" })}
        </Button>
      }
    >
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 3,
          px: 2,
          py: 2,
        }}
      >
        <Stack spacing={1.5}>
          {phones.length === 0 ? (
            <Alert severity="info">
              {t("users:detail.phone.empty", {
                defaultValue: "Henüz telefon numarası eklenmemiş.",
              })}
            </Alert>
          ) : (
            phones.map((phone) => (
              <Stack
                key={phone.id}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Stack>
                  <Typography fontWeight={500}>
                    {phone.countryCode} {phone.number}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {phone.type}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1}>
                  {phone.isPrimary && (
                    <Chip
                      size="small"
                      color="primary"
                      label={t("common:labels.primary", {
                        defaultValue: "Birincil",
                      })}
                    />
                  )}

                  {phone.isVerified && (
                    <Chip
                      size="small"
                      color="success"
                      label={t("common:labels.verified", {
                        defaultValue: "Doğrulandı",
                      })}
                    />
                  )}
                </Stack>
              </Stack>
            ))
          )}

          <Alert severity="info">
            {t("users:detail.phone.info", {
              defaultValue:
                "Telefon ekleme, güncelleme ve doğrulama akışı ayrı olarak yönetilecektir.",
            })}
          </Alert>
        </Stack>
      </Paper>
    </UserDetailCard>
  );
}