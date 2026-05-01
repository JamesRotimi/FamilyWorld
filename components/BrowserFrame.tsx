"use client";

type Props = {
  children: React.ReactNode;
};

/**
 * Outer "framed page" wrapper. Gives the whole app the feel of an
 * illustrated guidebook page sitting on a soft cream surface, complete
 * with three small browser dots and a faux URL bar, plus a thin nav
 * row that establishes the page identity ("FamilyWorld · The Bike
 * Demo") so the panel + scene below feel like one printed spread
 * instead of a SaaS dashboard.
 */
export default function BrowserFrame({ children }: Props) {
  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-[1380px] overflow-hidden rounded-[28px] border border-ink-line/30 bg-surface shadow-[0_2px_4px_rgba(50,35,20,0.05),0_30px_60px_rgba(50,35,20,0.10)]">
        <div className="flex items-center gap-3 border-b border-ink-line/20 bg-surface-soft px-4 py-2.5 text-[11px] font-medium text-ink-mute lg:px-6">
          <div className="flex flex-none items-center gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full border border-ink-line/40 bg-[#e57c69]" />
            <span className="h-2.5 w-2.5 rounded-full border border-ink-line/40 bg-[#e6c46c]" />
            <span className="h-2.5 w-2.5 rounded-full border border-ink-line/40 bg-[#9bb487]" />
          </div>
          <div className="flex min-w-0 flex-1 items-center justify-center">
            <span className="flex items-center gap-2 truncate rounded-full border border-ink-line/20 bg-surface px-3 py-1 text-[11px] tracking-tight text-ink-soft">
              <svg width="11" height="11" viewBox="0 0 11 11" aria-hidden>
                <path
                  d="M2 5 L5.5 1.5 L9 5 L9 9 L7 9 L7 6 L4 6 L4 9 L2 9 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.9"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="truncate">familyworld.app · the-bike-demo</span>
            </span>
          </div>
          <div className="hidden flex-none items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-mute sm:flex">
            <span>v1 prototype</span>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
