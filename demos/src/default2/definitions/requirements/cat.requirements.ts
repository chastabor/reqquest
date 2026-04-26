import { otherCatsApplicantReqResolve, otherCatsReviewerReqResolve } from '../logic/cat.logic.js'
import { RequirementStatus, RequirementType, type RequirementDefinition } from '@reqquest/api'

export const haveACatTowerReq: RequirementDefinition = {
  type: RequirementType.QUALIFICATION,
  key: 'have_a_cat_tower_req',
  title: 'Applicant must own a cat tower',
  navTitle: 'Cat Tower',
  description: 'Applicants must own a cat tower or be willing to purchase one upon adoption.',
  promptKeys: ['have_a_cat_tower_prompt'],
  resolve: (data, config, configLookup) => {
    if (data.have_a_cat_tower_prompt?.haveCatTower == null)
      return { status: RequirementStatus.PENDING }
    if (data.have_a_cat_tower_prompt?.haveCatTower) return { status: RequirementStatus.MET }
    if (data.have_a_cat_tower_prompt?.willPurchaseCatTower == null)
      return { status: RequirementStatus.PENDING }
    if (data.have_a_cat_tower_prompt?.willPurchaseCatTower) return { status: RequirementStatus.MET }
    return {
      status: RequirementStatus.DISQUALIFYING,
      reason: 'Must own a cat tower or be willing to purchase one.'
    }
  }
}

export const notAllergicToTunaReq: RequirementDefinition = {
  type: RequirementType.QUALIFICATION,
  key: 'not_allergic_to_tuna_req',
  title: 'Applicant must not be allergic to tuna',
  navTitle: 'Not Allergic to Tuna',
  description: 'Applicants must not be allergic to the smell of tuna.',
  promptKeys: ['not_allergic_to_tuna_prompt'],
  resolve: (data, config, configLookup) => {
    if (data.not_allergic_to_tuna_prompt?.allergicToTuna == null)
      return { status: RequirementStatus.PENDING }
    if (data.not_allergic_to_tuna_prompt?.allergicToTuna)
      return { status: RequirementStatus.DISQUALIFYING, reason: 'Must not be allergic to tuna.' }
    return { status: RequirementStatus.MET }
  }
}

export const applicantSeemsNiceReq: RequirementDefinition = {
  type: RequirementType.APPROVAL,
  key: 'applicant_seems_nice_req',
  title: 'Applicant seems nice',
  navTitle: 'Seems Nice',
  description: "Applicant has to seem nice if we're going to let them have a pet.",
  promptKeys: ['applicant_seems_nice_prompt'],
  resolve: (data, config, configLookup) => {
    if (data.applicant_seems_nice_prompt?.seemsNice == null)
      return { status: RequirementStatus.PENDING }
    if (data.applicant_seems_nice_prompt?.seemsNice) return { status: RequirementStatus.MET }
    return { status: RequirementStatus.DISQUALIFYING, reason: 'Applicant looks kinda mean.' }
  }
}

export const otherCatsApplicantReq: RequirementDefinition = {
  type: RequirementType.QUALIFICATION,
  key: 'other_cats_applicant_req',
  title: 'Other Cats Requirement',
  description: 'If applicant has other cats, they must be vaccinated.',
  promptKeys: ['other_cats_prompt', 'other_cats_vaccines_prompt'],
  resolve: otherCatsApplicantReqResolve
}

export const otherCatsReviewerReq: RequirementDefinition = {
  type: RequirementType.APPROVAL,
  key: 'other_cats_reviewer_req',
  title: 'Other Cats Reviewer Requirement',
  description: 'Reviewer must assess the vaccination records provided by the applicant.',
  promptKeys: ['other_cats_prompt', 'vaccine_review_prompt'],
  resolve: otherCatsReviewerReqResolve
}
