export type SoundName =
  | 'boardFill'
  | 'correctAnswer'
  | 'dailyDouble'
  | 'incorrectAnswer'
  | 'jeopardyTheme'
  | 'thinkingMusic'
  | 'timesUp';

const SOUND_PATHS: Record<SoundName, string> = {
  boardFill: '/audio/boardFill.mp3',
  correctAnswer: '/audio/correctAnswer.mp3',
  dailyDouble: '/audio/dailyDouble.mp3',
  incorrectAnswer: '/audio/incorrectAnswer.mp3',
  jeopardyTheme: '/audio/jeopardyTheme80s.mp3',
  thinkingMusic: '/audio/thinkingMusic.mp3',
  timesUp: '/audio/timesUp.mp3',
};

const LOOPING_SOUNDS = new Set<SoundName>(['jeopardyTheme', 'thinkingMusic']);

function isBrowserAudioAvailable() {
  return typeof Audio !== 'undefined';
}

export class GameAudio {
  private sounds = new Map<SoundName, HTMLAudioElement>();

  private getSound(name: SoundName) {
    const existing = this.sounds.get(name);

    if (existing) {
      return existing;
    }

    const audio = new Audio(SOUND_PATHS[name]);
    audio.preload = 'auto';
    audio.loop = LOOPING_SOUNDS.has(name);
    this.sounds.set(name, audio);
    return audio;
  }

  play(name: SoundName) {
    if (!isBrowserAudioAvailable()) {
      return;
    }

    const audio = this.getSound(name);
    audio.currentTime = 0;
    void audio.play().catch(() => {
      // Browsers may block audio until the first user gesture.
    });
  }

  loop(name: SoundName) {
    if (!isBrowserAudioAvailable()) {
      return;
    }

    const audio = this.getSound(name);
    audio.loop = true;
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
}
