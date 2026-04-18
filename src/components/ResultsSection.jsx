export function ResultsSection({
  text,
  results,
  persistHistory,
  onPersistHistoryChange,
  onClearHistory,
}) {
  return (
    <section className="card result">
      <div className="result__header">
        <h2>{text.results.title}</h2>
        <div className="result__controls">
          <label className="toggle">
            <input
              type="checkbox"
              checked={persistHistory}
              onChange={(event) => onPersistHistoryChange(event.target.checked)}
            />
            <span>{text.results.persistHistory}</span>
          </label>
          <button
            type="button"
            className="ghost ghost--dark"
            onClick={onClearHistory}
            disabled={!results.length}
          >
            {text.results.clearHistory}
          </button>
        </div>
      </div>

      {results.length ? (
        <div className="result__stack">
          {results.map((entry) => (
            <article key={`${entry.id}-${entry.createdAt}`} className="result__content">
              <div className="result__meta">
                <h3>{entry.label}</h3>
                <span>{new Date(entry.createdAt).toLocaleString(text.locale)}</span>
              </div>
              <div className="result__text">{entry.content}</div>
            </article>
          ))}
        </div>
      ) : (
        <p className="hint">{text.results.emptyState}</p>
      )}
    </section>
  )
}
