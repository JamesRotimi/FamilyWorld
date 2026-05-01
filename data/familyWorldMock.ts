// Mock data for the FamilyWorld V1 prototype.
// No backend, no DB — this file is the source of truth.

export type ItemStatus = "active" | "coming-soon";

export type Reminder = {
  text: string;
  when: string;
  urgent?: boolean;
};

export type Warranty = {
  ends: string;
  remainingText: string;
};

export type FamilyItem = {
  id: string;
  name: string;
  type: string;
  zone: ZoneId;
  status: ItemStatus;
  position: { x: number; y: number };
  glyph: string;
  /** Whether the item is currently rendered in the world. */
  placed: boolean;
  purchaseDate?: string;
  purchasedFrom?: string;
  price?: string;
  warranty?: Warranty;
  colour?: string;
  receiptStatus?: string;
  serial?: string;
  reminder?: Reminder;
  notes?: string;
  /**
   * Short, warm description of what an inactive zone will eventually do.
   * Surfaces in the hover/tap preview so the placeholder is informative,
   * not just "coming soon".
   */
  preview?: string;
};

/** Editable confirmation form passed from the Add modal to the AppShell.
 *  All fields are strings (or ZoneId) so the form layer can stay simple. */
export type ConfirmForm = {
  name: string;
  category: string;
  zone: ZoneId;
  purchaseDateISO: string; // "YYYY-MM-DD"
  price: string;
  from: string;
  colour: string;
  receipt: string;
  serial: string;
  reminder: string;
  glyph: string;
  warrantyYears?: number;
  notes?: string;
};

export type ZoneId = "home" | "child" | "docs" | "outdoor";

export type Zone = {
  id: ZoneId;
  name: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  /** Top surface fill */
  fill: string;
  /** Lighter (right-facing) side fill — sun side. */
  sideRight: string;
  /** Darker (left-facing) side fill — shadow side. */
  sideLeft: string;
  /** Hairline edge on the top surface. */
  edge: string;
  /** Subtle pattern overlay for the surface texture: "soil" | "water" | "stone" | "grass". */
  surface: "soil" | "water" | "stone" | "grass";
  labelAnchor: "top" | "right" | "bottom" | "left";
};

/* ---------- Iso projection ---------- */

export const TILE_W = 88;
export const TILE_H = 44;

/** Origin shifted so the diamond is centred horizontally in the world. */
export const WORLD_ORIGIN = { x: 440, y: 60 };

export function toScreen(x: number, y: number) {
  return {
    sx: (x - y) * (TILE_W / 2),
    sy: (x + y) * (TILE_H / 2),
  };
}

/** Pixel position for a tile (or fractional tile) in world space. */
export function tileToPx(x: number, y: number, dx = 0, dy = 0) {
  const { sx, sy } = toScreen(x, y);
  return { left: WORLD_ORIGIN.x + sx + dx, top: WORLD_ORIGIN.y + sy + dy };
}

/** Four diamond corners of a zone in screen-space, used to render the
 *  volumetric block (top face + two visible sides). */
export function zoneCorners(zone: { x0: number; y0: number; x1: number; y1: number }) {
  const ox = WORLD_ORIGIN.x;
  const oy = WORLD_ORIGIN.y;
  const W = TILE_W;
  const H = TILE_H;
  return {
    top:    { x: ox + (zone.x0 - zone.y0) * W / 2,           y: oy + (zone.x0 + zone.y0) * H / 2 },
    right:  { x: ox + (zone.x1 - zone.y0) * W / 2 + W / 2,    y: oy + (zone.x1 + zone.y0) * H / 2 + H / 2 },
    bottom: { x: ox + (zone.x1 - zone.y1) * W / 2,           y: oy + (zone.x1 + zone.y1) * H / 2 + H },
    left:   { x: ox + (zone.x0 - zone.y1) * W / 2 - W / 2,    y: oy + (zone.x0 + zone.y1) * H / 2 + H / 2 },
  };
}

/** Vertical thickness (depth) of each zone block in pixels — gives the
 *  chunky "miniature platform" feel of the reference. */
export const ZONE_DEPTH = 36;

/* ---------- Zones ---------- */

export const zones: Zone[] = [
  {
    id: "home",
    name: "Home",
    x0: 0, y0: 0, x1: 3, y1: 3,
    fill: "#D8C295",        // stone beige (token)
    sideRight: "#B8A275",
    sideLeft: "#9C865A",
    edge: "#B8A275",
    surface: "soil",
    labelAnchor: "top",
  },
  {
    id: "child",
    name: "Child Zone",
    x0: 4, y0: 0, x1: 7, y1: 3,
    fill: "#9FC0D8",        // soft sky blue (token)
    sideRight: "#82A4BD",
    sideLeft: "#658BA8",
    edge: "#82A4BD",
    surface: "water",
    labelAnchor: "top",
  },
  {
    id: "docs",
    name: "Documents",
    x0: 0, y0: 4, x1: 3, y1: 7,
    fill: "#BFB8A9",        // soft stone grey (token)
    sideRight: "#A39C8B",
    sideLeft: "#857F70",
    edge: "#A39C8B",
    surface: "stone",
    labelAnchor: "left",
  },
  {
    id: "outdoor",
    name: "Outdoor",
    x0: 4, y0: 4, x1: 7, y1: 7,
    fill: "#9AAA73",        // muted grass green (token)
    sideRight: "#7C8E58",
    sideLeft: "#607240",
    edge: "#7C8E58",
    surface: "grass",
    labelAnchor: "right",
  },
];

