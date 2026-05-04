import type { MuhasebeSetupStatusDto } from "../types/MuhasebeSetup.types";

const STORAGE_KEY = "livemanage:muhasebe:mock-setup-status";

const defaultStatus: MuhasebeSetupStatusDto = {
  hasCashAccount: false,
  hasActivePeriod: false,
  hasCharges: false,
};

export function getMuhasebeMockSetupStatus(): MuhasebeSetupStatusDto {
  if (typeof window === "undefined") return defaultStatus;

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) return defaultStatus;

  try {
    return {
      ...defaultStatus,
      ...JSON.parse(raw),
    };
  } catch {
    return defaultStatus;
  }
}

export function setMuhasebeMockSetupStatus(
  status: Partial<MuhasebeSetupStatusDto>
): MuhasebeSetupStatusDto {
  const current = getMuhasebeMockSetupStatus();

  const next = {
    ...current,
    ...status,
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

  return next;
}

export function resetMuhasebeMockSetupStatus() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}