import Preloader from "@/components/Preloader";
import SiteHeader from "@/components/SiteHeader";
import PageHero from "@/components/PageHero";
import Story from "@/components/Story";
import Values from "@/components/Values";
import CtaBanner from "@/components/CtaBanner";
import Footer from "@/components/Footer";
import { getPageContent } from "@/lib/get-content";
import type {
  CtaBannerContent,
  FooterContent,
  PageHeroContent,
  StoryContent,
  ValuesContent,
} from "@/lib/content-defaults";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "About | 14Eter Limited",
};

export default async function AboutPage() {
  const [content, home] = await Promise.all([
    getPageContent("about"),
    getPageContent("home"),
  ]);

  return (
    <>
      <Preloader />
      <main className="min-h-screen">
        <SiteHeader />
        <PageHero c={content.pageHero as PageHeroContent} />
        <Story c={content.story as StoryContent} />
        <Values c={content.values as ValuesContent} />
        <CtaBanner c={content.ctaBanner as CtaBannerContent} />
        <Footer c={home.footer as FooterContent} />
      </main>
    </>
  );
}
