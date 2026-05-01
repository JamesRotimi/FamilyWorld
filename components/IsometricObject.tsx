"use client";

import { tileToPx, type FamilyItem } from "@/data/familyWorldMock";

type Props = {
  item: FamilyItem;
  selected?: boolean;
  spawning?: boolean;
  onSelect: (id: string) => void;
};

/**
 * A single object on the isometric world. Pure presentational — receives
 * an item and emits onSelect when clicked.
 */
export default function IsometricObject({
  item,
  selected = false,
  spawning = false,
  onSelect,
}: Props) {
  const inactive = item.status === "coming-soon";
  const { left, top } = tileToPx(item.position.x + 0.5, item.position.y + 0.5);

  return (
    <button
      type="button"
      data-id={item.id}
      onClick={() => onSelect(item.id)}
      style={{ left, top }}
      className={`group absolute -ml-9 -mt-[68px] flex h-[90px] w-[72px] select-none items-end justify-center transition-transform duration-200 ${
        inactive ? "cursor-default hover:-translate-y-0.5" : "cursor-pointer hover:-translate-y-[2px]"
      }`}
      aria-label={item.name}
    >
      {/* Soft ground shadow */}
      <span
        aria-hidden
        className={`absolute bottom-[-2px] left-1/2 z-0 h-3 w-[52px] -translate-x-1/2 rounded-full bg-[rgba(50,35,20,0.14)] blur-[5px] ${
          inactive ? "opacity-40" : ""
        }`}
      />

      {/* Glyph card */}
      <div
        className={`relative z-[1] flex h-[60px] w-[60px] items-center justify-center rounded-2xl border text-3xl leading-none transition ${
          selected
            ? "border-primary-soft shadow-[0_0_0_3px_rgba(224,122,79,0.32),0_12px_24px_rgba(50,35,20,0.10),0_2px_4px_rgba(50,35,20,0.05)]"
            : "border-line shadow-glyph"
        } ${inactive ? "border-line bg-surface-soft saturate-[0.35] opacity-60 group-hover:opacity-75" : "bg-surface"} ${
          spawning ? "animate-spawn" : ""
        }`}
      >
        {item.glyph}
      </div>

      {/* Hover label */}
      <span className="pointer-events-none absolute bottom-[-22px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-line bg-surface px-2.5 py-[3px] text-[11px] font-semibold text-ink opacity-0 shadow-[0_2px_6px_rgba(50,35,20,0.06)] transition-opacity group-hover:opacity-100">
        {item.name}
      </span>

      {/* Coming-soon hint — subtle by default, surfaces on hover/focus */}
      {inactive && (
        <span className="pointer-events-none absolute left-1/2 top-[-6px] z-[2] -translate-x-1/2 whitespace-nowrap rounded-full border border-line/80 bg-surface/85 px-2 py-[2px] text-[9px] font-medium uppercase tracking-[0.06em] text-ink-mute opacity-0 shadow-[0_2px_6px_rgba(50,35,20,0.04)] transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
          Soon
        </span>
      )}

      {/* Reminder pip — single accent dot for active items with a reminder */}
      {!inactive && item.reminder && (
        <span className="absolute right-1.5 top-0.5 z-[2] flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-surface bg-primary px-1.5 text-[10px] font-bold text-white shadow-[0_2px_6px_rgba(216,90,30,0.32)]">
          1
        </span>
      )}
    </button>
  );
}
