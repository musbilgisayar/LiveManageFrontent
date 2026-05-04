export type CategoryStatus = "active" | "inactive";

export interface ExpenseCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  isSystem: boolean;
  sortOrder: number;
  createdAt: string;
}