import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import { CursorRefGuard } from "@/components/cursor-ref-guard";
import { LocaleProvider } from "@/components/locale-provider";
import { catalog } from "@/lib/i18n/catalog";
import { getLocale } from "@/lib/i18n/locale";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { site } = catalog(await getLocale());
  return {
    title: site.name,
    description: site.description,
    other: {
      "fo-verify": "a7b03f82-d2c6-4ef3-bab6-aedeca8fdaef",
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${oswald.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans text-foreground">
        <CursorRefGuard />
        <LocaleProvider locale={locale}>
          <div className="site-lock">{children}</div>
        </LocaleProvider>
      </body>
    </html>
  );
}
