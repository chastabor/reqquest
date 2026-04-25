import { readFile } from 'node:fs/promises'
import { parse as parseYaml } from 'yaml'
import { Spec, type Spec as SpecType } from './schema.js'

export class SpecParseError extends Error {
  readonly issues: string[]
  constructor (specPath: string, issues: string[]) {
    super(`spec parse failed at ${specPath}:\n  - ${issues.join('\n  - ')}`)
    this.name = 'SpecParseError'
    this.issues = issues
  }
}

export async function parseSpec (specPath: string): Promise<SpecType> {
  const raw = await readFile(specPath, 'utf8')
  return validate(parseYaml(raw), specPath)
}

export function parseSpecFromString (yamlSource: string, label = '<inline>'): SpecType {
  return validate(parseYaml(yamlSource), label)
}

function validate (data: unknown, label: string): SpecType {
  const result = Spec.safeParse(data)
  if (result.success) return result.data
  const issues = result.error.issues.map(i => `${i.path.join('.') || '<root>'}: ${i.message}`)
  throw new SpecParseError(label, issues)
}
