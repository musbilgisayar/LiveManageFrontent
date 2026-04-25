// src/modules/users/components/detail/tabs/phone-manager/dialogs/PhoneEditDialog_ultimate.tsx

"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
    Alert,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    MenuItem,
    Stack,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import { useI18nNs } from "@/app/context/i18nContext";
import { useUpdateUserPhoneNumberUltimate } from "@/modules/users/hooks/useUpdateUserPhoneNumber_ultimate";
import type { UserPhoneNumberDtoUltimate, UserPhoneTypeUltimate, } from "@/modules/users/types/UserPhone.types_ultimate";

import { mapPhoneErrorToUiUltimate } from "../helpers/phoneErrorMapper_ultimate";

interface PropsUltimate {
    open: boolean;
    userId: string;
    item: UserPhoneNumberDtoUltimate | null;
    onClose: () => void;
    onUpdated?: () => Promise<void> | void;
    onSuccessMessage?: (message: string) => void;
}

type FormStateUltimate = {
    countryCode: string;
    phoneNumber: string;
    phoneType: number;
    label: string;
    isPrimary: boolean;
};

const COUNTRY_OPTIONS_ULTIMATE = [
    { code: "+90", label: "🇹🇷 Türkiye" },
    { code: "+41", label: "🇨🇭 İsviçre" },
    { code: "+49", label: "🇩🇪 Almanya" },
    { code: "+33", label: "🇫🇷 Fransa" },
    { code: "+39", label: "🇮🇹 İtalya" },
];

const PHONE_TYPES_ULTIMATE = [
    { value: 0, key: "mobile" },
    { value: 1, key: "home" },
    { value: 2, key: "work" },
    { value: 3, key: "other" },
];

function mapPhoneTypeToNumberUltimate(phoneType: unknown): number {
    if (typeof phoneType === "number") return phoneType;

    if (typeof phoneType === "string") {
        const normalized = phoneType.toLowerCase();
        if (normalized === "mobile") return 0;
        if (normalized === "home") return 1;
        if (normalized === "work") return 2;
        if (normalized === "other") return 3;
    }

    return 0;
}
function mapPhoneTypeToRequestUltimate(
    phoneType: number
): UserPhoneTypeUltimate {
    if (phoneType === 0) return "Mobile";
    if (phoneType === 1) return "Home";
    if (phoneType === 2) return "Work";
    return "Other";
}


