import Preloader from "@/components/Preloader";
import SiteHeader from "@/components/SiteHeader";
import Hero from "@/components/Hero";
import Model from "@/components/Model";
import Process from "@/components/Process";
import Partners from "@/components/Partners";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { getPageContent } from "@/lib/get-content";
import type {
  ContactContent,
  FooterContent,
  HeroContent,
  ModelContent,
  PartnersContent,
  ProcessContent,
} from "@/lib/content-defaults";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await getPageContent("home");

  return (
    <>
      <Preloader />
      <main className="min-h-screen">
        <SiteHeader />
        <Hero c={content.hero as HeroContent} />
        <Model c={content.model as ModelContent} />
        <Process c={content.process as ProcessContent} />
        <Partners c={content.partners as PartnersContent} />
        <Contact c={content.contact as ContactContent} />
        <Footer c={content.footer as FooterContent} />
      </main>
    </>
  );
}
