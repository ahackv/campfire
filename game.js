const scenes = [
  {
    signal: "flat replies",
    characterLine: "I'm fine. Just tired, I guess.",
    subtext: "Short message. Long pause before sending.",
    supportive: [
      "Thanks... today kind of steamrolled me.",
      "I said 'fine' because I didn't know how to explain it.",
    ],
    neutral: [
      "Maybe. I don't know.",
      "Yeah, maybe I'm just off today.",
    ],
    harmful: ["It's okay. Forget I said anything.", "Right. Never mind."],
  },
  {
    signal: "late-night spiral",
    characterLine: "It's whatever. Nothing I can't handle.",
    subtext: "Sent after 3 AM.",
    supportive: [
      "Could you stay for a little while? I don't want to be alone.",
      "I keep pretending it's under control, but it's not.",
    ],
    neutral: ["I'll probably be okay by morning.", "Maybe it'll pass."],
    harmful: ["Yeah. Shouldn't have texted.", "Sorry. I'll stop talking about it."],
  },
  {
    signal: "deflection",
    characterLine: "Don't worry about me. I'm used to it.",
    subtext: "Typing appears, disappears, appears again.",
    supportive: [
      "That actually hurt a lot more than I expected.",
      "Someone I trusted made me feel small.",
    ],
    neutral: ["It's not important.", "I don't know how to explain it."],
    harmful: ["You're right. I should just deal with it.", "Forget this."],
  },
  {
    signal: "running on empty",
    characterLine: "I'm okay. Just need sleep.",
    subtext: "Their status says awake for too long.",
    supportive: [
      "Sleep would help, but there's this constant pressure in my chest too.",
      "Could we make a tiny plan for tonight? I feel scattered.",
    ],
    neutral: ["Yeah, maybe sleep fixes it.", "I just need to shut my brain off."],
    harmful: ["Okay. I'll just disappear for a bit.", "Sorry for bothering you."],
  },
  {
    signal: "last chance",
    characterLine: "I'm fine, really. You don't need to worry.",
    subtext: "This is the first real conversation in weeks.",
    supportive: [
      "Thank you for not taking 'fine' at face value.",
      "I wasn't fine. I was scared to say it out loud.",
    ],
    neutral: ["Thanks for trying.", "Maybe we can talk another time."],
    harmful: ["I trusted the wrong person.", "It's okay. I won't bring this up again."],
  },
];

const quickPrompts = [
  "You don't have to pretend with me.",
  "Do you want to talk or just have company?",
  "I'm here. No pressure.",
  "You're overreacting.",
  "That sounds painful. Want to tell me more?",
  "Same lol anyway...",
];

const state = { round: 0, trust: 0, done: false };

const roundEl = document.getElementById("round");
const trustEl = document.getElementById("trust");
const signalEl = document.getElementById("signal");
const chatEl = document.getElementById("chat");
const quickEl = document.getElementById("quick");
const endingEl = document.getElementById("ending");
const composerEl = document.getElementById("composer");
const replyEl = document.getElementById("reply");

function addBubble(text, role, detail = "") {
  const bubble = document.createElement("article");
  bubble.className = `bubble ${role}`;
  bubble.innerHTML = `${text}${detail ? `<div class="hint">${detail}</div>` : ""}`;
  chatEl.appendChild(bubble);
  chatEl.scrollTop = chatEl.scrollHeight;
}

function updateHeader(signal = "hard to read") {
  roundEl.textContent = `Round: ${Math.min(state.round + 1, scenes.length)} / ${scenes.length}`;
  trustEl.textContent = `Connection: ${state.trust}`;
  signalEl.textContent = `Signal: ${signal}`;
}

function classifyReply(rawText) {
  const text = rawText.toLowerCase();

  const supportiveWords = [
    "here", "listen", "talk", "sorry", "care", "matter", "with you", "want", "help", "okay to", "no pressure",
    "you can", "tell me", "what happened", "how are", "stay", "company", "understand", "that sounds",
  ];
  const harmfulWords = [
    "dramatic", "overreact", "whatever", "annoying", "stop", "deal with it", "not my problem", "too sensitive",
    "toughen", "don't care", "shut up", "cry", "lazy", "get over", "fine then",
  ];
  const avoidantWords = ["anyway", "lol", "k", "cool", "same", "idc", "brb"];

  let score = 0;
  supportiveWords.forEach((word) => {
    if (text.includes(word)) score += 2;
  });
  harmfulWords.forEach((word) => {
    if (text.includes(word)) score -= 3;
  });
  avoidantWords.forEach((word) => {
    if (text.includes(word)) score -= 1;
  });

  if (text.includes("?")) score += 1;
  if (text.length < 3) score -= 1;

  if (score >= 2) return { kind: "supportive", delta: 2 };
  if (score <= -2) return { kind: "harmful", delta: -3 };
  return { kind: "neutral", delta: 0 };
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function respondToInput(input) {
  const scene = scenes[state.round];
  const read = classifyReply(input);

  state.trust += read.delta;

  if (read.kind === "supportive") {
    addBubble(`<strong>Character:</strong> ${pick(scene.supportive)}`, "char");
  } else if (read.kind === "harmful") {
    addBubble(`<strong>Character:</strong> ${pick(scene.harmful)}`, "char");
  } else {
    addBubble(`<strong>Character:</strong> ${pick(scene.neutral)}`, "char");
  }

  state.round += 1;
  renderScene();
}

function endGame() {
  state.done = true;
  composerEl.classList.add("hidden");
  quickEl.classList.add("hidden");
  endingEl.classList.remove("hidden");

  if (state.trust >= 6) {
    endingEl.innerHTML = `<strong>✨ Quiet Truth Ending</strong><p>You listened between the lines. They finally admit they weren't okay and ask for help directly.</p><p>You both make a simple plan for tonight and tomorrow.</p>`;
  } else if (state.trust >= 1) {
    endingEl.innerHTML = `<strong>🌙 Unfinished Ending</strong><p>Some moments landed, some didn't. They open up a little, but hold back the rest.</p><p>You leave the chat with the door still open.</p>`;
  } else {
    endingEl.innerHTML = `<strong>💔 Lost Signal Ending</strong><p>The words "I'm fine" stayed on the surface. They shut down before the truth came out.</p>`;
  }

  const restartBtn = document.createElement("button");
  restartBtn.textContent = "Play again";
  restartBtn.addEventListener("click", () => window.location.reload());
  endingEl.appendChild(restartBtn);
  updateHeader("locked");
}

function renderQuickPrompts() {
  quickEl.innerHTML = "";
  quickPrompts.forEach((prompt) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = prompt;
    b.addEventListener("click", () => {
      replyEl.value = prompt;
      replyEl.focus();
    });
    quickEl.appendChild(b);
  });
}

function renderScene() {
  if (state.round >= scenes.length) {
    endGame();
    return;
  }

  const scene = scenes[state.round];
  updateHeader(scene.signal);
  addBubble(`<strong>Character:</strong> ${scene.characterLine}`, "char", scene.subtext);
}

composerEl.addEventListener("submit", (event) => {
  event.preventDefault();
  if (state.done) return;

  const text = replyEl.value.trim();
  if (!text) return;

  addBubble(`<strong>You:</strong> ${text}`, "player");
  replyEl.value = "";
  setTimeout(() => respondToInput(text), 170);
});

addBubble(
  '<strong>System:</strong> Reply in your own words. There are no fixed options now — type anything.',
  "char"
);
renderQuickPrompts();
renderScene();
