const STORAGE_KEY = "civicspark-mvp";

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
    whatItIs: "Boat traffic near the River Cam is linked to local smoke and exhaust smell complaints.",
    whyItMatters: "Air quality affects breathing, wellbeing, and focus for students living/studying nearby.",
    ifNothingChanges: "Smell complaints continue, trust drops, and pollution impacts can worsen.",
    whatStudentsWant: "Faster emissions checks, transparent monitoring, and cleaner fuel standards.",
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
    debateVotes: { economic: 7, environmental: 12 }
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
    whatItIs: "Students are affected by rising bus prices and uneven route access.",
    whyItMatters: "High travel costs reduce attendance and opportunities.",
    ifNothingChanges: "Absence risk rises and fewer students access after-school support.",
    whatStudentsWant: "Capped youth fares and fair access routes.",
    evidence: ["Fares linked with lower student mobility.", "Youth polling supports capped fare pilots."],
    actions: ["Submit youth fare impact statement.", "Recommend commuter-town pilot routes."],
    comments: ["Means-tested support should be included."],
    debateVotes: { economic: 9, environmental: 5 }
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
    whatItIs: "Current opening times do not cover high-demand exam season evenings.",
    whyItMatters: "Quiet study access improves attainment and mental health.",
    ifNothingChanges: "Learning gaps widen for students without home study space.",
    whatStudentsWant: "Evening extension pilots and safe transport home.",
    evidence: ["Exam-season demand exceeds opening hours.", "Quiet-space inequality affects outcomes."],
    actions: ["Propose 8-week evening pilot.", "Align bus schedule for safe returns."],
    comments: ["Need weekend extension too."],
    debateVotes: { economic: 4, environmental: 11 }
  }
];

const STORY_TOPICS = [
  "Why local councils affect your daily life",
  "How one vote can influence transport policy",
  "River pollution: why air rules matter",
  "How students can influence committee decisions",
  "Misinformation vs evidence in civic debates"
];
const STORY_VIDEO = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

const GAME_SCENARIOS = [
  {
    title: "Year 1: River Cam pollution",
    description: "Boat emissions are rising and residents report strong gas smell near homes.",
    choices: [
      { label: "Ignore issue", effects: { air: -12, trust: -8, youth: -6, transport: 0, living: -2, misinformation: 4 }, text: "Pollution worsens while youth trust drops." },
      { label: "Gather evidence + student reports", effects: { air: 8, trust: 9, youth: 5, transport: 0, living: 1, misinformation: -3 }, text: "Evidence turns concern into action." },
      { label: "Spread unverified rumour", effects: { air: -3, trust: -11, youth: -2, transport: 0, living: -1, misinformation: 14 }, text: "Confusion rises and policy progress slows." }
    ]
  },
  {
    title: "Year 2: Budget pressure",
    description: "Council budget cuts are announced across services.",
    choices: [
      { label: "Cut youth services first", effects: { air: 0, trust: -6, youth: -10, transport: -3, living: 2, misinformation: 2 }, text: "Savings now, social cost later." },
      { label: "Co-design budget with youth groups", effects: { air: 1, trust: 7, youth: 8, transport: 3, living: -2, misinformation: -1 }, text: "Participation improves fairness." },
      { label: "Delay decisions", effects: { air: 0, trust: -4, youth: -3, transport: -2, living: -3, misinformation: 5 }, text: "Delays increase uncertainty." }
    ]
  },
  {
    title: "Year 3: Transport disruption",
    description: "Commute reliability drops and students are late more often.",
    choices: [
      { label: "Negotiate emergency transport plan", effects: { air: 1, trust: 6, youth: 4, transport: 9, living: 2, misinformation: -1 }, text: "Access improves through coordination." },
      { label: "Only post complaints online", effects: { air: 0, trust: -2, youth: -1, transport: -3, living: -1, misinformation: 4 }, text: "Awareness without delivery." },
      { label: "Ignore for now", effects: { air: 0, trust: -5, youth: -4, transport: -8, living: -2, misinformation: 2 }, text: "Daily friction gets worse." }
    ]
  },
  {
    title: "Year 4: Misinformation wave",
    description: "Rumours spread quickly about local policies.",
    choices: [
      { label: "Launch student fact-check feed", effects: { air: 0, trust: 8, youth: 5, transport: 0, living: 1, misinformation: -10 }, text: "Clarity rebuilds trust." },
      { label: "Ignore rumours", effects: { air: 0, trust: -4, youth: -2, transport: 0, living: -1, misinformation: 8 }, text: "False narratives take over." },
      { label: "Amplify viral claims", effects: { air: 0, trust: -10, youth: -3, transport: 0, living: -2, misinformation: 12 }, text: "Engagement spikes, credibility collapses." }
    ]
  },
  {
    title: "Year 5: Final policy package",
    description: "Final chance to lock in youth-priority reforms.",
    choices: [
      { label: "Submit evidence + youth mandate", effects: { air: 7, trust: 10, youth: 9, transport: 5, living: 4, misinformation: -4 }, text: "Strong, measurable final impact." },
      { label: "Push slogans only", effects: { air: 1, trust: -4, youth: 2, transport: 0, living: 0, misinformation: 6 }, text: "Momentum without detail." },
      { label: "Skip final engagement", effects: { air: -3, trust: -8, youth: -7, transport: -2, living: -2, misinformation: 2 }, text: "Opportunity missed." }
    ]
  }
];

