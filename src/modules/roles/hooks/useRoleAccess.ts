"use client";

import { useContext } from "react";
import { UserDataContext } from "@/app/context/UserDataContext";

/**
 * 🔒 useRoleAccess
 * Kullanıcının rol/izin bilgilerine göre erişim kontrolü sağlar.
 * UserDataContext içindeki ilk kullanıcı nesnesine dayanır.
 */
export function useRoleAccess() {
  const userData = useContext(UserDataContext);

  // Eğer context boşsa varsayılan değer döner
  const user = Array.isArray(userData?.users) ? userData.users[0] ?? {} : {};
  const permissions: string[] = (user as any)?.permissions ?? [];

  const has = (perm: string): boolean => permissions.includes(perm);
  const any = (...perms: string[]): boolean => perms.some((p) => permissions.includes(p));
  const all = (...perms: string[]): boolean => perms.every((p) => permissions.includes(p));

  return { has, any, all, user };
}
