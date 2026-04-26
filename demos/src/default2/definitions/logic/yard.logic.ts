import { type HaveYardPromptData } from '../models/yard.models.js'
import { RequirementStatus } from '@reqquest/api'

export function haveAdequatePersonalSpaceReqResolve(
  data: any,
  config: any,
  configLookup: any
): {
  status: RequirementStatus.PENDING | RequirementStatus.MET | RequirementStatus.DISQUALIFYING
  reason?: string
} {
  const yard = data.have_yard_prompt as HaveYardPromptData | undefined
  if (yard == null || yard.totalPets == null) return { status: RequirementStatus.PENDING }
  if (!yard.haveYard) return { status: RequirementStatus.DISQUALIFYING, reason: 'Must have a yard to have a dog.' }
  if (yard.squareFootage == null) return { status: RequirementStatus.PENDING }
  if (yard.totalPets <= 0) return { status: RequirementStatus.PENDING }
  return yard.squareFootage / yard.totalPets >= 300
    ? { status: RequirementStatus.MET }
    : { status: RequirementStatus.DISQUALIFYING, reason: 'Must have at least 300 square feet of personal space per pet.' }
}