const RANDOM_EVENTS = [
  { text: "Random event: local journalist amplifies student evidence.", effects: { trust: 3, youth: 2 } },
  { text: "Random event: social media misinformation spike.", effects: { misinformation: 4, trust: -2 } },
  { text: "Random event: emergency transport funding released.", effects: { transport: 3, living: 2 } }
];

const state = {
  user: null,
  issues: structuredClone(SAMPLE_ISSUES),
  selectedIssueId: null,
  filters: { area: "All areas", category: "All categories", sort: "trending" },
  stories: [],
  lastStoryRefresh: Date.now(),
  game: {
    round: 0,
    stats: { air: 50, trust: 50, youth: 50, transport: 50, living: 50, misinformation: 50 },
    previous: { air: 50, trust: 50, youth: 50, transport: 50, living: 50, misinformation: 50 }
  }
};

const els = {
  authForm: document.querySelector("#authForm"),
  nameInput: document.querySelector("#nameInput"),
  levelInput: document.querySelector("#levelInput"),
  profilePill: document.querySelector("#profilePill"),
  featuredIssue: document.querySelector("#featuredIssue"),
  issueCount: document.querySelector("#issueCount"),
  issuesList: document.querySelector("#issuesList"),
  areaFilter: document.querySelector("#areaFilter"),
  categoryFilter: document.querySelector("#categoryFilter"),
  sortFilter: document.querySelector("#sortFilter"),
  storiesList: document.querySelector("#storiesList"),
  storyTimer: document.querySelector("#storyTimer"),
  comparisonBars: document.querySelector("#comparisonBars"),
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
  gameFeedback: document.querySelector("#gameFeedback"),
  gameResultCard: document.querySelector("#gameResultCard")
};

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: state.user, issues: state.issues, stories: state.stories, lastStoryRefresh: state.lastStoryRefresh }));
}

