/* -------------------------------------------------------------
   FamilyWorld — concept prototype
   Mock-only, no backend, no build step. Open index.html to run.
   ------------------------------------------------------------- */

const TILE_W = 88;
const TILE_H = 44;

/* World layout — 5 zones on an 8×8 isometric grid.
   labelAnchor is one of "top" | "right" | "bottom" | "left", placing the label
   just outside that iso corner of the zone so it never sits on objects. */
const ROOMS = [
  { id: "living",   name: "Living Room", x0: 0, y0: 0, x1: 3, y1: 3, color: "var(--living)",   edge: "var(--living-edge)",   labelAnchor: "top" },
  { id: "kids",     name: "Kid's Room",  x0: 4, y0: 0, x1: 7, y1: 3, color: "var(--kids)",     edge: "var(--kids-edge)",     labelAnchor: "top" },
  { id: "kitchen",  name: "Kitchen",     x0: 0, y0: 4, x1: 3, y1: 7, color: "var(--kitchen)",  edge: "var(--kitchen-edge)",  labelAnchor: "left" },
  { id: "outdoor",  name: "Outdoor",     x0: 4, y0: 4, x1: 5, y1: 7, color: "var(--outdoor)",  edge: "var(--outdoor-edge)",  labelAnchor: "bottom" },
  { id: "docs",     name: "Documents",   x0: 6, y0: 4, x1: 7, y1: 7, color: "var(--docs)",     edge: "var(--docs-edge)",     labelAnchor: "right" },
];

/* Mock objects — each one is a real-life thing FamilyWorld remembers. */
const SEED_OBJECTS = [
  {
    id: "bike-1",
    name: "Sam's Bike",
    glyph: "🚲",
    room: "kids",
    pos: { x: 5, y: 1 },
    category: "Outdoor",
    bought: { date: "12 Jun 2025", from: "Halfords", price: "£189" },
    warranty: { startsISO: "2025-06-12", endsISO: "2027-06-12" },
    reminders: [
      { when: "Jun 2026", text: "Annual bike service due", urgent: false },
      { when: "Dec 2026", text: "Sam may have outgrown this — try the lending scheme", urgent: false },
    ],
    notes: "Blue mountain bike, frame size M. Insurance bundled with home policy.",
  },
  {
    id: "hoover-1",
    name: "Dyson V11",
    glyph: "🧹",
    room: "living",
    pos: { x: 1, y: 2 },
    category: "Appliance",
    bought: { date: "03 Mar 2024", from: "John Lewis", price: "£399" },
    warranty: { startsISO: "2024-03-03", endsISO: "2026-03-03" },
    reminders: [
      { when: "May 2026", text: "Replacement filter due — 6 months since last", urgent: true },
      { when: "Mar 2026", text: "Warranty expiring soon — extend?", urgent: true },
    ],
    notes: "Cordless. Dock is in the under-stairs cupboard.",
  },
  {
    id: "sofa-1",
    name: "Big Green Sofa",
    glyph: "🛋️",
    room: "living",
    pos: { x: 2, y: 0 },
    category: "Furniture",
    bought: { date: "21 Sep 2023", from: "Made.com", price: "£1,240" },
    warranty: { startsISO: "2023-09-21", endsISO: "2028-09-21" },
    reminders: [],
    notes: "5-year frame warranty. Covers stain-protected.",
  },
  {
    id: "tv-1",
    name: "Living Room TV",
    glyph: "📺",
    room: "living",
    pos: { x: 0, y: 1 },
    category: "Appliance",
    bought: { date: "11 Nov 2024", from: "Currys", price: "£749" },
    warranty: { startsISO: "2024-11-11", endsISO: "2029-11-11" },
    reminders: [
      { when: "Nov 2026", text: "TV licence renewal", urgent: false },
    ],
    notes: "55\" OLED. Wall mount. Remote in side drawer.",
  },
  {
    id: "fridge-1",
    name: "Family Fridge",
    glyph: "🧊",
    room: "kitchen",
    pos: { x: 1, y: 5 },
    category: "Appliance",
    bought: { date: "08 Jan 2024", from: "AO", price: "£899" },
    warranty: { startsISO: "2024-01-08", endsISO: "2026-01-08" },
    reminders: [
      { when: "Past due", text: "Warranty expired — consider extending", urgent: true },
    ],
    notes: "American style, water filter changed Jan 2026.",
  },
  {
    id: "coffee-1",
    name: "Coffee Machine",
    glyph: "☕",
    room: "kitchen",
    pos: { x: 2, y: 6 },
    category: "Appliance",
    bought: { date: "14 Feb 2025", from: "John Lewis", price: "£329" },
    warranty: { startsISO: "2025-02-14", endsISO: "2027-02-14" },
    reminders: [
      { when: "May 2026", text: "Descale due — last cleaned 4 months ago", urgent: true },
    ],
    notes: "Bean-to-cup. Beans live in the top cupboard.",
  },
  {
    id: "tablet-1",
    name: "Family iPad",
    glyph: "📱",
    room: "kids",
    pos: { x: 6, y: 2 },
    category: "Tech",
    bought: { date: "02 Dec 2024", from: "Apple", price: "£499" },
    warranty: { startsISO: "2024-12-02", endsISO: "2026-12-02" },
    reminders: [
      { when: "Dec 2026", text: "AppleCare renewal window", urgent: false },
    ],
    notes: "Shared kids' iPad. Screen-time limits set.",
  },
  {
    id: "car-1",
    name: "Family Car",
    glyph: "🚗",
    room: "outdoor",
    pos: { x: 5, y: 5 },
    category: "Vehicle",
    bought: { date: "06 Apr 2022", from: "Arnold Clark", price: "£18,500" },
    warranty: { startsISO: "2022-04-06", endsISO: "2027-04-06" },
    reminders: [
      { when: "Jun 2026", text: "MOT due", urgent: true },
      { when: "Aug 2026", text: "Service due (every 12 months)", urgent: false },
      { when: "Apr 2027", text: "Insurance renewal", urgent: false },
    ],
    notes: "VW Golf, plate AB22 XYZ. Service book in glovebox.",
  },
  {
    id: "tools-1",
    name: "Tool Cabinet",
    glyph: "🧰",
    room: "outdoor",
    pos: { x: 4, y: 7 },
    category: "Equipment",
    bought: { date: "19 Aug 2023", from: "B&Q", price: "£140" },
    warranty: { startsISO: "2023-08-19", endsISO: "2025-08-19" },
    reminders: [],
    notes: "Lockable. Spare key in kitchen drawer.",
  },
  {
    id: "passport-1",
    name: "Family Documents",
    glyph: "📁",
    room: "docs",
    pos: { x: 7, y: 5 },
    category: "Documents",
    bought: { date: "—", from: "—", price: "—" },
    warranty: null,
    reminders: [
      { when: "Sep 2026", text: "Sam's passport expires", urgent: true },
      { when: "Mar 2027", text: "Driving licence renewal", urgent: false },
    ],
    notes: "Birth certificates, passports, marriage certificate. Stored in fire-safe.",
  },
];

