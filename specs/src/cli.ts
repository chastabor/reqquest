#!/usr/bin/env node
import { resolve } from 'node:path'
import { parseSpec } from './spec/parse.js'
import { resolveSpec } from './ir/resolve.js'
import { validateSpec } from './validate/index.js'
import { buildEmitBundle } from './emit/index.js'

interface Args {
  specPath: string
  repoRoot: string
  outRoot: string
  emit: boolean
  dryRun: boolean
}

function parseArgs (argv: string[]): Args {
  const args = argv.slice(2)
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    process.stdout.write(
      'usage: reqquest-gen <spec-path> [--repo-root <path>] [--out <path>] [--emit] [--dry-run]\n' +
      '  <spec-path>   path to a YAML spec, e.g. specs/requirements/demo-default2.spec.yml\n' +
      '  --repo-root   repository root for resolving fixture paths (default: cwd)\n' +
      '  --out         where to write generated files (default: --repo-root)\n' +
      '  --emit        write generated files (off: parse + validate only)\n' +
      '  --dry-run     compute the bundle but list paths instead of writing\n'
    )
    process.exit(args.length === 0 ? 1 : 0)
  }
  const specPath = resolve(args[0]!)
  let repoRoot = process.cwd()
  let outRoot: string | null = null
  let emit = false
  let dryRun = false
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--repo-root') {
      repoRoot = resolve(args[++i]!)
    } else if (args[i] === '--out') {
      outRoot = resolve(args[++i]!)
    } else if (args[i] === '--emit') {
      emit = true
    } else if (args[i] === '--dry-run') {
      dryRun = true
    } else {
      throw new Error(`unknown arg: ${args[i]}`)
    }
  }
  return { specPath, repoRoot, outRoot: outRoot ?? repoRoot, emit, dryRun }
}

async function main () {
  const { specPath, repoRoot, outRoot, emit, dryRun } = parseArgs(process.argv)
  const spec = await parseSpec(specPath)
  const resolved = await resolveSpec(spec, { repoRoot, specPath })
  validateSpec(resolved)
  process.stdout.write(`parsed ${specPath}: project=${resolved.project.id}, ` +
    `${resolved.models.length} models, ${resolved.prompts.length} prompts, ` +
    `${resolved.requirements.length} requirements, ${resolved.programs.length} programs\n`)

  if (!emit && !dryRun) return
  const { bundle } = await buildEmitBundle(resolved, { repoRoot, outRoot })
  if (dryRun) {
    process.stdout.write(`would emit ${bundle.size} files:\n`)
    for (const path of bundle.paths()) process.stdout.write(`  ${path}\n`)
    return
  }
  await bundle.flush(outRoot)
  process.stdout.write(`emitted ${bundle.size} files under ${outRoot}\n`)
}

main().catch(err => {
  process.stderr.write(`${err.message ?? err}\n`)
  process.exit(1)
})
