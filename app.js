const STORAGE_KEY = "campus-voice-ultra-mvp";

const SAMPLE_ISSUES = [
  {
    id: "cam-river-air",
    title: "River Cam boat emissions and air quality",
    location: "Cambridge",
    category: "Environment",
    source: "Cambridge City Council environment reports + resident complaints",
    chamber: "Cambridge City Council Environment Committee",
    officialPriority: 52,
    studentVotes: { high: 62, medium: 14, low: 4 },
    credibility: 92,
    whyItMatters: "Air quality affects respiratory health, wellbeing, and trust in local services.",
    evidence: [
      "Resident reports of gas-like smell near River Cam.",
      "Complaint email ignored without public update.",
      "Potential emissions compliance gaps for river boats."
    ],
    actions: [
      "Submit evidence pack to committee chair.",
      "Request monthly emissions transparency release.",
      "Organise cross-school testimony session."
    ],
    comments: ["Add student sensor monitoring.", "Publish timeline tracker."],
    trend: [38, 42, 50, 58, 62]
  },
  {
    id: "uk-bus-fares",
    title: "Reduced under-21 bus fares",
    location: "UK",
    category: "Transport",
    source: "UK Parliament transport consultations",
    chamber: "UK Parliament Transport Committee",
    officialPriority: 65,
    studentVotes: { high: 55, medium: 21, low: 9 },
    credibility: 88,
    whyItMatters: "Transport costs affect attendance, opportunities, and cost of living.",
    evidence: ["Fares linked with lower student mobility.", "Youth polling supports capped fare pilots."],
    actions: ["Submit youth fare impact statement.", "Recommend commuter-town pilot routes."],
    comments: ["Means-tested support should be included."],
    trend: [31, 37, 42, 49, 55]
  },
  {
    id: "county-library-hours",
    title: "Extended library study hours",
    location: "Cambridgeshire",
    category: "Education",
    source: "County consultations on education and skills",
    chamber: "County Education & Skills Board",
    officialPriority: 41,
    studentVotes: { high: 49, medium: 24, low: 8 },
    credibility: 85,
    whyItMatters: "Study-space access impacts attainment and mental wellbeing.",
    evidence: ["Exam-season demand exceeds opening hours.", "Quiet-space inequality affects outcomes."],
    actions: ["Propose 8-week evening pilot.", "Align bus schedule for safe returns."],
    comments: ["Need weekend extension too."],
    trend: [25, 30, 36, 44, 49]
  },
  {
    id: "district-housing-warmth",
    title: "Rental housing warmth and damp checks",
    location: "East of England",
    category: "Housing",
    source: "Local authority housing standards data",
    chamber: "District Housing Review Panel",
    officialPriority: 58,
    studentVotes: { high: 44, medium: 25, low: 11 },
    credibility: 81,
    whyItMatters: "Poor housing conditions affect health, focus, and attendance.",
    evidence: ["Damp complaint growth in student rentals.", "Cold housing linked with reduced learning outcomes."],
    actions: ["Publish inspection transparency dashboard.", "Target support in student-heavy zones."],
    comments: ["Clearer landlord accountability needed."],
    trend: [24, 28, 34, 40, 44]
  }
];

const MEME_TEMPLATES = [
  "When council says 'consultation open' and students submit 300 comments overnight 📬",
  "Bus fare goes up again: wallet says no, democracy says vote harder 🚌",
  "Parliament debate speed vs group project speed... somehow group project wins 😅",
  "Trying to open your window near River Cam like: eau de emissions 🌫️",
  "Council agenda: 400 pages. Student summary: 'Please fix the actual issue.' 📚"
];

