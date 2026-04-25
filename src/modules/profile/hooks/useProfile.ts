// src/modules/profile/hooks/useProfile.ts
"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
//import { getWebFetcher, patchFetcher } from "@/utils/fetchers.client";
import { getWebFetcher , patchWebFetcher} from "@/utils/fetchers.web.client";

export type UserProfileResponseDto = {
  id: string;
  appUserId: string;

  firstName: string;
  lastName: string;
  middleName?: string | null;
  displayName?: string | null;

  phoneNumber?: string | null;
  emailForNotifications?: string | null;

  profilePhotoUrl?: string | null;
  coverPhotoUrl?: string | null;

  cultureCode?: string | null;
  timeZoneId?: string | null;

  jobTitle?: string | null;
  companyName?: string | null;
  department?: string | null;
  bio?: string | null;
};

type ApiEnvelope<T> = {
  ok: boolean;
  status?: number;
  data: T;
  error?: string;
  message?: string;
};

// Profesyonel PATCH: sadece gönderdiğin alanlar değişir
export type UserProfilePatchDto = Partial<{
  firstName: string;
  lastName: string;
  middleName: string | null;
  displayName: string | null;

  phoneNumber: string | null;
  emailForNotifications: string | null;

  profilePhotoUrl: string | null;
  coverPhotoUrl: string | null;

  jobTitle: string | null;
  companyName: string | null;
  department: string | null;

  cultureCode: string | null;
  timeZoneId: string | null;

  bio: string | null;
}>;

function toPrefix(s?: string) {
  return (s ?? "tr").split("-")[0].toLowerCase();
}

/** Kritik debug logları tek noktadan, tutarlı formatla bas */
function logProfile(level: "info" | "warn" | "error", title: string, details?: any) {
  // Prod'da gürültü olmasın diye istersen env ile kapat:
  // if (process.env.NODE_ENV === "production") return;
  const prefix = `[PROFIL][useProfile] ${title}`;
  if (level === "info") console.info(prefix, details ?? "");
  if (level === "warn") console.warn(prefix, details ?? "");
  if (level === "error") console.error(prefix, details ?? "");
}

/** Hata objesini okunabilir hale getir */
function normalizeErr(err: any) {
  const out: any = {
    name: err?.name,
    message: err?.message,
    status: err?.status, // globalFetcher set ediyorsa
  };

  // globalFetcher "payload" koyuyorsa
  if (err?.payload) out.payload = err.payload;

  // network hataları vs.
  if (err?.cause) out.cause = err.cause;

  return out;
}

export function useProfile() {
  const params = useParams();
  const lang = toPrefix(params?.lang as string);

  // ✅ Senin gerçek Next BFF route’un
  const url = `/api/v1.0/userprofile/me`;

  logProfile("info", "Hook init", {
    lang,
    url,
    hint: "GET/PATCH bu URL üzerinden gidecek. Token ekleme işi fetcher'da.",
  });

  const { data, error, isLoading, mutate } =
  useSWR<ApiEnvelope<UserProfileResponseDto>>(
    url,
    getWebFetcher,
    {
      onSuccess: (res) => {
        // Burada token’ı göremeyiz (görmemeliyiz). Ama en kritik sinyal: ok/status.
        logProfile("info", "GET başarılı (SWR onSuccess)", {
          url,
          ok: res?.ok,
          status: res?.status,
          hasData: !!res?.data,
          userId: (res?.data as any)?.appUserId ?? (res?.data as any)?.id ?? null,
          note:
            "Eğer backend loglarında 'Authorization header bulunamadı' görüyorsan, bu request fetcher'dan token gitmiyor demektir.",
        });

        // 200 dönüyor ama ok false gibi anormal durumlar:
        if (res && res.ok === false) {
          logProfile("warn", "GET envelope ok=false (200 olsa bile hata var)", {
            url,
            status: res.status,
            error: res.error,
            message: res.message,
            raw: res,
          });
        }

        // Çok kritik debug: accessToken var mı?
        // (Token'ı yazdırmıyoruz, sadece var/yok + expire şüphesi için hint)
        try {
          const hasToken = typeof window !== "undefined" && !!localStorage.getItem("accessToken");
          logProfile("info", "Client accessToken durumu", { hasToken });
        } catch (e) {
          logProfile("warn", "localStorage okunamadı", normalizeErr(e));
        }
      },

      onError: (err) => {
        logProfile("error", "GET hatası (SWR onError)", {
          url,
          ...normalizeErr(err),
          hint:
            "Eğer status=401 ise: token expired / refresh başarısız / Authorization forward edilmiyor olabilir.",
        });
      },

      // SWR davranışı
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  const profile = data?.data ?? null;
  const ok = data?.ok ?? false;

  // İlk renderlarda debugging kolay olsun
  if (isLoading) {
    logProfile("info", "GET yükleniyor...", { url });
  }

  if (error) {
    logProfile("error", "GET error state (hook)", normalizeErr(error));
  }

  // ✅ Merkezi save: UI artık fetch yazmayacak
  const save = async (patch: UserProfilePatchDto) => {
    // Patch “ne gönderiyorum” logu (PII olabilir — istersen maskele)
    const keys = Object.keys(patch ?? {});
    logProfile("info", "PATCH başlıyor", {
      url,
      fields: keys,
      fieldCount: keys.length,
      hint:
        "PATCH 405 görürsen: Next route PATCH desteklemiyor demektir. /api/v1.0/[lang]/userprofile/me/route.ts içine PATCH eklenmeli.",
    });

    try {
      const res = (await patchWebFetcher(url, patch)) as ApiEnvelope<UserProfileResponseDto>;

      logProfile("info", "PATCH başarılı", {
        ok: res?.ok,
        status: res?.status,
        hasData: !!res?.data,
        note: "Başarılıysa SWR cache revalidate etmeden güncellenecek.",
      });

      if (res && res.ok === false) {
        logProfile("warn", "PATCH envelope ok=false", { status: res.status, error: res.error, message: res.message });
      }

      // SWR cache’i güncelle
      await mutate(res, { revalidate: false });

      logProfile("info", "SWR cache güncellendi (mutate)", {
        revalidate: false,
        url,
      });

      return res?.data ?? null;
    } catch (err: any) {
      const n = normalizeErr(err);

      // Token expired / 401 senaryosu için net uyarı
      if (n?.status === 401) {
        logProfile("warn", "PATCH 401 (muhtemel token expired). Refresh çalışmadı/endpoint yanlış olabilir.", n);
      } else {
        logProfile("error", "PATCH hatası", n);
      }

      throw err;
    }
  };

  const reload = async () => {
    logProfile("info", "Manual reload çağrıldı (mutate)", { url });
    return mutate();
  };

  return {
    url,
    profile,
    ok,
    isLoading,
    error,
    reload,
    save,
  };
}


