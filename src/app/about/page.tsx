import type { Metadata } from "next";
import { InfoPage } from "@/components/content/InfoPage";
import { PageHero, PageLayout } from "@/components/common";

export const metadata: Metadata = {
  title: "درباره ما | La Femme Gold",
  description: "آشنایی با مجموعه La Femme Gold — فروشگاه طلا و جواهر در بازار بزرگ تهران",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <PageLayout>
      <PageHero title="درباره La Femme Gold" description="طلا و جواهر اصیل، از بازار بزرگ تهران تا در خانه شما" />
      <InfoPage>

        <h2>داستان ما</h2>
        <p>
          مجموعه <strong>La Femme Gold</strong> در دل بازار بزرگ تهران، در پاساژ اردیبهشت پایه‌گذاری شده است.
          ما با سال‌ها تجربه در حوزه طلا و جواهر، طیف گسترده‌ای از زیورآلات طلا، جواهرات میناکاری و
          سنگ‌های قیمتی را برای بانوان، آقایان و کودکان عرضه می‌کنیم.
        </p>
        <p>
          La Femme Gold با رویکردی مدرن و شفاف، خرید زیورآلات اصیل را آسان، مطمئن و لذت‌بخش کرده است.
          از گردنبند و دستبند تا انگشتر و گوشواره، هر محصول با دقت انتخاب و با گواهی اصالت عرضه می‌شود.
        </p>

        <h2>تخصص ما</h2>
        <ul>
          <li>زیورآلات طلا برای بانوان، آقایان و کودکان</li>
          <li>جواهرات میناکاری با طرح‌های اصیل ایرانی</li>
          <li>سنگ‌های قیمتی و نیمه‌قیمتی</li>
          <li>گردنبند، دستبند، انگشتر و گوشواره</li>
          <li>شمش طلا و نقره مناسب سرمایه‌گذاری</li>
        </ul>

        <h2>ارزش‌های ما</h2>
        <p>
          اصالت کالا، شفافیت در قیمت‌گذاری و احترام به مشتری سه اصل اساسی مجموعه La Femme Gold هستند.
          قیمت‌های ما به‌صورت لحظه‌ای و بر اساس نرخ روز بازار محاسبه می‌شوند تا شما با اطمینان کامل خرید کنید.
        </p>

        <h2>بازدید حضوری</h2>
        <p>
          ما را در بازار بزرگ تهران، پاساژ اردیبهشت، پلاک ۲/۳۱ بیابید.<br />
          تلفن تماس: <a href="tel:02155622804" dir="ltr">۰۲۱–۵۵۶۲۲۸۰۴</a><br />
          اینستاگرام: <a href="https://instagram.com/lafemmegold" target="_blank" rel="noopener noreferrer">@lafemmegold</a>
        </p>

      </InfoPage>
    </PageLayout>
  );
}
