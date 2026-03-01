const GOAL = 777;
const MILESTONES = [20, 55, 100, 170, 260, 380, 520, 680];
const FUNNY_NUMBERS = new Map([
  [67, "six seven"],
  [69, "nice"],
  [420, "four twenty"],
  [666, "spicy"],
  [777, "jackpot"],
]);

const convoBeats = [
  {
    signal: "normal",
    line: "good run so far — i can keep pace.",
    subtext: "Still upbeat, but shorter than usual.",
    supportive: ["thanks. i'm a little stressed but okay."],
    neutral: ["yeah all good."],
    harmful: ["sure."],
  },
  {
    signal: "uneasy",
    line: "if i go quiet, i'm just low energy today.",
    subtext: "Typing indicator blinks twice before sending.",
    supportive: ["i appreciate that. today has been heavy."],
    neutral: ["i'll manage."],
    harmful: ["copy."],
  },
  {
    signal: "strained",
    line: "i said i'm fine. just keep farming.",
    subtext: "Message feels defensive.",
    supportive: ["okay, honest version: i'm not really fine."],
    neutral: ["it's complicated."],
    harmful: ["forget it."],
  },
  {
    signal: "cracking",
    line: "sorry if i'm weird right now.",
    subtext: "No punctuation, rushed send.",
    supportive: ["thanks for checking. i needed someone to notice."],
    neutral: ["yeah."],
    harmful: ["never mind."],
  },
  {
    signal: "direct",
    line: "after this, can we actually talk? i mean it.",
    subtext: "Very clear ask for support.",
    supportive: ["thank you. i was trying to hide that i wasn't okay."],
    neutral: ["maybe."],
    harmful: ["i picked the wrong teammate."],
  },
];

const boosts = [
  { name: "Lucky Cache", mult: 2, secs: 8, msg: "💰 Lucky Cache! Salvage gain x2 for 8s." },
  { name: "Hyper Drill", mult: 3, secs: 5, msg: "⚡ Hyper Drill online! Click gain x3 for 5s." },
  { name: "Quiet Focus", mult: 1.6, secs: 12, msg: "🎯 Focus mode! Auto gain x1.6 for 12s." },
];

const state = {
  you: { salvage: 0, click: 1, auto: 0, depth: 1, bank: 0 },
  rival: { salvage: 0, depth: 1, auto: 1, bank: 0 },
  trust: 0,
  beat: 0,
  locked: false,
  combo: 0,
  comboTimer: 0,
  critChance: 0.08,
  boost: null,
  lastFunnyTriggered: -1,
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
  combo: document.getElementById("combo"),
  boost: document.getElementById("boost"),
};

let audioCtx = null;
function ensureAudio() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      audioCtx = null;
    }
  }
}

function beep(freq = 660, len = 0.1, type = "square", volume = 0.04) {
  ensureAudio();
  if (!audioCtx) return;

  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = volume;
  o.connect(g);
  g.connect(audioCtx.destination);
  o.start();
  o.stop(audioCtx.currentTime + len);
}

