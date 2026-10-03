import { About } from "@/components/about";
import { Approach } from "@/components/approach";
import { ChatBubble } from "@/components/chat-bubble";
import { Contact } from "@/components/contact";
import { CookiePrompt } from "@/components/cookie-prompt";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { Offerings } from "@/components/offerings";
import { Standards } from "@/components/standards";
import { Technology } from "@/components/technology";
import { getCurrentUser } from "@/lib/auth";
import { site } from "@/lib/site";

export default async function Home() {
  const account = await getCurrentUser();

  return (
    <>
      <SiteHeader />
      <main id="top">
        <Hero />
        <About />
        <Offerings />
        <Approach />
        <Standards />
        <Technology />
        <Contact />
      </main>
      <Footer name={site.name} />
      <CookiePrompt />
      <ChatBubble
        account={
          account ? { name: account.name, email: account.email } : null
        }
      />
    </>
  );
}
