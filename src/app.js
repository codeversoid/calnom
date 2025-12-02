import * as THREE from "three";
import idTXT from "./lang/id.js";
import enTXT from "./lang/en.js";

(function () {
  const DROP_PARTIALS = [
    "aria-hidden on an element because its descendant retained focus",
    "googleads.g.doubleclick.net/pagead/viewthroughconversion",
    "www.youtube.com/pagead/viewthroughconversion",
    "No 'Access-Control-Allow-Origin' header is present",
  ];

  function shouldDrop(msg) {
    try {
      const s = (msg || "").toString();
      return DROP_PARTIALS.some((p) => s.includes(p));
    } catch {
      return false;
    }
  }

  const _warn = console.warn,
    _error = console.error;
  console.warn = function (...args) {
    if (args.some(shouldDrop)) return;
    _warn.apply(console, args);
  };
  console.error = function (...args) {
    if (args.some(shouldDrop)) return;
    _error.apply(console, args);
  };
})();

const TXT = { id: idTXT, en: enTXT };

const AMB_URL =
  "https://cdn.pixabay.com/download/audio/2022/01/09/audio_7b83b170f4.mp3?filename=chilling-waves-ambient-chill-out-music-for-relaxation-13880.mp3";

let LANG = (localStorage.getItem("calm:lang") || navigator.language || "id")
  .toLowerCase()
  .startsWith("id")
  ? "id"
  : "en";

let transport = {
  playing: false,
  mediaClock: 0,
  lastTs: 0,
  mode: "video",
  raf: null,
};

function transportTick() {
  if (!transport.playing) return;
  const now = performance.now();
  if (transport.lastTs) {
    transport.mediaClock += (now - transport.lastTs) / 1000;
  }
  transport.lastTs = now;
  transport.raf = requestAnimationFrame(transportTick);
}

function transportPlay() {
  if (transport.playing) return;
  transport.playing = true;
  transport.lastTs = performance.now();
  syncActiveMediumToClock(true);
  cancelAnimationFrame(transport.raf);
  transport.raf = requestAnimationFrame(transportTick);
}

function transportPause() {
  if (!transport.playing) return;
  transport.playing = false;
  transport.lastTs = 0;
  cancelAnimationFrame(transport.raf);
  pauseBothMedia();
}

function transportHardStop({ resetClock = true } = {}) {
  transport.playing = false;
  transport.lastTs = 0;
  if (transport.raf) cancelAnimationFrame(transport.raf);
  transport.raf = null;

  pauseBothMedia();
  if (resetClock) {
    transport.mediaClock = 0;
  }
}

function pauseBothMedia() {
  try {
    yt.contentWindow &&
      yt.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: "pauseVideo" }),
        "*"
      );
  } catch {}
  amb.pause();
  audioPlay.textContent = "▶";
}

function seekVideoTo(sec) {
  try {
    yt.contentWindow &&
      yt.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: "seekTo", args: [sec, true] }),
        "*"
      );
  } catch {}
}

function playVideo() {
  try {
    yt.contentWindow &&
      yt.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: "playVideo" }),
        "*"
      );
  } catch {}
}

function syncActiveMediumToClock(shouldPlay) {
  if (transport.mode === "audio") {
    if (isFinite(amb.duration) && amb.duration > 0) {
      amb.currentTime = transport.mediaClock % amb.duration;
    } else {
      amb.currentTime = transport.mediaClock;
    }
    if (shouldPlay) {
      amb.play().catch(() => {});
      audioPlay.textContent = "⏸";
    }
  } else {
    seekVideoTo(transport.mediaClock);
    if (shouldPlay) playVideo();
  }
}

const $ = (q) => document.querySelector(q);

const $$ = (q) => Array.from(document.querySelectorAll(q));
const onEl = (el, type, handler, opts) => {
  if (el) el.addEventListener(type, handler, opts);
};
const onId = (id, type, handler, opts) =>
  onEl(document.getElementById(id), type, handler, opts);

const levelEl = $("#level"),
  muteBtn = $("#mute");
const slides = Array.from(document.querySelectorAll(".slide"));
const veil = $("#veil"),
  overlay = $("#overlay"),
  summary = $("#summary");
const grat = $("#grat"),
  gratCTA = $("#gratCTA");
const toast = $("#toast"),
  toastMsg = $("#toastMsg");
const prevBtn = $("#prev"),
  nextBtn = $("#next");
const dots = ["#d0", "#d1", "#d2", "#d3", "#d4", "#d5"].map((s) => $(s));
const phase = $("#phase"),
  pacer = $("#pacer");
const yt = $("#yt"),
  poster = $("#poster"),
  amb = $("#amb");
const audioOverlay = $("#audioOverlay"),
  audioPlay = $("#audioPlay"),
  seek = $("#seek"),
  aTime = $("#aTime");
const toggleModeBtn = $("#toggleMode"),
  fsBtn = $("#fs");
const startBtns = [
  "#start0",
  "#start1",
  "#start2",
  "#start3",
  "#start4",
  "#start5",
].map((s) => $(s));
const rings = ["#ring0", "#ring1", "#ring2", "#ring3", "#ring4", "#ring5"].map(
  (s) => $(s)
);
const timers = ["#time0", "#time1", "#time2", "#time3", "#time4", "#time5"].map(
  (s) => $(s)
);
const labels = [
  "#start0label",
  "#start1label",
  "#start2label",
  "#start3label",
  "#start4label",
  "#start5label",
].map((s) => $(s));

const DUR = {
  0: { 1: 120, 2: 240, 3: 360, 4: 360 },
  1: { 1: 120, 2: 150, 3: 180, 4: 180 },
  2: { 1: 150, 2: 180, 3: 180, 4: 210 },
  3: { 1: 120, 2: 120, 3: 150, 4: 150 },
  4: { 1: 60, 2: 60, 3: 90, 4: 90 },
};
const PAJ = { quick: 120, full: 720 };
let currentPajDur = PAJ.quick;
const THEMES = {
  1: {
    primary: "#93c5fd",
    strong: "#60a5fa",
    accent: "#a7f3d0",
    ring: "#60a5fa",
  },
  2: {
    primary: "#7dd3fc",
    strong: "#38bdf8",
    accent: "#86efac",
    ring: "#38bdf8",
  },
  3: {
    primary: "#5eead4",
    strong: "#2dd4bf",
    accent: "#a7f3d0",
    ring: "#2dd4bf",
  },
  4: {
    primary: "#a5b4fc",
    strong: "#818cf8",
    accent: "#93c5fd",
    ring: "#818cf8",
  },
};
function applyTheme() {
  const th = THEMES[+levelEl.value],
    r = document.documentElement.style;
  r.setProperty("--primary", th.primary);
  r.setProperty("--primary-strong", th.strong);
  r.setProperty("--accent", th.accent);
  r.setProperty("--ring", th.ring);
}

const N = slides.length;
let idx = 0;
let running = false,
  rafId = null,
  endAt = 0,
  muted = false,
  modeAudio = false,
  currentWhich = null;

function toastIt(msg, ms = 2000) {
  if (!toast || !toastMsg) return;
  toastMsg.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), ms);
}
function classReset(el) {
  el.classList.remove(
    "pos-left",
    "pos-center",
    "pos-right",
    "pos-far-left",
    "pos-far-right"
  );
}
function updatePositions() {
  slides.forEach((el) => classReset(el));
  const left = (idx - 1 + N) % N,
    right = (idx + 1) % N;
  slides.forEach((el, i) => {
    if (i === idx) el.classList.add("pos-center");
    else if (i === left) el.classList.add("pos-left");
    else if (i === right) el.classList.add("pos-right");
    else {
      const dist = (i - idx + N) % N;
      if (dist === N - 2) el.classList.add("pos-far-left");
      else if (dist === 2) el.classList.add("pos-far-right");
      else el.classList.add(dist < N / 2 ? "pos-far-right" : "pos-far-left");
    }
  });
  dots.forEach((d, di) => d.classList.toggle("active", di === idx));
  requestAnimationFrame(() => {
    const r = slides[idx].querySelector(".card").getBoundingClientRect();
    veil.style.setProperty("--r", Math.max(r.width, r.height) * 0.75 + "px");
  });
  handleMediaForSlide();
}
const mod = (n, m) => ((n % m) + m) % m;
function go(delta) {
  if (running) return;
  idx = mod(idx + delta, N);
  updatePositions();
}
function goTo(i) {
  if (running) return;
  idx = mod(i, N);
  updatePositions();
}

