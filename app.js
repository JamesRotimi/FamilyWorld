/* -------------------------------------------------------------
   FamilyWorld — concept prototype
   Mock-only, no backend, no build step. Open index.html to run.
   ------------------------------------------------------------- */

const TILE_W = 88;
const TILE_H = 44;

/* World layout — 4 zones in a 2×2 plan, each 4×4 tiles. */
const ROOMS = [
  { id: "home",    name: "Home",       x0: 0, y0: 0, x1: 3, y1: 3, color: "var(--living)",   edge: "var(--living-edge)",   labelAnchor: "top" },
  { id: "child",   name: "Child Zone", x0: 4, y0: 0, x1: 7, y1: 3, color: "var(--kids)",     edge: "var(--kids-edge)",     labelAnchor: "top" },
  { id: "docs",    name: "Documents",  x0: 0, y0: 4, x1: 3, y1: 7, color: "var(--docs)",     edge: "var(--docs-edge)",     labelAnchor: "left" },
  { id: "outdoor", name: "Outdoor",    x0: 4, y0: 4, x1: 7, y1: 7, color: "var(--outdoor)",  edge: "var(--outdoor-edge)",  labelAnchor: "right" },
];

/* The Bike Demo cast.
   - Noah's Bike is the only active item; it starts unplaced and appears
     in the world after the user runs the Add flow.
   - The other items are visible placeholders for V1 ("coming soon") and
     surface a toast when tapped. */
const SEED_OBJECTS = [
  {
    id: "bike-1",
    name: "Noah's Bike",
    glyph: "🚲",
    room: "child",
    pos: { x: 5, y: 1 },
    active: true,
    placed: false,
    category: "Child / Equipment",
    colour: "Blue",
    receipt: "Stored",
    bought: { date: "12 Feb 2026", from: "Halfords", price: "£189" },
    warranty: { startsISO: "2026-02-12", endsISO: "2027-11-12", remainingText: "18 months remaining" },
    reminders: [
      { when: "Nov 2026", text: "Check size/replacement in 6 months", urgent: false },
    ],
    notes: "Mock data for prototype only.",
  },
  {
    id: "house-1",
    name: "House",
    glyph: "🏠",
    room: "home",
    pos: { x: 1, y: 1 },
    active: false,
    placed: true,
    comingSoon: true,
    category: "Home",
    notes: "Home items and rooms — coming soon.",
  },
  {
    id: "vault-1",
    name: "Document Vault",
    glyph: "🗄️",
    room: "docs",
    pos: { x: 1, y: 5 },
    active: false,
    placed: true,
    comingSoon: true,
    category: "Documents",
    notes: "Passports, certificates and important papers — coming soon.",
  },
  {
    id: "car-1",
    name: "Car",
    glyph: "🚗",
    room: "outdoor",
    pos: { x: 5, y: 5 },
    active: false,
    placed: true,
    comingSoon: true,
    category: "Vehicle",
    notes: "MOT, insurance and service reminders — coming soon.",
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

  // 3. Render placed objects, depth-sorted (front = larger x+y)
  const visible = state.objects.filter(o => o.placed);
  const sorted = visible.sort((a, b) => (a.pos.x + a.pos.y) - (b.pos.x + b.pos.y));
  for (const obj of sorted) {
    const el = createObjectEl(obj);
    worldEl.appendChild(el);
  }
}

function createObjectEl(obj) {
  const el = document.createElement("button");
  el.className = "obj";
  el.type = "button";
  el.dataset.id = obj.id;
  if (obj._spawning) el.classList.add("spawning");
  if (state.selectedId === obj.id) el.classList.add("selected");
  if (obj.comingSoon) el.classList.add("is-inactive");

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

  if (obj.comingSoon) {
    const tag = document.createElement("div");
    tag.className = "obj-soon";
    tag.textContent = "Coming soon";
    el.appendChild(tag);
  } else {
    const reminderCount = (obj.reminders || []).length;
    if (reminderCount > 0) {
      const badge = document.createElement("div");
      badge.className = "obj-badge";
      badge.textContent = reminderCount;
      el.appendChild(badge);
    }
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
  if (obj.comingSoon) {
    showToast(`${obj.name} — coming soon`);
    return;
  }

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
  const warrantyRemaining = w ? (w.remainingText || `${warrantyPct}% of cover remaining`) : null;

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
          <div class="k" style="margin-top:6px">${escapeHtml(warrantyRemaining)}</div>
        </div>
      </div>` : "";

  const detailRows = [
    { k: "Category", v: obj.category },
    obj.colour ? { k: "Colour", v: obj.colour } : null,
    obj.receipt ? { k: "Receipt", v: obj.receipt } : null,
  ].filter(Boolean);

  const detailsHtml = `
    <div class="panel-section">
      <h4>Details</h4>
      <div class="kv-grid">
        ${detailRows.map(r => `
          <div class="kv"><div class="k">${escapeHtml(r.k)}</div><div class="v">${escapeHtml(r.v)}</div></div>
        `).join("")}
      </div>
    </div>`;

  const ctaHtml = `
    <div class="panel-cta">
      <button class="cta-btn cta-primary" type="button" data-cta="add-reminder">
        <span class="cta-icon">+</span> Add reminder
      </button>
      ${obj.receipt ? `
        <button class="cta-btn cta-secondary" type="button" data-cta="view-receipt">
          <span class="cta-icon">⌕</span> View receipt
        </button>` : ""}
    </div>`;

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
      </div>
    </div>

    ${detailsHtml}

    ${warrantyHtml}

    <div class="panel-section">
      <h4>Reminders</h4>
      ${remindersHtml}
    </div>

    ${ctaHtml}

    <div class="panel-foot">${escapeHtml(obj.notes || "Mock data for prototype only.")}</div>
  `;

  panelBody.querySelectorAll("[data-cta]").forEach(btn => {
    btn.addEventListener("click", () => {
      const kind = btn.dataset.cta;
      if (kind === "add-reminder") showToast("Reminder added (mock)");
      else if (kind === "view-receipt") showToast("Receipt preview is mocked for V1");
    });
  });
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

const modalEl = document.getElementById("modal");
const modalActions = document.getElementById("modalActions");
const scanningEl = document.getElementById("scanning");
const scanningLabel = document.getElementById("scanningLabel");

function openModal() {
  modalActions.hidden = false;
  scanningEl.hidden = true;
  modalEl.classList.add("open");
  modalEl.setAttribute("aria-hidden", "false");
}

function closeModal() {
  modalEl.classList.remove("open");
  modalEl.setAttribute("aria-hidden", "true");
}

function confirmAddBike() {
  const bike = state.objects.find(o => o.id === "bike-1");
  if (!bike) return;

  // If the bike is already placed, just close and open the drawer.
  if (bike.placed) {
    closeModal();
    selectObject(bike.id);
    return;
  }

  modalActions.hidden = true;
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
      placeBike(bike);
    }
  }, 500);
}

function placeBike(bike) {
  bike.placed = true;
  bike._spawning = true;
  renderWorld();
  showToast("Noah's Bike added to your world");

  setTimeout(() => {
    bike._spawning = false;
    selectObject(bike.id);
  }, 600);
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
document.getElementById("cancelBtn").addEventListener("click", closeModal);
document.getElementById("confirmBtn").addEventListener("click", confirmAddBike);
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
