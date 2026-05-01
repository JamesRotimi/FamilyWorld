"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  initialItems,
  findEmptyTileInZone,
  formatDate,
  addMonths,
  DEFAULT_RECENT_ID,
  type ConfirmForm,
  type FamilyItem,
} from "@/data/familyWorldMock";
import BrowserFrame from "./BrowserFrame";
import InfoPanel from "./InfoPanel";
import FamilyWorld from "./FamilyWorld";
import ObjectDetailDrawer from "./ObjectDetailDrawer";
import AddItemModal from "./AddItemModal";
import Toast from "./Toast";

const SEED_IDS = new Set(initialItems.map((i) => i.id));
const STORAGE_KEY = "familyworld:v1";

type Persisted = { items: FamilyItem[]; recentId: string };

export default function AppShell() {
  const [items, setItems] = useState<FamilyItem[]>(initialItems);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [recentId, setRecentId] = useState<string>(DEFAULT_RECENT_ID);
  const [modalOpen, setModalOpen] = useState(false);
  const [spawningId, setSpawningId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ signal: number; message: string }>({
    signal: 0,
    message: "",
  });
  /** Tracks whether we've finished hydrating from localStorage. We avoid
   *  writing to storage before this point so the first render doesn't
   *  overwrite an existing saved world. */
  const [hydrated, setHydrated] = useState(false);

  // Hydrate items + recentId from localStorage once on mount.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Persisted>;
        if (Array.isArray(parsed.items)) setItems(parsed.items);
        if (typeof parsed.recentId === "string") setRecentId(parsed.recentId);
      }
    } catch {
      /* ignore — fall back to seed defaults */
    }
    setHydrated(true);
  }, []);

  // Persist on change. Skipped until after hydration.
  useEffect(() => {
    if (!hydrated) return;
    try {
      const payload: Persisted = { items, recentId };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* ignore — quota / private mode */
    }
  }, [hydrated, items, recentId]);

  const selectedItem = useMemo(
    () => items.find((i) => i.id === selectedId) ?? null,
    [items, selectedId],
  );
  const recentItem = useMemo(
    () => items.find((i) => i.id === recentId),
    [items, recentId],
  );

  const showToast = useCallback((message: string) => {
    setToast({ signal: Date.now(), message });
  }, []);

  const handleSelect = useCallback(
    (id: string) => {
      const item = items.find((i) => i.id === id);
      if (!item) return;
      if (item.status === "coming-soon") {
        showToast(
          item.preview
            ? `Coming soon — ${item.preview}`
            : `${item.name} — coming soon`,
        );
        return;
      }
      setSelectedId(id);
      setRecentId(id);
    },
    [items, showToast],
  );

  /** Take the (possibly user-edited) confirmation form, place a new
   *  FamilyItem in the right zone, and open its drawer. */
  const handleConfirmAdd = useCallback(
    async (form: ConfirmForm) => {
      const purchase = parseISO(form.purchaseDateISO);
      const taken = items
        .filter((i) => i.placed && i.zone === form.zone)
        .map((i) => i.position);
      const pos = findEmptyTileInZone(form.zone, taken) ?? { x: 0, y: 0 };

      const id = "obj-" + randomSuffix();
      const newItem: FamilyItem = {
        id,
        name: form.name.trim() || "Untitled",
        type: form.category.trim() || "Item",
        zone: form.zone,
        status: "active",
        placed: true,
        position: pos,
        glyph: form.glyph,
        purchaseDate: formatDate(purchase),
        purchasedFrom: form.from || undefined,
        price: form.price || undefined,
        colour: form.colour || undefined,
        receiptStatus: form.receipt || undefined,
        serial: form.serial || undefined,
        warranty: form.warrantyYears
          ? {
              ends: formatDate(addMonths(purchase, form.warrantyYears * 12)),
              remainingText: `${form.warrantyYears * 12} months remaining`,
            }
          : undefined,
        reminder: form.reminder
          ? { text: form.reminder, when: deriveWhen(form.reminder) }
          : undefined,
        notes: form.notes ?? "Mock data for prototype only.",
      };

      setItems((prev) => [...prev, newItem]);

      // Behaviours from the spec, all on local state:
      //   1) item is added to React state above
      //   2) it's placed visually because placed:true + position is set
      //   3) Recent strip updates via setRecentId below
      //   4) it's clickable in the world (IsometricObject is a button)
      //   5) the detail drawer opens via setSelectedId below
      //   6) toast uses the item's actual name
      setSpawningId(newItem.id);
      setModalOpen(false);
      showToast(`${newItem.name} added to your world`);
      setTimeout(() => {
        setSpawningId(null);
        setSelectedId(newItem.id);
        setRecentId(newItem.id);
      }, 500);
    },
    [items, showToast],
  );

  /** Remove a placed item. Seeded items get unplaced (Reset can restore
   *  them); user-added items are deleted from state. */
  const handleRemove = useCallback(
    (id: string) => {
      const item = items.find((i) => i.id === id);
      if (!item) return;
      if (SEED_IDS.has(id)) {
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, placed: false } : i)),
        );
      } else {
        setItems((prev) => prev.filter((i) => i.id !== id));
      }
      setSelectedId(null);
      if (recentId === id) {
        // Pick another active item as recent, or fall back to the bike id.
        const fallback = items.find(
          (i) => i.id !== id && i.status === "active" && i.placed,
        );
        setRecentId(fallback?.id ?? DEFAULT_RECENT_ID);
      }
      showToast(`Removed from your world`);
    },
    [items, recentId, showToast],
  );

  const handleReset = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setItems(initialItems);
    setSelectedId(null);
    setRecentId(DEFAULT_RECENT_ID);
    setSpawningId(null);
    showToast("World reset");
  }, [showToast]);

  return (
    <BrowserFrame>
      <div className="flex items-center justify-between gap-4 border-b border-line/60 px-6 py-4 max-md:flex-wrap max-md:gap-2.5 max-md:px-4 lg:px-8">
        <div className="flex items-center gap-3.5">
          <BrandMark />
          <div>
            <h1 className="font-display text-[22px] font-semibold tracking-[-0.015em] text-ink">
              FamilyWorld
            </h1>
            <p className="mt-0.5 text-ui-small font-medium text-ink-soft max-[420px]:hidden">
              Receipts, warranties and reminders for everything your family owns.
            </p>
          </div>
        </div>

        <div className="flex flex-none items-center gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            title="Reset world"
            className="rounded-full border border-line bg-surface px-4 py-2 text-[13px] font-semibold text-ink-soft transition hover:border-ink-mute hover:bg-white hover:text-ink"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            title="Add to World"
            aria-label="Add to World"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-[16px] py-2 text-[13px] font-semibold text-white shadow-primary transition hover:-translate-y-0.5"
          >
            <span className="text-base font-semibold leading-none">+</span> Add to World
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-stretch">
        <InfoPanel
          items={items}
          recentItem={recentItem}
          onSelect={handleSelect}
          onScan={() => setModalOpen(true)}
        />
        <FamilyWorld
          items={items}
          selectedId={selectedId}
          spawningId={spawningId}
          onSelect={handleSelect}
        />
      </div>

      <ObjectDetailDrawer
        item={selectedItem}
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        onAddReminder={() => showToast("Reminder added (mock)")}
        onViewReceipt={() => showToast("Receipt preview is mocked for V1")}
        onRemove={handleRemove}
      />

      <AddItemModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onConfirm={handleConfirmAdd}
      />

      <Toast message={toast.message} signal={toast.signal || null} />
    </BrowserFrame>
  );
}

