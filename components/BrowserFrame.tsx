"use client";

type Props = {
  children: React.ReactNode;
};

/**
 * Outer "framed page" wrapper. Token-bound: surface, border, radius,
 * shadow all come from /design-tokens.json via Tailwind utilities.
 */
export default function BrowserFrame({ children }: Props) {
  return (
    <div className="page-surface min-h-screen px-4 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-[1380px] overflow-hidden rounded-frame border border-line bg-surface-frame shadow-frame">
        <div className="flex items-center gap-3 border-b border-line/70 bg-surface px-4 py-2.5 text-ui-small text-ink-soft lg:px-6">
          <div className="flex flex-none items-center gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full border border-line/60 bg-[#e57c69]" />
            <span className="h-2.5 w-2.5 rounded-full border border-line/60 bg-[#e6c46c]" />
            <span className="h-2.5 w-2.5 rounded-full border border-line/60 bg-[#9bb487]" />
          </div>
          <div className="flex min-w-0 flex-1 items-center justify-center">
            <span className="flex items-center gap-2 truncate rounded-full border border-line/70 bg-surface-frame px-3 py-1 text-ui-small tracking-tight text-ink-soft">
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
          <div className="hidden flex-none items-center gap-2 text-ui-micro font-semibold uppercase text-ink-soft sm:flex">
            <span>v1 prototype</span>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
