import type { ResolvedSpec } from '../ir/types.js'

type Logger = (msg: string) => void

export function validateInvariants (spec: ResolvedSpec, log: Logger): void {
  checkApiKeyCollisions(spec, log)
  checkWorkflowPhaseUsage(spec, log)
}

function checkApiKeyCollisions (spec: ResolvedSpec, log: Logger): void {
  const owners = new Map<string, string>()
  const claim = (apiKey: string, owner: string) => {
    const prior = owners.get(apiKey)
    if (prior) {
      log(`apiKey collision: "${apiKey}" claimed by both ${prior} and ${owner} (prompts and requirements share the auth-tag namespace)`)
    } else {
      owners.set(apiKey, owner)
    }
  }
  for (const p of spec.prompts) claim(p.apiKey, `prompts.${p.id}`)
  for (const r of spec.requirements) claim(r.apiKey, `requirements.${r.id}`)
}

function checkWorkflowPhaseUsage (spec: ResolvedSpec, log: Logger): void {
  for (const program of spec.programs) {
    for (const req of program.requirements) {
      if (req.raw.phase === 'WORKFLOW') {
        log(`programs.${program.id}.requirements: requirement "${req.id}" has phase WORKFLOW; ` +
          'WORKFLOW requirements may only appear under programs.<x>.workflow.<stage>.requirements')
      }
    }
  }
}
