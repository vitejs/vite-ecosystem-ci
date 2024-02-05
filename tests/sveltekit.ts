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
		},
		beforeTest: 'pnpm playwright install',
		test: ['lint', 'check', 'test:vite-ecosystem-ci'], // TODO do we want another set of tests for svelte?
	})
}
