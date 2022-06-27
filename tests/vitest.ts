import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'vitest-dev/vitest',
		branch: 'feat/vite-3',
		build: 'build',
		test: 'test:run --allowOnly'
	})
}
