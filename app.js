const STORAGE_KEY = "campus-voice-mvp";

const debatedIssues = [
  {
    id: crypto.randomUUID(),
    title: "River Cam boat emissions regulation",
    chamber: "Cambridge City Council Environment Committee",
    location: "Cambridge, River Cam",
    why: "Boat smoke is affecting air quality and residents report gas-like smell up to about a mile away.",
    votes: { support: 18, oppose: 3, amend: 7 },
    comments: [
      "Add emission checks for tourist boats.",
      "Students can gather air-quality logs near colleges."
    ],
    status: "Debate this month"
  },
  {
    id: crypto.randomUUID(),
    title: "National debate: reduced bus fares for under-21s",
    chamber: "UK Parliament Transport Committee",
    location: "England",
    why: "Rising fares reduce attendance and access to opportunities for students.",
    votes: { support: 16, oppose: 4, amend: 6 },
    comments: ["Need a means-tested cap.", "Pilot in university towns first."],
    status: "Evidence gathering stage"
  },
  {
    id: crypto.randomUUID(),
    title: "Youth access to extended library hours",
    chamber: "County Education & Skills Board",
    location: "Cambridgeshire",
    why: "Exam-season pressure is high and many students lack quiet study spaces at home.",
    votes: { support: 12, oppose: 2, amend: 8 },
    comments: ["Trial 2 evenings a week.", "Coordinate volunteers for safe late exit."],
    status: "Public consultation open"
  }
];

const gameScenarios = [
  {
    title: "River Cam pollution",
    description: "A complaint was ignored. What do students do next?",
    choices: [
      {
        label: "Do nothing",
        effects: { youthVoice: -8, trust: -7, wellbeing: -6, environment: -7, misinformation: 3 },
        explanation: "Inaction keeps pollution and frustration high."
      },
      {
        label: "Gather evidence + photos with students",
        effects: { youthVoice: 10, trust: 8, wellbeing: 4, environment: 7, misinformation: -5 },
        explanation: "Evidence increases credibility and policy traction."
      },
      {
        label: "Spread an unverified rumour",
        effects: { youthVoice: -2, trust: -11, wellbeing: -3, environment: -2, misinformation: 13 },
        explanation: "False claims damage trust and derail progress."
      }
    ]
  },
  {
    title: "Bus fares debate",
    description: "Students are struggling to travel to classes.",
    choices: [
      {
        label: "Run a youth poll and submit impact data",
        effects: { youthVoice: 9, trust: 7, wellbeing: 8, environment: 3, misinformation: -4 },
        explanation: "Data-backed participation strengthens the case."
      },
      {
        label: "Only post angry comments online",
        effects: { youthVoice: 1, trust: -3, wellbeing: -2, environment: 0, misinformation: 6 },
        explanation: "Awareness grows, but decision-makers need evidence."
      }
    ]
  },
  {
    title: "Local safety budget",
    description: "Council is reallocating funds that affect student safety routes.",
    choices: [
      {
        label: "Attend hearing with a student coalition",
        effects: { youthVoice: 10, trust: 9, wellbeing: 7, environment: 0, misinformation: -3 },
        explanation: "Collective engagement increases influence with adults in power."
      },
      {
        label: "Leave it to others",
        effects: { youthVoice: -7, trust: -6, wellbeing: -5, environment: 0, misinformation: 2 },
        explanation: "Not participating still has consequences."
      }
    ]
  },
  {
    title: "Library hours decision",
    description: "A final vote is coming on extended study hours.",
    choices: [
      {
        label: "Submit compromise plan + petition",
        effects: { youthVoice: 11, trust: 8, wellbeing: 10, environment: 0, misinformation: -2 },
        explanation: "Constructive solutions are easier to adopt quickly."
      },
      {
        label: "Call the process fake without proof",
        effects: { youthVoice: -3, trust: -10, wellbeing: -4, environment: 0, misinformation: 10 },
        explanation: "Distrust without facts weakens real advocacy."
      }
    ]
  }
];

