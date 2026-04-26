import { haveAdequatePersonalSpaceReqResolve } from '../logic/yard.logic.js'
import { RequirementStatus, RequirementType, type RequirementDefinition } from '@reqquest/api'

export const haveBigYardReq: RequirementDefinition = {
  type: RequirementType.PREQUAL,
  key: 'have_big_yard_req',
  title: 'Have a big yard',
  navTitle: 'Big Yard',
  description: 'Applicants must have a yard that is at least 1000 square feet.',
  promptKeys: ['have_yard_prompt'],
  resolve: (data, config, configLookup) => {
    if (data.have_yard_prompt?.haveYard == null) return { status: RequirementStatus.PENDING }
    if (!data.have_yard_prompt?.haveYard)
      return { status: RequirementStatus.DISQUALIFYING, reason: 'Must have a yard to have a dog.' }
    if (data.have_yard_prompt?.squareFootage == null) return { status: RequirementStatus.PENDING }
    if (data.have_yard_prompt?.squareFootage >= 1000) return { status: RequirementStatus.MET }
    return {
      status: RequirementStatus.DISQUALIFYING,
      reason: 'Your yard is too small. It has to be at least 1000 square feet.'
    }
  }
}

export const haveAdequatePersonalSpaceReq: RequirementDefinition = {
  type: RequirementType.QUALIFICATION,
  key: 'have_adequate_personal_space_req',
  title: 'Have enough space per pet',
  navTitle: 'Yard Per Pet',
  description: 'Applicants must have at least 300 square feet of yard space per pet.',
  promptKeys: ['have_yard_prompt'],
  resolve: haveAdequatePersonalSpaceReqResolve
}
