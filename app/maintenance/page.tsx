import Image from "next/image";
import type { Metadata } from "next";
import { ChatBubble } from "@/components/chat-bubble";
import { Contact } from "@/components/contact";
import { LanguageToggle } from "@/components/language-toggle";
import { getCurrentUser } from "@/lib/auth";
import { supportIsOnline } from "@/lib/maintenance";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";

export async function generateMetadata(): Promise<Metadata> {
  return { title: `${ui(await getLocale()).maintenanceTitle} · Titan Safety Co.` };
}

export default async function MaintenancePage() {
  const [t, account, online] = await Promise.all([
    getLocale().then((locale) => ui(locale)),
    getCurrentUser(),
    supportIsOnline(),
  ]);

  return (
    <>
    <main className="min-h-svh bg-[#f6f0e4] text-foreground">
      <header className="border-b border-[#ead9b2] bg-[#fff8ee]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Image
            src="/logo-mark.png"
            alt="Titan Safety Co."
            width={763}
            height={247}
            priority
            className="h-14 w-auto"
          />
          <LanguageToggle />
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-6 pb-6 pt-10 md:pb-8 md:pt-16">
        <div className="grid overflow-hidden border border-[#ead9b2] bg-[#fff8ee] shadow-[0_20px_50px_rgba(90,60,10,0.08)] md:grid-cols-12">
          <div className="relative bg-[#3a2a14] px-6 py-10 text-white sm:px-10 sm:py-14 md:col-span-7">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-accent/25 blur-3xl"
            />
            <p className="relative font-display text-sm font-semibold uppercase tracking-[0.22em] text-accent">
              Titan Safety Co.
            </p>
            <h1 className="relative mt-4 font-display text-5xl font-bold uppercase leading-[0.95] tracking-wide md:text-6xl">
              {t.maintenanceTitle}
            </h1>
            <p className="relative mt-5 max-w-md text-lg leading-relaxed text-[#f6f0e4]">
              {t.maintenanceBody}
            </p>
            <a
              href="#contact"
              className="relative mt-8 inline-block bg-accent px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink hover:bg-[#e0b400]"
            >
              {t.contact}
            </a>
          </div>
          <div className="flex flex-col justify-center bg-[radial-gradient(circle_at_top,#ffe7a3,transparent_58%)] px-6 py-10 sm:px-10 md:col-span-5">
            <span
              aria-hidden="true"
              className="grid size-16 place-items-center rounded-full border-4 border-accent bg-[#fff8ee] shadow-[0_0_0_8px_rgba(245,196,0,0.18)]"
            >
              <span className="size-5 rounded-full bg-accent" />
            </span>
            <p className="mt-6 font-display text-2xl font-bold uppercase leading-tight tracking-wide">
              {t.maintenanceReach}
            </p>
            <p className="mt-3 max-w-xs leading-relaxed text-[#6b5a3e]">{t.maintenanceOpen}</p>
          </div>
        </div>
      </section>
      <Contact warm />
    </main>
      <ChatBubble online={online} account={account ? { name: account.name, email: account.email } : null} />
    </>
  );
}