/* ---------- State ---------- */

const state = {
  objects: deepCopy(SEED_OBJECTS),
  selectedId: null,
  recentId: "bike-1",
  expandedRooms: new Set(),
  searchQuery: "",
};

const HERO_LIMIT = 2;

function deepCopy(v) { return JSON.parse(JSON.stringify(v)); }

/* ---------- Coords ---------- */

function toScreen(x, y) {
  return {
    sx: (x - y) * (TILE_W / 2),
    sy: (x + y) * (TILE_H / 2),
  };
}

/* World origin: shift so the diamond is centred horizontally and starts near top. */
const WORLD_ORIGIN = { x: 440, y: 60 };

function placeAt(el, gx, gy, extraDx = 0, extraDy = 0) {
  const { sx, sy } = toScreen(gx, gy);
  el.style.left = WORLD_ORIGIN.x + sx + extraDx + "px";
  el.style.top  = WORLD_ORIGIN.y + sy + extraDy + "px";
}

/* ---------- Render world ---------- */

const worldEl = document.getElementById("world");

function renderWorld() {
  worldEl.innerHTML = "";

  // 1. Tiles, room by room
  for (const room of ROOMS) {
    for (let x = room.x0; x <= room.x1; x++) {
      for (let y = room.y0; y <= room.y1; y++) {
        const tile = document.createElement("div");
        tile.className = "tile";
        const isEdge = (x === room.x0 || x === room.x1 || y === room.y0 || y === room.y1);
        if (isEdge) tile.classList.add("is-edge");

        const shape = document.createElement("div");
        shape.className = "tile-shape";
        shape.style.setProperty("--floor", room.color);
        shape.style.borderColor = room.edge;
        tile.appendChild(shape);

        placeAt(tile, x, y);
        worldEl.appendChild(tile);
      }
    }
  }

  // 2. Floating room labels — placed just outside each zone, never behind objects
  for (const room of ROOMS) {
    const label = document.createElement("div");
    label.className = "room-label";
    label.textContent = room.name;

    let cx, cy, dx = 0, dy = 0;
    switch (room.labelAnchor) {
      case "top":
        cx = room.x0 + 0.5; cy = room.y0 + 0.5; dy = -50; break;
      case "bottom":
        cx = room.x1 + 0.5; cy = room.y1 + 0.5; dy = 50; break;
      case "left":
        cx = room.x0 + 0.5; cy = room.y1 + 0.5; dx = -36; dy = 8; break;
      case "right":
        cx = room.x1 + 0.5; cy = room.y0 + 0.5; dx = 36; dy = 8; break;
      default:
        cx = (room.x0 + room.x1) / 2 + 0.5; cy = (room.y0 + room.y1) / 2 + 0.5;
    }
    placeAt(label, cx, cy, dx, dy);
    label.style.transform = "translate(-50%, -50%)";
    worldEl.appendChild(label);
  }

  // 3. Decide which objects are visible (heroes) and which are collapsed.
  const objectsByRoom = new Map();
  for (const room of ROOMS) objectsByRoom.set(room.id, []);
  for (const obj of state.objects) {
    if (objectsByRoom.has(obj.room)) objectsByRoom.get(obj.room).push(obj);
  }

  const visible = [];
  for (const room of ROOMS) {
    const items = rankRoomItems(objectsByRoom.get(room.id) || []);
    const expanded = state.expandedRooms.has(room.id);
    const heroes = expanded ? items : items.slice(0, HERO_LIMIT);
    const hidden = expanded ? [] : items.slice(HERO_LIMIT);

    for (const obj of heroes) visible.push(obj);

    if (hidden.length > 0) {
      const anchor = heroes[heroes.length - 1] || items[0];
      const pill = createMoreEl(room, hidden.length, anchor);
      worldEl.appendChild(pill);
    } else if (expanded && items.length > HERO_LIMIT) {
      const anchor = items[items.length - 1];
      const pill = createCollapseEl(room, anchor);
      worldEl.appendChild(pill);
    }
  }

  // 4. Objects, depth-sorted (front = larger x+y)
  const sorted = visible.sort((a, b) => (a.pos.x + a.pos.y) - (b.pos.x + b.pos.y));
  for (const obj of sorted) {
    const el = createObjectEl(obj);
    worldEl.appendChild(el);
  }
}

