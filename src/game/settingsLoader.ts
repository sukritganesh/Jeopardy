import type { BuzzMode, GameSettings, SettingsPlayer } from './types';
import { DEFAULT_SETTINGS } from './types';

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isBuzzMode(value: unknown): value is BuzzMode {
  return value === 'early' || value === 'afterRead';
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function parsePlayers(value: unknown): SettingsPlayer[] {
  if (!Array.isArray(value)) {
    return DEFAULT_SETTINGS.players;
  }

  const players = value
    .filter(isRecord)
    .map((player, index) => ({
      id: typeof player.id === 'string' ? player.id : `player-${index + 1}`,
      name: typeof player.name === 'string' ? player.name : `Player ${index + 1}`,
      buzzerKey:
        typeof player.buzzerKey === 'string' && player.buzzerKey.trim().length > 0
          ? player.buzzerKey.trim().slice(0, 1).toUpperCase()
          : DEFAULT_SETTINGS.players[index]?.buzzerKey ?? '?',
      isActive: index < DEFAULT_SETTINGS.defaultPlayerCount,
    }));

  return players.length > 0 ? players.slice(0, 3) : DEFAULT_SETTINGS.players;
}

export function validateSettings(value: unknown): GameSettings {
  if (!isRecord(value)) {
    return DEFAULT_SETTINGS;
  }

  const tts = isRecord(value.tts) ? value.tts : {};
  const defaultPlayerCount = Math.min(3, Math.max(1, readNumber(value.defaultPlayerCount, 2)));

  return {
    boardPath: typeof value.boardPath === 'string' ? value.boardPath : DEFAULT_SETTINGS.boardPath,
    answerTimeSeconds: Math.max(1, readNumber(value.answerTimeSeconds, 5)),
    defaultBuzzMode: isBuzzMode(value.defaultBuzzMode)
      ? value.defaultBuzzMode
      : DEFAULT_SETTINGS.defaultBuzzMode,
    defaultPlayerCount,
    tts: {
      enabled: typeof tts.enabled === 'boolean' ? tts.enabled : DEFAULT_SETTINGS.tts.enabled,
      rate: Math.max(0.5, Math.min(2, readNumber(tts.rate, DEFAULT_SETTINGS.tts.rate))),
      pitch: Math.max(0, Math.min(2, readNumber(tts.pitch, DEFAULT_SETTINGS.tts.pitch))),
    },
    players: parsePlayers(value.players),
  };
}

// Settings live in public/config so the app can change defaults without a rebuild.
export async function loadSettings(path = '/config/game-settings.json'): Promise<GameSettings> {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Could not load settings from ${path}.`);
  }

  return validateSettings(await response.json());
}
