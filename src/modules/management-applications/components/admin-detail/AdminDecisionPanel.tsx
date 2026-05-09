"use client";

import React, { useState } from "react";

import {
  alpha,
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";

import type { Theme } from "@mui/material/styles";

import {
  IconCheck,
  IconMessage2,
  IconX,
} from "@tabler/icons-react";

import {
  decisionButtonLabel,
  decisionNoteLabel,
  decisionNotePlaceholder,
} from "../../utils/adminManagementApplication.utils";

import type {
  AdminApplicationDecision,
} from "../../types/adminManagementApplication.types";

type AdminDecisionPanelProps = {
  applicationId: string;
};

export default function AdminDecisionPanel({
  applicationId,
}: AdminDecisionPanelProps) {
  const theme = useTheme<Theme>();

  const [decision, setDecision] =
    useState<AdminApplicationDecision>("approve");

  const [adminNote, setAdminNote] = useState("");

  const [assignedRole, setAssignedRole] = useState("");
  const [permissionScope, setPermissionScope] = useState("full_property");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [notifyApplicant, setNotifyApplicant] = useState<"yes" | "no">("yes");

  return (
    <Stack spacing={2}>
      <TextField
        select
        label="Karar"
        value={decision}
        onChange={(event) =>
          setDecision(event.target.value as AdminApplicationDecision)
        }
        fullWidth
      >
        <MenuItem value="approve">Onayla ve yetki ata</MenuItem>
        <MenuItem value="revision">Eksik bilgi / belge iste</MenuItem>
        <MenuItem value="reject">Reddet</MenuItem>
      </TextField>

      {decision === "approve" && (
        <Box
          sx={{
            p: 1.6,
            borderRadius: 3.5,
            border: `1px solid ${alpha(theme.palette.success.main, 0.18)}`,
            bgcolor: alpha(theme.palette.success.main, 0.045),
          }}
        >
          <Stack spacing={2}>
            <Stack spacing={0.35}>
              <Typography fontWeight={950}>Rol ve Yetki Atama</Typography>

              <Typography variant="body2" color="text.secondary">
                Başvuru onaylandığında kullanıcı ilgili yapıya bağlanır ve
                seçilen rol/yetki kapsamı ile işlem yapabilir.
              </Typography>
            </Stack>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "1fr 1fr",
                },
                gap: 1.5,
              }}
            >
              <TextField
                select
                label="Atanacak rol"
                value={assignedRole}
                onChange={(event) => setAssignedRole(event.target.value)}
                fullWidth
              >
                <MenuItem value="">Rol seçiniz</MenuItem>
                <MenuItem value="property_manager">Tam Yetkili Yönetici</MenuItem>
                <MenuItem value="finance_manager">Muhasebe Yetkilisi</MenuItem>
                <MenuItem value="operations_manager">Operasyon Sorumlusu</MenuItem>
                <MenuItem value="maintenance_manager">Bakım Sorumlusu</MenuItem>
              </TextField>

              <TextField
                select
                label="Yetki kapsamı"
                value={permissionScope}
                onChange={(event) => setPermissionScope(event.target.value)}
                fullWidth
              >
                <MenuItem value="full_property">Tüm yapı</MenuItem>
                <MenuItem value="finance_only">Sadece muhasebe</MenuItem>
                <MenuItem value="operations_only">Sadece operasyon</MenuItem>
                <MenuItem value="maintenance_only">Sadece bakım</MenuItem>
              </TextField>

              <TextField
                label="Yetki başlangıç tarihi"
                type="date"
                value={validFrom}
                onChange={(event) => setValidFrom(event.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />

              <TextField
                label="Yetki bitiş tarihi"
                type="date"
                value={validUntil}
                onChange={(event) => setValidUntil(event.target.value)}
                InputLabelProps={{ shrink: true }}
                helperText="Süresiz yetki için boş bırakılabilir."
                fullWidth
              />

              <TextField
                select
                label="Bildirim"
                value={notifyApplicant}
                onChange={(event) =>
                  setNotifyApplicant(event.target.value as "yes" | "no")
                }
                fullWidth
              >
                <MenuItem value="yes">Başvuru sahibine bildir</MenuItem>
                <MenuItem value="no">Şimdilik bildirim gönderme</MenuItem>
              </TextField>
            </Box>

            <Box
              sx={{
                p: 1.25,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.background.paper, 0.7),
                border: `1px solid ${alpha(theme.palette.success.main, 0.14)}`,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Onay sonrası sistem: başvuru durumunu günceller,
                kullanıcı-yapı ilişkisini oluşturur, rol/yetki atar,
                ilgili cache kayıtlarını invalidate eder ve AuditLog/SecurityLog üretir.
              </Typography>
            </Box>
          </Stack>
        </Box>
      )}

      {decision === "revision" && (
        <Box
          sx={{
            p: 1.6,
            borderRadius: 3.5,
            border: `1px solid ${alpha(theme.palette.warning.main, 0.18)}`,
            bgcolor: alpha(theme.palette.warning.main, 0.045),
          }}
        >
          <Stack spacing={1}>
            <Typography fontWeight={950}>Revizyon Gerekçesi</Typography>

            <Typography variant="body2" color="text.secondary">
              Eksik veya hatalı bilgi/belge varsa başvuru sahibine açıklayıcı
              şekilde bildirilmelidir.
            </Typography>
          </Stack>
        </Box>
      )}

      {decision === "reject" && (
        <Box
          sx={{
            p: 1.6,
            borderRadius: 3.5,
            border: `1px solid ${alpha(theme.palette.error.main, 0.18)}`,
            bgcolor: alpha(theme.palette.error.main, 0.045),
          }}
        >
          <Stack spacing={1}>
            <Typography fontWeight={950}>Red Gerekçesi</Typography>

            <Typography variant="body2" color="text.secondary">
              Red işlemi kullanıcıya bildirileceği için gerekçe açık, kısa ve
              denetlenebilir olmalıdır.
            </Typography>
          </Stack>
        </Box>
      )}

      <TextField
        label={decisionNoteLabel(decision)}
        value={adminNote}
        onChange={(event) => setAdminNote(event.target.value)}
        placeholder={decisionNotePlaceholder(decision)}
        multiline
        minRows={4}
        fullWidth
      />

      <Stack spacing={1}>
        <Button
          variant="contained"
          color={
            decision === "reject"
              ? "error"
              : decision === "revision"
                ? "warning"
                : "success"
          }
          startIcon={
            decision === "reject" ? (
              <IconX size={18} />
            ) : decision === "revision" ? (
              <IconMessage2 size={18} />
            ) : (
              <IconCheck size={18} />
            )
          }
          sx={{
            height: 46,
            borderRadius: 999,
            fontWeight: 900,
            textTransform: "none",
          }}
        >
          {decisionButtonLabel(decision)}
        </Button>

        <Typography variant="caption" color="text.secondary">
          ApplicationId: {applicationId}. Bu işlem backend tarafında tek
          transaction/workflow olarak yürütülmeli: status güncelleme, rol atama,
          audit log, security log, cache invalidation ve bildirim.
        </Typography>
      </Stack>
    </Stack>
  );
}