/* Importance ranking — items with urgent reminders first, then by reminder count, then by name. */
function rankRoomItems(items) {
  const score = (o) => {
    const r = o.reminders || [];
    return r.filter(x => x.urgent).length * 100 + r.length * 10;
  };
  return [...items].sort((a, b) => {
    const d = score(b) - score(a);
    return d !== 0 ? d : a.name.localeCompare(b.name);
  });
}

function createMoreEl(room, count, anchor) {
  const el = document.createElement("button");
  el.className = "more-pill";
  el.type = "button";
  el.textContent = `+${count}`;
  el.title = `Show ${count} more in ${room.name}`;
  el.setAttribute("aria-label", el.title);
  // Place near the anchor object (slightly up and to the right)
  placeAt(el, anchor.pos.x + 0.5, anchor.pos.y + 0.5, 32, -52);
  el.addEventListener("click", (e) => {
    e.stopPropagation();
    state.expandedRooms.add(room.id);
    renderWorld();
  });
  return el;
}

function createCollapseEl(room, anchor) {
  const el = document.createElement("button");
  el.className = "more-pill is-collapse";
  el.type = "button";
  el.textContent = "−";
  el.title = `Collapse ${room.name}`;
  el.setAttribute("aria-label", el.title);
  placeAt(el, anchor.pos.x + 0.5, anchor.pos.y + 0.5, 32, -52);
  el.addEventListener("click", (e) => {
    e.stopPropagation();
    state.expandedRooms.delete(room.id);
    renderWorld();
  });
  return el;
}

