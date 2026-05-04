//src/modules/muhasebe/views/MuhasebeCashAccountsSetupView.tsx
"use client";

import React, { useState } from "react";
import {
    alpha,
    Box,
    Button,
    Card,
    CardContent,
    MenuItem,
    Stack,
    TextField,
    Typography,
    useTheme,
} from "@mui/material";
import {
    IconBuildingBank,
    IconDeviceMobile,
    IconPlus,
    IconWallet,
} from "@tabler/icons-react";
import { setMuhasebeMockSetupStatus } from "../utils/muhasebeMockSetupStorage";
import { useRouter } from "next/navigation";
type CashAccountType = "cash" | "bank" | "postfinance" | "twint" | "other";

type CashAccount = {
    id: string;
    name: string;
    type: CashAccountType;
    balance: number;
    currency: string;
};

const mockAccounts: CashAccount[] = [
    {
        id: "1",
        name: "Nakit Kasa",
        type: "cash",
        balance: 1200,
        currency: "CHF",
    },
    {
        id: "2",
        name: "Banka Hesabı",
        type: "bank",
        balance: 4300,
        currency: "CHF",
    },
];

function getIcon(type: CashAccountType) {
    switch (type) {
        case "cash":
            return <IconWallet size={18} />;
        case "bank":
            return <IconBuildingBank size={18} />;
        case "twint":
        case "postfinance":
            return <IconDeviceMobile size={18} />;
        default:
            return <IconBuildingBank size={18} />;
    }
}

export default function MuhasebeCashAccountsSetupView() {
    const theme = useTheme();

    const router = useRouter();
    const [accounts] = useState<CashAccount[]>(mockAccounts);
    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        name: "",
        type: "cash" as CashAccountType,
        balance: "",
        currency: "CHF",
    });

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Stack spacing={1} mb={3}>
                <Typography variant="h5" fontWeight={800}>
                    Kasa / Banka Tanımlama
                </Typography>

                <Typography variant="body2" color="text.secondary">
                    Ödeme ve gider işlemlerinde kullanılacak hesapları yönetin.
                </Typography>
            </Stack>

            <Stack spacing={2}>
                {/* Hesap Listesi */}
                <Card
                    elevation={0}
                    sx={{
                        borderRadius: 3,
                        border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                    }}
                >
                    <CardContent>
                        <Stack spacing={1.25}>
                            <Stack direction="row" justifyContent="space-between">
                                <Typography fontWeight={800}>Hesaplar</Typography>

                                <Button
                                    startIcon={<IconPlus size={16} />}
                                    variant="contained"
                                    onClick={() => setShowForm(true)}
                                >
                                    Yeni Hesap
                                </Button>
                            </Stack>

                            {accounts.map((acc) => (
                                <Stack
                                    key={acc.id}
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    sx={{
                                        p: 1.5,
                                        borderRadius: 2.5,
                                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                                    }}
                                >
                                    <Stack direction="row" spacing={1.25} alignItems="center">
                                        <Box
                                            sx={{
                                                width: 34,
                                                height: 34,
                                                borderRadius: 2,
                                                display: "grid",
                                                placeItems: "center",
                                                color: theme.palette.primary.main,
                                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            }}
                                        >
                                            {getIcon(acc.type)}
                                        </Box>

                                        <Box>
                                            <Typography fontWeight={700}>{acc.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {acc.type}
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <Typography fontWeight={800}>
                                        {acc.balance} {acc.currency}
                                    </Typography>
                                </Stack>
                            ))}
                        </Stack>
                    </CardContent>
                </Card>

                {/* Form */}
                {showForm && (
                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: 3,
                            border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                        }}
                    >
                        <CardContent>
                            <Stack spacing={2}>
                                <Typography fontWeight={800}>Yeni Hesap</Typography>

                                <TextField
                                    label="Hesap Adı"
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({ ...form, name: e.target.value })
                                    }
                                />

                                <TextField
                                    select
                                    label="Hesap Türü"
                                    value={form.type}
                                    onChange={(e) =>
                                        setForm({ ...form, type: e.target.value as CashAccountType })
                                    }
                                >
                                    <MenuItem value="cash">Nakit</MenuItem>
                                    <MenuItem value="bank">Banka</MenuItem>
                                    <MenuItem value="postfinance">PostFinance</MenuItem>
                                    <MenuItem value="twint">TWINT</MenuItem>
                                    <MenuItem value="other">Diğer</MenuItem>
                                </TextField>

                                <TextField
                                    label="Başlangıç Bakiyesi"
                                    value={form.balance}
                                    onChange={(e) =>
                                        setForm({ ...form, balance: e.target.value })
                                    }
                                />

                                <TextField
                                    label="Para Birimi"
                                    value={form.currency}
                                    onChange={(e) =>
                                        setForm({ ...form, currency: e.target.value })
                                    }
                                />

                                <Stack direction="row" spacing={1}>
                                    <Button
                                        variant="contained"
                                        onClick={() => {
                                            setMuhasebeMockSetupStatus({ hasCashAccount: true });
                                            router.push("/muhasebe/setup");
                                        }}
                                    >
                                        Kaydet
                                    </Button>
                                    <Button onClick={() => setShowForm(false)}>İptal</Button>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>
                )}
            </Stack>
        </Box>
    );
}