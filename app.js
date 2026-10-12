const navItems = document.querySelectorAll(".nav-item");
const views = document.querySelectorAll(".view");
const breadcrumb = document.getElementById("crumb-current");
const titles = { tuner: "調音器", metronome: "節拍器", training: "指板訓練" };

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    const selected = item.dataset.view;
    navItems.forEach((nav) => nav.classList.toggle("active", nav === item));
    views.forEach((view) => view.classList.toggle("active", view.id === `view-${selected}`));
    breadcrumb.textContent = titles[selected];
  });
});

const now = new Date();
document.getElementById("today-label").textContent = new Intl.DateTimeFormat("zh-TW", { year: "numeric", month: "long", day: "numeric" }).format(now);

const themeToggle = document.getElementById("theme-toggle");
const themePreference = localStorage.getItem("string-day-theme");
if (themePreference === "dark") document.documentElement.dataset.theme = "dark";

function updateThemeButton() {
  const darkMode = document.documentElement.dataset.theme === "dark";
  themeToggle.setAttribute("aria-pressed", String(darkMode));
  themeToggle.setAttribute("aria-label", darkMode ? "切換淺色模式" : "切換深色模式");
  themeToggle.innerHTML = `<span aria-hidden="true">${darkMode ? "☀" : "☾"}</span><span class="theme-toggle-label">${darkMode ? "淺色模式" : "深色模式"}</span>`;
}

themeToggle.addEventListener("click", () => {
  const darkMode = document.documentElement.dataset.theme !== "dark";
  document.documentElement.dataset.theme = darkMode ? "dark" : "light";
  localStorage.setItem("string-day-theme", darkMode ? "dark" : "light");
  updateThemeButton();
});
updateThemeButton();

const noteNames = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];

