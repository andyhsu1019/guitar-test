const navItems = document.querySelectorAll(".nav-item");
const views = document.querySelectorAll(".view");
const breadcrumb = document.getElementById("crumb-current");
const titles = { tuner: "調音器", metronome: "節拍器", training: "指板訓練" };

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    const selected = item.dataset.view;
    if (selected !== "training" && (trainerMicStream || trainerMicStarting)) stopTrainerMicrophone();
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
const tuningDataButton = document.getElementById("tuning-data-button");
const tuningDataButtonLabel = document.getElementById("tuning-data-button-label");
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
tuningDataButton.addEventListener("click", () => {
  setTuningPanelExpanded(tuningDataButton.getAttribute("aria-expanded") !== "true");
});

function setTuningPanelExpanded(expanded) {
  tuningDataButton.setAttribute("aria-expanded", String(expanded));
  tuningDataButtonLabel.textContent = expanded ? "收合調弦資料" : "調弦資料";
  tuningDetails.hidden = !expanded;
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

function detectPitch(buffer, sampleRate, maxFrequency = 400) {
  let rms = 0;
  for (let i = 0; i < buffer.length; i += 1) rms += buffer[i] * buffer[i];
  rms = Math.sqrt(rms / buffer.length);
  if (rms < 0.001) return { frequency: null, rms };

  const samples = new Float32Array(Math.floor(buffer.length / 2));
  for (let i = 0; i < samples.length; i += 1) {
    samples[i] = (buffer[i * 2] + buffer[i * 2 + 1]) / 2;
  }
  const size = samples.length;
  const effectiveSampleRate = sampleRate / 2;
  const minOffset = Math.max(2, Math.floor(effectiveSampleRate / maxFrequency));
  const maxOffset = Math.min(size - 2, Math.ceil(effectiveSampleRate / 40));
  const differences = new Float32Array(maxOffset + 1);
  let differenceSum = 0;
  for (let offset = 1; offset <= maxOffset; offset += 1) {
    let difference = 0;
    for (let i = 0; i < size - offset; i += 1) {
      const delta = samples[i] - samples[i + offset];
      difference += delta * delta;
    }
    differenceSum += difference;
    differences[offset] = differenceSum ? (difference * offset) / differenceSum : 1;
  }
  let bestOffset = -1;
  for (let offset = minOffset; offset <= maxOffset; offset += 1) {
    if (differences[offset] < 0.18) {
      while (offset < maxOffset && differences[offset + 1] < differences[offset]) offset += 1;
      bestOffset = offset;
      break;
    }
  }
  if (bestOffset <= 0) return { frequency: null, rms };
  const before = differences[bestOffset - 1] || differences[bestOffset];
  const after = differences[bestOffset + 1] || differences[bestOffset];
  const curve = before - 2 * differences[bestOffset] + after;
  const adjustment = curve ? (before - after) / (2 * curve) : 0;
  const period = bestOffset + adjustment;
  const frequency = effectiveSampleRate / period;
  return { frequency: frequency >= 40 && frequency <= maxFrequency ? frequency : null, rms };
}

function updateTuner() {
  if (!analyser) return;
  const samples = new Float32Array(analyser.fftSize);
  analyser.getFloatTimeDomainData(samples);
  const result = detectPitch(samples, audioContext.sampleRate);
  const frequency = result.frequency;
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
    if (micStatus.textContent !== "已收到聲音，請一次撥動一根弦。") {
      micStatus.textContent = "已收到聲音，請一次撥動一根弦。";
    }
  } else {
    const status = result.rms >= 0.001
      ? "已收到聲音但無法辨識音高，請單獨撥動一根弦並靠近麥克風。"
      : "正在聆聽，請靠近麥克風單獨撥動一根弦。";
    if (micStatus.textContent !== status) micStatus.textContent = status;
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
    micButton.innerHTML = '<span class="mic-icon">◉</span> 開始調音';
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
    micStatus.textContent = window.isSecureContext
      ? "此瀏覽器不支援麥克風，請改用最新版 Safari、Chrome 或 Edge。"
      : "瀏覽器基於安全性限制無法使用麥克風，請透過 HTTPS 開啟此頁面。";
    return;
  }
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextConstructor) {
    micStatus.textContent = "此瀏覽器不支援音訊分析，請改用最新版 Safari、Chrome 或 Edge。";
    return;
  }
  micButton.disabled = true;
  micStatus.textContent = "正在連接麥克風…";
  try {
    audioContext = new AudioContextConstructor();
    const [streamResult, resumeResult] = await Promise.allSettled([
      navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }),
      audioContext.resume(),
    ]);
    if (streamResult.status === "rejected") throw streamResult.reason;
    micStream = streamResult.value;
    if (resumeResult.status === "rejected") throw resumeResult.reason;
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 4096;
    microphone = audioContext.createMediaStreamSource(micStream);
    microphone.connect(analyser);
    micButton.innerHTML = '<span class="mic-icon">■</span> 停止調音';
    micStatus.textContent = "正在聆聽，請靠近麥克風單獨撥動一根弦。";
    updateTuner();
  } catch (error) {
    if (micStream) micStream.getTracks().forEach((track) => track.stop());
    micStream = null;
    analyser = null;
    microphone = null;
    if (audioContext) {
      await audioContext.close();
      audioContext = null;
    }
    micStatus.textContent = error.name === "NotAllowedError" || error.name === "SecurityError"
      ? "麥克風權限遭拒，請在瀏覽器或系統設定允許此網站使用麥克風後重試。"
      : error.name === "NotFoundError"
        ? "找不到可用的麥克風，請確認裝置已連接。"
        : error.name === "NotReadableError"
          ? "無法讀取麥克風，請確認沒有其他程式正在使用，並檢查系統的麥克風權限。"
          : "無法啟動麥克風或音訊分析，請確認權限後重試。";
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
let beatPattern = [];
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
    const dot = document.createElement("button");
    const state = beatPattern[i];
    dot.type = "button";
    dot.dataset.beat = String(i);
    dot.className = `beat-light${state === "accent" ? " accent" : ""}${state === "silent" ? " silent" : ""}`;
    dot.textContent = String(i + 1);
    dot.setAttribute("aria-label", getBeatLabel(i, state));
    dot.setAttribute("aria-pressed", String(state !== "normal"));
    beatVisualizer.append(dot);
  }
}

