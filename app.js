const STORAGE_KEY = "campus-voice-mvp";

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
  ]
};

const els = {
  authForm: document.querySelector("#authForm"),
  nameInput: document.querySelector("#nameInput"),
  levelInput: document.querySelector("#levelInput"),
  profilePill: document.querySelector("#profilePill"),
  issuesList: document.querySelector("#issuesList"),
  issueCount: document.querySelector("#issueCount"),
  activeIssue: document.querySelector("#activeIssue"),
  issueForm: document.querySelector("#issueForm"),
  issueTitle: document.querySelector("#issueTitle"),
  issueLocation: document.querySelector("#issueLocation"),
  issueWhy: document.querySelector("#issueWhy"),
  emailBtn: document.querySelector("#emailBtn"),
  petitionBtn: document.querySelector("#petitionBtn"),
  actionOutput: document.querySelector("#actionOutput")
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

  els.issuesList.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const issueId = target.dataset.open;
    if (!issueId) return;
    state.selectedIssueId = issueId;
    renderActiveIssue();
  });

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
renderAll();
