// src/app/[locale]/(DashboardLayout)/(panel)/account/profile/page.tsx

'use client'

import { Box } from '@mui/material'
import Grid from '@mui/material/Grid'  
import PageContainer from '@/app/components/container/PageContainer'
import ProfileBanner from '@/app/components/apps/userprofile/profile/ProfileBanner'
import ProfileTab from '@/app/components/apps/userprofile/profile/ProfileTab'
import IntroCard from '@/app/components/apps/userprofile/profile/IntroCard'
import GalleryCard from '@/app/components/apps/userprofile/gallery/GalleryCard'
import FriendsCard from '@/app/components/apps/userprofile/friends/FriendsCard'
import FollowerCard from '@/app/components/apps/userprofile/followers/FollowerCard'
import Post from '@/app/components/apps/userprofile/profile/Post'
import { getUserFromToken } from '@/utils/authHelpers'

export default function ProfilePage() {
  const user = getUserFromToken()
  const roles = user?.roles ?? []

  return (
    <PageContainer title="Profil" description="Kullanıcı hesabı bilgileri">
      <Box mt={3}>
        <ProfileBanner user={user} />
        <Box mt={2}>
          <ProfileTab roles={roles} />
        </Box>

        <Grid container spacing={3} mt={1}>
          {/* Sol sütun */}
          <Grid
            size={{
              xs: 12,
              md: 4,
            }}
          >
            <IntroCard />
            <GalleryCard />
            <FriendsCard />
            <FollowerCard />
          </Grid>

          {/* Sağ sütun */}
          <Grid
            size={{
              xs: 12,
              md: 8,
            }}
          >
            <Post />
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  )
}
