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
			'@types/node': '^16.11.68' // override to kit's version to prevent ecosystem-ci override with vite-plugin-svelte version
		},
		beforeTest: 'pnpm playwright install',
		test: ['lint', 'check', 'test']
	})
}
