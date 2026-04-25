// src/app/components/frontend-pages/homepage/banner/Banner.tsx
// Orijinal Banner statiktir. Tema ile satılan bannerdir. → i18n'li sürüm
"use client";

import React from "react";
import {
  Box,
  Stack,
  Typography,
  AvatarGroup,
  Avatar,
  Container,
  Grid,
  Button,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import Image from "next/image";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
// import DialogContentText from "@mui/material/DialogContentText"; // şimdilik kullanılmıyor
// import DialogTitle from "@mui/material/DialogTitle"; // şimdilik kullanılmıyor
import { useI18nNs } from "@/app/context/i18nContext";

const Frameworks = [
  { nameKey: "framework:react",  icon: "/images/frontend-pages/icons/icon-react.svg" },
  { nameKey: "framework:mui",    icon: "/images/frontend-pages/icons/icon-mui.svg" },
  { nameKey: "framework:next",   icon: "/images/frontend-pages/icons/icon-next.svg" },
  { nameKey: "framework:ts",     icon: "/images/frontend-pages/icons/icon-ts.svg" },
  { nameKey: "framework:redux",  icon: "/images/frontend-pages/icons/icon-redux.svg" },
  { nameKey: "framework:tabler", icon: "/images/frontend-pages/icons/icon-tabler.svg" },
];

const Banner = () => {
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up("lg"));
  // Bu bileşenin ihtiyaç duyduğu namespace'leri yükletiyoruz
  const { t, lang } = useI18nNs(["banner", "framework", "auth", "common"]);

  const [open, setOpen] = React.useState(false);
  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box key={`${lang}-homepage-banner`} bgcolor="primary.light" pt={7}>
      <Container sx={{ maxWidth: "1400px !important", position: "relative" }}>
        <Grid container spacing={3} justifyContent="center" mb={4}>
          {lgUp ? (
            <Grid alignItems="end" display="flex" size={{ xs: 12, lg: 2 }}>
              <Image
                src="/images/frontend-pages/homepage/banner-top-left.svg"
                className="animted-img-2"
                alt={t("banner:img.topLeft.alt")}
                width={360}
                height={200}
                style={{
                  borderRadius: "16px",
                  position: "absolute",
                  left: "24px",
                  boxShadow: "0px 6px 12px rgba(127, 145, 156, 0.12)",
                  height: "auto",
                  width: "auto",
                }}
              />
            </Grid>
          ) : null}

          <Grid textAlign="center" size={{ xs: 12, lg: 7 }}>
            <Typography
              variant="h1"
              fontWeight={700}
              lineHeight="1.2"
              sx={{ fontSize: { xs: "40px", sm: "56px" } }}
            >
              {t("banner:title.part1")}{" "}
              <Typography
                variant="h1"
                sx={{ fontSize: { xs: "40px", sm: "56px" } }}
                fontWeight={700}
                component="span"
                color="primary.main"
              >
                {t("banner:title.emphasis")}
              </Typography>{" "}
              {t("banner:title.part3")}
            </Typography>

            <Stack
              my={3}
              direction={{ xs: "column", sm: "row" }}
              spacing="20px"
              alignItems="center"
              justifyContent="center"
            >
              <AvatarGroup>
                <Avatar
                  alt={t("banner:avatar.1.alt")}
                  src="/images/profile/user-1.jpg"
                  sx={{ width: 40, height: 40 }}
                />
                <Avatar
                  alt={t("banner:avatar.2.alt")}
                  src="/images/profile/user-2.jpg"
                  sx={{ width: 40, height: 40 }}
                />
                <Avatar
                  alt={t("banner:avatar.3.alt")}
                  src="/images/profile/user-3.jpg"
                  sx={{ width: 40, height: 40 }}
                />
              </AvatarGroup>
              <Typography variant="h6" fontWeight={500}>
                {t("banner:subtitle")}
              </Typography>
            </Stack>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems="center"
              spacing={3}
              mb={4}
              justifyContent="center"
            >
              <Button
                color="primary"
                size="large"
                variant="contained"
                href="/auth/login"
                aria-label={t("auth:button.login.aria")}
              >
                {t("auth:button.login")}
              </Button>

              <Button
                variant="text"
                color="inherit"
                onClick={handleClickOpen}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  color: "text.primary",
                  fontWeight: 500,
                  fontSize: "15px",
                  "&:hover": { color: "primary.main" },
                }}
                aria-label={t("banner:seeHow.aria")}
              >
                <Image
                  src="/images/frontend-pages/homepage/icon-play.svg"
                  alt={t("banner:playIcon.alt")}
                  width={40}
                  height={40}
                />{" "}
                {t("banner:seeHow")}
              </Button>
            </Stack>

            <Stack
              direction="row"
              flexWrap="wrap"
              alignItems="center"
              spacing={3}
              mb={8}
              justifyContent="center"
            >
              {Frameworks.map((fw, i) => (
                <Tooltip title={t(fw.nameKey)} key={i}>
                  <Box
                    width="54px"
                    height="54px"
                    display="flex"
                    sx={{
                      boxShadow: (theme) =>
                        theme.palette.mode === "dark" ? null : theme.shadows[10],
                      backgroundColor: (theme) =>
                        theme.palette.mode === "dark" ? "#1f2c4f" : "white",
                    }}
                    alignItems="center"
                    justifyContent="center"
                    borderRadius="16px"
                    aria-label={t(fw.nameKey)}
                  >
                    <Image src={fw.icon} alt={t(fw.nameKey)} width={26} height={26} />
                  </Box>
                </Tooltip>
              ))}

              <Dialog
                maxWidth="lg"
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <DialogContent>
                  <iframe
                    width="800"
                    height="500"
                    src="https://www.youtube.com/embed/P94DBd1hJkw?si=WLnH9g-KAdDJkUZN"
                    title={t("banner:video.title")}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClose} autoFocus>
                    {t("common:close")}
                  </Button>
                </DialogActions>
              </Dialog>
            </Stack>
          </Grid>

          {lgUp ? (
            <Grid alignItems="end" display="flex" size={{ xs: 12, lg: 2 }}>
              <Image
                src="/images/frontend-pages/homepage/banner-top-right.svg"
                className="animted-img-2"
                alt={t("banner:img.topRight.alt")}
                width={350}
                height={220}
                style={{
                  borderRadius: "16px",
                  position: "absolute",
                  right: "24px",
                  boxShadow: "0px 6px 12px rgba(127, 145, 156, 0.12)",
                  height: "auto",
                  width: "auto",
                }}
              />
            </Grid>
          ) : null}
        </Grid>

        {lgUp ? (
          <Image
            src="/images/frontend-pages/homepage/bottom-part.svg"
            alt={t("banner:img.bottom.alt")}
            width={500}
            height={300}
            style={{ width: "100%", marginBottom: "-11px" }}
          />
        ) : null}
      </Container>
    </Box>
  );
};

export default Banner;
