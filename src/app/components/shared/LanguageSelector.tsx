// src/app/components/shared/LanguageSelector.tsx

"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { IconButton, Menu, MenuItem, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useCustomizer } from "@/app/context/customizerContext";
import { useCulture } from "@/app/context/CultureContext";

interface LanguageItem {
  cultureCode: string;
  name: string;
  isDefault: boolean;
  flagEmoji?: string;
}

const LOCALE_PREFIX_RE = /^\/[a-z]{2}(?:-[A-Za-z]{2})?(?=\/|$)/i;

const FALLBACK_LANGUAGES: LanguageItem[] = [
  { cultureCode: "tr-TR", name: "Türkçe", isDefault: true },
  { cultureCode: "en-US", name: "English", isDefault: false },
  { cultureCode: "de-DE", name: "Deutsch", isDefault: false },
  { cultureCode: "fr-FR", name: "Français", isDefault: false },
  { cultureCode: "it-IT", name: "Italiano", isDefault: false },
  { cultureCode: "ar-SA", name: "العربية", isDefault: false },
];

const toPrefix = (c: string) => (c || "tr").split("-")[0].toLowerCase();

const getFlagUrl = (cultureCode: string) => `/images/flag/${cultureCode}.svg`;

function setLocaleCookie(prefixOrCulture: string) {
  const secure =
    typeof window !== "undefined" && window.location?.protocol === "https:"
      ? "; Secure"
      : "";

  const prefix = toPrefix(prefixOrCulture);

  document.cookie = `lm.lang=${prefix}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
}

function getUrlPrefix(pathname: string): string {
  const firstSeg = (pathname.split("/")[1] || "").toLowerCase();
  return /^[a-z]{2}$/.test(firstSeg) ? firstSeg : "tr";
}

export default function LanguageSelector() {
  const router = useRouter();
  const pathname = usePathname();

  const { isLanguage, setIsLanguage } = useCustomizer();
  const { languages: cultureLanguages } = useCulture();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const urlPrefix = useMemo(() => getUrlPrefix(pathname), [pathname]);
  const languages = useMemo<LanguageItem[]>(() => {
    if (!cultureLanguages.length) {
      return FALLBACK_LANGUAGES;
    }

    return cultureLanguages.map((item) => ({
      cultureCode: item.cultureCode,
      name: item.name,
      isDefault: item.isDefault,
      flagEmoji: undefined,
    }));
  }, [cultureLanguages]);

  const currentLang = useMemo(() => {
    const found = languages.find((l) => l.cultureCode === isLanguage);
    if (found) return found;

    const byUrl = languages.find((l) => toPrefix(l.cultureCode) === urlPrefix);
    if (byUrl) return byUrl;

    const def = languages.find((l) => l.isDefault);
    if (def) return def;

    return languages[0] ?? null;
  }, [languages, isLanguage, urlPrefix]);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);

  const handleClose = () => setAnchorEl(null);

  useEffect(() => {
    setAnchorEl(null);
  }, [pathname]);

  const handleChangeLanguage = useCallback(
    (cultureCode: string) => {
      const newPrefix = toPrefix(cultureCode);
      const stripped = pathname.replace(LOCALE_PREFIX_RE, "") || "/";

      const search =
        typeof window !== "undefined" ? window.location.search : "";
      const hash = typeof window !== "undefined" ? window.location.hash : "";

      const nextPath = `/${newPrefix}${stripped}`.replace(/\/{2,}/g, "/");

      if (isLanguage !== cultureCode) {
        setIsLanguage(cultureCode);
      }

      setLocaleCookie(newPrefix);
      handleClose();
      router.push(`${nextPath}${search}${hash}`);
    },
    [pathname, router, setIsLanguage, isLanguage]
  );

  useEffect(() => {
    const matched = languages.find((l) => toPrefix(l.cultureCode) === urlPrefix);
    const fallback = languages.find((x) => x.isDefault) || languages[0];
    const selected = matched?.cultureCode || fallback?.cultureCode;

    if (!selected) return;

    setLocaleCookie(selected);

    if (isLanguage !== selected) {
      setIsLanguage(selected);
    }
  }, [isLanguage, languages, setIsLanguage, urlPrefix]);

  const shownCulture = currentLang?.cultureCode || "en-US";
  const shownName = currentLang?.name || "English";

  return (
    <>
      <IconButton aria-label="language" onClick={handleOpen}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Image
            src={getFlagUrl(shownCulture)}
            alt={shownName ?? shownCulture ?? "language"}
            width={24}
            height={24}
            style={{ borderRadius: "50%" }}
          />
          <Typography fontSize={14}>{shownName}</Typography>
        </Stack>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        keepMounted
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {languages.map((l) => (
          <MenuItem
            key={l.cultureCode}
            selected={l.cultureCode === isLanguage}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleChangeLanguage(l.cultureCode)}
          >
            <Stack direction="row" spacing={1} alignItems="center" width="100%">
              <Image
                src={getFlagUrl(l.cultureCode)}
                alt={l.name ?? l.cultureCode ?? "language"}
                width={20}
                height={20}
                style={{ borderRadius: "50%" }}
              />
              <Typography fontSize={14}>{l.name}</Typography>
              {l.cultureCode === isLanguage && (
                <Typography sx={{ marginLeft: "auto" }}>✅</Typography>
              )}
            </Stack>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
