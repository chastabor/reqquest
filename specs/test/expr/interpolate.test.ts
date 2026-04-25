import { describe, expect, it } from 'vitest'
import { extractInterpolations } from '../../src/expr/interpolate.js'

describe('extractInterpolations', () => {
  it('returns empty for plain strings', () => {
    expect(extractInterpolations('No yard.')).toEqual([])
  })

  it('extracts a single segment', () => {
    expect(extractInterpolations('{{ exerciseHours }} hours a week.'))
      .toEqual([{ expr: 'exerciseHours', offset: 0 }])
  })

  it('extracts multiple segments', () => {
    const res = extractInterpolations('{{ a }} and {{ b.c }}')
    expect(res.length).toBe(2)
    expect(res[0]!.expr).toBe('a')
    expect(res[1]!.expr).toBe('b.c')
  })

  it('skips empty segments', () => {
    expect(extractInterpolations('hello {{ }} world')).toEqual([])
  })

  it('trims internal whitespace', () => {
    const res = extractInterpolations('{{   stateName ?? state   }}')
    expect(res[0]!.expr).toBe('stateName ?? state')
  })
})
