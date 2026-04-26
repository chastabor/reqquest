import {
  type IDValuesExtraDataPromptData,
  type IDValuesPromptData,
  type SSNValuePromptData
} from '../models/step.models.js'
import { RequirementStatus } from '@reqquest/api'

export function idTypeReqResolve(
  data: any,
  config: any,
  configLookup: any
): {
  status: RequirementStatus.PENDING | RequirementStatus.MET | RequirementStatus.DISQUALIFYING
  reason?: string
} {
  const idValues = data.id_values_prompt as IDValuesPromptData | undefined
  const idValuesExtra = data.id_values_extra_data_prompt as IDValuesExtraDataPromptData | undefined
  const ssnValue = data.ssn_value_prompt as SSNValuePromptData | undefined
  if (idValues?.type == null) return { status: RequirementStatus.PENDING }
  if (idValues?.dodidValue == null && idValues?.ssnValue == null) return { status: RequirementStatus.PENDING }
  if (idValues?.dodidValue != null && idValues?.ssnValue == null && ssnValue?.value == null) return { status: RequirementStatus.PENDING }
  if (idValues?.ssnValue == null && idValuesExtra?.allow == null) return { status: RequirementStatus.PENDING }
  if (idValues?.ssnValue != null || ssnValue?.value != null) {
    if (idValuesExtra?.allow == null) return { status: RequirementStatus.PENDING }
    if (idValuesExtra?.allow === true) return { status: RequirementStatus.MET }
  }
  return { status: RequirementStatus.DISQUALIFYING, reason: 'Not allowed.' }
}
