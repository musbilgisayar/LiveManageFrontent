"use client";

import React from "react";
import Cropper, { Area } from "react-easy-crop";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import { useI18nNs } from "@/app/context/i18nContext";
import { getCroppedImage } from "./cropUtils";

export interface CropperDialogProps {
  open: boolean;
  imageSrc: string | null;
  aspect?: number;
  titleKey?: string;
  onClose: () => void;
  onComplete: (croppedDataUrl: string) => void;
  showZoomSlider?: boolean;
  initialZoom?: number;
  maxZoom?: number;
}

export default function CropperDialog({
  open,
  imageSrc,
  aspect = 1,
  titleKey = "common:cropper.title",
  onClose,
  onComplete,
  showZoomSlider = true,
  initialZoom = 1,
  maxZoom = 3,
}: CropperDialogProps) {
  const { t } = useI18nNs(["common"]);

  const [crop, setCrop] = React.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(initialZoom);
  const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<Area | null>(null);
  const [saving, setSaving] = React.useState(false);

  const handleCropComplete = React.useCallback(
    (_: Area, croppedPixels: Area) => {
      setCroppedAreaPixels(croppedPixels);
    },
    []
  );

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      onClose();
      return;
    }

    try {
      setSaving(true);
      const croppedDataUrl = await getCroppedImage(imageSrc, croppedAreaPixels);
      onComplete(croppedDataUrl);
      onClose();
    } catch (error) {
      console.error("CropperDialog / handleSave error:", error);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t(titleKey, { defaultValue: "Fotoğrafı Kırp" })}</DialogTitle>

      <DialogContent
        sx={{
          height: 400,
          position: "relative",
          p: 0,
          bgcolor: "grey.900",
        }}
      >
        {imageSrc && (
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
            showGrid={false}
          />
        )}
      </DialogContent>

      <DialogActions sx={{ flexDirection: "column", gap: 2, px: 3, pb: 2 }}>
        {showZoomSlider && (
          <Slider
            value={zoom}
            min={1}
            max={maxZoom}
            step={0.1}
            onChange={(_, v) => setZoom(v as number)}
            sx={{ width: "100%" }}
          />
        )}

        <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ width: "100%" }}>
          <Button variant="outlined" onClick={onClose} disabled={saving}>
            {t("common:button.cancel", { defaultValue: "İptal" })}
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !imageSrc}>
            {t("common:button.save", { defaultValue: "Kaydet" })}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
