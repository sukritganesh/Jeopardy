import type { Player } from './types';

export type HostShortcut = {
  key: string;
  label: string;
  description: string;
};

export const HOST_SHORTCUTS: HostShortcut[] = [
  { key: 'C', label: 'Correct', description: 'Mark active response correct' },
  { key: 'I', label: 'Incorrect', description: 'Mark active response incorrect' },
  { key: 'R', label: 'Reveal', description: 'Reveal correct response' },
];

const RESERVED_SHORTCUT_KEYS = new Set(HOST_SHORTCUTS.map((shortcut) => shortcut.key));

export function normalizeKeyboardKey(value: string) {
  const trimmedValue = value.trim();

  return trimmedValue.length === 1 ? trimmedValue.toUpperCase() : '';
}

export function getReservedShortcutLabel(key: string) {
  const normalizedKey = normalizeKeyboardKey(key);
  return HOST_SHORTCUTS.find((shortcut) => shortcut.key === normalizedKey)?.label;
}

export function isReservedShortcutKey(key: string) {
  return RESERVED_SHORTCUT_KEYS.has(normalizeKeyboardKey(key));
}

export function getBuzzerKeyProblems(players: Player[]) {
  const problems: string[] = [];
  const seenKeys = new Map<string, string>();

  for (const player of players.filter((candidate) => candidate.isActive)) {
    const key = normalizeKeyboardKey(player.buzzerKey);
    const playerName = player.name.trim() || player.id;

    if (!key) {
      problems.push(`${playerName} needs a buzzer key.`);
      continue;
    }

    const reservedLabel = getReservedShortcutLabel(key);

    if (reservedLabel) {
      problems.push(`${playerName} cannot use ${key}; it is reserved for ${reservedLabel}.`);
      continue;
    }

    const firstPlayerWithKey = seenKeys.get(key);

    if (firstPlayerWithKey) {
      problems.push(`${playerName} and ${firstPlayerWithKey} cannot both use ${key}.`);
      continue;
    }

    seenKeys.set(key, playerName);
  }

  return problems;
}

export function isEditableKeyboardTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    target.isContentEditable
  );
}