export const zoneById = (id: string): Zone | undefined => zones.find(z => z.id === id);

/* ---------- Items ---------- */

export const initialItems: FamilyItem[] = [
  {
    id: "bike-1",
    name: "Noah's Bike",
    type: "Child / Equipment",
    zone: "child",
    status: "active",
    placed: true,
    position: { x: 5, y: 1 },
    glyph: "🚲",
    colour: "Blue",
    receiptStatus: "Stored",
    serial: "Mock serial stored",
    purchaseDate: "12 Feb 2026",
    purchasedFrom: "Halfords",
    price: "£189",
    warranty: { ends: "12 Nov 2027", remainingText: "18 months remaining" },
    reminder: { text: "Check size/replacement in 6 months", when: "Nov 2026" },
    notes: "Mock data for prototype only.",
  },
  {
    id: "house-1",
    name: "Home docs & bills",
    type: "Home",
    zone: "home",
    status: "coming-soon",
    placed: true,
    position: { x: 1, y: 1 },
    glyph: "🏠",
    preview: "Track bills, insurance and home documents",
  },
  {
    id: "vault-1",
    name: "Family vault",
    type: "Documents",
    zone: "docs",
    status: "coming-soon",
    placed: true,
    position: { x: 1, y: 5 },
    glyph: "🗄️",
    preview: "Store passports, certificates and family records",
  },
  {
    id: "car-1",
    name: "Car service & MOT",
    type: "Vehicle",
    zone: "outdoor",
    status: "coming-soon",
    placed: true,
    position: { x: 5, y: 5 },
    glyph: "🚗",
    preview: "Manage MOT, servicing and car reminders",
  },
];

/** Default focal item for the Recent strip on first load. */
export const DEFAULT_RECENT_ID = "bike-1";

/* ---------- Add-flow presets ---------- */

export type CaptureMethod = "receipt" | "photo" | "manual";

export type ItemPreset = {
  id: string;
  name: string;
  type: string;
  zone: ZoneId;
  glyph: string;
  defaultColour?: string;
  /** Years of cover for the warranty bar (omit for items that don't carry one). */
  warrantyYears?: number;
  /** Months from today to fire the next reminder. */
  reminderInMonths?: number;
  reminderText?: string;
  notes?: string;
};

export const itemPresets: ItemPreset[] = [
  {
    id: "preset-bike",
    name: "Bike",
    type: "Child / Equipment",
    zone: "child",
    glyph: "🚲",
    defaultColour: "Blue",
    warrantyYears: 2,
    reminderInMonths: 6,
    reminderText: "Check size/replacement",
    notes: "Mock data — added via the Bike Demo flow.",
  },
  {
    id: "preset-vacuum",
    name: "Vacuum",
    type: "Appliance",
    zone: "home",
    glyph: "🧹",
    warrantyYears: 5,
    reminderInMonths: 6,
    reminderText: "Replace filter",
    notes: "Mock appliance — added via the demo flow.",
  },
  {
    id: "preset-tv",
    name: "Television",
    type: "Appliance",
    zone: "home",
    glyph: "📺",
    warrantyYears: 5,
    notes: "Mock appliance — added via the demo flow.",
  },
  {
    id: "preset-lego",
    name: "Lego set",
    type: "Toys",
    zone: "child",
    glyph: "🧱",
    notes: "Mock toy — added via the demo flow.",
  },
  {
    id: "preset-passport",
    name: "Passport",
    type: "Document",
    zone: "docs",
    glyph: "📘",
    reminderInMonths: 60,
    reminderText: "Passport expires",
    notes: "Mock document — added via the demo flow.",
  },
  {
    id: "preset-tools",
    name: "Tool cabinet",
    type: "Equipment",
    zone: "outdoor",
    glyph: "🧰",
    warrantyYears: 2,
    notes: "Mock equipment — added via the demo flow.",
  },
];

/** Find an unused tile inside a zone for a newly-placed item. */
export function findEmptyTileInZone(
  zoneId: ZoneId,
  takenPositions: Array<{ x: number; y: number }>,
): { x: number; y: number } | null {
  const zone = zones.find((z) => z.id === zoneId);
  if (!zone) return null;
  const taken = new Set(takenPositions.map((p) => `${p.x},${p.y}`));
  for (let x = zone.x0; x <= zone.x1; x++) {
    for (let y = zone.y0; y <= zone.y1; y++) {
      if (!taken.has(`${x},${y}`)) return { x, y };
    }
  }
  return null;
}

/** Format a date as "12 Feb 2026" (or similar) for the drawer. */
export function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/** Add `months` to a date and return a new Date. */
export function addMonths(d: Date, months: number): Date {
  const next = new Date(d);
  next.setMonth(next.getMonth() + months);
  return next;
}