const state = {
  user: null,
  selectedIssueId: null,
  issues: debatedIssues,
  game: {
    round: 0,
    stats: { youthVoice: 50, trust: 50, wellbeing: 50, environment: 50, misinformation: 50 },
    choiceIndex: 0
  },
  participationTrend: [22, 31, 44, 58, 67]
};

const els = {
  authForm: document.querySelector("#authForm"),
  nameInput: document.querySelector("#nameInput"),
  levelInput: document.querySelector("#levelInput"),
  profilePill: document.querySelector("#profilePill"),
  homeView: document.querySelector("#homeView"),
  discussionView: document.querySelector("#discussionView"),
  gameView: document.querySelector("#gameView"),
  backToHomeBtn: document.querySelector("#backToHomeBtn"),
  startGameBtn: document.querySelector("#startGameBtn"),
  exitGameBtn: document.querySelector("#exitGameBtn"),
  issuesList: document.querySelector("#issuesList"),
  issueCount: document.querySelector("#issueCount"),
  activeIssue: document.querySelector("#activeIssue"),
  issueForm: document.querySelector("#issueForm"),
  issueTitle: document.querySelector("#issueTitle"),
  issueLocation: document.querySelector("#issueLocation"),
  issueWhy: document.querySelector("#issueWhy"),
  briefBtn: document.querySelector("#briefBtn"),
  actionOutput: document.querySelector("#actionOutput"),
  supportChart: document.querySelector("#supportChart"),
  trendChart: document.querySelector("#trendChart"),
  roundLabel: document.querySelector("#roundLabel"),
  statsPanel: document.querySelector("#statsPanel"),
  scenarioTitle: document.querySelector("#scenarioTitle"),
  scenarioDescription: document.querySelector("#scenarioDescription"),
  choiceSelect: document.querySelector("#choiceSelect"),
  confirmChoiceBtn: document.querySelector("#confirmChoiceBtn"),
  gameFeedback: document.querySelector("#gameFeedback")
};

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: state.user, issues: state.issues }));
}

function load() {
  const cached = localStorage.getItem(STORAGE_KEY);
  if (!cached) return;
  const parsed = JSON.parse(cached);
  state.user = parsed.user;
  state.issues = parsed.issues?.length ? parsed.issues : state.issues;
}

function addPoints(points) {
  if (!state.user) return;
  state.user.points += points;
  state.user.streak = Math.max(1, state.user.streak + 1);
  if (state.user.points >= 40 && !state.user.badges.includes("Policy Co-Author")) {
    state.user.badges.push("Policy Co-Author");
  }
}

function clampStat(value) {
  return Math.max(0, Math.min(100, value));
}

function renderProfile() {
  if (!state.user) {
    els.profilePill.classList.add("hidden");
    return;
  }
  els.profilePill.classList.remove("hidden");
  els.profilePill.textContent = `${state.user.name} • ${state.user.level} • ⭐ ${state.user.points} • 🔥 ${state.user.streak} • 🏅 ${state.user.badges.join(", ") || "No badge yet"}`;
}

function renderIssues() {
  els.issueCount.textContent = `${state.issues.length} debates`;
  els.issuesList.innerHTML = "";
  state.issues.forEach((issue) => {
    const card = document.createElement("article");
    card.className = "issue-card";
    card.innerHTML = `
      <h3>${issue.title}</h3>
      <p class="issue-meta">${issue.chamber} • ${issue.status}</p>
      <p class="issue-meta">📍 ${issue.location}</p>
      <p>${issue.why}</p>
      <p class="issue-meta">Poll: ✅ ${issue.votes.support} | ❌ ${issue.votes.oppose} | ✏️ ${issue.votes.amend}</p>
      <button data-open="${issue.id}">Open debate room</button>
    `;
    els.issuesList.append(card);
  });
}

