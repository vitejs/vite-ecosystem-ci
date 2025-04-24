import { runInRepo } from '../utils.ts'
import { RunOptions } from '../types.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'sveltejs/kit',
		branch: 'main',
		overrides: {
			'@sveltejs/vite-plugin-svelte': true,
			'@sveltejs/vite-plugin-svelte-inspector': true,
			'svelte-check': true,
		},
		beforeTest: 'pnpm playwright install',
		test: ['test:vite-ecosystem-ci', 'lint', 'check'], // TODO do we want another set of tests for svelte?
	})
}
