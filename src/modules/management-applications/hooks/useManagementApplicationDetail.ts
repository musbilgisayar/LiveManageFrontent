"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getMyManagementApplicationDetail } from "../services/managementApplication.service";

import { useAccountMe } from "@/modules/profile/hooks/useAccountMe";
import { useUserPhoneNumbersUltimate } from "@/modules/users/hooks/useUserPhoneNumbers_ultimate";

import type { AdminManagementApplicationDetail } from "../types/adminManagementApplication.types";

function cleanText(value?: string | null): string {
  return (value ?? "").trim();
}

function joinNonEmpty(
  values: Array<string | null | undefined>,
  separator = " ",
): string {
  return values.map(cleanText).filter(Boolean).join(separator).trim();
}

function readString(
  source: Record<string, unknown> | null,
  keys: string[],
): string {
  for (const key of keys) {
    const value = source?.[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function readBoolean(
  source: Record<string, unknown> | null,
  keys: string[],
): boolean {
  return keys.some((key) => source?.[key] === true);
}

function firstNonEmptyString(...values: Array<unknown>): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function isPlaceholder(value?: string | null): boolean {
  const text = cleanText(value);
  return !text || text === "-";
}

function isLikelyIdentifier(value?: string | null): boolean {
  const text = cleanText(value);

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    text,
  );
}

export default function useManagementApplicationDetail(applicationId: string) {
  const [data, setData] =
    useState<AdminManagementApplicationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { user } = useAccountMe();

  const accountRecord = user as Record<string, unknown> | null;
  const identityRecord =
    accountRecord?.identity && typeof accountRecord.identity === "object"
      ? (accountRecord.identity as Record<string, unknown>)
      : null;
  const contactRecord =
    accountRecord?.contact && typeof accountRecord.contact === "object"
      ? (accountRecord.contact as Record<string, unknown>)
      : null;
  const verificationRecord =
    accountRecord?.verification &&
    typeof accountRecord.verification === "object"
      ? (accountRecord.verification as Record<string, unknown>)
      : null;
  const nestedUser =
    accountRecord?.user && typeof accountRecord.user === "object"
      ? (accountRecord.user as Record<string, unknown>)
      : null;

  const accountUserId = firstNonEmptyString(
    readString(identityRecord, [
      "id",
      "userId",
      "appUserId",
      "applicationUserId",
      "sub",
    ]),
    readString(accountRecord, [
      "id",
      "userId",
      "appUserId",
      "applicationUserId",
      "sub",
    ]),
    readString(nestedUser, [
      "id",
      "userId",
      "appUserId",
      "applicationUserId",
      "sub",
    ]),
    data?.applicant.userId,
  );

  const { items: phoneItems } = useUserPhoneNumbersUltimate(
    accountUserId || undefined,
    { enabled: Boolean(accountUserId) },
  );

  const selectedPhone = useMemo(() => {
    return (
      phoneItems.find((item) => item.isPrimary && item.isVerified) ||
      phoneItems.find((item) => item.isVerified) ||
      phoneItems.find((item) => item.isPrimary) ||
      phoneItems[0] ||
      null
    );
  }, [phoneItems]);

  const accountApplicant = useMemo(() => {
    const firstName =
      readString(identityRecord, ["firstName", "givenName"]) ||
      readString(accountRecord, ["firstName", "givenName"]) ||
      readString(nestedUser, ["firstName", "givenName"]);

    const lastName =
      readString(identityRecord, ["lastName", "surname", "familyName"]) ||
      readString(accountRecord, ["lastName", "surname", "familyName"]) ||
      readString(nestedUser, ["lastName", "surname", "familyName"]);

    const fullName =
      joinNonEmpty([firstName, lastName]) ||
      readString(identityRecord, ["fullName", "displayName", "name"]) ||
      readString(accountRecord, ["fullName", "displayName", "name"]) ||
      readString(nestedUser, ["fullName", "displayName", "name"]);

    const email =
      readString(contactRecord, ["email", "emailAddress"]) ||
      readString(accountRecord, ["email", "emailAddress"]) ||
      readString(nestedUser, ["email", "emailAddress"]);

    const phoneCountryCode =
      readString(contactRecord, ["phoneCountryCode", "countryCode"]) ||
      readString(accountRecord, ["phoneCountryCode", "countryCode"]) ||
      readString(nestedUser, ["phoneCountryCode", "countryCode"]) ||
      cleanText(selectedPhone?.countryCode);

    const phoneNumber =
      readString(contactRecord, ["phoneNumber", "phone", "mobilePhone"]) ||
      readString(accountRecord, ["phoneNumber", "phone", "mobilePhone"]) ||
      readString(nestedUser, ["phoneNumber", "phone", "mobilePhone"]) ||
      cleanText(selectedPhone?.phoneNumber);

    return {
      fullName,
      email,
      phone: joinNonEmpty([phoneCountryCode, phoneNumber]),
      emailVerified:
        readBoolean(verificationRecord, [
          "isEmailConfirmed",
          "emailConfirmed",
          "emailVerified",
        ]) ||
        readBoolean(accountRecord, [
          "isEmailConfirmed",
          "emailConfirmed",
          "emailVerified",
        ]) ||
        readBoolean(nestedUser, [
          "isEmailConfirmed",
          "emailConfirmed",
          "emailVerified",
        ]),
      phoneVerified:
        readBoolean(verificationRecord, [
          "isPhoneConfirmed",
          "phoneConfirmed",
          "phoneVerified",
        ]) ||
        readBoolean(accountRecord, [
          "isPhoneConfirmed",
          "phoneConfirmed",
          "phoneVerified",
        ]) ||
        readBoolean(nestedUser, [
          "isPhoneConfirmed",
          "phoneConfirmed",
          "phoneVerified",
        ]) ||
        selectedPhone?.isVerified === true,
    };
  }, [
    accountRecord,
    contactRecord,
    identityRecord,
    nestedUser,
    selectedPhone,
    verificationRecord,
  ]);

  const hydratedData = useMemo(() => {
    if (!data) return null;

    return {
      ...data,
      applicant: {
        ...data.applicant,
        fullName:
          isPlaceholder(data.applicant.fullName) ||
          data.applicant.fullName === data.applicant.userId ||
          isLikelyIdentifier(data.applicant.fullName)
          ? accountApplicant.fullName || data.applicant.fullName
          : data.applicant.fullName,
        email: isPlaceholder(data.applicant.email)
          ? accountApplicant.email || data.applicant.email
          : data.applicant.email,
        phone: isPlaceholder(data.applicant.phone)
          ? accountApplicant.phone || data.applicant.phone
          : data.applicant.phone,
        emailVerified:
          data.applicant.emailVerified || accountApplicant.emailVerified,
        phoneVerified:
          data.applicant.phoneVerified || accountApplicant.phoneVerified,
      },
    };
  }, [accountApplicant, data]);

  const load = useCallback(async () => {
    if (!applicationId) {
      setData(null);
      setErrorMessage("admin.detail.load.missingApplicationId");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await getMyManagementApplicationDetail(applicationId);

      if (!response.ok || !response.data) {
        setData(null);
        setErrorMessage(
          response.userMessage ||
            response.message ||
            "admin.detail.load.error",
        );
        return;
      }

      setData(response.data);
    } catch (error) {
      console.error("[useManagementApplicationDetail][load] failed", error);
      setData(null);
      setErrorMessage("admin.detail.load.unexpectedError");
    } finally {
      setIsLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    data: hydratedData,
    isLoading,
    errorMessage,
    reload: load,
  };
}