function drawValueChip(ctx, text, x, y) {
  const padX = 24,
    padY = 16;
  ctx.save();
  ctx.font = "800 42px Nunito, system-ui";
  const w = ctx.measureText(String(text)).width + padX * 2;
  const h = 64;
  ctx.fillStyle = "rgba(15,23,42,0.06)";
  const r = 16;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.fill();

  ctx.fillStyle = "#0f172a";
  ctx.fillText(String(text), x + padX, y + h - padY);
  ctx.restore();
  return { w, h };
}

function drawPanelWatermark(
  ctx,
  cx,
  cy,
  primary = "#7dd3fc",
  accent = "#86efac"
) {
  ctx.save();
  ctx.globalAlpha = 0.08;

  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120);
  g.addColorStop(0, primary);
  g.addColorStop(1, accent);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, 120, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function getCardPalette(theme = "pastel") {
  if (theme === "vibrant") {
    return {
      bg1: "#7dd3fc",
      bg2: "#86efac",
      orb1: "#60a5fa",
      orb2: "#34d399",
      panel: "rgba(255,255,255,0.92)",
      title: "#0f172a",
      text: "#334155",
    };
  }

  return {
    bg1: "#e0f2fe",
    bg2: "#dcfce7",
    orb1: "#bae6fd",
    orb2: "#bbf7d0",
    panel: "rgba(255,255,255,0.94)",
    title: "#0f172a",
    text: "#334155",
  };
}

function handleMediaForSlide() {
  if (idx === 2 && !modeAudio) {
    poster.style.display = "none";
    yt.style.display = "block";
    audioOverlay.classList.remove("show");
    amb.pause();
    amb.src = "";
  } else if (idx === 2 && modeAudio) {
    try {
      yt.contentWindow &&
        yt.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "pauseVideo" }),
          "*"
        );
    } catch {}

    poster.src =
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop";
    poster.style.display = "block";
    yt.style.display = "none";
    audioOverlay.classList.add("show");

    if (AMB_URL && amb.src !== AMB_URL) amb.src = AMB_URL;
    try {
      amb.load();
    } catch {}
    amb.currentTime = 0;
    if (transport.playing) {
      amb.play().catch(() => {});
      audioPlay.textContent = "⏸";
    } else {
      audioPlay.textContent = "▶";
    }
  } else {
    try {
      yt.contentWindow &&
        yt.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "stopVideo" }),
          "*"
        );
    } catch {}
    yt.style.display = "none";
    poster.style.display = "block";
    audioOverlay.classList.remove("show");
    amb.pause();
  }
}

document.addEventListener("pointerdown", (e) => {
  (function () {
    const observer = new MutationObserver((muts) => {
      const active = document.activeElement;
      if (!active) return;
      for (const m of muts) {
        if (
          m.type === "attributes" &&
          m.attributeName === "aria-hidden" &&
          m.target instanceof Element
        ) {
          const t = m.target;
          if (t === active || t.contains(active)) {
            t.removeAttribute("aria-hidden");
            t.setAttribute("inert", "");
            setTimeout(() => t.removeAttribute("inert"), 0);
          }
        }
      }
    });
    observer.observe(document.documentElement, {
      attributes: true,
      subtree: true,
      attributeFilter: ["aria-hidden"],
    });
  })();

  const b = e.target.closest(".btn");
  if (b) {
    try {
      navigator.vibrate && navigator.vibrate(10);
    } catch {}
  }
});

function scheduleBreath() {
  cancelAnimationFrame(rafId);
  const period = 10;
  pacer && pacer.style.setProperty("--bpm", period + "s");
  let last = performance.now(),
    acc = 0;
  function loop(now) {
    const dt = (now - last) / 1000;
    last = now;
    acc += dt;
    if (acc >= 1) {
      acc = 0;
      const fase =
        Math.floor((Date.now() / 1000) % period) < 5
          ? TXT[LANG].inhale
          : TXT[LANG].exhale;
      if (phase) phase.textContent = fase;
      if (!muted) {
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)({
            latencyHint: "interactive",
          });
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = "sine";
          o.frequency.value =
            fase.includes("Inhale") || fase.includes("Tarik") ? 420 : 432;
          g.gain.value = 0.0008;
          o.connect(g);
          g.connect(ctx.destination);
          o.start();
          o.stop(ctx.currentTime + 0.05);
          setTimeout(() => ctx.close(), 120);
        } catch {}
      }
    }
    rafId = requestAnimationFrame(loop);
  }
  rafId = requestAnimationFrame(loop);
}

function startCountdown(which, seconds) {
  running = true;
  endAt = Date.now() + seconds * 1000;
  const ring = rings[which];
  const timeEl = timers[which];
  function tick() {
    const left = Math.max(0, endAt - Date.now());
    const p = 1 - left / (seconds * 1000);
    if (ring) ring.style.strokeDashoffset = 157 * (1 - p);
    const s = Math.ceil(left / 1000);
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    if (timeEl) timeEl.textContent = `${TXT[LANG].timeLeft}: ${m}:${ss}`;
    if (left <= 0) {
      finish(which);
      return;
    }
    rafId = requestAnimationFrame(tick);
  }
  cancelAnimationFrame(rafId);
  tick();
}

function stopMedia(which) {
  if (which === 2) {
    try {
      yt.contentWindow &&
        yt.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "pauseVideo" }),
          "*"
        );
    } catch {}
    amb.pause();
  }
}

function lockUI(isRunning, which) {
  document.querySelectorAll(".is-locked").forEach((el) => {
    el.classList.remove("is-locked");
    if (el.tagName === "BUTTON" || el.type === "range") {
      el.disabled = false;
      el.setAttribute("aria-disabled", "false");
      if (el.dataset.prevTabIndex != null) {
        el.tabIndex = +el.dataset.prevTabIndex;
        delete el.dataset.prevTabIndex;
      } else {
        el.removeAttribute("tabindex");
      }
    }
  });

  if (!isRunning) return;

  if (which === 5) {
    const toLock = Array.from(
      document.querySelectorAll('button, input[type="range"]')
    );
    toLock.forEach((el) => {
      if (el.id === "start5") return;
      el.classList.add("is-locked");
      if (el.tagName === "BUTTON" || el.type === "range") {
        el.disabled = true;
        el.setAttribute("aria-disabled", "true");
        el.dataset.prevTabIndex = el.tabIndex;
        el.tabIndex = -1;
      }
    });

    return;
  }

  const lockEls = [
    prevBtn,
    nextBtn,
    ...dots,
    ...startBtns.filter((_, i) => i !== which),
  ].filter(Boolean);

  lockEls.forEach((el) => {
    el.classList.add("is-locked");
    if (el.tagName === "BUTTON") {
      el.disabled = true;
      el.setAttribute("aria-disabled", "true");
    }
  });
}

