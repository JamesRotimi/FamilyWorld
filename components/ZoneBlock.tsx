import {
  ZONE_DEPTH,
  zoneCorners,
  type Zone,
} from "@/data/familyWorldMock";

const STROKE = "#3a342c"; // charcoal linework
const WALL_HEIGHT = 56;

/**
 * One volumetric zone, rendered as an SVG group:
 *   - top face (zone fill, with subtle texture)
 *   - right side (sun-side, lighter)
 *   - left side (shadow-side, darker)
 *   - optional back walls + window cutouts for indoor zones, so the
 *     scene reads as an architectural cutaway, not a flat tile
 */
export default function ZoneBlock({ zone }: { zone: Zone }) {
  const c = zoneCorners(zone);
  const D = ZONE_DEPTH;

  const indoor = zone.id !== "outdoor";

  const topPoints = `${c.top.x},${c.top.y} ${c.right.x},${c.right.y} ${c.bottom.x},${c.bottom.y} ${c.left.x},${c.left.y}`;
  const rightFootPoints = `${c.right.x},${c.right.y} ${c.bottom.x},${c.bottom.y} ${c.bottom.x},${c.bottom.y + D} ${c.right.x},${c.right.y + D}`;
  const leftFootPoints  = `${c.left.x},${c.left.y}  ${c.bottom.x},${c.bottom.y} ${c.bottom.x},${c.bottom.y + D} ${c.left.x},${c.left.y + D}`;

  // Back walls extruded UP from the back-left and back-right edges of
  // the diamond. These give the room a cutaway architectural feel.
  // Back-left wall:  TOP → LEFT (extruded up by WALL_HEIGHT)
  // Back-right wall: TOP → RIGHT (extruded up by WALL_HEIGHT)
  const wallH = WALL_HEIGHT;
  const backLeftWall = `${c.top.x},${c.top.y} ${c.left.x},${c.left.y} ${c.left.x},${c.left.y - wallH} ${c.top.x},${c.top.y - wallH}`;
  const backRightWall = `${c.top.x},${c.top.y} ${c.right.x},${c.right.y} ${c.right.x},${c.right.y - wallH} ${c.top.x},${c.top.y - wallH}`;

  // Wall colours — slightly warmer / lighter than the floor so the
  // walls don't merge with it.
  const wallLeftFill = lighten(zone.fill, 0.08);
  const wallRightFill = lighten(zone.fill, 0.16);

  return (
    <g>
      {/* Side faces of the foundation block (always drawn). */}
      <polygon points={leftFootPoints} fill={zone.sideLeft} stroke={STROKE} strokeWidth="0.7" strokeLinejoin="round" />
      <polygon points={rightFootPoints} fill={zone.sideRight} stroke={STROKE} strokeWidth="0.7" strokeLinejoin="round" />

      {/* Top face */}
      <polygon
        points={topPoints}
        fill={zone.fill}
        stroke={STROKE}
        strokeWidth="0.9"
        strokeLinejoin="round"
      />

      {/* Surface texture overlay clipped to the diamond. */}
      <SurfaceTexture zone={zone} corners={c} />

      {/* Indoor zones: render back walls with a window cutout each. */}
      {indoor && (
        <g>
          <WallWithWindow
            points={backLeftWall}
            fill={wallLeftFill}
            stroke={STROKE}
            edge={{ from: c.top, to: c.left, height: wallH }}
            side="left"
          />
          <WallWithWindow
            points={backRightWall}
            fill={wallRightFill}
            stroke={STROKE}
            edge={{ from: c.top, to: c.right, height: wallH }}
            side="right"
          />
          {/* Roof line — a thin parallelogram cap on top of the walls so
              the cutaway has a visible roofline. */}
          <Roofline corners={c} wallH={wallH} />
        </g>
      )}
    </g>
  );
}

function WallWithWindow({
  points,
  fill,
  stroke,
  edge,
  side,
}: {
  points: string;
  fill: string;
  stroke: string;
  edge: { from: { x: number; y: number }; to: { x: number; y: number }; height: number };
  side: "left" | "right";
}) {
  // Mid-point along the wall edge — used to position a window cutout.
  const mx = (edge.from.x + edge.to.x) / 2;
  const my = (edge.from.y + edge.to.y) / 2;
  // Window dimensions in projected space — small and centred up the wall.
  const wW = 22;
  const wH = 16;
  const ox = side === "left" ? -10 : 10; // slight offset along the wall
  return (
    <g>
      <polygon points={points} fill={fill} stroke={stroke} strokeWidth="0.9" strokeLinejoin="round" />
      <rect
        x={mx + ox - wW / 2}
        y={my - edge.height / 2 - wH / 2}
        width={wW}
        height={wH}
        fill="#e8eef0"
        stroke={stroke}
        strokeWidth="0.8"
      />
      {/* window mullion */}
      <line
        x1={mx + ox}
        y1={my - edge.height / 2 - wH / 2}
        x2={mx + ox}
        y2={my - edge.height / 2 + wH / 2}
        stroke={stroke}
        strokeWidth="0.6"
      />
    </g>
  );
}

function Roofline({
  corners,
  wallH,
}: {
  corners: ReturnType<typeof zoneCorners>;
  wallH: number;
}) {
  // A thin diamond outline at the top of the walls suggesting a cut roof.
  const t = { x: corners.top.x, y: corners.top.y - wallH };
  const r = { x: corners.right.x, y: corners.right.y - wallH };
  const l = { x: corners.left.x, y: corners.left.y - wallH };
  return (
    <g opacity={0.6}>
      <line x1={t.x} y1={t.y} x2={r.x} y2={r.y} stroke={STROKE} strokeWidth="0.9" strokeDasharray="3 2" />
      <line x1={t.x} y1={t.y} x2={l.x} y2={l.y} stroke={STROKE} strokeWidth="0.9" strokeDasharray="3 2" />
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
      <g clipPath={`url(#${clipId})`} opacity={0.5}>
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
  for (let i = 0; i < 12; i++) {
    const angle = i * 0.9;
    const r = 18 + (i % 4) * 14;
    const x = cx + Math.cos(angle) * r * 1.4;
    const y = cy + Math.sin(angle) * r * 0.7;
    dots.push(<circle key={i} cx={x} cy={y} r={1.1} fill="#8a7d62" />);
  }
  return <>{dots}</>;
}

function WaterTexture({ corners }: { corners: ReturnType<typeof zoneCorners> }) {
  const lines: React.ReactNode[] = [];
  const startY = corners.top.y + 16;
  const endY = corners.bottom.y - 16;
  for (let i = 0; i < 4; i++) {
    const y = startY + i * ((endY - startY) / 3);
    const xStart = corners.left.x + 32 + (i % 2) * 18;
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
  const dashes: React.ReactNode[] = [];
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
  const tufts: React.ReactNode[] = [];
  const cx = (corners.left.x + corners.right.x) / 2;
  const cy = (corners.top.y + corners.bottom.y) / 2;
  for (let i = 0; i < 14; i++) {
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

/** Slightly lighten a hex colour by mixing with white. */
function lighten(hex: string, amount: number) {
  const m = hex.match(/^#([\da-f]{6})$/i);
  if (!m) return hex;
  const num = parseInt(m[1], 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const lr = Math.round(r + (255 - r) * amount);
  const lg = Math.round(g + (255 - g) * amount);
  const lb = Math.round(b + (255 - b) * amount);
  return `#${[lr, lg, lb].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}
