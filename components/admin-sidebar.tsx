import Image from "next/image";
import Link from "next/link";
import { signOut } from "@/app/login/actions";
import { site } from "@/lib/site";

const links = [
  { href: "#overview", label: "Overview" },
  { href: "#programs", label: "Programs" },
  { href: "#onboarding", label: "Onboarding" },
  { href: "#messages", label: "Messages" },
  { href: "#chat", label: "Chat" },
  { href: "#inquiries", label: "Inquiries" },
  { href: "#campaigns", label: "Campaigns" },
] as const;

export function AdminSidebar() {
  return (
    <aside className="flex flex-col border-b border-line bg-white lg:sticky lg:top-0 lg:h-svh lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
      <div className="px-6 py-5">
        <Link href="/admin" className="inline-flex">
          <Image
            src="/logo-mark.png"
            alt={site.name}
            width={763}
            height={247}
            priority
            className="h-11 w-auto"
          />
        </Link>
        <p className="mt-4 font-display text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          Team view
        </p>
      </div>
      <nav
        aria-label="Dashboard"
        className="flex gap-1 overflow-x-auto px-3 pb-4 lg:flex-1 lg:flex-col lg:overflow-visible"
      >
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="shrink-0 px-3 py-2 font-display text-[13px] font-semibold uppercase tracking-[0.12em] text-foreground transition-colors hover:bg-canvas hover:text-accent"
          >
            {link.label}
          </a>
        ))}
      </nav>
      <div className="flex gap-4 border-t border-line px-6 py-4 lg:flex-col lg:gap-3">
        <Link
          href="/"
          className="font-display text-[13px] font-semibold uppercase tracking-[0.12em] text-muted transition-colors hover:text-foreground"
        >
          View site
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="font-display text-[13px] font-semibold uppercase tracking-[0.12em] text-foreground transition-colors hover:text-accent"
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