function stopSession(which) {
  running = false;
  cancelAnimationFrame(rafId);
  const ring = rings[which],
    timeEl = timers[which];
  if (ring) ring.style.strokeDashoffset = 157;
  if (timeEl) timeEl.textContent = "";
  if (which <= 4 && labels[which]) labels[which].textContent = TXT[LANG].start;
  if (which === 5) setEditorsEnabled(false);
  labels[5].textContent = TXT[LANG].start;
  transportHardStop({ resetClock: true });
  lockUI(false, which);
}
function startSession(which) {
  if (running && currentWhich === which) {
    return stopSession(which);
  }
  if (running) return;

  currentWhich = which;
  lockUI(true, which);

  if (which <= 4) {
    const dur = (DUR[which] && DUR[which][+levelEl.value]) || 120;

    if (which === 0) scheduleBreath();

    if (which === 2) {
      if (!modeAudio) {
        if (!yt.src) {
          const base = "https://www.youtube-nocookie.com/embed/1ZYbU82GVz4";
          const params = new URLSearchParams({
            enablejsapi: "1",
            controls: "1",
            modestbranding: "1",
            rel: "0",
            playsinline: "1",
            autoplay: "0",
            mute: muted ? "1" : "0",
            origin: location.origin.startsWith("http")
              ? location.origin
              : "http://localhost",
          });
          yt.setAttribute("title", "Video alam menenangkan");
          yt.setAttribute("loading", "lazy");
          yt.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
          yt.setAttribute(
            "sandbox",
            "allow-scripts allow-same-origin allow-presentation allow-popups"
          );
          yt.src = `${base}?${params.toString()}`;
        }
      } else {
        if (AMB_URL && amb.src !== AMB_URL) amb.src = AMB_URL;
        try {
          amb.load();
        } catch {}
      }

      transport.mediaClock = 0;
      transport.playing = true;
      transport.lastTs = performance.now();
      handleMediaForSlide();
      syncActiveMediumToClock(true);
      cancelAnimationFrame(transport.raf);
      transport.raf = requestAnimationFrame(transportTick);

      labels[which].textContent = TXT[LANG].stop;
      startCountdown(which, (DUR[which] && DUR[which][+levelEl.value]) || 120);
      logRun(which, (DUR[which] && DUR[which][+levelEl.value]) || 120);
      return;
    }

    labels[which].textContent = TXT[LANG].stop;
    startCountdown(which, dur);
    logRun(which, dur);
  } else if (which === 5) {
    labels[5].textContent = TXT[LANG].stop;
    setEditorsEnabled(true);
    labelText && labelText.focus();
    startCountdown(5, currentPajDur);
  }
}

function finish(which) {
  stopSession(which);
  transportHardStop({ resetClock: true });
  if (which === 5) {
    saveJournalEntry();
    checkMilestonesAndCelebrate();
    showSummary(true);
  } else overlay.classList.add("show");
}

function showLinesSeq() {
  const ids = ["#g1", "#g2", "#g3", "#g4"];
  ids.forEach((sel, i) =>
    setTimeout(() => $(sel).classList.add("show"), 600 + i * 1100)
  );
  const doneAt = 600 + ids.length * 1100 + 120;
  setTimeout(() => {
    gratCTA.classList.add("reveal");
  }, doneAt);
}
$("#feel-better").addEventListener("click", () => {
  overlay.classList.remove("show");
  $("#pajAskQuick").textContent = TXT[LANG].tryJournal;
  $("#pajAskLater").textContent = TXT[LANG].later;
  const luck = TXT[LANG].lucky;
  ["#g1", "#g2", "#g3", "#g4"].forEach(
    (s, i) => ($(s).textContent = luck[i] || "")
  );
  grat.style.display = "grid";
  grat.classList.add("show");
  showLinesSeq();
});
$("#feel-next").addEventListener("click", () => {
  overlay.classList.remove("show");
  go(+1);
});
$("#pajAskQuick").addEventListener("click", () => {
  grat.classList.remove("show");
  grat.style.display = "none";
  goTo(5);
});
$("#pajAskLater").addEventListener("click", () => {
  grat.classList.remove("show");
  grat.style.display = "none";
});

function journalStats() {
  const j = JSON.parse(localStorage.getItem("calm:journal") || "[]");
  const now = new Date();
  const last7 = j.filter(
    (x) => now - new Date(x.t) <= 7 * 24 * 60 * 60 * 1000
  ).length;
  const daysSet = new Set(
    j.map((x) => new Date(new Date(x.t).toDateString()).getTime())
  );
  let streak = 0,
    d = new Date();
  d.setHours(0, 0, 0, 0);
  while (daysSet.has(d.getTime())) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return { count7: last7, streak };
}
function showSummary() {
  const hist = JSON.parse(localStorage.getItem("calm:hist") || "[]");
  const lines = hist
    .slice(-6)
    .map((h) => {
      const mins = Math.round(h.dur / 60);
      return `• ${new Date(h.t).toLocaleString()} — ${TXT[LANG].lvLabel} ${
        h.lvl
      }, ${TXT[LANG].sessionWord} ${h.s}, ${TXT[LANG].durWord} ${mins} ${
        TXT[LANG].minSuffix
      }`;
    })
    .join("<br>");
  const js = journalStats();
  const jn = JSON.parse(localStorage.getItem("calm:journal") || "[]");
  const lastJ = jn.slice(-1)[0];
  let extra = "";
  if (lastJ) {
    extra = `<div style="margin-top:8px"><strong>${
      TXT[LANG].lastJournalLabel
    }:</strong> ${new Date(lastJ.t).toLocaleString()} — ${lastJ.mode} — “${
      lastJ.prompt
    }” (${TXT[LANG].words(lastJ.words)})</div>`;
  }
  const dayWord = LANG === "id" ? "hari" : js.streak === 1 ? "day" : "days";
  $("#sum-title").textContent = TXT[LANG].summaryTitle;
  $("#sum-body").innerHTML = `<div class="hint">${lines || "—"}</div>
                      <div style="margin-top:10px">${
                        TXT[LANG].summaryPAJ7Label
                      }: <strong>${js.count7}</strong> • ${
    TXT[LANG].streakLabel
  }: <strong>${js.streak}</strong> ${dayWord}</div>${extra}
                      <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;"><button class="btn btn-ghost" id="sumExport">${
                        TXT[LANG].export
                      }</button></div>`;
  summary.classList.add("show");
  $("#sumExport").onclick = exportAllAsTxt;
}
$("#closeSum").addEventListener("click", () =>
  summary.classList.remove("show")
);
$("#restart").addEventListener("click", () => {
  summary.classList.remove("show");
  idx = 0;
  updatePositions();
});

function wrapTextBlock(ctx, text, x, y, maxWidth, lineHeight, maxLines = 6) {
  const words = String(text || "")
    .trim()
    .split(/\s+/);
  let line = "",
    lines = 0,
    yy = y;
  for (let i = 0; i < words.length; i++) {
    const test = (line ? line + " " : "") + words[i];
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, yy);
      lines++;
      yy += lineHeight;
      line = words[i];
      if (lines >= maxLines - 1) {
        let rest = line + " " + words.slice(i + 1).join(" ");
        while (ctx.measureText(rest + "…").width > maxWidth && rest.length) {
          rest = rest.slice(0, -1);
        }
        ctx.fillText(rest + "…", x, yy);
        return { y: yy, lines: lines + 1 };
      }
    } else line = test;
  }
  if (line) {
    ctx.fillText(line, x, yy);
    lines++;
  }
  return { y: yy, lines };
}

