import { HOST_SHORTCUTS } from '../game/keyboard';

export function ShortcutLegend() {
  return (
    <aside className="shortcut-legend" aria-label="Host keyboard shortcuts">
      <span>Host Keys</span>
      <dl>
        {HOST_SHORTCUTS.map((shortcut) => (
          <div key={shortcut.key}>
            <dt>{shortcut.key}</dt>
            <dd>{shortcut.label}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
