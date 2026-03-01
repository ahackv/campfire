const MILESTONES = [25, 70, 140, 240, 360];

const convoBeats = [
  {
    signal: "normal comms",
    line: "nice pace. i'll keep gathering too.",
    subtext: "They send quickly, but no emoji like usual.",
    supportive: ["thanks. didn't sleep much, but i'm okay to continue."],
    neutral: ["yep, all good."],
    harmful: ["copy. focusing on work."],
  },
  {
    signal: "slight lag",
    line: "you can take main route, i don't mind.",
    subtext: "Response comes after a longer pause.",
    supportive: ["appreciate that. honestly my head is noisy today."],
    neutral: ["all good either way."],
    harmful: ["sure. doesn't matter to me."],
  },
  {
    signal: "thin replies",
    line: "if i go quiet a bit that's normal.",
    subtext: "They start typing, stop, then send this.",
    supportive: ["thanks for checking in. i needed that."],
    neutral: ["yeah just focused."],
    harmful: ["understood."],
  },
  {
    signal: "off rhythm",
    line: "all fine here. just pushing depth.",
    subtext: "Message is shorter than before.",
    supportive: ["not fully fine, if i'm honest."],
    neutral: ["i'll be okay."],
    harmful: ["forget it."],
  },
  {
    signal: "faint",
    line: "after this run, can we talk for a minute?",
    subtext: "No typo corrections. Very direct.",
    supportive: ["thanks for noticing. i was trying to hide it."],
    neutral: ["maybe later."],
    harmful: ["never mind then."],
  },
];

const state = {
  you: { salvage: 0, click: 1, auto: 0, depth: 1, bank: 0 },
  rival: { salvage: 0, depth: 1, auto: 1, bank: 0 },
  trust: 0,
  beat: 0,
  locked: false,
};

const el = {
  youSalvage: document.getElementById("youSalvage"),
  youDepth: document.getElementById("youDepth"),
  youClick: document.getElementById("youClick"),
  youAuto: document.getElementById("youAuto"),
  rivalSalvage: document.getElementById("rivalSalvage"),
  rivalDepth: document.getElementById("rivalDepth"),
  rivalRate: document.getElementById("rivalRate"),
  phase: document.getElementById("phase"),
  chat: document.getElementById("chat"),
  composer: document.getElementById("composer"),
  reply: document.getElementById("reply"),
  result: document.getElementById("result"),
  harvestBtn: document.getElementById("harvestBtn"),
  drillBtn: document.getElementById("drillBtn"),
  autoBtn: document.getElementById("autoBtn"),
  depthBtn: document.getElementById("depthBtn"),
};

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function depthMult(depth) {
  return 1 + (depth - 1) * 0.12;
}

function drillCost() {
  return Math.floor(15 * 1.55 ** (state.you.click - 1));
}

function autoCost() {
  return Math.floor(45 * 1.75 ** state.you.auto);
}

function depthCost() {
  return Math.floor(120 * 2 ** (state.you.depth - 1));
}

function addBubble(text, role, detail = "") {
  const b = document.createElement("article");
  b.className = `bubble ${role}`;
  b.innerHTML = `${text}${detail ? `<div class="hint">${detail}</div>` : ""}`;
  el.chat.appendChild(b);
  el.chat.scrollTop = el.chat.scrollHeight;
}

