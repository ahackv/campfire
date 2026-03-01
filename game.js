const GOAL = 1337;
const MILESTONES = [25, 60, 110, 180, 260, 360, 490, 640, 820, 1030, 1240];
const FUNNY_NUMBERS = new Map([
  [67, "six seven"], [69, "nice"], [111, "triple one"], [222, "double double two"],
  [420, "four twenty"], [666, "evil laughter"], [777, "jackpot"], [911, "nine one one"],
  [1234, "counting speedrun"], [1337, "leet"],
]);

const convoBeats = [
  { signal: "vibing", line: "yo pace is clean. you always min-max this.", subtext: "Teammate sounds playful.", supportive:["lol thanks. also... rough day, not gonna lie."], neutral:["haha yeah"], harmful:["k" ]},
  { signal: "off", line: "tiny thing, brain is noisy today but i can play.", subtext: "Slightly slower response.", supportive:["appreciate you checking. i'm trying to keep it together."], neutral:["it's fine."], harmful:["nvm." ]},
  { signal: "strained", line: "if i go quiet i'm not mad, just overloaded.", subtext: "A lot more direct now.", supportive:["thanks. i did need someone to notice that."], neutral:["yeah."], harmful:["copy." ]},
  { signal: "blunt", line: "real talk, i'm not okay but i still wanted to hang.", subtext: "No jokes this time.", supportive:["thanks for asking. that helped a lot."], neutral:["i'll survive."], harmful:["forget it." ]},
  { signal: "open", line: "after run can we talk? i need support, actually.", subtext: "Clear ask.", supportive:["thank you. i was scared to say that."], neutral:["maybe later."], harmful:["wrong person to ask, i guess." ]},
  { signal: "heart", line: "also your clicks are illegal, teach me your ways.", subtext: "Small humor returns.", supportive:["deal. and thanks for being here."], neutral:["lol"], harmful:["ok." ]},
];

const boosts = [
  { name: "Loot Piñata", secs: 10, mode: "all", mult: 2.0, msg: "🎉 Loot Piñata! All salvage x2 for 10s." },
  { name: "Turbo Finger", secs: 6, mode: "click", mult: 3.2, msg: "🖱️ Turbo Finger! Click salvage x3.2 for 6s." },
  { name: "AFK Goblin", secs: 14, mode: "auto", mult: 1.9, msg: "🤖 AFK Goblin hired! Auto salvage x1.9 for 14s." },
];

const jokes = [
  "Teammate: if this run was a movie it'd be 'Fast & Curious'.",
  "System: A wild crab appears, judges your build, leaves.",
  "Teammate: my keyboard is 40% crumbs, 60% determination.",
  "System: Ocean patch notes: fish now have opinions.",
];

const state = {
  you: { salvage: 0, click: 1, auto: 0, depth: 1, bank: 0 },
  rival: { salvage: 0, depth: 1, auto: 1, bank: 0 },
  trust: 0, beat: 0, locked: false,
  combo: 0, comboTimer: 0, critChance: 0.08,
  boost: null, lastFunnyTriggered: -1,
};

const el = {
  youSalvage: document.getElementById("youSalvage"), youDepth: document.getElementById("youDepth"),
  youClick: document.getElementById("youClick"), youAuto: document.getElementById("youAuto"),
  rivalSalvage: document.getElementById("rivalSalvage"), rivalDepth: document.getElementById("rivalDepth"), rivalRate: document.getElementById("rivalRate"),
  phase: document.getElementById("phase"), chat: document.getElementById("chat"), composer: document.getElementById("composer"),
  reply: document.getElementById("reply"), result: document.getElementById("result"),
  harvestBtn: document.getElementById("harvestBtn"), drillBtn: document.getElementById("drillBtn"), autoBtn: document.getElementById("autoBtn"), depthBtn: document.getElementById("depthBtn"),
  combo: document.getElementById("combo"), boost: document.getElementById("boost"), avatarText: document.getElementById("avatarText"),
  face: document.getElementById("face"),
};

