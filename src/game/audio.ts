export type SoundName =
  | 'boardFill'
  | 'correctAnswer'
  | 'dailyDouble'
  | 'incorrectAnswer'
  | 'jeopardyTheme'
  | 'outroMusic'
  | 'thinkingMusic'
  | 'timesUp';

export type AudioMixerSettings = {
  isMuted: boolean;
  musicVolume: number;
  effectsVolume: number;
};

const SOUND_PATHS: Record<SoundName, string> = {
  boardFill: '/audio/boardFill.mp3',
  correctAnswer: '/audio/correctAnswer.mp3',
  dailyDouble: '/audio/dailyDouble.mp3',
  incorrectAnswer: '/audio/incorrectAnswer.mp3',
  jeopardyTheme: '/audio/jeopardyTheme80s.mp3',
  outroMusic: '/audio/outroMusic.mp3',
  thinkingMusic: '/audio/thinkingMusic.mp3',
  timesUp: '/audio/timesUp.mp3',
};

const LOOPING_SOUNDS = new Set<SoundName>(['jeopardyTheme', 'thinkingMusic']);
const MUSIC_SOUNDS = new Set<SoundName>(['jeopardyTheme', 'outroMusic', 'thinkingMusic']);

function isBrowserAudioAvailable() {
  return typeof Audio !== 'undefined';
}

export class GameAudio {
  private sounds = new Map<SoundName, HTMLAudioElement>();
  private settings: AudioMixerSettings = {
    isMuted: true,
    musicVolume: 0.45,
    effectsVolume: 0.8,
  };

  private getVolume(name: SoundName) {
    return MUSIC_SOUNDS.has(name) ? this.settings.musicVolume : this.settings.effectsVolume;
  }

  private applySettingsToSound(name: SoundName, audio: HTMLAudioElement) {
    audio.muted = this.settings.isMuted;
    audio.volume = this.getVolume(name);
  }

  private getSound(name: SoundName) {
    const existing = this.sounds.get(name);

    if (existing) {
      return existing;
    }

    const audio = new Audio(SOUND_PATHS[name]);
    audio.preload = 'auto';
    audio.loop = LOOPING_SOUNDS.has(name);
    this.applySettingsToSound(name, audio);
    this.sounds.set(name, audio);
    return audio;
  }

  setSettings(settings: AudioMixerSettings) {
    const wasMuted = this.settings.isMuted;
    this.settings = {
      isMuted: settings.isMuted,
      musicVolume: Math.max(0, Math.min(1, settings.musicVolume)),
      effectsVolume: Math.max(0, Math.min(1, settings.effectsVolume)),
    };

    for (const [name, audio] of this.sounds) {
      this.applySettingsToSound(name, audio);
    }

    if (!wasMuted && this.settings.isMuted) {
      this.pauseAll();
    }
  }

  play(name: SoundName) {
    if (!isBrowserAudioAvailable() || this.settings.isMuted) {
      return;
    }

    const audio = this.getSound(name);
    this.applySettingsToSound(name, audio);
    audio.currentTime = 0;
    void audio.play().catch(() => {
      // Browsers may block audio until the first user gesture.
    });
  }

  loop(name: SoundName) {
    if (!isBrowserAudioAvailable() || this.settings.isMuted) {
      return;
    }

    const audio = this.getSound(name);
    audio.loop = true;
    this.applySettingsToSound(name, audio);
    void audio.play().catch(() => {
      // Ambient tracks start once the browser allows audio playback.
    });
  }

  stop(name: SoundName) {
    const audio = this.sounds.get(name);

    if (!audio) {
      return;
    }

    audio.pause();
    audio.currentTime = 0;
  }

  stopAmbient() {
    this.stop('jeopardyTheme');
    this.stop('thinkingMusic');
  }

  pauseAll() {
    for (const audio of this.sounds.values()) {
      audio.pause();
    }
  }
}
