const STORAGE_KEY = "campus-voice-mvp";

const initialScenarios = [
  {
    title: "River Cam boat smoke pollution",
    description:
      "In Cambridge, smoke from boats near the River Cam makes nearby air smell like gas. A student email complaint was ignored.",
    choices: [
      {
        label: "Ignore it and move on",
        effects: { youthVoice: -10, trust: -8, wellbeing: -6, environment: -8, misinformation: 4 },
        explanation: "Inaction keeps pollution unchanged and lowers belief that youth voices matter."
      },
      {
        label: "Post an angry complaint online only",
        effects: { youthVoice: 2, trust: -2, wellbeing: -2, environment: -1, misinformation: 8 },
        explanation: "The issue gets attention, but without evidence it is easy to dismiss and confusion grows."
      },
      {
        label: "Gather student evidence and photos",
        effects: { youthVoice: 10, trust: 8, wellbeing: 4, environment: 6, misinformation: -6 },
        explanation: "Evidence creates credibility and helps officials take the report seriously."
      },
      {
        label: "Start a petition and contact council with proof",
        effects: { youthVoice: 12, trust: 10, wellbeing: 6, environment: 8, misinformation: -5 },
        explanation: "Collective action with proof increases pressure and chance of real policy response."
      }
    ]
  },
  {
    title: "Bus fares increase for students",
    description: "Bus fares rise and students struggle to reach classes, activities, and part-time jobs.",
    choices: [
      {
        label: "Do nothing",
        effects: { youthVoice: -7, trust: -6, wellbeing: -8, environment: -2, misinformation: 2 },
        explanation: "Travel barriers remain and fewer students feel represented."
      },
      {
        label: "Spread a rumour that all buses are being cancelled",
        effects: { youthVoice: -4, trust: -12, wellbeing: -4, environment: -1, misinformation: 14 },
        explanation: "False claims create panic and damage trust in civic solutions."
      },
      {
        label: "Run a student poll and submit fare impact data",
        effects: { youthVoice: 9, trust: 8, wellbeing: 7, environment: 3, misinformation: -4 },
        explanation: "Data-backed feedback helps leaders evaluate fairer pricing options."
      }
    ]
  },
  {
    title: "Local park is neglected",
    description: "A local park feels unsafe and run-down, so fewer young people use it.",
    choices: [
      {
        label: "Complain privately but do not organize",
        effects: { youthVoice: 1, trust: -3, wellbeing: -3, environment: -4, misinformation: 2 },
        explanation: "Frustration is visible, but impact is limited without coordinated action."
      },
      {
        label: "Organize a youth clean-up day and request council support",
        effects: { youthVoice: 10, trust: 7, wellbeing: 9, environment: 8, misinformation: -3 },
        explanation: "Shared effort shows leadership and builds momentum for maintenance funding."
      },
      {
        label: "Blame a random group without evidence",
        effects: { youthVoice: -3, trust: -10, wellbeing: -6, environment: -2, misinformation: 12 },
        explanation: "Scapegoating divides the community and distracts from practical fixes."
      }
    ]
  },
  {
    title: "Students want longer library hours",
    description: "Exam season is near and students ask for later opening times in the local library.",
    choices: [
      {
        label: "Assume adults will never listen",
        effects: { youthVoice: -8, trust: -7, wellbeing: -5, environment: 0, misinformation: 3 },
        explanation: "Giving up early reinforces the feeling that youth participation is pointless."
      },
      {
        label: "Meet librarians, gather signatures, and propose a trial",
        effects: { youthVoice: 11, trust: 9, wellbeing: 10, environment: 0, misinformation: -2 },
        explanation: "Constructive proposals and measurable trials are easier for institutions to approve."
      },
      {
        label: "Post misleading claims about library staff",
        effects: { youthVoice: -2, trust: -11, wellbeing: -5, environment: 0, misinformation: 13 },
        explanation: "Misinformation harms cooperation and slows useful policy changes."
      }
    ]
  }
];

