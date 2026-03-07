const STORAGE_KEY = "civicspark-mvp";

const BASE_ISSUES = [
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
    ]
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
    actions: ["Submit youth fare impact statement.", "Recommend commuter-town pilot routes."]
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
    actions: ["Propose 8-week evening pilot.", "Align bus schedule for safe returns."]
  }
];

const GAME_SCENARIOS = [
  {
    title: "Year 1: River Cam pollution",
    description: "Boat emissions are rising and residents report strong gas smell near homes.",
    choices: [
      { label: "Ignore problem", effects: { air: -12, trust: -8, youth: -6, transport: 0, budget: -1, misinformation: 4 }, text: "Pollution worsens while youth trust drops." },
      { label: "Collect evidence", effects: { air: 8, trust: 9, youth: 5, transport: 0, budget: -2, misinformation: -3 }, text: "Evidence turns concern into policy action." },
      { label: "Start petition", effects: { air: 5, trust: 7, youth: 7, transport: 0, budget: -3, misinformation: -1 }, text: "Collective pressure builds political momentum." },
      { label: "Invest in cleaner technology", effects: { air: 10, trust: 4, youth: 4, transport: 0, budget: -8, misinformation: -2 }, text: "Strong environmental gains, but budget stress rises." }
    ]
  },
  {
    title: "Year 2: Budget pressure",
    description: "Council budget cuts are announced across services.",
    choices: [
      { label: "Cut youth services", effects: { trust: -6, youth: -10, transport: -3, budget: 8, misinformation: 2 }, text: "Short-term savings, long-term civic cost." },
      { label: "Co-design budget with students", effects: { trust: 7, youth: 8, transport: 3, budget: -4, misinformation: -1 }, text: "Participation improves fairness and trust." },
      { label: "Delay decisions", effects: { trust: -4, youth: -3, transport: -2, budget: -3, misinformation: 5 }, text: "Uncertainty increases tension and rumours." }
    ]
  },
  {
    title: "Year 3: Transport disruption",
    description: "Commute reliability drops and students are late more often.",
    choices: [
      { label: "Negotiate emergency plan", effects: { trust: 6, youth: 4, transport: 9, budget: -5, misinformation: -1 }, text: "Access improves through coordination." },
      { label: "Only complain online", effects: { trust: -2, youth: -1, transport: -3, budget: 0, misinformation: 4 }, text: "Awareness rises, delivery does not." },
      { label: "Ignore for now", effects: { trust: -5, youth: -4, transport: -8, budget: 0, misinformation: 2 }, text: "Daily life friction gets worse." }
    ]
  },
  {
    title: "Year 4: Misinformation wave",
    description: "Rumours spread quickly about local policy decisions.",
    choices: [
      { label: "Launch student fact-check feed", effects: { trust: 8, youth: 5, misinformation: -10, budget: -2 }, text: "Clarity rebuilds civic trust." },
      { label: "Ignore rumours", effects: { trust: -4, youth: -2, misinformation: 8 }, text: "False narratives dominate discussion." },
      { label: "Amplify viral claims", effects: { trust: -10, youth: -3, misinformation: 12 }, text: "Attention spikes while credibility collapses." }
    ]
  },
  {
    title: "Year 5: Final policy package",
    description: "Final chance to lock in youth-priority reforms.",
    choices: [
      { label: "Submit youth mandate + evidence", effects: { air: 7, trust: 10, youth: 9, transport: 5, budget: -4, misinformation: -4 }, text: "Strong, measurable final impact." },
      { label: "Push slogans only", effects: { trust: -4, youth: 2, misinformation: 6 }, text: "Momentum without policy detail." },
      { label: "Skip final engagement", effects: { air: -3, trust: -8, youth: -7, transport: -2, budget: 0, misinformation: 2 }, text: "Opportunity missed." }
    ]
  }
];

const RANDOM_EVENTS = [
  { text: "Random event: local journalist amplifies student evidence.", effects: { trust: 3, youth: 2 } },
  { text: "Random event: social media misinformation spike.", effects: { misinformation: 4, trust: -2 } },
  { text: "Random event: emergency transport funding released.", effects: { transport: 3, budget: 2 } }
];

const state = {
  user: null,
  issues: structuredClone(BASE_ISSUES),
  selectedIssueId: null,
  filters: { area: "All areas", category: "All categories", sort: "trending" },
  stories: [],
  storyScripts: [],
  activeStoryIndex: 0,
  lastStoryRefresh: Date.now(),
  game: {
    round: 0,
    stats: { air: 50, trust: 50, youth: 50, transport: 50, budget: 50, misinformation: 50 },
    previous: { air: 50, trust: 50, youth: 50, transport: 50, budget: 50, misinformation: 50 }
  }
};

let whiteboardAnimFrame;

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
  whiteboardCanvas: document.querySelector("#whiteboardCanvas"),
  storyList: document.querySelector("#storyList"),
  storyTimer: document.querySelector("#storyTimer"),
  calmAudio: document.querySelector("#calmAudio"),
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: state.user, issues: state.issues, stories: state.stories, storyScripts: state.storyScripts, lastStoryRefresh: state.lastStoryRefresh }));
}

