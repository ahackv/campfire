const STORAGE_KEY = "civicspark-mvp";

const BASE_ISSUES = [
  {
    id: "cam-river-air",
    title: "River Cam boat emissions and air quality",
    location: "Cambridge",
    category: "Environment",
    source: "Cambridge City Council reports + resident complaints",
    officialPriority: 52,
    studentVotes: { high: 62, medium: 14, low: 4 },
    whatItIs: "Boats on the River Cam are linked to smoke and gas-like smell complaints.",
    whyItMatters: "Air quality affects breathing, wellbeing, and concentration.",
    ifNothingChanges: "Pollution and trust problems continue.",
    whatStudentsWant: "Regular emissions checks and cleaner fuel standards."
  },
  {
    id: "uk-bus-fares",
    title: "Reduced under-21 bus fares",
    location: "UK",
    category: "Transport",
    source: "UK transport consultations",
    officialPriority: 65,
    studentVotes: { high: 55, medium: 21, low: 9 },
    whatItIs: "Students face rising bus costs and route reliability issues.",
    whyItMatters: "Transport costs impact attendance and opportunity.",
    ifNothingChanges: "Access gaps and absence pressures increase.",
    whatStudentsWant: "Fair youth fare caps and reliable routes."
  }
];

const GAME_SCENARIOS = [
  {
    title: "Year 1: River Cam pollution",
    description: "Boat emissions increase complaints around Cambridge.",
    choices: [
      { label: "Ignore problem", effects: { air: -12, trust: -8, youth: -6, transport: 0, budget: -1 }, text: "Pollution worsens and trust drops." },
      { label: "Collect evidence", effects: { air: 8, trust: 9, youth: 4, budget: -2 }, text: "Evidence moves policy conversations." },
      { label: "Introduce regulation", effects: { air: 10, trust: 5, youth: 3, budget: -5 }, text: "Cleaner air, but budget pressure rises." }
    ]
  },
  {
    title: "Year 2: Budget pressure",
    description: "Council budgets tighten.",
    choices: [
      { label: "Cut youth services", effects: { trust: -6, youth: -10, transport: -3, budget: 8 }, text: "Savings now, social cost later." },
      { label: "Co-design budget with students", effects: { trust: 7, youth: 8, transport: 3, budget: -4 }, text: "Participation improves fairness." }
    ]
  },
  {
    title: "Year 3: Transport disruption",
    description: "Commutes become unreliable.",
    choices: [
      { label: "Emergency transport plan", effects: { trust: 6, youth: 4, transport: 9, budget: -5 }, text: "Access improves quickly." },
      { label: "Complain only", effects: { trust: -2, youth: -1, transport: -3, budget: 0 }, text: "Awareness rises but no delivery." }
    ]
  },
  {
    title: "Year 4: Misinformation wave",
    description: "Rumours spread about local decisions.",
    choices: [
      { label: "Launch fact-check feed", effects: { trust: 8, youth: 5, misinformation: -10 }, text: "Clarity rebuilds trust." },
      { label: "Ignore rumours", effects: { trust: -4, youth: -2, misinformation: 8 }, text: "False narratives spread." }
    ]
  },
  {
    title: "Year 5: Final package",
    description: "Last chance to secure student-priority changes.",
    choices: [
      { label: "Submit youth mandate + evidence", effects: { air: 7, trust: 10, youth: 9, transport: 5, budget: -4 }, text: "Strong measurable impact." },
      { label: "Skip final engagement", effects: { air: -3, trust: -8, youth: -7, transport: -2 }, text: "Opportunity missed." }
    ]
  }
];

const RANDOM_EVENTS = [
  { text: "Random event: student climate protest gains support.", effects: { trust: 2, youth: 2 } },
  { text: "Random event: social media misinformation spike.", effects: { misinformation: 4, trust: -2 } },
  { text: "Random event: emergency transport funds unlocked.", effects: { transport: 3, budget: 2 } }
];

