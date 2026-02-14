const triggerBtn = document.getElementById('triggerBtn');
const gestureBtn = document.getElementById('gestureBtn');
const voiceBtn = document.getElementById('voiceBtn');
const clipBtn = document.getElementById('clipBtn');
const joinBtn = document.getElementById('joinBtn');
const modeButtons = [...document.querySelectorAll('.mode')];
const worldItems = [...document.querySelectorAll('.item')];

const comboProgress = document.getElementById('comboProgress');
const comboText = document.getElementById('comboText');
const reactionFeed = document.getElementById('reactionFeed');
const voiceStatus = document.getElementById('voiceStatus');
const modeStatus = document.getElementById('modeStatus');
const playersStatus = document.getElementById('playersStatus');
const sparkScore = document.getElementById('sparkScore');
const boomScore = document.getElementById('boomScore');
const clipStatus = document.getElementById('clipStatus');

const popTemplate = document.getElementById('popTemplate');

const state = {
  combo: 0,
  players: 1,
  mode: 'Co-op Quest',
  spark: 0,
  boom: 0,
  lastTriggerAt: 0,
  recognition: null,
  listening: false
};

const reactions = [
  'Bridge rises and wobble-jumps into place!',
  'Loot cloud explodes in candy coins!',
  'Portal opens and silly ducks rain out!',
  'NPC dance squad launches turbo shuffle!',
  'Platforms spin like pancakes of destiny!'
];

function updateScores(points = 10) {
  if (Math.random() > 0.5) {
    state.spark += points;
    sparkScore.textContent = state.spark;
  } else {
    state.boom += points;
    boomScore.textContent = state.boom;
  }
}

function updateCombo(isRhythmPerfect = false) {
  const now = Date.now();
  const delta = now - state.lastTriggerAt;
  state.lastTriggerAt = now;

  if (delta > 0 && delta < 1300) {
    state.combo += isRhythmPerfect ? 2 : 1;
  } else {
    state.combo = 1;
  }

  state.combo = Math.min(state.combo, 10);
  comboProgress.value = state.combo;

  if (state.combo >= 10) {
    comboText.textContent = '🔥 MAX COMBO! Remix clip unlocked!';
  } else if (state.combo >= 8) {
    comboText.textContent = '🦄 Neon Unicorn Skin unlocked!';
  } else if (state.combo >= 3) {
    comboText.textContent = '🎉 Party Confetti unlocked! Keep chaining!';
  } else {
    comboText.textContent = 'Nice! Chain your next 6-7 quickly!';
  }
}

function pop67() {
  const pop = popTemplate.content.firstElementChild.cloneNode(true);
  pop.style.left = `${Math.random() * 88 + 6}%`;
  pop.style.top = `${Math.random() * 65 + 20}%`;
  document.body.appendChild(pop);
  setTimeout(() => pop.remove(), 900);
}

function shakeWorld() {
  worldItems.forEach((item, index) => {
    setTimeout(() => {
      item.classList.add('active');
      setTimeout(() => item.classList.remove('active'), 320);
    }, index * 65);
  });
}

function triggerSixSeven(source = 'tap') {
  updateCombo(source === 'voice');
  updateScores(8 + state.combo);
  shakeWorld();
  pop67();
  reactionFeed.textContent = `6-7 via ${source}: ${reactions[Math.floor(Math.random() * reactions.length)]}`;
}

function doGesture() {
  reactionFeed.textContent = '🙌 Scales gesture detected! Combo boost + social hype!';
  updateCombo(true);
  updateScores(15);
  pop67();
}

function trySetupVoice() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    voiceStatus.textContent = '🎙️ Voice: unavailable on this browser';
    return;
  }

  const recognition = new Recognition();
  recognition.continuous = true;
  recognition.lang = 'en-US';
  recognition.interimResults = true;

  recognition.onresult = (event) => {
    const text = [...event.results]
      .map((r) => r[0]?.transcript || '')
      .join(' ')
      .toLowerCase();

    if (text.includes('6-7') || text.includes('six seven') || text.includes('six-seven')) {
      triggerSixSeven('voice');
    }
  };

  recognition.onend = () => {
    if (state.listening) recognition.start();
  };

  state.recognition = recognition;
}

function toggleVoice() {
  if (!state.recognition) {
    trySetupVoice();
  }

  if (!state.recognition) return;

  if (!state.listening) {
    state.listening = true;
    state.recognition.start();
    voiceBtn.textContent = '🛑 Stop Voice';
    voiceStatus.textContent = '🎙️ Voice: listening for “6-7”';
  } else {
    state.listening = false;
    state.recognition.stop();
    voiceBtn.textContent = '🎤 Start Voice';
    voiceStatus.textContent = '🎙️ Voice: idle';
  }
}

function addPlayer() {
  state.players = Math.min(state.players + 1, 4);
  playersStatus.textContent = `Players: ${state.players}/4`;
}

function createClip() {
  if (state.combo < 3) {
    clipStatus.textContent = 'Need at least a 3x combo before clip remix unlocks!';
    return;
  }
  clipStatus.textContent = `📹 Clip created: "${state.mode} 6-7 Chaos Mix" with ${state.combo}x energy!`;
}

triggerBtn.addEventListener('click', () => triggerSixSeven('tap'));
gestureBtn.addEventListener('click', doGesture);
voiceBtn.addEventListener('click', toggleVoice);
joinBtn.addEventListener('click', addPlayer);
clipBtn.addEventListener('click', createClip);

modeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    modeButtons.forEach((b) => b.classList.remove('active'));
    button.classList.add('active');
    state.mode = button.dataset.mode;
    modeStatus.textContent = `Mode: ${state.mode}`;
    reactionFeed.textContent = `${state.mode} loaded — coordinate your 6-7 timing!`;
  });
});

trySetupVoice();
