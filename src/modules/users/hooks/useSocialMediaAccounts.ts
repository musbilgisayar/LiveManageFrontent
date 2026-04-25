// src/modules/users/hooks/useSocialMediaAccounts.ts
"use client";

import { useCallback, useMemo, useState } from "react";
import useSWR from "swr";

import {
  createSocialMedia,
  deleteSocialMedia,
  getSocialMediaByOwner,
  updateSocialMedia,
} from "../services/userSocialMedia.service";

import type {
  CreateSocialMediaAccountRequestDto,
  SocialMediaAccountListItemDto,
  SocialMediaFormValues,
  UpdateSocialMediaAccountRequestDto,
} from "../types/UserSocialMedia.types";

type UseSocialMediaAccountsParams = {
  ownerType: string;
  ownerId: string;
  enabled?: boolean;
};

type UseSocialMediaAccountsResult = {
  items: SocialMediaAccountListItemDto[];
  isLoading: boolean;
  isValidating: boolean;
  error: string | null;
  mutateList: () => Promise<void>;
  createItem: (payload: CreateSocialMediaAccountRequestDto) => Promise<boolean>;
  updateItem: (id: string, payload: UpdateSocialMediaAccountRequestDto) => Promise<boolean>;
  deleteItem: (id: string) => Promise<boolean>;
  createFromForm: (values: SocialMediaFormValues) => Promise<boolean>;
  updateFromForm: (id: string, values: SocialMediaFormValues) => Promise<boolean>;
};

function normalizeHandle(value?: string | null): string {
  if (!value) return "";
  return value.trim().replace(/^@+/, "").replace(/\s+/g, "");
}

function buildUrl(platform?: string, rawHandle?: string | null): string {
  const handle = normalizeHandle(rawHandle);
  if (!platform || !handle) return "";

  switch (platform) {
    case "LinkedIn":
      return `https://www.linkedin.com/in/${handle}`;
    case "Instagram":
      return `https://www.instagram.com/${handle}`;
    case "Facebook":
      return `https://www.facebook.com/${handle}`;
    case "X":
      return `https://x.com/${handle}`;
    case "YouTube":
      return `https://www.youtube.com/@${handle}`;
    case "TikTok":
      return `https://www.tiktok.com/@${handle}`;
    case "Website":
      return `https://${handle}`;
    case "Other":
      return handle.startsWith("http://") || handle.startsWith("https://")
        ? handle
        : `https://${handle}`;
    default:
      return "";
  }
}

function normalizeListItem(raw: any): SocialMediaAccountListItemDto {
  return {
    id: raw?.id ?? raw?.Id ?? "",
    platform: raw?.platform ?? raw?.Platform ?? "",
    url: raw?.url ?? raw?.Url ?? "",
    userNameOrHandle: raw?.userNameOrHandle ?? raw?.UserNameOrHandle ?? null,
    displayName: raw?.displayName ?? raw?.DisplayName ?? null,
    isPrimary: raw?.isPrimary ?? raw?.IsPrimary ?? false,
    isActive: raw?.isActive ?? raw?.IsActive ?? false,
    sortOrder: raw?.sortOrder ?? raw?.SortOrder ?? 0,
  };
}

function normalizeListResponse(raw: any): {
  items: SocialMediaAccountListItemDto[];
  message?: string | null;
  success: boolean;
} {
  const successValue =
    raw?.isSuccess ??
    raw?.success ??
    raw?.IsSuccess ??
    raw?.Success;

  const data =
    raw?.data?.data ??
    raw?.Data?.Data ??
    raw?.data?.items ??
    raw?.Data?.Items ??
    raw?.data ??
    raw?.Data ??
    [];

  const rawItems = Array.isArray(data) ? data : [];
  const items = rawItems.map(normalizeListItem);

  return {
    items,
    message: raw?.message ?? raw?.Message ?? null,
    success: typeof successValue === "boolean" ? successValue : true,
  };
}

function hasExplicitFailure(raw: any): boolean {
  const candidates = [
    raw?.isSuccess,
    raw?.success,
    raw?.IsSuccess,
    raw?.Success,
    raw?.data?.isSuccess,
    raw?.data?.success,
    raw?.Data?.IsSuccess,
    raw?.Data?.Success,
  ];

  return candidates.some((value) => value === false);
}

function normalizeMutationResponse(raw: any): {
  success: boolean;
  message?: string | null;
  data?: any;
} {
  const explicitSuccess =
    raw?.isSuccess ??
    raw?.success ??
    raw?.IsSuccess ??
    raw?.Success ??
    raw?.data?.isSuccess ??
    raw?.data?.success ??
    raw?.Data?.IsSuccess ??
    raw?.Data?.Success;

  return {
    // Backend 2xx dönüp success flag göndermiyorsa başarılı kabul et.
    success: typeof explicitSuccess === "boolean" ? explicitSuccess : !hasExplicitFailure(raw),
    message:
      raw?.message ??
      raw?.Message ??
      raw?.data?.message ??
      raw?.data?.Message ??
      raw?.Data?.message ??
      raw?.Data?.Message ??
      null,
    data: raw?.data ?? raw?.Data ?? null,
  };
}

