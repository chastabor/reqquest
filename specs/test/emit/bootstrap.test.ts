import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { parseSpec, parseSpecFromString } from '../../src/spec/parse.js'
import { resolveSpec } from '../../src/ir/resolve.js'
import { OutputBundle } from '../../src/emit/files.js'
import { emitBootstrap } from '../../src/emit/bootstrap.js'

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '../../../..')
const DEMO_DEFAULT2 = resolve(REPO_ROOT, 'specs/requirements/demo-default2.spec.yml')

let tmp: string
beforeEach(async () => { tmp = await mkdtemp(join(tmpdir(), 'rq-bootstrap-')) })
afterEach(async () => { await rm(tmp, { recursive: true, force: true }) })

async function emit (yaml?: string) {
  const spec = yaml ? parseSpecFromString(yaml) : await parseSpec(DEMO_DEFAULT2)
  const ir = await resolveSpec(spec, { repoRoot: REPO_ROOT, specPath: yaml ? '<inline>' : DEMO_DEFAULT2 })
  const bundle = new OutputBundle()
  await emitBootstrap(ir, bundle)
  return { bundle, ir }
}

describe('emitBootstrap — demo-default2', () => {
  it('emits a single index.ts at the project root', async () => {
    const { bundle } = await emit()
    expect(bundle.paths()).toEqual(['demos/src/default2/index.ts'])
  })

  it('imports definition barrels and calls RQServer.start', async () => {
    const { bundle } = await emit()
    const src = bundle.get('demos/src/default2/index.ts')!
    expect(src).toMatch(/import \{ RQServer \} from '@reqquest\/api'/)
    expect(src).toMatch(/import \* as programs from '\.\/definitions\/programs\.js'/)
    expect(src).toMatch(/import \* as requirements from '\.\/definitions\/requirements\/index\.js'/)
    expect(src).toMatch(/import \* as prompts from '\.\/definitions\/prompts\/index\.js'/)
    expect(src).toMatch(/await server\.start\(/)
    expect(src).toMatch(/programs: Object\.values\(programs\)/)
  })

  it('threads multipleRequestsPerPeriod from project.ui', async () => {
    const { bundle } = await emit()
    const src = bundle.get('demos/src/default2/index.ts')!
    expect(src).toMatch(/multipleRequestsPerPeriod: false/)
  })

  it('emits multipleRequestsPerPeriod: true when set in spec', async () => {
    const yaml = `
specVersion: 2
project: { id: t, name: T, multipleRequestsPerPeriod: true }
models: {}
prompts: {}
requirements: {}
programs: {}
`
    const { bundle } = await emit(yaml)
    const src = bundle.get('demos/src/t/index.ts')!
    expect(src).toMatch(/multipleRequestsPerPeriod: true/)
  })
})

describe('emitBootstrap — idempotency', () => {
  it('preserves an existing index.ts on flush', async () => {
    const { bundle } = await emit()
    const path = join(tmp, 'demos/src/default2/index.ts')
    await mkdir(dirname(path), { recursive: true })
    await writeFile(path, '// custom user bootstrap\n', 'utf8')
    await bundle.flush(tmp)
    const final = await readFile(path, 'utf8')
    expect(final).toBe('// custom user bootstrap\n')
  })

  it('writes the generated bootstrap when no file exists', async () => {
    const { bundle } = await emit()
    await bundle.flush(tmp)
    const final = await readFile(join(tmp, 'demos/src/default2/index.ts'), 'utf8')
    expect(final).toMatch(/import \{ RQServer \} from '@reqquest\/api'/)
  })
})
