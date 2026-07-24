const stateKey = "music-monetization-v1";

const defaultState = {
  catalog: [
    { title: "Midnight Signal", market: "Short-form creator pack", price: 350 },
    { title: "River Glass", market: "Podcast intro/outro", price: 275 },
    { title: "Neon Orchard", market: "Indie game loop", price: 650 }
  ],
  splits: [
    { name: "Lead artist", role: "Composition and master", percent: 65 },
    { name: "Producer", role: "Beat and arrangement", percent: 20 },
    { name: "Mixer", role: "Mix engineering", percent: 15 }
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
  const saved = localStorage.getItem(stateKey);
  if (!saved) return structuredClone(defaultState);
  try {
    return { ...structuredClone(defaultState), ...JSON.parse(saved) };
  } catch {
    return structuredClone(defaultState);
  }
}

let appState = getState();

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
    item.className = "item";
    item.innerHTML = `
      <div>
        <strong>${escapeHtml(song.title)}</strong>
        <span>${escapeHtml(song.market)} - ${formatter.format(song.price)}</span>
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
  const total = appState.splits.reduce((sum, split) => sum + Number(split.percent), 0);
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
  totalItem.className = "item";
  totalItem.innerHTML = `
    <div>
      <strong>Total split: ${total}%</strong>
      <span>${total === 100 ? "Ready for transparent payout routing." : "Adjust until collaborator shares total 100%."}</span>
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

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function hydrateInputs() {
  Object.entries(appState.simulator).forEach(([id, value]) => {
    const input = document.getElementById(id);
    if (input) input.value = value;
  });
}

function setupForms() {
  document.querySelectorAll(".simulator-grid input").forEach((input) => {
    input.addEventListener("input", calculate);
  });

  document.getElementById("catalogForm").addEventListener("submit", (event) => {
    event.preventDefault();
    appState.catalog.push({
      title: document.getElementById("songTitle").value.trim(),
      market: document.getElementById("songMarket").value,
      price: numberValue("songPrice")
    });
    event.target.reset();
    document.getElementById("songPrice").value = 350;
    saveState();
    renderCatalog();
  });

  document.getElementById("splitForm").addEventListener("submit", (event) => {
    event.preventDefault();
    appState.splits.push({
      name: document.getElementById("splitName").value.trim(),
      role: document.getElementById("splitRole").value.trim(),
      percent: numberValue("splitPercent")
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
    const payload = JSON.stringify({ ...appState, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "music-monetization-plan.json";
    link.click();
    URL.revokeObjectURL(url);
  });
}

hydrateInputs();
setupForms();
renderCatalog();
renderSplits();
renderCampaigns();
calculate();
