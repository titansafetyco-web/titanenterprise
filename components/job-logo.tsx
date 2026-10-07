import Image from "next/image";
import { avatarUrl } from "@/lib/avatar";

export function JobLogo({ path, alt }: { path: string; alt: string }) {
  if (!path) return null;
  return (
    <span className="relative inline-flex h-12 w-12 shrink-0 overflow-hidden rounded-md border border-[#d9c79a] bg-white">
      <Image src={avatarUrl(path)} alt={alt} fill sizes="48px" className="object-contain p-0.5" />
    </span>
  );
}