function drawBrandLogo(ctx, x, y, primary, accent) {
  const R = 44;

  if (typeof ctx.createConicGradient === "function") {
    const cg = ctx.createConicGradient(Math.PI, x, y);
    cg.addColorStop(0, "rgba(56,189,248,0.22)");
    cg.addColorStop(1, "rgba(134,239,172,0.22)");
    ctx.fillStyle = cg;
  } else {
    const rg = ctx.createRadialGradient(x, y, 0, x, y, R);
    rg.addColorStop(0, "rgba(56,189,248,0.18)");
    rg.addColorStop(1, "rgba(134,239,172,0.18)");
    ctx.fillStyle = rg;
  }
  ctx.beginPath();
  ctx.arc(x, y, R, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  const ig = ctx.createRadialGradient(x, y, R - 18, x, y, R);
  ig.addColorStop(0, "rgba(125,211,252,0.00)");
  ig.addColorStop(1, "rgba(125,211,252,0.35)");
  ctx.fillStyle = ig;
  ctx.beginPath();
  ctx.arc(x, y, R, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const r2 = 14;
  const lg = ctx.createLinearGradient(x, y - r2, x, y + r2);
  lg.addColorStop(0, primary || "#7dd3fc");
  lg.addColorStop(1, accent || "#86efac");
  ctx.beginPath();
  ctx.arc(x, y, r2, 0, Math.PI * 2);
  ctx.fillStyle = lg;
  ctx.fill();
}

function makeShareCanvas(payloadStats, theme = "pastel", variant = "journal") {
  const W = 1080,
    H = 1920;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.textBaseline = "alphabetic";

  const pal = getCardPalette(theme);
  const headTitle = LANG === "id" ? "Kamu aman" : "You're good";
  const headSub =
    LANG === "id"
      ? "Tarik napas pelan… kamu sudah lebih aman sekarang."
      : "Breathe softly… you are safer now.";

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, pal.bg1);
  bg.addColorStop(1, pal.bg2);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const orbA = ctx.createRadialGradient(220, 260, 10, 220, 260, 240);
  orbA.addColorStop(0, pal.orb1);
  orbA.addColorStop(1, "transparent");
  ctx.fillStyle = orbA;
  ctx.beginPath();
  ctx.arc(220, 260, 240, 0, Math.PI * 2);
  ctx.fill();

  const orbB = ctx.createRadialGradient(W - 160, 540, 10, W - 160, 540, 280);
  orbB.addColorStop(0, pal.orb2);
  orbB.addColorStop(1, "transparent");
  ctx.fillStyle = orbB;
  ctx.beginPath();
  ctx.arc(W - 160, 540, 280, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = pal.title;

  ctx.font = "800 72px Nunito, system-ui";
  ctx.fillText("CalmNow", 72, 124);

  const left = 72;
  const maxHeadW = W - left - 72;
  let titleSize = 104;
  ctx.font = `800 ${titleSize}px Nunito, system-ui`;
  while (ctx.measureText(headTitle).width > maxHeadW && titleSize > 84) {
    titleSize -= 4;
    ctx.font = `800 ${titleSize}px Nunito, system-ui`;
  }
  const titleY = 240;
  ctx.fillText(headTitle, left, titleY);

  let subSize = 52;
  ctx.font = `700 ${subSize}px Nunito, system-ui`;
  while (ctx.measureText(headSub).width > maxHeadW && subSize > 40) {
    subSize -= 2;
    ctx.font = `700 ${subSize}px Nunito, system-ui`;
  }
  let subBottomY;
  const subLineH = Math.round(subSize * 1.18);
  if (ctx.measureText(headSub).width <= maxHeadW) {
    const subY = titleY + Math.round(titleSize * 0.6);
    ctx.fillText(headSub, left, subY);
    subBottomY = subY + subLineH * 0.3;
  } else {
    const subY = titleY + Math.round(titleSize * 0.6);
    wrapTextBlock(ctx, headSub, left, subY, maxHeadW, subLineH, 2);
    subBottomY = subY + subLineH * 1.0;
  }

  const panelTop = subBottomY + 60,
    panelBottom = H - 220,
    side = 48,
    rad = 56;

  ctx.fillStyle = pal.panel;
  ctx.beginPath();
  ctx.moveTo(side + rad, panelTop);
  ctx.lineTo(W - side - rad, panelTop);
  ctx.quadraticCurveTo(W - side, panelTop, W - side, panelTop + rad);
  ctx.lineTo(W - side, panelBottom - rad);
  ctx.quadraticCurveTo(W - side, panelBottom, W - side - rad, panelBottom);
  ctx.lineTo(side + rad, panelBottom);
  ctx.quadraticCurveTo(side, panelBottom, side, panelBottom - rad);
  ctx.lineTo(side, panelTop + rad);
  ctx.quadraticCurveTo(side, panelTop, side + rad, panelTop);
  ctx.fill();

  const MX = 84;
  const MAXW = W - MX * 2;
  const TITLE_FONT = "800 56px Nunito, system-ui";
  const TITLE_SIZE = 56;
  const BODY_FONT = "600 44px Nunito, system-ui";
  const BODY_LH = 60;
  const GAP_TITLE_BODY = 16;
  const GAP_SECTION = 64;

  function drawDivider(x1, x2, y) {}

  function drawValueChip(text, x, y) {
    const padX = 24,
      padY = 16;
    ctx.save();
    ctx.font = "800 42px Nunito, system-ui";
    const w = ctx.measureText(String(text)).width + padX * 2;
    const h = 64,
      r = 16;
    ctx.fillStyle = "rgba(15,23,42,0.06)";
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.fill();
    ctx.fillStyle = "#0f172a";
    ctx.fillText(String(text), x + padX, y + h - padY);
    ctx.restore();
    return { w, h };
  }

  let y = panelTop + 120;

  if (
    !(
      variant === "fallback" &&
      (!payloadStats.streak || payloadStats.streak === 0)
    )
  ) {
    const cx0 = W / 2,
      cy0 = y + 20;
    const badge = ctx.createLinearGradient(
      cx0 - 100,
      cy0 - 100,
      cx0 + 100,
      cy0 + 100
    );
    badge.addColorStop(0, pal.bg1);
    badge.addColorStop(1, pal.bg2);
    ctx.beginPath();
    ctx.arc(cx0, cy0, 100, 0, Math.PI * 2);
    ctx.fillStyle = badge;
    ctx.fill();
    ctx.lineWidth = 12;
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.stroke();
    ctx.fillStyle = "#0f172a";
    ctx.font = "800 56px Nunito, system-ui";
    const sText =
      LANG === "id"
        ? `Streak ${payloadStats.streak}`
        : `Streak ${payloadStats.streak}`;
    const m = ctx.measureText(sText);
    ctx.fillText(sText, cx0 - m.width / 2, cy0 + 18);
    y = cy0 + 120;
  } else {
    y += 20;
  }

  drawDivider(MX, W - MX, y);
  y += 32;

  function drawSection(title, body, maxLines = 5) {
    ctx.fillStyle = pal.title;
    ctx.font = TITLE_FONT;
    ctx.fillText(title, MX, y);

    y += TITLE_SIZE + GAP_TITLE_BODY;

    ctx.fillStyle = pal.text;
    ctx.font = BODY_FONT;
    const block = wrapTextBlock(ctx, body, MX, y, MAXW, BODY_LH, maxLines);
    y = block.y + BODY_LH;

    drawDivider(MX, W - MX, y + Math.floor(GAP_SECTION / 2));
    y += GAP_SECTION;
  }

  if (variant === "journal") {
    drawSection(
      LANG === "id" ? "Prompt" : "Prompt",
      payloadStats.prompt || "—",
      6
    );
    drawSection(
      LANG === "id" ? "Label emosi" : "Emotion label",
      payloadStats.label || "—",
      4
    );

    if (payloadStats.text && String(payloadStats.text).trim()) {
      drawSection(
        LANG === "id" ? "Jurnal hari ini" : "Today's journal",
        payloadStats.text,
        12
      );
    }

    ctx.fillStyle = pal.title;
    ctx.font = TITLE_FONT;
    ctx.fillText(LANG === "id" ? "Kata hari ini" : "Words today", MX, y);
    y += TITLE_SIZE + GAP_TITLE_BODY - 10;
    const chip = drawValueChip(String(payloadStats.words || 0), MX, y);
    y += chip.h + GAP_SECTION;
  } else {
    const T = TXT[LANG].fallback.titles;
    drawSection(T.msg, payloadStats.prompt, 5);
    drawSection(T.aff, payloadStats.label, 4);
    drawSection(T.step, payloadStats.step, 4);
  }

  const glow = ctx.createRadialGradient(
    W / 2,
    H - 140,
    10,
    W / 2,
    H - 140,
    160
  );
  glow.addColorStop(0, pal.orb2);
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(W / 2, H - 140, 50, 0, Math.PI * 2);
  ctx.fill();

  const primary =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--primary")
      .trim() || "#7dd3fc";
  const accent =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--accent")
      .trim() || "#86efac";
  drawBrandLogo(ctx, W / 2, H - 140, primary, accent);

  ctx.fillStyle = "#0f172a";
  ctx.font = "800 42px Nunito, system-ui";
  const tag = "#CalmNow  #2MinuteJournal";
  const tw = ctx.measureText(tag).width;
  ctx.fillText(tag, W / 2 - tw / 2, H - 48);

  return c;
}

async function shareCanvas(canvas, caption) {
  const blob = await new Promise((res) =>
    canvas.toBlob(res, "image/png", 0.98)
  );
  if (!blob) return;
  const file = new File([blob], "CalmNow-Share.png", {
    type: "image/png",
  });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text: caption });
      const t = document.querySelector("#toast"),
        m = document.querySelector("#toastMsg");
      if (t && m) {
        m.textContent = TXT[LANG].shareDone;
        t.classList.add("show");
        setTimeout(() => t.classList.remove("show"), 2200);
      }
      return;
    } catch {}
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "CalmNow-Share.png";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
  const t = document.querySelector("#toast"),
    m = document.querySelector("#toastMsg");
  if (t && m) {
    m.textContent = TXT[LANG].shareDL;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 2600);
  }
}