function classifyReply(input) {
  const text = input.toLowerCase();
  const supportive = ["you okay", "you ok", "here", "listen", "talk", "no pressure", "with you", "want to", "how are", "take a break", "i'm here", "you matter"];
  const harmful = ["dramatic", "overreact", "not my problem", "shut up", "stop texting", "deal with it", "whatever", "toughen", "don't care"];
  const avoidant = ["lol", "k", "anyway", "same", "brb", "idc", "cool"];

  let score = 0;
  supportive.forEach((w) => {
    if (text.includes(w)) score += 2;
  });
  harmful.forEach((w) => {
    if (text.includes(w)) score -= 3;
  });
  avoidant.forEach((w) => {
    if (text.includes(w)) score -= 1;
  });
  if (text.includes("?")) score += 1;
  if (text.length < 3) score -= 1;

  if (score >= 2) return { tone: "supportive", delta: 2 };
  if (score <= -2) return { tone: "harmful", delta: -3 };
  return { tone: "neutral", delta: 0 };
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function maybeTriggerBeat() {
  if (state.beat >= convoBeats.length) return;
  const threshold = MILESTONES[state.beat];
  if (state.you.salvage < threshold && state.rival.salvage < threshold) return;

  const beat = convoBeats[state.beat];
  el.phase.textContent = `Signal: ${beat.signal}`;
  addBubble(`<strong>Teammate:</strong> ${beat.line}`, "char", beat.subtext);
  state.beat += 1;
}

function maybeEnd() {
  if (state.locked) return;
  if (state.you.salvage < 500 && state.rival.salvage < 500) return;

  state.locked = true;
  el.composer.classList.add("hidden");
  el.harvestBtn.disabled = true;
  el.drillBtn.disabled = true;
  el.autoBtn.disabled = true;
  el.depthBtn.disabled = true;

  const winner = state.you.salvage >= state.rival.salvage ? "You" : "Teammate";

  el.result.classList.remove("hidden");
  if (state.trust >= 6) {
    el.result.innerHTML = `<strong>Co-op Ending</strong><div class="hint">${winner} won the salvage race, but your teammate finally says they were not fine and asks for real support after the run.</div>`;
  } else if (state.trust >= 1) {
    el.result.innerHTML = `<strong>Split Signal Ending</strong><div class="hint">${winner} won the run. You caught part of what was going on, but most of it stayed unsaid.</div>`;
  } else {
    el.result.innerHTML = `<strong>Surface-Only Ending</strong><div class="hint">${winner} won. The mission ended before trust did. Their "I'm fine" never opened up.</div>`;
  }
}

function updateHud() {
  el.youSalvage.textContent = `Salvage: ${state.you.salvage}`;
  el.youDepth.textContent = `Depth: ${state.you.depth}`;
  el.youClick.textContent = `Per click: ${Math.floor(state.you.click * depthMult(state.you.depth))}`;
  el.youAuto.textContent = `Per sec: ${Math.floor(state.you.auto * depthMult(state.you.depth))}`;

  el.rivalSalvage.textContent = `Salvage: ${state.rival.salvage}`;
  el.rivalDepth.textContent = `Depth: ${state.rival.depth}`;
  el.rivalRate.textContent = `Per sec: ${Math.floor(state.rival.auto * depthMult(state.rival.depth))}`;

  el.drillBtn.textContent = `Drill +1/click (${drillCost()})`;
  el.autoBtn.textContent = `Collector +1/sec (${autoCost()})`;
  el.depthBtn.textContent = `Dive deeper (${depthCost()})`;
}

el.harvestBtn.addEventListener("click", () => {
  if (state.locked) return;
  state.you.salvage += Math.floor(state.you.click * depthMult(state.you.depth));
  maybeTriggerBeat();
  maybeEnd();
  updateHud();
});

el.drillBtn.addEventListener("click", () => {
  const cost = drillCost();
  if (state.locked || state.you.salvage < cost) return;
  state.you.salvage -= cost;
  state.you.click += 1;
  updateHud();
});

el.autoBtn.addEventListener("click", () => {
  const cost = autoCost();
  if (state.locked || state.you.salvage < cost) return;
  state.you.salvage -= cost;
  state.you.auto += 1;
  updateHud();
});

el.depthBtn.addEventListener("click", () => {
  const cost = depthCost();
  if (state.locked || state.you.salvage < cost) return;
  state.you.salvage -= cost;
  state.you.depth += 1;
  updateHud();
});

el.composer.addEventListener("submit", (event) => {
  event.preventDefault();
  if (state.locked) return;

  const text = el.reply.value.trim();
  if (!text) return;
  el.reply.value = "";

  addBubble(`<strong>You:</strong> ${text}`, "player");

  if (state.beat === 0) {
    addBubble("<strong>Teammate:</strong> got it.", "char");
    return;
  }

  const beat = convoBeats[clamp(state.beat - 1, 0, convoBeats.length - 1)];
  const read = classifyReply(text);
  state.trust += read.delta;

  setTimeout(() => {
    if (read.tone === "supportive") {
      addBubble(`<strong>Teammate:</strong> ${pick(beat.supportive)}`, "char");
    } else if (read.tone === "harmful") {
      addBubble(`<strong>Teammate:</strong> ${pick(beat.harmful)}`, "char");
    } else {
      addBubble(`<strong>Teammate:</strong> ${pick(beat.neutral)}`, "char");
    }
  }, 120);
});

let last = performance.now();
function tick(now) {
  const dt = (now - last) / 1000;
  last = now;

  if (!state.locked) {
    state.you.bank += state.you.auto * depthMult(state.you.depth) * dt;
    const youGain = Math.floor(state.you.bank);
    if (youGain > 0) {
      state.you.salvage += youGain;
      state.you.bank -= youGain;
    }

    state.rival.bank += state.rival.auto * depthMult(state.rival.depth) * dt;
    const rGain = Math.floor(state.rival.bank);
    if (rGain > 0) {
      state.rival.salvage += rGain;
      state.rival.bank -= rGain;
    }

    if (Math.random() < 0.004) {
      state.rival.depth += 1;
    }
    if (Math.random() < 0.006) {
      state.rival.auto += 1;
    }

    maybeTriggerBeat();
    maybeEnd();
    updateHud();
  }

  requestAnimationFrame(tick);
}

addBubble(
  "<strong>System:</strong> New co-op session started. First to 500 salvage wins the run. Keep comms open.",
  "char"
);
addBubble("<strong>Teammate:</strong> ready when you are.", "char");
updateHud();
requestAnimationFrame(tick);
