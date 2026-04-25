import type { Area } from "react-easy-crop";

/**
 * Verilen imageSrc ve kırpma alanına (pixelCrop) göre
 * kırpılmış resmi base64 dataURL olarak döndürür.
 *
 * - Sadece client tarafında çalışmalıdır (window / document gerektirir).
 * - Profil fotoğrafı, kapak fotoğrafı, belge vb. için yeniden kullanılabilir.
 */
export async function getCroppedImage(
  imageSrc: string,
  pixelCrop: Area,
  options?: {
    /** Rotasyon (derece cinsinden). Varsayılan: 0 */
    rotation?: number;
    /** Çıktı MIME tipi. Varsayılan: image/jpeg */
    mimeType?: string;
    /** JPEG kalite, 0–1. Varsayılan: 0.92 */
    quality?: number;
  }
): Promise<string> {
  const rotation = options?.rotation ?? 0;
  const mimeType = options?.mimeType ?? "image/jpeg";
  const quality = options?.quality ?? 0.92;

  // SSR güvenliği: Bu fonksiyon sadece browser ortamında çalıştırılmalı
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("getCroppedImage sadece tarayıcı ortamında çalıştırılmalıdır.");
  }

  // Resim elementini yükle
  const image = await loadImage(imageSrc);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context alınamadı.");
  }

  // Rotasyon varsa radyana çevir
  const angleInRad = (rotation * Math.PI) / 180;

  // Resmin orijinal boyutları
  const { width: naturalWidth, height: naturalHeight } = image;

  // Rotasyon hesaba katılarak daha büyük bir canvas oluştur
  const boundingBox = getRotatedSize(naturalWidth, naturalHeight, angleInRad);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Geçici büyük canvas üzerinde resmi döndürüp çizdikten sonra,
  // asıl croplanacak alanı küçük canvas'a kopyalayacağız.
  const tempCanvas = document.createElement("canvas");
  const tctx = tempCanvas.getContext("2d");

  if (!tctx) {
    throw new Error("Geçici canvas context alınamadı.");
  }

  tempCanvas.width = boundingBox.width;
  tempCanvas.height = boundingBox.height;

  // Ortaya hizalayarak döndür
  tctx.translate(boundingBox.width / 2, boundingBox.height / 2);
  tctx.rotate(angleInRad);
  tctx.drawImage(
    image,
    -naturalWidth / 2,
    -naturalHeight / 2,
    naturalWidth,
    naturalHeight
  );

  // Asıl canvas'a kırpılacak alanı çiz
  const data = tctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  );
  ctx.putImageData(data, 0, 0);

  // Canvas'ı dataURL'e çevir
  return canvas.toDataURL(mimeType, quality);
}

/**
 * Verilen imageSrc'den bir HTMLImageElement oluşturan yardımcı fonksiyon.
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    img.src = src;
    img.crossOrigin = "anonymous";

    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
  });
}

/**
 * Rotasyon ile genişlik / yükseklik nasıl değişiyor,
 * bunu hesaplayan yardımcı fonksiyon.
 */
function getRotatedSize(
  width: number,
  height: number,
  rotationRad: number
): { width: number; height: number } {
  const cos = Math.abs(Math.cos(rotationRad));
  const sin = Math.abs(Math.sin(rotationRad));
  return {
    width: width * cos + height * sin,
    height: width * sin + height * cos,
  };
}
