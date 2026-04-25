"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAddressDistricts,
  getAddressNeighborhoods,
  getAddressProvinces,
  type AddressDistrictLookupDto,
  type AddressNeighborhoodLookupDto,
  type AddressProvinceLookupDto,
} from "../services/addressHierarchy.service";

type UseAddressHierarchyOptions = {
  initialProvinceId?: string | null;
  initialDistrictId?: string | null;
  autoLoad?: boolean;
};

type UseAddressHierarchyResult = {
  provinces: AddressProvinceLookupDto[];
  districts: AddressDistrictLookupDto[];
  neighborhoods: AddressNeighborhoodLookupDto[];

  selectedProvinceId: string;
  selectedDistrictId: string;
  selectedNeighborhoodId: string;

  isProvincesLoading: boolean;
  isDistrictsLoading: boolean;
  isNeighborhoodsLoading: boolean;
  isInitialLoading: boolean;

  errorMessage: string | null;

  setSelectedProvinceId: (value: string) => Promise<AddressDistrictLookupDto[]>;
  setSelectedDistrictId: (
    value: string
  ) => Promise<AddressNeighborhoodLookupDto[]>;
  setSelectedNeighborhoodId: (value: string) => void;

  reloadProvinces: (countryCode?: string) => Promise<AddressProvinceLookupDto[]>;
  reloadDistricts: (provinceId: string) => Promise<AddressDistrictLookupDto[]>;
  reloadNeighborhoods: (
    districtId: string
  ) => Promise<AddressNeighborhoodLookupDto[]>;

  clearAll: () => void;
};

