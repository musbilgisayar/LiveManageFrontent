// src/modules/auth/services/authResetPassword.service.ts

import { postWebFetcher } from "@/utils/fetchers.web.client";
import type {
  ResetPasswordRequestDto,
  ResetPasswordResponseDto,
} from "../types/AuthResetPassword.types";
import { unwrapApiResponse } from "../utils/authApiResponse.utils";

export async function resetPasswordWeb(
  payload: ResetPasswordRequestDto
): Promise<ResetPasswordResponseDto> {
  const raw = await postWebFetcher("/api/v1.0/account/reset-password", payload);

  const result = unwrapApiResponse<ResetPasswordResponseDto>(raw);

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