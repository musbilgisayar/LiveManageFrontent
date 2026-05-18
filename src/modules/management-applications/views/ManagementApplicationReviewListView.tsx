"use client";

import React from "react";

import {
  Alert,
  Box,
  CircularProgress,
  Stack,
} from "@mui/material";

import { useParams, useRouter } from "next/navigation";

import { useI18nNs } from "@/app/context/i18nContext";

import ReviewListCard from "../components/review-list/ReviewListCard";
import ReviewListEmpty from "../components/review-list/ReviewListEmpty";
import ReviewListFilters from "../components/review-list/ReviewListFilters";
import ReviewListHero from "../components/review-list/ReviewListHero";

import useAdminManagementReviewList from "../hooks/useAdminManagementReviewList";

export default function ManagementApplicationReviewListView() {
  const router = useRouter();

  const params =
    useParams<{ locale?: string }>();

  const { t } =
    useI18nNs("management-applications");

  const locale =
    params?.locale ?? "tr";

  const {
    filteredItems,
    summary,
    filter,
    isLoading,
    errorMessage,
    setSearch,
    setStatus,
    setRisk,
  } =
    useAdminManagementReviewList();

  const openDetail = (
    applicationId: string,
  ) => {
    router.push(
      `/${locale}/management-applications/review/${applicationId}`,
    );
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          py: 10,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={2.4}>
      <ReviewListHero
        summary={summary}
      />

      {errorMessage && (
        <Alert
          severity="error"
          sx={{
            borderRadius: 3,
          }}
        >
          {t(errorMessage)}
        </Alert>
      )}

      <ReviewListFilters
        filter={filter}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onRiskChange={setRisk}
      />

      {filteredItems.length === 0 ? (
        <ReviewListEmpty />
      ) : (
        <Stack spacing={1.4}>
          {filteredItems.map(
            (item) => (
              <ReviewListCard
                key={item.id}
                item={item}
                onOpen={() =>
                  openDetail(
                    item.id,
                  )
                }
              />
            ),
          )}
        </Stack>
      )}
    </Stack>
  );
}