function createObjectEl(obj) {
  const el = document.createElement("button");
  el.className = "obj";
  el.type = "button";
  el.dataset.id = obj.id;
  if (obj._spawning) el.classList.add("spawning");
  if (state.selectedId === obj.id) el.classList.add("selected");

  const shadow = document.createElement("div");
  shadow.className = "obj-shadow";
  el.appendChild(shadow);

  const glyph = document.createElement("div");
  glyph.className = "obj-glyph";
  glyph.textContent = obj.glyph;
  el.appendChild(glyph);

  const label = document.createElement("div");
  label.className = "obj-label";
  label.textContent = obj.name;
  el.appendChild(label);

  const reminderCount = (obj.reminders || []).length;
  if (reminderCount > 0) {
    const badge = document.createElement("div");
    badge.className = "obj-badge";
    badge.textContent = reminderCount;
    el.appendChild(badge);
  }

  // Place the object's anchor at the centre of its tile
  placeAt(el, obj.pos.x + 0.5, obj.pos.y + 0.5);

  el.addEventListener("click", () => selectObject(obj.id));
  return el;
}

/* ---------- Info panel ---------- */

const panelEl = document.getElementById("panel");
const panelBody = document.getElementById("panelBody");

function selectObject(id) {
  const obj = state.objects.find(o => o.id === id);
  if (!obj) return;
  state.selectedId = id;
  state.recentId = id;

  hideHint();
  renderPanel(obj);
  panelEl.classList.add("open");
  panelEl.setAttribute("aria-hidden", "false");
  panelScrim.classList.add("show");

  // re-render world to show selection ring, and refresh the recent strip
  renderWorld();
  renderRecent();
}

function closePanel() {
  panelEl.classList.remove("open");
  panelEl.setAttribute("aria-hidden", "true");
  panelScrim.classList.remove("show");
  state.selectedId = null;
  renderWorld();
}

function renderPanel(obj) {
  const w = obj.warranty;
  const warrantyPct = w ? warrantyPercentRemaining(w) : null;
  const warrantyEnds = w ? formatISO(w.endsISO) : null;

  const remindersHtml = (obj.reminders && obj.reminders.length)
    ? obj.reminders.map(r => `
        <div class="reminder">
          <div class="reminder-icon ${r.urgent ? "urgent" : ""}">${r.urgent ? "!" : "•"}</div>
          <div>
            <div class="reminder-text">${escapeHtml(r.text)}</div>
            <div class="reminder-when">${escapeHtml(r.when)}</div>
          </div>
        </div>`).join("")
    : `<div class="notes">No reminders. FamilyWorld will nudge you when something's due.</div>`;

  const warrantyHtml = w
    ? `
      <div class="panel-section">
        <h4>Warranty</h4>
        <div class="kv">
          <div class="k">Ends</div>
          <div class="v">${escapeHtml(warrantyEnds)}</div>
          <div class="warranty-bar"><div class="warranty-bar-fill" style="width:${warrantyPct}%"></div></div>
          <div class="k" style="margin-top:6px">${warrantyPct}% of cover remaining</div>
        </div>
      </div>` : "";

  panelBody.innerHTML = `
    <div class="panel-hero">
      <div class="panel-hero-glyph">${obj.glyph}</div>
      <div>
        <div class="panel-hero-meta">${escapeHtml(obj.category)} · ${escapeHtml(roomName(obj.room))}</div>
        <h3>${escapeHtml(obj.name)}</h3>
      </div>
    </div>

    <div class="panel-section">
      <h4>Purchase</h4>
      <div class="kv-grid">
        <div class="kv"><div class="k">When</div><div class="v">${escapeHtml(obj.bought.date)}</div></div>
        <div class="kv"><div class="k">From</div><div class="v">${escapeHtml(obj.bought.from)}</div></div>
        <div class="kv"><div class="k">Price</div><div class="v">${escapeHtml(obj.bought.price)}</div></div>
        <div class="kv"><div class="k">Category</div><div class="v">${escapeHtml(obj.category)}</div></div>
      </div>
    </div>

    ${warrantyHtml}

    <div class="panel-section">
      <h4>Reminders</h4>
      ${remindersHtml}
    </div>

    <div class="panel-section">
      <h4>Notes</h4>
      <div class="notes">${escapeHtml(obj.notes || "—")}</div>
    </div>
  `;
}

function warrantyPercentRemaining(w) {
  const start = new Date(w.startsISO).getTime();
  const end = new Date(w.endsISO).getTime();
  const now = Date.now();
  if (now <= start) return 100;
  if (now >= end) return 0;
  return Math.round(((end - now) / (end - start)) * 100);
}

