import fetch from 'node-fetch'

type RefType = 'branch' | 'tag' | 'commit' | 'release'
type Status = 'success' | 'failure' | 'cancelled'
type Env = {
	WORKFLOW_NAME?: string
	REF_TYPE?: RefType
	REF?: string
	PERM_REF?: string
	SUITE?: string
	NODE_VERSION?: string
	DENO_VERSION?: string
	STATUS?: Status
	DISCORD_WEBHOOK_URL?: string
}

const statusConfig = {
	success: {
		color: parseInt('57ab5a', 16),
		text: ':white_check_mark: Success'
	},
	failure: {
		color: parseInt('e5534b', 16),
		text: ':x: Failure'
	},
	cancelled: {
		color: parseInt('768390', 16),
		text: ':stop_button: Cancelled'
	}
}

async function run() {
	if (!process.env.GITHUB_ACTIONS) {
		throw new Error('This script can only run on GitHub Actions.')
	}
	if (!process.env.DISCORD_WEBHOOK_URL) {
		console.warn(
			"Skipped beacuse process.env.DISCORD_WEBHOOK_URL was empty or didn't exist"
		)
		return
	}

	const env = process.env as Env

	assertEnv('WORKFLOW_NAME', env.WORKFLOW_NAME)
	assertEnv('REF_TYPE', env.REF_TYPE)
	assertEnv('REF', env.REF)
	assertEnv('SUITE', env.SUITE)
	assertEnv('NODE_VERSION', env.NODE_VERSION)
	assertEnv('DENO_VERSION', env.DENO_VERSION)
	assertEnv('STATUS', env.STATUS)
	assertEnv('DISCORD_WEBHOOK_URL', env.DISCORD_WEBHOOK_URL)

	const runUrl = await createRunUrl()
	const webhookContent = {
		username: `vite-ecosystem-ci (${env.WORKFLOW_NAME})`,
		avatar_url: 'https://github.com/vitejs.png',
		embeds: [
			{
				color: statusConfig[env.STATUS].color,
				fields: [
					{
						name: ':dart: Suite',
						value: env.SUITE,
						inline: true
					},
					{
						name: ':bar_chart: Status',
						value: statusConfig[env.STATUS].text,
						inline: true
					},
					{
						name: 'Logs',
						value: `[Open](${runUrl})`,
						inline: true
					},
					{
						name: ':vite: Vite target',
						value: createTargetText(env.REF_TYPE, env.REF, env.PERM_REF),
						inline: true
					},
					{
						name: ':wrench: Node.js Version',
						value: env.NODE_VERSION,
						inline: true
					},
					{
						name: ':hammer: Deno Version',
						value: env.DENO_VERSION,
						inline: true
					}
				]
			}
		]
	}

	await fetch(env.DISCORD_WEBHOOK_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(webhookContent)
	})
	console.log('Sent Webhook')
}

function assertEnv<T>(
	name: string,
	value: T
): asserts value is Exclude<T, undefined> {
	if (!value) {
		throw new Error(`process.env.${name} is empty or does not exist.`)
	}
}

async function createRunUrl() {
	const result = await fetchJobs()
	return result.jobs.find((job) => job.name === process.env.GITHUB_JOB)
		?.html_url
}

interface GitHubActionsJob {
	name: string
	html_url: string
}

async function fetchJobs() {
	const url = `${process.env.GITHUB_API_URL}/repos/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}/jobs`
	const res = await fetch(url, {
		headers: {
			Accept: 'application/vnd.github.v3+json'
		}
	})
	const result = await res.json()
	return result as { jobs: GitHubActionsJob[] }
}

function createTargetText(
	refType: RefType,
	ref: string,
	permRef: string | undefined
) {
	if (refType === 'branch') {
		const link = `https://github.com/vitejs/vite/commits/${permRef || ref}`
		return `${refType}: [${ref} (${permRef || 'unknown'})](${link})`
	}

	const link = `https://github.com/vitejs/vite/commits/${ref}`
	return `${refType}: [${ref}](${link})`
}

run().catch((e) => {
	console.error('Error sending webhook:', e)
})
