import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	const { dir: pluginPath } = await runInRepo({
		...options,
		repo: 'sveltejs/vite-plugin-svelte',
		branch: options.viteMajor === 4 ? 'vite-4' : 'main',
		overrides: {
			svelte: 'latest'
		},
		build: 'build',
		test: 'echo skipping vite-plugin-svelte tests, just building for kit tests'
	})

	await runInRepo({
		...options,
		repo: 'sveltejs/kit',
		branch: options.viteMajor === 4 ? 'vite-4' : 'master',
		overrides: {
			svelte: 'latest',
			'@sveltejs/vite-plugin-svelte': `${pluginPath}/packages/vite-plugin-svelte`,
		},
		beforeTest: 'pnpm playwright install',
		test: ['lint', 'check', 'test']
	})
}
