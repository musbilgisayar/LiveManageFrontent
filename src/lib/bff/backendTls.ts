// src/lib/bff/backendTls.ts

import "server-only";

let undiciReady: Promise<void> | null = null;

export const BACKEND_SSL_INSECURE =
  process.env.BE_SSL_INSECURE === "true" ||
  process.env.BACKEND_SSL_INSECURE === "true";

export function shouldUseInsecureBackendTls(): boolean {
  return BACKEND_SSL_INSECURE;
}

export async function ensureBackendTlsReady(): Promise<void> {
  if (!shouldUseInsecureBackendTls()) {
    return;
  }

  if (undiciReady) {
    return undiciReady;
  }

  undiciReady = (async () => {
    const { Agent, setGlobalDispatcher } = await import("undici");

    setGlobalDispatcher(
      new Agent({
        connect: {
          rejectUnauthorized: false,
        },
      })
    );
  })().catch((error) => {
    undiciReady = null;
    throw error;
  });

  return undiciReady;
}