'use client';

import React, { createContext, useState, useEffect } from 'react';
import useSWR from 'swr';

import { TicketType } from '@/app/[locale]/(DashboardLayout)/types/apps/ticket';
import { deleteFetcher, getWebFetcher } from "@/utils/fetchers.web.client";
/* ----------------------------------------------------------------------------
 🎯 TicketContextType
   Bilet (Ticket) verilerini ve bu veriler üzerinde işlem yapacak fonksiyonları
   tanımlar. Tip güvenliği sağlar.
-----------------------------------------------------------------------------*/
export interface TicketContextType {
  tickets: TicketType[];                      // Tüm biletlerin listesi
  deleteTicket: (id: number) => void;         // Bir bileti silme fonksiyonu
  setTicketSearch: (term: string) => void;    // Arama terimini güncelleme
  searchTickets: (term: string) => void;      // Biletleri arama fonksiyonu
  ticketSearch: string;                       // Aktif arama terimi
  filter: string;                             // Aktif filtre tipi (örn: “açık biletler”)
  setFilter: (filter: string) => void;        // Filtreyi değiştirme fonksiyonu
  error: string;                              // Hata mesajı (varsa)
  loading: boolean;                           // Yüklenme durumu
}

/* ----------------------------------------------------------------------------
 🌍 Context oluşturma
-----------------------------------------------------------------------------*/
export const TicketContext = createContext<TicketContextType>(
  {} as TicketContextType
);

/* ----------------------------------------------------------------------------
 🧠 TicketProvider
   - Tüm bilet verilerini yönetir.
   - SWR ile API’den verileri çeker, cache eder ve revalidate eder.
   - Alt bileşenlerin kolayca erişebilmesi için Context Provider olarak sunar.
-----------------------------------------------------------------------------*/
export const TicketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // --- Durum yönetimi (state) ---
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [ticketSearch, setTicketSearch] = useState<string>('');
  const [filter, setFilter] = useState<string>('total_tickets');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // --- SWR ile veri çekme ---
  const {
    data: ticketsData,
    isLoading: isTicketsLoading,
    error: ticketsError,
    mutate,
  } = useSWR('/api/ticket', getWebFetcher);

  /* ------------------------------------------------------------------------
   🔁 API verilerini state’e senkronize et
  -------------------------------------------------------------------------*/
  useEffect(() => {
    if (ticketsData) {
      setTickets(ticketsData.data);
      setLoading(isTicketsLoading);
    } else if (ticketsError) {
      setError(String(ticketsError));
      setLoading(isTicketsLoading);
    } else {
      setLoading(isTicketsLoading);
    }
  }, [ticketsData, ticketsError, isTicketsLoading]);

  /* ------------------------------------------------------------------------
   ❌ Bilet silme işlemi
   Belirli bir bileti (id) API üzerinden siler ve SWR cache’ini günceller.
  -------------------------------------------------------------------------*/
  const deleteTicket = async (id: number) => {
    try {
      await mutate(deleteFetcher('/api/ticket', { id }));
    } catch (err) {
      console.error('❌ Bilet silinirken hata oluştu:', err);
    }
  };

  /* ------------------------------------------------------------------------
   🔍 Arama terimini güncelleme
   Girilen terime göre biletleri filtrelemek için kullanılır.
  -------------------------------------------------------------------------*/
  const searchTickets = (term: string) => {
    setTicketSearch(term);
  };

  /* ------------------------------------------------------------------------
   🧩 Provider (global context)
  -------------------------------------------------------------------------*/
  return (
    <TicketContext.Provider
      value={{
        tickets,
        error,
        loading,
        deleteTicket,
        setTicketSearch,
        searchTickets,
        ticketSearch,
        filter,
        setFilter,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};
