// src/modules/auth/services/authRegister.service.ts

import { postWebFetcher } from "@/utils/fetchers.web.client";
import type { RegisterPayloadDto } from "../types/AuthRegister.types";
import { unwrapRegisterApi } from "../utils/authRegisterApi.utils";

export async function registerWeb(payload: RegisterPayloadDto) {
  const raw = await postWebFetcher("/api/v1.0/account/register", payload);

  return {
    raw,
    data: unwrapRegisterApi(raw),
  };
}