function load() {
  const cached = localStorage.getItem(STORAGE_KEY);
  if (!cached) return;
  const parsed = JSON.parse(cached);
  state.user = parsed.user || null;
  state.issues = parsed.issues?.length ? parsed.issues : state.issues;
  state.stories = parsed.stories?.length ? parsed.stories : [];
  state.storyScripts = parsed.storyScripts?.length ? parsed.storyScripts : [];
  state.lastStoryRefresh = parsed.lastStoryRefresh || Date.now();
}

async function fetchLiveParliamentIssues() {
  try {
    const response = await fetch("https://petition.parliament.uk/petitions.json?state=open&count=15");
    if (!response.ok) return [];
    const data = await response.json();
    const petitions = data?.data || [];

    return petitions.slice(0, 6).map((item, idx) => {
      const attr = item.attributes || {};
      const title = attr.action || "Parliament petition";
      const category = inferCategory(title);
      const low = title.toLowerCase();
      return {
        id: `petition-${item.id}`,
        title,
        location: "UK",
        category,
        source: "UK Parliament Petitions API",
        chamber: "UK Parliament",
        officialPriority: 40 + (idx * 7) % 35,
        studentVotes: { high: 10 + idx * 5, medium: 8 + idx * 3, low: 2 + idx },
        credibility: 86,
        whatItIs: simplifyIssue(attr.background || attr.action || title),
        whyItMatters: whyForStudents(category),
        ifNothingChanges: consequence(category),
        whatStudentsWant: desiredAction(category),
        evidence: [`Petition signatures: ${attr.signature_count || 0}`, "Official UK Parliament petition record."],
        actions: ["Discuss in school civic forum.", "Vote and share evidence-based summary."]
      };
    });
  } catch {
    return [];
  }
}

function inferCategory(text) {
  const low = text.toLowerCase();
  if (/(air|climate|emission|pollution|green|river|environment)/.test(low)) return "Environment";
  if (/(bus|train|transport|fare|travel|road)/.test(low)) return "Transport";
  if (/(rent|housing|home|landlord|damp)/.test(low)) return "Housing";
  return "Education";
}

function simplifyIssue(text) {
  return text.split(".")[0].slice(0, 150) || "This is a current UK civic issue under public discussion.";
}

function whyForStudents(category) {
  const map = {
    Environment: "Environmental policy affects health, study comfort, and local quality of life.",
    Transport: "Transport policy changes attendance, cost of living, and access to opportunities.",
    Housing: "Housing standards affect student wellbeing, focus, and financial pressure.",
    Education: "Education policy directly impacts learning outcomes and equality."
  };
  return map[category] || map.Education;
}

function consequence(category) {
  const map = {
    Environment: "Pollution and health impacts continue with low accountability.",
    Transport: "Higher access barriers and rising student costs remain.",
    Housing: "Unsafe or low-quality living conditions continue unchecked.",
    Education: "Learning access gaps and stress levels can increase."
  };
  return map[category] || map.Education;
}

function desiredAction(category) {
  const map = {
    Environment: "Clear standards, monitoring, and public progress updates.",
    Transport: "Affordable fares and reliable routes for students.",
    Housing: "Stronger inspection transparency and quicker fixes.",
    Education: "Practical service improvements and inclusive access."
  };
  return map[category] || map.Education;
}

async function hydrateIssues() {
  const live = await fetchLiveParliamentIssues();
  if (live.length) {
    const existingIds = new Set(state.issues.map((i) => i.id));
    live.forEach((issue) => {
      if (!existingIds.has(issue.id)) state.issues.push(issue);
    });
    save();
    renderAll();
  }
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
  if (!els.areaFilter.options.length || els.areaFilter.options.length !== areas.length) {
    els.areaFilter.innerHTML = areas.map((a) => `<option>${a}</option>`).join("");
  }
  if (!els.categoryFilter.options.length || els.categoryFilter.options.length !== categories.length) {
    els.categoryFilter.innerHTML = categories.map((c) => `<option>${c}</option>`).join("");
  }
  els.areaFilter.value = state.filters.area;
  els.categoryFilter.value = state.filters.category;
  els.sortFilter.value = state.filters.sort;
}

function renderFeaturedIssue() {
  const top = [...state.issues].sort((a, b) => b.studentVotes.high - a.studentVotes.high)[0];
  if (!top) return;
  els.featuredIssue.innerHTML = `
    <div class="issue-card">
      <h3>${top.title}</h3>
      <p class="meta">${top.location} • ${top.category} • Source: ${top.source}</p>
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
      <p class="meta">${issue.location} • ${issue.category} • ${issue.chamber}</p>
      <p><strong>What is happening?</strong> ${issue.whatItIs}</p>
      <p><strong>Why students should care:</strong> ${issue.whyItMatters}</p>
      <p><strong>If nothing changes:</strong> ${issue.ifNothingChanges}</p>
      <p><strong>Action path:</strong> ${issue.whatStudentsWant}</p>
      <p class="meta">High-priority votes: ${issue.studentVotes.high} • Official priority: ${issue.officialPriority}</p>
      <button data-open="${issue.id}">Open issue</button>
    `;
    els.issuesList.append(card);
  });
}