function formatISO(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function roomName(id) {
  return ROOMS.find(r => r.id === id)?.name || id;
}

/* ---------- Add modal ---------- */

const PRESETS = [
  { name: "Mountain Bike",  glyph: "🚲",  room: "kids",    category: "Outdoor",   warrantyYears: 2,
    reminders: [{ when: "+12 months", text: "Annual service due", urgent: false }],
    notes: "Receipt scanned. Insurance bundled with home policy." },
  { name: "Vacuum Cleaner", glyph: "🧹",  room: "living",  category: "Appliance", warrantyYears: 5,
    reminders: [{ when: "+6 months", text: "Replacement filter due", urgent: false }],
    notes: "Cordless model. Dock under stairs." },
  { name: "Tablet",         glyph: "📱",  room: "kids",    category: "Tech",      warrantyYears: 2,
    reminders: [{ when: "+24 months", text: "AppleCare renewal window", urgent: false }],
    notes: "Family device with screen-time limits." },
  { name: "Coffee Machine", glyph: "☕",  room: "kitchen", category: "Appliance", warrantyYears: 2,
    reminders: [{ when: "+4 months", text: "Descale due", urgent: false }],
    notes: "Bean-to-cup machine." },
  { name: "Lego Set",       glyph: "🧱",  room: "kids",    category: "Toys",      warrantyYears: 0,
    reminders: [{ when: "Birthday", text: "Sam's wishlist — saved for Dec", urgent: false }],
    notes: "Stored in toy chest." },
  { name: "Smart Speaker",  glyph: "🔊",  room: "kitchen", category: "Tech",      warrantyYears: 2,
    reminders: [],
    notes: "Linked to family account." },
];

const modalEl = document.getElementById("modal");
const presetGrid = document.getElementById("presetGrid");
const scanningEl = document.getElementById("scanning");
const scanningLabel = document.getElementById("scanningLabel");

function openModal() {
  presetGrid.hidden = false;
  scanningEl.hidden = true;
  presetGrid.innerHTML = PRESETS.map((p, i) => `
    <button class="preset" data-i="${i}" type="button">
      <div class="preset-icon">${p.glyph}</div>
      <div class="preset-name">${p.name}</div>
      <div class="preset-room">${roomName(p.room)}</div>
    </button>
  `).join("");
  presetGrid.querySelectorAll(".preset").forEach(btn => {
    btn.addEventListener("click", () => {
      const i = parseInt(btn.dataset.i, 10);
      pickPreset(PRESETS[i]);
    });
  });

  modalEl.classList.add("open");
  modalEl.setAttribute("aria-hidden", "false");
}

function closeModal() {
  modalEl.classList.remove("open");
  modalEl.setAttribute("aria-hidden", "true");
}

function pickPreset(preset) {
  // Show fake scanning animation, then spawn the object.
  presetGrid.hidden = true;
  scanningEl.hidden = false;
  const messages = [
    "Scanning receipt…",
    "Reading purchase date…",
    "Detecting warranty terms…",
    "Placing in your world…",
  ];
  let step = 0;
  scanningLabel.textContent = messages[0];
  const t = setInterval(() => {
    step++;
    if (step < messages.length) {
      scanningLabel.textContent = messages[step];
    } else {
      clearInterval(t);
      closeModal();
      spawnFromPreset(preset);
    }
  }, 550);
}

function spawnFromPreset(preset) {
  const pos = findEmptyTileInRoom(preset.room) || { x: 0, y: 0 };
  const today = new Date();
  const ends = new Date(today);
  ends.setFullYear(ends.getFullYear() + (preset.warrantyYears || 0));

  const newObj = {
    id: "obj-" + Math.random().toString(36).slice(2, 8),
    name: preset.name,
    glyph: preset.glyph,
    room: preset.room,
    pos,
    category: preset.category,
    bought: {
      date: today.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      from: "Scanned receipt",
      price: ["£" + (49 + Math.floor(Math.random() * 350)), "£" + (199 + Math.floor(Math.random() * 600))][Math.random() < 0.5 ? 0 : 1],
    },
    warranty: preset.warrantyYears > 0 ? {
      startsISO: today.toISOString().slice(0, 10),
      endsISO: ends.toISOString().slice(0, 10),
    } : null,
    reminders: preset.reminders,
    notes: preset.notes,
    _spawning: true,
  };

  state.objects.push(newObj);
  renderWorld();
  showToast(`${preset.name} added to ${roomName(preset.room)}`);

  // After spawn animation, drop the flag and auto-open the panel.
  setTimeout(() => {
    newObj._spawning = false;
    selectObject(newObj.id);
  }, 600);
}

function findEmptyTileInRoom(roomId) {
  const room = ROOMS.find(r => r.id === roomId);
  if (!room) return null;
  const taken = new Set(state.objects.filter(o => o.room === roomId).map(o => `${o.pos.x},${o.pos.y}`));
  for (let x = room.x0; x <= room.x1; x++) {
    for (let y = room.y0; y <= room.y1; y++) {
      if (!taken.has(`${x},${y}`)) return { x, y };
    }
  }
  return null;
}

/* ---------- Toast / hint ---------- */

const toastEl = document.getElementById("toast");
let toastTimer;
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2400);
}