function drawBarChart(canvas, labels, values, color) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#0b1220";
  ctx.fillRect(0, 0, w, h);

  const max = Math.max(...values, 1);
  const barW = Math.floor((w - 40) / values.length) - 16;
  values.forEach((value, i) => {
    const x = 30 + i * (barW + 16);
    const barH = Math.floor(((h - 60) * value) / max);
    const y = h - 30 - barH;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, barW, barH);
    ctx.fillStyle = "#dbeafe";
    ctx.font = "12px sans-serif";
    ctx.fillText(String(value), x + 4, y - 6);
    ctx.fillText(labels[i], x, h - 12);
  });
}

function renderCharts() {
  const supportValues = state.issues.map((i) => i.votes.support);
  const supportLabels = state.issues.map((_, i) => `D${i + 1}`);
  drawBarChart(els.supportChart, supportLabels, supportValues, "#38bdf8");
  drawBarChart(els.trendChart, ["W1", "W2", "W3", "W4", "W5"], state.participationTrend, "#a78bfa");
}

function showHomeView() {
  els.homeView.classList.remove("hidden");
  els.discussionView.classList.add("hidden");
  els.gameView.classList.add("hidden");
}

function showDiscussionView() {
  els.homeView.classList.add("hidden");
  els.discussionView.classList.remove("hidden");
  els.gameView.classList.add("hidden");
}

function showGameView() {
  els.homeView.classList.add("hidden");
  els.discussionView.classList.add("hidden");
  els.gameView.classList.remove("hidden");
}

function renderActiveIssue() {
  const issue = state.issues.find((i) => i.id === state.selectedIssueId) || state.issues[0];
  if (!issue) return;
  state.selectedIssueId = issue.id;
  const comments = issue.comments.map((comment) => `<div class="comment">💬 ${comment}</div>`).join("");

  els.activeIssue.innerHTML = `
    <h3>${issue.title}</h3>
    <p class="issue-meta">${issue.chamber} • ${issue.status}</p>
    <p>${issue.why}</p>
    <form id="voteForm" class="stack">
      <label>Cast one vote
        <select id="voteType">
          <option value="support">Support</option>
          <option value="oppose">Oppose</option>
          <option value="amend">Support with amendments</option>
        </select>
      </label>
      <button type="submit">Submit vote</button>
    </form>
    <div class="comment-list">${comments}</div>
    <form id="commentForm" class="stack">
      <input id="commentInput" placeholder="Add constructive comment" required />
      <button type="submit">Post comment</button>
    </form>
  `;

  els.activeIssue.querySelector("#voteForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const vote = els.activeIssue.querySelector("#voteType").value;
    issue.votes[vote] += 1;
    addPoints(6);
    save();
    renderAll();
    showDiscussionView();
  });

  els.activeIssue.querySelector("#commentForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const value = els.activeIssue.querySelector("#commentInput").value.trim();
    if (!value) return;
    issue.comments.unshift(value);
    addPoints(7);
    save();
    renderAll();
    showDiscussionView();
  });
}

function renderGameStats() {
  const entries = [
    ["Youth Voice", "youthVoice"],
    ["Public Trust", "trust"],
    ["Wellbeing", "wellbeing"],
    ["Environment", "environment"],
    ["Misinformation", "misinformation"]
  ];
  els.statsPanel.innerHTML = entries
    .map(([label, key]) => {
      const value = state.game.stats[key];
      return `<div class="stat-box"><div class="stat-row"><span>${label}</span><strong>${value}</strong></div><div class="stat-bar"><div class="stat-fill" style="width:${value}%"></div></div></div>`;
    })
    .join("");
}

