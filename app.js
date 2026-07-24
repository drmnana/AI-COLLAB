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
  },
  receipts: []
};

const defaultScopes = {
  "AI training opt-in license": [
    { scope: "ai-training", label: "AI training opt-in", priceMultiplier: 6, status: "manual-approval" }
  ],
  "AI generation / soundtrack-on-demand": [
    { scope: "ai-generation-soundtrack", label: "AI generation / soundtrack-on-demand", priceMultiplier: 5, status: "manual-approval" }
  ],
  "AI exclusion / no-training declaration": [
    { scope: "ai-exclusion", label: "AI exclusion / no-training declaration", priceMultiplier: 0, status: "blocked" }
  ],
  "Podcast intro/outro": [
    { scope: "podcast-video-sync", label: "Podcast / video creator sync", priceMultiplier: 1, status: "available" }
  ],
  "Indie game loop": [
    { scope: "indie-game-app-loop", label: "Indie game / app loop", priceMultiplier: 1, status: "available" }
  ],
  "Local business / fitness / event public use": [
    { scope: "local-business-fitness-event", label: "Local business / fitness / event public use", priceMultiplier: 1, status: "available" }
  ],
  "Fitness studio playlist": [
    { scope: "local-business-fitness-event", label: "Local business / fitness / event public use", priceMultiplier: 1, status: "available" }
  ],
  "Short-form creator pack": [
    { scope: "short-form-creator", label: "Short-form creator sync", priceMultiplier: 1, status: "available" }
  ],
  "Brand campaign sync": [
    { scope: "brand-campaign-sync", label: "Brand campaign sync", priceMultiplier: 4, status: "manual-approval" }
  ],
  "Remix / stem-use license": [
    { scope: "remix-stem-use", label: "Remix / stem-use license", priceMultiplier: 2, status: "manual-approval" }
  ]
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
let lastReceipt = null;

function normalizeState(state) {
  const base = structuredClone(defaultState);
  return {
    catalog: Array.isArray(state.catalog) ? state.catalog.map(normalizeSong) : base.catalog,
    splits: Array.isArray(state.splits) ? state.splits.map(normalizeSplit) : base.splits,
    simulator: { ...base.simulator, ...(state.simulator || {}) },
    receipts: Array.isArray(state.receipts) ? state.receipts : base.receipts
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
    market: String(song.market || song.primaryMarket || "Podcast intro/outro").trim(),
    price: Number(song.price) || 0,
    aiPolicy: song.aiPolicy || inferAiPolicy(song.market),
    blockedUses: Array.isArray(song.blockedUses) ? song.blockedUses : parseList(song.blockedUses || ""),
    scopes: normalizeScopes(song.scopes, song),
    splits: Array.isArray(song.splits) ? song.splits.map(normalizeSplit) : null,
    createdAt: song.createdAt || new Date().toISOString()
  };
}

function normalizeScopes(scopes, song) {
  const source = Array.isArray(scopes) && scopes.length > 0 ? scopes : createScopesForSong(song);
  return source.map((scope) => ({
    scope: scope.scope,
    label: scope.label,
    price: Number(scope.price) || 0,
    currency: scope.currency || "USD",
    checkoutUrl: scope.checkoutUrl || "",
    status: scope.status || "manual-approval"
  }));
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
  localStorage.removeItem(legacyStateKey);
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
  const routerGross = membershipGross + licenseGross + simulator.dropRevenue;
  const routerFee = routerGross * (simulator.coopFee / 100);
  const routerNet = routerGross - routerFee;
  const totalCreatorNet = streamingGross + routerNet;
  const uplift = streamingGross > 0 ? (routerNet / streamingGross) * 100 : 0;
  const retainedMargin = routerGross > 0 ? (routerNet / routerGross) * 100 : 0;

  document.getElementById("streamingRevenue").textContent = formatter.format(streamingGross);
  document.getElementById("coopRevenue").textContent = formatter.format(routerNet);
  document.getElementById("creatorNet").textContent = formatter.format(totalCreatorNet);
  document.getElementById("platformShare").textContent = formatter.format(routerFee);
  document.getElementById("directFans").textContent = simulator.subscribers.toLocaleString();
  document.getElementById("licenseCount").textContent = simulator.licenseDeals.toLocaleString();
  document.getElementById("retainedMargin").textContent = `${Math.round(retainedMargin)}%`;
  document.getElementById("upliftOutput").textContent = `${Math.round(uplift).toLocaleString()}% router net vs DSP gross`;
  document.getElementById("membershipLift").textContent = `${simulator.subscribers.toLocaleString()} fans`;
  document.getElementById("licenseWorkload").textContent = `${simulator.licenseDeals.toLocaleString()} deals`;
  document.getElementById("feeBasis").textContent = formatter.format(routerGross);
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
      renderWorkspace();
    });
    list.appendChild(item);
  });
}