function playMeme(label) {
  const notes = [523, 659, 784, 659, 523];
  notes.forEach((n, i) => {
    setTimeout(() => beep(n, 0.07, "triangle", 0.05), i * 80);
  });

  if ("speechSynthesis" in window) {
    const utter = new SpeechSynthesisUtterance(label);
    utter.rate = 1.05;
    utter.pitch = 1.1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function depthMult(depth) {
  return 1 + (depth - 1) * 0.14;
}

function drillCost() {
  return Math.floor(15 * 1.55 ** (state.you.click - 1));
}

function autoCost() {
  return Math.floor(45 * 1.72 ** state.you.auto);
}

function depthCost() {
  return Math.floor(120 * 1.9 ** (state.you.depth - 1));
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
  const supportive = [
    "you okay", "you ok", "i'm here", "listen", "talk", "no pressure", "with you", "how are you", "take a break",
    "you matter", "want to vent", "i care", "that sounds hard",
  ];
  const harmful = [
    "dramatic", "overreact", "not my problem", "shut up", "stop texting", "deal with it", "whatever", "toughen up",
    "don't care", "you're fine", "just get over it",
  ];

  let score = 0;
  supportive.forEach((w) => {
    if (text.includes(w)) score += 2;
  });
  harmful.forEach((w) => {
    if (text.includes(w)) score -= 3;
  });

  if (text.includes("?")) score += 1;
  if (text.length <= 2) score -= 1;

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

function triggerBoost() {
  if (state.locked || state.boost) return;
  const boost = pick(boosts);
  state.boost = { ...boost, remaining: boost.secs };
  addBubble(`<strong>System:</strong> ${boost.msg}`, "char");
  beep(880, 0.08, "sawtooth", 0.05);
}

function maybeMemeNumber() {
  for (const [n, label] of FUNNY_NUMBERS.entries()) {
    if (state.you.salvage === n && state.lastFunnyTriggered !== n) {
      state.lastFunnyTriggered = n;
      addBubble(`<strong>System:</strong> Meme checkpoint hit: ${n}.`, "char", `🔊 Playing meme: ${label}`);
      playMeme(label);
      break;
    }
  }
}

function maybeEnd() {
  if (state.locked) return;
  if (state.you.salvage < GOAL && state.rival.salvage < GOAL) return;

  state.locked = true;
  el.composer.classList.add("hidden");
  el.harvestBtn.disabled = true;
  el.drillBtn.disabled = true;
  el.autoBtn.disabled = true;
  el.depthBtn.disabled = true;

  const winner = state.you.salvage >= state.rival.salvage ? "You" : "Teammate";

  el.result.classList.remove("hidden");
  if (state.trust >= 6) {
    el.result.innerHTML = `<strong>Co-op Win Ending</strong><div class="hint">${winner} won the salvage race, and your teammate clearly admits they were not fine. You stay after the run and help them decompress.</div>`;
  } else if (state.trust >= 1) {
    el.result.innerHTML = `<strong>Mixed Ending</strong><div class="hint">${winner} won. You noticed some signs, but the full conversation never happened.</div>`;
  } else {
    el.result.innerHTML = `<strong>Bad Ending</strong><div class="hint">${winner} won the run, but emotionally lost the teammate. They leave with "it's fine" and log off.</div>`;
  }
}

function boostMultiplierFor(mode) {
  if (!state.boost) return 1;
  if (state.boost.name === "Lucky Cache") return mode === "all" ? 2 : 1;
  if (state.boost.name === "Hyper Drill") return mode === "click" ? 3 : 1;
  if (state.boost.name === "Quiet Focus") return mode === "auto" ? 1.6 : 1;
  return 1;
}

function updateHud() {
  el.youSalvage.textContent = `Salvage: ${state.you.salvage}`;
  el.youDepth.textContent = `Depth: ${state.you.depth}`;
  el.youClick.textContent = `Per click: ${Math.floor(state.you.click * depthMult(state.you.depth) * boostMultiplierFor("click") * boostMultiplierFor("all"))}`;
  el.youAuto.textContent = `Per sec: ${Math.floor(state.you.auto * depthMult(state.you.depth) * boostMultiplierFor("auto") * boostMultiplierFor("all"))}`;

  el.rivalSalvage.textContent = `Salvage: ${state.rival.salvage}`;
  el.rivalDepth.textContent = `Depth: ${state.rival.depth}`;
  el.rivalRate.textContent = `Per sec: ${Math.floor(state.rival.auto * depthMult(state.rival.depth))}`;

  el.drillBtn.textContent = `Drill +1/click (${drillCost()})`;
  el.autoBtn.textContent = `Collector +1/sec (${autoCost()})`;
  el.depthBtn.textContent = `Dive deeper (${depthCost()})`;

  if (el.combo) {
    el.combo.textContent = `Combo: x${(1 + state.combo * 0.05).toFixed(2)}`;
  }
  if (el.boost) {
    el.boost.textContent = state.boost ? `Boost: ${state.boost.name} (${state.boost.remaining.toFixed(1)}s)` : "Boost: none";
  }
}

el.harvestBtn.addEventListener("click", () => {
  if (state.locked) return;
  ensureAudio();

  state.combo = clamp(state.combo + 1, 0, 25);
  state.comboTimer = 1.7;

  const comboMult = 1 + state.combo * 0.05;
  const crit = Math.random() < state.critChance;
  const critMult = crit ? 2 : 1;

  let gain = state.you.click * depthMult(state.you.depth) * comboMult * critMult;
  gain *= boostMultiplierFor("click") * boostMultiplierFor("all");
  gain = Math.floor(gain);

  state.you.salvage += gain;

  if (crit) {
    addBubble(`<strong>System:</strong> CRIT! +${gain} salvage`, "char");
    beep(980, 0.06, "square", 0.06);
  } else {
    beep(620, 0.03, "square", 0.03);
  }

  maybeMemeNumber();
  maybeTriggerBeat();
  maybeEnd();
  updateHud();
});

el.drillBtn.addEventListener("click", () => {
  const cost = drillCost();
  if (state.locked || state.you.salvage < cost) return;
  state.you.salvage -= cost;
  state.you.click += 1;
  state.critChance = clamp(state.critChance + 0.01, 0.08, 0.25);
  addBubble("<strong>System:</strong> Drill upgraded. Crit chance increased.", "char");
  beep(740, 0.09, "triangle", 0.05);
  updateHud();
});

el.autoBtn.addEventListener("click", () => {
  const cost = autoCost();
  if (state.locked || state.you.salvage < cost) return;
  state.you.salvage -= cost;
  state.you.auto += 1;
  addBubble("<strong>System:</strong> Auto collector online.", "char");
  beep(540, 0.09, "triangle", 0.05);
  updateHud();
});

el.depthBtn.addEventListener("click", () => {
  const cost = depthCost();
  if (state.locked || state.you.salvage < cost) return;
  state.you.salvage -= cost;
  state.you.depth += 1;
  addBubble(`<strong>System:</strong> Depth increased to ${state.you.depth}.`, "char");
  beep(460, 0.1, "sine", 0.05);
  updateHud();
});

el.composer.addEventListener("submit", (event) => {
  event.preventDefault();
  if (state.locked) return;

  const text = el.reply.value.trim();
  if (!text) return;
  el.reply.value = "";

  addBubble(`<strong>You:</strong> ${text}`, "player");

  const beatIndex = clamp(state.beat - 1, 0, convoBeats.length - 1);
  const beat = convoBeats[beatIndex];
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
let boostRollTimer = 0;
function tick(now) {
  const dt = (now - last) / 1000;
  last = now;

  if (!state.locked) {
    state.comboTimer -= dt;
    if (state.comboTimer <= 0) state.combo = Math.max(0, state.combo - 1);

    if (state.boost) {
      state.boost.remaining -= dt;
      if (state.boost.remaining <= 0) {
        addBubble("<strong>System:</strong> Boost expired.", "char");
        state.boost = null;
      }
    }

    boostRollTimer += dt;
    if (boostRollTimer >= 9) {
      boostRollTimer = 0;
      if (Math.random() < 0.45) triggerBoost();
    }

    const yourAutoRate = state.you.auto * depthMult(state.you.depth) * boostMultiplierFor("auto") * boostMultiplierFor("all");
    state.you.bank += yourAutoRate * dt;
    const youGain = Math.floor(state.you.bank);
    if (youGain > 0) {
      state.you.salvage += youGain;
      state.you.bank -= youGain;
      maybeMemeNumber();
    }

    state.rival.bank += state.rival.auto * depthMult(state.rival.depth) * dt;
    const rGain = Math.floor(state.rival.bank);
    if (rGain > 0) {
      state.rival.salvage += rGain;
      state.rival.bank -= rGain;
    }

    if (Math.random() < 0.0045) state.rival.depth += 1;
    if (Math.random() < 0.007) state.rival.auto += 1;

    maybeTriggerBeat();
    maybeEnd();
    updateHud();
  }

  requestAnimationFrame(tick);
}

addBubble(
  `<strong>System:</strong> Co-op race started. First to ${GOAL} salvage wins. Watch your teammate's tone — it's not subtle anymore.`,
  "char"
);
addBubble("<strong>Teammate:</strong> ready. let's grind.", "char");
updateHud();
requestAnimationFrame(tick);
