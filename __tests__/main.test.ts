import { run } from '../src/main'
import * as core from '@actions/core'
import { Octokit } from '@octokit/rest'

// @actions/core と @octokit/rest のモック
jest.mock('@actions/core')
jest.mock('@octokit/rest', () => {
  return {
    Octokit: jest.fn().mockImplementation(() => {
      return {
        rest: {
          issues: {
            createComment: jest
              .fn()
              .mockResolvedValue({ data: { html_url: 'http://example.com' } })
          }
        }
      }
    })
  }
})

// GitHub context のモック
jest.mock('@actions/github', () => ({
  getOctokit: jest.fn().mockImplementation(() => ({
    rest: {
      issues: {
        createComment: jest
          .fn()
          .mockResolvedValue({ data: { html_url: 'http://example.com' } })
      }
    }
  })),
  context: {
    payload: {
      pull_request: {
        number: 1
      }
    },
    repo: {
      owner: 'owner',
      repo: 'repo'
    }
  }
}))

describe('run function', () => {
  it('should create a comment on a pull request', async () => {
    const mockGetInput = core.getInput as jest.MockedFunction<
      typeof core.getInput
    >
    mockGetInput.mockImplementation(name => {
      if (name === 'repo-token') return 'token'
      if (name === 'body') return 'Test body'
      return ''
    })

    await run()

    expect(Octokit).toHaveBeenCalledTimes(1)
    expect(core.setOutput).toHaveBeenCalledWith(
      'comment-url',
      'http://example.com'
    )
    // 他の期待される呼び出しや結果をここに追加
  })
})
