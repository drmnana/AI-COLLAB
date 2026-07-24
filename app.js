const stateKey = "music-monetization-v2";
const legacyStateKey = "music-monetization-v1";

const defaultState = {
  catalog: [
    {
      id: "midnight-signal",
      title: "Midnight Signal",
      artist: "Nova Wells",
      isrc: "QZ-ABC-26-00123",
      masterOwner: "Nova Wells LLC",
      compositionOwner: "Nova Wells Publishing",
      market: "Short-form creator pack",
      price: 350,
      aiPolicy: "opt-in-priced",
      blockedUses: ["political ads", "hate content"],
      createdAt: "2026-07-24T08:00:00.000Z"
    },
    {
      id: "river-glass",
      title: "River Glass",
      artist: "Nova Wells",
      isrc: "QZ-ABC-26-00124",
      masterOwner: "Nova Wells LLC",
      compositionOwner: "Nova Wells Publishing",
      market: "Podcast intro/outro",
      price: 275,
      aiPolicy: "manual-approval",
      blockedUses: ["political ads"],
      createdAt: "2026-07-24T08:00:00.000Z"
    },
    {
      id: "neon-orchard",
      title: "Neon Orchard",
      artist: "Nova Wells",
      isrc: "QZ-ABC-26-00125",
      masterOwner: "Nova Wells LLC",
      compositionOwner: "Nova Wells Publishing",
      market: "Indie game loop",
      price: 650,
      aiPolicy: "no-training",
      blockedUses: ["AI training", "voice cloning"],
      createdAt: "2026-07-24T08:00:00.000Z"
    }
  ],
  splits: [
    { id: "lead-artist", name: "Lead artist", role: "Composition and master", percent: 65 },
    { id: "producer", name: "Producer", role: "Beat and arrangement", percent: 20 },
    { id: "mixer", name: "Mixer", role: "Mix engineering", percent: 15 }
  ],
  simulator: {
    streams: 250000,
    streamRate: 3.2,
    membershipPrice: 8,
    subscribers: 850,
    licenseValue: 425,
    licenseDeals: 12,
    dropRevenue: 2400,
    coopFee: 12
  }
};

const campaigns = [
  {
    title: "Fan Ownership Pass",
    text: "Monthly membership unlocks stems, early releases, listening votes, and member-only licensing discounts.",
    metric: "High retention"
  },
  {
    title: "AI Opt-In License",
    text: "Creators can sell clearly scoped training or generation licenses without losing ownership of the master.",
    metric: "New demand"
  },
  {
    title: "Micro-Sync Shelf",
    text: "Pre-cleared songs are priced for podcasts, games, gyms, livestreamers, and small brands.",
    metric: "Fast sales"
  },
  {
    title: "Drop Calendar",
    text: "Limited bundles combine music, merch, community access, and behind-the-scenes assets.",
    metric: "Cash spikes"
  }
];

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

function getState() {
  const saved = localStorage.getItem(stateKey) || localStorage.getItem(legacyStateKey);
  if (!saved) return structuredClone(defaultState);
  try {
    return normalizeState(JSON.parse(saved));
  } catch {
    return structuredClone(defaultState);
  }
}

let appState = getState();

function normalizeState(state) {
  const base = structuredClone(defaultState);
  return {
    catalog: Array.isArray(state.catalog) ? state.catalog.map(normalizeSong) : base.catalog,
    splits: Array.isArray(state.splits) ? state.splits.map(normalizeSplit) : base.splits,
    simulator: { ...base.simulator, ...(state.simulator || {}) }
  };
}

function normalizeSong(song) {
  const title = String(song.title || "Untitled song").trim();
  return {
    id: song.id || slugify(title),
    title,
    artist: String(song.artist || "Unknown artist").trim(),
    isrc: String(song.isrc || "").trim(),
    masterOwner: String(song.masterOwner || song.artist || "Unassigned master owner").trim(),
    compositionOwner: String(song.compositionOwner || song.artist || "Unassigned composition owner").trim(),
    market: String(song.market || "Podcast intro/outro").trim(),
    price: Number(song.price) || 0,
    aiPolicy: song.aiPolicy || inferAiPolicy(song.market),
    blockedUses: Array.isArray(song.blockedUses) ? song.blockedUses : parseList(song.blockedUses || ""),
    createdAt: song.createdAt || new Date().toISOString()
  };
}

