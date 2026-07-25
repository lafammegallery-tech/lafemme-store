import type { Metadata } from "next";
import { InfoPage } from "@/components/content/InfoPage";
import { PageHero, PageLayout } from "@/components/common";
export const metadata: Metadata = {
  title: "درباره ما | La Femme",
  description: "آشنایی با برند La Femme و رویکرد آن در ارائه طلا و نقره",
  alternates: { canonical: "/about" },
};
/** صفحه معرفی برند با محتوای قابل مدیریت در آینده. */
export default function AboutPage() {
  return (
    <PageLayout>
      <PageHero title="درباره La Femme" description="ترکیبی از اصالت، ظرافت و سرمایه‌گذاری مطمئن" />
      <InfoPage>
        <h2>داستان ما</h2>
        <p>
          La Femme با هدف ارائه تجربه‌ای شفاف و ممتاز در خرید شمش‌های طلا و نقره شکل گرفته است.
          طراحی فعلی سایت، هویت لوکس و مینیمال برند را حفظ می‌کند.
        </p>
        <h2>ارزش‌های ما</h2>
        <p>
          اصالت کالا، شفافیت اطلاعات، احترام به مشتری و تجربه خرید امن، اصول اصلی این مجموعه هستند.
        </p>
        <h2>چشم‌انداز</h2>
        <p>در فازهای بعدی، زیرساخت قیمت‌گذاری، موجودی و سفارش به سرویس‌های واقعی متصل خواهد شد.</p>
      </InfoPage>
    </PageLayout>
  );
}
