//src/app/[locale]/(DashboardLayout)/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { jwtDecode } from 'jwt-decode';
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import PageContainer from '@/app/components/container/PageContainer'

// components
import YearlyBreakup from '@/app/components/dashboards/modern/YearlyBreakup'
import MonthlyEarnings from '@/app/components/dashboards/modern/MonthlyEarnings'
import TopCards from '@/app/components/dashboards/modern/TopCards'
import RevenueUpdates from '@/app/components/dashboards/modern/RevenueUpdates'
import EmployeeSalary from '@/app/components/dashboards/modern/EmployeeSalary'
import Customers from '@/app/components/dashboards/modern/Customers'
import Projects from '@/app/components/dashboards/modern/Projects'
import Social from '@/app/components/dashboards/modern/Social'
import SellingProducts from '@/app/components/dashboards/modern/SellingProducts'
import WeeklyStats from '@/app/components/dashboards/modern/WeeklyStats'
import TopPerformers from '@/app/components/dashboards/modern/TopPerformers'
import Welcome from "@/app/[locale]/(DashboardLayout)/layout/shared/welcome/Welcome"

import { useI18nNs } from '@/app/context/i18nContext'

type UserPayload = {
  sub: string
  email: string
  displayName: string
  roles: string[]
}

function getUserFromToken(): UserPayload | null {
  const token = localStorage.getItem('accessToken')
  if (!token) return null
  try {
    return jwtDecode<UserPayload>(token)
  } catch {
    return null
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const { lang } = useParams()
  const { t } = useI18nNs(['dashboard'])

  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    const user = getUserFromToken()

    if (!user) {
      router.replace(`/${lang}/auth/login`)
      return
    }

    if (user.roles?.includes('Admin')) {
      router.replace(`/${lang}/admin`)
      return
    }

    setLoading(false)
  }, [router, lang])

  if (isLoading) return null

  return (
    <PageContainer
      title={t('dashboard:title', { defaultValue: 'Live-Manage' })}
      description={t('dashboard:description', { defaultValue: 'This is your dashboard overview' })}
    >
      <Box mt={3}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 12 }}>
            <TopCards />
          </Grid>

          <Grid size={{ xs: 12, lg: 8 }}>
            <RevenueUpdates isLoading={isLoading} />
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, lg: 12 }}>
                <YearlyBreakup isLoading={isLoading} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 12 }}>
                <MonthlyEarnings isLoading={isLoading} />
              </Grid>
            </Grid>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <EmployeeSalary isLoading={isLoading} />
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Customers isLoading={isLoading} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Projects isLoading={isLoading} />
              </Grid>
              <Grid size={12}>
                <Social />
              </Grid>
            </Grid>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <SellingProducts />
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <WeeklyStats isLoading={isLoading} />
          </Grid>

          <Grid size={{ xs: 12, lg: 8 }}>
            <TopPerformers />
          </Grid>
        </Grid>

        <Welcome />
      </Box>
    </PageContainer>
  )
}
