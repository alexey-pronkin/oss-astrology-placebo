export const sanitizeText = (value) => {
  if (typeof value !== 'string') return ''

  const trimmed = value.trim()
  if (!trimmed) return ''

  const quoted = trimmed.match(/^(['"])(.*)\1$/)
  return quoted ? quoted[2].trim() : trimmed
}

export const hasText = (value) =>
  typeof value === 'string' && value.trim().length > 0

export const pickFirstText = (...values) => {
  for (const value of values) {
    if (hasText(value)) return value.trim()
  }

  return ''
}

const hasValidDateParts = (day, month, year) => {
  const numericDay = Number(day)
  const numericMonth = Number(month)
  const numericYear = Number(year)

  if (
    Number.isNaN(numericDay) ||
    Number.isNaN(numericMonth) ||
    Number.isNaN(numericYear)
  ) {
    return false
  }

  const probe = new Date(Date.UTC(numericYear, numericMonth - 1, numericDay))
  return (
    probe.getUTCFullYear() === numericYear &&
    probe.getUTCMonth() === numericMonth - 1 &&
    probe.getUTCDate() === numericDay
  )
}

export const parseFlexibleDate = (value) => {
  const normalized = sanitizeText(value)
  if (!normalized) return ''

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    const [year, month, day] = normalized.split('-')
    return hasValidDateParts(day, month, year) ? normalized : ''
  }

  const match = normalized.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/)
  if (!match) return ''

  const [, day, month, year] = match
  if (!hasValidDateParts(day, month, year)) return ''

  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

export const parseFlexibleTime = (value) => {
  const normalized = sanitizeText(value)
  if (!normalized) return ''

  const match = normalized.match(
    /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?$/i
  )
  if (!match) return ''

  let hours = Number(match[1])
  const minutes = Number(match[2])
  const meridiem = match[4]?.toLowerCase()

  if (Number.isNaN(hours) || Number.isNaN(minutes) || minutes > 59) return ''

  if (meridiem === 'am') {
    if (hours < 1 || hours > 12) return ''
    hours = hours === 12 ? 0 : hours
  } else if (meridiem === 'pm') {
    if (hours < 1 || hours > 12) return ''
    hours = hours === 12 ? 12 : hours + 12
  } else if (hours > 23) {
    return ''
  }

  return `${String(hours).padStart(2, '0')}:${match[2]}`
}

export const mergeStoredPerson = (storedPerson, fallbackPerson) => ({
  name: pickFirstText(storedPerson?.name, fallbackPerson.name),
  birthDate: pickFirstText(
    parseFlexibleDate(storedPerson?.birthDate),
    fallbackPerson.birthDate
  ),
  birthTime: pickFirstText(
    parseFlexibleTime(storedPerson?.birthTime),
    fallbackPerson.birthTime
  ),
})

export const readAppEnvironment = (env) => {
  const rawDefaults = {
    personOneDate: sanitizeText(env.VITE_FEMALE_DATE),
    personOneTime: sanitizeText(env.VITE_FEMALE_TIME),
    personTwoDate: sanitizeText(env.VITE_MALE_DATE),
    personTwoTime: sanitizeText(env.VITE_MALE_TIME),
  }

  const formDefaults = {
    personOne: {
      name: '',
      birthDate: parseFlexibleDate(rawDefaults.personOneDate),
      birthTime: parseFlexibleTime(rawDefaults.personOneTime),
    },
    personTwo: {
      name: '',
      birthDate: parseFlexibleDate(rawDefaults.personTwoDate),
      birthTime: parseFlexibleTime(rawDefaults.personTwoTime),
    },
  }

  const envSummary = [
    {
      key: 'personOne',
      label: 'A',
      date: formDefaults.personOne.birthDate,
      time: formDefaults.personOne.birthTime,
    },
    {
      key: 'personTwo',
      label: 'B',
      date: formDefaults.personTwo.birthDate,
      time: formDefaults.personTwo.birthTime,
    },
  ]

  const envWarnings = [
    {
      key: 'VITE_FEMALE_DATE',
      raw: rawDefaults.personOneDate,
      parsed: formDefaults.personOne.birthDate,
      hint: 'expected DD.MM.YYYY, for example 25.10.1990',
    },
    {
      key: 'VITE_FEMALE_TIME',
      raw: rawDefaults.personOneTime,
      parsed: formDefaults.personOne.birthTime,
      hint: 'expected HH:MM[:SS][am|pm] or 24h HH:MM, for example 04:00:00am',
    },
    {
      key: 'VITE_MALE_DATE',
      raw: rawDefaults.personTwoDate,
      parsed: formDefaults.personTwo.birthDate,
      hint: 'expected DD.MM.YYYY, for example 25.08.1993',
    },
    {
      key: 'VITE_MALE_TIME',
      raw: rawDefaults.personTwoTime,
      parsed: formDefaults.personTwo.birthTime,
      hint: 'expected HH:MM[:SS][am|pm] or 24h HH:MM, for example 22:00',
    },
  ]

  return {
    rawDefaults,
    formDefaults,
    envSummary,
    envWarnings,
  }
}

