//src/app/components/not-found/NotFoundPage.tsx
"use client";
import { Box, Container, Typography, Button } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useI18nNs } from "@/app/context/i18nContext";

const NotFound = () => {
  const { t } = useI18nNs(["notFound"]);

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
          {t("notFound:title")}
        </Typography>
        <Typography align="center" variant="h4" mb={4}>
          {t("notFound:message")}
        </Typography>
        <Button
          color="primary"
          variant="contained"
          component={Link}
          href="/"
          disableElevation
        >
          {t("notFound:backHome")}
        </Button>
      </Container>
    </Box>
  );
};

export default NotFound;
