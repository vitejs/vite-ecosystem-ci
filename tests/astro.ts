import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'withastro/astro',
		branch: 'main',
		build: 'build:ci',
		test: 'test:vite-ci',
	})
}

export const rolldownViteExpectedFailureReason = `
needs to be updated on astro side (manualChunks)
`
