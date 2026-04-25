// src/app/api/v1.0/userprofile/social-media/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { proxyJsonWithWebAuth } from "@/lib/bff/proxyJsonWithWebAuth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function validateId(id?: string) {
  if (!id) {
    return NextResponse.json(
      {
        ok: false,
        message: "Id is required.",
        userMessage: "Sosyal medya kaydı bulunamadı.",
        errors: { id: ["Id is required."] },
      },
      { status: 400 }
    );
  }

  return null;
}

// =======================
// GET
// =======================
export async function GET(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const validation = validateId(id);
  if (validation) return validation;

  return proxyJsonWithWebAuth(req, {
    url: `/api/v1.0/profile/social-media/${id}`,
    method: "GET",
    logLabel: "SocialMedia.GetById",
  });
}

// =======================
// PUT
// =======================
export async function PUT(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const validation = validateId(id);
  if (validation) return validation;

  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json(
      {
        ok: false,
        message: "Body is required.",
        userMessage: "Güncellenecek veri eksik.",
      },
      { status: 400 }
    );
  }

  return proxyJsonWithWebAuth(req, {
    url: `/api/v1.0/profile/social-media/${id}`,
    method: "PUT",
    body,
    logLabel: "SocialMedia.Update",
  });
}

// =======================
// DELETE
// =======================
export async function DELETE(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const validation = validateId(id);
  if (validation) return validation;

  return proxyJsonWithWebAuth(req, {
    url: `/api/v1.0/profile/social-media/${id}`,
    method: "DELETE",
    logLabel: "SocialMedia.Delete",
  });
}