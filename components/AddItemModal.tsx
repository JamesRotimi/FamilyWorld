"use client";

import { useEffect, useState } from "react";
import {
  itemPresets,
  zones,
  addMonths,
  type CaptureMethod,
  type ConfirmForm,
  type ItemPreset,
  type ZoneId,
} from "@/data/familyWorldMock";

type Props = {
  open: boolean;
  onCancel: () => void;
  /** Called once the user has confirmed the prefilled details and clicked
   *  "Place in World". AppShell turns the form into a placed FamilyItem. */
  onConfirm: (form: ConfirmForm) => Promise<void> | void;
};

const SCAN_LABELS: Record<CaptureMethod, string[]> = {
  receipt: [
    "Scanning receipt…",
    "Reading purchase date…",
    "Detecting warranty terms…",
    "Filling in the form…",
  ],
  photo: [
    "Reading photo…",
    "Identifying item…",
    "Estimating warranty…",
    "Filling in the form…",
  ],
  manual: [
    "Saving entry…",
    "Tagging zone…",
    "Filling in the form…",
  ],
};

const CAPTURE_METHODS: { id: CaptureMethod; label: string; sub: string; icon: React.ReactNode }[] = [
  { id: "receipt", label: "Scan a receipt", sub: "Snap the receipt — we'll read price + warranty", icon: <ReceiptIcon /> },
  { id: "photo",   label: "Snap a photo",   sub: "Use the item itself — we'll fill in what we can", icon: <CameraIcon /> },
  { id: "manual",  label: "Type it in",     sub: "Fastest. Just the basics, no scanning",          icon: <KeyboardIcon /> },
];

type Step = "pick-item" | "pick-method" | "scanning" | "confirm";

export default function AddItemModal({ open, onCancel, onConfirm }: Props) {
  const [step, setStep] = useState<Step>("pick-item");
  const [picked, setPicked] = useState<ItemPreset | null>(null);
  const [method, setMethod] = useState<CaptureMethod | null>(null);
  const [scanIndex, setScanIndex] = useState(0);
  const [form, setForm] = useState<ConfirmForm | null>(null);

  useEffect(() => {
    if (!open) {
      setStep("pick-item");
      setPicked(null);
      setMethod(null);
      setScanIndex(0);
      setForm(null);
    }
  }, [open]);

  // Cycle scan labels, then transition to the confirm step.
  useEffect(() => {
    if (step !== "scanning" || !method || !picked) return;
    const labels = SCAN_LABELS[method];
    setScanIndex(0);
    let i = 0;
    const t = setInterval(() => {
      i++;
      if (i >= labels.length) {
        clearInterval(t);
        setForm(buildInitialForm(picked, method));
        setStep("confirm");
        return;
      }
      setScanIndex(i);
    }, 500);
    return () => clearInterval(t);
  }, [step, method, picked]);

  // ESC closes (when not actively scanning)
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && step !== "scanning") onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, step, onCancel]);

  if (!open) return null;

  function handleMethodPicked(m: CaptureMethod) {
    setMethod(m);
    setStep("scanning");
  }

  async function handlePlace() {
    if (!form) return;
    await onConfirm(form);
  }

  const titleByStep: Record<Step, string> = {
    "pick-item": "Add something to your world",
    "pick-method": `How do you want to capture this ${picked?.name.toLowerCase()}?`,
    scanning: "Working on it…",
    confirm: "Just to confirm",
  };

  const subByStep: Record<Step, string> = {
    "pick-item":
      "Pick what you want to add. Everything stays local to this prototype — no scanning, no AI, no cloud.",
    "pick-method": "All methods are mocked for V1.",
    scanning: "",
    confirm: "We've prefilled what we found. Edit anything before placing it in your world.",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="addModalTitle"
      onClick={(e) => {
        if (e.target === e.currentTarget && step !== "scanning") onCancel();
      }}
      className="fixed inset-0 z-30 flex items-center justify-center overflow-y-auto bg-[rgba(40,25,10,0.4)] p-6 backdrop-blur-sm"
    >
      <div className="relative my-auto w-full max-w-[560px] animate-pop rounded-3xl border border-line bg-surface-frame p-7 pb-6 shadow-pop">
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
                  onClick={() => handleMethodPicked(m.id)}
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

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-full border border-line bg-surface px-4 py-2 text-[13px] font-semibold text-ink-soft transition hover:border-ink-mute hover:text-ink"
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {step === "scanning" && method && picked && (
          <ScanningView label={SCAN_LABELS[method][scanIndex]} method={method} glyph={picked.glyph} />
        )}

        {step === "confirm" && form && picked && (
          <ConfirmFormView
            form={form}
            glyph={picked.glyph}
            onChange={setForm}
            onCancel={onCancel}
            onPlace={handlePlace}
          />
        )}
      </div>
    </div>
  );
}

