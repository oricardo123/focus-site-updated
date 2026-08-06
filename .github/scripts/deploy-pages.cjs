const SUCCESS_STATUSES = new Set([
  'deployed',
  'deployment_success',
  'succeed',
  'success',
])

const FAILURE_STATUSES = new Set([
  'canceled',
  'cancelled',
  'deployment_canceled',
  'deployment_failed',
  'errored',
  'failed',
  'failure',
])

const POLL_INTERVAL_MS = 5_000
const DEPLOYMENT_TIMEOUT_MS = 30 * 60 * 1_000

module.exports = async ({ github, context, core }) => {
  const { owner, repo } = context.repo
  const artifactId = Number(process.env.ARTIFACT_ID)

  if (!Number.isSafeInteger(artifactId)) {
    throw new Error(`Invalid Pages artifact ID: ${process.env.ARTIFACT_ID}`)
  }

  const oidcToken = await core.getIDToken()
  const deployment = await github.request(
    'POST /repos/{owner}/{repo}/pages/deployments',
    {
      owner,
      repo,
      artifact_id: artifactId,
      pages_build_version: context.sha,
      oidc_token: oidcToken,
    },
  )

  const pageUrl =
    deployment.data.page_url || `https://${owner}.github.io/${repo}/`
  core.setOutput('page_url', pageUrl)
  core.info(`Created Pages deployment for ${context.sha}`)

  const deadline = Date.now() + DEPLOYMENT_TIMEOUT_MS

  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))

    const response = await github.request(
      'GET /repos/{owner}/{repo}/pages/deployments/{pages_deployment_id}',
      {
        owner,
        repo,
        pages_deployment_id: context.sha,
      },
    )
    const status = response.data.status
    core.info(`Current Pages status: ${status}`)

    if (SUCCESS_STATUSES.has(status)) {
      core.info(`GitHub Pages deployed successfully: ${pageUrl}`)
      return
    }

    if (FAILURE_STATUSES.has(status)) {
      throw new Error(`GitHub Pages deployment ended with status: ${status}`)
    }
  }

  throw new Error(
    'GitHub Pages did not finish within 30 minutes; the deployment was left active.',
  )
}
