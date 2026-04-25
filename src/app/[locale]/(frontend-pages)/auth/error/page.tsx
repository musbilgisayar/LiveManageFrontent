'use client';
import { Box, Container, Typography, Button } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useI18nNs } from "@/app/context/i18nContext";

const Error = () => {
  const { t } = useI18nNs(["error", "common", "auth", "header", "footer"]); // ✅ error namespace, common da buton için

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100vh"
      textAlign="center"
      justifyContent="center"
    >
      <Container maxWidth="md">
        <Image
          src={"/images/backgrounds/errorimg.svg"}
          alt="404"
          width={500}
          height={500}
          style={{ width: "100%", maxWidth: "500px", maxHeight: "500px" }}
        />
        <Typography align="center" variant="h1" mb={4}>
          {t("error:title")}
        </Typography>
        <Typography align="center" variant="h4" mb={4}>
          {t("error:message")}
        </Typography>
        <Button
          color="primary"
          variant="contained"
          component={Link}
          href="/"
          disableElevation
        >
          {t("error:backHome")}
        </Button>
      </Container>
    </Box>
  );
};

export default Error;

/*
import Image from "next/image";
import Link from "next/link";

const Error = () => (
  <Box
    display="flex"
    flexDirection="column"
    height="100vh"
    textAlign="center"
    justifyContent="center"
  >
    <Container maxWidth="md">
      <Image
        src={"/images/backgrounds/errorimg.svg"}
        alt="404"
        width={500}
        height={500}
        style={{ width: "100%", maxWidth: "500px", maxHeight: "500px" }}
      />
      <Typography align="center" variant="h1" mb={4}>
        Opps 404!!!
      </Typography>
      <Typography align="center" variant="h4" mb={4}>
        This page you are looking for could not be found.
      </Typography>
      <Button
        color="primary"
        variant="contained"
        component={Link}
        href="/"
        disableElevation
      >
        Anasayfaya Dön
      </Button>
    </Container>
  </Box>
);

export default Error;
*/