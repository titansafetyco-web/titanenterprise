import { signOut } from "@/app/login/actions";
import { Header } from "@/components/header";
import { getCurrentUser } from "@/lib/auth";
import { catalog } from "@/lib/i18n/catalog";
import { getLocale } from "@/lib/i18n/locale";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const { site } = catalog(await getLocale());

  return (
    <Header
      name={site.name}
      links={site.nav}
      account={user ? { name: user.name } : null}
      signOut={signOut}
    />
  );
}
