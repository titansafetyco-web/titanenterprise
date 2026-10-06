import Image from "next/image";
import Link from "next/link";
import { signOut } from "@/app/login/actions";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";

export async function AdminSidebar() {
  const t = ui(await getLocale());
  const links = [
    { href: "/admin#overview", label: t.overview },
    { href: "/admin#accounts", label: t.accounts },
    { href: "/admin#programs", label: t.programs },
    { href: "/admin#onboarding", label: t.onboarding },
    { href: "/admin#messages", label: t.messages },
    { href: "/admin#chat", label: t.chat },
    { href: "/admin#inquiries", label: t.inquiries },
    { href: "/admin#campaigns", label: t.campaigns },
    { href: "/admin/payouts", label: t.payoutsNav },
  ];

  return (
    <aside className="flex flex-col border-b border-line bg-white lg:sticky lg:top-0 lg:h-svh lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
      <div className="px-4 py-4 md:px-6 md:py-5">
        <Link href="/admin" className="inline-flex">
          <Image
            src="/logo-mark.png"
            alt="Titan Safety Co."
            width={763}
            height={247}
            priority
            className="h-11 w-auto"
          />
        </Link>
        <p className="mt-4 font-display text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          {t.dashboard}
        </p>
      </div>
      <nav
        aria-label={t.dashboard}
        className="grid grid-cols-2 gap-2 px-3 pb-4 sm:grid-cols-3 lg:flex lg:flex-1 lg:flex-col lg:gap-1 lg:overflow-visible"
      >
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="flex min-h-11 items-center border border-line px-3 py-2 font-display text-[12px] font-semibold uppercase tracking-[0.12em] text-foreground transition-colors hover:bg-canvas hover:text-accent lg:min-h-0 lg:border-0 lg:text-[13px]"
          >
            {link.label}
          </a>
        ))}
      </nav>
      <div className="flex flex-col gap-3 border-t border-line px-4 py-4 md:px-6 lg:gap-3">
        <Link
          href="/dashboard"
          className="font-display text-[13px] font-semibold uppercase tracking-[0.12em] text-muted transition-colors hover:text-foreground"
        >
          {t.dashboard}
        </Link>
        <Link
          href="/"
          className="font-display text-[13px] font-semibold uppercase tracking-[0.12em] text-muted transition-colors hover:text-foreground"
        >
          {t.viewSite}
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="font-display text-[13px] font-semibold uppercase tracking-[0.12em] text-foreground transition-colors hover:text-accent"
          >
            {t.signOut}
          </button>
        </form>
      </div>
    </aside>
  );
}