function lastJournalSafe() {
  const j = JSON.parse(localStorage.getItem("calm:journal") || "[]");
  const lastJ = j.slice(-1)[0] || {};
  return {
    prompt: String(lastJ.prompt || ""),
    label: String(lastJ.label || ""),
    words: Number(lastJ.words || 0),
    text: String(lastJ.text || ""),
  };
}
function currentJournalFromEditor() {
  const label = (labelText.value || "").trim();
  const text = (pajText.value || "").trim();
  const words = (text.match(/\S+/g) || []).length;
  const prompt = $("#pajPrompt").textContent || "";
  return { label, text, words, prompt };
}

const FALLBACK = {
  messages: [
    "One relaxed step beats zero.",
    "Breathe, soften, begin again.",
    "Pause. Notice. Choose the smaller move.",
    "Storms pass. You’re not the storm.",
    "Tiny calm, many times a day.",
  ],
  affirmations: [
    "I treat myself gently.",
    "I can pause and reset.",
    "I am learning to be kinder to me.",
    "I can take the smallest wise step.",
    "My breath can anchor me.",
  ],
  steps: [
    "Write one line: what went well.",
    "Sip water, drop your shoulders.",
    "Stand up, stretch 10 seconds.",
    "Look out the window for 20s.",
    "Put phone down for 1 minute.",
  ],
};
const randPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function buildSharePayload({ variant = "auto", source = "auto" } = {}) {
  const js = journalStats();

  const data =
    source === "current" ? currentJournalFromEditor() : lastJournalSafe();

  const hasText =
    (data.text && data.text.trim().length > 0) ||
    (data.words && data.words > 0);
  const hasLabel = data.label && data.label.trim().length > 0;
  const hasJournal = hasText || hasLabel;

  if (variant === "fallback") {
    const F = TXT[LANG].fallback;
    return {
      variant: "fallback",
      stats: {
        streak: js.streak || 0,
        prompt: F.messages[Math.floor(Math.random() * F.messages.length)],
        label:
          F.affirmations[Math.floor(Math.random() * F.affirmations.length)],
        step: F.steps[Math.floor(Math.random() * F.steps.length)],
      },
    };
  }

  if (variant === "journal") {
    if (!hasJournal) return { variant: "none" };
    return {
      variant: "journal",
      stats: {
        streak: js.streak || 0,
        words: data.words || 0,
        prompt: data.prompt || "—",
        label: data.label || "—",
        text: data.text || "",
      },
    };
  }

  if (!hasJournal)
    return buildSharePayload({ variant: "fallback", source: "last" });
  return buildSharePayload({ variant: "journal", source });
}

let __sp = {
  canvas: null,
  payload: null,
  variant: "auto",
  source: "auto",
};

function renderShareCanvasForPreview() {
  const box = document.getElementById("sp-box");
  const scale = +document.getElementById("sp-scale").value;

  __sp.payload = buildSharePayload({
    variant: __sp.variant,
    source: __sp.source,
  });

  if (!__sp.payload || __sp.payload.variant === "none") {
    toastIt(
      LANG === "id"
        ? "Belum ada jurnal. Tulis dulu sedikit ya."
        : "No journal yet. Write a little first."
    );
    return;
  }

  const c = makeShareCanvas(
    __sp.payload.stats,
    CARD_THEME,
    __sp.payload.variant
  );
  __sp.canvas = c;

  box.querySelectorAll("canvas").forEach((el) => el.remove());
  box.prepend(c);

  c.style.width = Math.round(1080 * (scale / 100)) + "px";
  c.style.height = "auto";
  bindCardThemeSeg();
  syncCardThemeSeg();
}

function openSharePreview() {
  const scale = document.getElementById("sp-scale");
  const scaleV = document.getElementById("sp-scalev");
  scale.value = 25;
  scaleV.textContent = "25%";

  renderShareCanvasForPreview();
  bindCardThemeSeg();
  syncCardThemeSeg();

  document.getElementById("sharePreview").classList.add("show");
}

function bindSharePreview() {
  const on = (id, type, handler) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener(type, handler);
    return el;
  };

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("#shareWordsBtn");
    if (!btn) return;
    e.preventDefault();

    document.getElementById("overlay")?.classList.remove("show");
    const gratEl = document.getElementById("grat");
    if (gratEl) {
      gratEl.classList.remove("show");
      gratEl.style.display = "none";
    }

    __sp.variant = "fallback";
    __sp.source = "last";

    const sc = document.getElementById("sp-scale");
    const sv = document.getElementById("sp-scalev");
    if (sc) sc.value = 25;
    if (sv) sv.textContent = "25%";

    renderShareCanvasForPreview();
    document.getElementById("sharePreview")?.classList.add("show");
  });

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("#shareJournalBtn");
    if (!btn) return;
    e.preventDefault();

    document.getElementById("overlay")?.classList.remove("show");
    const gratEl = document.getElementById("grat");
    if (gratEl) {
      gratEl.classList.remove("show");
      gratEl.style.display = "none";
    }

    __sp.variant = "journal";
    __sp.source = idx === 5 ? "current" : "last";

    const sc = document.getElementById("sp-scale");
    const sv = document.getElementById("sp-scalev");
    if (sc) sc.value = 25;
    if (sv) sv.textContent = "25%";

    renderShareCanvasForPreview();
    if (__sp.payload && __sp.payload.variant !== "none") {
      document.getElementById("sharePreview")?.classList.add("show");
    }
  });

  {
    const scale = document.getElementById("sp-scale");
    const scaleV = document.getElementById("sp-scalev");
    if (scale) {
      scale.addEventListener("input", () => {
        if (scaleV) scaleV.textContent = scale.value + "%";
        const c = document.querySelector("#sp-box canvas");
        if (c) c.style.width = Math.round(1080 * (+scale.value / 100)) + "px";
      });
    }
  }

  on("sp-guidetoggle", "change", (e) => {
    const box = document.getElementById("sp-guides");
    if (box) box.classList.toggle("show", e.target.checked);
  });

  on("sp-openTab", "click", () => {
    if (!__sp.canvas) return;
    __sp.canvas.toBlob(
      (b) => {
        const url = URL.createObjectURL(b);
        window.open(url, "_blank");
        setTimeout(() => URL.revokeObjectURL(url), 20000);
      },
      "image/png",
      0.95
    );
  });

  on("sp-download", "click", () => {
    if (!__sp.canvas) return;
    __sp.canvas.toBlob(
      (blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "CalmNow-Share.png";
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 500);
      },
      "image/png",
      0.95
    );
  });

  on("sp-share", "click", async () => {
    if (!__sp.canvas || !__sp.payload) return;
    const js = journalStats();
    const words =
      __sp.payload.variant === "journal" ? __sp.payload.stats.words || 0 : 0;
    const caption = TXT[LANG].caption(js.streak || 0, words);
    await shareCanvas(__sp.canvas, caption);
  });

  on("sp-close", "click", () => {
    document.getElementById("sharePreview")?.classList.remove("show");
  });

  document.addEventListener("keydown", (e) => {
    const open = document
      .getElementById("sharePreview")
      ?.classList.contains("show");
    if (!open) return;
    if (e.key === "Escape") document.getElementById("sp-close")?.click();
    if (e.key.toLowerCase() === "s")
      document.getElementById("sp-share")?.click();
    if (e.key.toLowerCase() === "d")
      document.getElementById("sp-download")?.click();
  });
}

