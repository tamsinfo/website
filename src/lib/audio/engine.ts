// Generative sound for the studio, synthesised with Web Audio so there are no audio files
// to license or download. Nothing starts until the visitor turns a layer on.
//
// Ambience: a low mechanical hum, filtered air and hydraulics, and the occasional sound of
// a part locking into place. As the story moves from complexity to clarity the noise
// thins out and the hum settles onto the music's root.
// Music: slow warm pads over a four-chord progression, with a restrained pulse once the
// plant is connected.
// Cues: short clicks and tones that mark real events (parts docking, the plant connecting,
// moving between rooms).

type Layer = "ambience" | "music";

const ROOT = 55; // A1
const PROGRESSION = [
  [0, 7, 12, 16, 19], // A minor (add9 voicing)
  [-4, 3, 8, 12, 15], // F major 7
  [-7, 0, 5, 9, 12], // D minor 7 (over D)
  [-5, 2, 7, 11, 14], // E minor 7 (over E)
];

class Engine {
  ctx: AudioContext | null = null;
  master!: GainNode;
  ambienceBus!: GainNode;
  musicBus!: GainNode;
  cueBus!: GainNode;
  reverb!: ConvolverNode;
  noiseBuffer!: AudioBuffer;
  enabled: Record<Layer, boolean> = { ambience: false, music: false };
  cohesion = 0;
  private hum: OscillatorNode[] = [];
  private humFilter!: BiquadFilterNode;
  private airGain!: GainNode;
  private airFilter!: BiquadFilterNode;
  private timers: Record<Layer, number[]> = { ambience: [], music: [] };
  private chord = 0;

