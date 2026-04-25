import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { OutputBundle } from '../files.js'

const TEMPLATE_SOURCE_DIR = 'specs/resources/ui-templates'

// Each referenced template is copied once into the project's local
// `_templates/`, keeping the generated project self-contained.
export class TemplateRegistry {
  private readonly seen = new Set<string>()

  constructor (
    private readonly projectId: string,
    private readonly bundle: OutputBundle,
    private readonly repoRoot: string
  ) {}

  /** Mark a template for copying and return its module specifier from a per-group component file. */
  async ensure (templateName: string): Promise<string> {
    const destPath = `ui/src/local/${this.projectId}/_templates/${templateName}.svelte`
    if (!this.seen.has(templateName)) {
      this.seen.add(templateName)
      const sourcePath = resolve(this.repoRoot, TEMPLATE_SOURCE_DIR, `${templateName}.svelte`)
      const contents = await readFile(sourcePath, 'utf8')
      this.bundle.set(destPath, contents)
    }
    return `../_templates/${templateName}.svelte`
  }
}
