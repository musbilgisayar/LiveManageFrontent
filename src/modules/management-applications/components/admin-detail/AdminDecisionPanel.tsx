"use client";

import React, { useState } from "react";

import {
  Alert,
  alpha,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { IconCheck, IconMessage2, IconX } from "@tabler/icons-react";

import { useI18nNs } from "@/app/context/i18nContext";

import {
  approveAdminManagementApplication,
  rejectAdminManagementApplication,
  requestRevisionForAdminManagementApplication,
} from "../../services/managementApplication.service";

import {
  decisionButtonLabelKey,
  decisionNoteLabelKey,
  decisionNotePlaceholderKey,
} from "../../utils/adminManagementApplication.utils";

import type {
  AdminApplicationDecision,
} from "../../types/adminManagementApplication.types";

type AdminDecisionPanelProps = {
  applicationId: string;
  onCompleted?: () => void;
};

export default function AdminDecisionPanel({
  applicationId,
  onCompleted,
}: AdminDecisionPanelProps) {
  const theme = useTheme<Theme>();
  const { t } = useI18nNs("management-applications");

  const [decision, setDecision] =
    useState<AdminApplicationDecision>("approve");

  const [adminNote, setAdminNote] = useState("");
  const [notifyApplicant, setNotifyApplicant] = useState<"yes" | "no">("yes");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessageKey, setResultMessageKey] = useState<string | null>(null);
  const [errorMessageKey, setErrorMessageKey] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (
      (decision === "revision" || decision === "reject") &&
      !adminNote.trim()
    ) {
      setErrorMessageKey(
        decision === "revision"
          ? "admin.detail.decision.validation.revisionNoteRequired"
          : "admin.detail.decision.validation.rejectReasonRequired",
      );

      return;
    }
    setIsSubmitting(true);
    setResultMessageKey(null);
    setErrorMessageKey(null);

    const payload = {
      reviewNote: adminNote.trim() || null,
      notifyApplicant: notifyApplicant === "yes",
    };

    try {
      const response =
        decision === "approve"
          ? await approveAdminManagementApplication(applicationId, payload)
          : decision === "revision"
            ? await requestRevisionForAdminManagementApplication(
              applicationId,
              payload,
            )
            : await rejectAdminManagementApplication(applicationId, payload);

      if (!response.ok) {
        setErrorMessageKey(
          response.userMessage ||
          response.message ||
          "admin.detail.decision.result.failed",
        );

        return;
      }

      setResultMessageKey(
        decision === "approve"
          ? "admin.detail.decision.result.approved"
          : decision === "revision"
            ? "admin.detail.decision.result.revisionRequested"
            : "admin.detail.decision.result.rejected",
      );

      onCompleted?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack spacing={2}>
      {resultMessageKey && (
        <Alert severity="success" sx={{ borderRadius: 3 }}>
          {t(resultMessageKey)}
        </Alert>
      )}

      {errorMessageKey && (
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {t(errorMessageKey)}
        </Alert>
      )}

      <TextField
        select
        label={t("admin.detail.decision.field.decision")}
        value={decision}
        onChange={(event) =>
          setDecision(event.target.value as AdminApplicationDecision)
        }
        fullWidth
      >
        <MenuItem value="approve">
          {t("admin.detail.decision.option.approve")}
        </MenuItem>
        <MenuItem value="revision">
          {t("admin.detail.decision.option.revision")}
        </MenuItem>
        <MenuItem value="reject">
          {t("admin.detail.decision.option.reject")}
        </MenuItem>
      </TextField>

      {decision === "approve" && (
        <DecisionInfoBox
          color={theme.palette.success.main}
          title={t("admin.detail.decision.approve.title")}
          description={t("admin.detail.decision.approve.description")}
          footer={t("admin.detail.decision.approve.footer")}
        />
      )}

      {decision === "revision" && (
        <DecisionInfoBox
          color={theme.palette.warning.main}
          title={t("admin.detail.decision.revision.title")}
          description={t("admin.detail.decision.revision.description")}
        />
      )}

      {decision === "reject" && (
        <DecisionInfoBox
          color={theme.palette.error.main}
          title={t("admin.detail.decision.reject.title")}
          description={t("admin.detail.decision.reject.description")}
        />
      )}

      <TextField
        label={t(decisionNoteLabelKey(decision))}
        value={adminNote}
        onChange={(event) => setAdminNote(event.target.value)}
        placeholder={t(decisionNotePlaceholderKey(decision))}
        multiline
        minRows={4}
        fullWidth
      />

      <TextField
        select
        label={t("admin.detail.decision.field.notifyApplicant")}
        value={notifyApplicant}
        onChange={(event) =>
          setNotifyApplicant(event.target.value as "yes" | "no")
        }
        fullWidth
      >
        <MenuItem value="yes">
          {t("admin.detail.decision.notify.yes")}
        </MenuItem>
        <MenuItem value="no">
          {t("admin.detail.decision.notify.no")}
        </MenuItem>
      </TextField>

      <Stack spacing={1}>
        <Button
          variant="contained"
          disabled={isSubmitting}
          onClick={handleSubmit}
          color={
            decision === "reject"
              ? "error"
              : decision === "revision"
                ? "warning"
                : "success"
          }
          startIcon={
            isSubmitting ? (
              <CircularProgress size={18} color="inherit" />
            ) : decision === "reject" ? (
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
          {isSubmitting
            ? t("admin.detail.decision.submitting")
            : t(decisionButtonLabelKey(decision))}
        </Button>

        <Typography variant="caption" color="text.secondary">
          {t("admin.detail.decision.auditHint")}
        </Typography>
      </Stack>
    </Stack>
  );
}

function DecisionInfoBox({
  color,
  title,
  description,
  footer,
}: {
  color: string;
  title: string;
  description: string;
  footer?: string;
}) {
  const theme = useTheme<Theme>();

  return (
    <Box
      sx={{
        p: 1.6,
        borderRadius: 3.5,
        border: `1px solid ${alpha(color, 0.18)}`,
        bgcolor: alpha(color, 0.045),
      }}
    >
      <Stack spacing={1}>
        <Typography fontWeight={950}>{title}</Typography>

        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>

        {footer && (
          <Box
            sx={{
              mt: 1,
              p: 1.25,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.background.paper, 0.7),
              border: `1px solid ${alpha(color, 0.14)}`,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {footer}
            </Typography>
          </Box>
        )}
      </Stack>
    </Box>
  );
}