let audioCtx = null;
function ensureAudio() { if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch { audioCtx = null; } } }
function beep(freq = 660, len = 0.08, type = "square", volume = 0.04) {
  ensureAudio(); if (!audioCtx) return;
  const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
  o.type = type; o.frequency.value = freq; g.gain.value = volume;
  o.connect(g); g.connect(audioCtx.destination); o.start(); o.stop(audioCtx.currentTime + len);
}
function playMeme(label) {
  [523,659,784,659,523].forEach((n,i)=>setTimeout(()=>beep(n,0.07,"triangle",0.05), i*80));
  if ("speechSynthesis" in window) {
    const u = new SpeechSynthesisUtterance(label); u.rate = 1.03; u.pitch = 1.12;
    window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
  }
}

// Pixel face (hand-coded)
const fctx = el.face.getContext("2d");
let mouthOpen = 0;
function px(x, y, c) { fctx.fillStyle = c; fctx.fillRect(x, y, 1, 1); }
function drawFace() {
  fctx.clearRect(0,0,32,32);
  for (let y=2;y<30;y++) for (let x=2;x<30;x++) px(x,y,"#2b2243");
  for (let y=6;y<26;y++) for (let x=6;x<26;x++) px(x,y,"#f5d8c3");
  // hair
  for (let y=4;y<12;y++) for (let x=6;x<26;x++) if (y<8 || x<10 || x>21) px(x,y,"#3c2b2a");
  // eyes
  px(11,14,"#1a1425"); px(12,14,"#1a1425"); px(19,14,"#1a1425"); px(20,14,"#1a1425");
  // blush
  px(9,18,"#dc9ab0"); px(22,18,"#dc9ab0");
  // mouth
  const mcol = "#7a2f3d";
  if (mouthOpen > 0.3) { for (let x=13;x<19;x++) px(x,22,mcol); for (let x=14;x<18;x++) px(x,23,mcol); }
  else { for (let x=13;x<19;x++) px(x,22,mcol); }
  // border
  for (let i=0;i<32;i++) { px(i,0,"#8a72b8"); px(i,31,"#8a72b8"); px(0,i,"#8a72b8"); px(31,i,"#8a72b8"); }
}
function speakFace(text) {
  el.avatarText.textContent = `Teammate cam: ${text}`;
  let i = 0;
  const interval = setInterval(() => {
    mouthOpen = mouthOpen > 0.2 ? 0 : 1;
    drawFace();
    i += 1;
    if (i > Math.max(8, Math.floor(text.length / 2))) {
      clearInterval(interval);
      mouthOpen = 0;
      drawFace();
    }
  }, 90);
}

function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
const depthMult = (d)=> 1 + (d-1)*0.14;
const drillCost = ()=> Math.floor(15 * 1.52 ** (state.you.click - 1));
const autoCost = ()=> Math.floor(45 * 1.68 ** state.you.auto);
const depthCost = ()=> Math.floor(120 * 1.85 ** (state.you.depth - 1));

function addBubble(text, role, detail="", animate=false) {
  const b = document.createElement("article"); b.className = `bubble ${role}`;
  b.innerHTML = `${text}${detail ? `<div class="hint">${detail}</div>` : ""}`;
  el.chat.appendChild(b); el.chat.scrollTop = el.chat.scrollHeight;
  if (animate && role === "char") speakFace(text.replace(/<[^>]+>/g, ""));
}

function classifyReply(input) {
  const t = input.toLowerCase();
  const good = ["you okay","you ok","i'm here","listen","talk","how are","i care","that sounds hard","want to vent","take break","you matter"];
  const bad = ["dramatic","overreact","shut up","deal with it","whatever","not my problem","don't care","get over it"];
  let s = 0; good.forEach((w)=>{ if(t.includes(w)) s += 2; }); bad.forEach((w)=>{ if(t.includes(w)) s -= 3; });
  if (t.includes("?")) s += 1; if (t.length <= 2) s -= 1;
  if (s >= 2) return { tone:"supportive", delta:2 };
  if (s <= -2) return { tone:"harmful", delta:-3 };
  return { tone:"neutral", delta:0 };
}
const pick = (arr)=> arr[Math.floor(Math.random()*arr.length)];

