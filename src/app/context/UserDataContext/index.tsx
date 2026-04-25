//src/app/context/UserDataContext/index.tsx
"use client";

import React, { createContext, useState, useEffect } from "react";
import useSWR from "swr";

// 📌 Türler (backend DTO’ları / tipler)
import {
  PostType,
  profiledataType,
  Reply,
  Comment,
} from "@/app/[locale]/(DashboardLayout)/types/apps/userProfile";
import { GallaryType, userType } from "@/app/[locale]/(DashboardLayout)/types/apps/users";

// 📌 Global veri fetcher yardımcıları
//import { getWebFetcher, postWebFetcher } from "@/utils/fetchers.client";
import { getWebFetcher, postWebFetcher    } from "@/utils/fetchers.web.client";

/* ----------------------------------------------------------------------------
 🧩 UserDataContextType
   Uygulamadaki kullanıcıyla ilgili verilerin ve eylemlerin (metodların) tiplerini tanımlar.
-----------------------------------------------------------------------------*/
export type UserDataContextType = {
  posts: PostType[];
  users: userType[];
  gallery: GallaryType[];
  followers: userType[];
  profileData: profiledataType;
  loading: boolean;
  error: Error | null;
  search: string;

  // --- Setter / Eylem Fonksiyonları ---
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  addGalleryItem: (item: GallaryType) => void;
  addReply: (postId: string, commentId: string, reply: Reply) => void;
  likePost: (postId: number | string) => void;
  addComment: (postId: string, comment: Comment) => void;
  likeReply: (postId: string | number, commentId: string | number) => void;
  toggleFollow: (id: string) => void;
};

/* ----------------------------------------------------------------------------
 🌍 Context oluşturma
-----------------------------------------------------------------------------*/
export const UserDataContext = createContext<UserDataContextType>(
  {} as UserDataContextType
);

/* ----------------------------------------------------------------------------
 ⚙️ Başlangıç konfigürasyonu
-----------------------------------------------------------------------------*/
const config = {
  posts: [],
  users: [],
  gallery: [],
  followers: [],
  search: "",
  loading: true,
};

/* ----------------------------------------------------------------------------
 🧠 UserDataProvider
   - Kullanıcıya ait post, takipçi, galeri gibi bilgileri yönetir.
   - SWR ile API çağrılarını optimize eder.
   - Alt bileşenlerde global olarak kullanılabilir hale getirir.
-----------------------------------------------------------------------------*/
export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // --- Durum yönetimi ---
  const [posts, setPosts] = useState<PostType[]>(config.posts);
  const [users, setUsers] = useState<userType[]>(config.users);
  const [gallery, setGallery] = useState<GallaryType[]>(config.gallery);
  const [followers, setFollowers] = useState<userType[]>(config.followers);
  const [search, setSearch] = useState<string>(config.search);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(config.loading);

  // --- Profil temel bilgisi ---
  const [profileData, setProfileData] = useState<profiledataType>({
    name: "Mathew Anderson",
    role: "Designer",
    avatar: "/images/profile/user-1.jpg",
    coverImage: "/images/backgrounds/profilebg.jpg",
    postsCount: 938,
    followersCount: 3586,
    followingCount: 2659,
  });

  // --- SWR çağrıları ---
  const {
    data: postsData,
    isLoading: isPostsLoading,
    error: postsError,
    mutate,
  } = useSWR("/api/userprofile", getWebFetcher);

  const {
    data: usersData,
    isLoading: isUsersLoading,
    error: usersError,
  } = useSWR("/api/userprofile/get-users", getWebFetcher);

  const {
    data: galleryData,
    isLoading: isGalleryLoading,
    error: galleryError,
  } = useSWR("/api/userprofile/get-gallery", getWebFetcher);

  /* ------------------------------------------------------------------------
   🔁 API yanıtlarını state’e senkronize et
  -------------------------------------------------------------------------*/
  useEffect(() => {
    // Veriler geldiyse state’leri doldur
    if (postsData && usersData && galleryData) {
      setPosts(postsData.data);
      setUsers(usersData.data);
      setFollowers(usersData.data);
      setGallery(galleryData.data);
      setLoading(false);
    }

    // Hata yönetimi
    if (postsError || usersError || galleryError) {
      setError(postsError || usersError || galleryError);
      setLoading(false);
    }
  }, [
    postsData,
    usersData,
    galleryData,
    postsError,
    usersError,
    galleryError,
  ]);

  /* ------------------------------------------------------------------------
   🎨 Galeriye yeni öğe ekle
  -------------------------------------------------------------------------*/
  const addGalleryItem = (item: GallaryType) => {
    setGallery((prev) => [...prev, item]);
  };

  /* ------------------------------------------------------------------------
   👥 Takip et / takibi bırak
  -------------------------------------------------------------------------*/
  const toggleFollow = (id: string) => {
    setFollowers((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, isFollowed: !f.isFollowed } : f
      )
    );
  };

  /* ------------------------------------------------------------------------
   🔍 Takipçi arama filtresi
  -------------------------------------------------------------------------*/
  const filterFollowers = () => {
    if (!followers) return [];
    return followers.filter((f) =>
      f.name.toLowerCase().includes(search.toLowerCase())
    );
  };

  /* ------------------------------------------------------------------------
   💬 Post’a yorum ekle
  -------------------------------------------------------------------------*/
  const addComment = async (postId: string, comment: Comment) => {
    try {
      await mutate(
        postWebFetcher("/api/userprofile/add-comments", { postId, comment })
      );
    } catch (err) {
      console.error("❌ Yorum eklenirken hata oluştu:", err);
    }
  };

  /* ------------------------------------------------------------------------
   ↩️ Yoruma cevap ekle
  -------------------------------------------------------------------------*/
  const addReply = async (postId: string, commentId: string, reply: Reply) => {
    try {
      await mutate(
        postWebFetcher("/api/userprofile/add-replies", {
          postId,
          commentId,
          reply,
        })
      );
    } catch (err) {
      console.error("❌ Yanıt eklenirken hata oluştu:", err);
    }
  };

  /* ------------------------------------------------------------------------
   ❤️ Post beğen / beğeniyi kaldır
  -------------------------------------------------------------------------*/
  const likePost = async (postId: number | string) => {
    try {
      await mutate(postWebFetcher("/api/userprofile", { postId }));
    } catch (err) {
      console.error("❌ Post beğenme hatası:", err);
    }
  };

  /* ------------------------------------------------------------------------
   💗 Cevap beğen / beğeniyi kaldır
  -------------------------------------------------------------------------*/
  const likeReply = async (postId: string | number, commentId: string | number) => {
    try {
      await mutate(
        postWebFetcher("/api/userprofile/replies-like", { postId, commentId })
      );
    } catch (err) {
      console.error("❌ Yanıt beğenme hatası:", err);
    }
  };

  /* ------------------------------------------------------------------------
   🧩 Provider (global context)
  -------------------------------------------------------------------------*/
  return (
    <UserDataContext.Provider
      value={{
        posts,
        users,
        gallery,
        followers: filterFollowers(),
        profileData,
        loading,
        error,
        search,
        setSearch,
        addGalleryItem,
        addReply,
        likePost,
        addComment,
        likeReply,
        toggleFollow,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};
