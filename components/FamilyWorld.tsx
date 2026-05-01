"use client";

import {
  TILE_W,
  TILE_H,
  tileToPx,
  zones,
  type FamilyItem,
  type Zone,
} from "@/data/familyWorldMock";
import IsometricObject from "./IsometricObject";

type Props = {
  items: FamilyItem[];
  selectedId: string | null;
  spawningId: string | null;
  onSelect: (id: string) => void;
};

function labelPlacement(zone: Zone) {
  switch (zone.labelAnchor) {
    case "top":
      return tileToPx(zone.x0 + 0.5, zone.y0 + 0.5, 0, -50);
    case "bottom":
      return tileToPx(zone.x1 + 0.5, zone.y1 + 0.5, 0, 50);
    case "left":
      return tileToPx(zone.x0 + 0.5, zone.y1 + 0.5, -36, 8);
    case "right":
      return tileToPx(zone.x1 + 0.5, zone.y0 + 0.5, 36, 8);
  }
}

/**
 * The isometric world / diorama. Faked with absolute-positioned diamond tiles —
 * no canvas, no Three.js. Items render front-to-back via x+y depth sort.
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
        style={{ width: 880, height: 620 }}
      >
        {/* Tiles */}
        {zones.flatMap((zone) => {
          const tiles = [];
          for (let x = zone.x0; x <= zone.x1; x++) {
            for (let y = zone.y0; y <= zone.y1; y++) {
              const isEdge =
                x === zone.x0 || x === zone.x1 || y === zone.y0 || y === zone.y1;
              const { left, top } = tileToPx(x, y);
              tiles.push(
                <div
                  key={`${zone.id}-${x}-${y}`}
                  className="pointer-events-none absolute"
                  style={{
                    left,
                    top,
                    width: TILE_W,
                    height: TILE_H,
                    transform: "translate(-50%, 0)",
                  }}
                >
                  <div
                    className="tile-shape absolute inset-0"
                    style={{
                      background: zone.fill,
                      filter: isEdge ? "brightness(0.97)" : undefined,
                    }}
                  />
                </div>,
              );
            }
          }
          return tiles;
        })}

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

        {/* Objects, depth-sorted */}
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