// Tuner
const tunings = {
  standard: {
    name: "標準調弦",
    description: "E A D G B E · 從低音弦到高音弦",
    midi: [40, 45, 50, 55, 59, 64],
  },
  halfDown: {
    name: "降半音 Eb",
    description: "Eb Ab Db Gb Bb Eb · 全弦降半音",
    midi: [39, 44, 49, 54, 58, 63],
  },
  wholeDown: {
    name: "降全音 D",
    description: "D G C F A D · 全弦降全音",
    midi: [38, 43, 48, 53, 57, 62],
  },
  minorThirdDown: {
    name: "降小三度 C♯",
    description: "C♯ F♯ B E G♯ C♯ · 全弦降小三度",
    midi: [37, 42, 47, 52, 56, 61],
  },
  majorThirdDown: {
    name: "降大三度 C",
    description: "C F Bb Eb G C · 全弦降大三度",
    midi: [36, 41, 46, 51, 55, 60],
  },
  bStandard: {
    name: "B 標準",
    description: "B E A D F♯ B · 全弦降至 B 標準",
    midi: [35, 40, 45, 50, 54, 59],
  },
  dropD: {
    name: "Drop D",
    description: "D A D G B E · 第六弦降至 D",
    midi: [38, 45, 50, 55, 59, 64],
  },
  dropDb: {
    name: "Drop Db",
    description: "Db Ab Db Gb Bb Eb · Drop D 再降半音",
    midi: [37, 44, 49, 54, 58, 63],
  },
  dropC: {
    name: "Drop C",
    description: "C G C F A D · 六弦整體降調",
    midi: [36, 43, 48, 53, 57, 62],
  },
  dropB: {
    name: "Drop B",
    description: "B F♯ B E G♯ C♯ · 六弦整體降調",
    midi: [35, 42, 47, 52, 56, 61],
  },
  dropBb: {
    name: "Drop Bb",
    description: "Bb F Bb Eb G C · Drop C 再降半音",
    midi: [34, 41, 46, 51, 55, 60],
  },
  dropA: {
    name: "Drop A",
    description: "A E A D F♯ B · 六弦整體降調",
    midi: [33, 40, 45, 50, 54, 59],
  },
  dropG: {
    name: "Drop G",
    description: "G D G C E A · 六弦整體降調",
    midi: [31, 38, 43, 48, 52, 57],
  },
  doubleDropD: {
    name: "Double Drop D",
    description: "D A D G B D · 第一、六弦降至 D",
    midi: [38, 45, 50, 55, 59, 62],
  },
  openD: {
    name: "Open D",
    description: "D A D F♯ A D · 開放 D 大調",
    midi: [38, 45, 50, 54, 57, 62],
  },
  openE: {
    name: "Open E",
    description: "E B E G♯ B E · 開放 E 大調",
    midi: [40, 47, 52, 56, 59, 64],
  },
  openG: {
    name: "Open G",
    description: "D G D G B D · 開放 G 大調",
    midi: [38, 43, 50, 55, 59, 62],
  },
  openA: {
    name: "Open A",
    description: "E A E A C♯ E · 開放 A 大調",
    midi: [40, 45, 52, 57, 61, 64],
  },
  openC: {
    name: "Open C",
    description: "C G C G C E · 開放 C 大調",
    midi: [36, 43, 48, 55, 60, 64],
  },
  openDm: {
    name: "Open D minor",
    description: "D A D F A D · 開放 D 小調",
    midi: [38, 45, 50, 53, 57, 62],
  },
  openGm: {
    name: "Open G minor",
    description: "D G D G Bb D · 開放 G 小調",
    midi: [38, 43, 50, 55, 58, 62],
  },
  openC6: {
    name: "Open C6",
    description: "C A C G C E · C6 開放調弦",
    midi: [36, 45, 48, 55, 60, 64],
  },
  dadgad: {
    name: "DADGAD",
    description: "D A D G A D · 常見 Modal 調弦",
    midi: [38, 45, 50, 55, 57, 62],
  },
  dadgcd: {
    name: "DADGCD",
    description: "D A D G C D · Modal 變體",
    midi: [38, 45, 50, 55, 60, 62],
  },
  cgcfce: {
    name: "CGCFCE",
    description: "C G C F C E · 常見創作調弦",
    midi: [36, 43, 48, 53, 60, 64],
  },
  facgce: {
    name: "FACGCE",
    description: "F A C G C E · 常見創作調弦",
    midi: [41, 45, 48, 55, 60, 64],
  },
  cgdgcd: {
    name: "CGDGCD",
    description: "C G D G C D · Modal 變體",
    midi: [36, 43, 50, 55, 60, 62],
  },
  dgdgcd: {
    name: "DGDGCD",
    description: "D G D G C D · Modal 變體",
    midi: [38, 43, 50, 55, 60, 62],
  },
  cgcggc: {
    name: "CGCGGC",
    description: "C G C G G C · 特殊低音調弦",
    midi: [36, 43, 48, 55, 55, 60],
  },
  nashville: {
    name: "Nashville 高八度調弦",
    description: "E A D G B E · 前四弦改用高八度弦組",
    midi: [52, 57, 62, 67, 59, 64],
  },
};
const tuningPreset = document.getElementById("tuning-preset");
const tuningDescription = document.getElementById("tuning-description");
const tuningStringList = document.getElementById("tuning-string-list");
const tuningFoldToggle = document.getElementById("tuning-fold-toggle");
const tuningReopenToggle = document.getElementById("tuning-reopen-toggle");
const tuningDetails = document.getElementById("tuning-details");
const tunerLayout = document.querySelector(".tuner-layout");
let selectedTuning = tunings[tuningPreset.value];

function midiToNote(midi) {
  return `${noteNames[((midi % 12) + 12) % 12]}<sub>${Math.floor(midi / 12) - 1}</sub>`;
}

function renderTuning() {
  selectedTuning = tunings[tuningPreset.value];
  tuningDescription.textContent = selectedTuning.description;
  tuningStringList.innerHTML = selectedTuning.midi.map((midi, index) => {
    const stringNumber = 6 - index;
    const lineClass = stringNumber === 6 ? "thick" : stringNumber === 1 ? "thin" : "";
    const register = stringNumber === 6 ? "低音弦" : stringNumber === 1 ? "高音弦" : `${stringNumber} 弦`;
    return `<div class="string-item" data-midi="${midi}"><span class="string-number">0${stringNumber}</span><span class="string-line ${lineClass}"></span><span class="string-note">${midiToNote(midi)}</span><span class="string-state">${register}</span></div>`;
  }).join("");
}

function highlightTunedString(midi) {
  tuningStringList.querySelectorAll(".string-item").forEach((item) => {
    item.classList.toggle("detected-string", Number(item.dataset.midi) === midi);
  });
}

