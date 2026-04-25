import type { ResolvedSpec } from '../ir/types.js'
import { OutputBundle } from './files.js'
import { emitModels } from './models.js'
import { emitLogicStubs } from './logic.js'
import { emitPrompts } from './prompts.js'
import { emitRequirements } from './requirements.js'
import { emitUI } from './ui/index.js'

export { OutputBundle } from './files.js'

export interface EmitResult {
  bundle: OutputBundle
}

export interface EmitOpts {
  /** Repo root — used to resolve template sources under specs/resources/ui-templates/. */
  repoRoot: string
  /** Where files will be flushed; idempotent emitters (logic.ts) read existing
   *  content from this root to preserve hand-authored bodies. */
  outRoot: string
}

export async function buildEmitBundle (spec: ResolvedSpec, opts: EmitOpts): Promise<EmitResult> {
  const bundle = new OutputBundle()
  await emitModels(spec, bundle)
  await emitLogicStubs(spec, bundle, opts)
  await emitPrompts(spec, bundle)
  await emitRequirements(spec, bundle)
  await emitUI(spec, bundle, opts)
  return { bundle }
}
