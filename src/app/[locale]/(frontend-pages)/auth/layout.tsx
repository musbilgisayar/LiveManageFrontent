// src/app/[locale]/(frontend-pages)/layout.tsx
import Header from "@/app/components/frontend-pages/shared/header/HpHeader";
import Footer from "@/app/components/frontend-pages/shared/footer";

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
