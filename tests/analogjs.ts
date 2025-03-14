import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'analogjs/analog',
		branch: 'beta',
		build: 'build:vite-ci',
		test: 'test:vite-ci',
	})
}