tuningPreset.addEventListener("change", () => {
  renderTuning();
});
tuningFoldToggle.addEventListener("click", () => {
  setTuningPanelExpanded(false);
});
tuningReopenToggle.addEventListener("click", () => setTuningPanelExpanded(true));

function setTuningPanelExpanded(expanded) {
  tuningFoldToggle.setAttribute("aria-expanded", String(expanded));
  tuningReopenToggle.hidden = expanded;
  tuningDetails.hidden = !expanded;
  document.getElementById("tuning-fold-label").textContent = "收合";
  tunerLayout.classList.toggle("tuning-collapsed", !expanded);
}
setTuningPanelExpanded(false);
renderTuning();

const micButton = document.getElementById("mic-button");
const micStatus = document.getElementById("mic-status");
const tunerNote = document.getElementById("tuner-note");
const tunerOctave = document.getElementById("tuner-octave");
const centsValue = document.getElementById("cents-value");
const meterNeedle = document.getElementById("meter-needle");
let audioContext;
let analyser;
let microphone;
let tunerFrame;
let micStream;

function detectPitch(buffer, sampleRate) {
  let rms = 0;
  for (let i = 0; i < buffer.length; i += 1) rms += buffer[i] * buffer[i];
  rms = Math.sqrt(rms / buffer.length);
  if (rms < 0.012) return null;

  let start = 0;
  let end = buffer.length - 1;
  while (start < end && Math.abs(buffer[start]) < 0.2) start += 1;
  while (end > start && Math.abs(buffer[end]) < 0.2) end -= 1;
  const samples = buffer.slice(start, end + 1);
  const size = samples.length;
  const correlations = new Float32Array(size);
  for (let offset = 0; offset < size; offset += 1) {
    let sum = 0;
    for (let i = 0; i < size - offset; i += 1) sum += samples[i] * samples[i + offset];
    correlations[offset] = sum;
  }
  const minOffset = Math.max(2, Math.floor(sampleRate / 400));
  const maxOffset = Math.min(size - 2, Math.ceil(sampleRate / 40));
  let bestOffset = -1;
  let bestCorrelation = 0;
  for (let offset = minOffset; offset <= maxOffset; offset += 1) {
    if (correlations[offset] > bestCorrelation) {
      bestCorrelation = correlations[offset];
      bestOffset = offset;
    }
  }
  if (bestOffset <= 0 || bestCorrelation / correlations[0] < 0.55) return null;
  const before = correlations[bestOffset - 1] || correlations[bestOffset];
  const after = correlations[bestOffset + 1] || correlations[bestOffset];
  const curve = (before - 2 * correlations[bestOffset] + after);
  const adjustment = curve ? (before - after) / (2 * curve) : 0;
  const period = bestOffset + adjustment;
  const frequency = sampleRate / period;
  return frequency >= 40 && frequency <= 400 ? frequency : null;
}

function updateTuner() {
  if (!analyser) return;
  const samples = new Float32Array(analyser.fftSize);
  analyser.getFloatTimeDomainData(samples);
  const frequency = detectPitch(samples, audioContext.sampleRate);
  if (frequency) {
    const midi = Math.round(69 + 12 * Math.log2(frequency / 440));
    const targetFrequency = 440 * (2 ** ((midi - 69) / 12));
    const cents = Math.round(1200 * Math.log2(frequency / targetFrequency));
    highlightTunedString(midi);
    tunerNote.textContent = noteNames[((midi % 12) + 12) % 12];
    tunerOctave.textContent = `第 ${Math.floor(midi / 12) - 1} 八度`;
    centsValue.textContent = `${cents > 0 ? "+" : ""}${cents}`;
    const position = Math.max(3, Math.min(97, 50 + cents * 1.45));
    meterNeedle.style.left = `${position}%`;
    const inTune = Math.abs(cents) <= 5;
    meterNeedle.classList.toggle("in-tune", inTune);
    tunerNote.classList.toggle("in-tune", inTune);
  }
  tunerFrame = requestAnimationFrame(updateTuner);
}

