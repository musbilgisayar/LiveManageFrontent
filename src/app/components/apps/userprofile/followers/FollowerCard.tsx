'use client';
import React, { useContext } from 'react';
import {
  Avatar,
  Box,
  Button,
  CardContent,
  Chip,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid'; // ✅ MUI 7 System Grid
import BlankCard from '../../../../components/shared/BlankCard';
import { UserDataContext } from '@/app/context/UserDataContext';
import { IconMapPin, IconSearch } from '@tabler/icons-react';

const FollowerCard = () => {
  const { followers = [], toggleFollow, setSearch } = useContext(UserDataContext) ?? {};

  return (
    <>
      <Grid container spacing={3}>
        {/* Başlık ve Arama Alanı */}
        <Grid
          size={{
            sm: 12,
            lg: 12,
          }}
        >
          <Stack direction="row" alignItems="center" mt={2}>
            <Box>
              <Typography variant="h3">
                Followers&nbsp;
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
                placeholder="Search Followers"
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

        {/* Takipçi Listesi */}
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
                  <Stack direction="row" gap={2} alignItems="center">
                    <Avatar
                      alt={profile.name}
                      src={profile.avatar}
                      sx={{ width: 56, height: 56 }}
                    />
                    <Box flexGrow={1} minWidth={0}>
                      <Typography
                        variant="h6"
                        textOverflow="ellipsis"
                        noWrap
                      >
                        {profile.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                        color="textSecondary"
                      >
                        <IconMapPin size="14" />
                        {profile.country}
                      </Typography>
                    </Box>
                    <Box ml="auto">
                      {profile.isFollowed ? (
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => toggleFollow?.(profile.id)}
                        >
                          Followed
                        </Button>
                      ) : (
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => toggleFollow?.(profile.id)}
                        >
                          Follow
                        </Button>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
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
              No followers found
            </Typography>
          </Grid>
        )}
      </Grid>
    </>
  );
};

export default FollowerCard;
