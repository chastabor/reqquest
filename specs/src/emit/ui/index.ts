import type { ResolvedSpec, ResolvedPrompt, ResolvedRequirement } from '../../ir/types.js'
import type { PromptScope, ConfigScope } from '../../expr/scope.js'
import { upperFirstChar } from '../../codegen/ts.js'
import { uiComponentPath, uiComponentImport } from '../../ir/derive.js'
import type { OutputBundle } from '../files.js'
import type { EmitOpts } from '../index.js'
import { TemplateRegistry } from './templates.js'
import { emitSlot, type SlotContext } from './shapes.js'
import { emitRegistry, type RegistryCollector } from './registry.js'

/** A `configuration.fetch:` value populates `fetched` unless explicitly disabled with `false`. */
function hasConfigFetch (cfg: unknown): boolean {
  return cfg != null && cfg !== false
}

export async function emitUI (spec: ResolvedSpec, bundle: OutputBundle, opts: EmitOpts): Promise<void> {
  const templates = new TemplateRegistry(spec.project.id, bundle, opts.repoRoot)
  const collector: RegistryCollector = { prompts: [], requirements: [], programs: [] }

  for (const prompt of spec.prompts) {
    await processPrompt(prompt, spec, bundle, templates, collector)
  }
  for (const req of spec.requirements) {
    await processRequirement(req, spec, bundle, templates, collector)
  }
  for (const program of spec.programs) {
    collector.programs.push({
      key: program.apiKey,
      icon: program.raw.icon ?? null
    })
  }

  await emitRegistry(spec, collector, bundle)
}

// =============================================================================
// Prompt UI emission
// =============================================================================

async function processPrompt (
  prompt: ResolvedPrompt,
  spec: ResolvedSpec,
  bundle: OutputBundle,
  templates: TemplateRegistry,
  collector: RegistryCollector
): Promise<void> {
  const ui = prompt.raw.ui
  if (!ui) return

  const promptScope: PromptScope = { kind: 'prompt', prompt }
  const hasFetch = prompt.raw.fetch != null
  const hasGatherConfig = prompt.gatherConfigSources.length > 0
  const fetchedRefDataIds = new Set<string>()
  if (prompt.fetchModel) fetchedRefDataIds.add(prompt.fetchModel.id)
  const baseCtx = { hasFetch, hasGatherConfig, fetchedRefDataIds, spec, templates }
  const namePrefix = upperFirstChar(prompt.id)
  const labelPrefix = `prompts.${prompt.id}.ui`

  const binding: RegistryCollector['prompts'][number] = { key: prompt.apiKey }

  if (ui.form) {
    const name = namePrefix
    const result = await emitSlot(ui.form, { ...baseCtx, scope: promptScope, label: `${labelPrefix}.form` })
    write(bundle, uiComponentPath(spec.project.id, prompt.group, name), result)
    binding.formComponent = { name, importPath: uiComponentImport(prompt.group, name) }
  }
  if (ui.display) {
    const name = `${namePrefix}Display`
    const result = await emitSlot(ui.display, { ...baseCtx, scope: promptScope, label: `${labelPrefix}.display` })
    write(bundle, uiComponentPath(spec.project.id, prompt.group, name), result)
    binding.displayComponent = { name, importPath: uiComponentImport(prompt.group, name) }
  }
  if (ui.configure) {
    const cfg = prompt.configurationModel
    if (cfg && cfg.kind === 'regular') {
      const name = `${namePrefix}Configure`
      const configScope: ConfigScope = { kind: 'config', model: cfg }
      // Configure slots are admin-side: the framework does not pass
      // `gatheredConfigData`, and refdata-shorthand for `configuration.fetch:`
      // is supported on requirement configurations only.
      const result = await emitSlot(ui.configure, {
        ...baseCtx,
        scope: configScope,
        hasFetch: hasConfigFetch(prompt.raw.configuration?.fetch),
        hasGatherConfig: false,
        fetchedRefDataIds: new Set(),
        label: `${labelPrefix}.configure`
      })
      write(bundle, uiComponentPath(spec.project.id, prompt.group, name), result)
      binding.configureComponent = { name, importPath: uiComponentImport(prompt.group, name) }
    }
  }

  collector.prompts.push(binding)
}

// =============================================================================
// Requirement UI emission (configure slot only)
// =============================================================================

async function processRequirement (
  req: ResolvedRequirement,
  spec: ResolvedSpec,
  bundle: OutputBundle,
  templates: TemplateRegistry,
  collector: RegistryCollector
): Promise<void> {
  const binding: RegistryCollector['requirements'][number] = { key: req.apiKey }
  const slot = req.raw.ui?.configure ?? req.raw.configuration?.ui?.configure

  if (slot && req.configurationModel?.kind === 'regular') {
    const name = `${upperFirstChar(req.id)}Configure`
    const configScope: ConfigScope = { kind: 'config', model: req.configurationModel }
    const label = `requirements.${req.id}.${req.raw.ui?.configure ? 'ui' : 'configuration.ui'}.configure`
    const fetchedRefDataIds = new Set<string>()
    if (req.configurationFetchModel) fetchedRefDataIds.add(req.configurationFetchModel.id)
    const result = await emitSlot(slot, {
      hasFetch: hasConfigFetch(req.raw.configuration?.fetch),
      hasGatherConfig: false,
      fetchedRefDataIds,
      scope: configScope,
      spec,
      templates,
      label
    })
    write(bundle, uiComponentPath(spec.project.id, req.group, name), result)
    binding.configureComponent = { name, importPath: uiComponentImport(req.group, name) }
  }

  collector.requirements.push(binding)
}

// =============================================================================
// Helpers
// =============================================================================

function write (bundle: OutputBundle, path: string, result: { source: string, preserveIfExists: boolean }): void {
  if (result.preserveIfExists) bundle.setOnce(path, result.source)
  else bundle.set(path, result.source)
}
