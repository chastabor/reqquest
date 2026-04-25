import type { ResolvedSpec } from '../../ir/types.js'
import { quoteString, printValue } from '../../codegen/ts.js'
import { formatTS } from '../../codegen/format.js'
import type { OutputBundle } from '../files.js'

export interface ComponentRef {
  name: string
  importPath: string
}

export interface PromptBinding {
  key: string
  formComponent?: ComponentRef
  displayComponent?: ComponentRef
  configureComponent?: ComponentRef
}

export interface RequirementBinding {
  key: string
  configureComponent?: ComponentRef
}

export interface ProgramBinding {
  key: string
  icon: string | null
}

export interface RegistryCollector {
  prompts: PromptBinding[]
  requirements: RequirementBinding[]
  programs: ProgramBinding[]
}

export async function emitRegistry (
  spec: ResolvedSpec,
  collector: RegistryCollector,
  bundle: OutputBundle
): Promise<void> {
  const path = `ui/src/local/${spec.project.id}/uiRegistry.ts`
  const source = await formatTS(printRegistry(spec, collector))
  bundle.set(path, source)
}

function printRegistry (spec: ResolvedSpec, c: RegistryCollector): string {
  const importLines: string[] = []
  importLines.push("import { UIRegistry } from '@reqquest/ui'")

  // icon imports for programs
  const iconNames = [...new Set(c.programs.map(p => p.icon).filter((x): x is string => x != null))].sort()
  for (const icon of iconNames) {
    importLines.push(`import ${icon} from 'carbon-icons-svelte/lib/${icon}.svelte'`)
  }

  // component imports for prompts + requirements
  const componentRefs: ComponentRef[] = []
  for (const p of c.prompts) {
    if (p.formComponent) componentRefs.push(p.formComponent)
    if (p.displayComponent) componentRefs.push(p.displayComponent)
    if (p.configureComponent) componentRefs.push(p.configureComponent)
  }
  for (const r of c.requirements) {
    if (r.configureComponent) componentRefs.push(r.configureComponent)
  }
  const seenNames = new Set<string>()
  for (const ref of componentRefs) {
    if (seenNames.has(ref.name)) continue
    seenNames.add(ref.name)
    importLines.push(`import ${ref.name} from ${quoteString(ref.importPath)}`)
  }

  // project.ui keys flow verbatim into UIConfig.
  const configEntries: string[] = []
  configEntries.push(`appName: ${quoteString(spec.project.name)}`)
  for (const [key, value] of Object.entries(spec.project.ui)) {
    configEntries.push(`${key}: ${printValue(value)}`)
  }

  // Programs
  const programLines = c.programs.map(p => {
    const fields: string[] = [`key: ${quoteString(p.key)}`]
    if (p.icon) fields.push(`icon: ${p.icon}`)
    return `{ ${fields.join(', ')} }`
  })

  // Requirements
  const requirementLines = c.requirements.map(r => {
    const fields: string[] = [`key: ${quoteString(r.key)}`]
    if (r.configureComponent) fields.push(`configureComponent: ${r.configureComponent.name}`)
    return `{ ${fields.join(', ')} }`
  })

  // Prompts
  const promptLines = c.prompts.map(p => {
    const fields: string[] = [`key: ${quoteString(p.key)}`]
    if (p.formComponent) fields.push(`formComponent: ${p.formComponent.name}`)
    if (p.displayComponent) fields.push(`displayComponent: ${p.displayComponent.name}`)
    if (p.configureComponent) fields.push(`configureComponent: ${p.configureComponent.name}`)
    return `{ ${fields.join(', ')} }`
  })

  configEntries.push(`programs: [${programLines.join(', ')}]`)
  configEntries.push(`requirements: [${requirementLines.join(', ')}]`)
  configEntries.push(`prompts: [${promptLines.join(', ')}]`)

  return [
    importLines.join('\n'),
    '',
    `export const uiRegistry = new UIRegistry({\n  ${configEntries.join(',\n  ')}\n})`,
    ''
  ].join('\n')
}

