import type { PropShape } from '../spec/schema.js'
import type { ResolvedModel, ResolvedRegularModel } from './types.js'

export interface FieldLookupResult {
  found: boolean
  shape: PropShape | null
  reason: string | null
}

/**
 * Walk a dotted path through a model's property graph. PascalCase model
 * references and inline `{ properties: ... }` objects are descended into;
 * anything else (primitives, arrays, format/enum descriptors) is a leaf.
 *
 * Used by validators to confirm a `field:` / `path:` / chain expression
 * resolves to a real model property.
 */
export function lookupModelField (
  model: ResolvedRegularModel,
  modelById: Map<string, ResolvedModel>,
  path: string
): FieldLookupResult {
  const parts = path.split('.')
  let props: Record<string, PropShape> = model.raw.properties
  let shape: PropShape | null = null

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]!
    if (!(part in props)) {
      const so_far = parts.slice(0, i + 1).join('.')
      return { found: false, shape: null, reason: `unknown field "${so_far}"` }
    }
    shape = props[part]!
    if (i < parts.length - 1) {
      const nested = resolveToObjectShape(shape, modelById)
      if (!nested) {
        const next = parts[i + 1]!
        return {
          found: false,
          shape: null,
          reason: `cannot index "${next}" on non-object field "${parts.slice(0, i + 1).join('.')}"`
        }
      }
      props = nested
    }
  }
  return { found: true, shape, reason: null }
}

/** Returns true if a leaf shape is the boolean primitive. */
export function isBooleanShape (shape: PropShape | null): boolean {
  return shape === 'boolean'
}

/** Returns true if a leaf shape is a numeric primitive. */
export function isNumericShape (shape: PropShape | null): boolean {
  return shape === 'number'
}

function resolveToObjectShape (
  shape: PropShape,
  modelById: Map<string, ResolvedModel>
): Record<string, PropShape> | null {
  if (typeof shape === 'string') {
    if (shape === 'string' || shape === 'number' || shape === 'boolean') return null
    const m = modelById.get(shape)
    if (!m || m.kind !== 'regular') return null
    return m.raw.properties
  }
  if (typeof shape === 'object' && shape !== null && 'properties' in shape) {
    return shape.properties
  }
  return null
}
