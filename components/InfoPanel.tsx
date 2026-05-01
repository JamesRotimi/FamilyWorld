"use client";

import type { FamilyItem } from "@/data/familyWorldMock";
import SearchAndRecent from "./SearchAndRecent";

type Props = {
  items: FamilyItem[];
  recentItem: FamilyItem | undefined;
  onSelect: (id: string) => void;
  onScan: () => void;
};

/**
 * Editorial left column. Reads like a guidebook spread — title,
 * structured rows, hairline rules. Designed to feel integrated with the
 * scene to the right, not a floating card.
 */
export default function InfoPanel({ items, recentItem, onSelect, onScan }: Props) {
  const active = items.filter((i) => i.status === "active" && i.placed);
  const inactive = items.filter((i) => i.status === "coming-soon");
  const bike = items.find((i) => i.id === "bike-1");

  return (
    <aside className="relative flex w-full flex-col gap-6 border-ink-line/20 bg-transparent p-6 lg:w-[340px] lg:flex-none lg:border-r lg:px-7 lg:py-8">
      <header className="flex flex-col gap-2">
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-ink-mute">
          FamilyWorld · v1
        </span>
        <h2 className="font-display text-[26px] font-semibold leading-[1.05] tracking-[-0.02em] text-ink">
          General Entry into your FamilyWorld Home
        </h2>
        <p className="text-[12.5px] font-medium leading-relaxed text-ink-soft">
          A living guide to every receipt, warranty and reminder under your
          roof. Tap any object on the right to open its details.
        </p>
      </header>

      <SearchAndRecent items={items} recentItem={recentItem} onSelect={onSelect} />

      <Section heading="FamilyWorld overview">
        <KeyVal k="Items" v={`${active.length} active · ${inactive.length} preview`} />
        <KeyVal k="Receipts stored" v="1 of 1" />
        <KeyVal k="Warranties tracked" v="1 of 1" />
        <KeyVal k="Documents protected" v="0 — coming soon" muted />
      </Section>

      <Section heading="Active items">
        {active.map((item) => (
          <ItemRow key={item.id} item={item} onSelect={onSelect} />
        ))}
      </Section>

      <Section heading="Coming next">
        {inactive.map((item) => (
          <PreviewRow key={item.id} item={item} onSelect={onSelect} />
        ))}
      </Section>

      <Section heading="Reminders" tone="alert">
        {bike?.reminder && (
          <div className="flex items-start gap-2.5 rounded-md border border-primary/30 bg-primary/5 px-2.5 py-2">
            <span aria-hidden className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-primary" />
            <div>
              <div className="text-[12px] font-semibold tracking-[-0.005em] text-ink">
                {bike.reminder.text}
              </div>
              <div className="mt-0.5 text-[10.5px] font-medium text-ink-soft">
                {bike.name} · {bike.reminder.when}
              </div>
            </div>
          </div>
        )}
      </Section>

      <Section heading="Best next action">
        <button
          type="button"
          onClick={onScan}
          className="flex w-full items-center justify-between gap-3 rounded-md border border-ink-line/30 bg-surface px-3 py-2.5 text-left transition hover:border-primary-soft hover:bg-white"
        >
          <div className="min-w-0">
            <div className="text-[12.5px] font-semibold text-ink">
              Scan a receipt
            </div>
            <div className="mt-0.5 truncate text-[10.5px] font-medium text-ink-soft">
              Demo a mocked add flow for Noah&apos;s Bike
            </div>
          </div>
          <span aria-hidden className="text-[16px] leading-none text-primary">›</span>
        </button>
      </Section>

      <p className="mt-auto pt-4 text-[10.5px] font-medium tracking-[0.04em] text-ink-mute">
        Mock V1 prototype — no real data, no backend.
      </p>
    </aside>
  );
}

function Section({
  heading,
  children,
  tone = "default",
}: {
  heading: string;
  children: React.ReactNode;
  tone?: "default" | "alert";
}) {
  return (
    <section className="border-t border-ink-line/15 pt-4">
      <div className="mb-2 flex items-center gap-2">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-mute">
          {heading}
        </h3>
        {tone === "alert" && (
          <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
        )}
      </div>
      <div className="flex flex-col gap-1.5">{children}</div>
    </section>
  );
}

function KeyVal({ k, v, muted = false }: { k: string; v: string; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-dotted border-ink-line/40 pb-1 last:border-b-0">
      <span className="text-[11.5px] font-medium text-ink-soft">{k}</span>
      <span
        className={`text-[12px] tabular-nums ${muted ? "font-medium text-ink-mute" : "font-semibold text-ink"}`}
      >
        {v}
      </span>
    </div>
  );
}

function ItemRow({ item, onSelect }: { item: FamilyItem; onSelect: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      className="group flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left transition hover:bg-surface-soft"
    >
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">●</span>
      <span className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="text-[13px] font-semibold text-ink">{item.name}</span>
        <span className="truncate text-[10.5px] font-medium text-ink-soft">
          {item.reminder ? `Next · ${item.reminder.text}` : item.type}
        </span>
      </span>
      <span className="rounded-full bg-primary/12 px-1.5 py-px text-[9px] font-bold uppercase tracking-[0.1em] text-primary">
        live
      </span>
    </button>
  );
}

function PreviewRow({ item, onSelect }: { item: FamilyItem; onSelect: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      className="group flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left transition hover:bg-surface-soft"
    >
      <span className="text-[10px] text-ink-mute">○</span>
      <span className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="truncate text-[12.5px] font-medium text-ink-soft">
          {item.name}
        </span>
        <span className="truncate text-[10.5px] font-medium text-ink-mute">
          {item.preview}
        </span>
      </span>
      <span className="rounded-full bg-line px-1.5 py-px text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-mute">
        soon
      </span>
    </button>
  );
}