function maybeTriggerBeat() {
  if (state.beat >= convoBeats.length) return;
  const threshold = MILESTONES[state.beat];
  if (state.you.salvage < threshold && state.rival.salvage < threshold) return;
  const beat = convoBeats[state.beat];
  el.phase.textContent = `Signal: ${beat.signal}`;
  addBubble(`<strong>Teammate:</strong> ${beat.line}`, "char", beat.subtext, true);
  state.beat += 1;
}

function boostMultiplierFor(mode) {
  if (!state.boost) return 1;
  if (state.boost.mode === "all" || state.boost.mode === mode) return state.boost.mult;
  return 1;
}

function triggerBoost() {
  if (state.locked || state.boost) return;
  state.boost = { ...pick(boosts), remaining: pick(boosts).secs };
  state.boost.remaining = state.boost.secs;
  addBubble(`<strong>System:</strong> ${state.boost.msg}`, "char", "Temporary chaos engaged.", true);
  beep(900,0.08,"sawtooth",0.05);
}

function maybeMemeNumber() {
  for (const [n,label] of FUNNY_NUMBERS.entries()) {
    if (state.you.salvage === n && state.lastFunnyTriggered !== n) {
      state.lastFunnyTriggered = n;
      addBubble(`<strong>System:</strong> Meme checkpoint ${n}!`, "char", `🔊 ${label}`, true);
      playMeme(label);
      break;
    }
  }
}

function maybeRandomJoke(dt) {
  if (state.locked) return;
  if (Math.random() < 0.0009 * dt * 60) addBubble(`<strong>${pick(jokes)}</strong>`, "char", "comic relief", true);
}

function maybeEnd() {
  if (state.locked) return;
  if (state.you.salvage < GOAL && state.rival.salvage < GOAL) return;
  state.locked = true;
  [el.harvestBtn, el.drillBtn, el.autoBtn, el.depthBtn].forEach((b)=>b.disabled = true);
  el.composer.classList.add("hidden");

  const winner = state.you.salvage >= state.rival.salvage ? "You" : "Teammate";
  el.result.classList.remove("hidden");
  if (state.trust >= 8) {
    el.result.innerHTML = `<strong>Legendary Good Ending</strong><div class="hint">${winner} won the ${GOAL} salvage marathon. Your teammate fully opened up and felt genuinely supported.</div>`;
  } else if (state.trust >= 2) {
    el.result.innerHTML = `<strong>Bittersweet Ending</strong><div class="hint">${winner} won. You got part of the story, but not all of it.</div>`;
  } else {
    el.result.innerHTML = `<strong>Oops Ending</strong><div class="hint">${winner} won the grind, but trust lost the race.</div>`;
  }
}

function updateHud() {
  el.youSalvage.textContent = `Salvage: ${state.you.salvage}`;
  el.youDepth.textContent = `Depth: ${state.you.depth}`;
  el.youClick.textContent = `Per click: ${Math.floor(state.you.click * depthMult(state.you.depth) * boostMultiplierFor("click") * boostMultiplierFor("all"))}`;
  el.youAuto.textContent = `Per sec: ${Math.floor(state.you.auto * depthMult(state.you.depth) * boostMultiplierFor("auto") * boostMultiplierFor("all"))}`;
  el.rivalSalvage.textContent = `Salvage: ${state.rival.salvage}`;
  el.rivalDepth.textContent = `Depth: ${state.rival.depth}`;
  el.rivalRate.textContent = `Per sec: ${Math.floor(state.rival.auto * depthMult(state.rival.depth))}`;
  el.drillBtn.textContent = `Drill +1/click (${drillCost()})`; el.autoBtn.textContent = `Collector +1/sec (${autoCost()})`; el.depthBtn.textContent = `Dive deeper (${depthCost()})`;
  el.combo.textContent = `Combo: x${(1 + state.combo * 0.05).toFixed(2)}`;
  el.boost.textContent = state.boost ? `Boost: ${state.boost.name} (${state.boost.remaining.toFixed(1)}s)` : "Boost: none";
}

