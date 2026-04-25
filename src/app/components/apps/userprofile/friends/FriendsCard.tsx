'use client';
import React, { useContext } from 'react';
import {
  Avatar,
  Box,
  CardContent,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid'; // ✅ MUI 7 Grid2 sistemi
import BlankCard from '../../../../components/shared/BlankCard';
import { UserDataContext } from '@/app/context/UserDataContext';
import {
  IconBrandFacebook,
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandTwitter,
  IconSearch,
} from '@tabler/icons-react';

const SocialIcons = [
  { name: 'Facebook', icon: <IconBrandFacebook size="18" color="#1877F2" /> },
  { name: 'Instagram', icon: <IconBrandInstagram size="18" color="#D7336D" /> },
  { name: 'Github', icon: <IconBrandGithub size="18" color="#006097" /> },
  { name: 'Twitter', icon: <IconBrandTwitter size="18" color="#1C9CEA" /> },
];

const FriendsCard = () => {
  const { followers = [], setSearch } = useContext(UserDataContext) ?? {};

  return (
    <>
      <Grid container spacing={3}>
        {/* Başlık ve arama */}
        <Grid
          size={{
            sm: 12,
            lg: 12,
          }}
        >
          <Stack direction="row" alignItems="center" mt={2}>
            <Box>
              <Typography variant="h3">
                Friends&nbsp;
                <Chip
                  label={followers?.length ?? 0}
                  color="secondary"
                  size="small"
                />
              </Typography>
            </Box>
            <Box ml="auto">
              <TextField
                id="outlined-search"
                placeholder="Search Friends"
                size="small"
                type="search"
                variant="outlined"
                fullWidth
                onChange={(e) => setSearch?.(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconSearch size="14" />
                      </InputAdornment>
                    ),
                  },
                  htmlInput: { 'aria-label': 'Search Followers' },
                }}
              />
            </Box>
          </Stack>
        </Grid>

        {/* Arkadaş listesi */}
        {followers && followers.length > 0 ? (
          followers.map((profile) => (
            <Grid
              key={profile.id}
              size={{
                xs: 12,
                sm: 6,
                lg: 4,
              }}
            >
              <BlankCard className="hoverCard">
                <CardContent>
                  <Stack
                    direction="column"
                    gap={2}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Avatar
                      alt={profile.name}
                      src={profile.avatar}
                      sx={{ width: 80, height: 80 }}
                    />
                    <Box textAlign="center">
                      <Typography variant="h5">{profile.name}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {profile.role}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
                <Divider />
                <Box
                  p={2}
                  py={1}
                  textAlign="center"
                  sx={{ backgroundColor: 'grey.100' }}
                >
                  {SocialIcons.map((sicon) => (
                    <IconButton key={sicon.name}>{sicon.icon}</IconButton>
                  ))}
                </Box>
              </BlankCard>
            </Grid>
          ))
        ) : (
          <Grid
            size={{
              xs: 12,
            }}
          >
            <Typography
              variant="body2"
              color="textSecondary"
              textAlign="center"
              mt={2}
            >
              No friends found
            </Typography>
          </Grid>
        )}
      </Grid>
    </>
  );
};

export default FriendsCard;
