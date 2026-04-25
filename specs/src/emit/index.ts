import type { ResolvedSpec } from '../ir/types.js'
import { OutputBundle } from './files.js'
import { emitModels } from './models.js'

export { OutputBundle } from './files.js'

export interface EmitResult {
  bundle: OutputBundle
}

/**
 * Build an OutputBundle for the given resolved spec. The caller decides
 * when to flush — e.g. after a dry-run review, or directly to disk.
 */
export async function buildEmitBundle (spec: ResolvedSpec): Promise<EmitResult> {
  const bundle = new OutputBundle()
  await emitModels(spec, bundle)
  // Phase 3+ emitters slot in here.
  return { bundle }
}
