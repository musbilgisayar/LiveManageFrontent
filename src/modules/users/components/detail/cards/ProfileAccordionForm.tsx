"use client";

import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Grid,
  Stack,
  Button,
  TextField,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import {
  IconChevronDown,
  IconWorld,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { useParams } from "next/navigation";
import { useI18nNs } from "@/app/context/i18nContext";
import AddressCard from "@/modules/users/components/detail/cards/AddressManagerCard"; // ✅ yeni bileşen
import ContactManagerCard from "@/modules/users/components/detail/cards/ContactManagerCard"; // ✅ yeni bileşen
import SocialMediaManagerCard from "@/modules/users/components/detail/cards/SocialMediaManagerCard"; // ✅ yeni bileşen
// 🧩 Basit fetch helper
async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

interface Address {
  id?: string;
  country?: string;
  city?: string;
  street?: string;
  postalCode?: string;
}
interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
}
interface SocialMedia {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
}

export default function ProfileAccordionForm() {
  const { locale } = useParams<{ locale: string }>();
  const lang = locale || "tr";
  const { t } = useI18nNs(["account"]);

  const [expanded, setExpanded] = useState<string | false>("panel1");
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState<Partial<Address>>({});
  const [contact, setContact] = useState<Partial<ContactInfo>>({});
  const [social, setSocial] = useState<Partial<SocialMedia>>({});

  const handleExpand =
    (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) =>
      setExpanded(isExpanded ? panel : false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [addr, cont, soc] = await Promise.all([
          fetchJson(`/api/v1.0/userprofile/addresses/default`),
          fetchJson(`/api/v1.0/userprofile/contact`),
          fetchJson(`/api/v1.0/userprofile/social-media`),
        ]);
        setAddress(addr || {});
        setContact(cont || {});
        setSocial(soc || {});
      } catch (err) {
        console.error("Profil verileri yüklenemedi:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [lang]);

  const handleSave = async (section: "address" | "contact" | "social") => {
    setLoading(true);
    try {
      const map = {
        address: [address, `/api/v1.0/userprofile/addresses`],
        contact: [contact, `/api/v1.0/userprofile/contact`],
        social : [social,  `/api/v1.0/userprofile/social-media`],
      } as const;

      const [body, endpoint] = map[section];

      await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      console.info(`${section} updated successfully`);
    } catch (err) {
      console.error("Kaydetme hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <Stack alignItems="center" py={5}>
        <CircularProgress />
      </Stack>
    );

  return (
    <div>

      {/* 🏠 Adres Bilgileri */}
      <Accordion
        elevation={9}
        expanded={expanded === "panel1"}
        onChange={handleExpand("panel1")}
      >
        <AccordionSummary expandIcon={<IconChevronDown size={18} />}>
          <Typography variant="h6">
            {t("account:address.title", { defaultValue: "Adres Bilgileri" })}
          </Typography>
        </AccordionSummary>

        <AccordionDetails sx={{ p: 0 }}>
          {/* 👇 AddressManagerCard bileşenini burada çağırıyoruz */}
          <AddressCard />
        </AccordionDetails>
      </Accordion>

      {/* ☎️ İletişim Bilgileri */}
      <Accordion
        elevation={9}
        expanded={expanded === "panel2"}
        onChange={handleExpand("panel2")}
      >
        <AccordionSummary expandIcon={<IconChevronDown size={18} />}>
          <Typography variant="h6">
            {t("account:contact.title", { defaultValue: "İletişim Bilgileri" })}
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <ContactManagerCard />
        </AccordionDetails>
      </Accordion>


      {/* 🌍 Sosyal Medya */}
      {/* 🌍 Sosyal Medya Hesapları */}
      <Accordion
        elevation={9}
        expanded={expanded === "panel3"}
        onChange={handleExpand("panel3")}
      >
        <AccordionSummary expandIcon={<IconChevronDown size={18} />}>
          <Typography variant="h6">
            {t("account:social.title", {
              defaultValue: "Sosyal Medya Hesapları",
            })}
          </Typography>
        </AccordionSummary>

        <AccordionDetails sx={{ p: 0 }}>
          {/* 👇 Burada doğrudan bileşeni çağırıyoruz */}
          <SocialMediaManagerCard />
        </AccordionDetails>
      </Accordion>

    </div>
  );
}
