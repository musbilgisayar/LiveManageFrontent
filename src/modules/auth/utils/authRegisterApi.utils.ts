// src/modules/auth/utils/authRegisterApi.utils.ts

import type { RegisterApiResponse } from "../types/AuthRegister.types";

export function asText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;

    return (
      (typeof obj.userMessage === "string" && obj.userMessage) ||
      (typeof obj.message === "string" && obj.message) ||
      (typeof obj.error === "string" && obj.error) ||
      (typeof obj.title === "string" && obj.title) ||
      ""
    );
  }

  return String(value);
}

function pickWithOk(value: unknown): RegisterApiResponse | null {
  if (value && typeof value === "object" && "ok" in value) {
    return value as RegisterApiResponse;
  }

  return null;
}

export function unwrapRegisterApi(raw: unknown): RegisterApiResponse {
  const obj = raw as Record<string, unknown> | null | undefined;

  const candidates = [
    obj?.data,
    (obj?.error as Record<string, unknown> | undefined)?.data,
    (obj?.response as Record<string, unknown> | undefined)?.data,
    ((obj?.error as Record<string, unknown> | undefined)?.response as
      | Record<string, unknown>
      | undefined)?.data,
    raw,
  ];

  for (const candidate of candidates) {
    const result = pickWithOk(candidate);

    if (result) return result;
  }

  for (const candidate of candidates) {
    if (
      candidate &&
      typeof candidate === "object" &&
      ("userMessage" in candidate || "details" in candidate)
    ) {
      const item = candidate as Record<string, unknown>;

      return {
        ok: false,
        error: typeof item.error === "string" ? item.error : "ERROR",
        userMessage:
          typeof item.userMessage === "string" ? item.userMessage : undefined,
        details:
          typeof item.details === "string" || typeof item.details === "object"
            ? (item.details as Record<string, unknown> | string)
            : undefined,
      };
    }
  }

  return {
    ok: false,
    error: "UNKNOWN",
  };
}

export function translateIfKey(
  message: string,
  t: (key: string) => string
): string {
  if (!message) return "";

  if (message.startsWith("[") && message.endsWith("]")) {
    const key = message.slice(1, -1);
    return t(key) || key;
  }

  return message;
}

export function findDetails(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return null;

  const obj = raw as Record<string, unknown>;

  if (obj.details) return obj.details;
  if (obj.errors) return obj.errors;

  if (obj.data && typeof obj.data === "object") {
    const dataObj = obj.data as Record<string, unknown>;

    if (dataObj.details) return dataObj.details;
    if (dataObj.errors) return dataObj.errors;
  }

  if (obj.error && typeof obj.error === "object") {
    const errorObj = obj.error as Record<string, unknown>;

    if (errorObj.details) return errorObj.details;
    if (errorObj.errors) return errorObj.errors;

    if (errorObj.data && typeof errorObj.data === "object") {
      const errorDataObj = errorObj.data as Record<string, unknown>;

      if (errorDataObj.details) return errorDataObj.details;
      if (errorDataObj.errors) return errorDataObj.errors;
    }
  }

  return null;
}

const FIELD_ALIASES: Record<string, string> = {
  username: "email",
  user_name: "email",
  user: "email",
  email: "email",
  culturecode: "general",
  phonenumber: "phonenumber",
  phone: "phonenumber",
  phonecountrycode: "phonenumber",
  confirm_password: "confirmpassword",
  confirmpassword: "confirmpassword",
  firstname: "firstname",
  lastname: "lastname",
  password: "password",
};

function toClientField(rawKey: string): string {
  const key = rawKey.toLowerCase().trim();
  return FIELD_ALIASES[key] ?? key;
}

export function firstDetailMessage(
  details: unknown,
  t: (key: string) => string,
  preferred: string[] = ["PhoneNumber", "phoneNumber", "phonenumber", "phone"]
): string {
  if (!details || typeof details !== "object" || Array.isArray(details)) {
    return "";
  }

  const obj = details as Record<string, unknown>;

  for (const key of preferred) {
    const value = obj[key];

    if (Array.isArray(value) && value.length > 0) {
      return translateIfKey(String(value[0]), t);
    }
  }

  for (const value of Object.values(obj)) {
    if (Array.isArray(value) && value.length > 0) {
      return translateIfKey(String(value[0]), t);
    }
  }

  return "";
}

export function normalizeDetails(
  details: unknown,
  t: (key: string) => string
): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  if (!details || typeof details !== "object" || Array.isArray(details)) {
    return errors;
  }

  for (const [field, value] of Object.entries(details as Record<string, unknown>)) {
    if (Array.isArray(value) && value.length > 0) {
      const clientField = toClientField(field);
      const first = translateIfKey(String(value[0]), t);

      if (
        [
          "email",
          "phonenumber",
          "firstname",
          "lastname",
          "password",
          "confirmpassword",
          "general",
        ].includes(clientField)
      ) {
        errors[clientField] = [first];
      }
    }
  }

  if (Object.keys(errors).length === 0) {
    const message = firstDetailMessage(details, t);

    if (message) {
      errors.general = [message];
    }
  }

  return errors;
}