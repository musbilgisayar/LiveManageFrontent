// src/app/[locale]/(DashboardLayout)/(panel)/account/settings/page.tsx

'use client'

import * as React from 'react'
import PageContainer from '@/app/components/container/PageContainer'
import Breadcrumb from '@/app/[locale]/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb'
import { Box, CardContent, Divider, Tabs, Tab } from '@mui/material'
import Grid from '@mui/material/Grid'
import BlankCard from '@/app/components/shared/BlankCard'

// 🔹 Sekme içerikleri
import AccountTab from '@/app/components/pages/account-setting/AccountTab'
import NotificationTab from '@/app/components/pages/account-setting/NotificationTab'
import BillsTab from '@/app/components/pages/account-setting/BillsTab'
import SecurityTab from '@/modules/account-setting/components/SecurityTab'
import AddressTab from '@/app/components/pages/account-setting/AddressCard'

// 🔹 İkonlar
import {
  IconArticle,
  IconBell,
  IconLock,
  IconUserCircle,
} from '@tabler/icons-react'

// 🔹 i18n çeviri bağlamı
import { useI18nNs } from '@/app/context/i18nContext'
import Address from '@/app/components/frontend-pages/contact/form/Address'
import AddressCard from '@/app/components/pages/account-setting/AddressCard'

const AccountSetting = () => {
  const { t } = useI18nNs(['account']) // ✅ 'account' namespace kullanıldı
  const [value, setValue] = React.useState(0)

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  // 🔹 Breadcrumb (yerel dilde)
  const BCrumb = [
    { to: '/', title: t('common:home') },
    { title: t('account:settings.title') },
  ]

  return (
    <PageContainer
      title={t('account:settings.title')}
      description={t('account:settings.description')}
    >
      <Breadcrumb title={t('account:settings.title')} items={BCrumb} />

      <Grid container spacing={3}>
        <Grid
          size={{
            xs: 12,
          }}
        >
          <BlankCard>
            <Box sx={{ maxWidth: { xs: 320, sm: 480 } }}>
              <Tabs
                value={value}
                onChange={handleChange}
                scrollButtons="auto"
                aria-label="account setting tabs"
              >
                <Tab
                  iconPosition="start"
                  icon={<IconUserCircle size="22" />}
                  label={t('account:tabs.profile')}
                />
                <Tab
                  iconPosition="start"
                  icon={<IconBell size="22" />}
                  label={t('account:tabs.notifications')}
                />
                <Tab
                  iconPosition="start"
                  icon={<IconArticle size="22" />}
                  label={t('account:tabs.billing')}
                />
                <Tab
                  iconPosition="start"
                  icon={<IconLock size="22" />}
                  label={t('account:tabs.security')}
                />
              </Tabs>
            </Box>

            <Divider />
            <CardContent>
              {value === 0 && <AccountTab />}
              {value === 1 && <NotificationTab />}
              {value === 2 && <BillsTab />}
              {value === 3 && <SecurityTab />}
              {value === 4 && <AddressCard />}
            </CardContent>
          </BlankCard>
        </Grid>
      </Grid>
    </PageContainer>
  )
}

export default AccountSetting
