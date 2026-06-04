import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'huntabyte/bits-ui',
		build: 'pnpm build',
		beforeTest: 'pnpm exec playwright install chromium',
		test: 'pnpm test:browser:chromium',
		overrides: {
			'@sveltejs/vite-plugin-svelte': false, // bits-ui uses older Vite version which our newest v-p-s isn't compabitle with
			'@sveltejs/vite-plugin-svelte-inspector': false,
			'@sveltejs/kit': true,
			'@sveltejs/load-config': true,
			'svelte-check': true,
		},
	})
}