function renderGameRound() {
  renderGameStats();
  if (state.game.round >= gameScenarios.length) {
    const s = state.game.stats;
    const score = s.youthVoice + s.trust + s.wellbeing + s.environment - s.misinformation;
    const outcome = score > 170
      ? "Winning ending: students and adults co-produced policy change."
      : score > 120
        ? "Middle ending: some wins, but stronger evidence and coalition work are needed."
        : "Weak ending: low trust and misinformation blocked outcomes.";

    els.roundLabel.textContent = "Final outcome";
    els.scenarioTitle.textContent = "Democracy is practical, not abstract.";
    els.scenarioDescription.textContent = "One ignored email can become action when students organize together.";
    els.choiceSelect.innerHTML = "<option>Replay to improve your ending</option>";
    els.confirmChoiceBtn.textContent = "Play again";
    els.gameFeedback.textContent = `${outcome}\n\nUnique pitch idea: Youth Mandate Brief merges student votes + evidence into a decision-ready summary adults can act on.`;
    return;
  }

  const scenario = gameScenarios[state.game.round];
  els.roundLabel.textContent = `Round ${state.game.round + 1} of ${gameScenarios.length}`;
  els.scenarioTitle.textContent = scenario.title;
  els.scenarioDescription.textContent = scenario.description;
  els.confirmChoiceBtn.textContent = "Confirm choice";
  els.choiceSelect.innerHTML = scenario.choices.map((choice, index) => `<option value="${index}">${choice.label}</option>`).join("");
}

function handleGameChoice() {
  if (state.game.round >= gameScenarios.length) {
    startGame();
    return;
  }
  const scenario = gameScenarios[state.game.round];
  const selected = Number(els.choiceSelect.value || 0);
  const choice = scenario.choices[selected];
  Object.keys(state.game.stats).forEach((key) => {
    state.game.stats[key] = clampStat(state.game.stats[key] + (choice.effects[key] || 0));
  });
  els.gameFeedback.textContent = choice.explanation;
  state.game.round += 1;
  addPoints(5);
  renderGameRound();
}

function startGame() {
  state.game.round = 0;
  state.game.stats = { youthVoice: 50, trust: 50, wellbeing: 50, environment: 50, misinformation: 50 };
  els.gameFeedback.textContent = "Make a choice to see consequences.";
  showGameView();
  renderGameRound();
}

function generateBrief() {
  const top = [...state.issues].sort((a, b) => b.votes.support - a.votes.support)[0];
  const participation = state.participationTrend[state.participationTrend.length - 1];
  els.actionOutput.textContent = `Youth Mandate Brief\n-------------------\nTop debated item: ${top.title}\nBody handling it: ${top.chamber}\nStudent support: ${top.votes.support}\nParticipation trend: ${participation}%\n\nRecommended action:\n1) Schedule a youth-adult hearing within 14 days.\n2) Publish evidence response timeline.\n3) Pilot one measurable policy change this term.`;
}

function attachEvents() {
  els.authForm.addEventListener("submit", (event) => {
    event.preventDefault();
    state.user = {
      name: els.nameInput.value.trim(),
      level: els.levelInput.value,
      points: 0,
      streak: 0,
      badges: []
    };
    addPoints(10);
    save();
    renderAll();
  });

  els.issuesList.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.dataset.open) return;
    state.selectedIssueId = target.dataset.open;
    renderActiveIssue();
    showDiscussionView();
  });

  els.backToHomeBtn.addEventListener("click", showHomeView);
  els.startGameBtn.addEventListener("click", startGame);
  els.exitGameBtn.addEventListener("click", showHomeView);
  els.confirmChoiceBtn.addEventListener("click", handleGameChoice);
  els.briefBtn.addEventListener("click", generateBrief);

  els.issueForm.addEventListener("submit", (event) => {
    event.preventDefault();
    state.issues.unshift({
      id: crypto.randomUUID(),
      title: els.issueTitle.value.trim(),
      chamber: "Pending youth-policy review",
      location: els.issueLocation.value.trim(),
      why: els.issueWhy.value.trim(),
      votes: { support: 0, oppose: 0, amend: 0 },
      comments: ["Awaiting moderation for debate cycle."],
      status: "Submitted"
    });
    els.issueForm.reset();
    addPoints(8);
    save();
    renderAll();
  });
}

function renderAll() {
  renderProfile();
  renderIssues();
  renderActiveIssue();
  renderCharts();
}

load();
attachEvents();
showHomeView();
renderAll();
