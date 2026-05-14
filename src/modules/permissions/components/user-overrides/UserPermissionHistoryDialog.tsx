"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";

import { useI18nNs } from "@/app/context/i18nContext";
import type { UserPermissionHistoryDto } from "../../types/UserPermissionOverride.types";

interface Props {
  open: boolean;
  onClose: () => void;
  history: UserPermissionHistoryDto[];
}

export default function UserPermissionHistoryDialog({
  open,
  onClose,
  history,
}: Props) {
  const { t } = useI18nNs(["permission"]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        {t("permission:userOverrides.history.title")}
      </DialogTitle>

      <DialogContent dividers>
        <List disablePadding>
          {history.map((item, index) => (
            <div
              key={`${item.permissionId}-${item.actionDate}-${index}`}
            >
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={
                    <Typography fontWeight={800}>
                      {item.permissionCode}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography
                        variant="caption"
                        display="block"
                      >
                        {item.action}
                      </Typography>

                      <Typography
                        variant="caption"
                        display="block"
                      >
                        {new Date(
                          item.actionDate
                        ).toLocaleString()}
                      </Typography>

                      <Typography
                        variant="body2"
                        mt={1}
                      >
                        {item.additionalInfo}
                      </Typography>
                    </>
                  }
                />
              </ListItem>

              {index !== history.length - 1 && (
                <Divider />
              )}
            </div>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
}