function renderWorkspace() {
  renderCatalog();
  renderCheckoutEditor();
  populateReceiptSelectors();
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

function renderCheckoutEditor() {
  const container = document.getElementById("checkoutEditor");
  container.innerHTML = "";
  appState.catalog.forEach((song) => {
    const article = document.createElement("article");
    article.className = "checkout-song";
    article.innerHTML = `
      <h3>${escapeHtml(song.title)} <small>${escapeHtml(song.artist)}</small></h3>
      <div></div>
    `;
    const scopeList = article.querySelector("div");
    song.scopes.forEach((scope, scopeIndex) => {
      const row = document.createElement("div");
      row.className = "checkout-scope";
      row.innerHTML = `
        <label>
          Product
          <input value="${escapeHtml(scope.label)}" data-field="label">
        </label>
        <label>
          Price
          <input type="number" min="0" step="25" value="${scope.price}" data-field="price">
        </label>
        <label>
          Status
          <select data-field="status">
            <option value="available">Available</option>
            <option value="manual-approval">Manual approval</option>
            <option value="blocked">Blocked</option>
          </select>
        </label>
        <label>
          Checkout URL
          <input value="${escapeHtml(scope.checkoutUrl)}" data-field="checkoutUrl" placeholder="https://buy.stripe.com/...">
        </label>
        <div class="form-message" data-warning></div>
      `;
      row.querySelector("select").value = scope.status;
      updateCheckoutWarning(row, scope.checkoutUrl);
      row.querySelectorAll("input, select").forEach((input) => {
        input.addEventListener("input", () => {
          const field = input.dataset.field;
          song.scopes[scopeIndex][field] = field === "price" ? Number(input.value) || 0 : input.value.trim();
          if (field === "checkoutUrl") updateCheckoutWarning(row, song.scopes[scopeIndex].checkoutUrl);
          saveState();
          populateReceiptSelectors();
        });
      });
      scopeList.appendChild(row);
    });
    container.appendChild(article);
  });
}

function updateCheckoutWarning(row, checkoutUrl) {
  const warning = row.querySelector("[data-warning]");
  const value = String(checkoutUrl || "").trim();
  warning.textContent = value && !value.startsWith("https://") ? "Use an https checkout URL before publishing." : "";
}

function setupForms() {
  document.querySelectorAll(".simulator-grid input").forEach((input) => {
    input.addEventListener("input", calculate);
  });

  document.getElementById("catalogForm").addEventListener("submit", (event) => {
    event.preventDefault();
    setMessage("catalogMessage", "");
    const title = document.getElementById("songTitle").value.trim();
    const artist = document.getElementById("songArtist").value.trim();
    const masterOwner = document.getElementById("masterOwner").value.trim();
    const compositionOwner = document.getElementById("compositionOwner").value.trim();
    if (!title || !artist || !masterOwner || !compositionOwner) {
      setMessage("catalogMessage", "Add song title, artist, master owner, and composition owner.");
      return;
    }

    const song = {
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
      splits: appState.splits.map((split) => ({ ...split })),
      createdAt: new Date().toISOString()
    };
    song.scopes = createScopesForSong(song);
    appState.catalog.push(song);
    event.target.reset();
    document.getElementById("songPrice").value = 350;
    saveState();
    renderWorkspace();
    setMessage("catalogMessage", "Song added to rights registry.", true);
  });

  document.getElementById("splitForm").addEventListener("submit", (event) => {
    event.preventDefault();
    setMessage("splitMessage", "");
    const name = document.getElementById("splitName").value.trim();
    const role = document.getElementById("splitRole").value.trim();
    const percent = clampPercent(numberValue("splitPercent"));
    if (!name || !role || percent <= 0) {
      setMessage("splitMessage", "Add collaborator, role, and a split greater than 0%.");
      return;
    }

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
    setMessage("splitMessage", "Split added.", true);
  });

  document.getElementById("seedDemo").addEventListener("click", () => {
    appState = structuredClone(defaultState);
    saveState();
    hydrateInputs();
    renderWorkspace();
    renderSplits();
    calculate();
  });

  document.getElementById("exportPlan").addEventListener("click", () => {
    const payload = JSON.stringify({
      catalog: appState.catalog,
      splits: appState.splits,
      simulator: appState.simulator,
      splitStatus: {
        totalPercent: getSplitTotal(),
        payoutExportReady: getSplitTotal() === 100
      },
      privacyNotice: "Private receipts are excluded from this general plan export. Download receipts separately and do not commit buyer details to a public repository.",
      exportedAt: new Date().toISOString()
    }, null, 2);
    downloadJson("music-monetization-plan.json", JSON.parse(payload));
  });

  document.getElementById("exportCatalog").addEventListener("click", () => {
    downloadJson("catalog.json", createCatalogSource());
  });

  document.getElementById("receiptSong").addEventListener("change", populateReceiptScopes);
  document.getElementById("receiptForm").addEventListener("submit", (event) => {
    event.preventDefault();
    setMessage("receiptMessage", "");
    const receipt = createReceipt();
    if (!receipt) return;
    lastReceipt = receipt;
    appState.receipts.unshift(receipt);
    saveState();
    document.getElementById("receiptPreview").textContent = JSON.stringify(receipt, null, 2);
    document.getElementById("downloadReceipt").disabled = false;
    populatePayoutReceipts();
    renderConversionTracker();
    setMessage("receiptMessage", "Receipt generated.", true);
  });

  document.getElementById("downloadReceipt").addEventListener("click", () => {
    if (lastReceipt) downloadJson(`${lastReceipt.receiptId}.json`, lastReceipt);
  });

  document.getElementById("payoutReceipt").addEventListener("change", hydratePayoutAmount);
  document.getElementById("exportPayoutJson").addEventListener("click", () => exportPayout("json"));
  document.getElementById("exportPayoutCsv").addEventListener("click", () => exportPayout("csv"));
}

function createCatalogSource() {
  return {
    schemaVersion: "0.1",
    updatedAt: new Date().toISOString(),
    defaultSplits: appState.splits.map((split) => ({
      id: split.id,
      name: split.name,
      role: split.role,
      percent: Number(split.percent)
    })),
    songs: appState.catalog.map((song) => ({
      id: song.id,
      title: song.title,
      artist: song.artist,
      isrc: song.isrc,
      masterOwner: song.masterOwner,
      compositionOwner: song.compositionOwner,
      primaryMarket: song.market,
      aiPolicy: song.aiPolicy,
      blockedUses: song.blockedUses,
      splits: getResolvedSplits(song),
      scopes: song.scopes
    }))
  };
}

function populateReceiptSelectors() {
  const songSelect = document.getElementById("receiptSong");
  const selected = songSelect.value;
  songSelect.innerHTML = appState.catalog.map((song) => (
    `<option value="${escapeHtml(song.id)}">${escapeHtml(song.title)} - ${escapeHtml(song.artist)}</option>`
  )).join("");
  if (appState.catalog.some((song) => song.id === selected)) songSelect.value = selected;
  populateReceiptScopes();
}

function populateReceiptScopes() {
  const song = getSelectedReceiptSong();
  const scopeSelect = document.getElementById("receiptScope");
  if (!song) {
    scopeSelect.innerHTML = "";
    return;
  }
  const selected = scopeSelect.value;
  scopeSelect.innerHTML = song.scopes.map((scope) => (
    `<option value="${escapeHtml(scope.scope)}">${escapeHtml(scope.label)} - ${formatter.format(scope.price)}</option>`
  )).join("");
  if (song.scopes.some((scope) => scope.scope === selected)) scopeSelect.value = selected;
}

function createReceipt() {
  const song = getSelectedReceiptSong();
  const scope = song?.scopes.find((item) => item.scope === document.getElementById("receiptScope").value);
  const buyerName = document.getElementById("buyerName").value.trim();
  const intendedUse = document.getElementById("intendedUse").value.trim();
  if (!song || !scope || !buyerName || !intendedUse) {
    setMessage("receiptMessage", "Choose a song and license, then add buyer name and intended use.");
    return null;
  }
  if (scope.status === "blocked") {
    setMessage("receiptMessage", "This scope is blocked and cannot generate a sale receipt.");
    return null;
  }
  const issuedAt = new Date().toISOString();
  return {
    receiptVersion: "0.2",
    receiptId: `license-receipt-${song.id}-${scope.scope}-${Date.now()}`,
    issuedAt,
    paymentStatus: document.getElementById("paymentStatus").value,
    legalNotice: "Structured private license record only. Not legal advice; review terms before commercial reliance. Do not commit receipts containing buyer details to a public repository.",
    song: {
      id: song.id,
      title: song.title,
      artist: song.artist,
      isrc: song.isrc,
      masterOwner: song.masterOwner,
      compositionOwner: song.compositionOwner
    },
    license: {
      scope: scope.scope,
      label: scope.label,
      price: Number(scope.price),
      currency: scope.currency,
      checkoutUrl: scope.checkoutUrl,
      status: scope.status,
      intendedUse,
      territory: document.getElementById("territory").value.trim() || "Worldwide",
      aiPolicy: song.aiPolicy,
      blockedUses: song.blockedUses
    },
    buyer: {
      name: buyerName,
      email: document.getElementById("buyerEmail").value.trim()
    },
    conversion: {
      sourceChannel: document.getElementById("sourceChannel").value
    },
    splits: getPublicSplits(song)
  };
}

function getResolvedSplits(song) {
  return Array.isArray(song.splits) && song.splits.length > 0 ? song.splits : appState.splits;
}

function getPublicSplits(song) {
  return getResolvedSplits(song).map((split) => ({
    id: split.id,
    role: split.role,
    percent: Number(split.percent)
  }));
}

function populatePayoutReceipts() {
  const select = document.getElementById("payoutReceipt");
  const selected = select.value;
  select.innerHTML = appState.receipts.map((receipt) => (
    `<option value="${escapeHtml(receipt.receiptId)}">${escapeHtml(receipt.song.title)} - ${escapeHtml(receipt.license.label)} - ${escapeHtml(receipt.paymentStatus)}</option>`
  )).join("");
  if (appState.receipts.some((receipt) => receipt.receiptId === selected)) select.value = selected;
  hydratePayoutAmount();
}

function hydratePayoutAmount() {
  const receipt = getSelectedPayoutReceipt();
  const input = document.getElementById("payoutGross");
  if (receipt) input.value = receipt.license.price;
}

function exportPayout(format) {
  setMessage("payoutMessage", "");
  const payout = createPayoutInstructions();
  if (!payout) return;
  document.getElementById("payoutPreview").textContent = format === "csv" ? payoutToCsv(payout) : JSON.stringify(payout, null, 2);
  if (format === "csv") {
    downloadText(`${payout.payoutId}.csv`, payoutToCsv(payout), "text/csv");
  } else {
    downloadJson(`${payout.payoutId}.json`, payout);
  }
  setMessage("payoutMessage", "Payout instructions exported.", true);
}

function createPayoutInstructions() {
  const receipt = getSelectedPayoutReceipt();
  if (!receipt) {
    setMessage("payoutMessage", "Generate or select a receipt first.");
    return null;
  }
  const grossAmount = numberValue("payoutGross");
  const platformFeePercent = numberValue("payoutFee");
  const splitTotal = receipt.splits.reduce((sum, split) => sum + Number(split.percent), 0);
  if (splitTotal !== 100) {
    setMessage("payoutMessage", `Payout export blocked: resolved splits total ${splitTotal}%, not 100%.`);
    return null;
  }
  if (grossAmount <= 0) {
    setMessage("payoutMessage", "Enter a gross amount greater than 0.");
    return null;
  }
  const grossCents = moneyToCents(grossAmount);
  const platformFeeCents = Math.round(grossCents * (platformFeePercent / 100));
  const netCents = grossCents - platformFeeCents;
  const instructions = allocatePayoutCents(receipt.splits, netCents, receipt.license.currency);
  const instructionsTotal = roundMoney(instructions.reduce((sum, item) => sum + item.amount, 0));
  const netAmount = centsToMoney(netCents);
  if (instructionsTotal !== netAmount) {
    setMessage("payoutMessage", "Payout export blocked: allocation check failed.");
    return null;
  }
  return {
    payoutVersion: "0.2",
    payoutId: `payout-${receipt.receiptId}`,
    generatedAt: new Date().toISOString(),
    receiptId: receipt.receiptId,
    paymentStatus: receipt.paymentStatus,
    grossAmount: centsToMoney(grossCents),
    currency: receipt.license.currency,
    platformFeePercent,
    platformFeeAmount: centsToMoney(platformFeeCents),
    netAmount,
    instructions,
    allocationCheck: {
      instructionsTotal,
      equalsNet: instructionsTotal === netAmount
    }
  };
}

function allocatePayoutCents(splits, netCents, currency) {
  const allocations = splits.map((split, index) => {
    const exactShare = netCents * (Number(split.percent) / 100);
    const floorCents = Math.floor(exactShare);
    return {
      collaboratorId: split.id,
      role: split.role,
      percent: Number(split.percent),
      cents: floorCents,
      remainder: exactShare - floorCents,
      index,
      currency
    };
  });
  let remainingCents = netCents - allocations.reduce((sum, item) => sum + item.cents, 0);
  [...allocations]
    .sort((a, b) => b.remainder - a.remainder || a.index - b.index)
    .forEach((allocation) => {
      if (remainingCents <= 0) return;
      allocation.cents += 1;
      remainingCents -= 1;
    });
  return allocations
    .sort((a, b) => a.index - b.index)
    .map(({ collaboratorId, role, percent, cents, currency }) => ({
      collaboratorId,
      role,
      percent,
      amount: centsToMoney(cents),
      currency
    }));
}

function getSelectedPayoutReceipt() {
  return appState.receipts.find((receipt) => receipt.receiptId === document.getElementById("payoutReceipt").value);
}

function payoutToCsv(payout) {
  const rows = [
    ["payoutId", "receiptId", "paymentStatus", "collaboratorId", "role", "percent", "amount", "currency"]
  ];
  payout.instructions.forEach((instruction) => {
    rows.push([
      payout.payoutId,
      payout.receiptId,
      payout.paymentStatus,
      instruction.collaboratorId,
      instruction.role,
      instruction.percent,
      instruction.amount,
      instruction.currency
    ]);
  });
  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

function csvCell(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

function moneyToCents(value) {
  return Math.round(Number(value) * 100);
}

function centsToMoney(cents) {
  return cents / 100;
}

function getSelectedReceiptSong() {
  return appState.catalog.find((song) => song.id === document.getElementById("receiptSong").value);
}

function createScopesForSong(song) {
  const templates = defaultScopes[song.market || song.primaryMarket] || defaultScopes["Podcast intro/outro"];
  return templates.map((template) => ({
    scope: template.scope,
    label: template.label,
    price: Math.round(Number(song.price || 0) * template.priceMultiplier),
    currency: "USD",
    checkoutUrl: "",
    status: template.status
  }));
}

function downloadJson(filename, payload) {
  downloadText(filename, `${JSON.stringify(payload, null, 2)}\n`, "application/json");
}

function downloadText(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function renderConversionTracker() {
  const container = document.getElementById("conversionTracker");
  const totals = new Map();
  appState.receipts.forEach((receipt) => {
    const channel = receipt.conversion?.sourceChannel || "Unknown";
    const current = totals.get(channel) || { count: 0, revenue: 0 };
    current.count += 1;
    current.revenue += Number(receipt.license?.price || 0);
    totals.set(channel, current);
  });
  if (totals.size === 0) {
    container.innerHTML = `<article class="conversion-card"><span>No receipts yet</span><strong>0</strong><p>Generate receipts to see source-channel demand.</p></article>`;
    return;
  }
  container.innerHTML = Array.from(totals.entries()).map(([channel, total]) => `
    <article class="conversion-card">
      <span>${escapeHtml(channel)}</span>
      <strong>${total.count}</strong>
      <p>${formatter.format(total.revenue)} recorded</p>
    </article>
  `).join("");
}

function setMessage(id, message, success = false) {
  const element = document.getElementById(id);
  element.textContent = message;
  element.classList.toggle("is-success", success);
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
renderCheckoutEditor();
populateReceiptSelectors();
populatePayoutReceipts();
renderConversionTracker();
renderSplits();
renderCampaigns();
calculate();