micButton.addEventListener("click", async () => {
  if (micStream) {
    cancelAnimationFrame(tunerFrame);
    micStream.getTracks().forEach((track) => track.stop());
    micStream = null;
    analyser = null;
    microphone = null;
    if (audioContext) await audioContext.close();
    audioContext = null;
    micButton.innerHTML = '<span class="mic-icon">◉</span> 開始使用麥克風';
    micStatus.textContent = "已停止收音。需要時可再次開啟調音器。";
    tunerNote.textContent = "—";
    tunerNote.classList.remove("in-tune");
    tunerOctave.textContent = "等待輸入";
    highlightTunedString(-1);
    centsValue.textContent = "0";
    meterNeedle.style.left = "50%";
    meterNeedle.classList.remove("in-tune");
    return;
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    micStatus.textContent = "此瀏覽器無法使用麥克風，請改用支援 HTTPS 的現代瀏覽器。";
    return;
  }
  micButton.disabled = true;
  micStatus.textContent = "正在連接麥克風…";
  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    await audioContext.resume();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 4096;
    microphone = audioContext.createMediaStreamSource(micStream);
    microphone.connect(analyser);
    micButton.innerHTML = '<span class="mic-icon">■</span> 停止收音';
    micStatus.textContent = "正在聆聽，請靠近麥克風單獨撥動一根弦。";
    updateTuner();
  } catch (error) {
    if (micStream) micStream.getTracks().forEach((track) => track.stop());
    micStream = null;
    micStatus.textContent = error.name === "NotAllowedError"
      ? "麥克風權限遭拒，請在瀏覽器網址列允許麥克風後重試。"
      : "無法開啟麥克風，請確認裝置已連接並重試。";
  } finally {
    micButton.disabled = false;
  }
});

// Metronome
const bpmValue = document.getElementById("bpm-value");
const tempoSlider = document.getElementById("tempo-slider");
const beatOptions = document.getElementById("beat-options");
const beatVisualizer = document.getElementById("beat-visualizer");
const cycleToggle = document.getElementById("cycle-toggle");
const cycleFoldToggle = document.getElementById("cycle-fold-toggle");
const cycleSettings = document.getElementById("cycle-settings");
const cycleStatus = document.getElementById("cycle-status");
const playButton = document.getElementById("play-button");
const playLabel = document.getElementById("play-label");
let bpm = 90;
let beatsPerBar = 4;
let meter = "4/4";
let practiceCycleEnabled = false;
let playBars = 1;
let restBars = 1;
let isPlaying = false;
let metronomeContext;
let nextBeatTime = 0;
let currentBeat = 0;
let currentCycleBar = 0;
let totalBars = 0;
let scheduler;
let visualTimers = [];
let tapTimes = [];

function setBpm(value) {
  bpm = Math.max(40, Math.min(220, Math.round(value)));
  bpmValue.textContent = bpm;
  tempoSlider.value = bpm;
  const percent = ((bpm - 40) / 180) * 100;
  tempoSlider.style.background = `linear-gradient(to right, #819b71 0%, #819b71 ${percent}%, #e7e8df ${percent}%, #e7e8df 100%)`;
}

function updateBeatDots() {
  beatVisualizer.innerHTML = "";
  for (let i = 0; i < beatsPerBar; i += 1) {
    const dot = document.createElement("span");
    const isAccent = meter === "6/8" ? i === 0 || i === 3 : i === 0;
    dot.className = `beat-light${isAccent ? " accent" : ""}`;
    beatVisualizer.append(dot);
  }
}

document.getElementById("bpm-down").addEventListener("click", () => setBpm(bpm - 1));
document.getElementById("bpm-up").addEventListener("click", () => setBpm(bpm + 1));
tempoSlider.addEventListener("input", () => setBpm(tempoSlider.value));
beatOptions.addEventListener("click", (event) => {
  const option = event.target.closest("[data-meter]");
  if (!option) return;
  meter = option.dataset.meter;
  beatsPerBar = meter === "6/8" ? 6 : Number(meter.split("/")[0]);
  document.getElementById("tempo-unit-label").textContent = meter === "6/8"
    ? "BPM · 附點四分音符"
    : "BPM · 四分音符";
  beatOptions.querySelectorAll("button").forEach((button) => button.classList.toggle("selected", button === option));
  updateBeatDots();
  currentBeat = 0;
});

function updateCycleStatus(message) {
  cycleStatus.textContent = message;
}

