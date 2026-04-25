// src/app/components/shared/CustomSelect.tsx

'use client'

/**
 * 🔽 CustomSelect (Özel Seçim Kutusu)
 * 
 * Amacı:
 *   - Material UI'nin `Select` bileşenini proje temasına uygun şekilde özelleştirmek.
 *   - Gerektiğinde yeniden kullanılabilir, sade ve esnek bir temel bileşen oluşturmaktır.
 * 
 * Özellikler:
 *   ✅ MUI `Select` üzerine kurulu.
 *   ✅ styled() ile temaya göre CSS özelleştirmesi yapılabilir.
 *   ✅ Tüm sayfalarda (profil, ayarlar, filtreleme vs.) tekrar kullanılabilir.
 */

import React from 'react'
import { styled } from '@mui/material/styles'
import { Select } from '@mui/material'

// 🔹 Select bileşeninin temaya göre özelleştirilmiş sürümü
const CustomSelect = styled((props: any) => <Select {...props} />)(
  ({ theme }) => ({
    // 🎨 Buraya özel stil eklentileri yapılabilir.
    // Örneğin:
    // borderRadius: theme.shape.borderRadius,
    // backgroundColor: theme.palette.background.paper,
    // '& .MuiSelect-select': { padding: '10px 14px' },
  })
)

export default CustomSelect