function initDOMListeners() {
  const stack = document.querySelector(".stack");
  const pajSegEl = document.getElementById("pajSeg");
  const pajTextEl = document.getElementById("pajText");

  onEl(prevBtn, "click", () => !running && go(-1));
  onEl(nextBtn, "click", () => !running && go(+1));
  dots.forEach(
    (d, i) => d && d.addEventListener("click", () => !running && goTo(i))
  );

  onEl(levelEl, "input", () => {
    applyTheme();
    persist();
    updatePajDefault();
  });
  onEl(muteBtn, "click", () => {
    muted = !muted;
    muteBtn.setAttribute("aria-pressed", String(muted));
    muteBtn.textContent = muted ? TXT[LANG].muteOn : TXT[LANG].muteOff;
    persist();
  });

  startBtns.forEach(
    (b, i) => b && b.addEventListener("click", () => startSession(i))
  );
  onId("finish", "click", () => showSummary());

  onEl(toggleModeBtn, "click", () => {
    pauseBothMedia();
    modeAudio = !modeAudio;
    toggleModeBtn.textContent = modeAudio
      ? TXT[LANG].modeAudio
      : TXT[LANG].modeVideo;
    transport.mode = modeAudio ? "audio" : "video";
    handleMediaForSlide();

    if (!running) {
      transportHardStop({ resetClock: false });
      audioPlay.textContent = "▶";
      return;
    }
    transport.playing = true;
    if (!transport.lastTs) transport.lastTs = performance.now();
    syncActiveMediumToClock(true);
    if (!transport.raf) transport.raf = requestAnimationFrame(transportTick);
  });

  onEl(fsBtn, "click", () => {
    const box = $("#natureBox");
    if (box && box.requestFullscreen) box.requestFullscreen();
  });

  onEl(audioPlay, "click", () => {
    if (!transport.playing) transportPlay();
    else transportPause();
  });
  onEl(amb, "timeupdate", () => {
    if (!amb.duration) return;
    if (seek) seek.value = Math.floor((amb.currentTime / amb.duration) * 100);
    if (aTime)
      aTime.textContent = new Date(amb.currentTime * 1000)
        .toISOString()
        .substr(14, 5);
  });
  onEl(seek, "input", () => {
    if (amb && amb.duration)
      amb.currentTime = (seek.value / 100) * amb.duration;
  });
  onEl(amb, "canplay", () => {
    if (transport.playing && modeAudio) {
      amb.play().catch(() => {});
    }
  });

  onId("shufflePrompt", "click", setPrompt);

  onEl(pajSegEl, "click", (e) => {
    const btn = e.target.closest(".seg-btn");
    if (!btn) return;
    pajSegEl
      .querySelectorAll(".seg-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    setPajDur(+btn.dataset.dur);
  });

  onEl(pajTextEl, "input", updateWordCount);

  if (stack) {
    let x0 = null;
    const thr = 40;
    stack.addEventListener(
      "touchstart",
      (e) => {
        if (running) return;
        x0 = e.touches[0].clientX;
      },
      { passive: true }
    );
    stack.addEventListener(
      "touchend",
      (e) => {
        if (running || x0 == null) return;
        const dx = e.changedTouches[0].clientX - x0;
        if (Math.abs(dx) > thr) go(dx < 0 ? +1 : -1);
        x0 = null;
      },
      { passive: true }
    );
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    bindSharePreview();
    initDOMListeners();
  });
} else {
  bindSharePreview();
  initDOMListeners();
}

function persist() {
  try {
    localStorage.setItem(
      "calm:state",
      JSON.stringify({ level: levelEl.value, muted })
    );
  } catch {}
}

function pickPrompt() {
  const arr = TXT[LANG].prompts;
  return arr[Math.floor(Math.random() * arr.length)];
}
function setPrompt() {
  $("#pajPrompt").textContent = pickPrompt();
}

function setPajDur(d) {
  currentPajDur = d;
  labels[5].textContent = TXT[LANG].start;
}

function updatePajDefault() {
  if (+levelEl.value >= 3) {
    $("#pajQuick").click();
  } else {
    $("#pajFull").click();
  }
}

const pajText = $("#pajText");
const wordCount = $("#wordCount");
const labelText = $("#labelText");
function setEditorsEnabled(on) {
  [labelText, pajText].forEach((el) => {
    if (!el) return;
    el.disabled = !on;
  });
}
function updateWordCount() {
  const n = (pajText.value.trim().match(/\S+/g) || []).length;
  wordCount.textContent = TXT[LANG].words(n);
}

function saveJournalEntry() {
  const j = JSON.parse(localStorage.getItem("calm:journal") || "[]");
  const entry = {
    t: new Date().toISOString(),
    lvl: +levelEl.value,
    mode: currentPajDur === PAJ.quick ? "quick-2m" : "full-12m",
    prompt: $("#pajPrompt").textContent,
    label: (labelText.value || "").trim(),
    text: (pajText.value || "").trim(),
    words: (pajText.value.trim().match(/\S+/g) || []).length,
    dur: currentPajDur,
  };
  j.push(entry);
  localStorage.setItem("calm:journal", JSON.stringify(j));
}

let CARD_THEME = localStorage.getItem("calm:cardTheme") || "pastel";

function getCardThemeSeg() {
  return document.getElementById("cardThemeSeg");
}

function syncCardThemeSeg() {
  const seg = getCardThemeSeg();
  if (!seg) return;
  seg.querySelectorAll(".seg-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.theme === CARD_THEME);
  });
}

function bindCardThemeSeg() {
  const seg = getCardThemeSeg();
  if (!seg || seg.__bound) return;
  seg.addEventListener("click", (e) => {
    const btn = e.target.closest(".seg-btn");
    if (!btn) return;
    const newTheme = btn.dataset.theme;
    if (!newTheme || newTheme === CARD_THEME) return;
    CARD_THEME = newTheme;
    localStorage.setItem("calm:cardTheme", CARD_THEME);
    syncCardThemeSeg();
    try {
      renderShareCanvasForPreview();
    } catch {}
  });
  seg.__bound = true;
}

