import { describe, expect, it } from 'vitest'
import { isValidIdent, lowerFirstChar, quoteString, objectKey, printValue } from '../../src/codegen/ts.js'

describe('isValidIdent', () => {
  it('accepts standard identifiers', () => {
    expect(isValidIdent('foo')).toBe(true)
    expect(isValidIdent('_foo')).toBe(true)
    expect(isValidIdent('$foo')).toBe(true)
    expect(isValidIdent('foo_bar123')).toBe(true)
  })

  it('rejects invalid identifiers', () => {
    expect(isValidIdent('1foo')).toBe(false)
    expect(isValidIdent('foo-bar')).toBe(false)
    expect(isValidIdent('foo bar')).toBe(false)
    expect(isValidIdent('')).toBe(false)
  })
})

describe('lowerFirstChar', () => {
  it('lowercases the first character only', () => {
    expect(lowerFirstChar('StateList')).toBe('stateList')
    expect(lowerFirstChar('IDValuesPrompt')).toBe('iDValuesPrompt')
    expect(lowerFirstChar('a')).toBe('a')
    expect(lowerFirstChar('')).toBe('')
  })
})

describe('objectKey', () => {
  it('emits bare keys for valid identifiers', () => {
    expect(objectKey('foo')).toBe('foo')
    expect(objectKey('_type')).toBe('_type')
  })

  it('quotes keys that contain special chars', () => {
    expect(objectKey('foo-bar')).toBe('"foo-bar"')
    expect(objectKey('1key')).toBe('"1key"')
  })
})

describe('quoteString', () => {
  it('emits a string literal with proper escapes', () => {
    expect(quoteString('hello')).toBe('"hello"')
    expect(quoteString('he said "hi"')).toBe('"he said \\"hi\\""')
  })
})

describe('printValue', () => {
  it('emits primitives', () => {
    expect(printValue('foo')).toBe('"foo"')
    expect(printValue(42)).toBe('42')
    expect(printValue(true)).toBe('true')
    expect(printValue(null)).toBe('null')
  })

  it('emits arrays', () => {
    expect(printValue(['a', 'b'])).toBe('["a", "b"]')
    expect(printValue([1, 2, 3])).toBe('[1, 2, 3]')
  })

  it('emits objects with bare keys when valid', () => {
    expect(printValue({ value: 'AL', label: 'Alabama' }))
      .toBe('{ value: "AL", label: "Alabama" }')
  })

  it('emits nested structures', () => {
    expect(printValue([{ value: 'AL' }, { value: 'AK' }]))
      .toBe('[{ value: "AL" }, { value: "AK" }]')
  })

  it('quotes keys that need it', () => {
    expect(printValue({ '1foo': 1 })).toBe('{ "1foo": 1 }')
  })
})
