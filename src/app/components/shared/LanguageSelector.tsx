"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { IconButton, Menu, MenuItem, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useCustomizer } from "@/app/context/customizerContext";
import { API_BASE as CONFIG_API_BASE } from "@/lib/config";
import { normalizeCultures } from "@/lib/i18n/normalizeCultures";

interface LanguageItem {
  cultureCode: string;
  name: string;
  isDefault: boolean;
  flagEmoji?: string;
}

const API_VERSION = "1.0";
const API_BASE = CONFIG_API_BASE || "";

const LOCALE_PREFIX_RE = /^\/[a-z]{2}(?:-[A-Za-z]{2})?(?=\/|$)/i;

const toPrefix = (c: string) => (c || "tr").split("-")[0].toLowerCase();

const toCulture = (prefix: string) => {
  const p = (prefix || "tr").toLowerCase();
  if (p === "tr") return "tr-TR";
  if (p === "en") return "en-US";
  if (p === "de") return "de-DE";
  if (p === "fr") return "fr-FR";
  if (p === "it") return "it-IT";
  if (p === "ar") return "ar-SA";
  return `${p}-${p.toUpperCase()}`;
};

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

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [languages, setLanguages] = useState<LanguageItem[]>([]);

  const open = Boolean(anchorEl);
  const urlPrefix = useMemo(() => getUrlPrefix(pathname), [pathname]);

  const currentLang = useMemo(() => {
    const found = languages.find((l) => l.cultureCode === isLanguage);
    if (found) return found;

    const byUrl = languages.find((l) => toPrefix(l.cultureCode) === urlPrefix);
    if (byUrl) return byUrl;

    const def = languages.find((l) => l.isDefault);
    if (def) return def;

    return languages[0] ?? null;
  }, [languages, isLanguage, urlPrefix]);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  useEffect(() => {
    setAnchorEl(null);
  }, [pathname]);

  const handleChangeLanguage = useCallback(
    (cultureCode: string) => {
      const newPrefix = toPrefix(cultureCode);
      const stripped = pathname.replace(LOCALE_PREFIX_RE, "") || "/";

      const search = typeof window !== "undefined" ? window.location.search : "";
      const hash = typeof window !== "undefined" ? window.location.hash : "";

      const nextPath = `/${newPrefix}${stripped}`.replace(/\/{2,}/g, "/");

      setLocaleCookie(newPrefix);
      setIsLanguage(cultureCode);

      handleClose();
      router.push(`${nextPath}${search}${hash}`);
    },
    [pathname, router, setIsLanguage]
  );

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        const url = `${API_BASE}/api/v${API_VERSION}/culture/list`;
        const acceptCulture = toCulture(urlPrefix);

        const res = await fetch(url, {
          headers: {
            accept: "application/json",
            "accept-language": acceptCulture,
          },
          cache: "no-store",
          signal: ac.signal,
        });

        if (!res.ok) {
          console.warn("[LanguageSelector] culture/list HTTP not ok:", res.status);
          return;
        }

        const json = await res.json().catch(() => null);
        const normalized = normalizeCultures(json);

        if (!normalized.length) {
          console.warn("[LanguageSelector] culture/list empty:", json);
          return;
        }

        setLanguages(
          normalized.map((x) => ({
            cultureCode: x.cultureCode,
            name: x.name,
            isDefault: x.isDefault,
          }))
        );

        const matched = normalized.find((l) => toPrefix(l.cultureCode) === urlPrefix);
        const fallback = normalized.find((x) => x.isDefault) || normalized[0];
        const selected = matched?.cultureCode || fallback.cultureCode;

        setLocaleCookie(selected);
        setIsLanguage(selected);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        console.error("[LanguageSelector] fetch failed:", err);
      }
    })();

    return () => ac.abort();
  }, [urlPrefix, setIsLanguage]);

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