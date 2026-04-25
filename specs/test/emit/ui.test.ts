import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { parseSpec } from '../../src/spec/parse.js'
import { resolveSpec } from '../../src/ir/resolve.js'
import { OutputBundle } from '../../src/emit/files.js'
import { emitUI } from '../../src/emit/ui/index.js'

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '../../../..')
const DEMO_DEFAULT2 = resolve(REPO_ROOT, 'specs/requirements/demo-default2.spec.yml')

let tmp: string
beforeEach(async () => { tmp = await mkdtemp(join(tmpdir(), 'rq-ui-')) })
afterEach(async () => { await rm(tmp, { recursive: true, force: true }) })

async function emit () {
  const spec = await parseSpec(DEMO_DEFAULT2)
  const ir = await resolveSpec(spec, { repoRoot: REPO_ROOT, specPath: DEMO_DEFAULT2 })
  const bundle = new OutputBundle()
  await emitUI(ir, bundle, { repoRoot: REPO_ROOT, outRoot: tmp })
  return bundle
}

describe('emitUI — demo-default2', () => {
  it('emits a Svelte file per slot per prompt', async () => {
    const bundle = await emit()
    const ui = bundle.paths().filter(p => p.startsWith('ui/src/local/default2/') && p.endsWith('.svelte'))
    expect(ui).toContain('ui/src/local/default2/state/WhichStatePrompt.svelte')
    expect(ui).toContain('ui/src/local/default2/state/WhichStatePromptDisplay.svelte')
    expect(ui).toContain('ui/src/local/default2/yard/HaveYardPrompt.svelte')
    expect(ui).toContain('ui/src/local/default2/cat/HaveACatTowerPrompt.svelte')
    expect(ui).toContain('ui/src/local/default2/cat/HaveACatTowerPromptDisplay.svelte')
  })

  it('copies referenced templates into _templates/', async () => {
    const bundle = await emit()
    const tpl = bundle.paths().filter(p => p.includes('/_templates/'))
    expect(tpl).toContain('ui/src/local/default2/_templates/QuestionnairePrompt.svelte')
    expect(tpl).toContain('ui/src/local/default2/_templates/YesNoFollowUp.svelte')
    expect(tpl).toContain('ui/src/local/default2/_templates/StateSelect.svelte')
    expect(tpl).toContain('ui/src/local/default2/_templates/LabeledFields.svelte')
  })

  it('emits Shape A fields with carbon-svelte component imports', async () => {
    const bundle = await emit()
    const yard = bundle.get('ui/src/local/default2/yard/HaveYardPrompt.svelte')!
    expect(yard).toMatch(/import \{[^}]*FieldRadio[^}]*\} from '@txstate-mws\/carbon-svelte'/)
    expect(yard).toMatch(/<FieldRadio path="haveYard" boolean/)
    expect(yard).toMatch(/conditional=\{data\.haveYard\}/)
  })

  it('wraps fields in a template when wrap.template is set', async () => {
    const bundle = await emit()
    const yard = bundle.get('ui/src/local/default2/yard/HaveYardPrompt.svelte')!
    expect(yard).toMatch(/import QuestionnairePrompt from "\.\.\/_templates\/QuestionnairePrompt\.svelte"/)
    expect(yard).toMatch(/<QuestionnairePrompt /)
    expect(yard).toMatch(/<\/QuestionnairePrompt>/)
  })

  it('emits Shape B template wrapper with {data} forwarding', async () => {
    const bundle = await emit()
    const state = bundle.get('ui/src/local/default2/state/WhichStatePrompt.svelte')!
    expect(state).toMatch(/import StateSelect from "\.\.\/_templates\/StateSelect\.svelte"/)
    expect(state).toMatch(/<StateSelect \{data\} \{fetched\}/)
    expect(state).toMatch(/listKey="stateList"/)
  })

  it('emits Shape C text display as inline interpolation', async () => {
    const bundle = await emit()
    const state = bundle.get('ui/src/local/default2/state/WhichStatePromptDisplay.svelte')!
    expect(state).toContain('{data.stateName ?? data.state}')
  })

  it('emits Shape C cases as if/else blocks', async () => {
    const bundle = await emit()
    const cat = bundle.get('ui/src/local/default2/cat/HaveACatTowerPromptDisplay.svelte')!
    expect(cat).toMatch(/\{#if data\.haveCatTower\}Already owns/)
    expect(cat).toMatch(/\{:else if data\.willPurchaseCatTower\}/)
    expect(cat).toMatch(/\{\/if\}/)
  })

  it('emits a case branch with template ref + data forwarding + import', async () => {
    const bundle = await emit()
    const yard = bundle.get('ui/src/local/default2/yard/HaveYardPromptDisplay.svelte')!
    expect(yard).toMatch(/import LabeledFields from "\.\.\/_templates\/LabeledFields\.svelte"/)
    expect(yard).toMatch(/<LabeledFields \{data\} entries=/)
  })

  it('emits a configure slot at the requirement group', async () => {
    const bundle = await emit()
    const cfg = bundle.get('ui/src/local/default2/dog/MustExerciseYourDogReqConfigure.svelte')!
    expect(cfg).toMatch(/<FieldNumber path="minExerciseHours"/)
  })

  it('emits uiRegistry.ts with all bindings', async () => {
    const bundle = await emit()
    const reg = bundle.get('ui/src/local/default2/uiRegistry.ts')!
    expect(reg).toMatch(/import \{ UIRegistry \} from '@reqquest\/ui'/)
    expect(reg).toMatch(/import DogWalker from 'carbon-icons-svelte\/lib\/DogWalker\.svelte'/)
    expect(reg).toMatch(/import HaveACatTowerPrompt from '\.\/cat\/HaveACatTowerPrompt\.svelte'/)
    expect(reg).toMatch(/key: 'have_a_cat_tower_prompt'/)
    expect(reg).toMatch(/key: 'must_exercise_your_dog_req',\s*configureComponent: MustExerciseYourDogReqConfigure/)
    expect(reg).toMatch(/appName: 'Adopt a Pet'/)
    expect(reg).toMatch(/applicantDashboardIntroHeader:/)
  })

  it('Shape D component slots are written via setOnce', async () => {
    // demo-default2 doesn't use Shape D, so direct test via inline spec.
    const yaml = `
specVersion: 2
project: { id: t, name: T }
models:
  M: { group: g, properties: { x: string } }
prompts:
  p:
    title: P
    model: M
    ui:
      form: { component: HandWrittenP }
      display: { component: HandWrittenPDisplay }
requirements:
  r:
    phase: APPROVAL
    title: R
    prompts: [p]
    resolve: { rules: [ { else: true, status: MET } ] }
programs:
  prog: { title: Prog, requirements: [r] }
`
    const spec = (await import('../../src/spec/parse.js')).parseSpecFromString(yaml)
    const ir = await resolveSpec(spec, { repoRoot: REPO_ROOT, specPath: '<inline>' })
    const bundle = new OutputBundle()
    await emitUI(ir, bundle, { repoRoot: REPO_ROOT, outRoot: tmp })
    const stub = bundle.get('ui/src/local/t/g/P.svelte')!
    expect(stub).toMatch(/TODO: implement HandWrittenP/)
    // Bundle marks it preserveIfExists; flushing twice should not overwrite hand-edits.
    await bundle.flush(tmp)
    const path = join(tmp, 'ui/src/local/t/g/P.svelte')
    await (await import('node:fs/promises')).writeFile(path, '<!-- author wrote this -->\n', 'utf8')
    await bundle.flush(tmp)
    const final = await readFile(path, 'utf8')
    expect(final).toBe('<!-- author wrote this -->\n')
  })
})
