import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	const { dir: pluginPath } = await runInRepo({
		...options,
		repo: 'sveltejs/vite-plugin-svelte',
		branch: 'main',
		build: 'build:ci',
		test: 'test'
	})

	await runInRepo({
		...options,
		repo: 'sveltejs/kit',
		branch: 'master',
		overrides: {
			'@sveltejs/vite-plugin-svelte': `${pluginPath}/packages/vite-plugin-svelte`
		},
		build: 'build',
		beforeTest: 'pnpm playwright install',
		test: 'test'
	})
}
