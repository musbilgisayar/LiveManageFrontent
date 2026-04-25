// src/app/[locale]/page.tsx
/*import Banner from "@/app/components/frontend-pages/homepage/banner/Banner"; */

 
import HomePage from '@/app/page';

export default async function Page(
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params; // ✅ params await edilmeli
  return <HomePage locale={locale} />;
}
 