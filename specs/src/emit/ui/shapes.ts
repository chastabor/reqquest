import type { ResolvedSpec } from '../../ir/types.js'
import type { PromptScope, ConfigScope } from '../../expr/scope.js'
import { quoteString } from '../../codegen/ts.js'
import { printSvelteAttrs, rewriteSvelteText } from '../../codegen/svelte.js'
import { rewriteExpression } from '../../expr/rewrite.js'
import type { TemplateRegistry } from './templates.js'

const SLOT_DISCRIMINATORS = ['component', 'fields', 'template', 'text', 'cases'] as const
const SVELTE_REWRITE = { target: 'svelte' as const }

// Inputs are the unparsed `ui.<slot>` shape from the spec — the zod
// schema validates which keys are present. The dispatcher here picks
// among Shape A/B/C/D based on the (mutually-exclusive) discriminator.
type SlotShape = Record<string, any>

export interface SlotContext {
  /** Expression scope for any conditional / when / text inside this slot. */
  scope: PromptScope | ConfigScope
  /** Whether the prompt that owns this slot has a `fetch:` block. */
  hasFetch: boolean
  /** Whether the prompt that owns this slot has `gatherConfig:`. Drives the `gatheredConfigData` declaration. */
  hasGatherConfig: boolean
  spec: ResolvedSpec
  templates: TemplateRegistry
  /** Spec path label, e.g. `prompts.haveYardPrompt.ui.form` — surfaced in errors. */
  label: string
}

export interface SlotEmitResult {
  /** Full Svelte source. `null` when the slot is Shape D and the file should not be overwritten. */
  source: string
  /** True if this is a Shape D escape stub — bundle.setOnce instead of bundle.set. */
  preserveIfExists: boolean
}

export async function emitSlot (slot: SlotShape, ctx: SlotContext): Promise<SlotEmitResult> {
  const present = SLOT_DISCRIMINATORS.filter(k => k in slot)
  if (present.length > 1) {
    throw new Error(`${ctx.label}: UI slot has conflicting discriminators (${present.join(', ')}); pick exactly one of fields / template / text / cases / component`)
  }
  switch (present[0]) {
    case 'component': return { source: shapeDStub(slot.component, ctx), preserveIfExists: true }
    case 'fields':    return { source: await shapeA(slot, ctx), preserveIfExists: false }
    case 'template':  return { source: await shapeB(slot, ctx), preserveIfExists: false }
    case 'text':
    case 'cases':     return { source: await shapeC(slot, ctx), preserveIfExists: false }
    default:          return { source: emptyComponent(ctx), preserveIfExists: false }
  }
}

// =============================================================================
// Shape A — fields shorthand (with optional wrap)
// =============================================================================

async function shapeA (slot: SlotShape, ctx: SlotContext): Promise<string> {
  const carbonComponents = new Set<string>()
  const templateImports: Array<{ name: string, path: string }> = []

  const fieldLines = (slot.fields as Array<Record<string, Record<string, unknown>>>).map(entry => {
    const [componentName, props] = Object.entries(entry)[0]!
    carbonComponents.add(componentName)
    return `<${componentName} ${printSvelteAttrs(props, ctx.scope)} />`
  })

  let body: string
  if (slot.wrap) {
    const wrap = slot.wrap as { template?: string, component?: string, props?: Record<string, unknown> }
    if (wrap.template) {
      const path = await ctx.templates.ensure(wrap.template)
      templateImports.push({ name: wrap.template, path })
      body = `<${wrap.template} ${printSvelteAttrs(wrap.props, ctx.scope)}>\n  ${fieldLines.join('\n  ')}\n</${wrap.template}>`
    } else if (wrap.component) {
      // Project-local hand-written wrapper — assume already exists in this group dir.
      templateImports.push({ name: wrap.component, path: `./${wrap.component}.svelte` })
      body = `<${wrap.component} ${printSvelteAttrs(wrap.props, ctx.scope)}>\n  ${fieldLines.join('\n  ')}\n</${wrap.component}>`
    } else {
      body = fieldLines.join('\n')
    }
  } else {
    body = fieldLines.join('\n')
  }

  return assembleSvelte(ctx, { carbonComponents, templateImports, body })
}

