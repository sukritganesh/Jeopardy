import type { GameSettings } from './types';

type SpeakOptions = {
  settings: GameSettings['tts'];
  onEnd: () => void;
  onUnavailable: () => void;
};

export function stopSpeech() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function speakClue(text: string, { settings, onEnd, onUnavailable }: SpeakOptions) {
  stopSpeech();

  if (!settings.enabled) {
    onEnd();
    return;
  }

  if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
    onUnavailable();
    onEnd();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = settings.rate;
  utterance.pitch = settings.pitch;
  utterance.onend = onEnd;
  utterance.onerror = onEnd;
  window.speechSynthesis.speak(utterance);
}
