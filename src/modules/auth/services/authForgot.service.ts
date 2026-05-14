// src/modules/auth/services/authForgot.service.ts

import { postWebFetcher } from "@/utils/fetchers.web.client";
import type {
  ForgotPasswordRequestDto,
  ForgotPasswordResponseDto,
} from "../types/AuthForgot.types";
import { unwrapApiResponse } from "../utils/authApiResponse.utils";

export async function requestForgotPassword(
  payload: ForgotPasswordRequestDto
): Promise<ForgotPasswordResponseDto> {
  const raw = await postWebFetcher("/api/v1.0/account/forgot-password", payload);

  const result = unwrapApiResponse<ForgotPasswordResponseDto>(raw);

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
    ...(typeof result.data === "object" && result.data ? result.data : {}),
  };
}