"use client";

import { useCallback, useState } from "react";
import { createManagementApplication } from "../services/managementApplication.service";
import type {
    ManagedPropertyApplicationDetailDto,
    ManagementApplicationFormState,
} from "../types/managementApplication.types";
import { mapManagementApplicationFormToCreateDto } from "../utils/managementApplication.mapper";

export type ManagementApplicationSubmitResult = {
    ok: boolean;
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

function isManagedPropertyApplicationDetailDto(
    value: unknown,
): value is ManagedPropertyApplicationDetailDto {
    return (
        typeof value === "object" &&
        value !== null &&
        "id" in value &&
        "tenantId" in value &&
        "applicantUserId" in value &&
        "propertyName" in value
    );
}
export function useManagementApplicationCreate() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<string | null>(null);
    const [createdApplication, setCreatedApplication] =
        useState<ManagedPropertyApplicationDetailDto | null>(null);

    const [existingApplicationId, setExistingApplicationId] =
        useState<string | null>(null);

    const submit = useCallback(
        async (
            form: ManagementApplicationFormState,
        ): Promise<ManagementApplicationSubmitResult> => {
            setIsSubmitting(true);
            setSubmitMessage(null);
            setCreatedApplication(null);
            setExistingApplicationId(null);

            try {
                const payload = mapManagementApplicationFormToCreateDto(form);
                const response = await createManagementApplication(payload);

                const message =
                    response.userMessage || response.message || "Başvuru gönderilemedi.";

                if (!response.ok) {
                    const metadata = response.data as DuplicateApplicationMetadata | null;

                    const duplicateExistingApplicationId =
                        response.message === "property:application.alreadyExists"
                            ? metadata?.existingApplicationId ?? null
                            : null;

                    setSubmitMessage(message);
                    setExistingApplicationId(duplicateExistingApplicationId);

                    return {
                        ok: false,
                        message,
                        data: null,
                        code: response.message ?? null,
                        existingApplicationId: duplicateExistingApplicationId,
                    };
                }


                const createdData = isManagedPropertyApplicationDetailDto(response.data)
                    ? response.data
                    : null;

                setCreatedApplication(createdData);
                const successMessage =
                    response.userMessage ||
                    response.message ||
                    "Başvuru başarıyla gönderildi.";

                setSubmitMessage(successMessage);

                return {
                    ok: true,
                    message: successMessage,
                    data: createdData,
                    code: response.message ?? null,
                    existingApplicationId: null,
                };
            } finally {
                setIsSubmitting(false);
            }
        },
        [],
    );

    return {
        isSubmitting,
        submitMessage,
        createdApplication,
        existingApplicationId,
        submit,
    };
}