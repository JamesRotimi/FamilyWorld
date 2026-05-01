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
          (i.notes ?? "").toLowerCase().includes(q),
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
    <section
      aria-label="Find items"
      className="relative z-[6] flex flex-wrap items-center gap-3.5 px-7 pb-3.5 max-md:px-4 max-md:pb-3"
    >
      <div ref={wrapRef} className="relative min-w-[220px] max-w-[440px] flex-1">
        <span
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-ink-mute"
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
          className="w-full rounded-full border border-line bg-surface py-2.5 pl-[42px] pr-4 text-sm font-medium text-ink outline-none transition placeholder:font-medium placeholder:text-ink-mute focus:border-primary-soft focus:bg-white focus:shadow-[0_0_0_4px_rgba(224,122,79,0.12)]"
        />

        {open && query.trim() && (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 max-h-80 overflow-y-auto rounded-2xl border border-line bg-surface p-1.5 shadow-pop">
            {matches.length === 0 ? (
              <div className="p-3.5 text-center text-[13px] text-ink-soft">
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
                    <span className="text-sm font-semibold text-ink">{m.name}</span>
                    <span className="text-[11px] font-medium text-ink-soft">
                      {m.type}
                      {m.status === "coming-soon" && " · Coming soon"}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 basis-[240px] items-center gap-2.5">
        <span className="flex-none text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-mute">
          Recent
        </span>
        <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto py-0.5">
          {recentItem && (
            <button
              type="button"
              onClick={() => onSelect(recentItem.id)}
              className="flex flex-none items-center gap-2.5 rounded-full border border-line bg-surface py-1.5 pl-1.5 pr-3.5 transition hover:-translate-y-0.5 hover:border-primary-soft hover:bg-white"
            >
              <span className="flex h-7 w-7 flex-none items-center justify-center rounded-[9px] border border-line bg-surface-soft text-base">
                {recentItem.glyph}
              </span>
              <span className="flex flex-col text-left leading-tight">
                <span className="text-[13px] font-semibold text-ink">
                  {recentItem.name}
                </span>
                <span className="mt-px text-[11px] font-medium text-ink-soft">
                  {reminderSummary(recentItem)}
                </span>
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
