import { chmod, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { verify, CHECK_NAMES } from '../../src/verify/index.js'

let tmp: string
beforeEach(async () => { tmp = await mkdtemp(join(tmpdir(), 'rq-verify-')) })
afterEach(async () => { await rm(tmp, { recursive: true, force: true }) })

async function makeBin (cwd: string, name: string, body: string): Promise<void> {
  const bin = join(cwd, 'node_modules', '.bin', name)
  await mkdir(join(cwd, 'node_modules', '.bin'), { recursive: true })
  await writeFile(bin, `#!/usr/bin/env node\n${body}\n`, 'utf8')
  await chmod(bin, 0o755)
}

describe('verify', () => {
  it('marks tools as skipped when their binaries are missing', async () => {
    await mkdir(join(tmp, 'demos'), { recursive: true })
    await mkdir(join(tmp, 'ui'), { recursive: true })
    const result = await verify({ outRoot: tmp })
    const tsc = result.checks.find(c => c.name === CHECK_NAMES.tsc)!
    const sc = result.checks.find(c => c.name === CHECK_NAMES.svelteCheck)!
    expect(tsc.skipped).toBe(true)
    expect(tsc.output).toMatch(/binary not found/)
    expect(sc.skipped).toBe(true)
    expect(result.passed).toBe(true)                                        // skipped tools don't fail the run
  })

  it('reports a passing tool with combined output', async () => {
    await makeBin(join(tmp, 'demos'), 'tsc', "process.stdout.write('all good\\n'); process.exit(0)")
    await makeBin(join(tmp, 'ui'), 'svelte-check', "process.stdout.write('ui ok\\n'); process.exit(0)")
    const result = await verify({ outRoot: tmp })
    const tsc = result.checks.find(c => c.name === CHECK_NAMES.tsc)!
    expect(tsc.passed).toBe(true)
    expect(tsc.skipped).toBe(false)
    expect(tsc.output).toContain('all good')
    expect(result.passed).toBe(true)
  })

  it('reports a failing tool with non-zero exit', async () => {
    await makeBin(join(tmp, 'demos'), 'tsc',
      "process.stderr.write('error TS2345\\n'); process.exit(2)")
    await makeBin(join(tmp, 'ui'), 'svelte-check', 'process.exit(0)')
    const result = await verify({ outRoot: tmp })
    const tsc = result.checks.find(c => c.name === CHECK_NAMES.tsc)!
    expect(tsc.passed).toBe(false)
    expect(tsc.skipped).toBe(false)
    expect(tsc.output).toContain('error TS2345')
    expect(result.passed).toBe(false)
  })

  it('runs both checks in parallel', async () => {
    await makeBin(join(tmp, 'demos'), 'tsc',
      "setTimeout(() => process.exit(0), 200)")
    await makeBin(join(tmp, 'ui'), 'svelte-check',
      "setTimeout(() => process.exit(0), 200)")
    const start = Date.now()
    await verify({ outRoot: tmp })
    const elapsed = Date.now() - start
    expect(elapsed).toBeLessThan(600)                                       // ~200ms each in parallel; generous bound for slow CI
  })
})
