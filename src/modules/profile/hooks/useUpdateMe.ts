import useSWRMutation from "swr/mutation";

export type UpdateMeRequestDto = {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  cultureCode?: string;
  timeZone?: string;
  phoneCountryCode?: string;
  phoneNumber?: string;
};

async function patcher(url: string, { arg }: { arg: UpdateMeRequestDto }) {
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
    credentials: "include", // cookie/refresh akışınız varsa önemli
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const msg =
      json?.message ||
      json?.userMessage ||
      (typeof json === "string" ? json : "Update failed");
    const err: any = new Error(msg);
    err.status = res.status;
    err.body = json;
    throw err;
  }

  return json;
}

export function useUpdateMe() {
  const { trigger, data, error, isMutating } = useSWRMutation(
    "/api/v1.0/account/me", // ✅ BFF endpoint
    patcher
  );

  return {
    updateMe: trigger,
    data,
    error,
    isLoading: isMutating,
  };
}
