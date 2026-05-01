"use client";

import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
};

const SCAN_MESSAGES = [
  "Scanning receipt…",
  "Reading purchase date…",
  "Detecting warranty terms…",
  "Placing in your world…",
];

export default function AddItemModal({ open, onCancel, onConfirm }: Props) {
  const [scanning, setScanning] = useState(false);
  const [scanIndex, setScanIndex] = useState(0);

  useEffect(() => {
    if (!open) {
      setScanning(false);
      setScanIndex(0);
    }
  }, [open]);

  // Cycle scanning labels while scanning
  useEffect(() => {
    if (!scanning) return;
    const t = setInterval(() => {
      setScanIndex((i) => Math.min(i + 1, SCAN_MESSAGES.length - 1));
    }, 500);
    return () => clearInterval(t);
  }, [scanning]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !scanning) onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, scanning, onCancel]);

  if (!open) return null;

  async function handleConfirm() {
    setScanning(true);
    setScanIndex(0);
    // Allow scanning state to mount and animate
    await new Promise((r) => setTimeout(r, SCAN_MESSAGES.length * 500));
    await onConfirm();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="addModalTitle"
      onClick={(e) => {
        if (e.target === e.currentTarget && !scanning) onCancel();
      }}
      className="fixed inset-0 z-30 flex items-center justify-center bg-[rgba(40,25,10,0.4)] p-6 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-[460px] animate-pop rounded-3xl border border-line bg-surface p-7 pb-6 shadow-pop">
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close"
          disabled={scanning}
          className="absolute right-3.5 top-3.5 flex h-[30px] w-[30px] items-center justify-center rounded-full border border-line bg-surface-soft text-xs text-ink-soft transition hover:bg-white hover:text-ink disabled:opacity-40"
        >
          ✕
        </button>

        <h2
          id="addModalTitle"
          className="mb-1.5 font-display text-[22px] font-semibold tracking-[-0.015em] text-ink"
        >
          Add something to your world
        </h2>
        <p className="mb-6 text-sm font-medium leading-[1.55] text-ink-soft">
          In the real product, this would let you scan a receipt or document. For
          this prototype, we&apos;ll add the bike example.
        </p>

        {!scanning && (
          <div className="flex flex-wrap justify-end gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink-soft transition hover:border-ink-mute hover:bg-white hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-[18px] py-2.5 text-sm font-semibold text-white shadow-primary transition hover:-translate-y-0.5"
            >
              <span aria-hidden>🚲</span> Add Noah&apos;s Bike
            </button>
          </div>
        )}

        {scanning && (
          <div className="flex flex-col items-center pb-1 pt-3.5">
            <div className="relative mb-3.5 h-[180px] w-[140px] overflow-hidden rounded-t-md rounded-b-2xl border border-line bg-white p-3.5 shadow-[0_12px_30px_rgba(60,40,20,0.15)]">
              <div className="mb-2.5 h-1.5 rounded bg-[#efe6d2]" />
              <div className="mb-2.5 h-1.5 w-[60%] rounded bg-[#efe6d2]" />
              <div className="mb-2.5 h-1.5 rounded bg-[#efe6d2]" />
              <div className="mb-2.5 h-1.5 w-[60%] rounded bg-[#efe6d2]" />
              <div className="mb-2.5 h-1.5 rounded bg-[#efe6d2]" />
              <div
                aria-hidden
                className="absolute left-0 right-0 h-1 shadow-[0_0_12px_var(--tw-shadow-color)] shadow-primary"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, #e07a4f 50%, transparent 100%)",
                  animation: "scan 1.2s ease-in-out infinite",
                }}
              />
            </div>
            <p className="text-sm font-semibold text-ink-soft">
              {SCAN_MESSAGES[scanIndex]}
            </p>
            <style>{`@keyframes scan { 0% { top: 0; } 100% { top: 100%; } }`}</style>
          </div>
        )}
      </div>
    </div>
  );
}
