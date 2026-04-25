import { stat } from 'node:fs/promises'

/** Returns true when the path exists; treats any stat error as missing. */
export async function fileExists (path: string): Promise<boolean> {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}