const GAME_SCENARIOS = [
  {
    title: "Year 1: River Cam pollution",
    description: "Boat emissions are rising and residents report strong gas smell near homes.",
    choices: [
      { label: "Ignore issue", effects: { environment: -12, trust: -8, happiness: -6, misinformation: 4 }, text: "Pollution worsens while youth trust drops." },
      { label: "Gather evidence + student reports", effects: { environment: 8, trust: 9, happiness: 4, budget: -4 }, text: "Evidence makes the issue actionable." },
      { label: "Spread unverified rumour", effects: { misinformation: 14, trust: -11, environment: -3 }, text: "Noise increases but solutions stall." }
    ]
  },
  {
    title: "Year 2: Budget cuts",
    description: "Council announces budget pressure impacting local services.",
    choices: [
      { label: "Cut youth services first", effects: { happiness: -10, trust: -6, budget: 8 }, text: "Short-term savings, long-term social cost." },
      { label: "Co-design priorities with students", effects: { trust: 8, happiness: 7, budget: -4 }, text: "Shared ownership improves outcomes." },
      { label: "Delay decisions", effects: { trust: -5, budget: -6, misinformation: 5 }, text: "Uncertainty fuels rumours." }
    ]
  },
  {
    title: "Year 3: Election approaching",
    description: "Candidates make big promises; misinformation rises on social media.",
    choices: [
      { label: "Launch fact-check explainer", effects: { misinformation: -10, trust: 7, education: 6, budget: -3 }, text: "Clear facts calm the debate." },
      { label: "Amplify viral claims", effects: { misinformation: 13, trust: -9 }, text: "Attention rises, credibility falls." },
      { label: "Stay neutral and silent", effects: { trust: -4, education: -3 }, text: "Silence leaves space for bad info." }
    ]
  },
  {
    title: "Year 4: Transport strike risk",
    description: "Bus reliability drops and student commuting is disrupted.",
    choices: [
      { label: "Organise youth-council mediation", effects: { transport: 8, trust: 8, budget: -5 }, text: "Dialogue creates practical compromise." },
      { label: "Only complain online", effects: { transport: -2, misinformation: 4, trust: -2 }, text: "Awareness rises but no structured response." },
      { label: "Ignore commute issues", effects: { transport: -9, happiness: -7 }, text: "Daily life gets harder for students." }
    ]
  },
  {
    title: "Year 5: Final policy vote",
    description: "Final chance to lock in youth-informed policy changes.",
    choices: [
      { label: "Submit Youth Mandate Brief + petition", effects: { trust: 10, happiness: 9, environment: 5, education: 5, budget: -4 }, text: "Adult decision-makers get clear actionable evidence." },
      { label: "Push one-sided slogan campaign", effects: { trust: -5, misinformation: 6, happiness: 2 }, text: "Energy is high but policy detail is weak." },
      { label: "Skip final participation", effects: { trust: -8, happiness: -6 }, text: "Missing the final step reduces impact." }
    ]
  }
];

const RANDOM_EVENTS = [
  { text: "Random event: Local journalist highlights youth report.", effects: { trust: 4, education: 2 } },
  { text: "Random event: Misinformation spike on TikTok.", effects: { misinformation: 5, trust: -3 } },
  { text: "Random event: Emergency grant unlocked.", effects: { budget: 6, transport: 2 } },
  { text: "Random event: Student climate protest gains support.", effects: { environment: 4, happiness: 3 } },
  { text: "Random event: Committee meeting delayed.", effects: { trust: -3, budget: -2 } }
];

const state = {
  user: null,
  issues: structuredClone(SAMPLE_ISSUES),
  selectedIssueId: null,
  filters: { area: "All areas", category: "All categories", sort: "trending" },
  memes: [],
  lastMemeRefresh: Date.now(),
  game: {
    round: 0,
    stats: { environment: 50, trust: 50, happiness: 50, budget: 50, misinformation: 50, transport: 50, education: 50 },
    history: []
  }
};

