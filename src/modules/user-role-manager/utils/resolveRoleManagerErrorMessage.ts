type Translate = (key: string) => string;

export function resolveRoleManagerErrorMessage(
  error: unknown,
  fallbackKey: string,
  t: Translate,
): string {
  const message = error instanceof Error ? error.message.trim() : "";

  if (!message) {
    return t(fallbackKey);
  }

  if (
    message.startsWith("userRoleManager:") ||
    message.startsWith("userRoleManager.")
  ) {
    return t(message);
  }

  return message;
}
