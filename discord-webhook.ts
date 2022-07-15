import fetch from 'node-fetch'

type RefType = 'branch' | 'tag' | 'commit' | 'release'
type Status = 'success' | 'failure' | 'cancelled'
type Env = {
	WORKFLOW_NAME?: string
	REF_TYPE?: RefType
	REF?: string
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

	const env = process.env as Env

	assertEnv('REF_TYPE', env.REF_TYPE)
	assertEnv('REF', env.REF)
	assertEnv('SUITE', env.SUITE)
	assertEnv('NODE_VERSION', env.NODE_VERSION)
	assertEnv('DENO_VERSION', env.DENO_VERSION)
	assertEnv('STATUS', env.STATUS)
	assertEnv('DISCORD_WEBHOOK_URL', env.DISCORD_WEBHOOK_URL)

	const webhookContent = {
		username: 'vite-ecosystem-ci',
		avatar_url: 'https://github.com/vitejs.png',
		embeds: [
			{
				title: 'CI Run Result',
				description: createDescription(env.REF_TYPE, env.REF),
				url: createRunUrl(),
				color: statusConfig[env.STATUS].color,
				fields: [
					{
						name: ':dart: Suite',
						value: env.SUITE
					},
					{
						name: ':bar_chart: Status',
						value: statusConfig[env.STATUS].text
					},
					{
						name: ':wrench: Node.js Version',
						value: env.NODE_VERSION
					},
					{
						name: ':hammer: Deno Version',
						value: env.DENO_VERSION
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

function createDescription(refType: string, ref: string) {
	return (
		`Ran with Vite ${refType} = ${ref}\n` +
		`Show commit log: https://github.com/vitejs/vite/commits/${ref}`
	)
}

function createRunUrl() {
	return `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}?check_suite_focus=true`
}

run().catch((e) => {
	console.error('Error sending webhook:', e)
})
