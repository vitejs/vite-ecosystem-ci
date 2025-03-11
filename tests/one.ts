import type { RunOptions } from '../types.d.ts'
import { runInRepo } from '../utils.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'onejs/one',
		branch: 'main',
		build: 'build',
		beforeTest: 'yarn playwright install chromium',
		test: 'test:vite-ecosystem-ci',
	})
}
