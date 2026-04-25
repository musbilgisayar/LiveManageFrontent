"use client";

import type {
  CreateSocialMediaAccountRequestDto,
  UpdateSocialMediaAccountRequestDto,
  SocialMediaListResponseDto,
  SocialMediaDetailResponseDto,
  SocialMediaMutationResponseDto,
} from "../types/UserSocialMedia.types";

// 🔴 Artık BACKEND YOK
// 🟢 Sadece BFF route'lar var

const BASE = "/api/v1.0/userprofile/social-media";

// --------------------------------------------------
// GET BY OWNER
// --------------------------------------------------
export async function getSocialMediaByOwner(
  ownerType: string,
  ownerId: string,
): Promise<SocialMediaListResponseDto> {
  const url = `${BASE}/by-owner?ownerType=${encodeURIComponent(ownerType)}&ownerId=${encodeURIComponent(ownerId)}`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const json = await res.json();
  return json;
}

// --------------------------------------------------
// GET BY ID
// --------------------------------------------------
export async function getSocialMediaById(
  id: string,
): Promise<SocialMediaDetailResponseDto> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const json = await res.json();
  return json;
}

// --------------------------------------------------
// CREATE
// --------------------------------------------------
export async function createSocialMedia(
  payload: CreateSocialMediaAccountRequestDto,
): Promise<SocialMediaMutationResponseDto> {
  const res = await fetch(BASE, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  return json;
}

// --------------------------------------------------
// UPDATE
// --------------------------------------------------
export async function updateSocialMedia(
  id: string,
  payload: UpdateSocialMediaAccountRequestDto,
): Promise<SocialMediaMutationResponseDto> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  return json;
}

// --------------------------------------------------
// DELETE
// --------------------------------------------------
export async function deleteSocialMedia(
  id: string,
): Promise<SocialMediaMutationResponseDto> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  const json = await res.json();
  return json;
}