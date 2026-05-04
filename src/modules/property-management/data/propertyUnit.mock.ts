import type {
  AuthorizedProperty,
  PropertyUnit,
} from "../types/PropertyUnit.types";

export const authorizedPropertiesMock: AuthorizedProperty[] = [
  {
    id: "property-1",
    name: "A Sitesi",
    type: "site",
    country: "Türkiye",
    province: "Ankara",
    district: "Haymana",
    neighborhood: "Haymana",
    street: "",
    buildingNo: "",
  },
  {
    id: "property-2",
    name: "B Sitesi",
    type: "site",
    country: "Türkiye",
    province: "İstanbul",
    district: "Kadıköy",
    neighborhood: "Kadıköy",
    street: "",
    buildingNo: "",
  },
  {
    id: "property-3",
    name: "C Sitesi",
    type: "site",
    country: "Türkiye",
    province: "Ankara",
    district: "Yenimahalle",
    neighborhood: "Yenimahalle",
    street: "",
    buildingNo: "",
  },
];
export const propertyUnitsMock: PropertyUnit[] = [
  {
    id: "12",
    propertyId: "property-1",
    blockName: "A",
    floor: "3",
    unitNumber: "12",
    unitType: "apartment",
    status: "occupied",
    ownerFullName: "Mehmet Kaya",
    ownerEmail: "mehmet@example.com",
    ownerPhone: "+41 79 000 00 00",
    residentFullName: "Ahmet Yılmaz",
    residentEmail: "ahmet@example.com",
    residentPhone: "+41 76 000 00 00",
    rentStatus: "Düzenli",
    duesStatus: "Ödendi",
  },
];