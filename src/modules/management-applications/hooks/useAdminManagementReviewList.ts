"use client";

import { useEffect, useMemo, useState } from "react";

import { getPendingAdminManagementApplications } from "../services/managementApplication.service";

import type {
  AdminApplicationRiskLevel,
  AdminApplicationStatus,
  AdminManagementApplicationListItem,
  AdminManagementApplicationReviewFilter,
} from "../types/adminManagementApplication.types";

const initialFilter: AdminManagementApplicationReviewFilter = {
  search: "",
  status: "all",
  risk: "all",
};

export default function useAdminManagementReviewList() {
  const [items, setItems] = useState<AdminManagementApplicationListItem[]>([]);
  const [filter, setFilter] =
    useState<AdminManagementApplicationReviewFilter>(initialFilter);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await getPendingAdminManagementApplications();

        if (!response.ok) {
          setItems([]);
          setErrorMessage(
            response.userMessage ||
              response.message ||
              "admin.reviewList.load.error",
          );
          return;
        }

        setItems(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("[useAdminManagementReviewList][load] failed", error);
        setItems([]);
        setErrorMessage("admin.reviewList.load.unexpectedError");
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, []);

  const filteredItems = useMemo(() => {
    const term = filter.search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        !term ||
        [
          item.applicationNumber,
          item.applicantName,
          item.applicantEmail,
          item.propertyName,
          item.propertyAddress,
          item.requestedRole,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term);

      const matchesStatus =
        filter.status === "all" || item.status === filter.status;

      const risk = item.riskLevel ?? "low";
      const matchesRisk = filter.risk === "all" || risk === filter.risk;

      return matchesSearch && matchesStatus && matchesRisk;
    });
  }, [filter, items]);

  const summary = useMemo(() => {
    return {
      total: items.length,
      pending: items.filter((x) => x.status === "pending").length,
      inReview: items.filter((x) => x.status === "in_review").length,
      missing: items.filter((x) => x.status === "missing_information").length,
      critical: items.filter((x) => x.riskLevel === "critical").length,
    };
  }, [items]);

  const setSearch = (search: string) =>
    setFilter((prev) => ({ ...prev, search }));

  const setStatus = (status: AdminApplicationStatus | "all") =>
    setFilter((prev) => ({ ...prev, status }));

  const setRisk = (risk: AdminApplicationRiskLevel | "all") =>
    setFilter((prev) => ({ ...prev, risk }));

  return {
    items,
    filteredItems,
    summary,
    filter,
    isLoading,
    errorMessage,
    setSearch,
    setStatus,
    setRisk,
  };
}