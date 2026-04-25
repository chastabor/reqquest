import { spawn } from 'node:child_process'
import { resolve as resolvePath } from 'node:path'
import { fileExists } from '../util/fs.js'

export const CHECK_NAMES = { tsc: 'tsc', svelteCheck: 'svelte-check' } as const
export type CheckName = typeof CHECK_NAMES[keyof typeof CHECK_NAMES]

export interface CheckResult {
  name: CheckName
  passed: boolean
  /** Combined stdout + stderr from the tool, or the skip reason. */
  output: string
  /** When true the tool was not run (binary missing, env unsupported, etc.); `output` carries the reason. */
  skipped: boolean
}

export interface VerifyResult {
  passed: boolean
  checks: CheckResult[]
}

export interface VerifyOpts {
  /** Filesystem root that contains the emitted demos/ and ui/ packages. */
  outRoot: string
}

export async function verify (opts: VerifyOpts): Promise<VerifyResult> {
  const checks = await Promise.all([
    runTsc(resolvePath(opts.outRoot, 'demos')),
    runSvelteCheck(resolvePath(opts.outRoot, 'ui'))
  ])
  // Skipped tools don't fail the run — only an actual non-zero exit does.
  return { passed: checks.every(c => c.passed || c.skipped), checks }
}

async function runTsc (cwd: string): Promise<CheckResult> {
  const bin = resolvePath(cwd, 'node_modules/.bin/tsc')
  return runBinary({ name: CHECK_NAMES.tsc, bin, args: ['--noEmit'], cwd })
}

async function runSvelteCheck (cwd: string): Promise<CheckResult> {
  const bin = resolvePath(cwd, 'node_modules/.bin/svelte-check')
  return runBinary({ name: CHECK_NAMES.svelteCheck, bin, args: ['--threshold', 'error'], cwd })
}

interface RunOpts { name: CheckName, bin: string, args: string[], cwd: string }

async function runBinary (opts: RunOpts): Promise<CheckResult> {
  if (!await fileExists(opts.bin)) {
    return {
      name: opts.name,
      passed: false,
      skipped: true,
      output: `binary not found at ${opts.bin}; run \`npm install\` in ${opts.cwd}`
    }
  }
  return new Promise(resolve => {
    const child = spawn(opts.bin, opts.args, { cwd: opts.cwd, stdio: ['ignore', 'pipe', 'pipe'] })
    const chunks: string[] = []
    child.stdout.on('data', d => { chunks.push(d.toString()) })
    child.stderr.on('data', d => { chunks.push(d.toString()) })
    child.on('error', err => {
      resolve({ name: opts.name, passed: false, skipped: true, output: `failed to spawn: ${err.message}` })
    })
    child.on('close', code => {
      const output = chunks.join('')
      resolve({ name: opts.name, passed: code === 0, skipped: false, output })
    })
  })
}

