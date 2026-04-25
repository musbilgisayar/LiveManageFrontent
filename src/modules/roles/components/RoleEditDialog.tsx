"use client";

import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControlLabel,
    Checkbox,
    MenuItem,
    Typography
} from "@mui/material";
import { Switch } from "@mui/material";

import { useForm, Controller } from "react-hook-form";
import { useI18nNs } from "@/app/context/i18nContext";

interface RoleEditFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: RoleFormValues) => void;
    defaultValues: RoleFormValues;
}

export interface RoleFormValues {
    id: string;
    name: string;
    description: string;
    priority: number;
    category: number;
    isSensitive: boolean;
    complianceTag: string;
    expirationDate: string;
    permissions: string[];
    isDeleted: boolean;
}

export default function RoleEditDialog({
    open,
    onClose,
    onSubmit,
    defaultValues,
}: RoleEditFormProps) {
    const { t } = useI18nNs(["roles"]);
    const { control, handleSubmit } = useForm<RoleFormValues>({ defaultValues });

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{t("roles:edit.title")}</DialogTitle>

            <DialogContent className="space-y-4 mt-2">
                <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label={t("roles:fields.name")}
                            fullWidth
                            variant="outlined"
                        />
                    )}
                />

                <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label={t("roles:fields.description")}
                            fullWidth
                            multiline
                            rows={3}
                        />
                    )}
                />

                <Controller
                    name="priority"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            type="number"
                            label={t("roles:fields.priority")}
                            fullWidth
                        />
                    )}
                />

                <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            select
                            label={t("roles:fields.category")}
                            fullWidth
                        >
                            <MenuItem value={1}>{t("roles:categories.system")}</MenuItem>
                            <MenuItem value={2}>{t("roles:categories.organization")}</MenuItem>
                            <MenuItem value={3}>{t("roles:categories.custom")}</MenuItem>
                        </TextField>
                    )}
                />

                <Controller
                    name="isSensitive"
                    control={control}
                    render={({ field }) => (
                        <FormControlLabel
                            control={<Checkbox {...field} checked={field.value} />}
                            label={t("roles:fields.isSensitive")}
                        />
                    )}
                />

                <Controller
                    name="complianceTag"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label={t("roles:fields.complianceTag")}
                            fullWidth
                        />
                    )}
                />

                <Controller
                    name="expirationDate"
                    control={control}
                    render={({ field }) => {
                        // 🔸 local buffer state: kullanıcı yazarken silinme olmaz
                        const [tempValue, setTempValue] = React.useState(
                            field.value
                                ? new Date(field.value).toISOString().substring(0, 16)
                                : ""
                        );

                        return (
                            <TextField
                                type="datetime-local"
                                label={t("roles:fields.expirationDate")}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={tempValue}
                                onChange={(e) => {
                                    setTempValue(e.target.value); // sadece local güncelleme
                                }}
                                onBlur={() => {
                                    const raw = tempValue;
                                    const iso = raw ? new Date(raw + "Z").toISOString() : null;
                                    field.onChange(iso); // sadece blur anında form’a yaz
                                }}
                            />
                        );
                    }}
                />
                {/* 🔄 Active / Inactive switch */}
                <Controller
                    name="isDeleted"
                    control={control}
                    render={({ field }) => {
                        const isActive = !field.value; // isDeleted = false → aktif

                        return (
                            <FormControlLabel
                                control={
                                    <Switch
                                        {...field}
                                        checked={isActive}
                                        color="primary"
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            field.onChange(!e.target.checked) // aktifse pasif yap
                                        }
                                    />
                                }
                                label={
                                    <Typography
                                        sx={{
                                            ml: 1,
                                            fontWeight: 500,
                                            color: isActive ? "primary.main" : "text.secondary",
                                            transition: "color 0.2s ease",
                                        }}
                                    >
                                        {isActive
                                            ? t("roles:fields.activeRole")  
                                            : t("roles:fields.inactiveRole")}  
                                    </Typography>
                                }
                            />
                        );
                    }}
                />



            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>{t("roles:button.cancel")}</Button>
                <Button onClick={handleSubmit(onSubmit)} variant="contained">
                    {t("roles:button.update")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
