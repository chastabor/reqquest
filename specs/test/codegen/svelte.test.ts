import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseSpec } from '../../src/spec/parse.js'
import { resolveSpec } from '../../src/ir/resolve.js'
import { printSvelteAttr, printSvelteAttrs, rewriteSvelteText } from '../../src/codegen/svelte.js'
import type { PromptScope } from '../../src/expr/scope.js'

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '../../../..')
const DEMO_DEFAULT2 = resolve(REPO_ROOT, 'specs/requirements/demo-default2.spec.yml')

async function loadIR () {
  const spec = await parseSpec(DEMO_DEFAULT2)
  return resolveSpec(spec, { repoRoot: REPO_ROOT, specPath: DEMO_DEFAULT2 })
}

describe('printSvelteAttr', () => {
  it('emits string attributes quoted', async () => {
    const r = await loadIR()
    const scope: PromptScope = { kind: 'prompt', prompt: r.promptById.get('haveYardPrompt')! }
    expect(printSvelteAttr('path', 'haveYard', scope)).toBe('path="haveYard"')
    expect(printSvelteAttr('legendText', 'Pick one', scope)).toBe('legendText="Pick one"')
  })

  it('emits boolean true as shorthand and false as binding', async () => {
    const r = await loadIR()
    const scope: PromptScope = { kind: 'prompt', prompt: r.promptById.get('haveYardPrompt')! }
    expect(printSvelteAttr('boolean', true, scope)).toBe('boolean')
    expect(printSvelteAttr('required', false, scope)).toBe('required={false}')
  })

  it('emits arrays/objects as JS bindings', async () => {
    const r = await loadIR()
    const scope: PromptScope = { kind: 'prompt', prompt: r.promptById.get('haveYardPrompt')! }
    const out = printSvelteAttr('items', [{ label: 'Yes', value: true }], scope)
    expect(out).toBe('items={[{ label: "Yes", value: true }]}')
  })

  it('rewrites conditional / when as expression bindings', async () => {
    const r = await loadIR()
    const scope: PromptScope = { kind: 'prompt', prompt: r.promptById.get('haveYardPrompt')! }
    expect(printSvelteAttr('conditional', 'haveYard', scope)).toBe('conditional={data.haveYard}')
    expect(printSvelteAttr('when', '!haveYard', scope)).toBe('when={!data.haveYard}')
  })
})

describe('printSvelteAttrs', () => {
  it('joins attrs and skips empty values', async () => {
    const r = await loadIR()
    const scope: PromptScope = { kind: 'prompt', prompt: r.promptById.get('haveYardPrompt')! }
    expect(printSvelteAttrs({ path: 'haveYard', boolean: true, items: [1, 2] }, scope))
      .toBe('path="haveYard" boolean items={[1, 2]}')
  })
})

describe('rewriteSvelteText', () => {
  it('passes through plain text', async () => {
    const r = await loadIR()
    const scope: PromptScope = { kind: 'prompt', prompt: r.promptById.get('haveYardPrompt')! }
    expect(rewriteSvelteText('No yard.', scope)).toBe('No yard.')
  })

  it('splices interpolations as Svelte braces', async () => {
    const r = await loadIR()
    const scope: PromptScope = { kind: 'prompt', prompt: r.promptById.get('whichStatePrompt')! }
    expect(rewriteSvelteText('{{ stateName ?? state }}', scope))
      .toBe('{data.stateName ?? data.state}')
  })

  it('preserves literal text around interpolations', async () => {
    const r = await loadIR()
    const scope: PromptScope = { kind: 'prompt', prompt: r.promptById.get('mustExerciseYourDogPrompt')! }
    expect(rewriteSvelteText('{{ exerciseHours }} hours a week.', scope))
      .toBe('{data.exerciseHours} hours a week.')
  })
})
