"use client";

import type { FamilyItem } from "@/data/familyWorldMock";
import SearchAndRecent from "./SearchAndRecent";

type Props = {
  items: FamilyItem[];
  recentItem: FamilyItem | undefined;
  onSelect: (id: string) => void;
};

/**
 * Editorial info panel that sits beside the world. Reads like a printed
 * legend / guidebook page — title, search, recent, "what's inside" key, and
 * a tip — wrapped in a tactile card with corner ornaments.
 */
export default function InfoPanel({ items, recentItem, onSelect }: Props) {
  const active = items.filter((i) => i.status === "active");
  const inactive = items.filter((i) => i.status === "coming-soon");

  return (
    <aside className="info-panel relative flex flex-col gap-5 rounded-3xl border border-line bg-surface/70 p-6 shadow-soft backdrop-blur-[2px] lg:w-[320px] lg:flex-none">
      <CornerOrnaments />

      <header className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-mute">
          The bike demo · v1
        </span>
        <h2 className="font-display text-[22px] font-semibold leading-[1.1] tracking-[-0.015em] text-ink">
          A guide to this little world
        </h2>
        <p className="text-[12.5px] font-medium leading-relaxed text-ink-soft">
          FamilyWorld is a living home for receipts, warranties and reminders.
          Tap any object to explore.
        </p>
      </header>

      <Divider label="Find" />

      <SearchAndRecent items={items} recentItem={recentItem} onSelect={onSelect} />

      <Divider label="Inside" />

      <ul className="flex flex-col gap-2">
        {active.map((item) => (
          <LegendRow
            key={item.id}
            item={item}
            badge={<ActiveBadge />}
            onSelect={onSelect}
          />
        ))}
        {inactive.map((item) => (
          <LegendRow
            key={item.id}
            item={item}
            badge={<SoonBadge />}
            onSelect={onSelect}
            muted
          />
        ))}
      </ul>

      <Divider label="Tip" />

      <p className="text-[12.5px] font-medium leading-relaxed text-ink-soft">
        Tap an object to see receipts, reminders and warranty details. Inactive
        zones preview features coming next.
      </p>

      <p className="mt-2 text-center text-[10.5px] font-medium tracking-[0.06em] text-ink-mute">
        Mock V1 prototype
      </p>
    </aside>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
        {label}
      </span>
      <span aria-hidden className="h-px flex-1 bg-line" />
    </div>
  );
}

function LegendRow({
  item,
  badge,
  onSelect,
  muted = false,
}: {
  item: FamilyItem;
  badge: React.ReactNode;
  onSelect: (id: string) => void;
  muted?: boolean;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(item.id)}
        className={`flex w-full items-center gap-3 rounded-xl border border-transparent px-2 py-1.5 text-left transition hover:border-line hover:bg-white ${
          muted ? "" : ""
        }`}
      >
        <span
          aria-hidden
          className={`flex h-7 w-7 flex-none items-center justify-center rounded-lg border border-line text-base ${
            muted
              ? "bg-surface-soft saturate-[0.35] opacity-70"
              : "bg-gradient-to-b from-white to-surface"
          }`}
        >
          {item.glyph}
        </span>
        <span className="flex min-w-0 flex-1 flex-col leading-tight">
          <span
            className={`truncate text-[13px] ${
              muted ? "font-medium text-ink-soft" : "font-semibold text-ink"
            }`}
          >
            {item.name}
          </span>
          {muted && item.preview && (
            <span className="truncate text-[10.5px] font-medium text-ink-mute">
              {item.preview}
            </span>
          )}
          {!muted && item.reminder && (
            <span className="truncate text-[10.5px] font-medium text-ink-soft">
              {item.reminder.text} · {item.reminder.when}
            </span>
          )}
        </span>
        {badge}
      </button>
    </li>
  );
}

function ActiveBadge() {
  return (
    <span className="flex flex-none items-center gap-1 rounded-full bg-primary/12 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-primary">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary" />
      Live
    </span>
  );
}

function SoonBadge() {
  return (
    <span className="flex-none rounded-full bg-line px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-mute">
      Soon
    </span>
  );
}

function CornerOrnaments() {
  return (
    <>
      {(["top-3 left-3", "top-3 right-3", "bottom-3 left-3", "bottom-3 right-3"] as const).map(
        (pos) => (
          <span
            key={pos}
            aria-hidden
            className={`pointer-events-none absolute ${pos} text-ink-mute/60`}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 0V10M0 5H10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            </svg>
          </span>
        ),
      )}
    </>
  );
}
