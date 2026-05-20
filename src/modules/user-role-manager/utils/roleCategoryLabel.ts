import {
  ROLE_CATEGORY_LABELS,
  type RoleCategoryType,
} from "../types/AppRole.types";

export function getRoleCategoryLabel(
  category: number,
): string {
  return (
    ROLE_CATEGORY_LABELS[
      category as RoleCategoryType
    ] ?? "roles:category.unknown"
  );
}