import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'vitest-dev/vitest',
		build: 'build',
		test: ['test:ecosystem-ci', 'test:examples'],
		beforeTest: 'pnpm playwright install chromium',
	})
}
