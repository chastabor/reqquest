import { type RecommendationLetterApplicantPromptData } from '../models/common.models.js'
import { fileHandler } from 'fastify-txstate'

export async function recommendationLetterApplicantPromptPreProcessData(
  data: RecommendationLetterApplicantPromptData,
  ctx: any,
  appRequest: any,
  appRequestData: any,
  allPeriodConfig: any,
  db: any
): Promise<RecommendationLetterApplicantPromptData> {
  if (data.letter) {
    for await (const file of ctx.files()) {
      const { checksum } = await fileHandler.put(file.stream)
      data.letter.shasum = checksum
      break
    }
  }
  return data
}
