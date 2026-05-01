"use client";

import { useCallback, useMemo, useState } from "react";
import {
  initialItems,
  DEFAULT_RECENT_ID,
  type FamilyItem,
} from "@/data/familyWorldMock";
import BrowserFrame from "./BrowserFrame";
import InfoPanel from "./InfoPanel";
import FamilyWorld from "./FamilyWorld";
import ObjectDetailDrawer from "./ObjectDetailDrawer";
import AddItemModal from "./AddItemModal";
import Toast from "./Toast";

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

  const handleConfirmAdd = useCallback(async () => {
    const wasAlreadyPlaced =
      items.find((i) => i.id === "bike-1")?.placed ?? false;

    if (!wasAlreadyPlaced) {
      setItems((prev) =>
        prev.map((i) => (i.id === "bike-1" ? { ...i, placed: true } : i)),
      );
      setSpawningId("bike-1");
      showToast("Noah's Bike added to your world");
    }

    setModalOpen(false);

    setTimeout(
      () => {
        setSpawningId(null);
        setSelectedId("bike-1");
        setRecentId("bike-1");
      },
      wasAlreadyPlaced ? 0 : 500,
    );
  }, [items, showToast]);

  const handleReset = useCallback(() => {
    setItems(initialItems);
    setSelectedId(null);
    setRecentId(DEFAULT_RECENT_ID);
    setSpawningId(null);
    showToast("World reset");
  }, [showToast]);

  return (
    <BrowserFrame>
      {/* Identity bar inside the frame: brand + tagline + buttons. */}
      <div className="flex items-center justify-between gap-4 border-b border-ink-line/15 px-6 py-4 max-md:flex-wrap max-md:gap-2.5 max-md:px-4 lg:px-8">
        <div className="flex items-center gap-3.5">
          <BrandMark />
          <div>
            <h1 className="font-display text-[22px] font-semibold tracking-[-0.015em] text-ink">
              FamilyWorld
            </h1>
            <p className="mt-0.5 text-[12.5px] font-medium text-ink-soft max-[420px]:hidden">
              Receipts, warranties and reminders for everything your family owns.
            </p>
          </div>
        </div>

        <div className="flex flex-none items-center gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            title="Reset world"
            className="rounded-full border border-ink-line/30 bg-surface px-4 py-2 text-[13px] font-semibold text-ink-soft transition hover:border-ink-mute hover:bg-white hover:text-ink"
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

      {/* Main editorial spread: left guide column, right illustrated scene. */}
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
          borderBottom: "13px solid #e07a4f",
        }}
      />
      <span className="absolute bottom-1 left-1/2 h-[18px] w-5 -translate-x-1/2 rounded-md border-2 border-primary bg-surface">
        <span className="absolute bottom-0 left-1/2 h-[7px] w-1.5 -translate-x-1/2 rounded-t-sm bg-primary" />
      </span>
    </div>
  );
}
