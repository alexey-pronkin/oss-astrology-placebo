export function HeroSection({
  text,
  apiKey,
  model,
  recommendedModel,
  envWarnings,
  envDefaults,
  onApiKeyChange,
  onModelChange,
  onRecommendedModelPick,
  onApplyEnvDefaults,
}) {
  return (
    <header className="hero">
      <div className="hero__copy">
        <p className="eyebrow">{text.hero.eyebrow}</p>
        <h1>
          {text.hero.titlePrefix} <span>{text.hero.titleAccent}</span>
        </h1>
        <p className="lede">{text.hero.description}</p>
        <div className="hero__meta">
          {text.hero.meta.map((item) => (
            <div key={item.label}>
              <strong>{item.label}</strong>
              <span>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="hero__panel">
        <div className="panel__block">
          <label htmlFor="apiKey">{text.settings.apiKeyLabel}</label>
          <input
            id="apiKey"
            type="password"
            placeholder={text.settings.apiKeyPlaceholder}
            value={apiKey}
            onChange={(event) => onApiKeyChange(event.target.value)}
            autoComplete="off"
          />
          <p className="hint">{text.settings.apiKeyHint}</p>
        </div>

        <div className="panel__block">
          <label htmlFor="model">{text.settings.modelLabel}</label>
          <input
            id="model"
            type="text"
            value={model}
            onChange={(event) => onModelChange(event.target.value)}
            placeholder={text.settings.modelPlaceholder}
          />
          <div className="model-hint">
            <span>{text.settings.recommendationLabel}</span>
            <button
              type="button"
              className="model-pick"
              onClick={onRecommendedModelPick}
            >
              {recommendedModel}
            </button>
          </div>

          {envWarnings.length > 0 ? (
            <div className="env-warning">
              <strong>{text.settings.envWarningTitle}</strong>
              <ul>
                {envWarnings.map((warning) => (
                  <li key={warning.key}>
                    {warning.key}: {warning.hint}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="env-defaults">
            <div className="env-defaults__header">
              <strong>{text.settings.envDefaultsTitle}</strong>
              <button
                type="button"
                className="ghost ghost--inline"
                onClick={onApplyEnvDefaults}
              >
                {text.settings.applyEnvDefaults}
              </button>
            </div>

            {envDefaults.length > 0 ? (
              <ul className="env-defaults__list">
                {envDefaults.map((item) => (
                  <li key={item.key}>
                    Pair {item.label}: {item.date || text.settings.missingDate} ·{' '}
                    {item.time || text.settings.missingTime}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="hint">{text.settings.envRestartHint}</p>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