const els = {
  authForm: document.querySelector("#authForm"),
  nameInput: document.querySelector("#nameInput"),
  levelInput: document.querySelector("#levelInput"),
  profilePill: document.querySelector("#profilePill"),
  issueCount: document.querySelector("#issueCount"),
  issuesList: document.querySelector("#issuesList"),
  areaFilter: document.querySelector("#areaFilter"),
  categoryFilter: document.querySelector("#categoryFilter"),
  sortFilter: document.querySelector("#sortFilter"),
  memesList: document.querySelector("#memesList"),
  memeTimer: document.querySelector("#memeTimer"),
  scorecards: document.querySelector("#scorecards"),
  priorityChart: document.querySelector("#priorityChart"),
  gapChart: document.querySelector("#gapChart"),
  mapHotspots: document.querySelector("#mapHotspots"),
  briefBtn: document.querySelector("#briefBtn"),
  briefOutput: document.querySelector("#briefOutput"),
  dashboardView: document.querySelector("#dashboardView"),
  detailView: document.querySelector("#detailView"),
  backToDashboardBtn: document.querySelector("#backToDashboardBtn"),
  detailCard: document.querySelector("#detailCard"),
  startGameBtn: document.querySelector("#startGameBtn"),
  gameView: document.querySelector("#gameView"),
  exitGameBtn: document.querySelector("#exitGameBtn"),
  gameRoundLabel: document.querySelector("#gameRoundLabel"),
  gameStats: document.querySelector("#gameStats"),
  gameScenarioTitle: document.querySelector("#gameScenarioTitle"),
  gameScenarioDescription: document.querySelector("#gameScenarioDescription"),
  gameEvent: document.querySelector("#gameEvent"),
  gameChoiceSelect: document.querySelector("#gameChoiceSelect"),
  confirmGameChoiceBtn: document.querySelector("#confirmGameChoiceBtn"),
  gameFeedback: document.querySelector("#gameFeedback")
};

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: state.user, issues: state.issues, memes: state.memes, lastMemeRefresh: state.lastMemeRefresh }));
}

function load() {
  const cached = localStorage.getItem(STORAGE_KEY);
  if (!cached) return;
  const parsed = JSON.parse(cached);
  state.user = parsed.user || null;
  state.issues = parsed.issues?.length ? parsed.issues : state.issues;
  state.memes = parsed.memes?.length ? parsed.memes : [];
  state.lastMemeRefresh = parsed.lastMemeRefresh || Date.now();
}

function showDashboard() {
  els.dashboardView.classList.remove("hidden");
  els.detailView.classList.add("hidden");
  els.gameView.classList.add("hidden");
}

function showDetail() {
  els.dashboardView.classList.add("hidden");
  els.detailView.classList.remove("hidden");
  els.gameView.classList.add("hidden");
}

function showGame() {
  els.dashboardView.classList.add("hidden");
  els.detailView.classList.add("hidden");
  els.gameView.classList.remove("hidden");
}

function totalVotes(issue) {
  return issue.studentVotes.high + issue.studentVotes.medium + issue.studentVotes.low;
}

function studentPriority(issue) {
  return issue.studentVotes.high + issue.studentVotes.medium * 0.5;
}

function priorityGap(issue) {
  return Math.round(studentPriority(issue) - issue.officialPriority);
}

function civiRank(votesCast = 0) {
  if (votesCast >= 30) return "Youth Leader";
  if (votesCast >= 20) return "Policy Influencer";
  if (votesCast >= 12) return "Community Voice";
  if (votesCast >= 5) return "Voter";
  return "Observer";
}

function renderProfile() {
  if (!state.user) {
    els.profilePill.classList.add("hidden");
    return;
  }
  els.profilePill.classList.remove("hidden");
  els.profilePill.textContent = `${state.user.name} • ${state.user.level} • ${state.user.votesCast} XP • ${civiRank(state.user.votesCast)}`;
}

function filteredIssues() {
  let data = [...state.issues];
  if (state.filters.area !== "All areas") data = data.filter((i) => i.location === state.filters.area);
  if (state.filters.category !== "All categories") data = data.filter((i) => i.category === state.filters.category);

  if (state.filters.sort === "support") data.sort((a, b) => b.studentVotes.high - a.studentVotes.high);
  if (state.filters.sort === "official") data.sort((a, b) => Math.abs(priorityGap(b)) - Math.abs(priorityGap(a)));
  if (state.filters.sort === "trending") data.sort((a, b) => totalVotes(b) - totalVotes(a));

  return data;
}

function renderFilters() {
  const areas = ["All areas", ...new Set(state.issues.map((i) => i.location))];
  const categories = ["All categories", ...new Set(state.issues.map((i) => i.category))];
  if (!els.areaFilter.options.length) {
    els.areaFilter.innerHTML = areas.map((a) => `<option>${a}</option>`).join("");
    els.categoryFilter.innerHTML = categories.map((c) => `<option>${c}</option>`).join("");
  }
  els.areaFilter.value = state.filters.area;
  els.categoryFilter.value = state.filters.category;
  els.sortFilter.value = state.filters.sort;
}