function normalizeSplit(split) {
  const name = String(split.name || "Unnamed collaborator").trim();
  return {
    id: split.id || slugify(name),
    name,
    role: String(split.role || "Contributor").trim(),
    percent: clampPercent(Number(split.percent) || 0)
  };
}

function saveState() {
  localStorage.setItem(stateKey, JSON.stringify(appState));
}

function numberValue(id) {
  return Number(document.getElementById(id).value) || 0;
}

function calculate() {
  const simulator = {
    streams: numberValue("streams"),
    streamRate: numberValue("streamRate"),
    membershipPrice: numberValue("membershipPrice"),
    subscribers: numberValue("subscribers"),
    licenseValue: numberValue("licenseValue"),
    licenseDeals: numberValue("licenseDeals"),
    dropRevenue: numberValue("dropRevenue"),
    coopFee: numberValue("coopFee")
  };

  appState.simulator = simulator;
  saveState();

  const streamingGross = (simulator.streams / 1000) * simulator.streamRate;
  const membershipGross = simulator.membershipPrice * simulator.subscribers;
  const licenseGross = simulator.licenseValue * simulator.licenseDeals;
  const cooperativeGross = membershipGross + licenseGross + simulator.dropRevenue + streamingGross;
  const platformShare = cooperativeGross * (simulator.coopFee / 100);
  const creatorNet = cooperativeGross - platformShare;
  const uplift = streamingGross > 0 ? ((creatorNet - streamingGross) / streamingGross) * 100 : 0;
  const retainedMargin = cooperativeGross > 0 ? (creatorNet / cooperativeGross) * 100 : 0;

  document.getElementById("streamingRevenue").textContent = formatter.format(streamingGross);
  document.getElementById("coopRevenue").textContent = formatter.format(creatorNet);
  document.getElementById("creatorNet").textContent = formatter.format(creatorNet);
  document.getElementById("platformShare").textContent = formatter.format(platformShare);
  document.getElementById("directFans").textContent = simulator.subscribers.toLocaleString();
  document.getElementById("licenseCount").textContent = simulator.licenseDeals.toLocaleString();
  document.getElementById("retainedMargin").textContent = `${Math.round(retainedMargin)}%`;
  document.getElementById("upliftOutput").textContent = `${Math.round(uplift).toLocaleString()}% uplift`;
}

function renderCatalog() {
  const list = document.getElementById("catalogList");
  list.innerHTML = "";
  appState.catalog.forEach((song, index) => {
    const item = document.createElement("div");
    item.className = "item registry-item";
    item.innerHTML = `
      <div>
        <strong>${escapeHtml(song.title)} <small>${escapeHtml(song.artist)}</small></strong>
        <span>${escapeHtml(song.market)} - ${formatter.format(song.price)}</span>
        <span>Master: ${escapeHtml(song.masterOwner)} | Composition: ${escapeHtml(song.compositionOwner)}</span>
        <span>ID: ${escapeHtml(song.isrc || song.id)} | AI: ${escapeHtml(formatAiPolicy(song.aiPolicy))}</span>
        <span>Blocked: ${escapeHtml(song.blockedUses.length ? song.blockedUses.join(", ") : "none declared")}</span>
      </div>
      <button type="button" aria-label="Remove ${escapeHtml(song.title)}">Remove</button>
    `;
    item.querySelector("button").addEventListener("click", () => {
      appState.catalog.splice(index, 1);
      saveState();
      renderCatalog();
    });
    list.appendChild(item);
  });
}

function renderSplits() {
  const list = document.getElementById("splitList");
  const total = getSplitTotal();
  list.innerHTML = "";
  appState.splits.forEach((split, index) => {
    const item = document.createElement("div");
    item.className = "item";
    item.innerHTML = `
      <div>
        <strong>${escapeHtml(split.name)} - ${split.percent}%</strong>
        <span>${escapeHtml(split.role)}</span>
      </div>
      <button type="button" aria-label="Remove ${escapeHtml(split.name)}">Remove</button>
    `;
    item.querySelector("button").addEventListener("click", () => {
      appState.splits.splice(index, 1);
      saveState();
      renderSplits();
    });
    list.appendChild(item);
  });

  const totalItem = document.createElement("div");
  totalItem.className = `item split-total ${total === 100 ? "is-valid" : "is-invalid"}`;
  totalItem.innerHTML = `
    <div>
      <strong>Total split: ${total}%</strong>
      <span>${total === 100 ? "Ready for transparent payout routing." : "Payout exports will stay blocked until shares total exactly 100%."}</span>
    </div>
  `;
  list.appendChild(totalItem);
}

