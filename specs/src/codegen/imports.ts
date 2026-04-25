import { quoteString } from './ts.js'

/**
 * Collects per-module value and type imports for a single emitted file.
 * `render()` produces stable, sorted import lines that merge type-only and
 * value names into one statement when both are present (`import { type X, Y }`).
 */
export class ImportCollector {
  private readonly values = new Map<string, Set<string>>()
  private readonly types = new Map<string, Set<string>>()

  add (module: string, name: string): void {
    const set = this.values.get(module) ?? new Set<string>()
    set.add(name)
    this.values.set(module, set)
  }

  addType (module: string, name: string): void {
    const set = this.types.get(module) ?? new Set<string>()
    set.add(name)
    this.types.set(module, set)
  }

  render (): string[] {
    const modules = [...new Set([...this.types.keys(), ...this.values.keys()])].sort()
    return modules.map(mod => {
      const types = this.types.get(mod)
      const values = this.values.get(mod)
      if (types && (!values || values.size === 0)) {
        return `import type { ${[...types].sort().join(', ')} } from ${quoteString(mod)}`
      }
      const merged = [
        ...(types ? [...types].map(n => `type ${n}`) : []),
        ...(values ? [...values] : [])
      ].sort()
      return `import { ${merged.join(', ')} } from ${quoteString(mod)}`
    })
  }
}

export function modelsImportPath (group: string): string {
  return `../models/${group}.models.js`
}

export function logicImportPath (group: string): string {
  return `../logic/${group}.logic.js`
}
