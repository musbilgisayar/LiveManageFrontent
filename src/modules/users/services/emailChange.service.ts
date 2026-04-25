"use client";

type GenericApiEnvelope<T = unknown> = {
  ok?: boolean;
  success?: boolean;
  message?: string | null;
  userMessage?: string | null;
  error?: string | null;
  data?: T;
};

export type EmailChangeRequestPayload = {
  newEmail: string;
};

export async function requestEmailChange(
  payload: EmailChangeRequestPayload
): Promise<GenericApiEnvelope> {
  const response = await fetch("/api/v1.0/account/users/email-changes/request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
    credentials: "include",
    cache: "no-store",
  });

  const text = await response.text();
  let json: GenericApiEnvelope | null = null;

  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = {
      ok: response.ok,
      message: text || "Unexpected response",
    };
  }

  if (!response.ok || json?.ok === false || json?.success === false) {
    throw new Error(
      json?.userMessage ||
        json?.message ||
        json?.error ||
        "E-posta değişiklik isteği başarısız oldu."
    );
  }

  return json ?? { ok: true };
}