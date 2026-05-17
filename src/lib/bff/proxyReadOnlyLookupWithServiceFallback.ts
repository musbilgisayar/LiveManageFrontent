import { NextRequest, NextResponse } from "next/server";
import { getServiceToken } from "@/app/api/_shared/bff";
import {
  buildWebAuthHeaders,
  filterProxyResponseHeaders,
  resolveBackendUrl,
  resolveCorrelationId,
  withTimeout,
} from "./webAuthProxyCore";
import { createLogger } from "./logger";

type TransformContext = {
  correlationId: string;
  upstreamStatus: number;
  usedServiceFallback: boolean;
};

type Options = {
  url: string;
  timeoutMs?: number;
  extraHeaders?: HeadersInit;
  logLabel: string;
  transformResponse: (
    payload: unknown,
    context: TransformContext
  ) => {
    body: unknown;
    status?: number;
    headers?: HeadersInit;
  };
};

async function readPayload(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function applyHeaders(target: Headers, source?: HeadersInit): void {
  if (!source) return;
  new Headers(source).forEach((value, key) => target.set(key, value));
}

async function fetchWithHeaders(
  url: string,
  headers: Headers,
  timeoutMs: number
): Promise<Response> {
  const timeout = withTimeout(timeoutMs);

  try {
    return await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
      signal: timeout.signal,
    });
  } finally {
    timeout.cleanup();
  }
}

export async function proxyReadOnlyLookupWithServiceFallback(
  req: NextRequest,
  options: Options
) {
  const timeoutMs = options.timeoutMs ?? 10_000;
  const correlationId = resolveCorrelationId(req);
  const url = resolveBackendUrl(options.url);
  const logger = createLogger(options.logLabel, correlationId);

  let headers = buildWebAuthHeaders(req, correlationId, {
    extraHeaders: options.extraHeaders,
    defaultAccept: "application/json",
  });

  logger.debug("Lookup request started", {
    targetUrl: url,
    hasCookie: !!req.headers.get("cookie"),
  });

  let upstream = await fetchWithHeaders(url, headers, timeoutMs);
  let usedServiceFallback = false;

  if (upstream.status === 403) {
    const serviceToken = (await getServiceToken()).trim();

    if (serviceToken) {
      headers = buildWebAuthHeaders(req, correlationId, {
        extraHeaders: options.extraHeaders,
        defaultAccept: "application/json",
        includeAuthorization: false,
      });
      headers.delete("cookie");
      headers.set("authorization", `Bearer ${serviceToken}`);

      logger.warn("User lookup forbidden, retrying read-only lookup with service token", {
        firstStatus: upstream.status,
      });

      upstream = await fetchWithHeaders(url, headers, timeoutMs);
      usedServiceFallback = true;
    }
  }

  const payload = await readPayload(upstream);
  const responseHeaders = filterProxyResponseHeaders(upstream, []);
  const transformed = options.transformResponse(payload, {
    correlationId,
    upstreamStatus: upstream.status,
    usedServiceFallback,
  });

  applyHeaders(responseHeaders, transformed.headers);

  return NextResponse.json(transformed.body, {
    status: transformed.status ?? upstream.status,
    headers: responseHeaders,
  });
}
