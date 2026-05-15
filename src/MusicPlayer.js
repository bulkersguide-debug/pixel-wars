// src/MusicPlayer.js
// Dark ambient war soundtrack — generated with Web Audio API
// No audio files needed

let ctx = null;
let master = null;
let nodes = [];
let pulseGain = null;
let _playing = false;

const getCtx = () => {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
};

const makeReverb = (audioCtx, secs = 2.8) => {
  const c = audioCtx.createConvolver();
  const len = audioCtx.sampleRate * secs;
  const buf = audioCtx.createBuffer(2, len, audioCtx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
  }
  c.buffer = buf;
  return c;
};

const addDrone = (audioCtx, dest, freq, type, vol, filterHz, lfoRate, lfoDepth) => {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();
  const lfo = audioCtx.createOscillator();
  const lfoG = audioCtx.createGain();

  osc.type = type;
  osc.frequency.value = freq;
  osc.detune.value = (Math.random() - 0.5) * 8;
  filter.type = 'lowpass';
  filter.frequency.value = filterHz;
  filter.Q.value = 2.5;
  lfo.frequency.value = lfoRate;
  lfoG.gain.value = lfoDepth;
  gain.gain.value = vol;

  lfo.connect(lfoG);
  lfoG.connect(osc.frequency);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(dest);

  lfo.start();
  osc.start();
  nodes.push(osc, lfo, gain, filter, lfoG);
  return osc;
};

export function startMusic(vol = 0.12) {
  if (_playing) return;
  const audioCtx = getCtx();
  if (audioCtx.state === 'suspended') audioCtx.resume();

  master = audioCtx.createGain();
  master.gain.setValueAtTime(0, audioCtx.currentTime);
  master.gain.linearRampToValueAtTime(vol, audioCtx.currentTime + 4);

  const comp = audioCtx.createDynamicsCompressor();
  comp.threshold.value = -18;
  comp.ratio.value = 4;
  master.connect(comp);
  comp.connect(audioCtx.destination);

  const reverb = makeReverb(audioCtx);
  const reverbGain = audioCtx.createGain();
  reverbGain.gain.value = 0.25;
  master.connect(reverb);
  reverb.connect(reverbGain);
  reverbGain.connect(audioCtx.destination);

  // ── DARK BASS DRONES ─────────────────────────────────────────
  addDrone(audioCtx, master, 36.7,  'sawtooth',  0.45, 100, 0.08, 1.2);  // sub bass
  addDrone(audioCtx, master, 55.0,  'square',    0.20, 160, 0.12, 2.0);  // bass
  addDrone(audioCtx, master, 73.4,  'sawtooth',  0.12, 220, 0.06, 1.0);  // low mid

  // ── MID PADS ─────────────────────────────────────────────────
  addDrone(audioCtx, master, 110.0, 'sine',      0.18, 900, 0.09, 3.0);  // warm pad
  addDrone(audioCtx, master, 146.8, 'triangle',  0.10, 700, 0.14, 4.0);  // mid pad
  addDrone(audioCtx, master, 164.8, 'sine',      0.07, 600, 0.07, 2.5);  // harmony

  // ── HIGH SHIMMER ─────────────────────────────────────────────
  addDrone(audioCtx, master, 220.0, 'sine',      0.05, 1400, 0.18, 5.0); // shimmer
  addDrone(audioCtx, master, 293.7, 'sine',      0.03, 1200, 0.22, 4.0); // air

  // ── RHYTHMIC PULSE (subtle kick) ──────────────────────────────
  const pOsc = audioCtx.createOscillator();
  pOsc.type = 'sine';
  pOsc.frequency.value = 55;
  pulseGain = audioCtx.createGain();
  pulseGain.gain.value = 0;
  pOsc.connect(pulseGain);
  pulseGain.connect(master);
  pOsc.start();
  nodes.push(pOsc, pulseGain);

  const bpm = 68;
  const beat = 60 / bpm;
  let t = audioCtx.currentTime + 4; // wait for fade-in
  for (let i = 0; i < 300; i++) {
    const bt = t + i * beat;
    const isAccent = i % 4 === 0;
    pulseGain.gain.setValueAtTime(isAccent ? 0.12 : 0.05, bt);
    pulseGain.gain.exponentialRampToValueAtTime(0.001, bt + beat * 0.7);
  }

  _playing = true;
}

export function stopMusic() {
  if (!_playing || !ctx || !master) return;
  const fadeTime = 2.5;
  master.gain.linearRampToValueAtTime(0, ctx.currentTime + fadeTime);
  setTimeout(() => {
    nodes.forEach(n => { try { n.stop ? n.stop() : n.disconnect(); } catch {} });
    nodes = [];
    _playing = false;
    master = null;
    pulseGain = null;
  }, (fadeTime + 0.2) * 1000);
}

export function setVolume(vol) {
  if (master) master.gain.value = Math.max(0, Math.min(0.3, vol));
}

export const isPlaying = () => _playing;
