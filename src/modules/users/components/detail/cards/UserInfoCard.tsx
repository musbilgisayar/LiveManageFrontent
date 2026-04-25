// src/modules/users/components/detail/cards/UserInfoCard.tsx
"use client";

import * as React from "react";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export type UserInfoCardItem = {
  label: string;
  value?: React.ReactNode;
  icon?: React.ReactNode;
};

type Props = {
  title: string;
  items: UserInfoCardItem[];
  icon?: React.ReactNode;
};

function isEmptyValue(value: React.ReactNode) {
  return (
    value === undefined ||
    value === null ||
    value === "" ||
    (typeof value === "string" && value.trim() === "")
  );
}

export default function UserInfoCard({ title, items, icon }: Props) {
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
          gap: 1.2,
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
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

      <CardContent
        sx={{
          p: { xs: 2.5, md: 3 },
          flex: 1,
        }}
      >
        <Stack
          divider={<Divider flexItem sx={{ borderColor: "divider" }} />}
          spacing={0}
        >
          {items.map((item, index) => {
            const empty = isEmptyValue(item.value);

            return (
              <Box
                key={`${item.label}-${index}`}
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
                    flexShrink: 0,
                  }}
                >
                  {item.icon ?? <InfoOutlinedIcon fontSize="small" />}
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 600,
                    lineHeight: 1.6,
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                  }}
                >
                  {item.label}
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
                    minWidth: 0,
                    display: "flex",
                    alignItems: "flex-start",
                    color: empty ? "text.secondary" : "text.primary",
                    "& .MuiChip-root": {
                      maxWidth: "100%",
                    },
                    "& .MuiAlert-root": {
                      width: "100%",
                    },
                  }}
                >
                  {empty ? (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        fontWeight: 500,
                        lineHeight: 1.6,
                      }}
                    >
                      —
                    </Typography>
                  ) : typeof item.value === "string" ||
                    typeof item.value === "number" ? (
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
                      {item.value}
                    </Typography>
                  ) : (
                    item.value
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