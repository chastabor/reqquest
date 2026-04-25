// Consecutive caps stay glued unless followed by a lowercase letter:
//   stateResidencePrompt → state_residence_prompt
//   IDValuesPrompt       → id_values_prompt
//   adoptADogProgram     → adopt_a_dog_program
//   petowner             → petowner
export function toSnakeCase (id: string): string {
  return id
    .replace(/([a-z\d])([A-Z])/g, '$1_$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .toLowerCase()
}

export interface ModelSymbols {
  schemaConst: string         // <ModelId>Schema
  dataType: string            // <ModelId>Data
}

export function modelSymbols (modelId: string): ModelSymbols {
  return {
    schemaConst: `${modelId}Schema`,
    dataType: `${modelId}Data`
  }
}

// All paths are repo-root-relative POSIX strings; the writer joins them
// with the configured repo root.
export function modelFilePath (projectId: string, group: string): string {
  return `demos/src/${projectId}/definitions/models/${group}.models.ts`
}

export function promptFilePath (projectId: string, group: string): string {
  return `demos/src/${projectId}/definitions/prompts/${group}.prompts.ts`
}

export function requirementFilePath (projectId: string, group: string): string {
  return `demos/src/${projectId}/definitions/requirements/${group}.requirements.ts`
}

export function logicFilePath (projectId: string, group: string): string {
  return `demos/src/${projectId}/definitions/logic/${group}.logic.ts`
}

export function programsFilePath (projectId: string): string {
  return `demos/src/${projectId}/definitions/programs.ts`
}

export function bootstrapFilePath (projectId: string): string {
  return `demos/src/${projectId}/index.ts`
}

export function uiComponentDir (projectId: string, group: string): string {
  return `ui/src/local/${projectId}/${group}`
}

export function uiComponentPath (projectId: string, group: string, name: string): string {
  return `${uiComponentDir(projectId, group)}/${name}.svelte`
}

/** Module specifier for importing a per-group component from `uiRegistry.ts`. */
export function uiComponentImport (group: string, name: string): string {
  return `./${group}/${name}.svelte`
}

export function uiRegistryFilePath (projectId: string): string {
  return `ui/src/local/${projectId}/uiRegistry.ts`
}

export function indexBarrelFilePath (folder: string): string {
  return `${folder}/index.ts`
}
