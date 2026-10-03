import { signOut } from "@/app/login/actions";
import { Header } from "@/components/header";
import { getCurrentUser } from "@/lib/auth";
import { site } from "@/lib/site";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <Header
      name={site.name}
      links={site.nav}
      account={user ? { name: user.name } : null}
      signOut={signOut}
    />
  );
}