export default function PhoneEditDialog_ultimate({
    open,
    userId,
    item,
    onClose,
    onUpdated,
    onSuccessMessage,
}: PropsUltimate) {
    const { t } = useI18nNs(["users", "common"]);

    const initialForm = useMemo<FormStateUltimate>(
        () => ({
            countryCode: item?.countryCode ?? "+90",
            phoneNumber: item?.phoneNumber ?? "",
            phoneType: mapPhoneTypeToNumberUltimate(item?.phoneType),
            label: item?.label ?? "",
            isPrimary: Boolean(item?.isPrimary),
        }),
        [item]
    );

    const [form, setForm] = useState<FormStateUltimate>(initialForm);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    React.useEffect(() => {
        setForm(initialForm);
        setFieldErrors({});
    }, [initialForm, open]);

    const { updatePhone, isSubmitting, error, resetError } =
        useUpdateUserPhoneNumberUltimate({
            onSuccess: async () => {
                await onUpdated?.();
            },
        });

    const normalizedServerError = useMemo(
        () => (error ? mapPhoneErrorToUiUltimate(error) : null),
        [error]
    );

    const handleFieldChange = useCallback(
        <K extends keyof FormStateUltimate>(field: K, value: FormStateUltimate[K]) => {
            setForm((prev) => ({ ...prev, [field]: value }));

            setFieldErrors((prev) => {
                if (!prev[field]) return prev;
                const next = { ...prev };
                delete next[field];
                return next;
            });
        },
        []
    );

    const handleClose = useCallback(() => {
        if (isSubmitting) return;
        resetError();
        onClose();
    }, [isSubmitting, onClose, resetError]);

    const validate = useCallback(() => {
        const errors: Record<string, string> = {};

        const countryCode = form.countryCode.trim();
        const normalizedPhone = form.phoneNumber.replace(/\s+/g, "").replace(/[^\d]/g, "");
        const label = form.label.trim();

        if (!countryCode) {
            errors.countryCode = t("users:detail.phone.validation.countryCodeRequired");
        } else if (!/^\+\d+$/.test(countryCode)) {
            errors.countryCode = t("users:detail.phone.validation.invalidCountryCode");
        }

        if (!form.phoneNumber.trim()) {
            errors.phoneNumber = t("users:detail.phone.validation.phoneNumberRequired");
        } else if (normalizedPhone.length < 6 || normalizedPhone.length > 15) {
            errors.phoneNumber = t("users:detail.phone.validation.invalidPhoneNumber");
        }

        if (label.length > 50) {
            errors.label = t("users:detail.phone.validation.labelTooLong");
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    }, [form, t]);

    const handleSubmit = useCallback(async () => {
        if (!item?.phoneId) return;
        if (!validate()) return;

        try {
            await updatePhone({
                userId,
                phoneId: item.phoneId,
                countryCode: form.countryCode.trim(),
                phoneNumber: form.phoneNumber.replace(/\s+/g, "").replace(/[^\d]/g, ""),
                phoneType: mapPhoneTypeToRequestUltimate(form.phoneType),
                label: form.label.trim() || null,
                isPrimary: form.isPrimary,
            });

            onSuccessMessage?.(t("users:detail.phone.editSuccess"));
            handleClose();
        } catch { }
    }, [form, handleClose, item?.phoneId, onSuccessMessage, t, updatePhone, userId, validate]);

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>{t("users:detail.phone.editTitle")}</DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2.5}>
                    <Typography variant="body2" color="text.secondary">
                        {t("users:detail.phone.editDescription")}
                    </Typography>

                    {normalizedServerError?.message ? (
                        <Alert severity="error">{normalizedServerError.message}</Alert>
                    ) : null}

                    <TextField
                        select
                        fullWidth
                        label={t("users:detail.phone.countryCode")}
                        value={form.countryCode}
                        onChange={(e) => handleFieldChange("countryCode", e.target.value)}
                        error={Boolean(fieldErrors.countryCode)}
                        helperText={fieldErrors.countryCode || " "}
                        disabled={isSubmitting}
                    >
                        {COUNTRY_OPTIONS_ULTIMATE.map((country) => (
                            <MenuItem key={country.code} value={country.code}>
                                {country.label} ({country.code})
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        fullWidth
                        label={t("users:detail.phone.phoneNumber")}
                        value={form.phoneNumber}
                        onChange={(e) => handleFieldChange("phoneNumber", e.target.value)}
                        placeholder="5XX XXX XX XX"
                        error={Boolean(fieldErrors.phoneNumber)}
                        helperText={fieldErrors.phoneNumber || " "}
                        disabled={isSubmitting}
                    />

                    <TextField
                        select
                        fullWidth
                        label={t("users:detail.phone.phoneType")}
                        value={form.phoneType}
                        onChange={(e) => handleFieldChange("phoneType", Number(e.target.value))}
                        disabled={isSubmitting}
                    >
                        {PHONE_TYPES_ULTIMATE.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                                {t(`users:detail.phone.types.${type.key}`)}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        fullWidth
                        label={t("users:detail.phone.label")}
                        value={form.label}
                        onChange={(e) => handleFieldChange("label", e.target.value)}
                        placeholder="Örn: Kişisel, Ofis"
                        error={Boolean(fieldErrors.label)}
                        helperText={fieldErrors.label || " "}
                        disabled={isSubmitting}
                    />

                    <FormControlLabel
                        control={
                            <Switch
                                checked={form.isPrimary}
                                onChange={(e) => handleFieldChange("isPrimary", e.target.checked)}
                                disabled={isSubmitting}
                            />
                        }
                        label={t("users:detail.phone.isPrimary")}
                    />
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} disabled={isSubmitting}>
                    {t("users:detail.phone.cancel")}
                </Button>

                <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? <CircularProgress size={20} /> : t("users:detail.phone.save")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}