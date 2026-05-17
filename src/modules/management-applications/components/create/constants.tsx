import React from "react";
import { IconBuildingCommunity, IconHome } from "@tabler/icons-react";
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
  labelKey: string;
  descriptionKey: string;
  fallbackLabel: string;
  fallbackDescription: string;
  icon: React.ReactNode;
}> = [
  {
    value: "site",
    labelKey: "property:managementApplication.create.options.structure.site.label",
    descriptionKey:
      "property:managementApplication.create.options.structure.site.description",
    fallbackLabel: "Site Yönetimi",
    fallbackDescription: "Birden fazla blok veya toplu yaşam alanı için başvuru",
    icon: <IconBuildingCommunity size={28} stroke={1.9} />,
  },
  {
    value: "apartment",
    labelKey:
      "property:managementApplication.create.options.structure.apartment.label",
    descriptionKey:
      "property:managementApplication.create.options.structure.apartment.description",
    fallbackLabel: "Apartman Yönetimi",
    fallbackDescription: "Tek yapı veya sınırlı bağımsız bölüm için başvuru",
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
      "property:managementApplication.create.options.representation.owner.label",
    descriptionKey:
      "property:managementApplication.create.options.representation.owner.description",
    fallbackLabel: "Malik / Kat Maliki",
    fallbackDescription: "Doğrudan malik sıfatıyla başvuru",
  },
  {
    value: "proxy",
    labelKey:
      "property:managementApplication.create.options.representation.proxy.label",
    descriptionKey:
      "property:managementApplication.create.options.representation.proxy.description",
    fallbackLabel: "Vekil",
    fallbackDescription: "Vekaletname ile temsil",
  },
  {
    value: "board_member",
    labelKey:
      "property:managementApplication.create.options.representation.boardMember.label",
    descriptionKey:
      "property:managementApplication.create.options.representation.boardMember.description",
    fallbackLabel: "Yönetim Kurulu / Temsilci",
    fallbackDescription: "Karar veya görevlendirme ile temsil",
  },
  {
    value: "professional_manager",
    labelKey:
      "property:managementApplication.create.options.representation.professionalManager.label",
    descriptionKey:
      "property:managementApplication.create.options.representation.professionalManager.description",
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
    titleKey:
      "property:managementApplication.create.documents.signedContract.title",
    descriptionKey:
      "property:managementApplication.create.documents.signedContract.description",
    fallbackTitle: "İmzalı Hizmet Sözleşmesi",
    fallbackDescription: "Sistemden indirilen sözleşmenin imzalanmış hali.",
  },
  authority_decision: {
    titleKey:
      "property:managementApplication.create.documents.authorityDecision.title",
    descriptionKey:
      "property:managementApplication.create.documents.authorityDecision.description",
    fallbackTitle: "Yönetim Kararı / Karar Defteri",
    fallbackDescription: "Yönetim veya kurul kararı ile verilen yetki belgesi.",
  },
  power_of_attorney: {
    titleKey:
      "property:managementApplication.create.documents.powerOfAttorney.title",
    descriptionKey:
      "property:managementApplication.create.documents.powerOfAttorney.description",
    fallbackTitle: "Vekaletname",
    fallbackDescription: "Temsil yetkisini gösteren resmi vekalet belgesi.",
  },
  assignment_letter: {
    titleKey:
      "property:managementApplication.create.documents.assignmentLetter.title",
    descriptionKey:
      "property:managementApplication.create.documents.assignmentLetter.description",
    fallbackTitle: "Görevlendirme Yazısı",
    fallbackDescription:
      "Kurul, yönetim veya malikçe verilmiş görevlendirme belgesi.",
  },
  professional_service_agreement: {
    titleKey:
      "property:managementApplication.create.documents.professionalServiceAgreement.title",
    descriptionKey:
      "property:managementApplication.create.documents.professionalServiceAgreement.description",
    fallbackTitle: "Profesyonel Yönetim Sözleşmesi",
    fallbackDescription:
      "Profesyonel yönetici ile yapı arasında yapılan hizmet sözleşmesi.",
  },
  other: {
    titleKey: "property:managementApplication.create.documents.other.title",
    descriptionKey:
      "property:managementApplication.create.documents.other.description",
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