// =============================================================================
// Shape B — template reference
// =============================================================================

async function shapeB (slot: SlotShape, ctx: SlotContext): Promise<string> {
  const path = await ctx.templates.ensure(slot.template)
  const props = slot.props as Record<string, unknown> | undefined
  const dataPart = ctx.hasFetch ? '{data} {fetched}' : '{data}'
  const body = `<${slot.template} ${dataPart} ${printSvelteAttrs(props, ctx.scope)} />`
  return assembleSvelte(ctx, {
    templateImports: [{ name: slot.template, path }],
    body
  })
}

// =============================================================================
// Shape C — text or cases (display-only)
// =============================================================================

async function shapeC (slot: SlotShape, ctx: SlotContext): Promise<string> {
  if ('text' in slot) {
    return assembleSvelte(ctx, { body: rewriteSvelteText(slot.text, ctx.scope) })
  }

  const branches = slot.cases as Array<Record<string, any>>
  const templateImports = await ensureCaseTemplates(branches, ctx)

  const lines: string[] = []
  branches.forEach((branch, i) => {
    const intro = i === 0
      ? `{#if ${rewriteExpression(branch.when, ctx.scope, SVELTE_REWRITE)}}`
      : branch.else === true ? '{:else}' : `{:else if ${rewriteExpression(branch.when, ctx.scope, SVELTE_REWRITE)}}`
    lines.push(intro + renderBranchContent(branch, ctx))
  })
  lines.push('{/if}')

  return assembleSvelte(ctx, { templateImports, body: lines.join('\n') })
}

async function ensureCaseTemplates (
  branches: Array<Record<string, any>>,
  ctx: SlotContext
): Promise<Array<{ name: string, path: string }>> {
  const seen = new Set<string>()
  const ordered: string[] = []
  for (const branch of branches) {
    if (typeof branch.template === 'string' && !seen.has(branch.template)) {
      seen.add(branch.template)
      ordered.push(branch.template)
    }
  }
  return Promise.all(ordered.map(async name => ({ name, path: await ctx.templates.ensure(name) })))
}

function renderBranchContent (branch: Record<string, any>, ctx: SlotContext): string {
  if ('text' in branch) return rewriteSvelteText(branch.text, ctx.scope)
  if ('template' in branch) {
    const dataPart = ctx.hasFetch ? '{data} {fetched}' : '{data}'
    return `<${branch.template} ${dataPart} ${printSvelteAttrs(branch.props as Record<string, unknown> | undefined, ctx.scope)} />`
  }
  return ''
}

// =============================================================================
// Shape D — escape-hatch stub (only if file is missing on disk)
// =============================================================================

function shapeDStub (componentName: string, ctx: SlotContext): string {
  return assembleSvelte(ctx, { body: `<!-- TODO: implement ${componentName} -->` })
}

function emptyComponent (ctx: SlotContext): string {
  return assembleSvelte(ctx, { body: '' })
}

// =============================================================================
// Svelte file assembly
// =============================================================================

interface AssembleBody {
  carbonComponents?: Set<string>
  templateImports?: Array<{ name: string, path: string }>
  body: string
}

function assembleSvelte (ctx: SlotContext, parts: AssembleBody): string {
  const importLines: string[] = []
  if (parts.carbonComponents && parts.carbonComponents.size > 0) {
    importLines.push(`import { ${[...parts.carbonComponents].sort().join(', ')} } from '@txstate-mws/carbon-svelte'`)
  }
  for (const tpl of parts.templateImports ?? []) {
    importLines.push(`import ${tpl.name} from ${quoteString(tpl.path)}`)
  }

  const exports = [
    'export let data: any'
  ]
  if (ctx.hasFetch) exports.push('export let fetched: any')
  if (ctx.hasGatherConfig) exports.push('export let gatheredConfigData: any')

  const lines: string[] = []
  lines.push('<script lang="ts">')
  for (const line of importLines) lines.push(`  ${line}`)
  for (const line of exports) lines.push(`  ${line}`)
  lines.push('</script>')
  lines.push('')
  lines.push(parts.body)
  lines.push('')
  return lines.join('\n')
}
