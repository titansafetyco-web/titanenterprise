import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal-page";
import type { LegalBlock, LegalDoc } from "@/lib/i18n/legal";

function Block({ block }: { block: LegalBlock }) {
  if (typeof block === "string") return <p>{block}</p>;

  if ("items" in block) {
    return (
      <ul className="list-disc space-y-2 pl-5">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }

  if ("href2" in block) {
    return (
      <p>
        {block.before}
        <Link href={block.href} className="underline">
          {block.label}
        </Link>
        {block.middle}
        <Link href={block.href2} className="underline">
          {block.label2}
        </Link>
        {block.after}
      </p>
    );
  }

  return (
    <p>
      {block.before}
      <Link href={block.href} className="underline">
        {block.label}
      </Link>
      {block.after}
    </p>
  );
}

export function LegalDocument({ doc }: { doc: LegalDoc }) {
  return (
    <LegalPage eyebrow={doc.eyebrow} title={doc.title}>
      {doc.sections.map((section) => (
        <LegalSection key={section.title} title={section.title}>
          {section.blocks.map((block, index) => (
            <Block key={index} block={block} />
          ))}
        </LegalSection>
      ))}
    </LegalPage>
  );
}
