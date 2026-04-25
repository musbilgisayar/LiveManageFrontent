// app/page.tsx  -------------------------------
// Client Component: Ana HomePage burada.
"use client";

import { useEffect } from "react";
import PageContainer from "@/app/components/container/PageContainer";
import Banner from "@/app/components/frontend-pages/homepage/banner/Banner";
import HeaderAlert from "@/app/components/frontend-pages/shared/header/HeaderAlert";
import HpHeader from "@/app/components/frontend-pages/shared/header/HpHeader";
import Features from "@/app/components/frontend-pages/homepage/features/Features";
import DefendFocus from "@/app/components/frontend-pages/homepage/defend-focus";
import Leadership from "@/app/components/frontend-pages/shared/leadership";
import PowerfulDozens from "@/app/components/frontend-pages/homepage/powerful-dozens";
import Reviews from "@/app/components/frontend-pages/shared/reviews";
import ExceptionalFeature from "@/app/components/frontend-pages/homepage/exceptional-feature";
import Pricing from "@/app/components/frontend-pages/shared/pricing";
import FAQ from "@/app/components/frontend-pages/homepage/faq";
import C2a from "@/app/components/frontend-pages/shared/c2a";
import Footer from "@/app/components/frontend-pages/shared/footer";
import ScrollToTop from "@/app/components/frontend-pages/shared/scroll-to-top";

type HomePageProps = { locale?: string };

const HomePage = ({ locale }: HomePageProps) => {
  useEffect(() => {
    console.log("📍 Aktif dil:", locale || "en");
  }, [locale]);

  return (
    <PageContainer title="Homepage" description="This is Homepage">
      <HeaderAlert />
      <HpHeader />
      <Banner />
      <Features />
      <DefendFocus />
      <Leadership />
      <PowerfulDozens />
      <Reviews />
      <ExceptionalFeature />
      <Pricing />
      <FAQ />
      <C2a />
      <Footer />
      <ScrollToTop />
    </PageContainer>
  );
};

export default HomePage;
