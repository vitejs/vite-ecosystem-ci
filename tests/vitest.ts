import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'vitest-dev/vitest',
		branch: options.viteMajor === 4 ? 'vite-4' : 'main',
		build: 'build',
		test: 'test:run --allowOnly',
	})
}
