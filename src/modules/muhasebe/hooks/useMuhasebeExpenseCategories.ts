"use client";

import { useCallback, useState } from "react";
import type { ExpenseCategory } from "../types/MuhasebeExpenseCategory.types";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// 🔴 GLOBAL MOCK STORE (şimdilik backend yok)
let CATEGORY_STORE: ExpenseCategory[] = [
  {
    id: "1",
    name: "Temizlik",
    code: "CLEANING",
    isActive: true,
    isSystem: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Elektrik",
    code: "ELECTRICITY",
    isActive: true,
    isSystem: true,
    sortOrder: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Asansör Bakımı",
    code: "ELEVATOR",
    isActive: true,
    isSystem: true,
    sortOrder: 3,
    createdAt: new Date().toISOString(),
  },
];

export function useMuhasebeExpenseCategories() {
  const [categories, setCategories] = useState<ExpenseCategory[]>(CATEGORY_STORE);

  const refresh = useCallback(() => {
    setCategories([...CATEGORY_STORE]);
  }, []);

  const create = useCallback((payload: Omit<ExpenseCategory, "id" | "createdAt">) => {
    const newItem: ExpenseCategory = {
      ...payload,
      id: createId(),
      createdAt: new Date().toISOString(),
    };

    CATEGORY_STORE = [newItem, ...CATEGORY_STORE];
    refresh();
  }, [refresh]);

  const update = useCallback((id: string, payload: Partial<ExpenseCategory>) => {
    CATEGORY_STORE = CATEGORY_STORE.map((x) =>
      x.id === id ? { ...x, ...payload } : x,
    );
    refresh();
  }, [refresh]);

  const toggleActive = useCallback((id: string) => {
    CATEGORY_STORE = CATEGORY_STORE.map((x) =>
      x.id === id ? { ...x, isActive: !x.isActive } : x,
    );
    refresh();
  }, [refresh]);

  return {
    categories,
    create,
    update,
    toggleActive,
    refresh,
  };
}