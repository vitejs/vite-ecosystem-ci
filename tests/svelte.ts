import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	const { dir: pluginPath } = await runInRepo({
		...options,
		repo: 'sveltejs/vite-plugin-svelte',
		branch: 'vite-4',
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
		branch: 'vite-4',
		overrides: {
			svelte: 'latest',
			'@sveltejs/vite-plugin-svelte': `${pluginPath}/packages/vite-plugin-svelte`,
			'@types/node':'^16.11.68' // override to kit's version to prevent ecosystem-ci override with vite version
		},
		beforeTest: 'pnpm playwright install',
		test: ['lint','check','test']
	})
}
