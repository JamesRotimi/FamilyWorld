import { ZONE_DEPTH, zoneCorners, type Zone } from "@/data/familyWorldMock";

/**
 * One volumetric zone block, rendered as an SVG group:
 *   - top face (zone fill, with subtle texture)
 *   - right side face (sun side, lighter)
 *   - left side face (shadow side, darker)
 *
 * Drawn from back to front so faces composite correctly.
 */
export default function ZoneBlock({ zone }: { zone: Zone }) {
  const c = zoneCorners(zone);
  const D = ZONE_DEPTH;

  const topPoints = `${c.top.x},${c.top.y} ${c.right.x},${c.right.y} ${c.bottom.x},${c.bottom.y} ${c.left.x},${c.left.y}`;
  // Right side: from RIGHT corner → BOTTOM corner → BOTTOM+D → RIGHT+D
  const rightPoints = `${c.right.x},${c.right.y} ${c.bottom.x},${c.bottom.y} ${c.bottom.x},${c.bottom.y + D} ${c.right.x},${c.right.y + D}`;
  // Left side: from LEFT corner → BOTTOM corner → BOTTOM+D → LEFT+D
  const leftPoints = `${c.left.x},${c.left.y} ${c.bottom.x},${c.bottom.y} ${c.bottom.x},${c.bottom.y + D} ${c.left.x},${c.left.y + D}`;

  return (
    <g>
      {/* Side faces first so the top sits above them. */}
      <polygon points={leftPoints} fill={zone.sideLeft} />
      <polygon points={rightPoints} fill={zone.sideRight} />

      {/* Top face */}
      <polygon
        points={topPoints}
        fill={zone.fill}
        stroke={zone.edge}
        strokeWidth={1}
        strokeLinejoin="round"
      />

      {/* Surface texture overlay — drawn with a clip-path so it stays on
          top of the zone. */}
      <SurfaceTexture zone={zone} corners={c} />
    </g>
  );
}

function SurfaceTexture({
  zone,
  corners,
}: {
  zone: Zone;
  corners: ReturnType<typeof zoneCorners>;
}) {
  // Use a clip path so decorative dots/lines stay inside the zone diamond.
  const clipId = `clip-${zone.id}`;
  const top = `${corners.top.x},${corners.top.y} ${corners.right.x},${corners.right.y} ${corners.bottom.x},${corners.bottom.y} ${corners.left.x},${corners.left.y}`;

  return (
    <>
      <defs>
        <clipPath id={clipId}>
          <polygon points={top} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`} opacity={0.55}>
        {zone.surface === "soil" && <SoilTexture corners={corners} />}
        {zone.surface === "water" && <WaterTexture corners={corners} />}
        {zone.surface === "stone" && <StoneTexture corners={corners} />}
        {zone.surface === "grass" && <GrassTexture corners={corners} />}
      </g>
    </>
  );
}

function SoilTexture({ corners }: { corners: ReturnType<typeof zoneCorners> }) {
  const dots = [];
  const cx = (corners.left.x + corners.right.x) / 2;
  const cy = (corners.top.y + corners.bottom.y) / 2;
  for (let i = 0; i < 14; i++) {
    const angle = i * 0.9;
    const r = 18 + (i % 4) * 14;
    const x = cx + Math.cos(angle) * r * 1.4;
    const y = cy + Math.sin(angle) * r * 0.7;
    dots.push(<circle key={i} cx={x} cy={y} r={1.1} fill="#8a7d62" />);
  }
  return <>{dots}</>;
}

function WaterTexture({ corners }: { corners: ReturnType<typeof zoneCorners> }) {
  const lines = [];
  const startY = corners.top.y + 14;
  const endY = corners.bottom.y - 14;
  for (let i = 0; i < 5; i++) {
    const y = startY + i * ((endY - startY) / 4);
    const xStart = corners.left.x + 30 + (i % 2) * 18;
    const xEnd = xStart + 32;
    lines.push(
      <path
        key={i}
        d={`M ${xStart} ${y} q 8 -3 16 0 q 8 3 16 0`}
        stroke="#7ea4b8"
        strokeWidth={1}
        fill="none"
        strokeLinecap="round"
        opacity={0.6}
      />,
    );
  }
  return <>{lines}</>;
}

function StoneTexture({ corners }: { corners: ReturnType<typeof zoneCorners> }) {
  const dashes = [];
  const cx = (corners.left.x + corners.right.x) / 2;
  const cy = (corners.top.y + corners.bottom.y) / 2;
  for (let i = 0; i < 9; i++) {
    const angle = i * 1.3;
    const r = 24 + (i % 3) * 18;
    const x = cx + Math.cos(angle) * r * 1.3;
    const y = cy + Math.sin(angle) * r * 0.7;
    dashes.push(
      <path
        key={i}
        d={`M ${x} ${y} l 6 0`}
        stroke="#9c9482"
        strokeWidth={1}
        strokeLinecap="round"
      />,
    );
  }
  return <>{dashes}</>;
}

function GrassTexture({ corners }: { corners: ReturnType<typeof zoneCorners> }) {
  const tufts = [];
  const cx = (corners.left.x + corners.right.x) / 2;
  const cy = (corners.top.y + corners.bottom.y) / 2;
  for (let i = 0; i < 16; i++) {
    const angle = i * 0.78;
    const r = 16 + (i % 5) * 12;
    const x = cx + Math.cos(angle) * r * 1.4;
    const y = cy + Math.sin(angle) * r * 0.7;
    tufts.push(
      <path
        key={i}
        d={`M ${x} ${y} l 0 -3 M ${x - 1.5} ${y} l 0 -2 M ${x + 1.5} ${y} l 0 -2`}
        stroke="#7e9462"
        strokeWidth={1}
        strokeLinecap="round"
      />,
    );
  }
  return <>{tufts}</>;
}