  private ensure() {
    if (this.ctx) return this.ctx;
    const ctx = new AudioContext();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0.8;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 3;
    this.master.connect(comp).connect(ctx.destination);

    this.reverb = ctx.createConvolver();
    this.reverb.buffer = this.impulse(3.2);
    const wet = ctx.createGain();
    wet.gain.value = 0.42;
    this.reverb.connect(wet).connect(this.master);

    this.ambienceBus = this.bus(0);
    this.musicBus = this.bus(0);
    this.cueBus = this.bus(0.5);

    const len = ctx.sampleRate * 2;
    this.noiseBuffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = this.noiseBuffer.getChannelData(0);
    let brown = 0;
    for (let i = 0; i < len; i += 1) {
      brown = (brown + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      data[i] = brown * 3.5;
    }
    this.buildAmbience();
    return ctx;
  }

  private bus(level: number) {
    const g = this.ctx!.createGain();
    g.gain.value = level;
    g.connect(this.master);
    g.connect(this.reverb);
    return g;
  }

  private impulse(seconds: number) {
    const ctx = this.ctx!;
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c += 1) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i += 1) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    return buf;
  }

  private buildAmbience() {
    const ctx = this.ctx!;
    this.humFilter = ctx.createBiquadFilter();
    this.humFilter.type = "lowpass";
    this.humFilter.frequency.value = 170;
    const humGain = ctx.createGain();
    humGain.gain.value = 0.11;
    this.humFilter.connect(humGain).connect(this.ambienceBus);
    for (const [f, type] of [
      [ROOT * 0.97, "sawtooth"],
      [ROOT * 2.03, "triangle"],
      [ROOT * 1.5, "sine"],
    ] as const) {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = f;
      o.connect(this.humFilter);
      o.start();
      this.hum.push(o);
    }

    const air = ctx.createBufferSource();
    air.buffer = this.noiseBuffer;
    air.loop = true;
    this.airFilter = ctx.createBiquadFilter();
    this.airFilter.type = "bandpass";
    this.airFilter.frequency.value = 420;
    this.airFilter.Q.value = 0.7;
    this.airGain = ctx.createGain();
    this.airGain.gain.value = 0.14;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.11;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.06;
    lfo.connect(lfoGain).connect(this.airGain.gain);
    lfo.start();
    air.connect(this.airFilter).connect(this.airGain).connect(this.ambienceBus);
    air.start();
  }

  private scheduleAmbience() {
    // a part locking into place: irregular while the plant is fragmented, on a grid once connected
    const next = () => {
      if (!this.enabled.ambience) return;
      this.clank(0.05 + Math.random() * 0.03);
      const loose = 5000 + Math.random() * 7000;
      const grid = 4000;
      const wait = this.cohesion > 0.75 ? grid : loose;
      this.timers.ambience.push(window.setTimeout(next, wait));
    };
    this.timers.ambience.push(window.setTimeout(next, 1500));
  }

  private scheduleMusic() {
    const ctx = this.ctx!;
    const chordLength = 8;
    const play = () => {
      if (!this.enabled.music) return;
      const now = ctx.currentTime;
      const notes = PROGRESSION[this.chord % PROGRESSION.length]!;
      // more voices arrive as the story gains clarity
      const voices = 3 + Math.round(this.cohesion * 2);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 2.4);
      gain.gain.setValueAtTime(0.05, now + chordLength - 1);
      gain.gain.linearRampToValueAtTime(0, now + chordLength + 2.5);
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(700 + this.cohesion * 900, now);
      filter.Q.value = 0.4;
      filter.connect(gain).connect(this.musicBus);
      notes.slice(0, voices).forEach((semi, i) => {
        for (const detune of [-6, 6]) {
          const o = ctx.createOscillator();
          o.type = i === 0 ? "triangle" : "sawtooth";
          o.frequency.value = ROOT * 2 * Math.pow(2, semi / 12);
          o.detune.value = detune;
          const g = ctx.createGain();
          g.gain.value = i === 0 ? 0.9 : 0.32;
          o.connect(g).connect(filter);
          o.start(now);
          o.stop(now + chordLength + 3);
        }
      });

      // the pulse only joins once things are connected
      if (this.cohesion > 0.55) {
        const beat = 60 / 84;
        for (let b = 0; b < chordLength / beat; b += 2) this.thump(now + b * beat, 0.05 * this.cohesion);
      }
      this.chord += 1;
      this.timers.music.push(window.setTimeout(play, chordLength * 1000));
    };
    play();
  }

  private thump(at: number, level: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(96, at);
    o.frequency.exponentialRampToValueAtTime(42, at + 0.22);
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(level, at + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.45);
    o.connect(g).connect(this.musicBus);
    o.start(at);
    o.stop(at + 0.5);
  }

  private clank(level: number) {
    const ctx = this.ctx!;
    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1800 + Math.random() * 1400;
    bp.Q.value = 18;
    const g = ctx.createGain();
    g.gain.setValueAtTime(level, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
    src.connect(bp).connect(g).connect(this.ambienceBus);
    src.start(now, Math.random());
    src.stop(now + 0.7);
  }

  /** Short interface cues. They follow the ambience toggle. */
  cue(name: "click" | "connect" | "transition") {
    if (!this.ctx || !this.enabled.ambience) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    if (name === "click") {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "square";
      o.frequency.setValueAtTime(1400, now);
      o.frequency.exponentialRampToValueAtTime(600, now + 0.04);
      g.gain.setValueAtTime(0.035, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
      o.connect(g).connect(this.cueBus);
      o.start(now);
      o.stop(now + 0.08);
      this.clank(0.06);
    } else if (name === "connect") {
      for (const [semi, delay] of [
        [24, 0],
        [31, 0.09],
      ] as const) {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = ROOT * Math.pow(2, semi / 12);
        g.gain.setValueAtTime(0, now + delay);
        g.gain.linearRampToValueAtTime(0.06, now + delay + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, now + delay + 2.2);
        o.connect(g).connect(this.cueBus);
        o.start(now + delay);
        o.stop(now + delay + 2.3);
      }
    } else {
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const f = ctx.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.setValueAtTime(300, now);
      f.frequency.exponentialRampToValueAtTime(2400, now + 0.5);
      f.frequency.exponentialRampToValueAtTime(200, now + 1.4);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.12, now + 0.4);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
      src.connect(f).connect(g).connect(this.cueBus);
      src.start(now);
      src.stop(now + 1.6);
    }
  }

  async set(layer: Layer, on: boolean) {
    const ctx = this.ensure();
    if (ctx.state === "suspended") await ctx.resume();
    this.enabled[layer] = on;
    const bus = layer === "ambience" ? this.ambienceBus : this.musicBus;
    const target = on ? (layer === "ambience" ? 0.55 : 0.6) : 0;
    bus.gain.cancelScheduledValues(ctx.currentTime);
    bus.gain.setTargetAtTime(target, ctx.currentTime, on ? 0.8 : 0.25);
    this.clearTimers(layer);
    if (on) {
      if (layer === "ambience") this.scheduleAmbience();
      else this.scheduleMusic();
    }
    if (!this.enabled.ambience && !this.enabled.music) {
      window.setTimeout(() => {
        if (!this.enabled.ambience && !this.enabled.music) void ctx.suspend();
      }, 1200);
    }
  }

  /** 0 = fragmented plant, 1 = connected system. */
  setCohesion(value: number) {
    this.cohesion = Math.min(1, Math.max(0, value));
    if (!this.ctx || !this.enabled.ambience) return;
    const t = this.ctx.currentTime;
    this.airGain.gain.setTargetAtTime(0.14 * (1 - this.cohesion * 0.7), t, 0.5);
    this.airFilter.frequency.setTargetAtTime(420 - this.cohesion * 180, t, 0.5);
    // detuned hum settles onto the root
    this.hum[0]!.frequency.setTargetAtTime(ROOT * (0.97 + this.cohesion * 0.03), t, 0.8);
    this.hum[1]!.frequency.setTargetAtTime(ROOT * (2.03 - this.cohesion * 0.03), t, 0.8);
  }

  private clearTimers(layer: Layer) {
    for (const id of this.timers[layer]) clearTimeout(id);
    this.timers[layer] = [];
  }
}

export const sound = new Engine();
