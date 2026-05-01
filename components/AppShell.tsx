"use client";

import { useCallback, useMemo, useState } from "react";
import {
  initialItems,
  itemPresets,
  findEmptyTileInZone,
  formatDate,
  addMonths,
  DEFAULT_RECENT_ID,
  type CaptureMethod,
  type FamilyItem,
  type ItemPreset,
} from "@/data/familyWorldMock";
import BrowserFrame from "./BrowserFrame";
import InfoPanel from "./InfoPanel";
import FamilyWorld from "./FamilyWorld";
import ObjectDetailDrawer from "./ObjectDetailDrawer";
import AddItemModal from "./AddItemModal";
import Toast from "./Toast";

const SEED_IDS = new Set(initialItems.map((i) => i.id));

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

  /** Build a new FamilyItem from a preset + capture method, place it in
   *  an empty tile of its zone, and open its drawer. */
  const handleConfirmAdd = useCallback(
    async (preset: ItemPreset, method: CaptureMethod) => {
      // Bike preset is treated specially when bike-1 isn't placed yet —
      // re-using the focal item keeps the demo state stable.
      const bikeAlreadyAvailable = items.some(
        (i) => i.id === "bike-1" && !i.placed,
      );
      if (preset.id === "preset-bike" && bikeAlreadyAvailable) {
        setItems((prev) =>
          prev.map((i) => (i.id === "bike-1" ? { ...i, placed: true } : i)),
        );
        finalisePlacement("bike-1");
        return;
      }

      const taken = items
        .filter((i) => i.placed && i.zone === preset.zone)
        .map((i) => i.position);
      const pos = findEmptyTileInZone(preset.zone, taken) ?? { x: 0, y: 0 };

      const today = new Date();
      const id =
        preset.id === "preset-bike"
          ? "obj-bike-" + randomSuffix()
          : "obj-" + randomSuffix();

      const newItem: FamilyItem = {
        id,
        name: customName(preset),
        type: preset.type,
        zone: preset.zone,
        status: "active",
        placed: true,
        position: pos,
        glyph: preset.glyph,
        purchaseDate: formatDate(today),
        purchasedFrom: captureSource(method),
        price: mockPrice(),
        warranty: preset.warrantyYears
          ? {
              ends: formatDate(addMonths(today, preset.warrantyYears * 12)),
              remainingText: `${preset.warrantyYears * 12} months remaining`,
            }
          : undefined,
        colour: preset.defaultColour,
        receiptStatus: method === "receipt" ? "Stored" : method === "photo" ? "Photo on file" : "Manual entry",
        reminder: preset.reminderInMonths
          ? {
              text: preset.reminderText ?? "Check on this item",
              when: formatMonthYear(addMonths(today, preset.reminderInMonths)),
            }
          : undefined,
        notes: preset.notes ?? "Mock data for prototype only.",
      };

      setItems((prev) => [...prev, newItem]);
      finalisePlacement(id);
    },
    [items],
  );

  function finalisePlacement(id: string) {
    setSpawningId(id);
    setModalOpen(false);
    showToast(`Added to your world`);
    setTimeout(() => {
      setSpawningId(null);
      setSelectedId(id);
      setRecentId(id);
    }, 500);
  }

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

function customName(preset: ItemPreset): string {
  // The bike preset gets the canonical "Noah's Bike" name only when re-using
  // the seeded slot. New bikes added via the preset get a generic name.
  return preset.name;
}

function captureSource(method: CaptureMethod): string {
  return method === "receipt"
    ? "Scanned receipt"
    : method === "photo"
      ? "Photo capture"
      : "Manual entry";
}

function mockPrice(): string {
  const v = 49 + Math.floor(Math.random() * 800);
  return `£${v}`;
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 8);
}

function formatMonthYear(d: Date): string {
  return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}
