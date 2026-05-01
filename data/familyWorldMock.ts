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
  reminder?: Reminder;
  notes?: string;
  /**
   * Short, warm description of what an inactive zone will eventually do.
   * Surfaces in the hover/tap preview so the placeholder is informative,
   * not just "coming soon".
   */
  preview?: string;
};

export type ZoneId = "home" | "child" | "docs" | "outdoor";

export type Zone = {
  id: ZoneId;
  name: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  fill: string;
  edge: string;
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

/* ---------- Zones ---------- */

export const zones: Zone[] = [
  { id: "home",    name: "Home",       x0: 0, y0: 0, x1: 3, y1: 3, fill: "#ece2cb", edge: "#d3c8af", labelAnchor: "top" },
  { id: "child",   name: "Child Zone", x0: 4, y0: 0, x1: 7, y1: 3, fill: "#d8e3ec", edge: "#b6c5d2", labelAnchor: "top" },
  { id: "docs",    name: "Documents",  x0: 0, y0: 4, x1: 3, y1: 7, fill: "#e1ddd2", edge: "#c0baa9", labelAnchor: "left" },
  { id: "outdoor", name: "Outdoor",    x0: 4, y0: 4, x1: 7, y1: 7, fill: "#d9e1cf", edge: "#b6c0a4", labelAnchor: "right" },
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
