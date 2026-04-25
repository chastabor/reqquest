import { readFile } from 'node:fs/promises'
import { extname, isAbsolute, resolve as resolvePath } from 'node:path'
import { parse as parseYaml } from 'yaml'

export class FixtureLoadError extends Error {
  constructor (fixturePath: string, message: string) {
    super(`fixture ${fixturePath}: ${message}`)
    this.name = 'FixtureLoadError'
  }
}

export interface LoadFixtureOpts {
  /** Repo root used to resolve relative fixture paths (e.g. "specs/resources/data/states.yml"). */
  repoRoot: string
}

/**
 * Load a referenceData fixture from disk and return the parsed array.
 *
 * Per CLAUDE.md §5, fixture paths are repo-root-relative; we accept either
 * .yml/.yaml or .json and inline the parsed result verbatim into the
 * generated `as const` literal.
 */
export async function loadFixture (fixturePath: string, opts: LoadFixtureOpts): Promise<unknown[]> {
  const absPath = isAbsolute(fixturePath) ? fixturePath : resolvePath(opts.repoRoot, fixturePath)
  const ext = extname(absPath).toLowerCase()
  let raw: string
  try {
    raw = await readFile(absPath, 'utf8')
  } catch (err: any) {
    throw new FixtureLoadError(fixturePath, `cannot read (${err.code ?? err.message})`)
  }
  let data: unknown
  try {
    if (ext === '.json') {
      data = JSON.parse(raw)
    } else if (ext === '.yml' || ext === '.yaml') {
      data = parseYaml(raw)
    } else {
      throw new FixtureLoadError(fixturePath, `unsupported extension "${ext}" (expected .yml/.yaml/.json)`)
    }
  } catch (err: any) {
    if (err instanceof FixtureLoadError) throw err
    throw new FixtureLoadError(fixturePath, `parse failed: ${err.message}`)
  }
  if (!Array.isArray(data)) {
    throw new FixtureLoadError(fixturePath, 'fixture must be a top-level array of records')
  }
  return data
}
