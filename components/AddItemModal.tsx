"use client";

import { useEffect, useState } from "react";
import { itemPresets, type CaptureMethod, type ItemPreset } from "@/data/familyWorldMock";

type Props = {
  open: boolean;
  onCancel: () => void;
  /** Called once a preset is picked, capture method chosen, and the mock
   *  animation has finished. AppShell handles placing the item. */
  onConfirm: (preset: ItemPreset, method: CaptureMethod) => Promise<void> | void;
};

const SCAN_LABELS: Record<CaptureMethod, string[]> = {
  receipt: [
    "Scanning receipt…",
    "Reading purchase date…",
    "Detecting warranty terms…",
    "Placing in your world…",
  ],
  photo: [
    "Reading photo…",
    "Identifying item…",
    "Estimating warranty…",
    "Placing in your world…",
  ],
  manual: [
    "Saving entry…",
    "Tagging zone…",
    "Stocking the world…",
  ],
};

const CAPTURE_METHODS: { id: CaptureMethod; label: string; sub: string; icon: React.ReactNode }[] = [
  {
    id: "receipt",
    label: "Scan a receipt",
    sub: "Snap the receipt — we'll read price + warranty",
    icon: <ReceiptIcon />,
  },
  {
    id: "photo",
    label: "Snap a photo",
    sub: "Use the item itself — we'll fill in what we can",
    icon: <CameraIcon />,
  },
  {
    id: "manual",
    label: "Type it in",
    sub: "Fastest. Just the basics, no scanning",
    icon: <KeyboardIcon />,
  },
];

type Step = "pick-item" | "pick-method" | "scanning";

