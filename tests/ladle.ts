import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'tajo/ladle',
		branch: 'main',
		build: 'build',
		beforeTest: 'pnpm playwright install chromium',
		test: 'test',
	})
}

export const rolldownViteExpectedFailureReason = `
needs to be updated on ladle side (transformWithEsbuild)
`