function renderIssues() {
  const data = filteredIssues();
  els.issueCount.textContent = `${data.length} issues`;
  els.issuesList.innerHTML = "";
  data.forEach((issue) => {
    const card = document.createElement("article");
    card.className = "issue-card";
    card.innerHTML = `
      <h3>${issue.title}</h3>
      <p class="meta">${issue.location} • ${issue.category} • ${issue.chamber}</p>
      <p>${issue.whyItMatters}</p>
      <p class="meta">Credibility: ${issue.credibility}/100 • High-priority votes: ${issue.studentVotes.high}</p>
      <button data-open="${issue.id}">Open issue</button>
    `;
    els.issuesList.append(card);
  });
}

function refreshMemes() {
  const picks = [...MEME_TEMPLATES].sort(() => Math.random() - 0.5).slice(0, 3);
  state.memes = picks.map((text, idx) => ({ id: `${Date.now()}-${idx}`, text, votes: Math.floor(Math.random() * 12) + 3 }));
  state.lastMemeRefresh = Date.now();
  save();
}

function maybeRefreshMemes() {
  const hour = 1000 * 60 * 60;
  if (!state.memes.length || Date.now() - state.lastMemeRefresh >= hour) refreshMemes();
}

function renderMemeTimer() {
  const nextInMs = Math.max(0, 1000 * 60 * 60 - (Date.now() - state.lastMemeRefresh));
  const mins = Math.floor(nextInMs / 60000);
  els.memeTimer.textContent = `Next refresh in ${mins}m`;
}

function renderMemes() {
  els.memesList.innerHTML = "";
  state.memes.forEach((meme) => {
    const card = document.createElement("article");
    card.className = "issue-card";
    card.innerHTML = `
      <p>${meme.text}</p>
      <p class="meta">😂 Fun votes: ${meme.votes}</p>
      <button data-meme-vote="${meme.id}">Vote funniest</button>
    `;
    els.memesList.append(card);
  });
}

function renderScorecards() {
  const data = filteredIssues();
  const totalStudentVotes = data.reduce((sum, i) => sum + totalVotes(i), 0);
  const top = [...data].sort((a, b) => b.studentVotes.high - a.studentVotes.high)[0];
  const avgCred = Math.round(data.reduce((sum, i) => sum + i.credibility, 0) / Math.max(1, data.length));
  const trustIndex = Math.max(30, Math.min(98, Math.round(avgCred - data.reduce((s, i) => s + Math.max(0, -priorityGap(i)), 0) / 20)));

  els.scorecards.innerHTML = `
    <div class="scorecard"><strong>${totalStudentVotes}</strong><br />Total student votes</div>
    <div class="scorecard"><strong>${top?.title || "-"}</strong><br />Top issue this week</div>
    <div class="scorecard"><strong>${top?.studentVotes.high || 0}</strong><br />You are not alone</div>
    <div class="scorecard"><strong>${avgCred}%</strong><br />Credibility score avg</div>
    <div class="scorecard"><strong>${trustIndex}%</strong><br />Trust indicator</div>
  `;
}

function drawBars(canvas, labels, values, color) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#0b1220";
  ctx.fillRect(0, 0, w, h);

  const max = Math.max(...values, 1);
  const barW = Math.max(18, Math.floor((w - 50) / values.length) - 12);
  values.forEach((value, i) => {
    const x = 28 + i * (barW + 12);
    const barH = Math.floor(((h - 56) * value) / max);
    const y = h - 30 - barH;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, barW, barH);
    ctx.fillStyle = "#dbeafe";
    ctx.font = "12px sans-serif";
    ctx.fillText(String(value), x + 2, y - 4);
    ctx.fillText(labels[i], x, h - 11);
  });
}

function renderCharts() {
  const data = filteredIssues();
  const labels = data.map((_, idx) => `I${idx + 1}`);
  drawBars(els.priorityChart, labels, data.map((i) => i.studentVotes.high), "#38bdf8");
  drawBars(els.gapChart, labels, data.map((i) => Math.abs(priorityGap(i))), "#a78bfa");
}

