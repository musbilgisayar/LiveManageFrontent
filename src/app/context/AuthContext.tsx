// src/app/context/AuthContext.tsx

"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useParams, useRouter } from "next/navigation";

export interface AuthUser {
  id?: string;
  sub?: string;
  userId?: string;
  appUserId?: string;
  applicationUserId?: string;

  email?: string;
  userName?: string;

  fullName?: string;
  firstName?: string;
  lastName?: string;

  roles?: string[];

  permissions?: string[];
  effectivePermissions?: string[];

  tenant?: string;
  cultureCode?: string;
  locale?: string;

  user?: {
    id?: string;
    userId?: string;
    appUserId?: string;
    applicationUserId?: string;
    email?: string;
    userName?: string;

    fullName?: string;
    firstName?: string;
    lastName?: string;

    cultureCode?: string;
    tenantId?: string;

    permissions?: string[];
    effectivePermissions?: string[];
  };
}

interface MeResponseDto {
  ok?: boolean;
  status?: number;
  data?: AuthUser | null;
  error?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  clearUser: () => void;
  refreshUser: () => Promise<void>;

  isAuthenticated: boolean;
  loading: boolean;
  permissionsReady: boolean;

  logout: () => void;

  effectivePermissions: string[];

  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  clearUser: () => {},
  refreshUser: async () => {},

  isAuthenticated: false,
  loading: true,
  permissionsReady: false,

  logout: () => {},

  effectivePermissions: [],

  hasPermission: () => false,
  hasAnyPermission: () => false,
  hasAllPermissions: () => false,
});

const AUTHENTICATED_SELF_PERMISSIONS = ["account.me.view.self"];

function resolveLocaleFromParams(
  params: Record<string, string | string[] | undefined> | null
): string {
  const raw = params?.locale;

  if (Array.isArray(raw)) {
    return (raw[0] ?? "tr").toLowerCase();
  }

  return (raw ?? "tr").toLowerCase();
}

function resolvePermissionCode(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (!value || typeof value !== "object") {
    return "";
  }

  const record = value as Record<string, unknown>;
  const code =
    record.code ??
    record.permissionCode ??
    record.name ??
    record.value ??
    record.permission;

  return typeof code === "string" ? code : "";
}

function normalizePermissions(value: unknown): string[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      const directCode = resolvePermissionCode(item).trim();

      if (directCode) {
        return [directCode];
      }

      return normalizePermissions(item);
    });
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const directCode = resolvePermissionCode(record).trim();

    if (directCode) {
      return [directCode];
    }

    return [
      ...normalizePermissions(record.effectivePermissions),
      ...normalizePermissions(record.permissions),
      ...normalizePermissions(record.permissionCodes),
      ...normalizePermissions(record.rolePermissions),
      ...normalizePermissions(record.userPermissions),
    ];
  }

  return [];
}

function uniquePermissions(permissions: string[]): string[] {
  const seen = new Set<string>();

  return permissions.filter((permission) => {
    const normalized = permission.toLowerCase();

    if (seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);
    return true;
  });
}

function normalizeAuthUser(json: any): AuthUser | null {
  const root = json?.data?.data ?? json?.data ?? null;

  if (!root) {
    return null;
  }

  const effectivePermissions = uniquePermissions([
    ...AUTHENTICATED_SELF_PERMISSIONS,
    ...normalizePermissions(root?.effectivePermissions),
    ...normalizePermissions(root?.permissions),
    ...normalizePermissions(root?.permissionCodes),
    ...normalizePermissions(root?.rolePermissions),
    ...normalizePermissions(root?.userPermissions),
    ...normalizePermissions(root?.user?.effectivePermissions),
    ...normalizePermissions(root?.user?.permissions),
    ...normalizePermissions(root?.user?.permissionCodes),
    ...normalizePermissions(root?.user?.rolePermissions),
    ...normalizePermissions(root?.user?.userPermissions),
  ]);

  return {
    ...root,
    ...(root.user ?? {}),

    user: root.user ?? root,

    permissions: effectivePermissions,
    effectivePermissions,
  };
}

async function fetchCurrentUser(): Promise<AuthUser | null> {
  const response = await fetch("/api/v1.0/account/users/me", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: {
      accept: "application/json",
    },
  });

  if (response.status === 401 || response.status === 403) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Kullanıcı bilgisi alınamadı. HTTP ${response.status}`);
  }

  const json = (await response.json().catch(() => null)) as
    | MeResponseDto
    | null;

  if (!json?.ok) {
    return null;
  }

  const normalizedUser = normalizeAuthUser(json);

  console.log("[AuthContext] Normalized user:", normalizedUser);
  console.log(
    "[AuthContext] Effective permissions:",
    normalizedUser?.effectivePermissions
  );

  return normalizedUser;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const params = useParams();

  const locale = resolveLocaleFromParams(
    params as Record<string, string | string[] | undefined>
  );

  const clearUser = useCallback(() => {
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    setLoading(true);

    try {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.warn("[AuthContext] Kullanıcı bilgisi yenilenemedi:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const run = async () => {
      setLoading(true);

      try {
        const currentUser = await fetchCurrentUser();

        if (!active) return;

        setUser(currentUser);
      } catch (error) {
        if (!active) return;

        console.warn("[AuthContext] İlk kullanıcı yüklemesi başarısız:", error);
        setUser(null);
      } finally {
        if (!active) return;

        setLoading(false);
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/v1.0/account/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.warn("[AuthContext] Logout isteği başarısız:", error);
    } finally {
      setUser(null);
      router.replace(`/${locale}/auth/login`);
    }
  }, [locale, router]);

  const effectivePermissions = useMemo(() => {
    return user?.effectivePermissions ?? user?.permissions ?? [];
  }, [user]);

const permissionsReady = useMemo(() => {
  return !loading;
}, [loading]);

  const hasPermission = useCallback(
    (permission: string) =>
      effectivePermissions.some(
        (item) => item.toLowerCase() === permission.toLowerCase()
      ),
    [effectivePermissions]
  );

  const hasAnyPermission = useCallback(
    (permissions: string[]) =>
      permissions.some((permission) =>
        effectivePermissions.some(
          (item) => item.toLowerCase() === permission.toLowerCase()
        )
      ),
    [effectivePermissions]
  );

  const hasAllPermissions = useCallback(
    (permissions: string[]) =>
      permissions.every((permission) =>
        effectivePermissions.some(
          (item) => item.toLowerCase() === permission.toLowerCase()
        )
      ),
    [effectivePermissions]
  );

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      setUser,
      clearUser,
      refreshUser,

      isAuthenticated: !!user,
      loading,
      permissionsReady,

      logout,

      effectivePermissions,

      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
    }),
    [
      user,
      clearUser,
      refreshUser,
      loading,
      permissionsReady,
      logout,
      effectivePermissions,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
