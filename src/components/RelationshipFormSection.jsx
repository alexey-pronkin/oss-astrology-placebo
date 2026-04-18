export function RelationshipFormSection({
  text,
  personOne,
  personTwo,
  manualContext,
  analysisFocus,
  responseTone,
  responseLanguage,
  onPersonFieldChange,
  onManualContextChange,
  onAnalysisFocusChange,
  onResponseToneChange,
  onResponseLanguageChange,
}) {
  return (
    <section className="card">
      <h2>{text.form.title}</h2>
      <div className="grid">
        <div className="field">
          <label htmlFor="personOneName">{text.form.personOneNameLabel}</label>
          <input
            id="personOneName"
            type="text"
            value={personOne.name}
            placeholder={text.form.personOneNamePlaceholder}
            onChange={(event) =>
              onPersonFieldChange('personOne', 'name', event.target.value)
            }
          />
        </div>
        <div className="field">
          <label htmlFor="personOneBirthDate">
            {text.form.personOneDateLabel}
          </label>
          <input
            id="personOneBirthDate"
            type="date"
            value={personOne.birthDate}
            onChange={(event) =>
              onPersonFieldChange('personOne', 'birthDate', event.target.value)
            }
          />
        </div>
        <div className="field">
          <label htmlFor="personOneBirthTime">
            {text.form.personOneTimeLabel}
          </label>
          <input
            id="personOneBirthTime"
            type="time"
            value={personOne.birthTime}
            onChange={(event) =>
              onPersonFieldChange('personOne', 'birthTime', event.target.value)
            }
          />
        </div>
        <div className="field">
          <label htmlFor="personTwoName">{text.form.personTwoNameLabel}</label>
          <input
            id="personTwoName"
            type="text"
            value={personTwo.name}
            placeholder={text.form.personTwoNamePlaceholder}
            onChange={(event) =>
              onPersonFieldChange('personTwo', 'name', event.target.value)
            }
          />
        </div>
        <div className="field">
          <label htmlFor="personTwoBirthDate">
            {text.form.personTwoDateLabel}
          </label>
          <input
            id="personTwoBirthDate"
            type="date"
            value={personTwo.birthDate}
            onChange={(event) =>
              onPersonFieldChange('personTwo', 'birthDate', event.target.value)
            }
          />
        </div>
        <div className="field">
          <label htmlFor="personTwoBirthTime">
            {text.form.personTwoTimeLabel}
          </label>
          <input
            id="personTwoBirthTime"
            type="time"
            value={personTwo.birthTime}
            onChange={(event) =>
              onPersonFieldChange('personTwo', 'birthTime', event.target.value)
            }
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="manualContext">{text.form.contextLabel}</label>
        <textarea
          id="manualContext"
          rows="4"
          placeholder={text.form.contextPlaceholder}
          value={manualContext}
          onChange={(event) => onManualContextChange(event.target.value)}
        />
      </div>

      <div className="grid">
        <div className="field">
          <label htmlFor="analysisFocus">{text.form.focusLabel}</label>
          <input
            id="analysisFocus"
            type="text"
            value={analysisFocus}
            onChange={(event) => onAnalysisFocusChange(event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="responseTone">{text.form.toneLabel}</label>
          <input
            id="responseTone"
            type="text"
            value={responseTone}
            onChange={(event) => onResponseToneChange(event.target.value)}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="responseLanguage">{text.form.languageLabel}</label>
        <input
          id="responseLanguage"
          type="text"
          value={responseLanguage}
          onChange={(event) => onResponseLanguageChange(event.target.value)}
        />
      </div>
    </section>
  )
}