function renderMap() {
  const topByArea = new Map();
  state.issues.forEach((issue) => {
    const current = topByArea.get(issue.location);
    if (!current || current.studentVotes.high < issue.studentVotes.high) topByArea.set(issue.location, issue);
  });
  els.mapHotspots.innerHTML = "";
  [...topByArea.entries()].forEach(([area, issue]) => {
    const node = document.createElement("button");
    node.className = "hotspot";
    node.type = "button";
    node.dataset.open = issue.id;
    node.innerHTML = `<strong>${area}</strong><br /><span class="meta">Top issue: ${issue.category}</span>`;
    els.mapHotspots.append(node);
  });
}

function aiExplainer(issue) {
  return `${issue.location}: ${issue.chamber} is handling “${issue.title}”. Students ranked it highly (${issue.studentVotes.high} high-priority votes). Main evidence: ${issue.evidence[0]}`;
}

function renderDetail() {
  const issue = state.issues.find((i) => i.id === state.selectedIssueId) || state.issues[0];
  if (!issue) return;
  const evidence = issue.evidence.map((e) => `<li>${e}</li>`).join("");
  const actions = issue.actions.map((a) => `<li>${a}</li>`).join("");
  const comments = issue.comments.map((c) => `<li>${c}</li>`).join("");

  els.detailCard.innerHTML = `
    <h3>${issue.title}</h3>
    <p class="meta">${issue.location} • ${issue.category} • ${issue.chamber}</p>
    <p><strong>Source:</strong> ${issue.source}</p>
    <p><strong>AI civic explainer:</strong> ${aiExplainer(issue)}</p>

    <div class="meter-wrap">
      <p class="meta">Trust meter: ${issue.credibility}/100</p>
      <div class="meter-bar"><div class="meter-fill" style="width:${issue.credibility}%"></div></div>
    </div>

    <div class="detail-evidence"><h4>Evidence</h4><ul>${evidence}</ul></div>
    <div class="detail-evidence"><h4>What changes if ignored?</h4><p>${issue.category} outcomes worsen and youth trust drops when this stays unresolved.</p></div>
    <div class="detail-evidence"><h4>What students can do</h4><ul>${actions}</ul></div>
    <div class="detail-evidence"><h4>Youth discussion</h4><ul>${comments}</ul></div>

    <form id="voteForm" class="vote-line">
      <select id="voteType">
        <option value="high">Vote: High priority</option>
        <option value="medium">Vote: Medium priority</option>
        <option value="low">Vote: Low priority</option>
      </select>
      <button type="submit">Submit vote</button>
    </form>
  `;

  document.querySelector("#voteForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const voteType = document.querySelector("#voteType").value;
    issue.studentVotes[voteType] += 1;
    if (state.user) state.user.votesCast += 1;
    save();
    renderAll();
    showDetail();
  });
}

function generateBrief() {
  const data = filteredIssues();
  const top = [...data].sort((a, b) => b.studentVotes.high - a.studentVotes.high).slice(0, 5);
  const lines = top.map((item, idx) => `${idx + 1}. ${item.title} — ${item.studentVotes.high} high-priority votes`).join("\n");
  els.briefOutput.textContent = `Youth Mandate Brief\n-------------------\nTop 5 priorities:\n${lines}\n\nIf young people ran the city this week:\n- Environment and transport get higher immediate priority.\n- Youth-facing service access (library, bus costs) rises above current official weighting.\n\nRecommended next step:\nInvite 2 youth reps to the next committee session and publish progress in 30 days.`;
}

function applyEventEffects(event) {
  Object.entries(event.effects).forEach(([key, delta]) => {
    state.game.stats[key] = Math.max(0, Math.min(100, state.game.stats[key] + delta));
  });
}

function renderGameStats() {
  const entries = Object.entries(state.game.stats);
  els.gameStats.innerHTML = entries
    .map(([key, value]) => `<div class="scorecard"><strong>${value}</strong><br />${key[0].toUpperCase()}${key.slice(1)}</div>`)
    .join("");
}

function gameEnding() {
  const s = state.game.stats;
  const score = s.environment + s.trust + s.happiness + s.transport + s.education + s.budget - s.misinformation;
  if (score > 330) return "🏆 Youth Democracy Champion: your city improved through evidence and collaboration.";
  if (score > 280) return "✅ Balanced Leader: practical wins with some trade-offs.";
  if (s.misinformation > 75) return "⚠️ Misinformation Chaos: trust collapsed despite activity.";
  return "🌫️ Ignored City: delayed action led to worsening outcomes.";
}

