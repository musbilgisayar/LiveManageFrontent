import PageContainer from "@/app/components/container/PageContainer";
import HeaderAlert from "@/app/components/frontend-pages/shared/header/HeaderAlert";
import HpHeader from "@/app/components/frontend-pages/shared/header/HpHeader";
import C2a from "@/app/components/frontend-pages/shared/c2a";
import Footer from "@/app/components/frontend-pages/shared/footer";
import Banner from "@/app/components/frontend-pages/services/Banner";
import ScrollToTop from "@/app/components/frontend-pages/shared/scroll-to-top";
import GalleryCard from "@/app/components/apps/userprofile/gallery/GalleryCard";
import { Box, Container } from "@mui/material";
import { UserDataProvider } from "@/app/context/UserDataContext";

const ServicesPage = () => {
  return (
    <UserDataProvider>
      <PageContainer title="Services" description="This is the services page">
        <HeaderAlert />
        <HpHeader />
        <Banner />

        <Box my={3}>
          <Container maxWidth="lg">
            <GalleryCard />
          </Container>
        </Box>

        <C2a />
        <Footer />
        <ScrollToTop />
      </PageContainer>
    </UserDataProvider>
  );
};

export default ServicesPage;
