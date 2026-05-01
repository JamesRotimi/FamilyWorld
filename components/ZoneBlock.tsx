import { ZONE_DEPTH, zoneCorners, type Zone } from "@/data/familyWorldMock";

const STROKE = "#3A332C"; // primary outline (token)

/**
 * One volumetric zone, rendered as an SVG group:
 *   - top face (zone fill, with subtle painterly texture)
 *   - right side (sun-side, lighter)
 *   - left side (shadow-side, darker)
 *
 * The reference is chunky cubes-on-cream with miniatures on top, so
 * we keep this minimal — no walls, no windows, no roofline. Items
 * are positioned by IsometricObject as overlays.
 */
export default function ZoneBlock({ zone }: { zone: Zone }) {
  const c = zoneCorners(zone);
  const D = ZONE_DEPTH;

  const topPoints    = `${c.top.x},${c.top.y} ${c.right.x},${c.right.y} ${c.bottom.x},${c.bottom.y} ${c.left.x},${c.left.y}`;
  const rightPoints  = `${c.right.x},${c.right.y} ${c.bottom.x},${c.bottom.y} ${c.bottom.x},${c.bottom.y + D} ${c.right.x},${c.right.y + D}`;
  const leftPoints   = `${c.left.x},${c.left.y}  ${c.bottom.x},${c.bottom.y} ${c.bottom.x},${c.bottom.y + D} ${c.left.x},${c.left.y + D}`;

  return (
    <g>
      {/* Side faces first so the top sits above them. */}
      <polygon
        points={leftPoints}
        fill={zone.sideLeft}
        stroke={STROKE}
        strokeWidth="0.7"
        strokeLinejoin="round"
      />
      <polygon
        points={rightPoints}
        fill={zone.sideRight}
        stroke={STROKE}
        strokeWidth="0.7"
        strokeLinejoin="round"
      />

      {/* Top face */}
      <polygon
        points={topPoints}
        fill={zone.fill}
        stroke={STROKE}
        strokeWidth="0.9"
        strokeLinejoin="round"
      />

      {/* Painterly surface texture overlay clipped to the diamond. */}
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
  const dots: React.ReactNode[] = [];
  const cx = (corners.left.x + corners.right.x) / 2;
  const cy = (corners.top.y + corners.bottom.y) / 2;
  for (let i = 0; i < 14; i++) {
    const angle = i * 0.9;
    const r = 18 + (i % 4) * 14;
    const x = cx + Math.cos(angle) * r * 1.4;
    const y = cy + Math.sin(angle) * r * 0.7;
    dots.push(<circle key={i} cx={x} cy={y} r={1.2} fill="#8a7d62" />);
  }
  return <>{dots}</>;
}

function WaterTexture({ corners }: { corners: ReturnType<typeof zoneCorners> }) {
  const lines: React.ReactNode[] = [];
  const startY = corners.top.y + 16;
  const endY = corners.bottom.y - 16;
  for (let i = 0; i < 5; i++) {
    const y = startY + i * ((endY - startY) / 4);
    const xStart = corners.left.x + 32 + (i % 2) * 18;
    lines.push(
      <path
        key={i}
        d={`M ${xStart} ${y} q 8 -3 16 0 q 8 3 16 0`}
        stroke="#7AA0B5"
        strokeWidth={1}
        fill="none"
        strokeLinecap="round"
        opacity={0.55}
      />,
    );
  }
  return <>{lines}</>;
}

function StoneTexture({ corners }: { corners: ReturnType<typeof zoneCorners> }) {
  const dashes: React.ReactNode[] = [];
  const cx = (corners.left.x + corners.right.x) / 2;
  const cy = (corners.top.y + corners.bottom.y) / 2;
  for (let i = 0; i < 11; i++) {
    const angle = i * 1.3;
    const r = 22 + (i % 3) * 18;
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
  const tufts: React.ReactNode[] = [];
  const cx = (corners.left.x + corners.right.x) / 2;
  const cy = (corners.top.y + corners.bottom.y) / 2;
  for (let i = 0; i < 18; i++) {
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