const state = {
  user: null,
  selectedIssueId: null,
  issues: [
    {
      id: crypto.randomUUID(),
      title: "River Cam boat smoke pollution",
      location: "Cambridge, River Cam",
      why: "Boats release smoke and gas smells. Nearby residents cannot open windows, and students feel ignored after reporting it.",
      votes: { urgent: 12, monitor: 2 },
      comments: [
        "I cycle by the river daily and the smell is real near evening.",
        "Could schools and colleges co-sign one evidence-based complaint?"
      ],
      createdBy: "Demo student"
    },
    {
      id: crypto.randomUUID(),
      title: "Safer bike parking near sixth form",
      location: "Cambridge city centre",
      why: "Stolen bikes reduce attendance and independence for students commuting on low budgets.",
      votes: { urgent: 7, monitor: 4 },
      comments: ["Need CCTV and shelter.", "Let's map theft hotspots."],
      createdBy: "Aron"
    }
  ],
  game: {
    playing: false,
    round: 0,
    scenarios: initialScenarios,
    stats: {
      youthVoice: 50,
      trust: 50,
      wellbeing: 50,
      environment: 50,
      misinformation: 50
    },
    history: []
  }
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
  emailBtn: document.querySelector("#emailBtn"),
  petitionBtn: document.querySelector("#petitionBtn"),
  actionOutput: document.querySelector("#actionOutput"),
  roundLabel: document.querySelector("#roundLabel"),
  statsPanel: document.querySelector("#statsPanel"),
  scenarioTitle: document.querySelector("#scenarioTitle"),
  scenarioDescription: document.querySelector("#scenarioDescription"),
  choicesList: document.querySelector("#choicesList"),
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
  if (state.user.points >= 30 && !state.user.badges.includes("Community Spark")) {
    state.user.badges.push("Community Spark");
  }
}

function clampStat(value) {
  return Math.min(100, Math.max(0, value));
}

function renderProfile() {
  if (!state.user) {
    els.profilePill.classList.add("hidden");
    return;
  }
  els.profilePill.classList.remove("hidden");
  els.profilePill.textContent = `${state.user.name} • ${state.user.level} • ⭐ ${state.user.points} pts • 🔥 ${state.user.streak} streak • 🏅 ${state.user.badges.join(", ") || "No badges yet"}`;
}

