// src/modules/auth/services/authLogin.service.ts

import { postWebFetcher } from "@/utils/fetchers.web.client";
import type {
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
      title: result.title,
    };
  }

  return {
    ok: true,
    message: result.message,
    data: result.data,
  };
}