import { describe, expect, it } from 'vitest'
import { parseExpression, walkIdents, type IdentRoot } from '../../src/expr/parse.js'

function idents (source: string): IdentRoot[] {
  const ast = parseExpression(source)
  if (!ast) throw new Error(`failed to parse: ${source}`)
  const out: IdentRoot[] = []
  walkIdents(ast, i => { out.push({ root: i.root, chain: i.chain, node: i.node }) })
  return out.map(({ root, chain }) => ({ root, chain, node: undefined as any }))
}

describe('parseExpression', () => {
  it('parses simple expressions', () => {
    expect(parseExpression('a == null')).not.toBeNull()
    expect(parseExpression('!haveYard')).not.toBeNull()
    expect(parseExpression('a.b.c >= 10')).not.toBeNull()
    expect(parseExpression('x ?? y')).not.toBeNull()
  })
})

describe('walkIdents', () => {
  it('reports a bare identifier', () => {
    const result = idents('haveYard')
    expect(result).toEqual([{ root: 'haveYard', chain: [], node: undefined }])
  })

  it('reports a property access chain as a single root + chain', () => {
    const result = idents('whichStatePrompt.state')
    expect(result).toEqual([{ root: 'whichStatePrompt', chain: ['state'], node: undefined }])
  })

  it('reports nested chains end-to-end', () => {
    const result = idents('a.b.c.d')
    expect(result).toEqual([{ root: 'a', chain: ['b', 'c', 'd'], node: undefined }])
  })

  it('descends into binary expressions', () => {
    const result = idents('a.b == c')
    expect(result).toEqual([
      { root: 'a', chain: ['b'], node: undefined },
      { root: 'c', chain: [], node: undefined }
    ])
  })

  it('descends into unary and array expressions', () => {
    const result = idents('!haveYard')
    expect(result).toEqual([{ root: 'haveYard', chain: [], node: undefined }])

    const arr = idents('[whichStatePrompt.state]')
    expect(arr).toEqual([{ root: 'whichStatePrompt', chain: ['state'], node: undefined }])
  })

  it('handles nullish coalescing', () => {
    const result = idents('stateName ?? state')
    expect(result).toEqual([
      { root: 'stateName', chain: [], node: undefined },
      { root: 'state', chain: [], node: undefined }
    ])
  })

  it('does not double-report intermediate chain segments', () => {
    const result = idents('a.b.c == a.b')
    expect(result).toEqual([
      { root: 'a', chain: ['b', 'c'], node: undefined },
      { root: 'a', chain: ['b'], node: undefined }
    ])
  })
})