function getBeatLabel(beat, state) {
  const stateLabel = state === "accent" ? "重拍" : state === "silent" ? "不發聲" : "一般";
  return `第 ${beat + 1} 拍：${stateLabel}，點擊切換`;
}

function setDefaultBeatPattern() {
  beatPattern = Array.from({ length: beatsPerBar }, (_, index) => (
    index === 0 || (meter === "6/8" && index === 3) ? "accent" : "normal"
  ));
}

beatVisualizer.addEventListener("click", (event) => {
  const beatButton = event.target.closest(".beat-light");
  if (!beatButton) return;
  const beat = Number(beatButton.dataset.beat);
  const states = ["normal", "accent", "silent"];
  const currentStateIndex = states.indexOf(beatPattern[beat]);
  beatPattern[beat] = states[(currentStateIndex + 1) % states.length];
  updateBeatDots();
});

document.getElementById("bpm-down").addEventListener("click", () => setBpm(bpm - 1));
document.getElementById("bpm-up").addEventListener("click", () => setBpm(bpm + 1));
tempoSlider.addEventListener("input", () => setBpm(tempoSlider.value));
beatOptions.addEventListener("click", (event) => {
  const option = event.target.closest("[data-meter]");
  if (!option) return;
  if (meter === option.dataset.meter) return;
  meter = option.dataset.meter;
  beatsPerBar = meter === "6/8" ? 6 : Number(meter.split("/")[0]);
  document.getElementById("tempo-unit-label").textContent = meter === "6/8"
    ? "BPM · 附點四分音符"
    : "BPM · 四分音符";
  beatOptions.querySelectorAll("button").forEach((button) => button.classList.toggle("selected", button === option));
  setDefaultBeatPattern();
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
    const beatState = beatPattern[currentBeat];
    scheduleClick(nextBeatTime, currentBeat, shouldSound && beatState !== "silent", barNumber, isRest, beatState === "accent");
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
const questionLabel = document.getElementById("question-label");
const questionLead = document.getElementById("question-lead");
const questionSuffix = document.getElementById("question-suffix");
const feedback = document.getElementById("answer-feedback");
const trainerMicButton = document.getElementById("trainer-mic-button");
const trainerMicStatus = document.getElementById("trainer-mic-status");
const chordAnswerControls = document.getElementById("chord-answer-controls");
const trainerChordTypes = [
  { suffix: "", label: "大三和弦", intervals: [0, 4, 7] },
  { suffix: "m", label: "小三和弦", intervals: [0, 3, 7] },
  { suffix: "dim", label: "減三和弦", intervals: [0, 3, 6] },
  { suffix: "dim7", label: "減七和弦", intervals: [0, 3, 6, 9] },
  { suffix: "aug", label: "增三和弦", intervals: [0, 4, 8] },
  { suffix: "5", label: "強力和弦", intervals: [0, 7] },
  { suffix: "sus2", label: "掛二和弦", intervals: [0, 2, 7] },
  { suffix: "sus4", label: "掛四和弦", intervals: [0, 5, 7] },
  { suffix: "6", label: "六和弦", intervals: [0, 4, 7, 9] },
  { suffix: "m6", label: "小六和弦", intervals: [0, 3, 7, 9] },
  { suffix: "7", label: "屬七和弦", intervals: [0, 4, 7, 10] },
  { suffix: "maj7", label: "大七和弦", intervals: [0, 4, 7, 11] },
  { suffix: "m7", label: "小七和弦", intervals: [0, 3, 7, 10] },
  { suffix: "m7b5", label: "半減七和弦", intervals: [0, 3, 6, 10] },
  { suffix: "mMaj7", label: "小大七和弦", intervals: [0, 3, 7, 11] },
  { suffix: "7b5", label: "屬七降五和弦", intervals: [0, 4, 6, 10] },
  { suffix: "7#5", label: "屬七升五和弦", intervals: [0, 4, 8, 10] },
  { suffix: "7sus2", label: "掛二屬七和弦", intervals: [0, 2, 7, 10] },
  { suffix: "7sus4", label: "掛四屬七和弦", intervals: [0, 5, 7, 10] },
  { suffix: "add9", label: "加九和弦", intervals: [0, 2, 4, 7] },
  { suffix: "madd9", label: "小加九和弦", intervals: [0, 2, 3, 7] },
  { suffix: "6/9", label: "六九和弦", intervals: [0, 2, 4, 7, 9] },
  { suffix: "9", label: "屬九和弦", intervals: [0, 2, 4, 7, 10] },
  { suffix: "maj9", label: "大九和弦", intervals: [0, 2, 4, 7, 11] },
  { suffix: "m9", label: "小九和弦", intervals: [0, 2, 3, 7, 10] },
  { suffix: "7b9", label: "屬七降九和弦", intervals: [0, 1, 4, 7, 10] },
  { suffix: "7#9", label: "屬七升九和弦", intervals: [0, 3, 4, 7, 10] },
  { suffix: "9sus4", label: "掛四屬九和弦", intervals: [0, 2, 5, 7, 10] },
  { suffix: "11", label: "屬十一和弦", intervals: [0, 2, 4, 5, 7, 10] },
  { suffix: "m11", label: "小十一和弦", intervals: [0, 2, 3, 5, 7, 10] },
  { suffix: "13", label: "屬十三和弦", intervals: [0, 2, 4, 5, 7, 9, 10] },
];
const chordRoots = noteNames.map((_, index) => index);
let targetNote = 0;
let targetString = strings[0];
let trainerMode = "position";
let targetChord;
let score = 0;
let streak = 0;
let answered = false;
let trainerAudioContext;
let trainerAnalyser;
let trainerMicrophone;
let trainerMicStream;
let trainerMicFrame;
let trainerCandidateNote = -1;
let trainerCandidateFrames = 0;
let trainerSilenceFrames = 0;
let trainerPitchLatched = false;
let trainerMicStarting = false;
let trainerMicRequestId = 0;

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
      cell.dataset.midi = String(string.midi + fret);
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

function clearFretboardMarks() {
  fretboard.querySelectorAll(".fret-cell").forEach((cell) => {
    cell.classList.remove("marked", "correct", "wrong", "selected");
    cell.setAttribute("aria-pressed", "false");
  });
}

function formatChord(chord) {
  return `${noteNames[chord.root]}${chord.type.suffix}`;
}

function buildChordBank() {
  return chordRoots.flatMap((root) => trainerChordTypes.map((type) => ({
    root,
    type,
    notes: type.intervals.map((interval) => (root + interval) % 12),
  })));
}
const trainerChordBank = buildChordBank();
const trainerChordTemplates = trainerChordBank.reduce((templates, chord) => {
  const key = [...chord.notes].sort((a, b) => a - b).join(",");
  if (!templates.some((template) => template.key === key)) templates.push({ key, chord });
  return templates;
}, []);

function setTrainerMode(mode) {
  trainerMode = mode;
  document.querySelectorAll(".trainer-mode-button").forEach((button) => {
    const selected = button.dataset.trainerMode === mode;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  chordAnswerControls.hidden = mode !== "chord";
  newQuestion();
}

document.querySelectorAll(".trainer-mode-button").forEach((button) => {
  button.addEventListener("click", () => setTrainerMode(button.dataset.trainerMode));
});

function newQuestion() {
  answered = false;
  feedback.className = "answer-feedback";
  clearFretboardMarks();
  trainerCandidateNote = -1;
  trainerCandidateFrames = 0;
  trainerSilenceFrames = 0;
  trainerPitchLatched = false;

  if (trainerMode !== "chord") {
    targetNote = Math.floor(Math.random() * noteNames.length);
    if (trainerMode === "position") {
      targetString = strings[Math.floor(Math.random() * strings.length)];
      console.log("Position Mode - New Question:", { targetNote: noteNames[targetNote], targetString: targetString.name });
      questionLabel.textContent = "指定弦找音";
      questionLead.textContent = `請在 ${targetString.name} 弦找出`;
    } else {
      targetString = null;
      console.log("AllNotes Mode - New Question:", { targetNote: noteNames[targetNote] });
      questionLabel.textContent = "全指板找音";
      questionLead.textContent = "請在指板上找出";
    }
    targetNoteElement.textContent = noteNames[targetNote];
    questionSuffix.textContent = "音";
    feedback.textContent = trainerMode === "position"
      ? "點選指定弦上的音格，或彈出該音作答"
      : "點選任何弦上的正確音格，或彈出該音作答";
    trainerMicStatus.textContent = trainerMode === "position"
      ? "麥克風能辨識音高；要練指定弦請點選指板作答。"
      : "直接彈奏目標音，或在指板上找到任一正確位置。";
  } else {
    targetChord = trainerChordBank[Math.floor(Math.random() * trainerChordBank.length)];
    questionLabel.textContent = "和弦指型";
    questionLead.textContent = "請彈出";
    targetNoteElement.textContent = formatChord(targetChord);
    questionSuffix.textContent = "和弦";
    feedback.textContent = "在指板選出和弦音後確認，或用吉他彈出整個和弦";
    trainerMicStatus.textContent = "麥克風作答請一次刷響和弦中的多條弦。";
  }
}

function recordTrainerAnswer(isCorrect, message, cell = null) {
  if (answered) return;
  if (isCorrect) {
    answered = true;
    score += 1;
    streak += 1;
    document.getElementById("score-value").textContent = score;
    document.getElementById("streak-value").textContent = streak;
    feedback.className = "answer-feedback success";
    if (cell) cell.classList.add("correct");
    feedback.textContent = message;
    window.setTimeout(newQuestion, 1100);
    return;
  }

  streak = 0;
  document.getElementById("streak-value").textContent = streak;
  feedback.className = "answer-feedback error";
  if (cell) cell.classList.add("wrong");
  feedback.textContent = message;
}

function submitTrainerNote(note, cell = null, fromMicrophone = false) {
  console.log("Debug:", { note, targetNote, trainerMode, string: cell?.dataset.string, targetString: targetString?.name });
  const correct = note === targetNote
    && (trainerMode === "allNotes" || fromMicrophone || !cell || cell.dataset.string === targetString.name);
  const message = correct
    ? fromMicrophone
      ? `答對了！聽到 ${noteNames[note]} 音。繼續保持！`
      : `答對了！${cell.dataset.string} 弦上的 ${noteNames[targetNote]} 音。繼續保持！`
    : fromMicrophone
      ? `聽到 ${noteNames[note]} 音，目標是 ${noteNames[targetNote]}。請停止音符後再試。`
      : trainerMode === "position"
        ? `請在 ${targetString.name} 弦找出 ${noteNames[targetNote]} 音。`
        : `請在指板任一位置找出 ${noteNames[targetNote]} 音。`;
  recordTrainerAnswer(correct, message, cell);
}

function toggleChordCell(cell) {
  fretboard.querySelectorAll(".fret-cell.wrong").forEach((markedCell) => markedCell.classList.remove("wrong"));
  const sameStringSelection = fretboard.querySelector(`.fret-cell.selected[data-string="${cell.dataset.string}"]`);
  if (sameStringSelection === cell) {
    cell.classList.remove("selected", "marked");
    cell.setAttribute("aria-pressed", "false");
  } else {
    if (sameStringSelection) {
      sameStringSelection.classList.remove("selected", "marked");
      sameStringSelection.setAttribute("aria-pressed", "false");
    }
    cell.classList.add("selected", "marked");
    cell.classList.remove("wrong");
    cell.setAttribute("aria-pressed", "true");
  }
}

function checkChordSelection() {
  if (answered) return;
  const selected = [...fretboard.querySelectorAll(".fret-cell.selected")];
  const selectedNotes = new Set(selected.map((cell) => Number(cell.dataset.note)));
  const chordNotes = new Set(targetChord.notes);
  const correct = selectedNotes.size === chordNotes.size
    && [...chordNotes].every((note) => selectedNotes.has(note));
  if (correct) {
    selected.forEach((cell) => cell.classList.add("correct"));
    recordTrainerAnswer(true, `答對了！這是 ${formatChord(targetChord)} 和弦。`, selected[0]);
  } else {
    selected.forEach((cell) => cell.classList.add("wrong"));
    const missing = [...chordNotes].filter((note) => !selectedNotes.has(note)).map((note) => noteNames[note]);
    const extra = [...selectedNotes].filter((note) => !chordNotes.has(note)).map((note) => noteNames[note]);
    const hint = missing.length ? `還缺 ${missing.join("、")} 音` : `多選了 ${extra.join("、")} 音`;
    recordTrainerAnswer(false, `還不是 ${formatChord(targetChord)}：${hint}。調整指板上的選擇後再確認。`);
  }
}

fretboard.addEventListener("click", (event) => {
  const cell = event.target.closest(".fret-cell");
  if (!cell || answered) return;
  if (trainerMode === "chord") {
    toggleChordCell(cell);
    return;
  }
  submitTrainerNote(Number(cell.dataset.note), cell);
});

document.getElementById("clear-chord-selection").addEventListener("click", () => {
  if (answered) return;
  fretboard.querySelectorAll(".fret-cell.selected").forEach((cell) => {
    cell.classList.remove("selected", "marked", "wrong");
    cell.setAttribute("aria-pressed", "false");
  });
  feedback.className = "answer-feedback";
  feedback.textContent = "已清除選擇，重新組成和弦再確認";
});
document.getElementById("check-chord-answer").addEventListener("click", checkChordSelection);

function detectTrainerChord() {
  const spectrum = new Float32Array(trainerAnalyser.frequencyBinCount);
  trainerAnalyser.getFloatFrequencyData(spectrum);
  let maxDecibels = -Infinity;
  for (const value of spectrum) {
    if (Number.isFinite(value)) maxDecibels = Math.max(maxDecibels, value);
  }
  if (maxDecibels < -70) return null;

  const strengths = new Float64Array(12);
  const binHz = trainerAudioContext.sampleRate / trainerAnalyser.fftSize;
  for (let bin = 2; bin < spectrum.length - 1; bin += 1) {
    const decibels = spectrum[bin];
    if (!Number.isFinite(decibels) || decibels < maxDecibels - 36
      || decibels < spectrum[bin - 1] || decibels <= spectrum[bin + 1]) continue;
    const frequency = bin * binHz;
    if (frequency < 65 || frequency > 1200) continue;
    const midi = Math.round(69 + 12 * Math.log2(frequency / 440));
    if (Math.abs(1200 * Math.log2(frequency / (440 * (2 ** ((midi - 69) / 12))))) > 45) continue;
    const note = ((midi % 12) + 12) % 12;
    const amplitude = 10 ** ((decibels - maxDecibels) / 20);
    strengths[note] = Math.max(strengths[note], amplitude);
  }

  const norm = Math.sqrt(strengths.reduce((sum, value) => sum + value * value, 0));
  const peak = Math.max(...strengths);
  if (!norm || peak < 0.12) return null;

  let bestChord = null;
  let bestScore = -1;
  let secondScore = -1;
  for (const template of trainerChordTemplates) {
    const chord = template.chord;
    const score = chord.notes.reduce((sum, note) => sum + strengths[note], 0)
      / (Math.sqrt(chord.notes.length) * norm);
    const allNotesPresent = chord.notes.every((note) => strengths[note] >= peak * 0.12);
    if (!allNotesPresent) continue;
    if (score > bestScore) {
      secondScore = bestScore;
      bestScore = score;
      bestChord = chord;
    } else if (score > secondScore) {
      secondScore = score;
    }
  }
  if (!bestChord || bestScore < 0.62 || (secondScore >= 0 && bestScore - secondScore < 0.035)) return null;
  return bestChord;
}

function updateTrainerPitch() {
  if (!trainerAnalyser) return;
  if (trainerMode === "chord") {
    const chord = detectTrainerChord();
    if (!chord) {
      trainerSilenceFrames += 1;
      if (trainerSilenceFrames >= 8) {
        trainerCandidateNote = -1;
        trainerCandidateFrames = 0;
        trainerPitchLatched = false;
        trainerMicStatus.textContent = "正在聆聽，請同時彈響和弦中的多條弦。";
      }
    } else {
      trainerSilenceFrames = 0;
      const chordName = formatChord(chord);
      const candidate = trainerChordTemplates.findIndex((template) => template.key === [...chord.notes].sort((a, b) => a - b).join(","));
      if (candidate === trainerCandidateNote) trainerCandidateFrames += 1;
      else {
        trainerCandidateNote = candidate;
        trainerCandidateFrames = 1;
      }
      if (trainerPitchLatched) {
        trainerMicStatus.textContent = `已聽到 ${chordName}，請停止後再彈下一個和弦。`;
      } else if (trainerCandidateFrames >= 4) {
        trainerPitchLatched = true;
        trainerMicStatus.textContent = `辨識到 ${chordName}。`;
        const isTargetChord = chord.notes.length === targetChord.notes.length
          && chord.notes.every((note) => targetChord.notes.includes(note));
        recordTrainerAnswer(isTargetChord, isTargetChord
          ? `答對了！聽到 ${chordName} 和弦。`
          : `聽到 ${chordName} 和弦，目標是 ${formatChord(targetChord)}。`);
      } else {
        trainerMicStatus.textContent = `正在辨識 ${chordName}…`;
      }
    }
    trainerMicFrame = requestAnimationFrame(updateTrainerPitch);
    return;
  }

  const samples = new Float32Array(trainerAnalyser.fftSize);
  trainerAnalyser.getFloatTimeDomainData(samples);
  const result = detectPitch(samples, trainerAudioContext.sampleRate, 800);

  if (!result.frequency) {
    trainerSilenceFrames += 1;
    if (trainerSilenceFrames >= 8) {
      trainerCandidateNote = -1;
      trainerCandidateFrames = 0;
      trainerPitchLatched = false;
      trainerMicStatus.textContent = "正在聆聽，請單獨彈奏一個音。";
    }
  } else {
    trainerSilenceFrames = 0;
    const midi = Math.round(69 + 12 * Math.log2(result.frequency / 440));
    const note = ((midi % 12) + 12) % 12;
    if (note === trainerCandidateNote) {
      trainerCandidateFrames += 1;
    } else {
      trainerCandidateNote = note;
      trainerCandidateFrames = 1;
    }

    if (trainerPitchLatched) {
      trainerMicStatus.textContent = `已聽到 ${noteNames[note]} 音，請停止音符後再彈下一個。`;
    } else if (trainerCandidateFrames >= 3) {
      trainerPitchLatched = true;
      trainerMicStatus.textContent = `辨識到 ${noteNames[note]} 音。`;
      submitTrainerNote(note, null, true);
    } else {
      trainerMicStatus.textContent = `正在辨識 ${noteNames[note]} 音…`;
    }
  }

  trainerMicFrame = requestAnimationFrame(updateTrainerPitch);
}

async function stopTrainerMicrophone() {
  trainerMicRequestId += 1;
  trainerMicStarting = false;
  if (trainerMicFrame) cancelAnimationFrame(trainerMicFrame);
  trainerMicFrame = null;
  if (trainerMicStream) trainerMicStream.getTracks().forEach((track) => track.stop());
  trainerMicStream = null;
  trainerAnalyser = null;
  if (trainerMicrophone) trainerMicrophone.disconnect();
  trainerMicrophone = null;
  const context = trainerAudioContext;
  trainerAudioContext = null;
  trainerMicButton.disabled = true;
  try {
    if (context && context.state !== "closed") await context.close();
    trainerMicButton.innerHTML = '<span class="mic-icon">◉</span> 麥克風作答';
    trainerMicStatus.textContent = "麥克風已關閉。";
  } catch (error) {
    trainerMicStatus.textContent = "關閉麥克風時發生錯誤，請重新整理頁面後再試。";
    console.error("Unable to close trainer microphone", error);
  } finally {
    trainerMicButton.disabled = false;
  }
}

trainerMicButton.addEventListener("click", async () => {
  if (trainerMicStream) {
    await stopTrainerMicrophone();
    return;
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    trainerMicStatus.textContent = window.isSecureContext
      ? "此瀏覽器不支援麥克風，請改用最新版 Safari、Chrome 或 Edge。"
      : "麥克風需要安全連線，請透過 HTTPS 或 localhost 開啟此頁面。";
    return;
  }
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextConstructor) {
    trainerMicStatus.textContent = "此瀏覽器不支援音訊分析，請改用最新版 Safari、Chrome 或 Edge。";
    return;
  }

  const requestId = ++trainerMicRequestId;
  trainerMicStarting = true;
  trainerMicButton.disabled = true;
  trainerMicStatus.textContent = "正在連接麥克風…";
  let context;
  try {
    context = new AudioContextConstructor();
    trainerAudioContext = context;
    const [streamResult, resumeResult] = await Promise.allSettled([
      navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }),
      context.resume(),
    ]);
    if (requestId !== trainerMicRequestId) {
      if (streamResult.status === "fulfilled") streamResult.value.getTracks().forEach((track) => track.stop());
      if (context.state !== "closed") await context.close();
      if (trainerAudioContext === context) trainerAudioContext = null;
      return;
    }
    if (streamResult.status === "rejected") throw streamResult.reason;
    trainerMicStream = streamResult.value;
    if (resumeResult.status === "rejected") throw resumeResult.reason;

    trainerAnalyser = context.createAnalyser();
    trainerAnalyser.fftSize = 8192;
    trainerMicrophone = context.createMediaStreamSource(trainerMicStream);
    trainerMicrophone.connect(trainerAnalyser);
    trainerCandidateNote = -1;
    trainerCandidateFrames = 0;
    trainerSilenceFrames = 0;
    trainerPitchLatched = false;
    trainerMicButton.innerHTML = '<span class="mic-icon">■</span> 停止收音';
    trainerMicStatus.textContent = "正在聆聽，請單獨彈奏一個音。";
    updateTrainerPitch();
  } catch (error) {
    if (requestId !== trainerMicRequestId) return;
    if (trainerMicStream) trainerMicStream.getTracks().forEach((track) => track.stop());
    trainerMicStream = null;
    trainerAnalyser = null;
    if (trainerMicrophone) trainerMicrophone.disconnect();
    trainerMicrophone = null;
    if (trainerAudioContext && trainerAudioContext.state !== "closed") {
      try {
        await trainerAudioContext.close();
      } catch (closeError) {
        console.error("Unable to clean up trainer audio context", closeError);
      }
    }
    trainerAudioContext = null;
    trainerMicStatus.textContent = error.name === "NotAllowedError" || error.name === "SecurityError"
      ? "麥克風權限遭拒，請在瀏覽器或系統設定允許此網站使用麥克風後重試。"
      : error.name === "NotFoundError"
        ? "找不到可用的麥克風，請確認裝置已連接。"
        : error.name === "NotReadableError"
          ? "無法讀取麥克風，請確認裝置與系統權限後重試。"
          : "無法啟動麥克風或音訊分析，請確認權限後重試。";
  } finally {
    if (requestId === trainerMicRequestId) {
      trainerMicStarting = false;
      trainerMicButton.disabled = false;
    }
  }
});

document.getElementById("new-question").addEventListener("click", newQuestion);
buildFretboard();
newQuestion();
setDefaultBeatPattern();
updateBeatDots();
setBpm(bpm);
updateCycleControls();
