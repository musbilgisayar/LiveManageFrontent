// src/modules/management-applications/hooks/useManagementApplicationCreate.ts
"use client";

import { useCallback, useState } from "react";

import { useI18nNs } from "@/app/context/i18nContext";

import {
  createManagementApplication,
  uploadManagementApplicationDocument,
} from "../services/managementApplication.service";
import { createManagementApplicationAddress } from "../services/managementApplicationAddress.service";

import type {
  ManagedPropertyApplicationDetailDto,
  ManagementApplicationFormState,
  UploadedFileItem,
} from "../types/managementApplication.types";

import { mapManagementApplicationFormToCreateDto } from "../utils/managementApplication.mapper";

const NS = "management-applications:create";

const DOCUMENT_TYPE_MAP: Record<string, number> = {
  SignedContract: 1,
  AuthorityDecision: 2,
  PowerOfAttorney: 3,
  AssignmentLetter: 4,
  ProfessionalServiceAgreement: 5,
  IdentityDocument: 6,
  PropertyRegistryDocument: 7,
  Other: 99,
};

export type ManagementApplicationSubmitResult = {
  ok?: boolean;
  message: string;
  data: ManagedPropertyApplicationDetailDto | null;
  code?: string | null;
  existingApplicationId?: string | null;
  uploadedDocumentCount?: number;
  failedDocumentCount?: number;
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
    "applicationNumber" in value &&
    "property" in value
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

function getDocumentSortOrder(
  file: UploadedFileItem,
  index: number,
): number {
  return typeof file.sortOrder === "number" ? file.sortOrder : index + 1;
}

export function useManagementApplicationCreate() {
  const { t } = useI18nNs("management-applications");

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
      uploadedFiles: UploadedFileItem[] = [],
    ): Promise<ManagementApplicationSubmitResult> => {
      setIsSubmitting(true);

      resetSubmitState();

      try {
        const addressResponse = await createManagementApplicationAddress(
          form.address,
        );

        const addressId =
          addressResponse.data?.addressId ??
          addressResponse.data?.AddressId ??
          addressResponse.data?.id ??
          addressResponse.data?.Id ??
          null;


        if (!addressResponse.ok || !addressId) {
          const message =
            addressResponse.userMessage ||
            addressResponse.message ||
            t(`${NS}.address.create.error`);

          setSubmitMessage(message);

          return {
            ok: false,
            message,
            data: null,
            code:
              addressResponse.message ||
              "management-applications:create.address.error",
            existingApplicationId: null,
            uploadedDocumentCount: 0,
            failedDocumentCount: uploadedFiles.length,
          };
        }






        const formWithAddressId = {
          ...form,
          address: {
            ...form.address,
            addressId,
          },
        };


        const payload =
          mapManagementApplicationFormToCreateDto(formWithAddressId);
        const response = await createManagementApplication(payload);

        const code = response.message ?? null;

        if (!response.ok) {
          const message = resolveMessage(
            response,
            t(`${NS}.submit.error`),
          );

          const duplicateApplicationId =
            getDuplicateApplicationId(
              code,
              response.data,
            );

          setSubmitMessage(message);

          setExistingApplicationId(
            duplicateApplicationId,
          );

          return {
            ok: false,
            message,
            data: null,
            code,
            existingApplicationId:
              duplicateApplicationId,
            uploadedDocumentCount: 0,
            failedDocumentCount:
              uploadedFiles.length,
          };
        }

        const createdData = isApplicationDetail(
          response.data,
        )
          ? response.data
          : null;

        if (!createdData?.id) {
          const message = t(
            `${NS}.submit.error`,
          );

          setSubmitMessage(message);

          setCreatedApplication(null);

          return {
            ok: false,
            message,
            data: null,
            code,
            existingApplicationId: null,
            uploadedDocumentCount: 0,
            failedDocumentCount:
              uploadedFiles.length,
          };
        }

        let uploadedDocumentCount = 0;
        let failedDocumentCount = 0;

        for (const [index, item] of uploadedFiles.entries()) {
          const uploadResponse =
            await uploadManagementApplicationDocument({
              applicationId: createdData.id,
              documentType:
                DOCUMENT_TYPE_MAP[item.kind] ?? 0,
              file: item.file,
              isRequired: true,
              isSensitive: false,
              sortOrder: getDocumentSortOrder(
                item,
                index,
              ),
            });

          if (uploadResponse.ok) {
            uploadedDocumentCount += 1;
          } else {
            failedDocumentCount += 1;
          }
        }

        const message =
          failedDocumentCount > 0
            ? t(
                `${NS}.submit.successWithDocumentWarnings`,
              )
            : resolveMessage(
                response,
                t(
                  `${NS}.submit.success`,
                ),
              );

        setSubmitMessage(message);

        setCreatedApplication(createdData);

        return {
          ok: failedDocumentCount === 0,
          message,
          data: createdData,
          code,
          existingApplicationId: null,
          uploadedDocumentCount,
          failedDocumentCount,
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
