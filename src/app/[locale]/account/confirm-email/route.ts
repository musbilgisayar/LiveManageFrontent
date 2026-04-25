import { NextRequest, NextResponse } from "next/server";

/**
 * 📄 E-posta doğrulama isteklerini backend’e proxy eden route handler
 * Geliştirme sürecinde detaylı loglar içerir.
 */

const BACKEND =
  process.env.BACKEND_BASE ||
  process.env.BACKEND_URL ||
  process.env.BACKEND_BASE_URL ||
  process.env.BFF_URL ||
  "https://localhost:5002";

export async function POST(req: NextRequest) {
  try {
   

    // 1️⃣ Gelen body’den token al
    const { token } = await req.json();
 

    if (!token) {
      console.warn("⚠️ [ConfirmEmail] Token eksik veya boş geldi.");
      return NextResponse.json(
        { ok: false, error: "TOKEN_MISSING", userMessage: "Doğrulama anahtarı eksik." },
        { status: 400 }
      );
    }

    // 2️⃣ Backend adresini hazırla
    const url = `${BACKEND}/api/v1.0/account/confirm-email-by-token`;
  

    // 3️⃣ Backend’e proxy isteği yap
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SERVICE_JWT || ""}`,
      },
      body: JSON.stringify({ token }),
    });

    console.log("📡 [ConfirmEmail] Backend yanıt durumu:", res.status);

    // 4️⃣ Backend yanıtını al
    const data = await res.json();
    console.log("📦 [ConfirmEmail] Backend cevabı:", data);

    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error("🔥 [ConfirmEmail] Beklenmeyen hata:", err);
    return NextResponse.json(
      { ok: false, error: "UNEXPECTED_ERROR", message: err.message },
      { status: 500 }
    );
  }
}
