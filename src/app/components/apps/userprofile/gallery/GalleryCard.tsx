"use client";
import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  CardMedia,
  Chip,
  IconButton,
  InputAdornment,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid"; // 🔹 MUI 7 Grid2 sistemi
import BlankCard from "../../../../components/shared/BlankCard";
import { UserDataContext } from "@/app/context/UserDataContext";
import { IconDotsVertical, IconSearch } from "@tabler/icons-react";
import { format } from "date-fns";
import { GallaryType } from "../../../../[locale]/(DashboardLayout)/types/apps/users";
import FsLightbox from "fslightbox-react";

const GalleryCard = () => {
  const { gallery } = useContext(UserDataContext);
  const [search, setSearch] = useState("");
  const [isLoading, setLoading] = useState(true);
  const [toggler, setToggler] = useState(false);
  const [currentImage, setCurrentImage] = useState("");

  // 🔹 Fotoğrafları filtrele
  const filterPhotos = (photos: GallaryType[] | undefined, cSearch: string) => {
    if (!photos) return [];
    return photos.filter((t) =>
      t.name.toLocaleLowerCase().includes(cSearch.toLocaleLowerCase())
    );
  };

  const getPhotos = filterPhotos(gallery ?? [], search);

  // 🔹 Skeleton bekletme
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // 🔹 Lightbox aç/kapa
  const openLightbox = (image: string) => {
    setCurrentImage(image);
    setToggler((prev) => !prev);
  };

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
                Gallery&nbsp;
                <Chip
                  label={getPhotos?.length ?? 0}
                  color="secondary"
                  size="small"
                />
              </Typography>
            </Box>
            <Box ml="auto">
              <TextField
                id="outlined-search"
                placeholder="Search Gallery"
                size="small"
                type="search"
                variant="outlined"
                fullWidth
                onChange={(e) => setSearch(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconSearch size="14" />
                      </InputAdornment>
                    ),
                  },
                  htmlInput: { "aria-label": "Search Gallery" },
                }}
              />
            </Box>
          </Stack>
        </Grid>

        {/* Fotoğraf listesi */}
        {getPhotos.length > 0 ? (
          getPhotos.map((photo) => (
            <Grid
              key={photo.id}
              size={{
                xs: 12,
                sm: 6,
                lg: 4,
              }}
            >
              <BlankCard className="hoverCard">
                {isLoading ? (
                  <Skeleton
                    variant="rectangular"
                    animation="wave"
                    width="100%"
                    height={220}
                  />
                ) : (
                  <CardMedia
                    component="img"
                    height="220"
                    alt={photo.name}
                    src={photo.cover}
                    onClick={() => openLightbox(photo.cover)}
                    sx={{ cursor: "pointer", borderRadius: 2 }}
                  />
                )}
                <Box p={3}>
                  <Stack direction="row" gap={1}>
                    <Box>
                      <Typography variant="h6">{photo.name}.jpg</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {format(new Date(photo.time), "E, MMM d, yyyy")}
                      </Typography>
                    </Box>
                    <Box ml="auto">
                      <IconButton>
                        <IconDotsVertical size="16" />
                      </IconButton>
                    </Box>
                  </Stack>
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
            <Typography variant="body2" color="textSecondary" mt={2}>
              No photos available
            </Typography>
          </Grid>
        )}
      </Grid>

      {/* Lightbox */}
      <FsLightbox
        toggler={toggler}
        sources={currentImage ? [currentImage] : []}
      />
    </>
  );
};

export default GalleryCard;
