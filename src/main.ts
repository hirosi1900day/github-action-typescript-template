import * as core from '@actions/core'
import * as github from '@actions/github'
import { Octokit } from '@octokit/rest'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const pr = github.context.payload.pull_request
    if (!pr) {
      throw new Error('This action is only valid on pull requests')
    }

    const auth: string = core.getInput('repo-token')
    const body: string = core.getInput('body')

    core.debug(`The body is: ${body}`)

    // const client = new github.Github({ auth: token })
    const owner = github.context.repo.owner
    const repo = github.context.repo.repo

    const octokit = new Octokit({
      // Personal Access Token を設定
      auth
    })

    const response = await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: pr.number, // Corrected from pr.number to issue_number: pr.number
      body // Corrected from message to body: message
    })

    core.setOutput('comment-url', response.data.html_url)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