function exportAllAsTxt() {
  const j = JSON.parse(localStorage.getItem("calm:journal") || "[]");
  const lines = j
    .map(
      (x) =>
        `[${new Date(x.t).toLocaleString()}] Lv ${x.lvl} • ${x.mode}\nLabel: ${
          x.label
        }\nPrompt: ${x.prompt}\n${x.text}\n---\n`
    )
    .join("\n");
  const blob = new Blob([lines || ""], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "CalmNow_Journal.txt";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function confettiBurst(count = 140) {
  for (let i = 0; i < count; i++) {
    const d = document.createElement("div");
    d.className = "confetti";
    d.style.left = Math.random() * 100 + "vw";
    d.style.background = `hsl(${Math.random() * 360},90%,60%)`;
    d.style.animationDuration = 1.8 + Math.random() * 1.4 + "s";
    d.style.transform = `translateY(0) rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 3200);
  }
}
function checkMilestonesAndCelebrate() {
  const { streak } = journalStats();
  if ([7, 14, 30].includes(streak)) {
    confettiBurst(180);
    const ms = document.getElementById("milestone");
    document.getElementById("ms-title").textContent =
      LANG === "id"
        ? `Mantap! Streak ${streak} hari`
        : `Nice! ${streak}-day streak`;
    document.getElementById("ms-desc").textContent = TXT[LANG].milestoneAsk;
    document.getElementById("ms-share").textContent = TXT[LANG].share;
    document.getElementById("ms-close").textContent = TXT[LANG].later;
    ms.classList.add("show");
    document.getElementById("ms-share").onclick = async () => {
      ms.classList.remove("show");
      const payload = buildSharePayload();
      const canvas = makeShareCanvas(
        payload.stats,
        CARD_THEME,
        payload.variant
      );
      const streak = payload.stats.streak || 0;
      const cap =
        payload.variant === "journal"
          ? TXT[LANG].caption(streak, payload.stats.words || 0)
          : streak > 0
          ? (LANG === "id"
              ? `Streak ${streak} hari`
              : `Streak ${streak} days`) + " #CalmNow #2MinuteJournal"
          : "#CalmNow #2MinuteJournal";
      await shareCanvas(canvas, cap);
    };
    document.getElementById("ms-close").onclick = () =>
      ms.classList.remove("show");
  }
}

function logRun(which, dur) {
  try {
    const hist = JSON.parse(localStorage.getItem("calm:hist") || "[]");
    hist.push({
      t: new Date().toISOString(),
      lvl: +levelEl.value,
      s: which,
      dur,
    });
    localStorage.setItem("calm:hist", JSON.stringify(hist));
  } catch {}
}

function applyLangTexts() {
  $("#subApp").textContent = TXT[LANG].appSub;
  $("#lblLevel").textContent = TXT[LANG].level;
  document.querySelectorAll(".aboutBtnLabel").forEach((el) => {
    el.textContent =
      TXT[LANG].aboutBtn || (LANG === "id" ? "Tentang" : "About");
  });
  const spTitle = document.getElementById("sp-title");
  const spScaleLabel = document.getElementById("sp-scale-label");
  const spOpen = document.getElementById("sp-openTab");
  const spDownload = document.getElementById("sp-download");
  const spShare = document.getElementById("sp-share");
  const spClose = document.getElementById("sp-close");
  const aboutBtnLabel = document.getElementById("aboutBtnLabel");
  if (aboutBtnLabel) aboutBtnLabel.textContent = TXT[LANG].aboutBtn;

  if (spTitle) spTitle.textContent = TXT[LANG].spTitle;
  if (spScaleLabel) spScaleLabel.textContent = TXT[LANG].spScale;
  if (spOpen) spOpen.textContent = TXT[LANG].spOpen;
  if (spDownload) spDownload.textContent = TXT[LANG].spDownload;
  if (spShare) spShare.textContent = TXT[LANG].spShare;
  if (spClose) spClose.textContent = TXT[LANG].spClose;

  muteBtn.textContent = muted ? TXT[LANG].muteOn : TXT[LANG].muteOff;
  $("#ov-title").textContent = TXT[LANG].overlayTitle;
  $("#ov-desc").textContent = TXT[LANG].overlayDesc;
  const msClose = document.getElementById("ms-close");
  const msShare = document.getElementById("ms-share");
  if (msClose) msClose.textContent = TXT[LANG].later;
  if (msShare) msShare.textContent = TXT[LANG].share;
  $("#feel-better").textContent = TXT[LANG].better;
  const sjBtn = document.getElementById("shareJournalBtn");
  if (sjBtn) sjBtn.textContent = LANG === "id" ? "Bagikan" : "Share Journal";
  const shareWordsSpan = document.querySelector("#shareWordsBtn span");
  if (shareWordsSpan) shareWordsSpan.textContent = TXT[LANG].share;

  $("#feel-next").textContent = TXT[LANG].continue;
  $("#alHint").textContent = TXT[LANG].alHint;
  const shareLbl = document.querySelector("#shareLabel");
  if (shareLbl) shareLbl.textContent = TXT[LANG].share;
  $("#sum-title").textContent = TXT[LANG].summaryTitle;
  $("#closeSum").textContent = TXT[LANG].summaryClose;
  $("#restart").textContent = TXT[LANG].summaryRestart;
  $("#s0title").textContent = TXT[LANG].s0;
  $("#s0desc").textContent = TXT[LANG].s0d;
  $("#s1title").textContent = TXT[LANG].posture;
  $("#s1desc").textContent = TXT[LANG].postureD;
  $("#s2title").textContent = TXT[LANG].nature;
  $("#s2desc").textContent = TXT[LANG].natureD;
  $("#s3title").textContent = TXT[LANG].pmr;
  $("#s3desc").textContent = TXT[LANG].pmrD;
  $("#s4title").textContent = TXT[LANG].cold;
  $("#s4desc").textContent = TXT[LANG].coldD;
  $("#s5title").textContent = TXT[LANG].labelJ;
  $("#s5desc").textContent = TXT[LANG].labelJd;

  $("#sd1").textContent = TXT[LANG].sd1;
  $("#sd2").textContent = TXT[LANG].sd2;
  $("#sd3").textContent = TXT[LANG].sd3;

  $("#s1a").innerHTML = TXT[LANG].s1a;
  $("#s1b").innerHTML = TXT[LANG].s1b;
  $("#s1c").innerHTML = TXT[LANG].s1c;
  $("#s3a").innerHTML = TXT[LANG].s3a;
  $("#s3b").innerHTML = TXT[LANG].s3b;
  $("#s3c").innerHTML = TXT[LANG].s3c;
  $("#s4a").textContent = TXT[LANG].s4a;
  $("#s4b").textContent = TXT[LANG].s4b;
  $("#s4c").textContent = TXT[LANG].s4c;

  $("#prevTxt").textContent = TXT[LANG].navPrev;
  $("#nextTxt").textContent = TXT[LANG].navNext;
  toggleModeBtn.textContent = modeAudio
    ? TXT[LANG].modeAudio
    : TXT[LANG].modeVideo;
  fsBtn.textContent = TXT[LANG].fullscreen;
  $("#audioTitle").textContent = TXT[LANG].audioPlaying;

  $("#pajHeader").textContent = TXT[LANG].pajHeader;
  $("#shufflePrompt").textContent = TXT[LANG].shuffle;
  $("#finishLabel").textContent = TXT[LANG].finish;
  $("#pajQuick").textContent = TXT[LANG].quickBtn;
  $("#pajFull").textContent = TXT[LANG].fullBtn;
  TXT[LANG].later;

  for (let i = 0; i <= 4; i++) {
    if (labels[i]) labels[i].textContent = TXT[LANG].start;
  }
  labels[5].textContent = TXT[LANG].start;

  $("#coolTip").textContent = TXT[LANG].coolTip;
  $("#natureHint").textContent =
    LANG === "id"
      ? "Koneksi lambat? Pakai Mode Audio."
      : "On slow network? Use Audio Mode.";
  $("#postureHint").textContent =
    LANG === "id"
      ? "Berdiam diri terlebih dahulu jaga ucapan dan tindakan."
      : "It’s best to stay quiet for now and be mindful of your words and actions.";
  $("#pmrHint").textContent =
    LANG === "id"
      ? "Hentikan jika muncul nyeri/pusing."
      : "Stop if you feel pain/dizziness.";
  $("#coldHint").textContent =
    LANG === "id" ? "Hentikan bila tidak nyaman." : "Stop if uncomfortable.";

  $("#labelText").placeholder =
    LANG === "id"
      ? "contoh: marah, kecewa, tidak dihargai..."
      : "e.g., angry, disappointed, not valued...";
  $("#pajText").placeholder =
    LANG === "id"
      ? "Tulis singkat 2–5 kalimat..."
      : "Write briefly 2–5 sentences...";

  ["#g1", "#g2", "#g3", "#g4"].forEach(
    (s, i) => ($(s).textContent = TXT[LANG].lucky[i] || "")
  );
  if (phase) phase.textContent = `${TXT[LANG].inhale} · ${TXT[LANG].exhale}`;

  setPrompt();
  updateWordCount();
}

const langSeg = $("#langSeg");
function syncLangSeg() {
  langSeg
    .querySelectorAll(".seg-btn")
    .forEach((b) => b.classList.toggle("active", b.dataset.lang === LANG));
  document.documentElement.setAttribute("lang", LANG);
}
langSeg.addEventListener("click", (e) => {
  const btn = e.target.closest(".seg-btn");
  if (!btn) return;
  LANG = btn.dataset.lang;
  localStorage.setItem("calm:lang", LANG);
  syncLangSeg();
  applyLangTexts();
});

document.addEventListener("keydown", (e) => {
  const el = e.target,
    isTyping =
      el &&
      (el.tagName === "INPUT" ||
        el.tagName === "TEXTAREA" ||
        el.isContentEditable);
  if (isTyping) return;
  if (e.key === "ArrowLeft") {
    e.preventDefault();
    !running && go(-1);
  } else if (e.key === "ArrowRight") {
    e.preventDefault();
    !running && go(+1);
  } else if (e.key === " " || e.key === "Enter") {
    e.preventDefault();
    startSession(idx);
  } else if (e.key === "m" || e.key === "M") {
    e.preventDefault();
    muteBtn.click();
  } else if (e.key === "+") {
    levelEl.value = Math.min(4, +levelEl.value + 1);
    applyTheme();
    persist();
  } else if (e.key === "-") {
    levelEl.value = Math.max(1, +levelEl.value - 1);
    applyTheme();
    persist();
  } else if (e.key >= "1" && e.key <= "6") {
    !running && goTo(+e.key - 1);
  }
});

function syncHeaderAndViewport() {
  const h = document.querySelector("header");
  const hh = h ? Math.max(56, h.offsetHeight) : 64;
  document.documentElement.style.setProperty("--headerH", hh + "px");
}
window.addEventListener(
  "resize",
  () => {
    syncHeaderAndViewport();
    updatePositions();
  },
  { passive: true }
);
window.addEventListener("orientationchange", () => {
  setTimeout(() => {
    syncHeaderAndViewport();
    updatePositions();
  }, 120);
});

async function maybeRegisterSW() {
  if (!("serviceWorker" in navigator)) return;

  const isLocal =
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1" ||
    location.hostname.endsWith(".local");

  if (isLocal) {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    } catch {}
    return;
  }

  try {
    await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  } catch (e) {}
}

(function init() {
  try {
    const s = JSON.parse(localStorage.getItem("calm:state") || "{}");
    if (s.level) levelEl.value = s.level;
    if (s.muted) {
      muted = true;
      muteBtn.setAttribute("aria-pressed", "true");
    }
  } catch {}
  applyTheme();
  idx = 0;
  syncLangSeg();
  applyLangTexts();
  updatePajDefault();
  maybeRegisterSW();
  setEditorsEnabled(false);
  syncHeaderAndViewport();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      updatePositions();
    });
  } else {
    updatePositions();
  }
})();

TXT.id.aboutTitle = "Tentang CalmNow";
TXT.id.aboutBtn = "Tentang";
TXT.en.aboutBtn = "About";
TXT.id.aboutDesc =
  "Ruang kecil yang hangat untuk menurunkan intensitas emosi—tanpa ribet.\n" +
  "Napas terpandu, ubah postur, alam/audio tenang, PMR, cold-face, label emosi, dan jurnal positif.\n" +
  "Ringan, privat, fokus satu kartu di tengah.";
TXT.id.aboutTag = "Tenang itu keterampilan—dilatih pelan.";
TXT.id.aboutSupport = "Dukung Kami";
TXT.en.aboutTitle = "About CalmNow";
TXT.en.aboutDesc =
  "A warm, compact space to soften big emotions—without the fuss.\n" +
  "Guided breathing, posture shift, nature/audio, PMR, cold-face, emotion labeling, and positive journaling.\n" +
  "Lightweight, private, one focused card in the center.";
TXT.en.aboutTag = "Calm is a skill—practiced gently.";
TXT.en.aboutSupport = "Support Us";

const aboutEl = document.getElementById("about");
const aboutCloseBtn = document.getElementById("aboutClose");
const aboutCanvas = document.getElementById("aboutCanvas");
const aboutDescEl = document.getElementById("about-desc");
const aboutSupportLabel = document.getElementById("about-support-label");

function setAboutTexts() {
  const t = TXT[LANG];
  document.getElementById("about-title").textContent = t.aboutTitle;
  document.getElementById("about-tag").textContent = t.aboutTag;
  aboutSupportLabel.textContent = t.aboutSupport;
}

let __typing = { raf: null, i: 0, full: "", startTs: 0 };
function typewriterStart(text) {
  if (!aboutDescEl) return;
  typewriterStop(true);
  __typing.full = String(text || "");
  __typing.i = 0;
  __typing.startTs = performance.now();
  aboutDescEl.textContent = "";
  aboutDescEl.classList.add("typing");

  const speed = 24;
  function step(now) {
    const elapsed = now - __typing.startTs;
    const targetLen = Math.min(__typing.full.length, Math.floor(elapsed / 40));
    if (targetLen > __typing.i) {
      aboutDescEl.textContent = __typing.full.slice(0, targetLen);
      __typing.i = targetLen;
    }
    if (__typing.i >= __typing.full.length) {
      typewriterStop(false);
      return;
    }
    __typing.raf = requestAnimationFrame(step);
  }
  __typing.raf = requestAnimationFrame(step);
}
function typewriterStop(fillAll) {
  if (__typing.raf) cancelAnimationFrame(__typing.raf);
  __typing.raf = null;
  if (fillAll && aboutDescEl) aboutDescEl.textContent = __typing.full || "";
  aboutDescEl && aboutDescEl.classList.remove("typing");
}

let __about3D = {
  init: false,
  raf: null,
  renderer: null,
  scene: null,
  cam: null,
  mesh: null,
};

function hexFromVar(name, fallback = "#7dd3fc") {
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return /^#([0-9a-f]{3}){1,2}$/i.test(v) ? v : fallback;
}

function initAbout3D() {
  if (__about3D.init || !aboutCanvas) return;
  if (typeof THREE === "undefined") {
    __about3D.init = true;
    return;
  }

  const W = aboutCanvas.clientWidth || 800;
  const H = aboutCanvas.clientHeight || 360;

  const renderer = new THREE.WebGLRenderer({
    canvas: aboutCanvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setSize(W, H);

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(38, W / H, 0.1, 100);
  cam.position.set(0, 0, 7);

  const cPrimary = new THREE.Color(hexFromVar("--primary", "#7dd3fc"));
  const cAccent = new THREE.Color(hexFromVar("--accent", "#86efac"));

  const geo = new THREE.IcosahedronGeometry(2.2, 2);
  const mat = new THREE.MeshStandardMaterial({
    color: cPrimary,
    emissive: cAccent.clone().multiplyScalar(0.15),
    metalness: 0.25,
    roughness: 0.35,
    flatShading: true,
  });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const key = new THREE.DirectionalLight(cPrimary.getHex(), 1.1);
  key.position.set(3, 4, 5);
  scene.add(key);
  const rim = new THREE.PointLight(cAccent.getHex(), 0.9, 30);
  rim.position.set(-4, -3, 2);
  scene.add(rim);

  let t0 = performance.now();
  function loop(now) {
    const dt = (now - t0) / 1000;
    t0 = now;
    const t = now * 0.0012;
    mesh.rotation.x += dt * 0.35;
    mesh.rotation.y += dt * 0.25;
    const s = 1 + Math.sin(t * 2.1) * 0.06;
    mesh.scale.setScalar(s);
    renderer.render(scene, cam);
    __about3D.raf = requestAnimationFrame(loop);
  }

  function onResize() {
    const w = aboutCanvas.clientWidth,
      h = aboutCanvas.clientHeight;
    if (w && h) {
      renderer.setSize(w, h, false);
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
    }
  }
  window.addEventListener("resize", onResize, { passive: true });

  __about3D = {
    init: true,
    raf: null,
    renderer,
    scene,
    cam,
    mesh,
    onResize,
  };
}

function startAbout3D() {
  if (!__about3D.init) initAbout3D();
  if (typeof THREE === "undefined") return;
  if (__about3D.raf) return;
  const tick = (now) => {};

  const loop = (now) => {
    const dt = now;

    const m = __about3D.mesh;
    const r = __about3D.renderer;
    const c = __about3D.cam;

    const t = now * 0.0012;
    m.rotation.x = t * 0.35;
    m.rotation.y = t * 0.25;
    const s = 1 + Math.sin(t * 2.1) * 0.06;
    m.scale.setScalar(s);
    r.render(__about3D.scene, c);
    __about3D.raf = requestAnimationFrame(loop);
  };
  __about3D.raf = requestAnimationFrame(loop);
}

function stopAbout3D() {
  if (__about3D.raf) {
    cancelAnimationFrame(__about3D.raf);
    __about3D.raf = null;
  }
}

function openAbout() {
  if (!aboutEl) return;
  setAboutTexts();
  const t = TXT[LANG];
  aboutEl.style.display = "grid";
  aboutEl.classList.add("show");

  typewriterStart(t.aboutDesc);
  startAbout3D();
}
function closeAbout() {
  if (!aboutEl) return;
  aboutEl.classList.remove("show");
  aboutEl.style.display = "none";
  typewriterStop(true);
  stopAbout3D();
}
function bindAboutButtons() {
  document.querySelectorAll(".aboutBtn").forEach((btn) => {
    btn.removeEventListener("click", openAbout);
    btn.addEventListener("click", openAbout);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bindAboutButtons);
} else {
  bindAboutButtons();
}

const aboutBtn = document.getElementById("aboutBtn");
aboutBtn && aboutBtn.addEventListener("click", openAbout);
const brandEl = document.querySelector("header .brand");
if (brandEl) brandEl.style.cursor = "pointer";
brandEl && brandEl.addEventListener("click", openAbout);
aboutCloseBtn && aboutCloseBtn.addEventListener("click", closeAbout);
aboutEl &&
  aboutEl.addEventListener("click", (e) => {
    if (e.target === aboutEl) closeAbout();
  });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && aboutEl && aboutEl.classList.contains("show"))
    closeAbout();
});

(function hookLangForAbout() {
  const oldApply = applyLangTexts;
  window.applyLangTexts = function patched() {
    oldApply();
    setAboutTexts();
    if (aboutEl && aboutEl.classList.contains("show")) {
      typewriterStart(TXT[LANG].aboutDesc);
    }
  };
})();
