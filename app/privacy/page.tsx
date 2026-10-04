import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy policy · Titan Safety Co.",
  description:
    "How Titan Safety Co. handles account details, contact messages, and the cookie choice stored in your browser.",
};

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Policies" title="Privacy policy">
      <LegalSection title="What this covers">
        <p>
          This policy describes the information the Titan Safety Co. website
          keeps. It covers accounts, contact messages, the sign-in session, and
          the cookie notice.
        </p>
      </LegalSection>
      <LegalSection title="Information you give us">
        <p>
          If you create an account, we keep your name, email, and a scrambled
          version of your password. We do not keep the password itself.
        </p>
        <p>
          If you use the contact form, we keep your name, email, the subject
          you chose, and your message, along with the time it was sent. A
          signed-in person can read those messages in the admin view.
        </p>
        <p>
          If you use the chat, we keep your name, email, and message, along
          with the time it was sent. Those notes are read in the same admin
          view. A signed-in chat uses the name and email on your account.
        </p>
        <p>
          If you use the affiliate onboarding form, we keep your name, email,
          the programs you chose, any note, and the time it was sent. A
          signed-in person can read those forms in the admin view.
        </p>
        <p>
          Insurance is one of those programs. If you ask about auto, home,
          renters, life, health, or business coverage, we keep the same kind of
          note: your name, email, the program you chose, any message, and the
          time it was sent. We are not the insurer. We do not use that note to
          issue a policy, and we do not sell it.
        </p>
      </LegalSection>
      <LegalSection title="What stays in your browser">
        <p>
          The cookie notice saves your choice, Allow or Decline, in this
          browser so the notice does not keep appearing. That choice stays on
          your device. It is not sent to us.
        </p>
        <p>
          When you sign in, the site sets a session cookie so you stay signed
          in for 14 days. The cookie is marked so page scripts cannot read it.
          Signing out removes it.
        </p>
      </LegalSection>
      <LegalSection title="How we use it">
        <p>
          Account details are used to sign you in. Contact messages and chat
          notes are used so the team can read what you sent. We do not sell
          personal information,
          and this site does not run third-party advertising or analytics.
        </p>
      </LegalSection>
      <LegalSection title="How to reach us">
        <p>
          Questions about this policy can go through the{" "}
          <Link href="/#contact" className="underline">
            contact form
          </Link>
          . The{" "}
          <Link href="/terms" className="underline">
            terms of service
          </Link>{" "}
          cover use of the site.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
