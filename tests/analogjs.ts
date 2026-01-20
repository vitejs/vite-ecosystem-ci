import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'analogjs/analog',
		branch: 'beta',
		build: 'build:vite-ci',
		beforeTest: 'pnpm playwright install chromium',
		test: 'test:vite-ci',
	})
}
