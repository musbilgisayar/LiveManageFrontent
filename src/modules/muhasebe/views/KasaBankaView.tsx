// src/modules/muhasebe/views/KasaBankaView.tsx
"use client";

import React, { useMemo } from "react";
import {
    Box,
    Button,
    Chip,
    InputAdornment,
    MenuItem,
    Paper,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography,
    ListItemIcon,
    ListItemText,
    Menu,
} from "@mui/material";
import {
    IconArrowDownLeft,
    IconArrowUpRight,

    IconBuildingBank,
    IconCash,
    IconDownload,
    IconExchange,
    IconPlus,
    IconRefresh,
    IconSearch,
    IconWallet,
} from "@tabler/icons-react";

import AccountingPageHeader from "@/modules/muhasebe/components/shared/AccountingPageHeader";
import AccountingPanel from "@/modules/muhasebe/components/shared/AccountingPanel";
import AccountingSummaryCard from "@/modules/muhasebe/components/shared/AccountingSummaryCard";
import AccountingSelectField from "@/modules/muhasebe/components/shared/AccountingSelectField";
import AccountingViewToggle from "@/modules/muhasebe/components/shared/AccountingViewToggle";
import { useCashBank } from "@/modules/muhasebe/hooks/useCashBank";
import type { CashBankTab } from "@/modules/muhasebe/types/CashBank.types";
import CashAccountCard from "@/modules/muhasebe/components/cash-bank/CashAccountCard";
import CashTransactionRow from "@/modules/muhasebe/components/cash-bank/CashTransactionRow";
import CashTransferCard from "@/modules/muhasebe/components/cash-bank/CashTransferCard";
import CashBankSummaryPanel from "@/modules/muhasebe/components/cash-bank/CashBankSummaryPanel";
import CashAccountTable from "@/modules/muhasebe/components/cash-bank/CashAccountTable";
import CashAccountCreateDrawer, {
    type CashAccountCreatePayload,
} from "@/modules/muhasebe/components/cash-bank/CashAccountCreateDrawer";
import type { CashBankAccountType } from "@/modules/muhasebe/types/CashBank.types";
import CashTransactionCreateDrawer, { type CashTransactionCreatePayload, } from "@/modules/muhasebe/components/cash-bank/CashTransactionCreateDrawer";
import CashTransferCreateDrawer, { type CashTransferCreatePayload, } from "@/modules/muhasebe/components/cash-bank/CashTransferCreateDrawer";


const ACCOUNT_TYPE_OPTIONS = [
    { value: "all", label: "Tüm Hesaplar" },
    { value: "cash", label: "Kasa" },
    { value: "bank", label: "Banka" },
];

const TRANSACTION_TYPE_OPTIONS = [
    { value: "all", label: "Tüm Hareketler" },
    { value: "income", label: "Gelir" },
    { value: "expense", label: "Gider" },
    { value: "transfer", label: "Transfer" },
];

function formatMoney(value: number, currency: string) {
    return new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
    }).format(value);
}

export default function KasaBankaView() {
    const {
        summary,
        accounts,
        transactions,
        transfers,
        activeTab,
        setActiveTab,
        viewMode,
        setViewMode,
        searchText,
        setSearchText,
        selectedAccountType,
        setSelectedAccountType,
        selectedTransactionType,
        setSelectedTransactionType,
        resetFilters,
        addAccount,
addTransaction,
addTransfer,
    } = useCashBank();



    const [actionAnchorEl, setActionAnchorEl] = React.useState<null | HTMLElement>(null);
    const actionMenuOpen = Boolean(actionAnchorEl);
    const [accountDrawerOpen, setAccountDrawerOpen] = React.useState(false);
    const [transactionDrawerOpen, setTransactionDrawerOpen] = React.useState(false);
    const [transactionDrawerType, setTransactionDrawerType] =
        React.useState<"income" | "expense">("income");
    const [accountDrawerType, setAccountDrawerType] =
        React.useState<CashBankAccountType>("cash");
    const [transferDrawerOpen, setTransferDrawerOpen] = React.useState(false);


    const openActionMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        setActionAnchorEl(event.currentTarget);
    };

    const closeActionMenu = () => {
        setActionAnchorEl(null);
    };

    const handleActionClick = (targetTab: CashBankTab) => {
        setActiveTab(targetTab);
        closeActionMenu();
    };

    const openAccountDrawer = (type: CashBankAccountType) => {
        setAccountDrawerType(type);
        setActiveTab("accounts");
        setAccountDrawerOpen(true);
        closeActionMenu();
    };

  const handleAccountCreated = (payload: CashAccountCreatePayload) => {
  addAccount(payload);
  setAccountDrawerOpen(false);
};

    const openTransactionDrawer = (type: "income" | "expense") => {
        setTransactionDrawerType(type);
        setActiveTab("transactions");
        setTransactionDrawerOpen(true);
        closeActionMenu();
    };

