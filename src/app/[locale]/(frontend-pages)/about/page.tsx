import PageContainer from '@/app/components/container/PageContainer';
import HeaderAlert from '@/app/components/frontend-pages/shared/header/HeaderAlert';
import HpHeader from '@/app/components/frontend-pages/shared/header/HpHeader';
import Leadership from '@/app/components/frontend-pages/shared/leadership';
import Reviews from '@/app/components/frontend-pages/shared/reviews';
import Pricing from '@/app/components/frontend-pages/shared/pricing';
import C2a from '@/app/components/frontend-pages/shared/c2a';
import Footer from '@/app/components/frontend-pages/shared/footer';
import Banner from '@/app/components/frontend-pages/about/banner';
import Process from '@/app/components/frontend-pages/about/process';
import KeyMetric from '@/app/components/frontend-pages/about/key-metric';
import ScrollToTop from '@/app/components/frontend-pages/shared/scroll-to-top';

const About = () => {
  return (
    <PageContainer title="About" description="this is About">
      <HeaderAlert />
      <HpHeader />
      <Banner />
      <Process />
      <KeyMetric />
      <Leadership />
      <Reviews />
      <Pricing />
      <C2a />
      <Footer />
      <ScrollToTop />
    </PageContainer>
  );
};

export default About;
