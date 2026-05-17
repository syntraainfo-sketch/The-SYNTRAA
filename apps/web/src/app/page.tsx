import { Suspense } from "react";
import { HomeHero } from "@/components/home/Hero";
import {
  HomeArticlesTeaser,
  HomeBenefits,
  HomeBestSellers,
  HomeCategoryCircles,
  HomeEverydayBeauty,
  HomeInstaStrip,
  HomePromoSplit,
} from "@/components/home/BellezzaSections";
import { NewsletterSection } from "@/components/home/Newsletter";

function SectionFallback() {
  return <div className="h-40 animate-pulse bg-[#f5f2ed]" aria-hidden />;
}

export default function Home() {
  return (
    <main className="bg-white pb-8">
      <HomeHero />

      <Suspense fallback={<SectionFallback />}>
        <HomeCategoryCircles />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <HomeBestSellers />
      </Suspense>

      <HomeBenefits />

      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <HomePromoSplit />
      </div>

      <Suspense fallback={<SectionFallback />}>
        <HomeEverydayBeauty />
      </Suspense>

      <HomeArticlesTeaser />

      <HomeInstaStrip />

      <NewsletterSection />
    </main>
  );
}
