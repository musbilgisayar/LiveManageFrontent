import React from "react";
import {
  IconBuildingCommunity,
  IconHome,
} from "@tabler/icons-react";
import type {
  ManagementStructureType,
  RepresentationType,
  RequiredDocumentKind,
} from "../../types/managementApplication.types";

export const premiumFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 3,
    bgcolor: "background.paper",
  },
  "& .MuiInputBase-input": {
    fontSize: 14,
  },
  "& .MuiSelect-select": {
    fontSize: 14,
    display: "flex",
    alignItems: "center",
  },
  "& .MuiFormHelperText-root": {
    ml: 0,
    mt: 0.6,
    minHeight: 20,
    fontWeight: 600,
  },
} as const;

export const structureOptions: Array<{
  value: ManagementStructureType;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    value: "site",
    label: "Site Yönetimi",
    description: "Birden fazla blok veya toplu yaşam alanı için başvuru",
    icon: <IconBuildingCommunity size={28} stroke={1.9} />,
  },
  {
    value: "apartment",
    label: "Apartman Yönetimi",
    description: "Tek yapı veya sınırlı bağımsız bölüm için başvuru",
    icon: <IconHome size={28} stroke={1.9} />,
  },
];

export const representationOptions: Array<{
  value: RepresentationType;
  label: string;
  description: string;
}> = [
  {
    value: "owner",
    label: "Malik / Kat Maliki",
    description: "Doğrudan malik sıfatıyla başvuru",
  },
  {
    value: "proxy",
    label: "Vekil",
    description: "Vekaletname ile temsil",
  },
  {
    value: "board_member",
    label: "Yönetim Kurulu / Temsilci",
    description: "Karar veya görevlendirme ile temsil",
  },
  {
    value: "professional_manager",
    label: "Profesyonel Yönetici",
    description: "Sözleşme veya hizmet anlaşması ile temsil",
  },
];

export const documentCatalog: Record<
  RequiredDocumentKind,
  { title: string; description: string }
> = {
  signed_contract: {
    title: "İmzalı Hizmet Sözleşmesi",
    description: "Sistemden indirilen sözleşmenin imzalanmış hali.",
  },
  authority_decision: {
    title: "Yönetim Kararı / Karar Defteri",
    description: "Yönetim veya kurul kararı ile verilen yetki belgesi.",
  },
  power_of_attorney: {
    title: "Vekaletname",
    description: "Temsil yetkisini gösteren resmi vekalet belgesi.",
  },
  assignment_letter: {
    title: "Görevlendirme Yazısı",
    description: "Kurul, yönetim veya malikçe verilmiş görevlendirme belgesi.",
  },
  professional_service_agreement: {
    title: "Profesyonel Yönetim Sözleşmesi",
    description: "Profesyonel yönetici ile yapı arasında yapılan hizmet sözleşmesi.",
  },
  other: {
    title: "Diğer Belge",
    description: "Başvuruyu destekleyen ek belge.",
  },
};

export function getStructureLabel(value: ManagementStructureType) {
  return value === "site" ? "Site Yönetimi" : "Apartman Yönetimi";
}

export function getRepresentationLabel(value: RepresentationType) {
  return representationOptions.find((item) => item.value === value)?.label ?? "-";
}

export function getDocumentTitle(kind: RequiredDocumentKind) {
  return documentCatalog[kind]?.title ?? "Belge";
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}