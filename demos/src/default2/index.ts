import { RQServer } from '@reqquest/api'
import * as programs from './definitions/programs.js'
import * as requirements from './definitions/requirements/index.js'
import * as prompts from './definitions/prompts/index.js'

// Test-user mapping: login prefix → groups. Quick setup for development;
// replace with a real auth source for production.
const userTypes: Record<string, { groups: string[] }> = {
  su: { groups: ['sudoers'] },
  admin: { groups: ['administrators'] },
  reviewer: { groups: ['reviewers'] },
  applicant: { groups: ['applicants'] }
}
const userTypePrefixes = Object.keys(userTypes)

async function main() {
  const server = new RQServer()
  await server.start({
    appConfig: {
      multipleRequestsPerPeriod: false,
      userLookups: {
        // TODO: replace with a real auth source for production.
        byLogins: async logins =>
          logins
            .filter(login => userTypePrefixes.some(p => login.startsWith(p)))
            .map(login => {
              const prefix = userTypePrefixes.find(p => login.startsWith(p))!
              return { login, fullname: `${login} Full Name`, groups: userTypes[prefix].groups }
            })
      }
    },
    programs: Object.values(programs),
    requirements: Object.values(requirements),
    prompts: Object.values(prompts)
  })
}

main().catch(err => {
  process.stderr.write(`${err.message ?? err}\n`)
  process.exit(1)
})