const state = {
  user: null,
  issues: structuredClone(BASE_ISSUES),
  filters: { area: "All areas", category: "All categories", sort: "trending" },
  selectedIssueId: null,
  swipeIndex: 0,
  swipeDeck: [],
  game: {
    round: 0,
    stats: { air: 50, trust: 50, youth: 50, transport: 50, budget: 50, misinformation: 50 },
    previous: { air: 50, trust: 50, youth: 50, transport: 50, budget: 50, misinformation: 50 }
  }
};

const els = {
  profilePill: document.querySelector("#profilePill"),
  authForm: document.querySelector("#authForm"),
  nameInput: document.querySelector("#nameInput"),
  levelInput: document.querySelector("#levelInput"),
  homeView: document.querySelector("#homeView"),
  swipeView: document.querySelector("#swipeView"),
  gameView: document.querySelector("#gameView"),
  statsView: document.querySelector("#statsView"),
  issuesView: document.querySelector("#issuesView"),
  featuredIssue: document.querySelector("#featuredIssue"),
  swipeCard: document.querySelector("#swipeCard"),
  statsSummary: document.querySelector("#statsSummary"),
  comparisonBars: document.querySelector("#comparisonBars"),
  issueCount: document.querySelector("#issueCount"),
  areaFilter: document.querySelector("#areaFilter"),
  categoryFilter: document.querySelector("#categoryFilter"),
  sortFilter: document.querySelector("#sortFilter"),
  issuesList: document.querySelector("#issuesList"),
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: state.user, issues: state.issues }));
}

function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  const parsed = JSON.parse(raw);
  state.user = parsed.user || null;
  state.issues = parsed.issues?.length ? parsed.issues : state.issues;
}

async function fetchGovernmentIssues() {
  try {
    const response = await fetch("https://petition.parliament.uk/petitions.json?state=open&count=12");
    if (!response.ok) return;
    const payload = await response.json();
    const incoming = (payload?.data || []).slice(0, 4).map((item, idx) => {
      const a = item.attributes || {};
      const title = a.action || "Parliament petition";
      const category = inferCategory(title);
      return {
        id: `petition-${item.id}`,
        title,
        location: "UK",
        category,
        source: "UK Parliament Petitions API",
        officialPriority: 40 + ((idx + 1) * 9) % 35,
        studentVotes: { high: 8 + idx * 4, medium: 6 + idx * 2, low: 2 + idx },
        whatItIs: simplifyText(a.background || a.action || title),
        whyItMatters: whyForStudents(category),
        ifNothingChanges: consequence(category),
        whatStudentsWant: desiredAction(category)
      };
    });

    const known = new Set(state.issues.map((i) => i.id));
    incoming.forEach((i) => {
      if (!known.has(i.id)) state.issues.push(i);
    });
    save();
    renderAll();
  } catch {
    // keep baseline dataset on network failure
  }
}

function inferCategory(text) {
  const t = text.toLowerCase();
  if (/(air|pollution|climate|environment|river)/.test(t)) return "Environment";
  if (/(bus|train|transport|fare|travel)/.test(t)) return "Transport";
  if (/(housing|rent|landlord|home)/.test(t)) return "Housing";
  return "Education";
}

function simplifyText(text) {
  return (text || "Public policy issue under active discussion.").split(".")[0].slice(0, 140);
}

function whyForStudents(category) {
  return {
    Environment: "Air and climate policy affects health and daily comfort.",
    Transport: "Transport policy affects attendance and opportunities.",
    Housing: "Housing standards affect wellbeing and study quality.",
    Education: "Education policy directly affects access and outcomes."
  }[category] || "This affects daily student life.";
}

function consequence(category) {
  return {
    Environment: "Pollution and health risks continue.",
    Transport: "Access barriers and costs remain high.",
    Housing: "Unsafe conditions and stress continue.",
    Education: "Learning inequality can increase."
  }[category] || "Problems continue without policy action.";
}