function updateCycleControls() {
  document.getElementById("play-bars-value").textContent = playBars;
  document.getElementById("rest-bars-value").textContent = restBars;
  cycleToggle.setAttribute("aria-pressed", String(practiceCycleEnabled));
  cycleToggle.textContent = practiceCycleEnabled ? "開啟中" : "關閉";
  cycleToggle.classList.toggle("enabled", practiceCycleEnabled);
  document.querySelectorAll(".cycle-step").forEach((button) => {
    button.disabled = !practiceCycleEnabled;
  });
  if (!isPlaying) {
    updateCycleStatus(practiceCycleEnabled
      ? `循環已開啟 · 播放 ${playBars} 小節，休息 ${restBars} 小節`
      : "循環關閉 · 持續播放");
  }
}

cycleToggle.addEventListener("click", () => {
  practiceCycleEnabled = !practiceCycleEnabled;
  currentCycleBar = 0;
  updateCycleControls();
});

cycleFoldToggle.addEventListener("click", () => {
  const expanded = cycleFoldToggle.getAttribute("aria-expanded") !== "true";
  cycleFoldToggle.setAttribute("aria-expanded", String(expanded));
  cycleSettings.hidden = !expanded;
  document.getElementById("cycle-fold-label").textContent = expanded ? "收合" : "展開";
});

document.querySelectorAll(".cycle-step").forEach((button) => {
  button.addEventListener("click", () => {
    const delta = Number(button.dataset.delta);
    if (button.dataset.cycle === "play") playBars = Math.max(1, Math.min(8, playBars + delta));
    else restBars = Math.max(1, Math.min(8, restBars + delta));
    currentCycleBar %= playBars + restBars;
    updateCycleControls();
  });
});

function scheduleClick(time, beat, shouldSound, barNumber, isRest, isAccent) {
  if (shouldSound) {
    const oscillator = metronomeContext.createOscillator();
    const gain = metronomeContext.createGain();
    oscillator.frequency.value = isAccent ? 1100 : 800;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(isAccent ? 0.7 : 0.42, time + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.055);
    oscillator.connect(gain);
    gain.connect(metronomeContext.destination);
    oscillator.start(time);
    oscillator.stop(time + 0.06);
  }
  const delay = Math.max(0, (time - metronomeContext.currentTime) * 1000);
  const timer = window.setTimeout(() => {
    visualTimers = visualTimers.filter((pending) => pending !== timer);
    if (beat === 0) {
      if (practiceCycleEnabled) {
        updateCycleStatus(isRest
          ? `休息中 · 第 ${barNumber} / ${playBars + restBars} 小節`
          : `播放中 · 第 ${barNumber} / ${playBars + restBars} 小節`);
      } else {
        updateCycleStatus(`持續播放 · 第 ${barNumber} 小節`);
      }
    }
    beatVisualizer.classList.toggle("resting", isRest);
    beatVisualizer.querySelectorAll(".beat-light").forEach((dot) => dot.classList.remove("active"));
    beatVisualizer.children[beat]?.classList.add("active");
    const resetTimer = window.setTimeout(() => {
      visualTimers = visualTimers.filter((pending) => pending !== resetTimer);
      beatVisualizer.children[beat]?.classList.remove("active");
    }, 130);
    visualTimers.push(resetTimer);
  }, delay);
  visualTimers.push(timer);
}

function scheduleMetronome() {
  while (nextBeatTime < metronomeContext.currentTime + 0.1) {
    const cycleBar = currentCycleBar;
    const isRest = practiceCycleEnabled && cycleBar >= playBars;
    const shouldSound = !isRest;
    const barNumber = practiceCycleEnabled ? cycleBar + 1 : totalBars + 1;
    const isAccent = meter === "6/8" ? currentBeat === 0 || currentBeat === 3 : currentBeat === 0;
    scheduleClick(nextBeatTime, currentBeat, shouldSound, barNumber, isRest, isAccent);
    nextBeatTime += meter === "6/8" ? 20 / bpm : 60 / bpm;
    currentBeat = (currentBeat + 1) % beatsPerBar;
    if (currentBeat === 0) {
      totalBars += 1;
      currentCycleBar = (currentCycleBar + 1) % (playBars + restBars);
    }
  }
}

async function stopMetronome() {
  isPlaying = false;
  window.clearInterval(scheduler);
  visualTimers.forEach((timer) => window.clearTimeout(timer));
  visualTimers = [];
  if (metronomeContext) {
    await metronomeContext.close();
    metronomeContext = null;
  }
  currentBeat = 0;
  currentCycleBar = 0;
  totalBars = 0;
  beatVisualizer.classList.remove("resting");
  beatVisualizer.querySelectorAll(".beat-light").forEach((dot) => dot.classList.remove("active"));
  playLabel.textContent = "開始節拍";
  document.getElementById("play-icon").textContent = "▶";
  updateCycleControls();
}

