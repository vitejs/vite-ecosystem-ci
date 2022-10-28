import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	const { dir: pluginPath } = await runInRepo({
		...options,
		repo: 'sveltejs/vite-plugin-svelte',
		branch: 'main',
		overrides: {
			svelte: 'latest'
		},
		build: 'build',
		beforeTest: 'pnpm playwright install chromium',
		test: ['lint','test']
	})

	await runInRepo({
		...options,
		repo: 'sveltejs/kit',
		branch: 'master',
		overrides: {
			svelte: 'latest',
			'@sveltejs/vite-plugin-svelte': `${pluginPath}/packages/vite-plugin-svelte`
		},
		build: 'build',
		beforeTest: 'pnpm playwright install',
		test: ['lint','check','test']
	})
}
