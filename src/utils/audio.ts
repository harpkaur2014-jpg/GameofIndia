class SoundEffects {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playCorrect() {
    if (!this.enabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    // Upbeat ascending chime: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz)
    const notes = [523.25, 659.25, 783.99, 1046.5];
    const startTime = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime + idx * 0.08);

      gain.gain.setValueAtTime(0.001, startTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.18, startTime + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + idx * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime + idx * 0.08);
      osc.stop(startTime + idx * 0.08 + 0.36);
    });
  }

  playIncorrect() {
    if (!this.enabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    // Gentle 2-tone low chime (not jarring): F4 (349Hz) down to D4 (293Hz)
    const notes = [349.23, 293.66];
    const startTime = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime + idx * 0.12);

      gain.gain.setValueAtTime(0.001, startTime + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.15, startTime + idx * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + idx * 0.12 + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime + idx * 0.12);
      osc.stop(startTime + idx * 0.12 + 0.32);
    });
  }

  playVictory() {
    if (!this.enabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const chords = [
      [523.25, 659.25, 783.99],       // C Major
      [587.33, 739.99, 880.00],       // D Major
      [659.25, 830.61, 987.77],       // E Major
      [783.99, 1046.50, 1318.51],     // High C Major
    ];

    chords.forEach((chord, chordIdx) => {
      const chordStart = ctx.currentTime + chordIdx * 0.22;
      chord.forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, chordStart);

        gain.gain.setValueAtTime(0.001, chordStart);
        gain.gain.exponentialRampToValueAtTime(0.12, chordStart + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, chordStart + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(chordStart);
        osc.stop(chordStart + 0.62);
      });
    });
  }
}

export const soundManager = new SoundEffects();
