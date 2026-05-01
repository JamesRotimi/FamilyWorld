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

const SVG_WIDTH = 880;
const SVG_HEIGHT = 480; // covers iso bounds + zone depth

/** Small decorative tree — adds a touch of miniature-world charm. */
function Tree({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="6" rx="6" ry="2" fill="rgba(50, 35, 20, 0.16)" />
      <rect x="-1.2" y="-2" width="2.4" height="8" fill="#8a6a44" rx="0.6" />
      <circle cx="0" cy="-6" r="6" fill="#7e9462" stroke="#5e7548" strokeWidth="0.8" />
      <circle cx="-3.5" cy="-3" r="3.5" fill="#7e9462" stroke="#5e7548" strokeWidth="0.8" />
      <circle cx="3.5" cy="-3" r="3.5" fill="#7e9462" stroke="#5e7548" strokeWidth="0.8" />
    </g>
  );
}

function labelPlacement(zone: Zone) {
  switch (zone.labelAnchor) {
    case "top":
      return tileToPx(zone.x0 + 0.5, zone.y0 + 0.5, 0, -50);
    case "bottom":
      return tileToPx(zone.x1 + 0.5, zone.y1 + 0.5, 0, 50 + ZONE_DEPTH);
    case "left":
      return tileToPx(zone.x0 + 0.5, zone.y1 + 0.5, -36, 8);
    case "right":
      return tileToPx(zone.x1 + 0.5, zone.y0 + 0.5, 36, 8);
  }
}

/**
 * The isometric world / diorama. Volumetric SVG zone blocks (top + two
 * visible side faces) carry the floor; items and labels render as HTML
 * overlays on top so they stay interactive. No canvas, no Three.js.
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
    <div className="relative z-[1] mx-auto mt-2 flex max-w-[1080px] justify-center overflow-hidden rounded-[32px] world-platform px-8 pb-16 pt-14 shadow-platform max-md:px-3 max-md:pt-10 max-md:pb-12">
      <div
        className="relative mx-auto origin-top scale-[1.06] max-lg:scale-[0.82] max-md:scale-[0.62] max-sm:scale-[0.46]"
        style={{ width: SVG_WIDTH, height: SVG_HEIGHT + 80 }}
      >
        {/* Volumetric base — SVG zone blocks rendered back-to-front so the
            depth-sort reads correctly. */}
        <svg
          className="pointer-events-none absolute inset-0"
          width={SVG_WIDTH}
          height={SVG_HEIGHT + 80}
          aria-hidden
        >
          <defs>
            {/* Soft drop shadow under each block. */}
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

          {/* Sort zones top-to-bottom (smaller x+y first) so back blocks
              render before front ones, matching iso depth. */}
          {[...zones]
            .sort((a, b) => a.x0 + a.y0 - (b.x0 + b.y0))
            .map((zone) => (
              <g key={zone.id} filter="url(#block-shadow)">
                <ZoneBlock zone={zone} />
              </g>
            ))}

          {/* Tiny decorative trees scattered on the platforms — pure
              charm, no interaction. */}
          <Tree x={120} y={216} scale={1} />
          <Tree x={760} y={216} scale={0.85} />
          <Tree x={250} y={400} scale={0.95} />
          <Tree x={636} y={400} scale={1} />
        </svg>

        {/* Floating room labels */}
        {zones.map((zone) => {
          const { left, top } = labelPlacement(zone);
          return (
            <div
              key={`label-${zone.id}`}
              className="pointer-events-none absolute z-[4] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-line-soft bg-surface/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-ink-soft shadow-[0_1px_2px_rgba(50,35,20,0.04)] backdrop-blur"
              style={{ left, top }}
            >
              {zone.name}
            </div>
          );
        })}

        {/* Objects, depth-sorted. HTML overlays so they stay clickable. */}
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
