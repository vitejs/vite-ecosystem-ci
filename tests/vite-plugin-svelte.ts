import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'sveltejs/vite-plugin-svelte',
		branch: 'svelte-4',
		beforeTest: 'pnpm playwright install chromium',
		test: ['check:lint', 'check:types', 'test'],
	})
}
