"use client";

import React from "react";
import { Box, IconButton, Tooltip, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { IconCamera } from "@tabler/icons-react";
import CropperDialog from "@/app/components/shared/crop/CropperDialog";

interface Props {
  value?: string;
  onChange: (value: string, file?: File) => void;
}

export default function CoverPhotoUploader({ value, onChange }: Props) {
  const theme = useTheme();

  // 📌 Responsive yükseklik
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const height = isMobile ? 160 : isTablet ? 200 : 260;

  // Cropper state
  const [cropOpen, setCropOpen] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [tempFile, setTempFile] = React.useState<File | null>(null);

  // 📌 Dosya seçildiğinde kırpma modalı açılır
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setTempFile(file);
    setSelectedImage(previewUrl);
    setCropOpen(true);
  };

  // 📌 Kırpılmış görüntü geldikten sonra
  const handleCropped = (croppedUrl: string) => {
    onChange(croppedUrl, tempFile ?? undefined);

    // Reset
    setCropOpen(false);
    setSelectedImage(null);
    setTempFile(null);
  };

  return (
    <>
      {/* Kapak Alanı */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height,
          borderRadius: 3,
          overflow: "hidden",
          backgroundColor: "#f0f0f0",
        }}
      >
        {/* Kapak görseli */}
        {value ? (
          <img
            src={value}
            alt="cover"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center 30%", // Üst kısmın kesilmesini azaltır
            }}
          />
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              bgcolor: "#e6e6e6",
            }}
          />
        )}

        {/* Kamera Butonu */}
        <Tooltip title="Kapak Fotoğrafını Değiştir">
          <IconButton
            component="label"
            sx={{
              position: "absolute",
              bottom: 15,
              right: 15,
              backgroundColor: "white",
              width: 42,
              height: 42,
              borderRadius: "50%",
              boxShadow: 3,
              "&:hover": { backgroundColor: "#f5f5f5" },
            }}
          >
            <IconCamera size={20} />
            <input hidden type="file" accept="image/*" onChange={handleFile} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* 📌 Kırpma Dialog */}
      <CropperDialog
        open={cropOpen}
        imageSrc={selectedImage}
        aspect={5} // Kapak için ideal oran
        titleKey="common:cropper.coverTitle"
        onClose={() => setCropOpen(false)}
        onComplete={handleCropped}
        showZoomSlider={true}
      />
    </>
  );
}
