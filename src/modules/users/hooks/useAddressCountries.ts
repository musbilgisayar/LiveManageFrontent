"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getAddressCountries,
  getAllAddressCountries,
  type AddressCountryDto,
  type AddressCountryLookupDto,
} from "../services/addressHierarchy.service";

type UseAddressCountriesOptions = {
  includeAll?: boolean;
  autoLoad?: boolean;
};

type UseAddressCountriesResult = {
  countries: AddressCountryLookupDto[] | AddressCountryDto[];
  isLoading: boolean;
  errorMessage: string | null;
  reload: (force?: boolean) => Promise<void>;
  clear: () => void;
};

export function useAddressCountries(
  options?: UseAddressCountriesOptions
): UseAddressCountriesResult {
  const [countries, setCountries] = useState<
    AddressCountryLookupDto[] | AddressCountryDto[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const includeAll = options?.includeAll ?? false;
  const autoLoad = options?.autoLoad ?? true;

  const isLoadingRef = useRef(false);
  const hasLoadedRef = useRef(false);
  const loadSignatureRef = useRef<string>("");

  const reload = useCallback(
    async (force = false) => {
      const signature = includeAll ? "all" : "active";

      if (!force) {
        if (isLoadingRef.current) return;
        if (hasLoadedRef.current && loadSignatureRef.current === signature)
          return;
      }

      isLoadingRef.current = true;
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = includeAll
          ? await getAllAddressCountries()
          : await getAddressCountries();

        if (!response.ok) {
          setCountries([]);
          setErrorMessage(response.userMessage || response.message || null);
          hasLoadedRef.current = false;
          loadSignatureRef.current = "";
          return;
        }

        setCountries(Array.isArray(response.data) ? response.data : []);
        hasLoadedRef.current = true;
        loadSignatureRef.current = signature;
      } catch (error) {
        console.error("[useAddressCountries][reload] failed", error);
        setCountries([]);
        setErrorMessage("Ülke listesi yüklenirken beklenmeyen bir hata oluştu.");
        hasLoadedRef.current = false;
        loadSignatureRef.current = "";
      } finally {
        isLoadingRef.current = false;
        setIsLoading(false);
      }
    },
    [includeAll]
  );

  const clear = useCallback(() => {
    setCountries([]);
    setErrorMessage(null);
    hasLoadedRef.current = false;
    loadSignatureRef.current = "";
    isLoadingRef.current = false;
  }, []);

  useEffect(() => {
    if (!autoLoad) return;
    void reload();
  }, [autoLoad, reload]);

  return {
    countries,
    isLoading,
    errorMessage,
    reload,
    clear,
  };
}