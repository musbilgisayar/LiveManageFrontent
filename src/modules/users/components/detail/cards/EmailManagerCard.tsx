// src/modules/users/components/detail/cards/EmailManagerCard.tsx
"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import MarkEmailUnreadOutlinedIcon from "@mui/icons-material/MarkEmailUnreadOutlined";
import AlternateEmailOutlinedIcon from "@mui/icons-material/AlternateEmailOutlined";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";

import { useI18nNs } from "@/app/context/i18nContext";
import type { AdminUserDetailDto } from "../../../types/UserDetail.types";
import UserDetailCard from "./UserDetailCard";
import EmailChangeCard from "./EmailChangeCard";
import { formatNullable } from "../../../utils/userDetail.formatters";

type Props = {
  user: AdminUserDetailDto;
};

function fallbackText(value?: string | null) {
  return typeof value === "string" && value.trim() ? value : "—";
}

export default function EmailManagerCard({ user }: Props) {
  const { t } = useI18nNs(["users", "common"]);
  const [isEmailFormOpen, setIsEmailFormOpen] = useState(false);

  const tr = (key: string, fallback: string) => {
    const value = t(key);
    return value === `[${key}]` ? fallback : value;
  };

  const activeEmail = fallbackText(formatNullable(user.contact?.email));
  const isEmailVerified = !!user.verification?.isEmailConfirmed;

  return (
    <UserDetailCard
      title={tr("users:detail.cards.emailContact", "E-posta iletişimi")}
      icon={<AlternateEmailOutlinedIcon fontSize="small" />}
    >
      <Stack
        divider={<Divider flexItem sx={{ borderColor: "divider" }} />}
        spacing={0}
      >
        <Box
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
              mt: "2px",
              minHeight: 24,
              color: "text.secondary",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AlternateEmailOutlinedIcon fontSize="small" />
          </Box>

          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontWeight: 600,
              lineHeight: 1.6,
            }}
          >
            {tr("users:detail.fields.email", "E-posta")}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontWeight: 600,
              lineHeight: 1.6,
              textAlign: "center",
            }}
          >
            :
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "text.primary",
              fontWeight: 700,
              lineHeight: 1.6,
              wordBreak: "break-word",
              overflowWrap: "anywhere",
            }}
          >
            {activeEmail}
          </Typography>
        </Box>

        <Box
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
              mt: "2px",
              minHeight: 24,
              color: "text.secondary",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <VerifiedUserOutlinedIcon fontSize="small" />
          </Box>

          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontWeight: 600,
              lineHeight: 1.6,
            }}
          >
            {tr("users:detail.fields.emailVerification", "E-posta doğrulama")}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontWeight: 600,
              lineHeight: 1.6,
              textAlign: "center",
            }}
          >
            :
          </Typography>

          <Box>
            <Chip
              icon={
                isEmailVerified ? (
                  <VerifiedOutlinedIcon />
                ) : (
                  <MarkEmailUnreadOutlinedIcon />
                )
              }
              label={
                isEmailVerified
                  ? tr("users:detail.emailStatus.verified", "Doğrulanmış")
                  : tr("users:detail.emailStatus.unverified", "Doğrulanmamış")
              }
              color={isEmailVerified ? "success" : "warning"}
              variant={isEmailVerified ? "filled" : "outlined"}
              size="small"
            />
          </Box>
        </Box>

        <Box
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
              mt: "2px",
              minHeight: 24,
              color: "text.secondary",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MailOutlineOutlinedIcon fontSize="small" />
          </Box>

          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontWeight: 600,
              lineHeight: 1.6,
            }}
          >
            {tr("users:detail.emailChangeCard.inlineLabel", "E-posta değiştir")}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontWeight: 600,
              lineHeight: 1.6,
              textAlign: "center",
            }}
          >
            :
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditOutlinedIcon fontSize="small" />}
              onClick={() => {
                console.log("email toggle clicked");
                setIsEmailFormOpen((prev) => !prev);
              }}
              sx={{
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 700,
                minWidth: 0,
                px: 1.5,
                whiteSpace: "nowrap",
              }}
            >
              {isEmailFormOpen
                ? tr("common:close", "Kapat")
                : tr("common:update", "Güncelle")}
            </Button>
          </Box>
        </Box>

        <Collapse in={isEmailFormOpen} timeout="auto" unmountOnExit>
          <Box sx={{ pt: 2 }}>
            <EmailChangeCard initialEmail={user.contact?.email ?? ""} />
          </Box>
        </Collapse>
      </Stack>
    </UserDetailCard>
  );
}