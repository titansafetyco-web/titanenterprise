import { About } from "@/components/about";
import { Approach } from "@/components/approach";
import { ChatBubble } from "@/components/chat-bubble";
import { Contact } from "@/components/contact";
import { CookiePrompt } from "@/components/cookie-prompt";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { DashboardPreview } from "@/components/dashboard-preview";
import { Hero } from "@/components/hero";
import { HowTitanWorks } from "@/components/how-titan-works";
import { Offerings } from "@/components/offerings";
import { OpportunityPreview } from "@/components/opportunity-preview";
import { Standards } from "@/components/standards";
import { Technology } from "@/components/technology";
import { Testimonials } from "@/components/testimonials";
import { getCurrentUser } from "@/lib/auth";
import { supportIsOnline } from "@/lib/maintenance";
import { site } from "@/lib/site";

function within<T>(work: Promise<T>, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(fallback), 2000);
    work.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        clearTimeout(timer);
        resolve(fallback);
      },
    );
  });
}

export default async function Home() {
  const [account, online] = await Promise.all([
    within(getCurrentUser(), null),
    within(supportIsOnline(), false),
  ]);

  return (
    <>
      <SiteHeader />
      <main id="top">
        <Hero />
        <HowTitanWorks />
        <OpportunityPreview />
        <Testimonials />
        <About />
        <Offerings />
        <Approach />
        <Standards />
        <DashboardPreview />
        <Technology />
        <Contact />
      </main>
      <Footer name={site.name} />
      <CookiePrompt />
      <ChatBubble
        online={online}
        account={
          account ? { name: account.name, email: account.email } : null
        }
      />
    </>
  );
}
