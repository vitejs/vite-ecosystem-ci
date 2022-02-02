import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	const { dir: pluginPath } = await runInRepo({
		...options,
		repo: 'sveltejs/vite-plugin-svelte',
		build: 'build:ci',
		test: 'test:ci'
	})

	await runInRepo({
		...options,
		repo: 'sveltejs/kit',
		branch: 'master',
		overrides: {
			'@sveltejs/vite-plugin-svelte': `${pluginPath}/packages/vite-plugin-svelte`
		},
		build:
			'build --filter ./packages --filter !./packages/create-svelte/templates',
		test: 'test'
	})
}
