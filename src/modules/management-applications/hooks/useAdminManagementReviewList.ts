"use client";

import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/app/context/AuthContext";

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

const SUPERADMIN_GLOBAL_PERMISSIONS = [
  "admin.property.applications.view_pending.global",
  "admin.property.applications.detail.global",
  "admin.property.applications.manage.global",
  "localization.manage.global",
  "culture.cache.clear.global",
  "audit.entity_history.view.tenant",
  "monitoring.summary.view.tenant",
];

export function useIsSuperAdminScope() {
  const { user, hasAnyPermission } = useAuth();

  return useMemo(() => {
    const roles = [
      ...(user?.roles ?? []),
      ...(Array.isArray((user as any)?.role) ? (user as any).role : []),
    ].map((role) => String(role).toLowerCase());

    return (
      roles.some((role) => role === "superadmin" || role === "super_admin") ||
      hasAnyPermission(SUPERADMIN_GLOBAL_PERMISSIONS)
    );
  }, [hasAnyPermission, user]);
}

export default function useAdminManagementReviewList() {
  const { loading: authLoading } = useAuth();

  const [items, setItems] = useState<AdminManagementApplicationListItem[]>([]);
  const [filter, setFilter] =
    useState<AdminManagementApplicationReviewFilter>(initialFilter);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSuperAdmin = useIsSuperAdminScope();

  useEffect(() => {
    if (authLoading) return;

    async function load() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await getPendingAdminManagementApplications({
          scope: isSuperAdmin ? "global" : "tenant",
        });

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
  }, [authLoading, isSuperAdmin]);

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
