function App() {
  return (
    <main className="app-shell">
      <section className="setup-panel" aria-labelledby="app-title">
        <p className="eyebrow">Local party game</p>
        <h1 id="app-title">Jeopardy Clone</h1>
        <p className="intro">
          V1 scaffold is ready for the setup screen, sample board, keyboard
          buzzers, text-to-speech clues, and host-scored play.
        </p>

        <div className="decision-grid" aria-label="Version 1 decisions">
          <article>
            <h2>Frontend</h2>
            <p>React, Vite, TypeScript, and plain CSS.</p>
          </article>
          <article>
            <h2>Game Data</h2>
            <p>Local JSON boards in <code>public/boards</code>.</p>
          </article>
          <article>
            <h2>Gameplay</h2>
            <p>Manual host judging first, automation later.</p>
          </article>
        </div>
      </section>
    </main>
  );
}

export default App;
