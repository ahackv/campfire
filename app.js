const STORAGE_KEY = "campus-voice-data-mvp";

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
    whyItMatters: "Air quality affects respiratory health, comfort at home, and trust in local services.",
    evidence: [
      "Resident reports of gas-like smell near River Cam.",
      "Repeated student concerns and ignored complaint case.",
      "Need for emissions compliance checks for river boats."
    ],
    actions: [
      "Submit evidence pack to committee chair.",
      "Request public emissions monitoring update.",
      "Organise cross-school testimony session."
    ],
    comments: ["Include low-cost sensor data from schools.", "Add timeline tracking for council response."]
  },
  {
    id: "uk-bus-fares",
    title: "Reduced under-21 bus fares",
    location: "UK",
    category: "Transport",
    source: "UK Parliament transport consultations + local authority data",
    chamber: "UK Parliament Transport Committee",
    officialPriority: 65,
    studentVotes: { high: 55, medium: 21, low: 9 },
    credibility: 88,
    whyItMatters: "Transport costs affect attendance, opportunities, and cost-of-living pressure.",
    evidence: [
      "Fare increases linked to lower student mobility in commuter areas.",
      "Student-led polling suggests demand for capped youth fares."
    ],
    actions: ["Submit youth fare impact statement.", "Support pilot routes in education hubs."],
    comments: ["Needs means-tested support option."]
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
    whyItMatters: "Study-space access affects attainment, wellbeing, and exam equity.",
    evidence: ["High exam season usage demand.", "Students lacking quiet home study space."],
    actions: ["Propose 8-week pilot extension.", "Co-design safety plan for late exits."],
    comments: ["Evening buses must align with hours."]
  },
  {
    id: "district-housing-warmth",
    title: "Rental housing warmth and damp checks",
    location: "East of England",
    category: "Housing",
    source: "Local authority housing standards datasets",
    chamber: "District Housing Review Panel",
    officialPriority: 58,
    studentVotes: { high: 44, medium: 25, low: 11 },
    credibility: 81,
    whyItMatters: "Poor housing conditions affect health, concentration, and absenteeism.",
    evidence: ["Rising complaints on damp in low-cost rentals.", "Cold housing linked to reduced learning outcomes."],
    actions: ["Request mandatory inspection transparency report.", "Targeted support for student-heavy rental zones."],
    comments: ["Need clearer landlord accountability."]
  }
];

const state = {
  user: null,
  issues: structuredClone(SAMPLE_ISSUES),
  selectedIssueId: null,
  filters: { area: "All areas", category: "All categories", sort: "trending" }
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
  scorecards: document.querySelector("#scorecards"),
  priorityChart: document.querySelector("#priorityChart"),
  gapChart: document.querySelector("#gapChart"),
  briefBtn: document.querySelector("#briefBtn"),
  briefOutput: document.querySelector("#briefOutput"),
  homeView: document.querySelector("#homeView"),
  detailView: document.querySelector("#detailView"),
  backBtn: document.querySelector("#backBtn"),
  detailCard: document.querySelector("#detailCard")
};

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: state.user, issues: state.issues }));
}

function load() {
  const cached = localStorage.getItem(STORAGE_KEY);
  if (!cached) return;
  const parsed = JSON.parse(cached);
  state.user = parsed.user || null;
  state.issues = parsed.issues?.length ? parsed.issues : state.issues;
}

function totalVotes(issue) {
  return issue.studentVotes.high + issue.studentVotes.medium + issue.studentVotes.low;
}

function studentPriority(issue) {
  return issue.studentVotes.high * 1 + issue.studentVotes.medium * 0.5;
}

function priorityGap(issue) {
  return Math.round(studentPriority(issue) - issue.officialPriority);
}

