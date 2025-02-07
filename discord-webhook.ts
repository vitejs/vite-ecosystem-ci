import fetch from 'node-fetch'
import { getPermanentRef, setupEnvironment } from './utils.ts'

type RefType = 'branch' | 'tag' | 'commit' | 'release'
type Status = 'success' | 'failure' | 'cancelled'
type Env = {
	WORKFLOW_NAME?: string
	REF_TYPE?: RefType
	REF?: string
	REPO?: string
	SUITE?: string
	STATUS?: Status
	DISCORD_WEBHOOK_URL?: string
}

const statusConfig = {
	success: {
		color: parseInt('57ab5a', 16),
		emoji: ':white_check_mark:',
	},
	failure: {
		color: parseInt('e5534b', 16),
		emoji: ':x:',
	},
	cancelled: {
		color: parseInt('768390', 16),
		emoji: ':stop_button:',
	},
}

async function run() {
	if (!process.env.GITHUB_ACTIONS) {
		throw new Error('This script can only run on GitHub Actions.')
	}
	if (!process.env.DISCORD_WEBHOOK_URL) {
		console.warn(
			"Skipped beacuse process.env.DISCORD_WEBHOOK_URL was empty or didn't exist",
		)
		return
	}
	if (!process.env.GITHUB_TOKEN) {
		console.warn(
			"Not using a token because process.env.GITHUB_TOKEN was empty or didn't exist",
		)
	}

	const env = process.env as Env

	assertEnv('WORKFLOW_NAME', env.WORKFLOW_NAME)
	assertEnv('REF_TYPE', env.REF_TYPE)
	assertEnv('REF', env.REF)
	assertEnv('REPO', env.REPO)
	assertEnv('SUITE', env.SUITE)
	assertEnv('STATUS', env.STATUS)
	assertEnv('DISCORD_WEBHOOK_URL', env.DISCORD_WEBHOOK_URL)

	await setupEnvironment()

	const refType = env.REF_TYPE
	// svelte repo is not cloned when release
	const permRef = refType === 'release' ? undefined : await getPermanentRef()

	const targetText = createTargetText(refType, env.REF, permRef, env.REPO)

	const webhookContent = {
		username: `svelte-ecosystem-ci (${env.WORKFLOW_NAME})`,
		avatar_url: 'https://github.com/sveltejs.png',
		embeds: [
			{
				title: `${statusConfig[env.STATUS].emoji}  ${env.SUITE}`,
				description: await createDescription(env.SUITE, targetText),
				color: statusConfig[env.STATUS].color,
			},
		],
	}

	const res = await fetch(env.DISCORD_WEBHOOK_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(webhookContent),
	})
	if (res.ok) {
		console.log('Sent Webhook')
	} else {
		console.error(`Webhook failed ${res.status}:`, await res.text())
	}
}

function assertEnv<T>(
	name: string,
	value: T,
): asserts value is Exclude<T, undefined> {
	if (!value) {
		throw new Error(`process.env.${name} is empty or does not exist.`)
	}
}

async function createRunUrl(suite: string) {
	const result = await fetchJobs()
	if (!result) {
		return undefined
	}

	if (result.total_count <= 0) {
		console.warn('total_count was 0')
		return undefined
	}

	const job = result.jobs.find((job) => job.name === process.env.GITHUB_JOB)
	if (job) {
		return job.html_url
	}

	// when matrix
	const jobM = result.jobs.find(
		(job) => job.name === `${process.env.GITHUB_JOB} (${suite})`,
	)
	return jobM?.html_url
}

interface GitHubActionsJob {
	name: string
	html_url: string
}

async function fetchJobs() {
	const url = `${process.env.GITHUB_API_URL}/repos/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}/jobs`
	const res = await fetch(url, {
		headers: {
			Accept: 'application/vnd.github.v3+json',
			...(process.env.GITHUB_TOKEN
				? {
						Authorization: `token ${process.env.GITHUB_TOKEN}`,
					}
				: undefined),
		},
	})
	if (!res.ok) {
		console.warn(
			`Failed to fetch jobs (${res.status} ${res.statusText}): ${res.text()}`,
		)
		return null
	}

	const result = await res.json()
	return result as {
		total_count: number
		jobs: GitHubActionsJob[]
	}
}

async function createDescription(suite: string, targetText: string) {
	const runUrl = await createRunUrl(suite)
	const open = runUrl === undefined ? 'Null' : `[Open](${runUrl})`

	return `
:scroll:\u00a0\u00a0${open}\u3000\u3000:zap:\u00a0\u00a0${targetText}
`.trim()
}

function createTargetText(
	refType: RefType,
	ref: string,
	permRef: string | undefined,
	repo: string,
) {
	const repoText = repo !== 'sveltejs/svelte' ? `${repo}:` : ''
	if (refType === 'branch') {
		const shortRef = permRef?.slice(0, 7)
		const link = `https://github.com/${repo}/commits/${permRef || ref}`
		return `[${repoText}${ref} (${shortRef || 'unknown'})](${link})`
	}

	const refTypeText = refType === 'release' ? ' (release)' : ''
	const link = `https://github.com/${repo}/commits/${ref}`
	return `[${repoText}${ref}${refTypeText}](${link})`
}

run().catch((e) => {
	console.error('Error sending webhook:', e)
})
