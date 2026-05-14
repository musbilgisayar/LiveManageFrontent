// src/modules/auth/utils/authRegisterPhone.utils.ts

import type { SplitPhoneResult } from "../types/AuthRegister.types";

export function splitE164Phone(value: string): SplitPhoneResult | null {
  const phone = value.trim();

  if (!phone) return null;
  if (!phone.startsWith("+")) return null;

  const knownCodes = ["+41", "+49", "+90", "+43", "+33", "+39", "+1"];
  const known = knownCodes.find((code) => phone.startsWith(code));

  if (known) {
    return {
      phoneCountryCode: known,
      phoneNumber: phone.slice(known.length),
    };
  }

  const match = phone.match(/^(\+\d{1,3})(\d+)$/);

  if (!match) return null;

  return {
    phoneCountryCode: match[1],
    phoneNumber: match[2],
  };
}