export function useAddressHierarchy(
  options?: UseAddressHierarchyOptions
): UseAddressHierarchyResult {
  const [provinces, setProvinces] = useState<AddressProvinceLookupDto[]>([]);
  const [districts, setDistricts] = useState<AddressDistrictLookupDto[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<
    AddressNeighborhoodLookupDto[]
  >([]);

  const [selectedProvinceId, setSelectedProvinceIdState] = useState(
    options?.initialProvinceId?.trim() ?? ""
  );
  const [selectedDistrictId, setSelectedDistrictIdState] = useState(
    options?.initialDistrictId?.trim() ?? ""
  );
  const [selectedNeighborhoodId, setSelectedNeighborhoodIdState] = useState("");

  const [isProvincesLoading, setIsProvincesLoading] = useState(false);
  const [isDistrictsLoading, setIsDistrictsLoading] = useState(false);
  const [isNeighborhoodsLoading, setIsNeighborhoodsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const autoLoad = options?.autoLoad ?? true;

  const isInitialLoading = useMemo(() => {
    return isProvincesLoading || isDistrictsLoading || isNeighborhoodsLoading;
  }, [isProvincesLoading, isDistrictsLoading, isNeighborhoodsLoading]);

  const reloadProvinces = useCallback(
    async (countryCode?: string): Promise<AddressProvinceLookupDto[]> => {
      const nextCountryCode = (countryCode ?? "").trim().toUpperCase();

      setErrorMessage(null);

      if (!nextCountryCode) {
        setProvinces([]);
        return [];
      }

      setIsProvincesLoading(true);

      try {
        const response = await getAddressProvinces(nextCountryCode);

        if (!response.ok) {
          setProvinces([]);
          setErrorMessage(response.userMessage || response.message || null);
          return [];
        }

        const items = Array.isArray(response.data) ? response.data : [];
        setProvinces(items);
        return items;
      } catch (error) {
        console.error("[useAddressHierarchy][reloadProvinces] failed", error);
        setProvinces([]);
        setErrorMessage("İl listesi yüklenirken beklenmeyen bir hata oluştu.");
        return [];
      } finally {
        setIsProvincesLoading(false);
      }
    },
    []
  );

  const reloadDistricts = useCallback(
    async (provinceId: string): Promise<AddressDistrictLookupDto[]> => {
      const nextProvinceId = provinceId.trim();

      setErrorMessage(null);

      if (!nextProvinceId) {
        setDistricts([]);
        return [];
      }

      setIsDistrictsLoading(true);

      try {
        const response = await getAddressDistricts(nextProvinceId);

        if (!response.ok) {
          setDistricts([]);
          setErrorMessage(response.userMessage || response.message || null);
          return [];
        }

        const items = Array.isArray(response.data) ? response.data : [];
        setDistricts(items);
        return items;
      } catch (error) {
        console.error("[useAddressHierarchy][reloadDistricts] failed", error);
        setDistricts([]);
        setErrorMessage("İlçe listesi yüklenirken beklenmeyen bir hata oluştu.");
        return [];
      } finally {
        setIsDistrictsLoading(false);
      }
    },
    []
  );

  const reloadNeighborhoods = useCallback(
    async (districtId: string): Promise<AddressNeighborhoodLookupDto[]> => {
      const nextDistrictId = districtId.trim();

      setErrorMessage(null);

      if (!nextDistrictId) {
        setNeighborhoods([]);
        return [];
      }

      setIsNeighborhoodsLoading(true);

      try {
        const response = await getAddressNeighborhoods(nextDistrictId);

        if (!response.ok) {
          setNeighborhoods([]);
          setErrorMessage(response.userMessage || response.message || null);
          return [];
        }

        const items = Array.isArray(response.data) ? response.data : [];
        setNeighborhoods(items);
        return items;
      } catch (error) {
        console.error(
          "[useAddressHierarchy][reloadNeighborhoods] failed",
          error
        );
        setNeighborhoods([]);
        setErrorMessage(
          "Mahalle/köy listesi yüklenirken beklenmeyen bir hata oluştu."
        );
        return [];
      } finally {
        setIsNeighborhoodsLoading(false);
      }
    },
    []
  );

  const setSelectedProvinceId = useCallback(
    async (value: string): Promise<AddressDistrictLookupDto[]> => {
      const nextProvinceId = value.trim();

      setSelectedProvinceIdState(nextProvinceId);
      setSelectedDistrictIdState("");
      setSelectedNeighborhoodIdState("");
      setDistricts([]);
      setNeighborhoods([]);
      setErrorMessage(null);

      if (!nextProvinceId) {
        return [];
      }

      return await reloadDistricts(nextProvinceId);
    },
    [reloadDistricts]
  );

  const setSelectedDistrictId = useCallback(
    async (value: string): Promise<AddressNeighborhoodLookupDto[]> => {
      const nextDistrictId = value.trim();

      setSelectedDistrictIdState(nextDistrictId);
      setSelectedNeighborhoodIdState("");
      setNeighborhoods([]);
      setErrorMessage(null);

      if (!nextDistrictId) {
        return [];
      }

      return await reloadNeighborhoods(nextDistrictId);
    },
    [reloadNeighborhoods]
  );

  const setSelectedNeighborhoodId = useCallback((value: string) => {
    setSelectedNeighborhoodIdState(value.trim());
  }, []);

  const clearAll = useCallback(() => {
    setSelectedProvinceIdState("");
    setSelectedDistrictIdState("");
    setSelectedNeighborhoodIdState("");
    setProvinces([]);
    setDistricts([]);
    setNeighborhoods([]);
    setErrorMessage(null);
  }, []);

  useEffect(() => {
    if (!autoLoad) return;
    void reloadProvinces();
  }, [autoLoad, reloadProvinces]);

  return {
    provinces,
    districts,
    neighborhoods,

    selectedProvinceId,
    selectedDistrictId,
    selectedNeighborhoodId,

    isProvincesLoading,
    isDistrictsLoading,
    isNeighborhoodsLoading,
    isInitialLoading,

    errorMessage,

    setSelectedProvinceId,
    setSelectedDistrictId,
    setSelectedNeighborhoodId,

    reloadProvinces,
    reloadDistricts,
    reloadNeighborhoods,

    clearAll,
  };
}