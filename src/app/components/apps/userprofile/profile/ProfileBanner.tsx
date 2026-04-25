//src/app/components/apps/userprofile/profile/ProfileBanner.tsx
'use client';

import React from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CardMedia from "@mui/material/CardMedia";
import Fab from "@mui/material/Fab";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import {
  IconBrandDribbble,
  IconBrandFacebook,
  IconBrandTwitter,
  IconBrandYoutube,
  IconFileDescription,
  IconUserCheck,
  IconUserCircle,
} from "@tabler/icons-react";
import ProfileTab from "./ProfileTab";
import BlankCard from "../../../shared/BlankCard";
import type { UserPayload } from "@/utils/authHelpers";

interface ProfileBannerProps {
  user?: UserPayload | null;
}

const ProfileBanner: React.FC<ProfileBannerProps> = ({ user }) => {
  const ProfileImage = styled(Box)(() => ({
    backgroundImage: "linear-gradient(#50b2fc,#f44c66)",
    borderRadius: "50%",
    width: "110px",
    height: "110px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto",
  }));

  React.useEffect(() => {
    console.groupCollapsed("%c[ProfileBanner] Mount (Grid-size API)", "color:#6cf");
    console.log("User:", user);
    console.log("Roles:", user?.roles ?? []);
    console.groupEnd();
  }, [user]);

  return (
    <BlankCard>
      {/* 🖼️ Banner */}
      <CardMedia
        component="img"
        image="/images/backgrounds/profilebg.jpg"
        alt="profilecover"
        sx={{ width: "100%", height: 330 }}
      />

      {/* 📊 Layout */}
      <Grid container spacing={0} justifyContent="center" alignItems="center">
        {/* 🔹 Sol alan */}
        <Grid
          size={{
            xs: 12,
            sm: 12,
            md: 4,
            lg: 4,
          }}
        >
          <Stack
            direction="row"
            textAlign="center"
            justifyContent="center"
            gap={6}
            m={3}
          >
            {[
              { icon: <IconFileDescription width="20" />, count: 938, label: "Posts" },
              { icon: <IconUserCircle width="20" />, count: 3586, label: "Followers" },
              { icon: <IconUserCheck width="20" />, count: 2659, label: "Following" },
            ].map((item) => (
              <Box key={item.label}>
                <Typography color="text.secondary">{item.icon}</Typography>
                <Typography variant="h4" fontWeight="600">
                  {item.count.toLocaleString()}
                </Typography>
                <Typography color="textSecondary" variant="h6" fontWeight={400}>
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Grid>

        {/* 🔹 Orta alan */}
        <Grid
          size={{
            xs: 12,
            sm: 12,
            md: 4,
            lg: 4,
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            textAlign="center"
            justifyContent="center"
            sx={{ mt: "-85px" }}
          >
            <Box>
              <ProfileImage>
                <Avatar
                  src={user?.photoUrl ?? "/images/profile/user-1.jpg"}
                  alt={user?.displayName ?? "User"}
                  sx={{
                    borderRadius: "50%",
                    width: 100,
                    height: 100,
                    border: "4px solid #fff",
                  }}
                />
              </ProfileImage>
              <Box mt={1}>
                <Typography fontWeight={600} variant="h5">
                  {user?.displayName ?? "Anonim Kullanıcı"}
                </Typography>
                <Typography color="textSecondary" variant="h6" fontWeight={400}>
                  {user?.email ?? "Bilinmeyen e-posta"}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* 🔹 Sağ alan */}
        <Grid
          size={{
            xs: 12,
            sm: 12,
            md: 4,
            lg: 4,
          }}
        >
          <Stack
            direction="row"
            gap={2}
            alignItems="center"
            justifyContent="center"
            my={2}
          >
            <Fab size="small" sx={{ backgroundColor: "#1877F2", color: "#fff" }}>
              <IconBrandFacebook size="16" />
            </Fab>
            <Fab size="small" sx={{ backgroundColor: "#1DA1F2", color: "#fff" }}>
              <IconBrandTwitter size="18" />
            </Fab>
            <Fab size="small" sx={{ backgroundColor: "#EA4C89", color: "#fff" }}>
              <IconBrandDribbble size="18" />
            </Fab>
            <Fab size="small" sx={{ backgroundColor: "#CD201F", color: "#fff" }}>
              <IconBrandYoutube size="18" />
            </Fab>
            <Button color="primary" variant="contained">
              Add To Story
            </Button>
          </Stack>
        </Grid>
      </Grid>

      {/* 🔹 Sekmeler */}
      <ProfileTab roles={user?.roles ?? []} />
    </BlankCard>
  );
};

export default ProfileBanner;
