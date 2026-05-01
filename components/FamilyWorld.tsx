"use client";

import {
  ZONE_DEPTH,
  tileToPx,
  zones,
  type FamilyItem,
  type Zone,
} from "@/data/familyWorldMock";
import IsometricObject from "./IsometricObject";
import ZoneBlock from "./ZoneBlock";

type Props = {
  items: FamilyItem[];
  selectedId: string | null;
  spawningId: string | null;
  onSelect: (id: string) => void;
};

const STROKE = "#3a342c";
const SVG_WIDTH = 880;
// Taller — needs to fit walls extruded up + zone depth.
const SVG_HEIGHT = 580;

function labelPlacement(zone: Zone) {
  switch (zone.labelAnchor) {
    case "top":
      return tileToPx(zone.x0 + 0.5, zone.y0 + 0.5, 0, -82);
    case "bottom":
      return tileToPx(zone.x1 + 0.5, zone.y1 + 0.5, 0, 50 + ZONE_DEPTH);
    case "left":
      return tileToPx(zone.x0 + 0.5, zone.y1 + 0.5, -50, -10);
    case "right":
      return tileToPx(zone.x1 + 0.5, zone.y0 + 0.5, 50, -10);
  }
}

/**
 * The illustrated isometric scene. Volumetric SVG zone blocks become
 * cutaway rooms with back walls and windows; outdoor stays open with
 * trees + a path. HTML overlays for items + zone signs keep
 * interactivity and accessibility intact.
 */
export default function FamilyWorld({
  items,
  selectedId,
  spawningId,
  onSelect,
}: Props) {
  const placed = items.filter((i) => i.placed);
  const sorted = [...placed].sort(
    (a, b) => a.position.x + a.position.y - (b.position.x + b.position.y),
  );

  return (
    <div className="relative flex flex-1 justify-center overflow-hidden bg-[#f6efde] px-6 pb-12 pt-10 lg:pb-16 lg:pt-14">
      {/* Soft cutaway sky behind the scene */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 35% at 60% 25%, rgba(255, 226, 188, 0.55) 0%, rgba(255, 226, 188, 0) 70%)",
        }}
      />

      <div
        className="relative mx-auto origin-top scale-[1.06] max-lg:scale-[0.78] max-md:scale-[0.6] max-sm:scale-[0.46]"
        style={{ width: SVG_WIDTH, height: SVG_HEIGHT }}
      >
        <svg
          className="pointer-events-none absolute inset-0"
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          aria-hidden
        >
          <defs>
            <filter id="block-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
              <feOffset dx="0" dy="6" result="offset" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.18" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Render zones back-to-front so depth composites correctly. */}
          {[...zones]
            .sort((a, b) => a.x0 + a.y0 - (b.x0 + b.y0))
            .map((zone) => (
              <g key={zone.id} filter="url(#block-shadow)">
                <ZoneBlock zone={zone} />
              </g>
            ))}

          {/* Outdoor charm: trees, path stones */}
          <Tree x={555} y={368} scale={0.95} />
          <Tree x={672} y={400} scale={1.05} />
          <Bush x={500} y={420} />
          <Bush x={720} y={344} />
          <PathStones />
        </svg>

        {/* Floating zone signs — restyled as embedded "wood plaque" labels. */}
        {zones.map((zone) => {
          const { left, top } = labelPlacement(zone);
          return (
            <div
              key={`label-${zone.id}`}
              className="pointer-events-none absolute z-[4] -translate-x-1/2 -translate-y-1/2"
              style={{ left, top }}
            >
              <ZoneSign label={zone.name} />
            </div>
          );
        })}

        {/* Objects, depth-sorted. */}
        {sorted.map((item) => (
          <IsometricObject
            key={item.id}
            item={item}
            selected={selectedId === item.id}
            spawning={spawningId === item.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

/** A small "wood plaque" zone sign — embedded in the scene rather than
 *  floating like a chip. */
function ZoneSign({ label }: { label: string }) {
  return (
    <span
      className="relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-[6px] border border-ink-line/50 bg-[#f5e9c8] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-ink shadow-[0_2px_4px_rgba(50,35,20,0.12)]"
    >
      <span aria-hidden className="h-1 w-1 rounded-full bg-ink-line/60" />
      {label}
      <span aria-hidden className="h-1 w-1 rounded-full bg-ink-line/60" />
    </span>
  );
}

function Tree({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="6" rx="6" ry="2" fill="rgba(50, 35, 20, 0.16)" />
      <rect x="-1.2" y="-2" width="2.4" height="8" fill="#8a6a44" stroke={STROKE} strokeWidth="0.5" rx="0.6" />
      <circle cx="0" cy="-6" r="6" fill="#7e9462" stroke={STROKE} strokeWidth="0.7" />
      <circle cx="-3.5" cy="-3" r="3.5" fill="#7e9462" stroke={STROKE} strokeWidth="0.7" />
      <circle cx="3.5" cy="-3" r="3.5" fill="#7e9462" stroke={STROKE} strokeWidth="0.7" />
    </g>
  );
}

function Bush({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="3" rx="6" ry="1.5" fill="rgba(50,35,20,0.14)" />
      <circle cx="-3" cy="0" r="3" fill="#94a878" stroke={STROKE} strokeWidth="0.6" />
      <circle cx="3"  cy="0" r="3" fill="#94a878" stroke={STROKE} strokeWidth="0.6" />
      <circle cx="0"  cy="-2" r="3" fill="#7e9462" stroke={STROKE} strokeWidth="0.6" />
    </g>
  );
}

/** Decorative dotted path leading from the front of the outdoor zone
 *  toward the documents zone — implies movement/flow. */
function PathStones() {
  const stones = [];
  for (let i = 0; i < 6; i++) {
    const x = 440 + i * 18;
    const y = 408 + i * 4;
    stones.push(
      <ellipse
        key={i}
        cx={x}
        cy={y}
        rx={6}
        ry={3}
        fill="#cfc8b2"
        stroke={STROKE}
        strokeWidth="0.6"
      />,
    );
  }
  return <>{stones}</>;
}

