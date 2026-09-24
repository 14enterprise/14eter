import Preloader from "@/components/Preloader";
import SiteHeader from "@/components/SiteHeader";
import PageHero from "@/components/PageHero";
import ContactDetails from "@/components/ContactDetails";
import Footer from "@/components/Footer";
import { getPageContent } from "@/lib/get-content";
import type {
  ContactFormContent,
  ContactInfoContent,
  FooterContent,
  PageHeroContent,
} from "@/lib/content-defaults";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Contact | 14Eter Limited",
};

export default async function ContactPage() {
  const [content, home] = await Promise.all([
    getPageContent("contact"),
    getPageContent("home"),
  ]);

  return (
    <>
      <Preloader />
      <main className="min-h-screen">
        <SiteHeader />
        <PageHero c={content.pageHero as PageHeroContent} />
        <ContactDetails
          info={content.contactInfo as ContactInfoContent}
          form={content.contactForm as ContactFormContent}
        />
        <Footer c={home.footer as FooterContent} />
      </main>
    </>
  );
}