el.harvestBtn.addEventListener("click", ()=>{
  if (state.locked) return; ensureAudio();
  state.combo = clamp(state.combo + 1, 0, 35); state.comboTimer = 2.0;
  const comboMult = 1 + state.combo * 0.05; const crit = Math.random() < state.critChance; const critMult = crit ? 2 : 1;
  let gain = state.you.click * depthMult(state.you.depth) * comboMult * critMult;
  gain *= boostMultiplierFor("click") * boostMultiplierFor("all"); gain = Math.floor(gain);
  state.you.salvage += gain;
  if (crit) { addBubble(`<strong>System:</strong> CRIT! +${gain}`, "char", "bonk", true); beep(980,0.06,"square",0.06); }
  else beep(620,0.03,"square",0.03);
  maybeMemeNumber(); maybeTriggerBeat(); maybeEnd(); updateHud();
});

el.drillBtn.addEventListener("click", ()=>{ const c = drillCost(); if (state.locked || state.you.salvage < c) return; state.you.salvage -= c; state.you.click += 1; state.critChance = clamp(state.critChance + .01,.08,.28); addBubble("<strong>System:</strong> Drill upgraded.", "char", "click power + crit chance", true); beep(740,.09,"triangle",.05); updateHud(); });
el.autoBtn.addEventListener("click", ()=>{ const c = autoCost(); if (state.locked || state.you.salvage < c) return; state.you.salvage -= c; state.you.auto += 1; addBubble("<strong>System:</strong> Collector online.", "char", "passive income buff", true); beep(540,.09,"triangle",.05); updateHud(); });
el.depthBtn.addEventListener("click", ()=>{ const c = depthCost(); if (state.locked || state.you.salvage < c) return; state.you.salvage -= c; state.you.depth += 1; addBubble(`<strong>System:</strong> Depth ${state.you.depth}.`, "char", "everything scales harder", true); beep(460,.1,"sine",.05); updateHud(); });

el.composer.addEventListener("submit", (event)=>{
  event.preventDefault(); if (state.locked) return;
  const text = el.reply.value.trim(); if (!text) return; el.reply.value = "";
  addBubble(`<strong>You:</strong> ${text}`, "player");
  const beat = convoBeats[clamp(state.beat - 1, 0, convoBeats.length - 1)];
  const read = classifyReply(text); state.trust += read.delta;
  setTimeout(()=>{
    const msg = read.tone === "supportive" ? pick(beat.supportive) : read.tone === "harmful" ? pick(beat.harmful) : pick(beat.neutral);
    addBubble(`<strong>Teammate:</strong> ${msg}`, "char", "", true);
  }, 150);
});

let last = performance.now(); let boostRollTimer = 0;
function tick(now) {
  const dt = (now - last) / 1000; last = now;
  if (!state.locked) {
    state.comboTimer -= dt; if (state.comboTimer <= 0) state.combo = Math.max(0, state.combo - 1);
    if (state.boost) { state.boost.remaining -= dt; if (state.boost.remaining <= 0) { addBubble("<strong>System:</strong> Boost expired.","char","",true); state.boost = null; } }
    boostRollTimer += dt; if (boostRollTimer >= 9) { boostRollTimer = 0; if (Math.random() < .55) triggerBoost(); }

    const yourRate = state.you.auto * depthMult(state.you.depth) * boostMultiplierFor("auto") * boostMultiplierFor("all");
    state.you.bank += yourRate * dt; const yg = Math.floor(state.you.bank); if (yg > 0) { state.you.salvage += yg; state.you.bank -= yg; maybeMemeNumber(); }

    state.rival.bank += state.rival.auto * depthMult(state.rival.depth) * dt; const rg = Math.floor(state.rival.bank);
    if (rg > 0) { state.rival.salvage += rg; state.rival.bank -= rg; }
    if (Math.random() < .006) state.rival.depth += 1; if (Math.random() < .009) state.rival.auto += 1;

    maybeRandomJoke(dt); maybeTriggerBeat(); maybeEnd(); updateHud();
  }
  requestAnimationFrame(tick);
}

drawFace();
addBubble(`<strong>System:</strong> Marathon mode active. First to ${GOAL} salvage wins.`, "char", "More memes unlocked.", true);
addBubble("<strong>Teammate:</strong> ready. let's make this chaotic and wholesome.", "char", "", true);
updateHud(); requestAnimationFrame(tick);
