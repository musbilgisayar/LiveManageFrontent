export type UnitType = "apartment" | "shop" | "office";
export type UnitStatus = "occupied" | "vacant";

export type AuthorizedProperty = {
  id: string;
  name: string;
  type: "site" | "apartment";
  country: string;
  province: string;
  district: string;
  neighborhood: string;
  street: string;
  buildingNo: string;
  addressNote?: string;
};

export type PropertyUnit = {
  id: string;
  propertyId: string;

  blockName: string;
  floor: string;
  unitNumber: string;
  unitType: UnitType;

  ownerFullName: string;
  ownerEmail: string;
  ownerPhone: string;

  residentFullName: string;
  residentEmail: string;
  residentPhone: string;

  status: UnitStatus;
  duesStatus: string;
  rentStatus: string;
};

export type PropertyUnitForm = {
  blockName: string;
  floor: string;
  unitNumber: string;
  unitType: UnitType;

  ownerFullName: string;
  ownerEmail: string;
  ownerPhone: string;

  residentFullName: string;
  residentEmail: string;
  residentPhone: string;
};