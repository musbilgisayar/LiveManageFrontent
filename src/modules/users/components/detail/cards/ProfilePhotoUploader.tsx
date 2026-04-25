"use client";

import React from "react";
import { Avatar, Box, IconButton, Tooltip } from "@mui/material";
import { IconCamera } from "@tabler/icons-react";
import CropperDialog from "@/app/components/shared/crop/CropperDialog";

interface Props {
  value?: string;
  onChange: (value: string, file?: File) => void;
  size?: number;
}

export default function ProfilePhotoUploader({ value, onChange, size = 110 }: Props) {
  const [cropOpen, setCropOpen] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [tempFile, setTempFile] = React.useState<File | null>(null);

  // 📌 Dosya seçilince önce kırpma modalı açılır
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    setTempFile(file);          // Orijinal file
    setSelectedImage(previewUrl); // Modalda kırpılacak görüntü
    setCropOpen(true);           // Cropper aç
  };

  // 📌 Kırpma tamamlanınca —> dışarı bildir + avatar güncelle
  const handleCropped = (croppedDataUrl: string) => {
    // Kullanıcı kırptığı görüntüyü avatar olarak görsün
    onChange(croppedDataUrl, tempFile ?? undefined);

    // Cropper state reset
    setCropOpen(false);
    setSelectedImage(null);
    setTempFile(null);
  };

  return (
    <>
      <Box
        sx={{
          position: "relative",
          width: size,
          height: size,
        }}
      >
        {/* Avatar */}
        <Avatar
          src={value}
          sx={{
            width: size,
            height: size,
            borderRadius: "50%",
            border: "3px solid white",
            boxShadow: 3,
            objectFit: "cover",
          }}
        />

        {/* Kamera ikonu */}
        <Tooltip title="Fotoğraf Değiştir">
          <IconButton
            component="label"
            sx={{
              position: "absolute",
              bottom: 0,
              right: 0,
              backgroundColor: "white",
              width: 34,
              height: 34,
              borderRadius: "50%",
              boxShadow: 2,
              "&:hover": { backgroundColor: "#f5f5f5" },
            }}
          >
            <IconCamera size={18} />
            <input hidden type="file" accept="image/*" onChange={handleFile} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* 📌 Kırpma Modalı */}
      <CropperDialog
        open={cropOpen}
        imageSrc={selectedImage}
        aspect={1} // Profil resmi kare olmalı
        titleKey="common:cropper.profileTitle"
        onClose={() => setCropOpen(false)}
        onComplete={handleCropped}
      />
    </>
  );
}
