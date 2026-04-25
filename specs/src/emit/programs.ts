import type {
  ResolvedSpec, ResolvedProgram, ResolvedWorkflowStage
} from '../ir/types.js'
import { programsFilePath } from '../ir/derive.js'
import { quoteString, printValue } from '../codegen/ts.js'
import { formatTS } from '../codegen/format.js'
import type { OutputBundle } from './files.js'

export async function emitPrograms (spec: ResolvedSpec, bundle: OutputBundle): Promise<void> {
  const source = await formatTS(printFile(spec))
  bundle.set(programsFilePath(spec.project.id), source)
}

function printFile (spec: ResolvedSpec): string {
  const lines: string[] = ["import type { ProgramDefinition } from '@reqquest/api'", '']
  for (const program of spec.programs) {
    lines.push(printProgram(program), '')
  }
  return lines.join('\n')
}

function printProgram (program: ResolvedProgram): string {
  const fields: string[] = []
  fields.push(`key: ${quoteString(program.apiKey)}`)
  fields.push(`title: ${quoteString(program.raw.title)}`)
  if (program.raw.navTitle != null) fields.push(`navTitle: ${quoteString(program.raw.navTitle)}`)
  fields.push(`requirementKeys: ${printValue(program.requirements.map(r => r.apiKey))}`)
  if (program.workflow.length > 0) {
    fields.push(`workflowStages: [${program.workflow.map(printWorkflowStage).join(', ')}]`)
  }
  return `export const ${program.symbolName}: ProgramDefinition = {\n  ${fields.join(',\n  ')}\n}`
}

function printWorkflowStage (stage: ResolvedWorkflowStage): string {
  const fields: string[] = []
  fields.push(`key: ${quoteString(stage.apiKey)}`)
  fields.push(`title: ${quoteString(stage.title ?? stage.id)}`)
  if (!stage.blocking) fields.push('nonBlocking: true')
  fields.push(`requirementKeys: ${printValue(stage.requirements.map(r => r.apiKey))}`)
  return `{ ${fields.join(', ')} }`
}