playButton.addEventListener("click", async () => {
  if (isPlaying) {
    await stopMetronome();
    return;
  }
  metronomeContext = new (window.AudioContext || window.webkitAudioContext)();
  await metronomeContext.resume();
  isPlaying = true;
  currentBeat = 0;
  currentCycleBar = 0;
  totalBars = 0;
  nextBeatTime = metronomeContext.currentTime + 0.05;
  scheduleMetronome();
  scheduler = window.setInterval(scheduleMetronome, 25);
  playLabel.textContent = "停止節拍";
  document.getElementById("play-icon").textContent = "■";
  updateCycleControls();
});

document.getElementById("tap-button").addEventListener("click", () => {
  const time = performance.now();
  tapTimes = tapTimes.filter((tap) => time - tap < 2500);
  tapTimes.push(time);
  if (tapTimes.length >= 2) {
    const intervals = tapTimes.slice(1).map((tap, index) => tap - tapTimes[index]);
    const average = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    setBpm(60000 / average);
  }
});

// Fretboard trainer
const strings = [
  { name: "e", midi: 64 },
  { name: "B", midi: 59 },
  { name: "G", midi: 55 },
  { name: "D", midi: 50 },
  { name: "A", midi: 45 },
  { name: "E", midi: 40 },
];
const fretboard = document.getElementById("fretboard");
const fretNumbers = document.getElementById("fret-numbers");
const targetNoteElement = document.getElementById("target-note");
const feedback = document.getElementById("answer-feedback");
let targetNote = 0;
let score = 0;
let streak = 0;
let answered = false;

function buildFretboard() {
  strings.forEach((string) => {
    const row = document.createElement("div");
    row.className = "fret-row";
    const label = document.createElement("div");
    label.className = "string-name-cell";
    label.textContent = string.name;
    row.append(label);
    for (let fret = 0; fret <= 12; fret += 1) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = `fret-cell${fret === 0 ? " open-fret" : ""}`;
      cell.setAttribute("aria-label", `${string.name} 弦第 ${fret} 格，${noteNames[(string.midi + fret) % 12]}`);
      cell.dataset.note = String((string.midi + fret) % 12);
      cell.dataset.string = string.name;
      cell.dataset.fret = String(fret);
      if (fret === 0) {
        const openDot = document.createElement("span");
        openDot.className = "open-dot";
        cell.append(openDot);
      }
      row.append(cell);
    }
    fretboard.append(row);
  });
  fretNumbers.innerHTML = "<span></span>" + Array.from({ length: 13 }, (_, fret) => `<span>${fret}</span>`).join("");
}

function newQuestion() {
  targetNote = Math.floor(Math.random() * noteNames.length);
  targetNoteElement.textContent = noteNames[targetNote];
  answered = false;
  feedback.className = "answer-feedback";
  feedback.textContent = "選擇一個音格開始作答";
  fretboard.querySelectorAll(".fret-cell").forEach((cell) => cell.classList.remove("marked", "correct", "wrong"));
}

fretboard.addEventListener("click", (event) => {
  const cell = event.target.closest(".fret-cell");
  if (!cell || answered) return;
  cell.classList.add("marked");
  if (Number(cell.dataset.note) === targetNote) {
    answered = true;
    score += 1;
    streak += 1;
    document.getElementById("score-value").textContent = score;
    document.getElementById("streak-value").textContent = streak;
    cell.classList.add("correct");
    feedback.className = "answer-feedback success";
    feedback.textContent = `答對了！${cell.dataset.string} 弦第 ${cell.dataset.fret} 格是 ${noteNames[targetNote]}。繼續保持！`;
    window.setTimeout(newQuestion, 1100);
  } else {
    streak = 0;
    document.getElementById("streak-value").textContent = streak;
    cell.classList.add("wrong");
    feedback.className = "answer-feedback error";
    feedback.textContent = "還差一點，再試試其他音格。";
  }
});

document.getElementById("new-question").addEventListener("click", newQuestion);
buildFretboard();
newQuestion();
updateBeatDots();
setBpm(bpm);
updateCycleControls();
