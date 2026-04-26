import { type StateResidencePromptData } from '../models/residence.models.js'
import { fileHandler } from 'fastify-txstate'

export async function stateResidencePromptPreProcessData(
  data: StateResidencePromptData,
  ctx: any,
  appRequest: any,
  appRequestData: any,
  allPeriodConfig: any,
  db: any
): Promise<StateResidencePromptData> {
  if (data.residentIdDoc) {
    for await (const file of ctx.files()) {
      const { checksum } = await fileHandler.put(file.stream)
      data.residentIdDoc.shasum = checksum
      break
    }
  }
  return data
}