export function useSocialMediaAccounts({
  ownerType,
  ownerId,
  enabled = true,
}: UseSocialMediaAccountsParams): UseSocialMediaAccountsResult {
  const [mutationError, setMutationError] = useState<string | null>(null);

  const swrKey =
    enabled && ownerType && ownerId
      ? ["social-media-by-owner", ownerType, ownerId]
      : null;

  const fetcher = useCallback(async () => {
    const response = await getSocialMediaByOwner(ownerType, ownerId);
    const normalized = normalizeListResponse(response);

    if (!normalized.success && normalized.items.length === 0 && normalized.message) {
      throw new Error(normalized.message);
    }

    return normalized.items;
  }, [ownerType, ownerId]);

  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<SocialMediaAccountListItemDto[]>(swrKey, fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    keepPreviousData: true,
  });

  const items = useMemo(() => data ?? [], [data]);

  const mutateList = useCallback(async () => {
    setMutationError(null);
    await mutate();
  }, [mutate]);

  const createItem = useCallback(
    async (payload: CreateSocialMediaAccountRequestDto) => {
      setMutationError(null);

      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      const optimisticItem: SocialMediaAccountListItemDto = {
        id: tempId,
        platform: payload.platform,
        url: payload.url,
        userNameOrHandle: payload.userNameOrHandle ?? null,
        displayName: payload.displayName ?? null,
        isPrimary: payload.isPrimary,
        isActive: payload.isActive,
        sortOrder: payload.sortOrder,
      };

      const previous = data ?? [];

      const optimisticList = optimisticItem.isPrimary
        ? [optimisticItem, ...previous.map((x) => ({ ...x, isPrimary: false }))]
        : [optimisticItem, ...previous];

      await mutate(optimisticList, false);

      try {
        const response = await createSocialMedia(payload);
        const normalized = normalizeMutationResponse(response);

        if (!normalized.success) {
          await mutate(previous, false);
          setMutationError(normalized.message ?? "Sosyal medya kaydı oluşturulamadı.");
          return false;
        }

        await mutate();
        return true;
      } catch (err: any) {
        await mutate(previous, false);
        setMutationError(err?.message ?? "Sosyal medya kaydı oluşturulamadı.");
        return false;
      }
    },
    [data, mutate],
  );

  const updateItem = useCallback(
    async (id: string, payload: UpdateSocialMediaAccountRequestDto) => {
      setMutationError(null);

      const previous = data ?? [];

      const updatedCandidate: SocialMediaAccountListItemDto = {
        id,
        platform: payload.platform,
        url: payload.url,
        userNameOrHandle: payload.userNameOrHandle ?? null,
        displayName: payload.displayName ?? null,
        isPrimary: payload.isPrimary,
        isActive: payload.isActive,
        sortOrder: payload.sortOrder,
      };

      let optimisticList = previous.map((x) => (x.id === id ? { ...x, ...updatedCandidate } : x));

      if (updatedCandidate.isPrimary) {
        optimisticList = optimisticList.map((x) =>
          x.id === id ? x : { ...x, isPrimary: false }
        );
      }

      await mutate(optimisticList, false);

      try {
        const response = await updateSocialMedia(id, payload);
        const normalized = normalizeMutationResponse(response);

        if (!normalized.success) {
          await mutate(previous, false);
          setMutationError(normalized.message ?? "Sosyal medya kaydı güncellenemedi.");
          return false;
        }

        await mutate();
        return true;
      } catch (err: any) {
        await mutate(previous, false);
        setMutationError(err?.message ?? "Sosyal medya kaydı güncellenemedi.");
        return false;
      }
    },
    [data, mutate],
  );

  const deleteItem = useCallback(
    async (id: string) => {
      setMutationError(null);

      const previous = data ?? [];
      const optimisticList = previous.filter((x) => x.id !== id);

      await mutate(optimisticList, false);

      try {
        const response = await deleteSocialMedia(id);
        const normalized = normalizeMutationResponse(response);

        if (!normalized.success) {
          await mutate(previous, false);
          setMutationError(normalized.message ?? "Sosyal medya kaydı silinemedi.");
          return false;
        }

        await mutate();
        return true;
      } catch (err: any) {
        await mutate(previous, false);
        setMutationError(err?.message ?? "Sosyal medya kaydı silinemedi.");
        return false;
      }
    },
    [data, mutate],
  );

  const createFromForm = useCallback(
    async (values: SocialMediaFormValues) => {
      const normalizedHandle = normalizeHandle(values.userNameOrHandle);
      const generatedUrl = buildUrl(values.platform, normalizedHandle);

      return createItem({
        ownerType,
        ownerId,
        platform: values.platform,
        url: generatedUrl,
        userNameOrHandle: normalizedHandle || null,
        displayName: values.displayName?.trim() || null,
        isPrimary: values.isPrimary,
        isActive: values.isActive,
        sortOrder: values.sortOrder,
      });
    },
    [createItem, ownerId, ownerType],
  );

  const updateFromForm = useCallback(
    async (id: string, values: SocialMediaFormValues) => {
      const normalizedHandle = normalizeHandle(values.userNameOrHandle);
      const generatedUrl = buildUrl(values.platform, normalizedHandle);

      return updateItem(id, {
        ownerType,
        ownerId,
        platform: values.platform,
        url: generatedUrl,
        userNameOrHandle: normalizedHandle || null,
        displayName: values.displayName?.trim() || null,
        isPrimary: values.isPrimary,
        isActive: values.isActive,
        sortOrder: values.sortOrder,
      });
    },
    [ownerId, ownerType, updateItem],
  );

  return {
    items,
    isLoading,
    isValidating,
    error: mutationError ?? error?.message ?? null,
    mutateList,
    createItem,
    updateItem,
    deleteItem,
    createFromForm,
    updateFromForm,
  };
}