// app/page.tsx
"use client";

import dynamic from "next/dynamic";
import PageContainer from "@/app/components/container/PageContainer";

const HpHeader = dynamic(
  () => import("@/app/components/frontend-pages/shared/header/HpHeader"),
  {
    ssr: false,
  }
);

const HomePage = () => {
  return (
    <PageContainer title="Homepage" description="LiveManage Homepage">
      <HpHeader />

      <main
        style={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "32px",
        }}
      >
        <h1>Hoşgeldiniz</h1>
      </main>
    </PageContainer>
  );
};

export default HomePage;