function generateStoryScripts() {
  const topics = [...state.issues]
    .sort((a, b) => b.studentVotes.high - a.studentVotes.high)
    .slice(0, 3)
    .map((issue) => ({
      title: issue.title,
      script: `Topic: ${issue.title}. Why it matters: ${issue.whyItMatters} If ignored: ${issue.ifNothingChanges} Action: ${issue.whatStudentsWant}`
    }));
  state.storyScripts = topics;
  state.stories = topics.map((item, idx) => ({ id: `${Date.now()}-${idx}`, title: item.title, duration: "45s" }));
  state.activeStoryIndex = 0;
  state.lastStoryRefresh = Date.now();
  save();
}

function maybeRefreshStories() {
  const hour = 1000 * 60 * 60;
  if (!state.storyScripts.length || Date.now() - state.lastStoryRefresh >= hour) generateStoryScripts();
}

function renderStoryTimer() {
  const ms = Math.max(0, 1000 * 60 * 60 - (Date.now() - state.lastStoryRefresh));
  els.storyTimer.textContent = `Next refresh in ${Math.floor(ms / 60000)}m`;
}

function drawWhiteboard(scriptObj) {
  if (!scriptObj) return;
  const canvas = els.whiteboardCanvas;
  const ctx = canvas.getContext("2d");
  const script = scriptObj.script;
  let index = 0;

  cancelAnimationFrame(whiteboardAnimFrame);

  function frame() {
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // simple hand-drawn style icon
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(75, 80, 30, 0, Math.PI * 2);
    ctx.moveTo(65, 78);
    ctx.lineTo(75, 90);
    ctx.lineTo(93, 66);
    ctx.stroke();

    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 24px Inter, sans-serif";
    ctx.fillText("Civic Explained", 130, 72);
    ctx.font = "18px Inter, sans-serif";
    ctx.fillText(scriptObj.title, 130, 105);

    const shown = script.slice(0, index);
    wrapText(ctx, shown, 40, 160, 680, 30);

    index = Math.min(script.length, index + 2);
    if (index < script.length) {
      whiteboardAnimFrame = requestAnimationFrame(frame);
    }
  }

  frame();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  for (const word of words) {
    const test = `${line}${word} `;
    const width = ctx.measureText(test).width;
    if (width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = `${word} `;
      y += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, y);
}

function renderStoryList() {
  if (!state.storyScripts.length) return;
  const items = state.storyScripts.map((s, idx) => `<button data-story-index="${idx}">${s.title}</button>`).join(" ");
  els.storyList.innerHTML = `<h3>Story queue</h3><p class="meta">Tap a topic to replay the whiteboard explainer.</p><div class="filters">${items}</div>`;
}

function renderComparison() {
  const rows = [...state.issues].sort((a, b) => b.studentVotes.high - a.studentVotes.high);
  els.comparisonBars.innerHTML = rows.map((issue, idx) => {
    const student = Math.min(100, issue.studentVotes.high);
    const official = Math.min(100, issue.officialPriority);
    return `
      <article class="issue-card">
        <h3>${issue.title}</h3>
        <p class="meta">Students rank #${idx + 1} • Officials score ${issue.officialPriority}</p>
        <div class="progress-wrap"><small>Students</small><div class="progress-bar"><div class="progress-fill" style="width:${student}%"></div></div></div>
        <div class="progress-wrap"><small>Officials</small><div class="progress-bar"><div class="progress-fill" style="width:${official}%; opacity:.55"></div></div></div>
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
    <p><strong>What is happening?</strong> ${issue.whatItIs}</p>
    <p><strong>Why it matters to students:</strong> ${issue.whyItMatters}</p>
    <p><strong>If nothing changes:</strong> ${issue.ifNothingChanges}</p>
    <p><strong>Possible actions:</strong> ${issue.whatStudentsWant}</p>
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
    budget: "Budget",
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
  const score = s.air + s.trust + s.youth + s.transport + s.budget - s.misinformation;
  if (score > 300) return "You built a greener city but had to manage budget pressure.";
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
    els.gameEvent.textContent = "Share this result with friends.";
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
  state.game.stats = { air: 50, trust: 50, youth: 50, transport: 50, budget: 50, misinformation: 50 };
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

  els.storyList.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const idx = target.dataset.storyIndex;
    if (idx === undefined) return;
    const parsed = Number(idx);
    state.activeStoryIndex = parsed;
    drawWhiteboard(state.storyScripts[parsed]);
  });

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
  renderStoryList();
  drawWhiteboard(state.storyScripts[state.activeStoryIndex] || state.storyScripts[0]);
  renderComparison();
  renderDetail();
  if (els.calmAudio) els.calmAudio.volume = 0.25;
}

load();
attachEvents();
showDashboard();
renderAll();
hydrateIssues();
setInterval(() => {
  maybeRefreshStories();
  renderStoryTimer();
  renderStoryList();
  drawWhiteboard(state.storyScripts[state.activeStoryIndex] || state.storyScripts[0]);
}, 60000);