const hintEl = document.getElementById("hint");
function hideHint() { hintEl.classList.add("gone"); }

/* ---------- Helpers ---------- */

function escapeHtml(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ---------- Search ---------- */

const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

function runSearch(q) {
  state.searchQuery = q;
  const query = q.trim().toLowerCase();
  if (!query) {
    searchResults.hidden = true;
    searchResults.innerHTML = "";
    return;
  }
  const matches = state.objects.filter(o => {
    return o.name.toLowerCase().includes(query)
      || o.category.toLowerCase().includes(query)
      || (o.notes || "").toLowerCase().includes(query)
      || roomName(o.room).toLowerCase().includes(query);
  }).slice(0, 6);

  if (matches.length === 0) {
    searchResults.innerHTML = `<div class="search-empty">No items match “${escapeHtml(q)}”.</div>`;
  } else {
    searchResults.innerHTML = matches.map(o => `
      <button class="search-result" type="button" data-id="${o.id}">
        <span class="search-result-glyph">${o.glyph}</span>
        <span class="search-result-text">
          <span class="search-result-name">${escapeHtml(o.name)}</span>
          <span class="search-result-meta">${escapeHtml(o.category)} · ${escapeHtml(roomName(o.room))}</span>
        </span>
      </button>
    `).join("");
    searchResults.querySelectorAll(".search-result").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        clearSearch();
        selectObject(id);
      });
    });
  }
  searchResults.hidden = false;
}

function clearSearch() {
  searchInput.value = "";
  state.searchQuery = "";
  searchResults.hidden = true;
  searchResults.innerHTML = "";
}

/* ---------- Recent strip ---------- */

const recentTrack = document.getElementById("recentTrack");

function recentSummary(obj) {
  const r = (obj.reminders || []).find(x => !!x);
  if (r) {
    const text = r.text.replace(/\s+\(.*\)$/, "");
    const short = text.length > 36 ? text.slice(0, 33) + "…" : text;
    return `${short} · ${r.when}`;
  }
  if (obj.warranty) return `Warranty ${formatISO(obj.warranty.endsISO)}`;
  return `${obj.category} · ${roomName(obj.room)}`;
}

function renderRecent() {
  const obj = state.objects.find(o => o.id === state.recentId);
  if (!obj) {
    recentTrack.innerHTML = "";
    return;
  }
  recentTrack.innerHTML = `
    <button class="recent-chip" type="button" data-id="${obj.id}">
      <span class="recent-chip-glyph">${obj.glyph}</span>
      <span class="recent-chip-text">
        <span class="recent-chip-name">${escapeHtml(obj.name)}</span>
        <span class="recent-chip-sub">${escapeHtml(recentSummary(obj))}</span>
      </span>
    </button>
  `;
  recentTrack.querySelector(".recent-chip").addEventListener("click", () => {
    selectObject(obj.id);
  });
}

/* ---------- Wire up ---------- */

const panelScrim = document.getElementById("panelScrim");

document.getElementById("addBtn").addEventListener("click", openModal);
document.getElementById("modalClose").addEventListener("click", closeModal);
document.getElementById("panelClose").addEventListener("click", closePanel);
panelScrim.addEventListener("click", closePanel);
document.getElementById("resetBtn").addEventListener("click", () => {
  state.objects = deepCopy(SEED_OBJECTS);
  state.selectedId = null;
  state.recentId = "bike-1";
  state.expandedRooms = new Set();
  clearSearch();
  closePanel();
  renderWorld();
  renderRecent();
  showToast("World reset");
});

searchInput.addEventListener("input", (e) => runSearch(e.target.value));
searchInput.addEventListener("focus", () => {
  if (searchInput.value.trim()) runSearch(searchInput.value);
});
document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-wrap")) {
    searchResults.hidden = true;
  }
});

modalEl.addEventListener("click", (e) => {
  if (e.target === modalEl) closeModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (modalEl.classList.contains("open")) closeModal();
    else if (!searchResults.hidden) clearSearch();
    else if (panelEl.classList.contains("open")) closePanel();
  }
});

renderWorld();
renderRecent();