function ConfirmFormView({
  form,
  glyph,
  onChange,
  onCancel,
  onPlace,
}: {
  form: ConfirmForm;
  glyph: string;
  onChange: (next: ConfirmForm) => void;
  onCancel: () => void;
  onPlace: () => void;
}) {
  function set<K extends keyof ConfirmForm>(key: K, value: ConfirmForm[K]) {
    onChange({ ...form, [key]: value });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onPlace();
      }}
      className="flex flex-col gap-3.5"
    >
      {/* Mock identity card showing what's being added */}
      <div className="flex items-center gap-3 rounded-2xl border border-line-soft bg-surface px-3 py-2.5">
        <span className="text-2xl leading-none">{glyph}</span>
        <span className="flex flex-col leading-tight">
          <span className="text-ui-label font-semibold text-ink">{form.name || "—"}</span>
          <span className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-soft">
            {form.category} · {zoneShortName(form.zone)}
          </span>
        </span>
      </div>

      <Field label="Name">
        <Input value={form.name} onChange={(v) => set("name", v)} />
      </Field>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Category">
          <Input value={form.category} onChange={(v) => set("category", v)} />
        </Field>
        <Field label="Zone">
          <Select value={form.zone} onChange={(v) => set("zone", v as ZoneId)}>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Purchased">
          <Input
            type="date"
            value={form.purchaseDateISO}
            onChange={(v) => set("purchaseDateISO", v)}
          />
        </Field>
        <Field label="Price">
          <Input value={form.price} onChange={(v) => set("price", v)} />
        </Field>

        <Field label="From">
          <Input value={form.from} onChange={(v) => set("from", v)} />
        </Field>
        <Field label="Colour">
          <Input value={form.colour} onChange={(v) => set("colour", v)} />
        </Field>
      </div>

      <Field label="Reminder">
        <Input
          value={form.reminder}
          onChange={(v) => set("reminder", v)}
          placeholder="e.g. Check size/replacement in 6 months"
        />
      </Field>

      {/* Read-only context */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dotted border-line/70 bg-surface px-3 py-2 text-[11.5px] font-medium text-ink-soft">
        <span>
          <span className="font-semibold uppercase tracking-[0.08em] text-ink-mute">Receipt</span>{" "}
          · {form.receipt}
        </span>
        <span className="h-2 w-px bg-line" />
        <span>
          <span className="font-semibold uppercase tracking-[0.08em] text-ink-mute">Serial</span>{" "}
          · {form.serial}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-line bg-surface px-4 py-2 text-[13px] font-semibold text-ink-soft transition hover:border-ink-mute hover:bg-white hover:text-ink"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-white shadow-primary transition hover:-translate-y-0.5"
        >
          <span aria-hidden>+</span> Place in World
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-ink-mute">
        {label}
      </span>
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-line bg-white px-3 py-2 text-[13.5px] font-medium text-ink outline-none transition placeholder:font-medium placeholder:text-ink-mute focus:border-primary-soft focus:shadow-[0_0_0_3px_rgba(232,114,74,0.15)]"
    />
  );
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-line bg-white px-3 py-2 text-[13.5px] font-medium text-ink outline-none transition focus:border-primary-soft focus:shadow-[0_0_0_3px_rgba(232,114,74,0.15)]"
    >
      {children}
    </select>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const idx = step === "pick-item" ? 0 : step === "pick-method" ? 1 : step === "confirm" ? 2 : 1;
  return (
    <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
      <Dot active={idx >= 0} />
      <span>Pick item</span>
      <span aria-hidden className="mx-1 text-ink-mute">·</span>
      <Dot active={idx >= 1} />
      <span>Capture</span>
      <span aria-hidden className="mx-1 text-ink-mute">·</span>
      <Dot active={idx >= 2} />
      <span>Confirm</span>
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

/** Build the prefilled confirm form. The bike preset uses the canonical
 *  demo data per the V1 spec; everything else derives from preset + today. */
function buildInitialForm(preset: ItemPreset, method: CaptureMethod): ConfirmForm {
  const today = new Date();
  const isBike = preset.id === "preset-bike";

  const purchaseDateISO = isBike ? "2026-02-12" : isoDate(today);

  const reminder = preset.reminderText
    ? preset.reminderInMonths
      ? `${preset.reminderText} in ${preset.reminderInMonths} months`
      : preset.reminderText
    : "";

  return {
    name: isBike ? "Noah's Bike" : preset.name,
    category: preset.type,
    zone: preset.zone,
    purchaseDateISO,
    price: isBike ? "£189" : `£${49 + Math.floor(Math.random() * 800)}`,
    from: isBike ? "Halfords" : sourceFromMethod(method),
    colour: preset.defaultColour ?? (isBike ? "Blue" : ""),
    receipt:
      method === "receipt" ? "Stored" : method === "photo" ? "Photo on file" : "Manual entry",
    serial: "Mock serial stored",
    reminder: isBike ? "Check size/replacement in 6 months" : reminder,
    glyph: preset.glyph,
    warrantyYears: preset.warrantyYears,
    notes: preset.notes ?? "Mock data for prototype only.",
  };
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function sourceFromMethod(m: CaptureMethod): string {
  return m === "receipt" ? "Scanned receipt" : m === "photo" ? "Photo capture" : "Manual entry";
}
