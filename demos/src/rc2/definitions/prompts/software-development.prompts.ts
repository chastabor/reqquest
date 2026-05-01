import { logicalThinkingApplicantPromptPreProcessData } from '../logic/software-development.logic.js'
import {
  CreativeProblemSolvingApplicantPromptSchema,
  CreativeProblemSolvingReviewerPromptSchema,
  InterestInBuildingApplicantPromptSchema,
  InterestInBuildingReviewerPromptSchema,
  LogicalThinkingApplicantPromptSchema,
  LogicalThinkingReviewerPromptSchema
} from '../models/software-development.models.js'
import type { PromptDefinition } from '@reqquest/api'
import { MutationMessageType, type MutationMessage } from '@txstate-mws/graphql-server'

export const logicalThinkingApplicantPrompt: PromptDefinition = {
  key: 'logical_thinking_applicant_prompt',
  title: 'Logical Thinking',
  description:
    "You're building a 'Seat Finder' for the dining hall. In plain English (or pseudocode), describe how you would sort a list of tables to show the user the ones that are both empty and closest to the entrance. Note: You may make up data to support your solution.\n",
  schema: LogicalThinkingApplicantPromptSchema,
  preProcessData: logicalThinkingApplicantPromptPreProcessData,
  preValidate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.documentation?.size != null && data.documentation.size > 10485760)
      messages.push({
        type: MutationMessageType.error,
        arg: 'documentation',
        message: 'This document is too large, please upload a file less than 10MB.'
      })
    return messages
  },
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.solution == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'solution',
        message: 'Please describe your solution to the problem.'
      })
    return messages
  }
}

export const logicalThinkingReviewerPrompt: PromptDefinition = {
  key: 'logical_thinking_reviewer_prompt',
  title: 'Acknowledgement of participation expectations',
  description:
    "Assess the applicant's solution. Applicant must be able to understand what data is needed to solve a request and structure it logically.\n",
  schema: LogicalThinkingReviewerPromptSchema,
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.scored == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'scored',
        message: 'Score the free text response.'
      })
    if (data.scored != null && ![1, 2, 3, 4, 5].includes(data.scored))
      messages.push({
        type: MutationMessageType.error,
        arg: 'scored',
        message: 'Score does not match rating range.'
      })
    return messages
  }
}

export const interestInBuildingApplicantPrompt: PromptDefinition = {
  key: 'interest_in_building_applicant_prompt',
  title: 'Interest In Building',
  description:
    'Apart from required class assignments, have you ever independently built, modified, or contributed to a software project (e.g., a personal website, a game, a script to automate a task, or a contribution to an Open Source project) and successfully resolved a technical bug or error that initially prevented it from working?\n',
  schema: InterestInBuildingApplicantPromptSchema,
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.isContributed == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'isContributed',
        message: 'Please choose an option.'
      })
    return messages
  }
}

export const interestInBuildingReviewerPrompt: PromptDefinition = {
  key: 'interest_in_building_reviewer_prompt',
  title: 'Review Interest In Building',
  description:
    'The applicant mus provide an example of participation in a software development project that was not for class credit.\n',
  schema: InterestInBuildingReviewerPromptSchema,
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.isInterested == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'isInterested',
        message: 'Please score applicant interest in building.'
      })
    if (data.explanation == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'explanation',
        message: 'Please explain your score.'
      })
    return messages
  }
}

export const creativeProblemSolvingApplicantPrompt: PromptDefinition = {
  key: 'creative_problem_solving_applicant_prompt',
  title: 'Creative Problem Solving',
  description:
    'What is one website or app you use for school that frustrates you? If you were the developer, what one feature would you add or change to make it easier for students to use?\n',
  schema: CreativeProblemSolvingApplicantPromptSchema,
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.issueAndSolution == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'issueAndSolution',
        message: 'Please fill in with solution.'
      })
    return messages
  }
}

export const creativeProblemSolvingReviewerPrompt: PromptDefinition = {
  key: 'creative_problem_solving_reviewer_prompt',
  title: 'Creative Problem Solving Review',
  description:
    'The applicant must be able to analyze shortcomings in current technologies and consider alternate solutions. Assess the validity of the reported issue and solution.\n',
  schema: CreativeProblemSolvingReviewerPromptSchema,
  validate: (data, config) => {
    const messages: MutationMessage[] = []
    if (data.isIssueReal == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'isIssueReal',
        message: 'Please choose an option.'
      })
    if (data.isSolutionFeasible == null)
      messages.push({
        type: MutationMessageType.error,
        arg: 'isSolutionFeasible',
        message: 'Please choose an option.'
      })
    return messages
  }
}
