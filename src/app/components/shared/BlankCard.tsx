// src/app/components/shared/BlankCard.tsx

"use client"

/**
 * 🧩 BlankCard (Boş Kart) Bileşeni
 * 
 * Amacı:
 *   - Uygulamadaki kart tabanlı bileşenler (profil, galeri, bildirim vs.) için
 *     ortak bir görünüm ve stil altyapısı sağlamaktır.
 * 
 * Özellikler:
 *   ✅ CustomizerContext ile temaya göre gölge (shadow) veya kenarlık (border) uygular.
 *   ✅ Esnek yapı: içerik (children) ve stil (sx) dışarıdan geçilebilir.
 *   ✅ Material UI `Card` bileşenini temel alır.
 */

import React, { useContext } from 'react'
import { Card } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { CustomizerContext } from '@/app/context/customizerContext'

// 🔹 Bileşenin alabileceği props
type Props = {
  /** Ek CSS sınıfı (isteğe bağlı) */
  className?: string

  /** Kartın içeriği (alt bileşenler veya içerik blokları) */
  children: React.ReactNode

  /** Ek stil nesnesi (sx prop'u ile özel düzenleme yapılabilir) */
  sx?: any
}

// 🔹 Ana bileşen
const BlankCard = ({ children, className, sx }: Props) => {
  // 🎨 Tema bilgisi
  const theme = useTheme()
  const borderColor = theme.palette.grey[200]

  // ⚙️ Kullanıcı özelleştirmesi (gölge aktif mi değil mi?)
  const isCardShadow = useContext(CustomizerContext)

  return (
    <Card
      sx={{
        p: 0,
        border: !isCardShadow ? `1px solid ${borderColor}` : 'none', // gölge yoksa kenarlık göster
        position: 'relative',
        ...sx, // dışarıdan gelen stil üzerine ekle
      }}
      className={className}
      elevation={isCardShadow ? 9 : 0} // gölge varsa derinlik ver
      variant={!isCardShadow ? 'outlined' : undefined} // kenarlıklı versiyon
    >
      {children}
    </Card>
  )
}

export default BlankCard
