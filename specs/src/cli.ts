#!/usr/bin/env node
import { resolve } from 'node:path'
import { parseSpec } from './spec/parse.js'
import { resolveSpec } from './ir/resolve.js'
import { validateSpec } from './validate/index.js'

interface Args {
  specPath: string
  repoRoot: string
}

function parseArgs (argv: string[]): Args {
  const args = argv.slice(2)
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    process.stdout.write(
      'usage: reqquest-gen <spec-path> [--repo-root <path>]\n' +
      '  <spec-path>   path to a YAML spec, e.g. specs/requirements/demo-default2.spec.yml\n' +
      '  --repo-root   repository root for resolving fixture paths and emit targets (default: cwd)\n'
    )
    process.exit(args.length === 0 ? 1 : 0)
  }
  const specPath = resolve(args[0]!)
  let repoRoot = process.cwd()
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--repo-root') {
      repoRoot = resolve(args[++i]!)
    } else {
      throw new Error(`unknown arg: ${args[i]}`)
    }
  }
  return { specPath, repoRoot }
}

async function main () {
  const { specPath, repoRoot } = parseArgs(process.argv)
  const spec = await parseSpec(specPath)
  const resolved = await resolveSpec(spec, { repoRoot, specPath })
  validateSpec(resolved)
  process.stdout.write(`parsed ${specPath}: project=${resolved.project.id}, ` +
    `${resolved.models.length} models, ${resolved.prompts.length} prompts, ` +
    `${resolved.requirements.length} requirements, ${resolved.programs.length} programs\n`)
}

main().catch(err => {
  process.stderr.write(`${err.message ?? err}\n`)
  process.exit(1)
})
