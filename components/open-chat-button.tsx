"use client";

export function OpenChatButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("titan-open-chat"))}
      className="mt-6 inline-flex bg-accent px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink hover:bg-[#e0b400]"
    >
      {label}
    </button>
  );
}
