import type { ChargeItem } from "@/modules/muhasebe/types/MuhasebeCharge.types";

export async function getChargesAsync(): Promise<ChargeItem[]> {
  return [];
}

export async function createChargeAsync(payload: ChargeItem): Promise<ChargeItem> {
  return payload;
}

export async function updateChargeAsync(payload: ChargeItem): Promise<ChargeItem> {
  return payload;
}

export async function deleteChargeAsync(id: string): Promise<{ id: string }> {
  return { id };
}

export async function postChargeAsync(id: string): Promise<{ id: string }> {
  return { id };
}

export async function cancelChargeAsync(id: string): Promise<{ id: string }> {
  return { id };
}

export async function createBulkChargesAsync(payload: ChargeItem[]): Promise<ChargeItem[]> {
  return payload;
}