import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { parseSpec } from '../../src/spec/parse.js'
import { resolveSpec } from '../../src/ir/resolve.js'
import { OutputBundle } from '../../src/emit/files.js'
import { emitPrompts } from '../../src/emit/prompts.js'
import { emitLogicStubs } from '../../src/emit/logic.js'

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '../../../..')
const DEMO_DEFAULT2 = resolve(REPO_ROOT, 'specs/requirements/demo-default2.spec.yml')

let tmp: string
beforeEach(async () => { tmp = await mkdtemp(join(tmpdir(), 'rq-prompts-')) })
afterEach(async () => { await rm(tmp, { recursive: true, force: true }) })

async function emit () {
  const spec = await parseSpec(DEMO_DEFAULT2)
  const ir = await resolveSpec(spec, { repoRoot: REPO_ROOT, specPath: DEMO_DEFAULT2 })
  const bundle = new OutputBundle()
  await emitLogicStubs(ir, bundle, { outRoot: tmp })
  await emitPrompts(ir, bundle)
  return bundle
}

describe('emitPrompts — demo-default2', () => {
  it('emits one prompts file per group + a barrel', async () => {
    const bundle = await emit()
    const promptPaths = bundle.paths().filter(p => p.includes('definitions/prompts/'))
    expect(promptPaths).toEqual([
      'demos/src/default2/definitions/prompts/cat.prompts.ts',
      'demos/src/default2/definitions/prompts/dog.prompts.ts',
      'demos/src/default2/definitions/prompts/index.ts',
      'demos/src/default2/definitions/prompts/state.prompts.ts',
      'demos/src/default2/definitions/prompts/yard.prompts.ts'
    ])
  })

  it('emits PromptDefinition with snake_case key + schema reference', async () => {
    const bundle = await emit()
    const cat = bundle.get('demos/src/default2/definitions/prompts/cat.prompts.ts')!
    expect(cat).toMatch(/export const haveACatTowerPrompt: PromptDefinition = \{/)
    expect(cat).toMatch(/key: 'have_a_cat_tower_prompt'/)
    expect(cat).toMatch(/schema: CatTowerPromptSchema/)
  })

  it('emits validate body with rule-derived MutationMessage push', async () => {
    const bundle = await emit()
    const yard = bundle.get('demos/src/default2/definitions/prompts/yard.prompts.ts')!
    expect(yard).toMatch(/data\.haveYard == null/)
    expect(yard).toMatch(/MutationMessageType\.error/)
  })

  it('emits fetch returning the referenceData const', async () => {
    const bundle = await emit()
    const state = bundle.get('demos/src/default2/definitions/prompts/state.prompts.ts')!
    expect(state).toMatch(/fetch: async \(\) => \(\{ stateList \}\)/)
  })

  it('emits gatherConfig with config slice', async () => {
    const bundle = await emit()
    const dog = bundle.get('demos/src/default2/definitions/prompts/dog.prompts.ts')!
    expect(dog).toMatch(/gatherConfig:/)
    expect(dog).toMatch(/minExerciseHours: allPeriodConfig\.must_exercise_your_dog_req\?\.minExerciseHours/)
  })

  it('emits preProcessData as a logic.ts stub reference', async () => {
    const bundle = await emit()
    const cat = bundle.get('demos/src/default2/definitions/prompts/cat.prompts.ts')!
    expect(cat).toMatch(/preProcessData: otherCatsVaccinesPromptPreProcessData/)
    expect(cat).toMatch(/import \{ otherCatsVaccinesPromptPreProcessData \} from '\.\.\/logic\/cat\.logic\.js'/)
  })

  it('emits invalidUponChange + validUponChange from declarative blocks', async () => {
    const bundle = await emit()
    const cat = bundle.get('demos/src/default2/definitions/prompts/cat.prompts.ts')!
    expect(cat).toMatch(/invalidUponChange:/)
    expect(cat).toMatch(/data\?\.distemper\?\.satisfactory === false/)
    expect(cat).toMatch(/promptKey: otherCatsVaccinesPrompt\.key/)
    expect(cat).toMatch(/validUponChange:/)
    expect(cat).toMatch(/data\?\.distemper\?\.satisfactory === true/)
  })

  it('emits tag with extract / getTags / getLabel', async () => {
    const bundle = await emit()
    const state = bundle.get('demos/src/default2/definitions/prompts/state.prompts.ts')!
    expect(state).toMatch(/extract: \(data: any\) => \[data\.which_state_prompt\?\.state\]/)
    expect(state).toMatch(/getTags: \(\) => \[\.\.\.stateList\]/)
    expect(state).toMatch(/getLabel: \(tag: string\) => stateList\.find/)
  })

  it('emits index map form as ternary chain with getLabel lookup', async () => {
    const bundle = await emit()
    const cat = bundle.get('demos/src/default2/definitions/prompts/cat.prompts.ts')!
    expect(cat).toMatch(/data\.applicant_seems_nice_prompt\?\.seemsNice === true\s*\?\s*\['yes'\]/)
    expect(cat).toMatch(/getLabel: \(tag: string\) =>/)
  })

  it('rewrites message interpolation as a template literal', async () => {
    const bundle = await emit()
    const dog = bundle.get('demos/src/default2/definitions/prompts/dog.prompts.ts')!
    expect(dog).toMatch(/message: `[^`]*\$\{config\.minExerciseHours\}[^`]*`/)
  })

  it('writes flushed files to disk that include the logic stub file', async () => {
    const bundle = await emit()
    await bundle.flush(tmp)
    const logic = await readFile(
      join(tmp, 'demos/src/default2/definitions/logic/cat.logic.ts'), 'utf8'
    )
    expect(logic).toMatch(/export function otherCatsVaccinesPromptPreProcessData/)
    expect(logic).toMatch(/return data/)
  })
})
