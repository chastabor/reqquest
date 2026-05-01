import { type LogicalThinkingApplicantPromptData } from '../models/software-development.models.js'
import { fileHandler } from 'fastify-txstate'

export async function logicalThinkingApplicantPromptPreProcessData(
  data: LogicalThinkingApplicantPromptData,
  ctx: any,
  appRequest: any,
  appRequestData: any,
  allPeriodConfig: any,
  db: any
): Promise<LogicalThinkingApplicantPromptData> {
  if (data.documentation) {
    for await (const file of ctx.files()) {
      const { checksum } = await fileHandler.put(file.stream)
      data.documentation.shasum = checksum
      break
    }
  }
  return data
}
