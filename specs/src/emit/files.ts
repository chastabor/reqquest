import { mkdir, stat, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

/**
 * Virtual-fs accumulator. Each emit phase calls `set()` with a
 * repo-root-relative path; `flush()` writes everything in one pass.
 *
 * `setOnce()` marks a file as hand-authored — flush skips it if anything
 * already exists at that path on disk. Used for Shape D escape-hatch
 * Svelte stubs.
 */
export class OutputBundle {
  private readonly files = new Map<string, string>()
  private readonly preserveIfExists = new Set<string>()

  set (path: string, contents: string): void {
    this.files.set(path, contents)
  }

  setOnce (path: string, contents: string): void {
    this.files.set(path, contents)
    this.preserveIfExists.add(path)
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
      if (this.preserveIfExists.has(path) && await fileExists(fullPath)) continue
      await mkdir(dirname(fullPath), { recursive: true })
      await writeFile(fullPath, contents, 'utf8')
    }
  }
}

async function fileExists (path: string): Promise<boolean> {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}
