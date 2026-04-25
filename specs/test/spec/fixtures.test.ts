import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { loadFixture, FixtureLoadError } from '../../src/spec/fixtures.js'

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '../../../..')

describe('loadFixture', () => {
  it('loads specs/resources/data/states.yml', async () => {
    const data = await loadFixture('specs/resources/data/states.yml', { repoRoot: REPO_ROOT })
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBe(50)
    expect(data[0]).toEqual({ value: 'AL', label: 'Alabama' })
  })

  it('rejects an unknown file', async () => {
    await expect(loadFixture('specs/resources/data/missing.yml', { repoRoot: REPO_ROOT }))
      .rejects.toThrow(FixtureLoadError)
  })

  it('rejects an unsupported extension', async () => {
    await expect(loadFixture('specs/DESIGN.md', { repoRoot: REPO_ROOT }))
      .rejects.toThrow(/unsupported extension/)
  })
})
