"use client";

import { useEffect, useState } from "react";

const avatarColors = ["#4285F4", "#EA4335", "#FBBC05", "#34A853"];

export type TestimonialNote = {
  quote: string;
  name: string;
  role: string;
  stars: number;
  photoUrl: string;
};

export function TestimonialRail({
  notes,
  starsLabel,
}: {
  notes: TestimonialNote[];
  starsLabel: string;
}) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const loop = reduceMotion ? notes : [...notes, ...notes];

  return (
    <div className="testimonial-rail mt-5 min-w-0 overflow-hidden md:mt-8">
      <ul className={`flex w-max gap-4 ${reduceMotion ? "" : "testimonial-marquee"}`}>
        {loop.map((note, index) => (
          <li
            key={`${note.name}-${index}`}
            className="w-80 shrink-0"
            aria-hidden={!reduceMotion && index >= notes.length}
          >
            <TestimonialCard
              note={note}
              starsLabel={starsLabel.replace("{count}", String(note.stars))}
              color={avatarColors[index % avatarColors.length]}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function TestimonialCard({
  note,
  starsLabel,
  color,
}: {
  note: TestimonialNote;
  starsLabel: string;
  color: string;
}) {
  return (
    <article className="flex h-full min-h-56 flex-col rounded-lg border border-[#dadce0] bg-white p-4 shadow-[0_1px_2px_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)]">
      <header className="flex items-start gap-3">
        {note.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={note.photoUrl} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
        ) : (
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-medium text-white"
            style={{ backgroundColor: color }}
            aria-hidden="true"
          >
            {note.name.slice(0, 1)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[#202124]">{note.name}</p>
          <p className="truncate text-xs text-[#5f6368]">{note.role}</p>
        </div>
        <GoogleMark />
      </header>
      <div className="mt-3 flex gap-0.5" aria-label={starsLabel}>
        {Array.from({ length: 5 }, (_, star) => (
          <Star key={star} filled={star < note.stars} />
        ))}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-[#3c4043]">{note.quote}</p>
    </article>
  );
}

function Star({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-4 w-4 ${filled ? "fill-[#FBBC04]" : "fill-[#dadce0]"}`} aria-hidden="true">
      <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.56-5.16 3.56-8.65z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.87-3A7.2 7.2 0 0 1 12 19.46a7.2 7.2 0 0 1-6.77-4.97H1.24v3.09A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.23 14.49A7.2 7.2 0 0 1 4.84 12c0-.86.15-1.7.39-2.49V6.42H1.24A12 12 0 0 0 0 12c0 1.94.46 3.77 1.24 5.42l3.99-2.93z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.77 0 3.36.61 4.61 1.8l3.46-3.46C17.95 1.14 15.24 0 12 0A12 12 0 0 0 1.24 6.42l3.99 3.09A7.2 7.2 0 0 1 12 4.77z"
      />
    </svg>
  );
}
