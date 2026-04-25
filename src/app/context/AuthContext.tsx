// src/app/context/AuthContext.tsx
"use client";

/**
 * AuthContext
 * ------------------------------------------------------------------
 * WEB tarafında auth'ın gerçek kaynağı localStorage değildir.
 *
 * Bu projede web oturumu şu omurga ile çalışır:
 * - HttpOnly cookie
 * - BFF refresh akışı
 * - session/device işaretleri
 * - kullanıcı bilgisi için BFF /me endpoint'i
 *
 * Bu nedenle bu context:
 * - localStorage'dan access token okumaz
 * - JWT decode ederek auth kaynağı olmaya çalışmaz
 * - kullanıcı bilgisini BFF üzerinden alır
 * - sadece UI katmanında auth state'i taşır
 *
 * Kullanılan ana endpoint:
 * GET /api/v1.0/account/users/me
 *
 * Bu endpoint BFF tarafında backend /api/v1.0/account/me çağrısını yapar
 * ve web cookie tabanlı auth akışına göre kullanıcı bilgisini döner.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";

/**
 * UI tarafında taşınacak kullanıcı özeti.
 * Gerektikçe alanlar genişletilebilir.
 */
export interface AuthUser {
  id?: string;
  sub?: string;
  email?: string;
  userName?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
  tenant?: string;
  cultureCode?: string;
  locale?: string;
}

/**
 * BFF /me endpoint'inden beklenen temel response zarfı.
 */
interface MeResponseDto {
  ok?: boolean;
  status?: number;
  data?: AuthUser | null;
  error?: string | null;
}

/**
 * Context contract'ı
 *
 * loading:
 * - İlk kullanıcı okuma isteği sürerken true olur.
 *
 * isAuthenticated:
 * - user doluysa true kabul edilir.
 * - Bu UI seviyesinde bir bilgidir.
 * - Gerçek auth kaynağı yine cookie + BFF tarafıdır.
 *
 * refreshUser:
 * - Kullanıcı bilgisini BFF /me endpoint'inden tekrar yükler.
 *
 * clearUser:
 * - Sadece UI state'ini temizler.
 *
 * logout:
 * - Şimdilik güvenli ilk adım olarak UI state temizlenir
 *   ve locale uyumlu login ekranına yönlendirilir.
 * - Gerçek cookie temizliği ileride logout BFF route'u ile bağlanmalıdır.
 */
interface AuthContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  clearUser: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  clearUser: () => {},
  refreshUser: async () => {},
  isAuthenticated: false,
  loading: true,
  logout: () => {},
});

/**
 * URL locale segmentini güvenli şekilde çözer.
 * Örnek:
 * - /tr/...
 * - /de/...
 */
function resolveLocaleFromParams(
  params: Record<string, string | string[] | undefined> | null
): string {
  const raw = params?.locale;

  if (Array.isArray(raw)) {
    return (raw[0] ?? "tr").toLowerCase();
  }

  return (raw ?? "tr").toLowerCase();
}

/**
 * /me endpoint'ini çağırır.
 * WEB auth cookie tabanlı olduğu için credentials: "include" kullanılır.
 */
async function fetchCurrentUser(): Promise<AuthUser | null> {
  const response = await fetch("/api/v1.0/account/users/me", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: {
      accept: "application/json",
    },
  });

  /**
   * 401/403 durumunda kullanıcı bilgisi yok kabul edilir.
   * Bu normal bir "guest / session yok / session süresi dolmuş" senaryosu olabilir.
   */
  if (response.status === 401 || response.status === 403) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Kullanıcı bilgisi alınamadı. HTTP ${response.status}`);
  }

  const json = (await response.json().catch(() => null)) as MeResponseDto | null;

  if (!json?.ok) {
    return null;
  }

  return json.data ?? null;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  /**
   * user:
   * UI katmanında kullanılacak mevcut kullanıcı özeti
   */
  const [user, setUser] = useState<AuthUser | null>(null);

  /**
   * loading:
   * İlk auth hydrate işlemi bitene kadar true
   */
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const params = useParams();
  const locale = resolveLocaleFromParams(
    params as Record<string, string | string[] | undefined>
  );

  const clearUser = useCallback(() => {
    setUser(null);
  }, []);

  /**
   * refreshUser:
   * BFF /me endpoint'inden kullanıcı bilgisini yeniden yükler.
   *
   * Kullanım örnekleri:
   * - Sayfa ilk açılışı
   * - Profil güncelleme sonrası
   * - Login sonrası UI state yenileme
   */
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

  /**
   * İlk açılışta auth state'i BFF /me endpoint'inden hydrate edilir.
   */
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
    /**
     * UI state her durumda temizlenir.
     * Çünkü backend başarısız olsa bile kullanıcıyı içeride tutmak risklidir.
     */
    setUser(null);

    /**
     * Locale uyumlu login ekranına yönlendir
     */
    router.replace(`/${locale}/auth/login`);
  }
}, [locale, router]);
  const value = useMemo<AuthContextType>(
    () => ({
      user,
      setUser,
      clearUser,
      refreshUser,
      isAuthenticated: !!user,
      loading,
      logout,
    }),
    [user, clearUser, refreshUser, loading, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);