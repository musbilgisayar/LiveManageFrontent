import PageContainer from "@/app/components/container/PageContainer";
import HeaderAlert from "@/app/components/frontend-pages/shared/header/HeaderAlert";
import HpHeader from "@/app/components/frontend-pages/shared/header/HpHeader";
import Pricing from "@/app/components/frontend-pages/shared/pricing";
import C2a from "@/app/components/frontend-pages/shared/c2a";
import Footer from "@/app/components/frontend-pages/shared/footer";
import Banner from "@/app/components/frontend-pages/pricing/Banner";
import ScrollToTop from "@/app/components/frontend-pages/shared/scroll-to-top";

const PricingPage = () => {
  return (
    <PageContainer title="Pricing" description="This is the pricing page">
      <HeaderAlert />
      <HpHeader />
      <Banner />
      <Pricing />
      <C2a />
      <Footer />
      <ScrollToTop />
    </PageContainer>
  );
};

export default PricingPage;
