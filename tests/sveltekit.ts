import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'sveltejs/kit',
		branch: 'version-2',
		overrides: {
			'@sveltejs/vite-plugin-svelte': true,
			'@sveltejs/vite-plugin-svelte-inspector': true,
		},
		beforeTest: 'pnpm playwright install',
		test: ['lint', 'check', 'test:vite-ecosystem-ci'], // TODO do we want another set of tests for svelte?
	})
}
