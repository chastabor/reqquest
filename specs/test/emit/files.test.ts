import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { OutputBundle } from '../../src/emit/files.js'

let tmpRoot: string
beforeEach(async () => {
  tmpRoot = await mkdtemp(join(tmpdir(), 'rq-bundle-'))
})
afterEach(async () => {
  await rm(tmpRoot, { recursive: true, force: true })
})

describe('OutputBundle', () => {
  it('accumulates files and reports paths', () => {
    const b = new OutputBundle()
    b.set('a/b.ts', 'export const x = 1')
    b.set('c.ts', 'export const y = 2')
    expect(b.size).toBe(2)
    expect(b.paths()).toEqual(['a/b.ts', 'c.ts'])
    expect(b.has('a/b.ts')).toBe(true)
    expect(b.get('c.ts')).toBe('export const y = 2')
  })

  it('overwrites on repeated set', () => {
    const b = new OutputBundle()
    b.set('a.ts', 'first')
    b.set('a.ts', 'second')
    expect(b.size).toBe(1)
    expect(b.get('a.ts')).toBe('second')
  })

  it('flushes nested directories to disk', async () => {
    const b = new OutputBundle()
    b.set('demos/src/x/definitions/models/y.models.ts', 'hello')
    b.set('top.ts', 'top')
    await b.flush(tmpRoot)
    const nested = await readFile(join(tmpRoot, 'demos/src/x/definitions/models/y.models.ts'), 'utf8')
    const top = await readFile(join(tmpRoot, 'top.ts'), 'utf8')
    expect(nested).toBe('hello')
    expect(top).toBe('top')
  })
})
