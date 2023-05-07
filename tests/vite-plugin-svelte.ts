import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'sveltejs/vite-plugin-svelte',
		branch: 'svelte-4',
		build: 'build',
		beforeTest: 'pnpm playwright install chromium',
		test: ['lint', 'test'],
	})
}
