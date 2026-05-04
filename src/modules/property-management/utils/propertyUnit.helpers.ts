import type {
  AuthorizedProperty,
  PropertyUnit,
  PropertyUnitForm,
  UnitType,
} from "../types/PropertyUnit.types";

export const emptyPropertyUnitForm: PropertyUnitForm = {
  blockName: "",
  floor: "",
  unitNumber: "",
  unitType: "apartment",

  ownerFullName: "",
  ownerEmail: "",
  ownerPhone: "",

  residentFullName: "",
  residentEmail: "",
  residentPhone: "",
};

export function getUnitTypeLabel(type: UnitType) {
  if (type === "apartment") return "Daire";
  if (type === "shop") return "Dükkan";
  return "Ofis";
}

export function getPropertyTypeLabel(type: AuthorizedProperty["type"]) {
  return type === "site" ? "Site" : "Apartman";
}

export function buildUnitTitle(
  unit: Pick<PropertyUnit, "blockName" | "floor" | "unitNumber">,
) {
  const block = unit.blockName?.trim() || "Blok yok";
  const floor = unit.floor?.trim() ? `${unit.floor}. Kat` : "Kat yok";
  const no = unit.unitNumber?.trim() || "No yok";

  return `${block} / ${floor} / ${no}`;
}

export function isPropertyUnitFormValid(form: PropertyUnitForm) {
  return Boolean(form.blockName.trim() && form.unitNumber.trim() && form.unitType);
}