import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'sveltejs/kit',
		branch: 'main',
		overrides: {
			svelte: 'latest',
			'@sveltejs/vite-plugin-svelte': true,
			'@sveltejs/vite-plugin-svelte-inspector': true,
		},
		beforeTest: 'pnpm playwright install chromium',
		test: [
			'test:vite-ecosystem-ci',
			'pnpm --dir packages/kit check', // only run checks for kit package, not the whole repo
		],
	})
}

export const rolldownViteExpectedFailureReason = `
needs to be updated on sveltekit side
`
