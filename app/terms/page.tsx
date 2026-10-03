import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms of service · Titan Safety Co.",
  description:
    "Terms for using the Titan Safety Co. website, accounts, and contact form.",
};

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Policies" title="Terms of service">
      <LegalSection title="The site">
        <p>
          These terms cover the Titan Safety Co. website. By using the site,
          you agree to them. If you do not agree, please leave the site.
        </p>
      </LegalSection>
      <LegalSection title="What we do">
        <p>
          Titan Safety Co. connects people with essential products and services
          and helps partners turn that demand into business. Through affiliate
          and referral programs, we identify prospective customers, introduce
          relevant offers, and guide interested applicants through signup and
          onboarding.
        </p>
        <p>
          We earn commissions for qualified leads, approved applications,
          enrollments, or completed sales, depending on each partner’s program.
          A page on this site describes that work. It is not a promise that a
          particular application, enrollment, or sale will be approved.
        </p>
      </LegalSection>
      <LegalSection title="Accounts">
        <p>
          You may create an account with your name, email, and a password. You
          are responsible for keeping that password private and for activity
          under your account. A signed-in account can open the admin view.
        </p>
      </LegalSection>
      <LegalSection title="Messages">
        <p>
          The contact form sends a note to the team: your name, email, subject,
          and message. The chat sends a note the same way, with your name,
          email, and message. The affiliate onboarding form sends your name,
          email, the programs you chose, and any note. Send only information
          you are willing for the team to read. We may not reply to every note.
        </p>
      </LegalSection>
      <LegalSection title="Use of the site">
        <p>
          Use the site for its stated purpose. Do not attempt to break it,
          misuse an account, or send a message that is unlawful or misleading.
          We may refuse a message or close an account that is used that way.
        </p>
      </LegalSection>
      <LegalSection title="Changes">
        <p>
          We may update these terms as the site changes. The date at the top of
          this page is the latest version. The{" "}
          <Link href="/privacy" className="underline">
            privacy policy
          </Link>{" "}
          explains what information the site keeps.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