export default function AddItemModal({ open, onCancel, onConfirm }: Props) {
  const [step, setStep] = useState<Step>("pick-item");
  const [picked, setPicked] = useState<ItemPreset | null>(null);
  const [method, setMethod] = useState<CaptureMethod | null>(null);
  const [scanIndex, setScanIndex] = useState(0);

  useEffect(() => {
    if (!open) {
      // Reset on close so reopening starts fresh.
      setStep("pick-item");
      setPicked(null);
      setMethod(null);
      setScanIndex(0);
    }
  }, [open]);

  // Cycle scan labels while scanning
  useEffect(() => {
    if (step !== "scanning" || !method) return;
    const labels = SCAN_LABELS[method];
    setScanIndex(0);
    const t = setInterval(() => {
      setScanIndex((i) => Math.min(i + 1, labels.length - 1));
    }, 500);
    return () => clearInterval(t);
  }, [step, method]);

  // ESC closes (when not scanning)
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && step !== "scanning") onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, step, onCancel]);

  if (!open) return null;

  async function handleConfirm(chosenMethod: CaptureMethod) {
    if (!picked) return;
    setMethod(chosenMethod);
    setStep("scanning");
    await new Promise((r) => setTimeout(r, SCAN_LABELS[chosenMethod].length * 500));
    await onConfirm(picked, chosenMethod);
  }

  const titleByStep: Record<Step, string> = {
    "pick-item": "Add something to your world",
    "pick-method": `How do you want to capture this ${picked?.name.toLowerCase()}?`,
    scanning: "Working on it…",
  };

  const subByStep: Record<Step, string> = {
    "pick-item":
      "Pick what you want to add. Everything stays local to this prototype — no scanning, no AI, no cloud.",
    "pick-method": "All methods are mocked for V1.",
    scanning: "",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="addModalTitle"
      onClick={(e) => {
        if (e.target === e.currentTarget && step !== "scanning") onCancel();
      }}
      className="fixed inset-0 z-30 flex items-center justify-center bg-[rgba(40,25,10,0.4)] p-6 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-[520px] animate-pop rounded-3xl border border-line bg-surface-frame p-7 pb-6 shadow-pop">
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close"
          disabled={step === "scanning"}
          className="absolute right-3.5 top-3.5 flex h-[30px] w-[30px] items-center justify-center rounded-full border border-line bg-surface text-xs text-ink-soft transition hover:bg-white hover:text-ink disabled:opacity-40"
        >
          ✕
        </button>

        {step !== "scanning" && (
          <div className="mb-4">
            <StepIndicator step={step} />
          </div>
        )}

        <h2
          id="addModalTitle"
          className="mb-1.5 font-display text-[22px] font-semibold leading-tight tracking-[-0.015em] text-ink"
        >
          {titleByStep[step]}
        </h2>
        {subByStep[step] && (
          <p className="mb-5 text-ui-body font-medium leading-relaxed text-ink-soft">
            {subByStep[step]}
          </p>
        )}

        {/* STEP 1: pick item */}
        {step === "pick-item" && (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {itemPresets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setPicked(p);
                  setStep("pick-method");
                }}
                className="group flex flex-col items-center gap-1.5 rounded-2xl border border-line bg-surface px-2.5 py-3.5 transition hover:-translate-y-0.5 hover:border-primary-soft hover:bg-white"
              >
                <span className="text-[26px] leading-none">{p.glyph}</span>
                <span className="text-ui-label font-semibold text-ink">{p.name}</span>
                <span className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-soft">
                  {zoneShortName(p.zone)}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* STEP 2: pick capture method */}
        {step === "pick-method" && picked && (
          <>
            <div className="mb-4 flex items-center gap-3 rounded-2xl border border-line-soft bg-surface px-3 py-2.5">
              <span className="text-2xl leading-none">{picked.glyph}</span>
              <span className="flex flex-col leading-tight">
                <span className="text-ui-label font-semibold text-ink">{picked.name}</span>
                <span className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-soft">
                  {picked.type} · {zoneShortName(picked.zone)}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setStep("pick-item")}
                className="ml-auto rounded-full border border-line bg-surface-frame px-2.5 py-1 text-[11px] font-semibold text-ink-soft transition hover:border-ink-mute hover:text-ink"
              >
                Change
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {CAPTURE_METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleConfirm(m.id)}
                  className="group flex items-center gap-3.5 rounded-2xl border border-line bg-surface px-4 py-3 text-left transition hover:-translate-y-0.5 hover:border-primary-soft hover:bg-white"
                >
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-surface-frame text-ink-soft group-hover:text-primary">
                    {m.icon}
                  </span>
                  <span className="flex flex-1 flex-col leading-tight">
                    <span className="text-ui-label font-semibold text-ink">{m.label}</span>
                    <span className="text-[11.5px] font-medium text-ink-soft">{m.sub}</span>
                  </span>
                  <span aria-hidden className="text-[18px] leading-none text-primary">›</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* STEP 3: scanning animation */}
        {step === "scanning" && method && picked && (
          <ScanningView label={SCAN_LABELS[method][scanIndex]} method={method} glyph={picked.glyph} />
        )}

        {step === "pick-method" && (
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-line bg-surface px-4 py-2 text-[13px] font-semibold text-ink-soft transition hover:border-ink-mute hover:text-ink"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const idx = step === "pick-item" ? 0 : step === "pick-method" ? 1 : 2;
  return (
    <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
      <Dot active={idx >= 0} />
      <span>Pick item</span>
      <span aria-hidden className="mx-1 text-ink-mute">·</span>
      <Dot active={idx >= 1} />
      <span>Capture</span>
    </div>
  );
}

function Dot({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden
      className={`h-1.5 w-1.5 flex-none rounded-full ${active ? "bg-primary" : "bg-line"}`}
    />
  );
}

function ScanningView({
  label,
  method,
  glyph,
}: {
  label: string;
  method: CaptureMethod;
  glyph: string;
}) {
  return (
    <div className="flex flex-col items-center pb-1 pt-3.5">
      {method === "receipt" && <ReceiptScan />}
      {method === "photo" && <PhotoScan glyph={glyph} />}
      {method === "manual" && <ManualScan glyph={glyph} />}
      <p className="mt-3 text-[14px] font-semibold text-ink-soft">{label}</p>
    </div>
  );
}

function ReceiptScan() {
  return (
    <div className="relative h-[180px] w-[140px] overflow-hidden rounded-t-md rounded-b-2xl border border-line bg-white p-3.5 shadow-[0_12px_30px_rgba(60,40,20,0.15)]">
      <div className="mb-2.5 h-1.5 rounded bg-[#efe6d2]" />
      <div className="mb-2.5 h-1.5 w-[60%] rounded bg-[#efe6d2]" />
      <div className="mb-2.5 h-1.5 rounded bg-[#efe6d2]" />
      <div className="mb-2.5 h-1.5 w-[60%] rounded bg-[#efe6d2]" />
      <div className="mb-2.5 h-1.5 rounded bg-[#efe6d2]" />
      <div
        aria-hidden
        className="absolute left-0 right-0 h-1"
        style={{
          background: "linear-gradient(90deg, transparent 0%, #e8724a 50%, transparent 100%)",
          boxShadow: "0 0 12px #e8724a",
          animation: "scan 1.2s ease-in-out infinite",
        }}
      />
      <style>{`@keyframes scan { 0% { top: 0; } 100% { top: 100%; } }`}</style>
    </div>
  );
}

function PhotoScan({ glyph }: { glyph: string }) {
  return (
    <div className="relative flex h-[180px] w-[180px] items-center justify-center overflow-hidden rounded-2xl border border-line bg-white shadow-[0_12px_30px_rgba(60,40,20,0.15)]">
      <span className="text-[56px] leading-none">{glyph}</span>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-2 rounded-xl border-2 border-primary/70"
        style={{ animation: "focus 1.6s ease-in-out infinite" }}
      />
      <span aria-hidden className="absolute left-2 top-2 h-3 w-3 border-l-2 border-t-2 border-ink/70" />
      <span aria-hidden className="absolute right-2 top-2 h-3 w-3 border-r-2 border-t-2 border-ink/70" />
      <span aria-hidden className="absolute bottom-2 left-2 h-3 w-3 border-b-2 border-l-2 border-ink/70" />
      <span aria-hidden className="absolute bottom-2 right-2 h-3 w-3 border-b-2 border-r-2 border-ink/70" />
      <style>{`
        @keyframes focus {
          0%,100% { transform: scale(1); opacity: 0.55; }
          50%     { transform: scale(0.94); opacity: 0.95; }
        }
      `}</style>
    </div>
  );
}

function ManualScan({ glyph }: { glyph: string }) {
  return (
    <div className="relative flex h-[180px] w-[200px] flex-col gap-2.5 rounded-2xl border border-line bg-white p-4 shadow-[0_12px_30px_rgba(60,40,20,0.15)]">
      <div className="flex items-center gap-2">
        <span className="text-2xl leading-none">{glyph}</span>
        <span className="h-2 flex-1 rounded bg-[#efe6d2]" />
      </div>
      <div className="h-1.5 w-[80%] rounded bg-[#efe6d2]" />
      <div className="h-1.5 w-[60%] rounded bg-[#efe6d2]" />
      <div className="h-1.5 w-[70%] rounded bg-[#efe6d2]" />
      <div
        aria-hidden
        className="absolute left-3 right-3 bottom-3 h-1 rounded bg-primary/30"
        style={{ animation: "fillBar 1.6s ease-out infinite" }}
      />
      <style>{`
        @keyframes fillBar {
          0%   { transform: scaleX(0); transform-origin: left; }
          100% { transform: scaleX(1); transform-origin: left; }
        }
      `}</style>
    </div>
  );
}

function ReceiptIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M5 3 H15 V17 L13 15.5 L11 17 L9 15.5 L7 17 L5 15.5 Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M7 7 H13 M7 10 H13 M7 13 H11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
function CameraIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <rect x="3" y="6" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 6 L8 4 H12 L13 6" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="10" cy="11" r="3" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
function KeyboardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <rect x="2" y="6" width="16" height="9" rx="1.6" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M5 9 H5.5 M8 9 H8.5 M11 9 H11.5 M14 9 H14.5 M5 12 H5.5 M14 12 H14.5 M8 12 H12"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function zoneShortName(zoneId: string): string {
  return (
    {
      home: "Home",
      child: "Child Zone",
      docs: "Documents",
      outdoor: "Outdoor",
    } as Record<string, string>
  )[zoneId] ?? zoneId;
}