function renderGameRound() {
  renderGameStats();
  if (state.game.round >= GAME_SCENARIOS.length) {
    els.gameRoundLabel.textContent = "Final outcome";
    els.gameScenarioTitle.textContent = "Simulation complete";
    els.gameScenarioDescription.textContent = gameEnding();
    els.gameEvent.textContent = "Replay to test a better strategy.";
    els.gameChoiceSelect.innerHTML = "<option>Start over</option>";
    els.confirmGameChoiceBtn.textContent = "Play again";
    return;
  }

  const scenario = GAME_SCENARIOS[state.game.round];
  const event = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
  applyEventEffects(event);

  els.gameRoundLabel.textContent = `Year ${state.game.round + 1} of 5`;
  els.gameScenarioTitle.textContent = scenario.title;
  els.gameScenarioDescription.textContent = scenario.description;
  els.gameEvent.textContent = event.text;
  els.gameChoiceSelect.innerHTML = scenario.choices.map((choice, idx) => `<option value="${idx}">${choice.label}</option>`).join("");
  els.confirmGameChoiceBtn.textContent = "Confirm action";
  renderGameStats();
}

function startGame() {
  state.game.round = 0;
  state.game.stats = { environment: 50, trust: 50, happiness: 50, budget: 50, misinformation: 50, transport: 50, education: 50 };
  state.game.history = [];
  els.gameFeedback.textContent = "Your decisions change the city every round.";
  showGame();
  renderGameRound();
}

function handleGameChoice() {
  if (state.game.round >= GAME_SCENARIOS.length) {
    startGame();
    return;
  }
  const scenario = GAME_SCENARIOS[state.game.round];
  const selected = Number(els.gameChoiceSelect.value || 0);
  const choice = scenario.choices[selected];
  Object.entries(choice.effects).forEach(([key, delta]) => {
    state.game.stats[key] = Math.max(0, Math.min(100, state.game.stats[key] + delta));
  });
  state.game.history.push({ round: state.game.round, choice: choice.label });
  els.gameFeedback.textContent = choice.text;
  if (state.user) state.user.votesCast += 2;
  state.game.round += 1;
  renderGameRound();
}

function attachEvents() {
  els.authForm.addEventListener("submit", (event) => {
    event.preventDefault();
    state.user = { name: els.nameInput.value.trim(), level: els.levelInput.value, votesCast: 0 };
    save();
    renderProfile();
  });

  els.areaFilter.addEventListener("change", () => {
    state.filters.area = els.areaFilter.value;
    renderAll();
  });
  els.categoryFilter.addEventListener("change", () => {
    state.filters.category = els.categoryFilter.value;
    renderAll();
  });
  els.sortFilter.addEventListener("change", () => {
    state.filters.sort = els.sortFilter.value;
    renderAll();
  });

  els.issuesList.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const id = target.dataset.open;
    if (!id) return;
    state.selectedIssueId = id;
    renderDetail();
    showDetail();
  });

  els.memesList.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const id = target.dataset.memeVote;
    if (!id) return;
    const meme = state.memes.find((m) => m.id === id);
    if (!meme) return;
    meme.votes += 1;
    if (state.user) state.user.votesCast += 1;
    save();
    renderProfile();
    renderMemes();
  });

  els.mapHotspots.addEventListener("click", (event) => {
    const target = event.target.closest("button[data-open]");
    if (!(target instanceof HTMLElement)) return;
    state.selectedIssueId = target.dataset.open;
    renderDetail();
    showDetail();
  });

  els.backToDashboardBtn.addEventListener("click", showDashboard);
  els.briefBtn.addEventListener("click", generateBrief);
  els.startGameBtn.addEventListener("click", startGame);
  els.exitGameBtn.addEventListener("click", showDashboard);
  els.confirmGameChoiceBtn.addEventListener("click", handleGameChoice);
}

function renderAll() {
  renderProfile();
  renderFilters();
  renderIssues();
  maybeRefreshMemes();
  renderMemeTimer();
  renderMemes();
  renderScorecards();
  renderCharts();
  renderMap();
  renderDetail();
}

load();
attachEvents();
showDashboard();
renderAll();
setInterval(renderMemeTimer, 60000);