function renderProfile() {
  if (!state.user) {
    els.profilePill.classList.add("hidden");
    return;
  }
  els.profilePill.classList.remove("hidden");
  els.profilePill.textContent = `${state.user.name} • ${state.user.level} • ${state.user.votesCast} votes cast`;
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
      <p class="meta">${issue.location} • ${issue.category} • Credibility ${issue.credibility}/100</p>
      <p class="meta">${issue.chamber}</p>
      <p>${issue.whyItMatters}</p>
      <p class="meta">Student high priority: ${issue.studentVotes.high} | Official priority score: ${issue.officialPriority}</p>
      <button data-open="${issue.id}">Open issue detail</button>
    `;
    els.issuesList.append(card);
  });
}

function scorecardData(data) {
  const totalStudentVotes = data.reduce((sum, i) => sum + totalVotes(i), 0);
  const top = [...data].sort((a, b) => b.studentVotes.high - a.studentVotes.high)[0];
  const trustIndicator = Math.max(35, Math.min(95, Math.round(data.reduce((s, i) => s + i.credibility, 0) / data.length)));
  const notAlone = top ? top.studentVotes.high : 0;
  return { totalStudentVotes, top: top?.title || "-", trustIndicator, notAlone };
}

function renderScorecards() {
  const data = filteredIssues();
  const stats = scorecardData(data);
  els.scorecards.innerHTML = `
    <div class="scorecard"><strong>${stats.totalStudentVotes}</strong><br />Total student votes</div>
    <div class="scorecard"><strong>${stats.trustIndicator}%</strong><br />Issue credibility average</div>
    <div class="scorecard"><strong>${stats.notAlone}</strong><br />You are not alone on top issue</div>
    <div class="scorecard"><strong>${stats.top}</strong><br />Most voted issue this week</div>
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
  const barW = Math.max(20, Math.floor((w - 50) / values.length) - 14);

  values.forEach((value, index) => {
    const x = 30 + index * (barW + 14);
    const barH = Math.floor(((h - 55) * value) / max);
    const y = h - 30 - barH;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, barW, barH);
    ctx.fillStyle = "#dbeafe";
    ctx.font = "12px sans-serif";
    ctx.fillText(String(value), x + 4, y - 6);
    ctx.fillText(labels[index], x, h - 10);
  });
}

function renderCharts() {
  const data = filteredIssues();
  const labels = data.map((_, index) => `I${index + 1}`);
  drawBars(els.priorityChart, labels, data.map((i) => i.studentVotes.high), "#38bdf8");
  drawBars(els.gapChart, labels, data.map((i) => Math.abs(priorityGap(i))), "#a78bfa");
}

function showHome() {
  els.homeView.classList.remove("hidden");
  els.detailView.classList.add("hidden");
}

function showDetail() {
  els.homeView.classList.add("hidden");
  els.detailView.classList.remove("hidden");
}

function renderDetail() {
  const issue = state.issues.find((i) => i.id === state.selectedIssueId) || state.issues[0];
  if (!issue) return;

  const evidenceItems = issue.evidence.map((e) => `<li>${e}</li>`).join("");
  const actionItems = issue.actions.map((a) => `<li>${a}</li>`).join("");
  const commentItems = issue.comments.map((c) => `<li>${c}</li>`).join("");

  els.detailCard.innerHTML = `
    <h3>${issue.title}</h3>
    <p class="meta">${issue.location} • ${issue.category} • ${issue.chamber}</p>
    <p><strong>Source:</strong> ${issue.source}</p>
    <p><strong>Why it matters:</strong> ${issue.whyItMatters}</p>

    <div class="detail-evidence">
      <h4>Evidence snapshot</h4>
      <ul>${evidenceItems}</ul>
    </div>

    <div class="detail-evidence">
      <h4>What students can do</h4>
      <ul>${actionItems}</ul>
    </div>

    <div class="detail-evidence">
      <h4>Youth discussion highlights</h4>
      <ul>${commentItems}</ul>
    </div>

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
  const topThree = [...data]
    .sort((a, b) => b.studentVotes.high - a.studentVotes.high)
    .slice(0, 3)
    .map((item, idx) => `${idx + 1}. ${item.title} (${item.studentVotes.high} high-priority votes)`)
    .join("\n");

  els.briefOutput.textContent = `Youth Mandate Brief\n-------------------\nTop priorities from student voting:\n${topThree}\n\nRecommendation for adult decision-makers:\n- Publish response timelines for these priorities.\n- Include two youth reps in next committee discussion.\n- Track action progress publicly every 30 days.`;
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
    const issueId = target.dataset.open;
    if (!issueId) return;
    state.selectedIssueId = issueId;
    renderDetail();
    showDetail();
  });

  els.backBtn.addEventListener("click", showHome);
  els.briefBtn.addEventListener("click", generateBrief);
}

function renderAll() {
  renderProfile();
  renderFilters();
  renderIssues();
  renderScorecards();
  renderCharts();
  renderDetail();
}

load();
attachEvents();
showHome();
renderAll();