function load() {
  const cached = localStorage.getItem(STORAGE_KEY);
  if (!cached) return;
  const parsed = JSON.parse(cached);
  state.user = parsed.user || null;
  state.issues = parsed.issues?.length ? parsed.issues : state.issues;
  state.stories = parsed.stories?.length ? parsed.stories : [];
  state.lastStoryRefresh = parsed.lastStoryRefresh || Date.now();
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

function civiRank(points = 0) {
  if (points >= 30) return "Youth Leader";
  if (points >= 20) return "Policy Influencer";
  if (points >= 12) return "Community Voice";
  if (points >= 5) return "Voter";
  return "Observer";
}

function renderProfile() {
  if (!state.user) {
    els.profilePill.classList.add("hidden");
    return;
  }
  els.profilePill.classList.remove("hidden");
  els.profilePill.textContent = `${state.user.name} • ${state.user.level} • ${state.user.points} pts • ${civiRank(state.user.points)}`;
}

function filteredIssues() {
  let data = [...state.issues];
  if (state.filters.area !== "All areas") data = data.filter((i) => i.location === state.filters.area);
  if (state.filters.category !== "All categories") data = data.filter((i) => i.category === state.filters.category);
  if (state.filters.sort === "support") data.sort((a, b) => b.studentVotes.high - a.studentVotes.high);
  if (state.filters.sort === "official") data.sort((a, b) => Math.abs((b.studentVotes.high - b.officialPriority)) - Math.abs((a.studentVotes.high - a.officialPriority)));
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

function renderFeaturedIssue() {
  const top = [...state.issues].sort((a, b) => b.studentVotes.high - a.studentVotes.high)[0];
  els.featuredIssue.innerHTML = `
    <div class="issue-card">
      <h3>${top.title}</h3>
      <p class="meta">${top.location} • ${top.category}</p>
      <p><strong>What it is:</strong> ${top.whatItIs}</p>
      <p><strong>Why it matters:</strong> ${top.whyItMatters}</p>
      <p><strong>If nothing changes:</strong> ${top.ifNothingChanges}</p>
      <p><strong>What students want:</strong> ${top.whatStudentsWant}</p>
      <button data-open="${top.id}">Open full issue</button>
    </div>
  `;
}

function renderIssueCards() {
  const data = filteredIssues();
  els.issueCount.textContent = `${data.length} issues`;
  els.issuesList.innerHTML = "";
  data.forEach((issue) => {
    const card = document.createElement("article");
    card.className = "issue-card";
    card.innerHTML = `
      <h3>${issue.title}</h3>
      <p class="meta">${issue.location} • ${issue.category}</p>
      <p><strong>What it is:</strong> ${issue.whatItIs}</p>
      <p><strong>Why it matters:</strong> ${issue.whyItMatters}</p>
      <p><strong>If nothing changes:</strong> ${issue.ifNothingChanges}</p>
      <p><strong>What students want:</strong> ${issue.whatStudentsWant}</p>
      <p class="meta">High-priority votes: ${issue.studentVotes.high} • Official priority: ${issue.officialPriority}</p>
      <button data-open="${issue.id}">Open issue</button>
    `;
    els.issuesList.append(card);
  });
}

function refreshStories() {
  const picks = [...STORY_TOPICS].sort(() => Math.random() - 0.5).slice(0, 3);
  state.stories = picks.map((topic, idx) => ({
    id: `${Date.now()}-${idx}`,
    topic,
    duration: `${30 + idx * 10}s`,
    src: STORY_VIDEO
  }));
  state.lastStoryRefresh = Date.now();
  save();
}

function maybeRefreshStories() {
  const hour = 1000 * 60 * 60;
  if (!state.stories.length || Date.now() - state.lastStoryRefresh >= hour) refreshStories();
}

function renderStoryTimer() {
  const ms = Math.max(0, 1000 * 60 * 60 - (Date.now() - state.lastStoryRefresh));
  els.storyTimer.textContent = `Next refresh in ${Math.floor(ms / 60000)}m`;
}

function renderStories() {
  els.storiesList.innerHTML = "";
  state.stories.forEach((story) => {
    const card = document.createElement("article");
    card.className = "story-card";
    card.innerHTML = `
      <video preload="metadata" loading="lazy" muted playsinline controls src="${story.src}"></video>
      <h4>${story.topic}</h4>
      <p class="meta">${story.duration} civic short</p>
    `;
    els.storiesList.append(card);
  });
}

function renderComparison() {
  const rows = [...state.issues].sort((a, b) => b.studentVotes.high - a.studentVotes.high);
  els.comparisonBars.innerHTML = rows.map((issue) => {
    const student = Math.min(100, issue.studentVotes.high);
    const official = Math.min(100, issue.officialPriority);
    return `
      <article class="issue-card">
        <h3>${issue.title}</h3>
        <p class="meta">Students: #${rows.findIndex((x) => x.id === issue.id) + 1} • Officials score: ${issue.officialPriority}</p>
        <div class="progress-wrap"><small>Student priority</small><div class="progress-bar"><div class="progress-fill" style="width:${student}%"></div></div></div>
        <div class="progress-wrap"><small>Official priority</small><div class="progress-bar"><div class="progress-fill" style="width:${official}%; opacity:.55"></div></div></div>
      </article>
    `;
  }).join("");
}

function renderDetail() {
  const issue = state.issues.find((i) => i.id === state.selectedIssueId) || state.issues[0];
  if (!issue) return;

  els.detailCard.innerHTML = `
    <h3>${issue.title}</h3>
    <p class="meta">${issue.location} • ${issue.category} • ${issue.chamber}</p>
    <p><strong>Source:</strong> ${issue.source}</p>
    <p><strong>What it is:</strong> ${issue.whatItIs}</p>
    <p><strong>Why it matters:</strong> ${issue.whyItMatters}</p>
    <p><strong>If nothing changes:</strong> ${issue.ifNothingChanges}</p>
    <p><strong>What students want:</strong> ${issue.whatStudentsWant}</p>
    <div class="detail-evidence"><h4>Evidence</h4><ul>${issue.evidence.map((e) => `<li>${e}</li>`).join("")}</ul></div>

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
    if (state.user) state.user.points += 2;
    save();
    renderAll();
    showDetail();
  });
}

function applyEventEffects(event) {
  Object.entries(event.effects).forEach(([k, v]) => {
    state.game.stats[k] = Math.max(0, Math.min(100, state.game.stats[k] + v));
  });
}

function renderGameStats() {
  const labels = {
    air: "Air Quality",
    trust: "Public Trust",
    youth: "Youth Happiness",
    transport: "Transport Access",
    living: "Cost of Living",
    misinformation: "Misinformation"
  };

  els.gameStats.innerHTML = Object.entries(state.game.stats).map(([key, value]) => {
    const delta = value - state.game.previous[key];
    const deltaText = delta === 0 ? "0" : `${delta > 0 ? "+" : ""}${delta}`;
    return `<div class="stat ${delta !== 0 ? "flash" : ""}"><strong>${value}</strong><br/>${labels[key]} <span class="meta">(${deltaText})</span></div>`;
  }).join("");

  state.game.previous = { ...state.game.stats };
}

function gameEndingSummary() {
  const s = state.game.stats;
  const score = s.air + s.trust + s.youth + s.transport + s.living - s.misinformation;
  if (score > 300) return "You built a greener city with stronger public trust.";
  if (s.transport > s.air && s.transport > 65) return "Your leadership prioritized cheaper, more reliable transport.";
  if (s.misinformation > 70) return "Misinformation dominated your city and blocked progress.";
  return "You balanced trade-offs, but missed big opportunities.";
}

function renderGameRound() {
  renderGameStats();
  els.gameResultCard.classList.add("hidden");

  if (state.game.round >= GAME_SCENARIOS.length) {
    const result = gameEndingSummary();
    els.gameRoundLabel.textContent = "Final result";
    els.gameScenarioTitle.textContent = "Your city outcome";
    els.gameScenarioDescription.textContent = result;
    els.gameEvent.textContent = "Screenshot this and challenge your friends.";
    els.gameChoiceSelect.innerHTML = "<option>Start over</option>";
    els.confirmGameChoiceBtn.textContent = "Play again";
    els.gameResultCard.classList.remove("hidden");
    els.gameResultCard.textContent = `📸 Shareable result: ${result}`;
    if (state.user) state.user.points += 8;
    save();
    return;
  }

  const scenario = GAME_SCENARIOS[state.game.round];
  const event = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
  applyEventEffects(event);

  els.gameRoundLabel.textContent = `Year ${state.game.round + 1} of ${GAME_SCENARIOS.length}`;
  els.gameScenarioTitle.textContent = scenario.title;
  els.gameScenarioDescription.textContent = scenario.description;
  els.gameEvent.textContent = event.text;
  els.gameChoiceSelect.innerHTML = scenario.choices.map((c, idx) => `<option value="${idx}">${c.label}</option>`).join("");
  els.confirmGameChoiceBtn.textContent = "Confirm action";
  renderGameStats();
}

function startGame() {
  state.game.round = 0;
  state.game.stats = { air: 50, trust: 50, youth: 50, transport: 50, living: 50, misinformation: 50 };
  state.game.previous = { ...state.game.stats };
  els.gameFeedback.textContent = "Your choices change the city instantly.";
  showGame();
  renderGameRound();
}

function handleGameChoice() {
  if (state.game.round >= GAME_SCENARIOS.length) {
    startGame();
    return;
  }
  const scenario = GAME_SCENARIOS[state.game.round];
  const choice = scenario.choices[Number(els.gameChoiceSelect.value || 0)];
  Object.entries(choice.effects).forEach(([k, v]) => {
    state.game.stats[k] = Math.max(0, Math.min(100, state.game.stats[k] + v));
  });
  els.gameFeedback.textContent = choice.text;
  if (state.user) state.user.points += 3;
  state.game.round += 1;
  save();
  renderGameRound();
}

function attachEvents() {
  els.authForm.addEventListener("submit", (event) => {
    event.preventDefault();
    state.user = { name: els.nameInput.value.trim(), level: els.levelInput.value, points: 0 };
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

  function handleOpenClick(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const id = target.dataset.open;
    if (!id) return;
    state.selectedIssueId = id;
    renderDetail();
    showDetail();
  }

  els.issuesList.addEventListener("click", handleOpenClick);
  els.featuredIssue.addEventListener("click", handleOpenClick);

  els.backToDashboardBtn.addEventListener("click", showDashboard);
  els.startGameBtn.addEventListener("click", startGame);
  els.exitGameBtn.addEventListener("click", showDashboard);
  els.confirmGameChoiceBtn.addEventListener("click", handleGameChoice);
}

function renderAll() {
  renderProfile();
  renderFilters();
  renderFeaturedIssue();
  renderIssueCards();
  maybeRefreshStories();
  renderStoryTimer();
  renderStories();
  renderComparison();
  renderDetail();
}

load();
attachEvents();
showDashboard();
renderAll();
setInterval(() => {
  maybeRefreshStories();
  renderStoryTimer();
  renderStories();
}, 60000);
