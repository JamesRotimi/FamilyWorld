"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FamilyItem } from "@/data/familyWorldMock";

type Props = {
  items: FamilyItem[];
  recentItem: FamilyItem | undefined;
  onSelect: (id: string) => void;
};

function reminderSummary(item: FamilyItem): string {
  if (item.reminder) {
    const text = item.reminder.text;
    const short = text.length > 36 ? text.slice(0, 33) + "…" : text;
    return `${short} · ${item.reminder.when}`;
  }
  if (item.warranty) return `Warranty ${item.warranty.ends}`;
  return item.type;
}

/**
 * Stacks vertically — designed to live inside the editorial info panel.
 * Search dropdown stays absolutely positioned to overlap whatever sits below.
 */
export default function SearchAndRecent({ items, recentItem, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return items
      .filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.type.toLowerCase().includes(q) ||
          (i.notes ?? "").toLowerCase().includes(q) ||
          (i.preview ?? "").toLowerCase().includes(q),
      )
      .slice(0, 6);
  }, [items, query]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <div className="flex flex-col gap-3.5">
      <div ref={wrapRef} className="relative">
        <span
          aria-hidden
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base text-ink-mute"
        >
          ⌕
        </span>
        <input
          type="search"
          value={query}
          autoComplete="off"
          aria-label="Search family items"
          placeholder="Search family items…"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => query.trim() && setOpen(true)}
          className="w-full rounded-full border border-line bg-white py-2.5 pl-10 pr-3.5 text-[13.5px] font-medium text-ink outline-none transition placeholder:font-medium placeholder:text-ink-mute focus:border-primary-soft focus:shadow-[0_0_0_4px_rgba(224,122,79,0.12)]"
        />

        {open && query.trim() && (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 max-h-72 overflow-y-auto rounded-2xl border border-line bg-surface p-1.5 shadow-pop">
            {matches.length === 0 ? (
              <div className="p-3 text-center text-[13px] text-ink-soft">
                No items match &ldquo;{query}&rdquo;.
              </div>
            ) : (
              matches.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                    onSelect(m.id);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition hover:bg-surface-soft"
                >
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg border border-line bg-surface-soft text-lg">
                    {m.glyph}
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-[13.5px] font-semibold text-ink">{m.name}</span>
                    <span className="text-[11px] font-medium text-ink-soft">
                      {m.type}
                      {m.status === "coming-soon" && " · soon"}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {recentItem && (
        <div className="flex items-center gap-2.5">
          <span className="flex-none text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-mute">
            Recent
          </span>
          <button
            type="button"
            onClick={() => onSelect(recentItem.id)}
            className="flex min-w-0 flex-1 items-center gap-2.5 rounded-full border border-line bg-white py-1.5 pl-1.5 pr-3 transition hover:-translate-y-0.5 hover:border-primary-soft"
          >
            <span className="flex h-7 w-7 flex-none items-center justify-center rounded-[9px] border border-line bg-surface-soft text-base">
              {recentItem.glyph}
            </span>
            <span className="flex min-w-0 flex-col text-left leading-tight">
              <span className="truncate text-[12.5px] font-semibold text-ink">
                {recentItem.name}
              </span>
              <span className="mt-px truncate text-[10.5px] font-medium text-ink-soft">
                {reminderSummary(recentItem)}
              </span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
