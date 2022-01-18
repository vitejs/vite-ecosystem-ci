import { runInRepo } from '../utils.js'

export async function test({ workspace, verify = true, skipGit }) {
	const { dir: pluginPath } = await runInRepo({
		repo: 'sveltejs/vite-plugin-svelte',
		build: 'build:ci',
		test: 'test:ci',
		verify,
		workspace,
		skipGit
	})

	await runInRepo({
		repo: 'sveltejs/kit',
		branch: 'master',
		overrides: {
			'@sveltejs/vite-plugin-svelte': `${pluginPath}/packages/vite-plugin-svelte`
		},
		build:
			'build --filter ./packages --filter !./packages/create-svelte/templates',
		test: 'test',
		verify,
		workspace,
		skipGit
	})
}
