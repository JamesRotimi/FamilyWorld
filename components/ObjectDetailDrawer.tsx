"use client";

import { useEffect } from "react";
import type { FamilyItem } from "@/data/familyWorldMock";

type Props = {
  item: FamilyItem | null;
  open: boolean;
  onClose: () => void;
  onAddReminder: () => void;
  onViewReceipt: () => void;
  onRemove: (id: string) => void;
};

export default function ObjectDetailDrawer({
  item,
  open,
  onClose,
  onAddReminder,
  onViewReceipt,
  onRemove,
}: Props) {
  // Lock body scroll on mobile when the bottom sheet is open
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (open && window.matchMedia("(max-width: 720px)").matches) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  // Keep panel mounted so transitions run; render an empty body when closed.
  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={`fixed inset-0 z-[19] bg-[rgba(40,25,10,0.28)] transition-opacity duration-200 max-md:block md:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        aria-hidden={!open}
        className={`fixed z-20 flex flex-col overflow-hidden border border-line bg-surface shadow-pop transition-transform duration-300 ease-out
          right-6 top-6 bottom-6 w-[400px] rounded-3xl
          max-md:left-0 max-md:right-0 max-md:bottom-0 max-md:top-auto max-md:w-full max-md:max-h-[86vh] max-md:rounded-t-3xl max-md:rounded-b-none max-md:pt-3.5
          ${open ? "translate-x-0 max-md:translate-y-0" : "translate-x-[460px] max-md:translate-x-0 max-md:translate-y-[105%]"}`}
      >
        {/* Mobile drag handle */}
        <span
          aria-hidden
          className="mx-auto mb-2 hidden h-[5px] w-11 flex-none rounded-full bg-[rgba(50,35,20,0.18)] max-md:block"
        />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3.5 top-3.5 z-[2] flex h-[30px] w-[30px] items-center justify-center rounded-full border border-line bg-surface-soft text-xs text-ink-soft transition hover:bg-white hover:text-ink"
        >
          ✕
        </button>

        <div className="flex-1 overflow-y-auto px-6 pb-7 pt-7 max-md:px-5 max-md:pt-3.5">
          {item && (
            <DrawerBody
              item={item}
              onAddReminder={onAddReminder}
              onViewReceipt={onViewReceipt}
              onRemove={onRemove}
            />
          )}
        </div>
      </aside>
    </>
  );
}

function DrawerBody({
  item,
  onAddReminder,
  onViewReceipt,
  onRemove,
}: {
  item: FamilyItem;
  onAddReminder: () => void;
  onViewReceipt: () => void;
  onRemove: (id: string) => void;
}) {
  const detailRows = [
    { k: "Category", v: item.type },
    item.colour ? { k: "Colour", v: item.colour } : null,
    item.receiptStatus ? { k: "Receipt", v: item.receiptStatus } : null,
  ].filter((r): r is { k: string; v: string } => Boolean(r));

  return (
    <>
      <div className="mb-1.5 flex items-center gap-3.5">
        <div className="flex h-[60px] w-[60px] flex-none items-center justify-center rounded-2xl border border-line bg-surface text-3xl shadow-glyph">
          {item.glyph}
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-mute">
            {item.type} · {zoneLabel(item.zone)}
          </div>
          <h3 className="mt-0.5 font-display text-[22px] font-semibold tracking-[-0.015em] text-ink">
            {item.name}
          </h3>
        </div>
      </div>

      {(item.purchaseDate || item.purchasedFrom || item.price) && (
        <Section title="Purchase">
          <div className="grid grid-cols-2 gap-x-3.5 gap-y-2.5">
            {item.purchaseDate && <Kv k="When" v={item.purchaseDate} />}
            {item.purchasedFrom && <Kv k="From" v={item.purchasedFrom} />}
            {item.price && <Kv k="Price" v={item.price} />}
          </div>
        </Section>
      )}

      {detailRows.length > 0 && (
        <Section title="Details">
          <div className="grid grid-cols-2 gap-x-3.5 gap-y-2.5">
            {detailRows.map((r) => (
              <Kv key={r.k} k={r.k} v={r.v} />
            ))}
          </div>
        </Section>
      )}

      {item.warranty && (
        <Section title="Warranty">
          <div className="rounded-xl border border-line-soft bg-surface-soft p-3">
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-mute">
              Ends
            </div>
            <div className="mt-0.5 text-sm font-semibold text-ink">{item.warranty.ends}</div>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[rgba(50,35,20,0.06)]">
              <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-[#8aab86] via-[#d6b76a] to-primary" />
            </div>
            <div className="mt-1.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-mute">
              {item.warranty.remainingText}
            </div>
          </div>
        </Section>
      )}

      <Section title="Reminders">
        {item.reminder ? (
          <div className="mb-2 flex items-start gap-3 rounded-xl border border-line-soft bg-surface-soft p-3">
            <div
              className={`flex h-7 w-7 flex-none items-center justify-center rounded-lg text-sm font-bold ${
                item.reminder.urgent
                  ? "bg-primary/20 text-primary"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {item.reminder.urgent ? "!" : "•"}
            </div>
            <div>
              <div className="text-[13px] font-medium text-ink">{item.reminder.text}</div>
              <div className="mt-0.5 text-[11px] font-medium text-ink-soft">
                {item.reminder.when}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-line-soft bg-surface-soft p-3 text-[13px] font-medium text-ink-soft">
            No reminders. FamilyWorld will nudge you when something&apos;s due.
          </div>
        )}
      </Section>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onAddReminder}
          className="inline-flex flex-1 basis-[140px] items-center justify-center gap-2 rounded-full bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-primary transition hover:-translate-y-0.5"
        >
          <span aria-hidden>+</span> Add reminder
        </button>
        {item.receiptStatus && (
          <button
            type="button"
            onClick={onViewReceipt}
            className="inline-flex flex-1 basis-[140px] items-center justify-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2.5 text-sm font-semibold text-ink transition hover:border-ink-mute hover:bg-white"
          >
            <span aria-hidden>⌕</span> View receipt
          </button>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-line/60 pt-3.5">
        <span className="truncate text-[12px] font-medium text-ink-mute">
          {item.notes ?? "Mock data for prototype only."}
        </span>
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="flex-none rounded-full px-2.5 py-1 text-[11.5px] font-semibold text-ink-soft transition hover:bg-primary/10 hover:text-primary"
        >
          Remove
        </button>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5 border-t border-line-soft pt-4">
      <h4 className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-mute">
        {title}
      </h4>
      {children}
    </section>
  );
}

function Kv({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl border border-line-soft bg-surface-soft p-3">
      <div className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-mute">
        {k}
      </div>
      <div className="mt-0.5 text-sm font-semibold text-ink">{v}</div>
    </div>
  );
}

function zoneLabel(id: string) {
  return (
    {
      home: "Home",
      child: "Child Zone",
      docs: "Documents",
      outdoor: "Outdoor",
    } as Record<string, string>
  )[id] ?? id;
}
