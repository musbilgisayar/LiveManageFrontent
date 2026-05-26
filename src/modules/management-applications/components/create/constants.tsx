import React from "react";
import { IconBuildingCommunity, IconHome } from "@tabler/icons-react";

import type {
  ManagementStructureType,
  RepresentationType,
  RequiredDocumentKind,
} from "../../types/managementApplication.types";

export const premiumFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2.5,
    bgcolor: "rgba(255, 255, 255, 0.98)",
    transition: "background-color 160ms ease, box-shadow 160ms ease",

    "& fieldset": {
      borderColor: "rgba(148, 163, 184, 0.36)",
    },

    "&:hover": {
      bgcolor: "background.paper",
    },

    "&:hover fieldset": {
      borderColor: "rgba(37, 99, 235, 0.32)",
    },

    "&.Mui-focused": {
      bgcolor: "background.paper",
      boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.08)",
    },

    "&.Mui-focused fieldset": {
      borderWidth: 1,
    },

    "&.Mui-error": {
      boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.09)",
    },

    "&.Mui-error fieldset": {
      borderColor: "rgba(239, 68, 68, 0.72)",
    },
  },

  "& .MuiInputBase-input": {
    fontSize: 14,
  },

  "& .MuiInputLabel-root": {
    fontWeight: 700,
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
    fontSize: 12.5,
    fontWeight: 500,
    color: "text.secondary",
    lineHeight: 1.45,
  },

  "& .MuiFormHelperText-root.Mui-error": {
    color: "error.main",
    fontWeight: 700,
  },
} as const;

export const structureOptions: Array<{
  value: ManagementStructureType;
  labelKey: string;
  descriptionKey: string;
  fallbackLabel: string;
  fallbackDescription: string;
  icon: React.ReactNode;
}> = [
  {
    value: "site",
    labelKey: "management-applications:create.options.structure.site.label",
    descriptionKey:
      "management-applications:create.options.structure.site.description",
    fallbackLabel: "Site Yönetimi",
    fallbackDescription:
      "Birden fazla blok veya toplu yaşam alanı için başvuru",
    icon: <IconBuildingCommunity size={28} stroke={1.9} />,
  },
  {
    value: "apartment",
    labelKey:
      "management-applications:create.options.structure.apartment.label",
    descriptionKey:
      "management-applications:create.options.structure.apartment.description",
    fallbackLabel: "Apartman Yönetimi",
    fallbackDescription:
      "Tek yapı veya sınırlı bağımsız bölüm için başvuru",
    icon: <IconHome size={28} stroke={1.9} />,
  },
];

export const representationOptions: Array<{
  value: RepresentationType;
  labelKey: string;
  descriptionKey: string;
  fallbackLabel: string;
  fallbackDescription: string;
}> = [
  {
    value: "owner",
    labelKey:
      "management-applications:create.options.representation.owner.label",
    descriptionKey:
      "management-applications:create.options.representation.owner.description",
    fallbackLabel: "Malik / Kat Maliki",
    fallbackDescription: "Doğrudan malik sıfatıyla başvuru",
  },
  {
    value: "proxy",
    labelKey:
      "management-applications:create.options.representation.proxy.label",
    descriptionKey:
      "management-applications:create.options.representation.proxy.description",
    fallbackLabel: "Vekil",
    fallbackDescription: "Vekaletname ile temsil",
  },
  {
    value: "board_member",
    labelKey:
      "management-applications:create.options.representation.boardMember.label",
    descriptionKey:
      "management-applications:create.options.representation.boardMember.description",
    fallbackLabel: "Yönetim Kurulu / Temsilci",
    fallbackDescription: "Karar veya görevlendirme ile temsil",
  },
  {
    value: "professional_manager",
    labelKey:
      "management-applications:create.options.representation.professionalManager.label",
    descriptionKey:
      "management-applications:create.options.representation.professionalManager.description",
    fallbackLabel: "Profesyonel Yönetici",
    fallbackDescription: "Sözleşme veya hizmet anlaşması ile temsil",
  },
];

export const documentCatalog: Record<
  RequiredDocumentKind,
  {
    titleKey: string;
    descriptionKey: string;
    fallbackTitle: string;
    fallbackDescription: string;
  }
> = {
  signed_contract: {
    titleKey: "management-applications:create.documents.signedContract.title",
    descriptionKey:
      "management-applications:create.documents.signedContract.description",
    fallbackTitle: "İmzalı Hizmet Sözleşmesi",
    fallbackDescription:
      "Sistemden indirilen sözleşmenin imzalanmış hali.",
  },
  authority_decision: {
    titleKey: "management-applications:create.documents.authorityDecision.title",
    descriptionKey:
      "management-applications:create.documents.authorityDecision.description",
    fallbackTitle: "Yönetim Kararı / Karar Defteri",
    fallbackDescription:
      "Yönetim veya kurul kararı ile verilen yetki belgesi.",
  },
  power_of_attorney: {
    titleKey: "management-applications:create.documents.powerOfAttorney.title",
    descriptionKey:
      "management-applications:create.documents.powerOfAttorney.description",
    fallbackTitle: "Vekaletname",
    fallbackDescription: "Temsil yetkisini gösteren resmi vekalet belgesi.",
  },
  assignment_letter: {
    titleKey: "management-applications:create.documents.assignmentLetter.title",
    descriptionKey:
      "management-applications:create.documents.assignmentLetter.description",
    fallbackTitle: "Görevlendirme Yazısı",
    fallbackDescription:
      "Kurul, yönetim veya malikçe verilmiş görevlendirme belgesi.",
  },
  professional_service_agreement: {
    titleKey:
      "management-applications:create.documents.professionalServiceAgreement.title",
    descriptionKey:
      "management-applications:create.documents.professionalServiceAgreement.description",
    fallbackTitle: "Profesyonel Yönetim Sözleşmesi",
    fallbackDescription:
      "Profesyonel yönetici ile yapı arasında yapılan hizmet sözleşmesi.",
  },
  other: {
    titleKey: "management-applications:create.documents.other.title",
    descriptionKey:
      "management-applications:create.documents.other.description",
    fallbackTitle: "Diğer Belge",
    fallbackDescription: "Başvuruyu destekleyen ek belge.",
  },
};

export function getStructureFallbackLabel(value: ManagementStructureType) {
  return (
    structureOptions.find((item) => item.value === value)?.fallbackLabel ?? "-"
  );
}

export function getRepresentationFallbackLabel(value: RepresentationType) {
  return (
    representationOptions.find((item) => item.value === value)?.fallbackLabel ??
    "-"
  );
}

export function getDocumentFallbackTitle(kind: RequiredDocumentKind) {
  return documentCatalog[kind]?.fallbackTitle ?? "Belge";
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}