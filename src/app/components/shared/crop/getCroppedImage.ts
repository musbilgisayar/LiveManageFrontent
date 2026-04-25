import type { Area } from "react-easy-crop";

/**
 * Verilen imageSrc ve kırpma alanına (pixelCrop) göre
 * kırpılmış resmi base64 dataURL olarak döndürür.
 *
 * Bu sürümde:
 * - Rotation desteklenir
 * - Canvas CROPPING out-of-bound hataları önlenir
 * - CORS güvenliği artırıldı
 * 
 * - Tarayıcı uyumsuzlukları giderildi
 */
export async function getCroppedImage(
  imageSrc: string,
  pixelCrop: Area,
  options?: {
    rotation?: number;     // Varsayılan: 0°
    mimeType?: string;     // Varsayılan: image/jpeg
    quality?: number;      // Varsayılan: 0.92
  }
): Promise<string> {
  const rotation = options?.rotation ?? 0;
  const mimeType = options?.mimeType ?? "image/jpeg";
  const quality = options?.quality ?? 0.92;

  // -----------------------------------------
  // #1 — Bu fonksiyon sadece browser'da çalışır
  // -----------------------------------------
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("getCroppedImage sadece tarayıcı (client) ortamında çalıştırılmalıdır.");
  }

  // -----------------------------------------
  // #2 — Resmi yükle (CORS güvenliği dahil)
  // -----------------------------------------
  const image = await loadImage(imageSrc);
  const { width: naturalWidth, height: naturalHeight } = image;

  // -----------------------------------------
  // #3 — Canvas ve geçici canvas oluştur
  // -----------------------------------------
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Canvas context alınamadı.");

  const angleInRad = (rotation * Math.PI) / 180;

  const boundingBox = getRotatedSize(naturalWidth, naturalHeight, angleInRad);

  const tempCanvas = document.createElement("canvas");
  const tctx = tempCanvas.getContext("2d");

  if (!tctx) throw new Error("Geçici canvas context alınamadı.");

  tempCanvas.width = boundingBox.width;
  tempCanvas.height = boundingBox.height;

  // -----------------------------------------
  // #4 — Resmi merkezde döndürerek geçici canvas'a çiz
  // -----------------------------------------
  tctx.translate(boundingBox.width / 2, boundingBox.height / 2);
  tctx.rotate(angleInRad);
  tctx.drawImage(
    image,
    -naturalWidth / 2,
    -naturalHeight / 2,
    naturalWidth,
    naturalHeight
  );

  // -----------------------------------------
  // #5 — Asıl kırpılacak alan için güvenli koordinat hesaplama
  //
  //    ★ Bu bölüm HATAYI çözüyor ★
  //    React-easy-crop bazen rotation sonrası
  //    pixelCrop koordinatlarını bounding box dışına atar.
  //
  //    "safeX" ve "safeY" ile kırpma alanı
  //    canvas sınırlarına sabitlenir ve
  //    DOMException (IndexSizeError) önlenir.
  // -----------------------------------------
  const safeX = Math.max(0, Math.min(pixelCrop.x, tempCanvas.width - pixelCrop.width));
  const safeY = Math.max(0, Math.min(pixelCrop.y, tempCanvas.height - pixelCrop.height));

  let imageData: ImageData;

  try {
    imageData = tctx.getImageData(
      safeX,
      safeY,
      pixelCrop.width,
      pixelCrop.height
    );
  } catch (e) {
    // Buraya düşüyorsa pixelCrop OUT OF BOUNDS demektir.
    throw new Error(
      "Crop alanı görüntü sınırlarının dışında. Rotation + pixelCrop uyuşmazlığı. Hata: " +
        (e instanceof Error ? e.message : JSON.stringify(e))
    );
  }

  // -----------------------------------------
  // #6 — Asıl canvas boyutlandırılır ve data çizilir
  // -----------------------------------------
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.putImageData(imageData, 0, 0);

  // -----------------------------------------
  // #7 — canvas → Base64 DataURL
  // -----------------------------------------
  return canvas.toDataURL(mimeType, quality);
}

/**
 * Resmi yükleyen yardımcı fonksiyon.
 * crossOrigin = "anonymous" canvas güvenliği için zorunlu.
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";   // ★ Canvas security fix
    img.src = src;

    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error("Resim yüklenemedi: " + err));
  });
}

/**
 * Rotation sonucunda oluşan bounding box boyutlarını hesaplar.
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
