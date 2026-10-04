import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Affiliate policy · Titan Safety Co.",
  description:
    "How Titan Safety Co. works through affiliate and referral programs, including commissions, onboarding, and the standards for consent, lead quality, and follow-through.",
};

export default function AffiliatePolicyPage() {
  return (
    <LegalPage eyebrow="Policies" title="Affiliate policy">
      <LegalSection title="What this covers">
        <p>
          This policy describes how Titan Safety Co. works through affiliate
          and referral programs. It covers the programs listed on this site,
          the onboarding form, and how a commission is earned.
        </p>
      </LegalSection>
      <LegalSection title="How a program works">
        <p>
          Through affiliate and referral programs, we identify prospective
          customers, introduce relevant offers, and guide interested applicants
          through signup and onboarding. The programs you can choose are the
          ones currently listed on the{" "}
          <Link href="/affiliate" className="underline">
            affiliate programs
          </Link>{" "}
          page. The team adds and removes those names.
        </p>
        <p>
          Sending the onboarding form tells the team which program you chose.
          It does not, by itself, approve an application, complete an
          enrollment, or finish a sale.
        </p>
      </LegalSection>
      <LegalSection title="Insurance">
        <p>
          Insurance affiliates are part of this work. We introduce offers for
          auto, home, renters, life, health, and business coverage, then guide
          interested applicants through signup and onboarding.
        </p>
        <p>
          We are not the insurer. Coverage, eligibility, and price are set by
          each partner’s program. Choosing Insurance on the onboarding form, or
          reading about it on this site, is not a quote and is not a promise
          that coverage will be offered or approved.
        </p>
      </LegalSection>
      <LegalSection title="Commissions">
        <p>
          Our business earns commissions for qualified leads, approved
          applications, enrollments, or completed sales, depending on each
          partner’s program. What counts, and what is paid, is set by that
          program.
        </p>
        <p>
          A description on this site is not a promise that a particular
          application, enrollment, or sale will be approved, or that a
          commission will be paid.
        </p>
      </LegalSection>
      <LegalSection title="How we work">
        <p>
          Consent, lead quality, and reliable follow-through are central to how
          we work. People hear a clear offer and choose whether to continue.
          Inquiries are matched to partner requirements before they move
          forward. We stay with the process until the next step is done.
        </p>
      </LegalSection>
      <LegalSection title="What the form keeps">
        <p>
          The onboarding form keeps your name, email, the programs you chose,
          any note, and the time it was sent. A signed-in person can read those
          forms in the admin view. The{" "}
          <Link href="/privacy" className="underline">
            privacy policy
          </Link>{" "}
          describes that information. The{" "}
          <Link href="/terms" className="underline">
            terms of service
          </Link>{" "}
          cover use of the site.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
