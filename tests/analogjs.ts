import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'analogjs/analog',
		branch: 'main',
		build: 'build:vite-ci',
		test: 'test:vite-ci',
	})
}