function renderCampaigns() {
  const container = document.getElementById("campaigns");
  container.innerHTML = campaigns.map((campaign) => `
    <article class="campaign">
      <b>${campaign.title}</b>
      <p>${campaign.text}</p>
      <mark>${campaign.metric}</mark>
    </article>
  `).join("");
}

function setupForms() {
  document.querySelectorAll(".simulator-grid input").forEach((input) => {
    input.addEventListener("input", calculate);
  });

  document.getElementById("catalogForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const title = document.getElementById("songTitle").value.trim();
    const artist = document.getElementById("songArtist").value.trim();
    const masterOwner = document.getElementById("masterOwner").value.trim();
    const compositionOwner = document.getElementById("compositionOwner").value.trim();
    if (!title || !artist || !masterOwner || !compositionOwner) return;

    appState.catalog.push({
      id: uniqueSongId(title),
      title,
      artist,
      isrc: document.getElementById("songIsrc").value.trim(),
      masterOwner,
      compositionOwner,
      market: document.getElementById("songMarket").value,
      price: numberValue("songPrice"),
      aiPolicy: document.getElementById("aiPolicy").value,
      blockedUses: parseList(document.getElementById("blockedUses").value),
      createdAt: new Date().toISOString()
    });
    event.target.reset();
    document.getElementById("songPrice").value = 350;
    saveState();
    renderCatalog();
  });

  document.getElementById("splitForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("splitName").value.trim();
    const role = document.getElementById("splitRole").value.trim();
    const percent = clampPercent(numberValue("splitPercent"));
    if (!name || !role || percent <= 0) return;

    appState.splits.push({
      id: uniqueSplitId(name),
      name,
      role,
      percent
    });
    event.target.reset();
    document.getElementById("splitPercent").value = 15;
    saveState();
    renderSplits();
  });

  document.getElementById("seedDemo").addEventListener("click", () => {
    appState = structuredClone(defaultState);
    saveState();
    hydrateInputs();
    renderCatalog();
    renderSplits();
    calculate();
  });

  document.getElementById("exportPlan").addEventListener("click", () => {
    const payload = JSON.stringify({
      ...appState,
      splitStatus: {
        totalPercent: getSplitTotal(),
        payoutExportReady: getSplitTotal() === 100
      },
      exportedAt: new Date().toISOString()
    }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "music-monetization-plan.json";
    link.click();
    URL.revokeObjectURL(url);
  });
}

function hydrateInputs() {
  Object.entries(appState.simulator).forEach(([id, value]) => {
    const input = document.getElementById(id);
    if (input) input.value = value;
  });
}

function uniqueSongId(title) {
  return uniqueId(slugify(title), appState.catalog.map((song) => song.id));
}

function uniqueSplitId(name) {
  return uniqueId(slugify(name), appState.splits.map((split) => split.id));
}

function uniqueId(base, existingIds) {
  let id = base || "item";
  let suffix = 2;
  while (existingIds.includes(id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }
  return id;
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";
}

function parseList(value) {
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function clampPercent(value) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function getSplitTotal() {
  return appState.splits.reduce((sum, split) => sum + Number(split.percent), 0);
}

function inferAiPolicy(market) {
  if (String(market).toLowerCase().includes("exclusion")) return "no-training";
  if (String(market).toLowerCase().includes("ai")) return "opt-in-priced";
  return "manual-approval";
}

function formatAiPolicy(policy) {
  return {
    "opt-in-priced": "opt-in priced",
    "no-training": "no training",
    "manual-approval": "manual approval"
  }[policy] || policy;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

saveState();
hydrateInputs();
setupForms();
renderCatalog();
renderSplits();
renderCampaigns();
calculate();
