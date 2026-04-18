import test from 'node:test'
import assert from 'node:assert/strict'
import {
  mergeStoredPerson,
  parseFlexibleDate,
  parseFlexibleTime,
  readAppEnvironment,
} from '../src/lib/env.js'

test('parseFlexibleDate accepts dotted and ISO formats', () => {
  assert.equal(parseFlexibleDate('25.10.1990'), '1990-10-25')
  assert.equal(parseFlexibleDate('1990-10-25'), '1990-10-25')
})

test('parseFlexibleDate rejects impossible dates', () => {
  assert.equal(parseFlexibleDate('31.02.1990'), '')
})

test('parseFlexibleTime supports meridiem and 24h time', () => {
  assert.equal(parseFlexibleTime('04:00:00am'), '04:00')
  assert.equal(parseFlexibleTime('11:10:00pm'), '23:10')
  assert.equal(parseFlexibleTime('22:00'), '22:00')
})

test('mergeStoredPerson keeps fallback defaults when stored fields are blank', () => {
  const mergedPerson = mergeStoredPerson(
    {
      name: '',
      birthDate: '',
      birthTime: '',
    },
    {
      name: '',
      birthDate: '1990-10-25',
      birthTime: '04:00',
    }
  )

  assert.deepEqual(mergedPerson, {
    name: '',
    birthDate: '1990-10-25',
    birthTime: '04:00',
  })
})

test('readAppEnvironment returns warnings for invalid inputs', () => {
  const environment = readAppEnvironment({
    VITE_FEMALE_DATE: '31.02.1990',
    VITE_FEMALE_TIME: '25:00',
    VITE_MALE_DATE: '25.08.1993',
    VITE_MALE_TIME: '22:00',
  })

  assert.equal(environment.formDefaults.personOne.birthDate, '')
  assert.equal(environment.formDefaults.personOne.birthTime, '')
  assert.equal(environment.formDefaults.personTwo.birthDate, '1993-08-25')
  assert.equal(environment.formDefaults.personTwo.birthTime, '22:00')
})
