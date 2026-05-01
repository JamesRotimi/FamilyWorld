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
 *
 * Active items (the bike) read as warm and tactile. Inactive items render
 * dimmed with a small always-visible preview label and surface a fuller
 * preview blurb on hover.
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
        inactive
          ? "cursor-default hover:-translate-y-[1px]"
          : "cursor-pointer hover:-translate-y-[2px]"
      }`}
      aria-label={inactive && item.preview ? `${item.name} — ${item.preview}` : item.name}
    >
      {/* Warm halo under the active bike — adds a "this is alive" cue */}
      {!inactive && (
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-1/2 -z-[1] -translate-x-1/2"
          style={{
            width: 84,
            height: 22,
            background:
              "radial-gradient(ellipse at center, rgba(255, 190, 130, 0.42) 0%, rgba(255, 190, 130, 0) 70%)",
            filter: "blur(4px)",
          }}
        />
      )}

      {/* Soft ground shadow */}
      <span
        aria-hidden
        className={`absolute bottom-[-2px] left-1/2 z-0 h-3 w-[52px] -translate-x-1/2 rounded-full bg-[rgba(50,35,20,0.14)] blur-[5px] ${
          inactive ? "opacity-40" : ""
        }`}
      />

      {/* Glyph card */}
      <div
        className={`relative z-[1] flex h-[60px] w-[60px] items-center justify-center rounded-2xl border bg-gradient-to-b text-3xl leading-none transition ${
          selected
            ? "border-primary-soft from-white to-surface shadow-[0_0_0_3px_rgba(224,122,79,0.32),0_12px_24px_rgba(50,35,20,0.10),0_2px_4px_rgba(50,35,20,0.05)]"
            : "border-line from-white to-surface shadow-glyph"
        } ${
          inactive
            ? "!border-line !bg-none !bg-surface-soft saturate-[0.32] opacity-[0.62] group-hover:opacity-80"
            : ""
        } ${spawning ? "animate-spawn" : ""}`}
      >
        {item.glyph}
      </div>

      {/* Active items: always-visible name in full ink so the focal item
          has the strongest legibility on the world. */}
      {!inactive && (
        <span className="pointer-events-none absolute bottom-[-20px] left-1/2 -translate-x-1/2 whitespace-nowrap text-[10.5px] font-semibold tracking-[-0.01em] text-ink">
          {item.name}
        </span>
      )}

      {/* Inactive items: small preview name beneath the icon — same anchor as
          the active label, but with a softer weight + colour and a tiny "soon"
          tag to read clearly as a future feature. Fades out on hover so the
          richer blurb can take its place. */}
      {inactive && (
        <span className="pointer-events-none absolute bottom-[-20px] left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap text-[10.5px] font-medium tracking-[-0.005em] text-ink-mute opacity-100 transition-opacity duration-200 group-hover:opacity-0 group-focus-visible:opacity-0">
          <span aria-hidden className="rounded-full bg-line px-1.5 py-px text-[8.5px] font-semibold uppercase tracking-[0.08em] text-ink-mute">
            soon
          </span>
          {item.name}
        </span>
      )}

      {/* Inactive items: hover blurb — same anchor as the name, soft pill
          with the descriptive sentence so the placeholder feels informative. */}
      {inactive && item.preview && (
        <span className="pointer-events-none absolute bottom-[-34px] left-1/2 z-[6] w-[200px] -translate-x-1/2 whitespace-normal rounded-xl border border-line-soft bg-surface px-3 py-2 text-center text-[10.5px] font-medium leading-snug text-ink-soft opacity-0 shadow-[0_8px_24px_rgba(50,35,20,0.14)] transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
          {item.preview}
        </span>
      )}

      {/* Reminder badge for active items with a reminder */}
      {!inactive && item.reminder && (
        <span
          className="absolute right-1.5 top-0.5 z-[2] flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-surface bg-primary px-1.5 text-[10px] font-bold text-white shadow-[0_2px_6px_rgba(216,90,30,0.38)]"
          style={{ animation: "badgePulse 3.2s ease-in-out infinite" }}
        >
          1
        </span>
      )}
    </button>
  );
}
