"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteAddressLink,
  getUserAddressLinks,
  setPrimaryAddressLink,
} from "../services/userAddressManager.service";
import type {
  OwnerKindValue,
  UserAddressLinkDto,
} from "../types/UserAddress.types";

type UseUserAddressLinksState = {
  items: UserAddressLinkDto[];
  isLoading: boolean;
  isSettingPrimary: boolean;
  isDeleting: boolean;
  error: string | null;
};

export function useUserAddressLinks(
  ownerId: string,
  ownerKind: OwnerKindValue = "Kisisel"
) {
  const [state, setState] = useState<UseUserAddressLinksState>({
    items: [],
    isLoading: true,
    isSettingPrimary: false,
    isDeleting: false,
    error: null,
  });

  const load = useCallback(async () => {
    if (!ownerId?.trim()) {
      setState({
        items: [],
        isLoading: false,
        isSettingPrimary: false,
        isDeleting: false,
        error: null,
      });
      return;
    }

    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const items = await getUserAddressLinks({
        ownerId,
        ownerKind,
      });

      setState((prev) => ({
        ...prev,
        items: Array.isArray(items) ? items : [],
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Adres bağlantıları yüklenemedi.";

      setState((prev) => ({
        ...prev,
        items: [],
        isLoading: false,
        error: message,
      }));
    }
  }, [ownerId, ownerKind]);

  const handleSetPrimary = useCallback(
    async (addressLinkId: string) => {
      if (!addressLinkId?.trim()) {
        throw new Error("Geçerli bir adres bağlantı kimliği bulunamadı.");
      }

      setState((prev) => ({
        ...prev,
        isSettingPrimary: true,
        error: null,
      }));

      try {
        await setPrimaryAddressLink(addressLinkId);

        await load();

        setState((prev) => ({
          ...prev,
          isSettingPrimary: false,
        }));
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Birincil adres ayarlama işlemi başarısız oldu.";

        setState((prev) => ({
          ...prev,
          isSettingPrimary: false,
          error: message,
        }));

        throw error;
      }
    },
    [load]
  );

  const handleDelete = useCallback(
    async (addressLinkId: string) => {
      if (!addressLinkId?.trim()) {
        throw new Error("Geçerli bir adres bağlantı kimliği bulunamadı.");
      }

      setState((prev) => ({
        ...prev,
        isDeleting: true,
        error: null,
      }));

      try {
        await deleteAddressLink(addressLinkId);

        await load();

        setState((prev) => ({
          ...prev,
          isDeleting: false,
        }));
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Adres bağlantısı silme işlemi başarısız oldu.";

        setState((prev) => ({
          ...prev,
          isDeleting: false,
          error: message,
        }));

        throw error;
      }
    },
    [load]
  );

  useEffect(() => {
    void load();
  }, [load]);

  return {
    items: state.items,
    isLoading: state.isLoading,
    isSettingPrimary: state.isSettingPrimary,
    isDeleting: state.isDeleting,
    error: state.error,
    refetch: load,
    setPrimary: handleSetPrimary,
    deleteLink: handleDelete,
  };
}