function renderIssues() {
  els.issueCount.textContent = `${state.issues.length} issue(s)`;
  els.issuesList.innerHTML = "";
  state.issues.forEach((issue) => {
    const card = document.createElement("article");
    card.className = "issue-card";
    card.innerHTML = `
      <h3>${issue.title}</h3>
      <p class="issue-meta">📍 ${issue.location} • by ${issue.createdBy}</p>
      <p>${issue.why}</p>
      <p class="issue-meta">Votes: 🚨 ${issue.votes.urgent} | 👀 ${issue.votes.monitor}</p>
      <button data-open="${issue.id}">Open discussion</button>
    `;
    els.issuesList.append(card);
  });
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
    <p class="issue-meta">${issue.location}</p>
    <p>${issue.why}</p>
    <div class="stack" style="grid-template-columns:1fr 1fr; display:grid; margin: .6rem 0;">
      <button data-vote="urgent">Vote urgent (🚨 ${issue.votes.urgent})</button>
      <button data-vote="monitor">Vote monitor (👀 ${issue.votes.monitor})</button>
    </div>
    <div class="comment-list">${comments || "<p>No comments yet.</p>"}</div>
    <form id="commentForm" class="stack">
      <input id="commentInput" placeholder="Share your idea for action..." required />
      <button type="submit">Post comment</button>
    </form>
  `;

  els.activeIssue.querySelectorAll("button[data-vote]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.vote;
      issue.votes[type] += 1;
      addPoints(5);
      save();
      renderAll();
    });
  });

  const commentForm = els.activeIssue.querySelector("#commentForm");
  commentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = els.activeIssue.querySelector("#commentInput").value.trim();
    if (!value) return;
    issue.comments.unshift(value);
    addPoints(8);
    save();
    renderAll();
  });
}

function renderGameStats() {
  const entries = [
    ["Youth Voice", "youthVoice"],
    ["Public Trust", "trust"],
    ["Wellbeing", "wellbeing"],
    ["Environment", "environment"],
    ["Misinformation Risk", "misinformation"]
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

  if (state.game.round >= state.game.scenarios.length) {
    const stats = state.game.stats;
    const score = stats.youthVoice + stats.trust + stats.wellbeing + stats.environment - stats.misinformation;
    const ending = score >= 180
      ? "Strong civic ending: your town responds because students organized, used facts, and stayed involved."
      : score >= 120
        ? "Mixed ending: some progress happened, but better coordination and evidence could increase impact."
        : "Low-impact ending: misinformation and disengagement weakened change. Participation strategy matters.";

    els.roundLabel.textContent = "Final reflection";
    els.scenarioTitle.textContent = "Game complete";
    els.scenarioDescription.textContent = "Democracy is a chain of everyday choices, not a one-time vote.";
    els.choicesList.innerHTML = '<button id="restartGameBtn" type="button">Play again</button>';
    els.gameFeedback.textContent = `${ending}\n\nKey lesson: organised action + accurate information gives youth voices more power.`;
    document.querySelector("#restartGameBtn").addEventListener("click", () => startGame());
    return;
  }

  const scenario = state.game.scenarios[state.game.round];
  els.roundLabel.textContent = `Round ${state.game.round + 1} of ${state.game.scenarios.length}`;
  els.scenarioTitle.textContent = scenario.title;
  els.scenarioDescription.textContent = scenario.description;

  els.choicesList.innerHTML = "";
  scenario.choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.className = "choice-btn";
    button.type = "button";
    button.textContent = `${index + 1}. ${choice.label}`;
    button.addEventListener("click", () => chooseGameOption(choice));
    els.choicesList.append(button);
  });
}

function chooseGameOption(choice) {
  Object.keys(state.game.stats).forEach((key) => {
    state.game.stats[key] = clampStat(state.game.stats[key] + (choice.effects[key] || 0));
  });

  state.game.history.push({ round: state.game.round, choice: choice.label });
  els.gameFeedback.textContent = choice.explanation;
  state.game.round += 1;
  addPoints(6);
  renderGameRound();
}

function startGame() {
  state.game.playing = true;
  state.game.round = 0;
  state.game.history = [];
  state.game.stats = {
    youthVoice: 50,
    trust: 50,
    wellbeing: 50,
    environment: 50,
    misinformation: 50
  };
  els.gameFeedback.textContent = "Make a choice to see what changes.";
  showGameView();
  renderGameRound();
}

function attachGlobalEvents() {
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

  els.startGameBtn.addEventListener("click", startGame);
  els.exitGameBtn.addEventListener("click", showHomeView);

  els.issuesList.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const issueId = target.dataset.open;
    if (!issueId) return;
    state.selectedIssueId = issueId;
    renderActiveIssue();
    showDiscussionView();
  });

  els.backToHomeBtn.addEventListener("click", showHomeView);

  els.issueForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const newIssue = {
      id: crypto.randomUUID(),
      title: els.issueTitle.value.trim(),
      location: els.issueLocation.value.trim(),
      why: els.issueWhy.value.trim(),
      votes: { urgent: 0, monitor: 0 },
      comments: [],
      createdBy: state.user?.name || "Guest"
    };
    state.issues.unshift(newIssue);
    state.selectedIssueId = newIssue.id;
    addPoints(12);
    save();
    els.issueForm.reset();
    renderAll();
    showDiscussionView();
  });

  els.emailBtn.addEventListener("click", () => {
    const top = [...state.issues].sort((a, b) => b.votes.urgent - a.votes.urgent)[0];
    els.actionOutput.textContent = `Subject: Student request for action on ${top.title}\n\nDear Council Team,\n\nWe are students using Campus Voice. ${top.votes.urgent} students marked this issue urgent: ${top.why}\n\nPlease confirm next steps and timeline for investigation.\n\nKind regards,\nCampus Voice Student Community`;
  });

  els.petitionBtn.addEventListener("click", () => {
    const topThree = [...state.issues]
      .sort((a, b) => b.votes.urgent - a.votes.urgent)
      .slice(0, 3)
      .map((i, idx) => `${idx + 1}. ${i.title} (${i.votes.urgent} urgent votes)`)
      .join("\n");
    els.actionOutput.textContent = `Petition Summary\n----------------\nTop student concerns this week:\n${topThree}\n\nRequested action: host a youth-council listening session and publish public responses within 30 days.`;
  });
}

function renderAll() {
  renderProfile();
  renderIssues();
  renderActiveIssue();
}

load();
attachGlobalEvents();
showHomeView();
renderAll();
