'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import PageContainer from '@/app/components/container/PageContainer';

import { getUserFromToken } from '@/utils/authHelpers';

 
import YearlyBreakup from '@/app/components/dashboards/modern/YearlyBreakup';
import MonthlyEarnings from '@/app/components/dashboards/modern/MonthlyEarnings';
import TopCards from '@/app/components/dashboards/modern/TopCards';
import RevenueUpdates from '@/app/components/dashboards/modern/RevenueUpdates';
import EmployeeSalary from '@/app/components/dashboards/modern/EmployeeSalary';
import Customers from '@/app/components/dashboards/modern/Customers';
import Projects from '@/app/components/dashboards/modern/Projects';
import Social from '@/app/components/dashboards/modern/Social';
import SellingProducts from '@/app/components/dashboards/modern/SellingProducts';
import WeeklyStats from '@/app/components/dashboards/modern/WeeklyStats';
import TopPerformers from '@/app/components/dashboards/modern/TopPerformers';
import Welcome from '@/app/[locale]/(DashboardLayout)/layout/shared/welcome/Welcome';
import { useI18nNs } from '@/app/context/i18nContext';

export default function DashboardPage() {
  const router = useRouter();
  const { locale } = useParams() as { locale: string };
  const { t } = useI18nNs(['dashboard']);

  const [isLoading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);

  useEffect(() => {
    const user = getUserFromToken();
    

    if (!user) {
      router.replace(`/${locale}/auth/login`);
      return;
    }

    if (user.roles?.includes('Admin')) {
      router.replace(`/${locale}/admin`);
      return;
    }

    setUserRoles(user.roles ?? []);
    setLoading(false);
  }, [router, locale]);

  if (isLoading) return null;

  return (
    <PageContainer
      title={t('dashboard:title')}
      description={t('dashboard:description')}
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
  );
}