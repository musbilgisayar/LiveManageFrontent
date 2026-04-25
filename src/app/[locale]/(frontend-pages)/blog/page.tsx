// src/app/[locale]/frontend-pages/blog/page.tsx

import React from "react";
import BlogList from "@/app/components/frontend-pages/blog/blog-list/Blog";
import PageContainer from "@/app/components/container/PageContainer";
import HeaderAlert from "@/app/components/frontend-pages/shared/header/HeaderAlert";
import HpHeader from "@/app/components/frontend-pages/shared/header/HpHeader";
import C2a from "@/app/components/frontend-pages/shared/c2a";
import Footer from "@/app/components/frontend-pages/shared/footer";
import Banner from "@/app/components/frontend-pages/blog/banner";
import ScrollToTop from "@/app/components/frontend-pages/shared/scroll-to-top";

const BlogPage = () => {
  return (
    <PageContainer title="Blog" description="This is Blog Page">
      <HeaderAlert />
      <HpHeader />
      <Banner />
      <BlogList />
      <C2a />
      <Footer />
      <ScrollToTop />
    </PageContainer>
  );
};

export default BlogPage;
