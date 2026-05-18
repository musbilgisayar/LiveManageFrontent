"use client";

import { useCallback, useState } from "react";

import { useI18nNs } from "@/app/context/i18nContext";

import { createManagementApplication } from "../services/managementApplication.service";

import type {
  ManagedPropertyApplicationDetailDto,
  ManagementApplicationFormState,
} from "../types/managementApplication.types";

import { mapManagementApplicationFormToCreateDto } from "../utils/managementApplication.mapper";

const NS = "property:managementApplication.create";

export type ManagementApplicationSubmitResult = {
  ok?: boolean;
  message: string;
  data: ManagedPropertyApplicationDetailDto | null;
  code?: string | null;
  existingApplicationId?: string | null;
};

type DuplicateApplicationMetadata = {
  existingApplicationId?: string | null;
  status?: number | string | null;
  propertyName?: string | null;
};

type LocalizedResponse = {
  ok?: boolean;
  message?: string | null;
  userMessage?: string | null;
  data?: unknown;
};

function isApplicationDetail(
  value: unknown,
): value is ManagedPropertyApplicationDetailDto {
  if (!value || typeof value !== "object") return false;

  return (
    "id" in value &&
    "tenantId" in value &&
    "applicantUserId" in value &&
    "propertyName" in value
  );
}

function getDuplicateApplicationId(
  code?: string | null,
  data?: unknown,
): string | null {
  if (code !== "property:application.alreadyExists") return null;

  const metadata = data as DuplicateApplicationMetadata | null;

  return metadata?.existingApplicationId ?? null;
}

function resolveMessage(
  response: LocalizedResponse,
  fallback: string,
): string {
  return response.userMessage || response.message || fallback;
}

export function useManagementApplicationCreate() {
  const { t } = useI18nNs(NS);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [createdApplication, setCreatedApplication] =
    useState<ManagedPropertyApplicationDetailDto | null>(null);
  const [existingApplicationId, setExistingApplicationId] =
    useState<string | null>(null);

  const resetSubmitState = useCallback(() => {
    setSubmitMessage(null);
    setCreatedApplication(null);
    setExistingApplicationId(null);
  }, []);

  const submit = useCallback(
    async (
      form: ManagementApplicationFormState,
    ): Promise<ManagementApplicationSubmitResult> => {
      setIsSubmitting(true);
      resetSubmitState();

      try {
        const payload = mapManagementApplicationFormToCreateDto(form);
        const response = await createManagementApplication(payload);

        const code = response.message ?? null;

        if (!response.ok) {
          const message = resolveMessage(
            response,
            t(`${NS}.submit.error`),
          );

          const duplicateApplicationId = getDuplicateApplicationId(
            code,
            response.data,
          );

          setSubmitMessage(message);
          setExistingApplicationId(duplicateApplicationId);

          return {
            ok: false,
            message,
            data: null,
            code,
            existingApplicationId: duplicateApplicationId,
          };
        }

        const createdData = isApplicationDetail(response.data)
          ? response.data
          : null;

        const message = resolveMessage(
          response,
          t(`${NS}.submit.success`),
        );

        setSubmitMessage(message);
        setCreatedApplication(createdData);

        return {
          ok: true,
          message,
          data: createdData,
          code,
          existingApplicationId: null,
        };
      } finally {
        setIsSubmitting(false);
      }
    },
    [resetSubmitState, t],
  );

  return {
    isSubmitting,
    submitMessage,
    createdApplication,
    existingApplicationId,
    submit,
  };
}