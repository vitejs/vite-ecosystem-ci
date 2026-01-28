import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'BuilderIO/qwik',
		build: 'build.vite',
		beforeTest: 'pnpm playwright install chromium',
		test: 'test.vite',
	})
}

export const rolldownViteExpectedFailureReason = `
needs to be updated on qwik side (types)
`
