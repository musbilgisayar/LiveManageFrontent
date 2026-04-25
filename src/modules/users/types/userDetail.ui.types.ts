// src/modules/users/types/userDetail.ui.types.ts

import type { UserDetailRole } from "./UserDetail.types";

/**
 * i18n translate function tipi
 */
export type UserDetailTFunction = (
  key: string,
  vars?: Record<string, string | number>
) => string;

/**
 * UI tarafında da ana detay type'ı kullanılır.
 * Böylece role sözleşmesi tek yerde yaşar.
 */
export type { UserDetailRole };