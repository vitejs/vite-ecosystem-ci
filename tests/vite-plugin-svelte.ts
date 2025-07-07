import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'sveltejs/vite-plugin-svelte',
		branch: 'main',
		beforeTest: 'pnpm playwright install chromium',
		test: ['check:lint', 'check:types', 'test'],
	})
}

export const rolldownViteExpectedFailureReason = `
needs to be updated on rolldown side (https://github.com/rolldown/rolldown/issues/3403)
`