function BrandMark() {
  return (
    <div aria-hidden className="relative h-10 w-10 flex-none">
      <span
        className="absolute left-1/2 top-1 -translate-x-1/2"
        style={{
          width: 0,
          height: 0,
          borderLeft: "13px solid transparent",
          borderRight: "13px solid transparent",
          borderBottom: "13px solid #e8724a",
        }}
      />
      <span className="absolute bottom-1 left-1/2 h-[18px] w-5 -translate-x-1/2 rounded-md border-2 border-primary bg-surface">
        <span className="absolute bottom-0 left-1/2 h-[7px] w-1.5 -translate-x-1/2 rounded-t-sm bg-primary" />
      </span>
    </div>
  );
}

/* ---------- Helpers used by the add flow ---------- */

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 8);
}

function parseISO(iso: string): Date {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? new Date() : d;
}

/** Best-effort "when" string for the reminder. If the reminder text
 *  already mentions a window ("in 6 months", "annually"), reuse the bare
 *  text; otherwise fall back to a generic "Coming up". */
function deriveWhen(text: string): string {
  const lc = text.toLowerCase();
  const m = lc.match(/in (\d+) (day|week|month|year)s?/);
  if (m) {
    const n = parseInt(m[1], 10);
    const unit = m[2] as "day" | "week" | "month" | "year";
    const d = new Date();
    if (unit === "day") d.setDate(d.getDate() + n);
    else if (unit === "week") d.setDate(d.getDate() + n * 7);
    else if (unit === "month") d.setMonth(d.getMonth() + n);
    else d.setFullYear(d.getFullYear() + n);
    return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  }
  return "Coming up";
}
