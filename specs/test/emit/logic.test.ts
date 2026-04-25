import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { parseSpec } from '../../src/spec/parse.js'
import { resolveSpec } from '../../src/ir/resolve.js'
import { OutputBundle } from '../../src/emit/files.js'
import { emitLogicStubs } from '../../src/emit/logic.js'

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '../../../..')
const DEMO_DEFAULT2 = resolve(REPO_ROOT, 'specs/requirements/demo-default2.spec.yml')
const LOGIC_PATH = 'demos/src/default2/definitions/logic/cat.logic.ts'

let tmp: string
beforeEach(async () => { tmp = await mkdtemp(join(tmpdir(), 'rq-logic-')) })
afterEach(async () => { await rm(tmp, { recursive: true, force: true }) })

async function buildIR () {
  const spec = await parseSpec(DEMO_DEFAULT2)
  return resolveSpec(spec, { repoRoot: REPO_ROOT, specPath: DEMO_DEFAULT2 })
}

describe('emitLogicStubs', () => {
  it('emits a stub for every true/dynamic hook', async () => {
    const ir = await buildIR()
    const bundle = new OutputBundle()
    await emitLogicStubs(ir, bundle, { outRoot: tmp })
    const cat = bundle.get(LOGIC_PATH)!
    expect(cat).toMatch(/export function otherCatsVaccinesPromptPreProcessData/)
    expect(cat).toMatch(/import\s+\{\s*type\s+OtherCatsVaccinesPromptData\s*\}|import\s+type\s+\{\s*OtherCatsVaccinesPromptData\s*\}/)
  })

  it('preserves an existing function body when re-running', async () => {
    const ir = await buildIR()
    const fullPath = join(tmp, LOGIC_PATH)
    await mkdir(dirname(fullPath), { recursive: true })
    await writeFile(fullPath, [
      "import type { OtherCatsVaccinesPromptData } from '../models/cat.models.js'",
      '',
      'export function otherCatsVaccinesPromptPreProcessData (data: OtherCatsVaccinesPromptData) {',
      '  // hand-edited body',
      '  return { ...data, shasum: "edited" }',
      '}',
      ''
    ].join('\n'), 'utf8')

    const bundle = new OutputBundle()
    await emitLogicStubs(ir, bundle, { outRoot: tmp })
    const updated = bundle.get(LOGIC_PATH)!
    expect(updated).toMatch(/hand-edited body/)
    expect(updated).toMatch(/shasum: 'edited'/)
  })
})
