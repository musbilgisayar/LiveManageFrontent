// src/modules/auth/services/authLogin.service.ts

import { postWebFetcher } from "@/utils/fetchers.web.client";
import type {
  GoogleLoginRequestDto,
  GoogleLoginResponseDto,
  LoginRequestDto,
  LoginResponseDto,
} from "../types/AuthLogin.types";
import { unwrapApiResponse } from "../utils/authApiResponse.utils";

export async function loginWeb(
  payload: LoginRequestDto
): Promise<LoginResponseDto> {
  const raw = await postWebFetcher("/api/v1.0/account/login", payload);

  const result = unwrapApiResponse<LoginResponseDto["data"]>(raw);

  if (!result.ok) {
    return {
      ok: false,
      error: result.error,
      message: result.message,
      userMessage: result.userMessage,
      title: result.title,
    };
  }

  return {
    ok: true,
    message: result.message,
    userMessage: result.userMessage,
    data: result.data,
  };
}

export async function loginWithGoogleWeb(
  payload: GoogleLoginRequestDto
): Promise<GoogleLoginResponseDto> {
  const raw = await postWebFetcher("/api/v1.0/account/external/google", payload);

  const result = unwrapApiResponse<GoogleLoginResponseDto["data"]>(raw);

  if (!result.ok) {
    return {
      ok: false,
      error: result.error,
      message: result.message,
      userMessage: result.userMessage,
      title: result.title,
    };
  }

  return {
    ok: true,
    message: result.message,
    userMessage: result.userMessage,
    data: result.data,
  };
}
