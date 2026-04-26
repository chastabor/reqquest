import {
  type OtherCatsPromptData,
  type OtherCatsVaccinesPromptData,
  type VaccineReviewPromptData
} from '../models/cat.models.js'
import { RequirementStatus } from '@reqquest/api'
import { createHash } from 'node:crypto'

export async function otherCatsVaccinesPromptPreProcessData(
  data: OtherCatsVaccinesPromptData,
  ctx: any,
  appRequest: any,
  appRequestData: any,
  allPeriodConfig: any,
  db: any
): Promise<OtherCatsVaccinesPromptData> {
  const shasums: string[] = []
  for await (const file of ctx.files()) {
    const hash = createHash('sha256')
    for await (const chunk of file.stream) {
      hash.update(chunk)
    }
    shasums[file.multipartIndex] = hash.digest('hex')
  }
  if (data.distemperDoc) data.distemperDoc.shasum = shasums[data.distemperDoc.multipartIndex]
  if (data.rabiesDoc) data.rabiesDoc.shasum = shasums[data.rabiesDoc.multipartIndex]
  if (data.felineLeukemiaDoc) data.felineLeukemiaDoc.shasum = shasums[data.felineLeukemiaDoc.multipartIndex]
  if (data.felineHIVDoc) data.felineHIVDoc.shasum = shasums[data.felineHIVDoc.multipartIndex]
  return data
}

export function otherCatsApplicantReqResolve(
  data: any,
  config: any,
  configLookup: any
): {
  status: RequirementStatus.PENDING | RequirementStatus.MET | RequirementStatus.NOT_APPLICABLE
  reason?: string
} {
  const otherCats = data.other_cats_prompt as OtherCatsPromptData | undefined
  if (otherCats?.hasOtherCats == null) return { status: RequirementStatus.PENDING, reason: 'Applicant must indicate whether they have other cats.' }
  if (!otherCats.hasOtherCats) return { status: RequirementStatus.NOT_APPLICABLE }
  const vaccines = data.other_cats_vaccines_prompt as OtherCatsVaccinesPromptData | undefined
  if (vaccines?.distemperDoc && vaccines?.rabiesDoc && vaccines?.felineLeukemiaDoc && vaccines?.felineHIVDoc) {
    return { status: RequirementStatus.MET }
  }
  return { status: RequirementStatus.PENDING, reason: 'Applicant must provide vaccination records for their other cats.' }
}

export function otherCatsReviewerReqResolve(
  data: any,
  config: any,
  configLookup: any
): {
  status:
    | RequirementStatus.PENDING
    | RequirementStatus.MET
    | RequirementStatus.DISQUALIFYING
    | RequirementStatus.NOT_APPLICABLE
  reason?: string
} {
  const otherCats = data.other_cats_prompt as OtherCatsPromptData | undefined
  if (otherCats?.hasOtherCats === false) return { status: RequirementStatus.NOT_APPLICABLE }
  const review = data.vaccine_review_prompt as VaccineReviewPromptData | undefined
  if (!review) return { status: RequirementStatus.PENDING, reason: 'Reviewer must assess all vaccine records.' }
  const keys: (keyof VaccineReviewPromptData)[] = ['distemper', 'rabies', 'felineLeukemia', 'felineHIV']
  for (const key of keys) {
    if (!review[key]) return { status: RequirementStatus.PENDING, reason: 'Reviewer is still assessing vaccine records.' }
    if (!review[key]!.satisfactory) return { status: RequirementStatus.DISQUALIFYING, reason: `The ${key} vaccine record is unsatisfactory.` }
  }
  return { status: RequirementStatus.MET }
}