function desiredAction(category) {
  return {
    Environment: "Enforce standards and publish monitoring updates.",
    Transport: "Prioritize affordable fares and reliable routes.",
    Housing: "Improve inspection transparency and response speed.",
    Education: "Expand practical access and support services."
  }[category] || "Push practical evidence-based policy updates.";
}

function civiRank(points = 0) {
  if (points >= 30) return "Youth Leader";
  if (points >= 20) return "Policy Influencer";
  if (points >= 12) return "Community Voice";
  if (points >= 5) return "Voter";
  return "Observer";
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

function totalVotes(issue) {
  return issue.studentVotes.high + issue.studentVotes.medium + issue.studentVotes.low;
}

function renderProfile() {
  if (!state.user) {
    els.profilePill.classList.add("hidden");
    return;
  }
  els.profilePill.classList.remove("hidden");
  els.profilePill.textContent = `${state.user.name} • ${state.user.level} • ${state.user.points} pts • ${civiRank(state.user.points)}`;
}

function renderFeaturedIssue() {
  const top = [...state.issues].sort((a, b) => b.studentVotes.high - a.studentVotes.high)[0];
  if (!top) return;
  els.featuredIssue.innerHTML = `
    <h3>${top.title}</h3>
    <p class="meta">${top.location} • ${top.category} • Source: ${top.source}</p>
    <p><strong>What is happening?</strong> ${top.whatItIs}</p>
    <p><strong>Why it matters:</strong> ${top.whyItMatters}</p>
    <p><strong>If nothing changes:</strong> ${top.ifNothingChanges}</p>
    <p><strong>Action path:</strong> ${top.whatStudentsWant}</p>
  `;
}

function buildSwipeDeck() {
  const coreCards = state.issues.slice(0, 5).map((issue) => ({
    id: issue.id,
    question: `Should this issue become a top priority now: ${issue.title}?`,
    issueId: issue.id
  }));
  coreCards.push({ id: "vapes", question: "Should disposable vapes be banned in the UK?", issueId: null, category: "Health" });
  state.swipeDeck = coreCards;
}

function renderSwipeCard() {
  if (!state.swipeDeck.length) buildSwipeDeck();
  const card = state.swipeDeck[state.swipeIndex % state.swipeDeck.length];
  let studentYes = 0;
  let official = 0;
  let explanation = "Short explainer: fast choices shape real priorities.";

  if (card.issueId) {
    const issue = state.issues.find((i) => i.id === card.issueId);
    studentYes = issue?.studentVotes.high || 0;
    official = issue?.officialPriority || 0;
    explanation = issue?.whyItMatters || explanation;
  } else {
    studentYes = 41;
    official = 28;
    explanation = "Health rules affect school wellbeing and long-term costs.";
  }

  els.swipeCard.classList.remove("swiped-left", "swiped-right");
  els.swipeCard.innerHTML = `
    <h3>${card.question}</h3>
    <div class="filters">
      <button id="swipeNoBtn" type="button">Swipe Left (No)</button>
      <button id="swipeYesBtn" type="button">Swipe Right (Yes)</button>
    </div>
    <p class="meta">Students YES: ${studentYes}% • Officials support: ${official}%</p>
    <p>${explanation}</p>
  `;

  document.querySelector("#swipeNoBtn").addEventListener("click", () => handleSwipe(false));
  document.querySelector("#swipeYesBtn").addEventListener("click", () => handleSwipe(true));
}

function handleSwipe(isYes) {
  const card = state.swipeDeck[state.swipeIndex % state.swipeDeck.length];
  els.swipeCard.classList.add(isYes ? "swiped-right" : "swiped-left");
  if (card.issueId) {
    const issue = state.issues.find((i) => i.id === card.issueId);
    if (issue) issue.studentVotes[isYes ? "high" : "low"] += 1;
  }
  if (state.user) state.user.points += 1;
  state.swipeIndex += 1;
  save();
  setTimeout(() => {
    renderSwipeCard();
    renderStatsPage();
    renderIssuesPage();
    renderFeaturedIssue();
  }, 160);
}

function renderStatsPage() {
  const data = [...state.issues].sort((a, b) => b.studentVotes.high - a.studentVotes.high);
  const topStudent = data[0];
  const topOfficial = [...state.issues].sort((a, b) => b.officialPriority - a.officialPriority)[0];
  const gap = [...state.issues].sort((a, b) => Math.abs(b.studentVotes.high - b.officialPriority) - Math.abs(a.studentVotes.high - a.officialPriority))[0];

  els.statsSummary.innerHTML = `
    <div class="stat"><strong>${topStudent?.title || "-"}</strong><br/>Top student priority</div>
    <div class="stat"><strong>${topOfficial?.title || "-"}</strong><br/>Top official priority</div>
    <div class="stat"><strong>${gap ? Math.abs(gap.studentVotes.high - gap.officialPriority) : 0}%</strong><br/>Biggest disagreement</div>
  `;

  els.comparisonBars.innerHTML = data.map((issue, idx) => `
    <article class="issue-card">
      <h3>${issue.title}</h3>
      <p class="meta">Students #${idx + 1} • Officials ${issue.officialPriority}%</p>
      <div class="progress-wrap"><small>Students</small><div class="progress-bar"><div class="progress-fill" style="width:${Math.min(100, issue.studentVotes.high)}%"></div></div></div>
      <div class="progress-wrap"><small>Officials</small><div class="progress-bar"><div class="progress-fill" style="width:${Math.min(100, issue.officialPriority)}%; opacity:.5"></div></div></div>
    </article>
  `).join("");
}

function renderIssuesPage() {
  const data = filteredIssues();
  const areas = ["All areas", ...new Set(state.issues.map((i) => i.location))];
  const categories = ["All categories", ...new Set(state.issues.map((i) => i.category))];
  if (!els.areaFilter.options.length || els.areaFilter.options.length !== areas.length) {
    els.areaFilter.innerHTML = areas.map((a) => `<option>${a}</option>`).join("");
  }
  if (!els.categoryFilter.options.length || els.categoryFilter.options.length !== categories.length) {
    els.categoryFilter.innerHTML = categories.map((c) => `<option>${c}</option>`).join("");
  }
  els.areaFilter.value = state.filters.area;
  els.categoryFilter.value = state.filters.category;
  els.sortFilter.value = state.filters.sort;

  els.issueCount.textContent = `${data.length} issues`;
  els.issuesList.innerHTML = data.map((issue) => `
    <article class="issue-card">
      <h3>${issue.title}</h3>
      <p class="meta">${issue.location} • ${issue.category} • Source: ${issue.source}</p>
      <p><strong>What is happening?</strong> ${issue.whatItIs}</p>
      <p><strong>Why it matters:</strong> ${issue.whyItMatters}</p>
      <p><strong>If nothing changes:</strong> ${issue.ifNothingChanges}</p>
      <p><strong>Action path:</strong> ${issue.whatStudentsWant}</p>
      <p class="meta">Student high votes: ${issue.studentVotes.high} • Official priority: ${issue.officialPriority}</p>
    </article>
  `).join("");
}

function applyEvent(event) {
  Object.entries(event.effects).forEach(([k, v]) => {
    state.game.stats[k] = Math.max(0, Math.min(100, state.game.stats[k] + v));
  });
}

function renderGameStats() {
  const labels = { air: "Air Quality", trust: "Public Trust", youth: "Youth Happiness", transport: "Transport Access", budget: "Budget", misinformation: "Misinformation" };
  els.gameStats.innerHTML = Object.entries(state.game.stats).map(([k, v]) => {
    const d = v - state.game.previous[k];
    return `<div class="stat ${d !== 0 ? "flash" : ""}"><strong>${v}</strong><br/>${labels[k]} <span class="meta">(${d >= 0 ? "+" : ""}${d})</span></div>`;
  }).join("");
  state.game.previous = { ...state.game.stats };
}

function gameEnding() {
  const s = state.game.stats;
  const score = s.air + s.trust + s.youth + s.transport + s.budget - s.misinformation;
  if (score > 300) return "You governed as a Climate First Leader.";
  if (s.transport > 65) return "You built a city focused on cheaper, reliable transport.";
  if (s.misinformation > 70) return "Misinformation dominated your city decisions.";
  return "You balanced trade-offs but missed some long-term wins.";
}

function renderGameRound() {
  renderGameStats();
  els.gameResultCard.classList.add("hidden");

  if (state.game.round >= GAME_SCENARIOS.length) {
    const ending = gameEnding();
    els.gameRoundLabel.textContent = "Final result";
    els.gameScenarioTitle.textContent = "Your 5-year city summary";
    els.gameScenarioDescription.textContent = ending;
    els.gameEvent.textContent = "Screenshot this and compare with friends.";
    els.gameChoiceSelect.innerHTML = "<option>Start over</option>";
    els.confirmGameChoiceBtn.textContent = "Play again";
    els.gameResultCard.classList.remove("hidden");
    els.gameResultCard.textContent = `📸 Shareable result: ${ending}`;
    if (state.user) state.user.points += 8;
    save();
    return;
  }

  const scenario = GAME_SCENARIOS[state.game.round];
  const event = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
  applyEvent(event);

  els.gameRoundLabel.textContent = `Year ${state.game.round + 1} of ${GAME_SCENARIOS.length}`;
  els.gameScenarioTitle.textContent = scenario.title;
  els.gameScenarioDescription.textContent = scenario.description;
  els.gameEvent.textContent = event.text;
  els.gameChoiceSelect.innerHTML = scenario.choices.map((c, i) => `<option value="${i}">${c.label}</option>`).join("");
  els.confirmGameChoiceBtn.textContent = "Confirm action";
  renderGameStats();
}

function startGame() {
  state.game.round = 0;
  state.game.stats = { air: 50, trust: 50, youth: 50, transport: 50, budget: 50, misinformation: 50 };
  state.game.previous = { ...state.game.stats };
  els.gameFeedback.textContent = "Your choices update city stats immediately.";
  openView("game");
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

function openView(name) {
  const views = { home: els.homeView, swipe: els.swipeView, game: els.gameView, stats: els.statsView, issues: els.issuesView };
  Object.values(views).forEach((v) => v.classList.add("hidden"));
  views[name].classList.remove("hidden");
}

function attachEvents() {
  els.authForm.addEventListener("submit", (event) => {
    event.preventDefault();
    state.user = { name: els.nameInput.value.trim(), level: els.levelInput.value, points: 0 };
    save();
    renderProfile();
  });

  document.querySelectorAll("button[data-open-view]").forEach((btn) => {
    btn.addEventListener("click", () => openView(btn.dataset.openView));
  });

  els.areaFilter.addEventListener("change", () => {
    state.filters.area = els.areaFilter.value;
    renderIssuesPage();
  });
  els.categoryFilter.addEventListener("change", () => {
    state.filters.category = els.categoryFilter.value;
    renderIssuesPage();
  });
  els.sortFilter.addEventListener("change", () => {
    state.filters.sort = els.sortFilter.value;
    renderIssuesPage();
  });

  els.startGameBtn.addEventListener("click", startGame);
  els.confirmGameChoiceBtn.addEventListener("click", handleGameChoice);
}

function renderAll() {
  renderProfile();
  renderFeaturedIssue();
  buildSwipeDeck();
  renderSwipeCard();
  renderStatsPage();
  renderIssuesPage();
}

load();
attachEvents();
openView("home");
renderAll();
fetchGovernmentIssues();
