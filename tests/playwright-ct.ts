import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'microsoft/playwright',
		overrides: {
			'@vitejs/plugin-react': true,
			'@vitejs/plugin-vue': true,
			'@vitejs/plugin-vue2': true,
			svelte: 'latest',
			'@sveltejs/vite-plugin-svelte': true,
			'@sveltejs/vite-plugin-svelte-inspector': true,
		},
		build: 'build',
		beforeTest: 'npx playwright install --with-deps',
		test: ['ct'],
	})
}
