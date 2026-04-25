import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

/**
 * Virtual-fs accumulator. Each emit phase calls `set()` with a
 * repo-root-relative path; `flush()` writes everything in one pass.
 *
 * Phase 2 always overwrites. Phase 3+ will add `setOnce` for hand-authored
 * files that should never be clobbered.
 */
export class OutputBundle {
  private readonly files = new Map<string, string>()

  set (path: string, contents: string): void {
    this.files.set(path, contents)
  }

  has (path: string): boolean {
    return this.files.has(path)
  }

  get (path: string): string | undefined {
    return this.files.get(path)
  }

  paths (): string[] {
    return [...this.files.keys()].sort()
  }

  get size (): number {
    return this.files.size
  }

  async flush (rootDir: string): Promise<void> {
    for (const [path, contents] of this.files) {
      const fullPath = resolve(rootDir, path)
      await mkdir(dirname(fullPath), { recursive: true })
      await writeFile(fullPath, contents, 'utf8')
    }
  }
}
