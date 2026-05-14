// src/lib/bff/logger.ts

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface Logger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}

const isProduction = process.env.NODE_ENV === "production";
const LOG_LEVEL: LogLevel = (process.env.BFF_LOG_LEVEL as LogLevel) ?? (isProduction ? "info" : "debug");

const levelPriority: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function shouldLog(level: LogLevel): boolean {
  return levelPriority[level] >= levelPriority[LOG_LEVEL];
}

function formatMessage(component: string, correlationId: string, message: string): string {
  return `[BFF][${component}][${correlationId}] ${message}`;
}

export function createLogger(component: string, correlationId: string): Logger {
  const log = (level: LogLevel, message: string, meta?: Record<string, unknown>) => {
    if (!shouldLog(level)) return;

    const formatted = formatMessage(component, correlationId, message);
    const logEntry = meta ? { ...meta, correlationId } : { correlationId };

    switch (level) {
      case "debug":
        console.debug(formatted, logEntry);
        break;
      case "info":
        console.info(formatted, logEntry);
        break;
      case "warn":
        console.warn(formatted, logEntry);
        break;
      case "error":
        console.error(formatted, logEntry);
        break;
    }
  };

  return {
    debug: (msg, meta) => log("debug", msg, meta),
    info: (msg, meta) => log("info", msg, meta),
    warn: (msg, meta) => log("warn", msg, meta),
    error: (msg, meta) => log("error", msg, meta),
  };
}

// Global logger without correlation ID (for startup/shutdown)
export const rootLogger = createLogger("ROOT", "NO_CORRELATION");