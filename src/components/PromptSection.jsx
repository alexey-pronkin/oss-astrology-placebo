export function PromptSection({
  text,
  templateOptions,
  selectedTemplateId,
  selectedTemplate,
  prompt,
  isLoading,
  requestState,
  requestProgress,
  requestStateLabel,
  requestHint,
  error,
  onTemplateChange,
  onCopyPrompt,
  onGenerateSelected,
  onGenerateAll,
  onCancelRequest,
}) {
  return (
    <section className="card card--dark">
      <h2>{text.prompt.title}</h2>
      <div className="field">
        <label htmlFor="template">{text.prompt.templateLabel}</label>
        <select
          id="template"
          value={selectedTemplateId}
          onChange={(event) => onTemplateChange(event.target.value)}
        >
          {templateOptions.map((template) => (
            <option key={template.id} value={template.id}>
              {template.label}
            </option>
          ))}
        </select>
        {selectedTemplate?.description ? (
          <p className="hint">{selectedTemplate.description}</p>
        ) : null}
      </div>

      <p className="hint">{text.prompt.copyHint}</p>
      <div className="prompt-box">
        <pre>{prompt}</pre>
      </div>

      <div className="actions">
        <button type="button" className="ghost" onClick={onCopyPrompt}>
          {text.prompt.copyPrompt}
        </button>
        <button
          type="button"
          className="primary"
          onClick={onGenerateSelected}
          disabled={isLoading}
        >
          {isLoading ? text.prompt.runningButton : text.prompt.generateSelected}
        </button>
        <button
          type="button"
          className="ghost ghost--light"
          onClick={onGenerateAll}
          disabled={isLoading}
        >
          {text.prompt.generateAll}
        </button>
        <button
          type="button"
          className="ghost ghost--light"
          onClick={onCancelRequest}
          disabled={!isLoading}
        >
          {text.prompt.cancelRequest}
        </button>
      </div>

      <div className={`request-status request-status--${requestState.stage}`}>
        <div className="request-status__header">
          <strong>{requestState.message}</strong>
          <span>{requestStateLabel}</span>
        </div>
        {requestState.total > 1 ? (
          <div
            className="request-status__progress"
            aria-hidden="true"
            style={{
              '--progress-width': `${Math.max(requestProgress, 6)}%`,
            }}
          />
        ) : null}
        <p className="hint">{requestHint}</p>
      </div>

      {error ? <p className="error">{error}</p> : null}
    </section>
  )
}