const handleTransactionCreated = (payload: CashTransactionCreatePayload) => {
  addTransaction(payload);
  setTransactionDrawerOpen(false);
};

    const openTransferDrawer = () => {
        setActiveTab("transfers");
        setTransferDrawerOpen(true);
        closeActionMenu();
    };

  const handleTransferCreated = (payload: CashTransferCreatePayload) => {
  addTransfer(payload);
  setTransferDrawerOpen(false);
};


    
    const summaryCards = useMemo(
        () => [
            {
                title: "Toplam Bakiye",
                value: formatMoney(summary.totalBalance, summary.currency),
                subtitle: "Kasa ve banka hesaplarının toplam bakiyesi",
                icon: <IconWallet size={22} />,
                color: "#2563eb",
            },
            {
                title: "Kasa Bakiyesi",
                value: formatMoney(summary.cashBalance, summary.currency),
                subtitle: "Nakit kasa hesaplarındaki toplam tutar",
                icon: <IconCash size={22} />,
                color: "#16a34a",
            },
            {
                title: "Banka Bakiyesi",
                value: formatMoney(summary.bankBalance, summary.currency),
                subtitle: "Banka hesaplarındaki toplam tutar",
                icon: <IconBuildingBank size={22} />,
                color: "#7c3aed",
            },
            {
                title: "Bu Ayki Hareket",
                value: summary.monthlyTransactionCount,
                subtitle: "Gelir, gider ve transfer hareketleri",
                icon: <IconExchange size={22} />,
                color: "#ea580c",
            },
        ],
        [summary]
    );

    return (
        <Box>
            <AccountingPageHeader
                title="Kasa ve Banka Yönetimi"
                description="Kasa, banka hesapları, para hareketleri ve transfer işlemlerini merkezi olarak yönetin."
                actions={
                    <Stack direction="row" spacing={1}>
                        <Button variant="outlined" startIcon={<IconDownload size={18} />}>
                            Dışa Aktar
                        </Button>

                        <Button
                            variant="contained"
                            startIcon={<IconPlus size={18} />}
                            onClick={openActionMenu}
                        >
                            Yeni İşlem
                        </Button>
                    </Stack>
                }
            />

            <Menu
                anchorEl={actionAnchorEl}
                open={actionMenuOpen}
                onClose={closeActionMenu}
                PaperProps={{
                    sx: {
                        mt: 1,
                        minWidth: 260,
                        borderRadius: 3,
                    },
                }}
            >
                <MenuItem onClick={() => openAccountDrawer("cash")}>
                    <ListItemIcon>
                        <IconCash size={18} />
                    </ListItemIcon>
                    <ListItemText
                        primary="Yeni Kasa Hesabı"
                        secondary="Nakit kasa hesabı oluştur"
                    />
                </MenuItem>

                <MenuItem onClick={() => openAccountDrawer("bank")}>
                    <ListItemIcon>
                        <IconBuildingBank size={18} />
                    </ListItemIcon>
                    <ListItemText
                        primary="Yeni Banka Hesabı"
                        secondary="Banka hesabı tanımla"
                    />
                </MenuItem>

                <MenuItem onClick={() => openTransactionDrawer("income")}>
                    <ListItemIcon>
                        <IconArrowDownLeft size={18} />
                    </ListItemIcon>
                    <ListItemText
                        primary="Yeni Para Girişi"
                        secondary="Gelir veya tahsilat hareketi"
                    />
                </MenuItem>

                <MenuItem onClick={() => openTransactionDrawer("expense")}>
                    <ListItemIcon>
                        <IconArrowUpRight size={18} />
                    </ListItemIcon>
                    <ListItemText
                        primary="Yeni Para Çıkışı"
                        secondary="Gider veya ödeme hareketi"
                    />
                </MenuItem>

                <MenuItem onClick={openTransferDrawer}>
                    <ListItemIcon>
                        <IconExchange size={18} />
                    </ListItemIcon>
                    <ListItemText
                        primary="Yeni Transfer"
                        secondary="Hesaplar arası para aktarımı"
                    />
                </MenuItem>
            </Menu>
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, minmax(0, 1fr))",
                        lg: "repeat(4, minmax(0, 1fr))",
                    },
                    gap: 2,
                    mb: 2,
                }}
            >
                {summaryCards.map((card) => (
                    <Box key={card.title} sx={{ display: "flex" }}>
                        <AccountingSummaryCard
                            title={card.title}
                            value={card.value}
                            subtitle={card.subtitle}
                            icon={card.icon}
                            color={card.color}
                        />
                    </Box>
                ))}
            </Box>

            <AccountingPanel>
                <Stack spacing={2}>
                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        alignItems={{ xs: "stretch", md: "center" }}
                        justifyContent="space-between"
                        spacing={2}
                    >
                        <Tabs
                            value={activeTab}
                            onChange={(_, value: CashBankTab) => setActiveTab(value)}
                            variant="scrollable"
                            scrollButtons="auto"
                        >
                            <Tab value="summary" label="Özet" />
                            <Tab value="accounts" label={`Hesaplar (${accounts.length})`} />
                            <Tab
                                value="transactions"
                                label={`Hareketler (${transactions.length})`}
                            />
                            <Tab
                                value="transfers"
                                label={`Transferler (${transfers.length})`}
                            />
                        </Tabs>

                        <AccountingViewToggle value={viewMode} onChange={setViewMode} />
                    </Stack>

                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: {
                                    xs: "1fr",
                                    md: "2fr 1.2fr 1.2fr auto",
                                },
                                gap: 2,
                                alignItems: "center",
                            }}
                        >
                            <TextField
                                fullWidth
                                size="small"
                                label="Ara"
                                value={searchText}
                                onChange={(event) => setSearchText(event.target.value)}
                                placeholder="Hesap adı, açıklama, işlem no..."
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <IconSearch size={18} />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <AccountingSelectField
                                label="Hesap Türü"
                                value={selectedAccountType}
                                onChange={(event) =>
                                    setSelectedAccountType(event.target.value as typeof selectedAccountType)
                                }
                            >
                                {ACCOUNT_TYPE_OPTIONS.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </AccountingSelectField>

                            <AccountingSelectField
                                label="Hareket Türü"
                                value={selectedTransactionType}
                                onChange={(event) =>
                                    setSelectedTransactionType(
                                        event.target.value as typeof selectedTransactionType
                                    )
                                }
                            >
                                {TRANSACTION_TYPE_OPTIONS.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </AccountingSelectField>

                            <Button
                                variant="outlined"
                                startIcon={<IconRefresh size={18} />}
                                onClick={resetFilters}
                                sx={{ whiteSpace: "nowrap", height: 40 }}
                            >
                                Temizle
                            </Button>
                        </Box>
                    </Paper>

                    <Box>
                        {activeTab === "summary" && (
                            <CashBankSummaryPanel
                                summary={summary}
                                accounts={accounts}
                                transactions={transactions}
                                transfers={transfers}
                            />
                        )}

                        {activeTab === "accounts" && (
                            <Stack spacing={2}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="h6">Hesaplar</Typography>
                                    <Chip size="small" label={`${accounts.length} kayıt`} />
                                </Stack>

                                {viewMode === "grid" ? (
                                    <Box
                                        sx={{
                                            display: "grid",
                                            gridTemplateColumns: {
                                                xs: "1fr",
                                                md: "repeat(2, 1fr)",
                                                xl: "repeat(3, 1fr)",
                                            },
                                            gap: 2,
                                        }}
                                    >
                                        {accounts.map((account) => (
                                            <CashAccountCard key={account.id} account={account} />
                                        ))}
                                    </Box>
                                ) : (
                                    <CashAccountTable accounts={accounts} />
                                )}
                            </Stack>
                        )}

                        {activeTab === "transactions" && (
                            <Stack spacing={2}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="h6">Para Hareketleri</Typography>
                                    <Chip size="small" label={`${transactions.length} kayıt`} />
                                </Stack>

                                <Stack spacing={1.25}>
                                    {transactions.map((transaction) => (
                                        <CashTransactionRow
                                            key={transaction.id}
                                            transaction={transaction}
                                        />
                                    ))}
                                </Stack>
                            </Stack>
                        )}


                        {activeTab === "transfers" && (
                            <Stack spacing={2}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="h6">Transferler</Typography>
                                    <Chip size="small" label={`${transfers.length} kayıt`} />
                                </Stack>

                                <Stack spacing={1.5}>
                                    {transfers.map((transfer) => (
                                        <CashTransferCard key={transfer.id} transfer={transfer} />
                                    ))}
                                </Stack>
                            </Stack>
                        )}
                    </Box>
                </Stack>
            </AccountingPanel>


            <CashTransactionCreateDrawer
                open={transactionDrawerOpen}
                defaultType={transactionDrawerType}
                accounts={accounts}
                onClose={() => setTransactionDrawerOpen(false)}
                onCreated={handleTransactionCreated}
            />


            <CashAccountCreateDrawer
                open={accountDrawerOpen}
                defaultType={accountDrawerType}
                onClose={() => setAccountDrawerOpen(false)}
                onCreated={handleAccountCreated}
            />

            <CashTransferCreateDrawer
                open={transferDrawerOpen}
                accounts={accounts}
                onClose={() => setTransferDrawerOpen(false)}
                onCreated={handleTransferCreated}
            />
        </Box>
    );
}