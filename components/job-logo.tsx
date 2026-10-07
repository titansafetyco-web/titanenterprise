import Image from "next/image";
import { avatarUrl } from "@/lib/avatar";

export function JobLogo({ path, alt, large = false }: { path: string; alt: string; large?: boolean }) {
  if (!path) return null;
  return (
    <span
      className={`relative inline-flex shrink-0 overflow-hidden rounded-md border border-[#d9c79a] bg-white ${large ? "h-20 w-20" : "h-12 w-12"}`}
    >
      <Image src={avatarUrl(path)} alt={alt} fill sizes={large ? "80px" : "48px"} className="object-contain p-1" />
    </span>
  );
}
