/*"use client";
import React, { useEffect, useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import AuthLogin from "./AuthLogin";
import AuthRegister from "./AuthRegister";

type TabKey = "login" | "register";

const TAB_KEYS: TabKey[] = ["login", "register"];

interface Props {
  initialTab?: string;
}

const AuthTabs: React.FC<Props> = ({ initialTab }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // 🔑 Query param'dan tab çek
  const queryTab = (searchParams.get("tab") || initialTab || "login") as TabKey;

  // 🔒 Geçersiz değerler için fallback
  const [tab, setTab] = useState<TabKey>(
    TAB_KEYS.includes(queryTab) ? queryTab : "login"
  );

  // query değişirse state güncelle
  useEffect(() => {
    const t = (searchParams.get("tab") || initialTab || "login") as TabKey;
    if (TAB_KEYS.includes(t) && t !== tab) {
      setTab(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Tab değişince URL güncelle
  const handleChange = (_: React.SyntheticEvent, newValue: TabKey) => {
    setTab(newValue);

    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("tab", newValue);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Box>
      <Tabs
        value={tab}
        onChange={handleChange}
        variant="fullWidth"
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab label="Giriş Yap" value="login" />
        <Tab label="Kayıt Ol" value="register" />
      </Tabs>

      <Box sx={{ mt: 3 }}>
        {tab === "login" && <AuthLogin />}
        {tab === "register" && <AuthRegister />}
      </Box>
    </Box>
  );
};

export default AuthTabs;
*/
