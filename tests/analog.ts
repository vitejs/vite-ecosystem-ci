import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'analogjs/analog',
		branch: 'vite-3-ci',
		build: 'build:vite-ci',
		test: 'test:vite-ci',
	})
}
