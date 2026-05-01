"use client";

import { useCallback, useMemo, useState } from "react";
import {
  initialItems,
  DEFAULT_RECENT_ID,
  type FamilyItem,
} from "@/data/familyWorldMock";
import SearchAndRecent from "./SearchAndRecent";
import FamilyWorld from "./FamilyWorld";
import ObjectDetailDrawer from "./ObjectDetailDrawer";
import AddItemModal from "./AddItemModal";
import Toast from "./Toast";

export default function AppShell() {
  const [items, setItems] = useState<FamilyItem[]>(initialItems);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [recentId, setRecentId] = useState<string>(DEFAULT_RECENT_ID);
  const [modalOpen, setModalOpen] = useState(false);
  const [hintGone, setHintGone] = useState(false);
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
      setHintGone(true);
    },
    [items, showToast],
  );

  const handleConfirmAdd = useCallback(async () => {
    setItems((prev) =>
      prev.map((i) => (i.id === "bike-1" ? { ...i, placed: true } : i)),
    );
    setSpawningId("bike-1");
    setModalOpen(false);
    showToast("Noah's Bike added to your world");
    // Open drawer once the spawn animation has had time to play
    setTimeout(() => {
      setSpawningId(null);
      setSelectedId("bike-1");
      setRecentId("bike-1");
      setHintGone(true);
    }, 500);
  }, [showToast]);

  const handleReset = useCallback(() => {
    setItems(initialItems);
    setSelectedId(null);
    setRecentId(DEFAULT_RECENT_ID);
    setHintGone(false);
    setSpawningId(null);
    showToast("World reset");
  }, [showToast]);

  return (
    <>
      <header className="relative z-[5] flex items-center justify-between gap-4 px-7 py-4 max-md:flex-wrap max-md:gap-2.5 max-md:px-4 max-md:py-3.5">
        <div className="flex items-center gap-3.5">
          <BrandMark />
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-[-0.015em] text-ink">
              FamilyWorld
            </h1>
            <p className="mt-0.5 text-[13px] font-medium text-ink-soft max-[420px]:hidden">
              A living map of your family&apos;s things, documents and reminders.
            </p>
          </div>
        </div>

        <div className="flex flex-none items-center gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            title="Reset world"
            className="rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink-soft transition hover:border-ink-mute hover:bg-white hover:text-ink"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            title="Add to World"
            aria-label="Add to World"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-[18px] py-2.5 text-sm font-semibold text-white shadow-primary transition hover:-translate-y-0.5"
          >
            <span className="text-base font-semibold leading-none">+</span> Add to World
          </button>
        </div>
      </header>

      <SearchAndRecent items={items} recentItem={recentItem} onSelect={handleSelect} />

      <main className="relative min-h-[calc(100vh-90px)] overflow-hidden px-6 pb-20">
        <FamilyWorld
          items={items}
          selectedId={selectedId}
          spawningId={spawningId}
          onSelect={handleSelect}
        />

        <div
          className={`relative z-[2] mx-auto mt-6 flex max-w-[520px] items-center justify-center gap-2.5 rounded-full border border-line bg-surface px-4 py-2.5 text-[13px] font-medium text-ink-soft shadow-[0_1px_2px_rgba(50,35,20,0.03)] transition duration-300 ${
            hintGone ? "pointer-events-none translate-y-2 opacity-0" : ""
          }`}
        >
          <span
            aria-hidden
            className="h-[7px] w-[7px] flex-none animate-ping rounded-full bg-primary"
          />
          <span>
            Tap an object to see receipts, reminders and warranty details.
          </span>
        </div>
      </main>

      <ObjectDetailDrawer
        item={selectedItem}
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        onAddReminder={() => showToast("Reminder added (mock)")}
        onViewReceipt={() => showToast("Receipt preview is mocked for V1")}
      />

      <AddItemModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onConfirm={handleConfirmAdd}
      />

      <Toast message={toast.message} signal={toast.signal || null} />
    </>
  );
}

function BrandMark() {
  return (
    <div aria-hidden className="relative h-11 w-11 flex-none">
      <span
        className="absolute left-1/2 top-1 -translate-x-1/2"
        style={{
          width: 0,
          height: 0,
          borderLeft: "14px solid transparent",
          borderRight: "14px solid transparent",
          borderBottom: "14px solid #e07a4f",
        }}
      />
      <span className="absolute bottom-1.5 left-1/2 h-5 w-6 -translate-x-1/2 rounded-md border-2 border-primary bg-surface">
        <span className="absolute bottom-0 left-1/2 h-2 w-1.5 -translate-x-1/2 rounded-t-sm bg-primary" />
      </span>
    </div>
  );
}
